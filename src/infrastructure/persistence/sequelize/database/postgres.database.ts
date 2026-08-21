import { dirname, join } from 'path'
import { Client as PgClient } from 'pg'
import { Sequelize } from 'sequelize'
import { SequelizeStorage, Umzug } from 'umzug'
import { fileURLToPath } from 'url'
import { buildModels, makeAssociations } from '../associations'
import type { Logger } from '../../../../shared/logger'
import type { PostgresConfig, RetryOptions } from './postgres.type'
import { MatchRepositoryPg } from '../repository/match.repository.pg'

/** Politique de retry par défaut pour l'initialisation. */
const DEFAULT_RETRY: RetryOptions = { maxRetries: 10, delay: 3000 }

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url))

/** Configuration par défaut du pool de connexions Sequelize. */
const DEFAULT_POOL = { max: 10, min: 0, idle: 10000 }

/**
 * Construit la configuration PostgreSQL à partir des variables d'environnement,
 * avec possibilité de surcharger des valeurs via `overrides`.
 */
const buildConfigFromEnv = (overrides: Partial<PostgresConfig> = {}): PostgresConfig => ({
	dbName: process.env.PGDATABASE ?? 'hall-e-db-dev',
	user: process.env.PGUSER ?? 'postgres',
	pass: process.env.PGPASSWORD ?? 'root',
	host: process.env.PGHOST ?? 'localhost',
	port: Number(process.env.PGPORT ?? 5432),
	ssl: process.env.PGSSL === 'true' ? { require: true, rejectUnauthorized: false } : undefined,
	env: process.env.NODE_ENV ?? 'dev',
	...overrides,
})

/**
 * Échappe un identifiant SQL (nom de base, table, colonne) en doublant
 * les guillemets internes et en entourant le résultat de guillemets doubles.
 */
const quoteIdent = (name: string): string => `"${name.replace(/"/g, '""')}"`

/** Retourne une promesse résolue après `ms` millisecondes. */
const sleep = (ms: number): Promise<void> =>
	new Promise((r) => {
		setTimeout(r, ms)
	})

/**
 * Adaptateur PostgreSQL : encapsule la création de la base, l'initialisation
 * de Sequelize, le chargement des modèles/associations, et la stratégie de
 * migration (Umzug en prod, `sync({ alter: true })` en dev).
 */
export class PostgresDatabases {
	/** Instance Sequelize active, ou null si non initialisée. */
	#sequelize: Sequelize | null = null

	/** Modèles Sequelize construits par `buildModels`. */
	#models: ReturnType<typeof buildModels> | null = null

	/** Logger injecté au constructeur. */
	#log: Logger

	/** Configuration résolue (env + overrides). */
	config: PostgresConfig

	constructor(logger: Logger, config: Partial<PostgresConfig> = {}) {
		this.#log = logger
		this.config = buildConfigFromEnv(config)
	}

	// ===== Public API (port) =====

	/**
	 * Initialise la connexion à la base, avec une politique de retry.
	 * Orchestration : création de la base si absente → Sequelize → modèles → migrations/sync.
	 */
	async init(retry: RetryOptions = DEFAULT_RETRY): Promise<void> {
		await this.#withRetry(() => this.#connect(), { ...retry, label: 'DB connection' })
	}

