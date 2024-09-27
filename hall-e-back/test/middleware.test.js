import request from 'supertest'
import app from '../index.js'
import { expect } from 'chai'

describe('Middleware tests', () => {

  const signInUrl = '/api/v1/commun/sign-in'
  const missingRole = {}
  const unsetRole = {role: "unset"}

  it('should be error missing role with 400 status', (done) => {
    request(app)
      .post(signInUrl)
      .send(missingRole)
      .expect('Content-Type', /json/)
      .expect(400)
      .expect((res)=> {
        expect(res.body.message).to.equal('The “role” field is missing')
      })
      .end(done);
  });

  it('should be error unset role with 401 status', (done) => {
    request(app)
      .post(signInUrl)
      .send(unsetRole)
      .expect('Content-Type', /json/)
      .expect(401)
      .expect((res)=> {
        expect(res.body.message).to.equal(`The role ${unsetRole.role} is not accepted`)
      })
      .end(done);
  });
});