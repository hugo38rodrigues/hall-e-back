import request from 'supertest'
import { expect, test } from 'vitest'
import app from '../../../../index.js'

export const successFullUserSignIn = (signInUrl, validUser) => {
	test(`Should be successful ${validUser.role} registration`, async () => {
		const res = await request(app).post(signInUrl).send(validUser)

		expect(res.body.message).toEqual('Sign in success')
		expect(res.statusCode).toEqual(201)
	})
}

export const checkUserAlreadyExists = (signInUrl, validUser) => {
	test(`Should be error ${validUser.role} already exist`, async () => {
		const res = await request(app).post(signInUrl).send(validUser)

		expect(res.body.message).toEqual('The user already exists')
		expect(res.statusCode).toEqual(401)
	})
}

export const checkMissingPasswordOrEmail = (signInUrl, missingEmail, missingPassword) => {
	test(`Should be a error with missing email or password for ${missingEmail.role}`, async () => {
		const resWithoutEmail = await request(app)
			.post(signInUrl)
			.send(missingEmail)

		const resWithoutPassword = await request(app)
			.post(signInUrl)
			.send(missingPassword)

		expect(resWithoutEmail.body.message).toEqual('Missing email or password')
		expect(resWithoutEmail.statusCode).toEqual(400)

		expect(resWithoutPassword.body.message).toEqual('Missing email or password')
		expect(resWithoutPassword.statusCode).toEqual(400)
	})
}
