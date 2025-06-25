import request from 'supertest'
import { expect, test } from 'vitest'
import app from '../../../../index'
import {
	badFormatAddress,
	badTypeDescription,
	badTypeName,
} from '../../../fixtures/bar.fixture'

export const errorResponseBar = (signInUrl) => {
	test('Should be a error with bad format address for bar', async () => {
		const res = await request(app).post(signInUrl).send(badFormatAddress)

		expect(res.statusCode).toEqual(400)
		expect(res.body.message).toEqual(
			'Address must be in number of street street, postal code, City'
		)
	})

	test('Should be a error with bad type for description bar', async () => {
		const res = await request(app).post(signInUrl).send(badTypeDescription)

		expect(res.statusCode).toEqual(400)
		expect(res.body.message).toEqual(
			'Description is a string and must be a description of your bar'
		)
	})

	test('Should be a error with bad type for name bar', async () => {
		const res = await request(app).post(signInUrl).send(badTypeName)

		expect(res.statusCode).toEqual(400)
		expect(res.body.message).toEqual('Missing name or name must be string')
	})
}
