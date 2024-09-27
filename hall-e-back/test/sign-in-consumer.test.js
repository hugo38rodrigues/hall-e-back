import request from 'supertest'
import app from '../index.js'
import { expect } from 'chai'

export const signInErrorEmailAndPassword = async (data, signInUrl) => {
  await request(app)
    .post(signInUrl)
    .send(data)
    .expect('Content-Type', /json/)
    .expect(400)
    .expect((res)=> {
      expect(res.body.message).to.equal('Missing email or password')
    })
}