	/**
	 * Vérifie que la connexion Sequelize est toujours active.
	 * No-op si la base n'a pas encore été initialisée.
	 */
	async health(): Promise<void> {
		if (this.#sequelize) await this.#sequelize.authenticate()
	}

	/** Ferme proprement la connexion Sequelize et remet l'état interne à zéro. */
	async close(): Promise<void> {
		if (!this.#sequelize) return
		await this.#sequelize.close()
		this.#sequelize = null
	}

	// ===== Orchestration =====

	/**
	 * Exécute la séquence complète d'initialisation de la base :
	 * 1. Création de la base si absente (dev uniquement).
	 * 2. Instanciation de Sequelize.
	 * 3. Construction des modèles et associations.
	 * 4. Migrations (prod) ou sync (dev).
	 *
	 * En production, l'étape 1 est volontairement sautée : la base est supposée
	 * déjà provisionnée à la main par un administrateur (principe de moindre
	 * privilège — l'utilisateur applicatif n'a pas besoin du droit CREATEDB).
	 */
		async #connect(): Promise<void> {
		try {
			if (this.config.env === 'production') {
				this.#log.info('Mode production : la base est supposée déjà créée, auto-création ignorée.')
			} else {
				await this.#ensureDatabaseExists()
			}
			this.#sequelize = await this.#createSequelize()
			this.#models = this.#buildModels(this.#sequelize)
			await this.#migrateOrSync(this.#sequelize)
		} catch (error) {
			await this.#safeClose()
			throw error
		}
	}

	/**
	 * Exécute `fn` avec retry : en cas d'échec, attend `delay` ms et retente,
	 * jusqu'à `maxRetries` tentatives. Le dernier échec est propagé.
	 */
	async #withRetry<T>(
		fn: () => Promise<T>,
		{ maxRetries, delay, label }: RetryOptions & { label: string },
	): Promise<T> {
		 
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				 
				return await fn()
			} catch (error) {
				const msg = error instanceof Error ? error.message : String(error)
				this.#log.warn(`${label} attempt ${attempt}/${maxRetries} failed: ${msg}`)
				if (attempt === maxRetries) throw error
				 
				await sleep(delay)
			}
		}
		throw new Error(`${label}: échec après ${maxRetries} tentatives`)
	}

	/**
	 * Ferme Sequelize sans lever d'erreur (best-effort) et remet l'état à zéro.
	 * Utilisé dans les chemins d'erreur pour éviter de masquer l'erreur d'origine.
	 */
	async #safeClose(): Promise<void> {
		if (!this.#sequelize) return
		await this.#sequelize.close().catch(() => {})
		this.#sequelize = null
	}

	// ===== Steps =====

	/**
	 * Vérifie que la base métier existe, et la crée si nécessaire.
	 * Utilise un client PostgreSQL admin connecté à la base système `postgres`.
	 *
	 * ⚠️ Utilisé uniquement hors production (voir `#connect`).
	 */
	async #ensureDatabaseExists(): Promise<void> {
		const { dbName } = this.config
		const client = this.#createAdminClient()

		await client.connect()
		try {
			const exists = await this.#databaseExists(client, dbName)
			if (exists) return

			this.#log.info(`Création de la base ${dbName}…`)
			await client.query(`CREATE DATABASE ${quoteIdent(dbName)}`)
		} finally {
			await client.end()
		}
	}

	/**
	 * Crée un client PostgreSQL bas niveau connecté à la base système `postgres`,
	 * destiné aux opérations administratives (création de base, etc.).
	 */
	#createAdminClient(): PgClient {
		const { user, host, pass, port, ssl } = this.config
		return new PgClient({ user, host, database: 'postgres', password: pass, port, ssl })
	}

	/** Vérifie via `pg_database` l'existence d'une base de données. */
	async #databaseExists(client: PgClient, dbName: string): Promise<boolean> {
		const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
			dbName,
		])
		return (rowCount ?? 0) > 0
	}

	/**
	 * Instancie Sequelize avec la configuration courante et vérifie la connexion
	 * via `authenticate()`.
	 */
	async #createSequelize(): Promise<Sequelize> {
		const { dbName, user, pass, host, port, ssl, schema } = this.config

		const sequelize = new Sequelize(dbName, user, pass, {
			host,
			port,
			dialect: 'postgres',
			logging: false,
			dialectOptions: ssl ? { ssl } : {},
			pool: DEFAULT_POOL,
			define: { underscored: true, timestamps: true, ...(schema && { schema }) },
		})

		await sequelize.authenticate()
		return sequelize
	}

	/** Construit les modèles Sequelize et branche leurs associations. */
	#buildModels(sequelize: Sequelize): ReturnType<typeof buildModels> {
		const models = buildModels(sequelize)
		makeAssociations(models)
		return models
	}

	/**
	 * Applique la stratégie de migration selon l'environnement :
	 * - `production` → migrations Umzug.
	 * - autre → `sync({ alter: true })`.
	 */
	async #migrateOrSync(sequelize: Sequelize): Promise<void> {
		if (this.config.env === 'production') {
			await this.#runMigrations(sequelize)
		} else {
			await sequelize.sync({ alter: true })
		}
	}

	/** Exécute les migrations en attente via Umzug. */
	async #runMigrations(sequelize: Sequelize): Promise<void> {
		const umzug = new Umzug({
			migrations: { glob: join(__dirname, '../migrations/*.js') },
			context: sequelize.getQueryInterface(),
			storage: new SequelizeStorage({ sequelize }),
			logger: console,
		})
		await umzug.up()
	}

	match = () => {
		if (!this.#models) throw new Error('Base non initialisée : appelle init() avant')
		return new MatchRepositoryPg(this.#models)
	}

	// /**
	//  * Fabrique un repository de matches de récupération.
	//  *
	//  * @returns {RecoveryMatchRepositoryPg}
	//  */
	// recoveryMatch = () => new RecoveryMatchRepositoryPg(this.#models, this.#log)

	// /**
	//  * Fabrique un repository bar.
	//  *
	//  * @returns {BarRepositoryPg}
	//  */
	// bar = () => new BarRepositoryPg(this.#models, this.#log)

	// /**
	//  * Fabrique un repository client.
	//  *
	//  * @returns {ClientRepositoryPg}
	//  */
	// client = () => new ClientRepositoryPg(this.#models, this.#log)
}