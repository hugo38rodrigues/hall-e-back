import { loadSecretsOnce } from './bootstrapSecrets.js'

let cachedServer

export const http = async (event, context) => {
	await loadSecretsOnce()
	if (!cachedServer) {
		const { default: app } = await import('../server.js')
		const { default: serverlessExpress } = await import('@vendia/serverless-express')
		cachedServer = serverlessExpress({ app })
	}
	return cachedServer(event, context)
}
