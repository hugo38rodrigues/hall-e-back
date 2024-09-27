import {signInErrorEmailAndPassword} from './sign-in-consumer.test.js'

describe('Sign in a user', () => {

  const signInUrl = '/api/v1/commun/sign-in'
  
  const emptyEmailBar = {role: "bar", password:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c", address: "", name: "", email: "", price: "", description: "", photo: ""}
  const emptyPasswordBar = {role: "bar", password:"", address: "", name: "", email: "hugo@gmail.com", price: "", description: "", photo: ""}
  
  const emptyEmailConsumer = {role: "consumer", email: "", password:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c", email: "", firstName:"", lastName:"", }
  const emptyPasswordConsumer = {role: "consumer", email: "hugo@gmail.com", password:"", email: "", firstName:"", lastName:"", }

  it('should be error email or password with status code 401', async () => {
    await signInErrorEmailAndPassword(emptyEmailConsumer, signInUrl)
    await signInErrorEmailAndPassword(emptyPasswordConsumer, signInUrl)
    await signInErrorEmailAndPassword(emptyEmailBar, signInUrl)
    await signInErrorEmailAndPassword(emptyPasswordBar, signInUrl)
  });
  
});