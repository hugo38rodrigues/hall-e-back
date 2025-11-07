import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

let loaded = false

export async function loadSecretsOnce() {
	if (loaded) return
	const arn = process.env.SECRETS_MANAGER_ARN
	const key = process.env.SECRET_MONGO_KEY || 'MONGODB_URI'
	const sm = new SecretsManagerClient({})
	const res = await sm.send(new GetSecretValueCommand({ SecretId: arn }))
	const json = JSON.parse(res.SecretString || '{}')
	const uri = json[key]
	if (!uri) throw new Error(`Clé ${key} absente du secret`)
	process.env.MONGODB_URI = process.env.MONGODB_URI || uri
	loaded = true
}
