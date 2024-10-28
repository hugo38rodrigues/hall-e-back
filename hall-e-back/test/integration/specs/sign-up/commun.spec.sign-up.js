import request from 'supertest'
import { expect, test } from 'vitest'
import app from '../../../../index'


export const notFoundUser = (signUpUrl, userNotFound) => {
	test('Not found user pending sign up ', async () => {
		const res = await request(app).post(signUpUrl).send(userNotFound)

		expect(res.body.message).toEqual('User is not found')
		expect(res.statusCode).toEqual(400)
	})
}
