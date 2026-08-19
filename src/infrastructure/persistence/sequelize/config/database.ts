// db/factory.ts
import { MatchRepository } from "../../../../domain/port/match.repository"
import { Logger } from "../../../../shared/logger"
import { PostgresDatabases } from "../database/postgres.database"
import { PostgresConfig, RetryOptions } from "../database/postgres.type"

// import { MySqlDatabase } from './mysql/MySqlDatabase.js' // plus tard

export interface DatabaseAdapter {
  init(retry?: RetryOptions): Promise<void>
  health(): Promise<void>
  close(): Promise<void>
	match(): MatchRepository        
  // bar(): BarRepository
  // client(): ClientRepository
}

type AdapterBuilder = (logger: Logger, config?: Partial<PostgresConfig>) => DatabaseAdapter

interface CreateDatabaseOptions {
  config?: Partial<PostgresConfig>
  retry?: RetryOptions
}

const ADAPTERS: Record<string, AdapterBuilder> = {
  postgres: (logger, config) => new PostgresDatabases(logger, config),
  // mysql: (logger, config) => new MySqlDatabase(logger, config),
}

export async function createDatabase(
  logger: Logger,
  { config, retry }: CreateDatabaseOptions = {},
): Promise<DatabaseAdapter> {
  const adapterName = process.env.DB_ADAPTER ?? 'postgres'
  const build = ADAPTERS[adapterName]

  if (!build) {
    const supported = Object.keys(ADAPTERS).join(', ')
    throw new Error(`DB adapter inconnu: ${adapterName}. Supportés: ${supported}`)
  }

  const db = build(logger, config)
  await db.init(retry)
  return db
}