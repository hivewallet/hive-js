var request = require('supertest')
var proxyquire =  require('proxyquire')
var assert = require('assert')
var fakeAuth = {
  register: function(name, pin, callback){
    if(name === 'valid') {
      callback(null, 'sometoken')
    } else {
      callback(new Error('boo'), null)
    }
  }
}
var app = proxyquire('../express', { './auth': fakeAuth })()

describe('/register', function(){
  it('returns ok on auth.register success', function(done){
    request(app)
      .post('/register')
      .send({wallet_id: 'valid', pin: 123})
      .expect(200)
      .end(done)
  })

  it('returns bad request when wallet id is missing', function(done){
    request(app)
      .post('/register')
      .send({pin: 123})
      .expect(400)
      .end(done)
  })

  it('returns bad request when pin is missing', function(done){
    request(app)
      .post('/register')
      .send({wallet_id: 'valid'})
      .expect(400)
      .end(done)
  })

  it('returns bad request when register returns error', function(done){
    request(app)
      .post('/register')
      .send({wallet_id: 'invalid', pin: 123})
      .expect(400)
      .end(done)
  })
})
