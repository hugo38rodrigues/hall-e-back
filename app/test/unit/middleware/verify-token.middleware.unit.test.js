import request from 'supertest'
import { describe, expect, test } from 'vitest'
import app from '../../../index.js'

describe('Middleware tests', () => {
  const url = '/api/v1/'
  const oldToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  test('should be error with a missing token and 400 status', async () => {
    const res = await request(app)
      .put(url)
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Token manquant ou invalide')
  })

  test('should be error with a bad token and 401 status', async () => {
    const res = await request(app).put(url).set('Authorization', oldToken)
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Ce token est trop ancien')
  })
})
