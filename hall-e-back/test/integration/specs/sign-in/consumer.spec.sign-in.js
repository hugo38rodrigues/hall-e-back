import request from 'supertest'
import { expect, test } from 'vitest'
import app from '../../../../index.js'
import {
	missingFirstNameConsumer,
	missingLastNameConsumer,
} from '../../../fixtures/client.fixture.js'

export const errorResponseConsumer = async (signInUrl) => {
	test('Should be a error with missing first name or last name', async () => {
		const resWithoutFirstName = await request(app)
			.post(signInUrl)
			.send(missingFirstNameConsumer)

		const resWithoutLastName = await request(app)
			.post(signInUrl)
			.send(missingLastNameConsumer)

		expect(resWithoutFirstName.statusCode).toEqual(400)
		expect(resWithoutFirstName.body.message).toEqual(
			'Missing first name or last name'
		)

		expect(resWithoutLastName.statusCode).toEqual(400)
		expect(resWithoutLastName.body.message).toEqual(
			'Missing first name or last name'
		)
	})
}
