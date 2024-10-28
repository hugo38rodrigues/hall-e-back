import request from 'supertest'
import { expect, test, describe } from 'vitest'
import app from '../../../index.js'
import { roleMissing, badRole, } from '../../fixtures/middleware.fixture'

describe('Middleware tests', () => {
  const url = '/api/v1/commun/sign-in'

  test('should be error with a missing role and 400 status', async () => {
    const res = await request(app)
      .post(url)
      .send(roleMissing)
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual("The “role” field is missing")
  })

  test('should be error with a bad role and 401 status', async () => {
    const res = await request(app)
      .post(url)
      .send(badRole)
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual("The role unset is not accepted")
  })
})
