import request from 'supertest'
import { expect, test } from 'vitest'
import app from '../../../../index'
import { clientWithoutFavoriteAndLike } from '../../../fixtures/client.fixture'

export const signUpSuccessFullConsumer = (
	signUpUrl,
	validConnexionConsumer
) => {
	test('SignUp Success for client without likes and favorites', async () => {
		const res = await request(app).post(signUpUrl).send(validConnexionConsumer)
		expect(res.body).toEqual(clientWithoutFavoriteAndLike)
		expect(res.statusCode).toEqual(200)
	})
}
