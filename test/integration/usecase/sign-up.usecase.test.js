import { describe } from 'vitest'
import { validConnexionBar } from '../../fixtures/bar.fixture'
import {
	clientNotFound,
	validConnexionConsumer,
} from '../../fixtures/client.fixture'
import { signUpSuccessFullBar } from '../specs/sign-up/bar.spec.sign-up'
import { signUpSuccessFullConsumer } from '../specs/sign-up/client.spec.sign-up'
import { notFoundUser } from '../specs/sign-up/commun.spec.sign-up'

describe('Sign-up user test', () => {
	const signUpUrl = '/api/v1/commun/connexion'

	signUpSuccessFullConsumer(signUpUrl, validConnexionConsumer)
	signUpSuccessFullBar(signUpUrl, validConnexionBar)
	notFoundUser(signUpUrl, clientNotFound)
})
