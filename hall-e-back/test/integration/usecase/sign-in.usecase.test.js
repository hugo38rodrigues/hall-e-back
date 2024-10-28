import { describe } from 'vitest'
import { missingEmailBar, missingPasswordBar, validBar } from '../../fixtures/bar.fixture'
import {
	missingEmailConsumer,
	missingPasswordConsumer,
} from '../../fixtures/consumer.fixture'
import { errorResponseBar } from '../specs/sign-in/bar.spec.sign-in'
import { checkMissingPasswordOrEmail, successFullUserSignIn } from '../specs/sign-in/commun.spec.sign-in'
import { errorResponseConsumer } from '../specs/sign-in/consumer.spec.sign-in'
describe('Register a user', () => {
	const signInUrl = '/api/v1/commun/sign-in'

	checkMissingPasswordOrEmail(
		signInUrl,
		missingEmailConsumer,
		missingPasswordConsumer
	)
	checkMissingPasswordOrEmail(signInUrl, missingEmailBar, missingPasswordBar)
	errorResponseConsumer(signInUrl)
	errorResponseBar(signInUrl)

	// successFullUserSignIn(signInUrl, validConsumer)
	successFullUserSignIn(signInUrl, validBar)
	// checkUserAlreadyExists(signInUrl, validBar)
	// checkUserAlreadyExists(signInUrl, validConsumer)
})
