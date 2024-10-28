import request from 'supertest'
import { expect, test } from 'vitest'
import app from '../../../../index'
import {
	consumerWithoutFavoriteAndLike,
} from '../../../fixtures/consumer.fixture'

export const signUpSuccessFullConsumer = (
	signUpUrl,
	validConnexionConsumer
) => {
	test('SignUp Success for consumer without likes and favorites', async () => {
		const res = await request(app).post(signUpUrl).send(validConnexionConsumer)
		expect(res.body).toEqual(consumerWithoutFavoriteAndLike)
		expect(res.statusCode).toEqual(200)
	})
}


