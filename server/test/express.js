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

var user1 = {id: "foo", name: "Kuba", email: "kuba@example.com"}
var user2 = {id: "bar", name: "Wendell", email: "wendell@example.com"}
var geoRes = [[user1, 50], [user2, 123]]
var fakeGeo = {
  save: function(lat, lon, userInfo, callback){
    if(userInfo.id === 'valid') {
      callback(null, geoRes)
    } else {
      callback(new Error('boo'), null)
    }
  }
}
var app = proxyquire('../express', { './auth': fakeAuth, './geo': fakeGeo })()

describe('/register', function(){
  it('returns ok on auth.register success', function(done){
    request(app)
      .post('/register')
      .send({wallet_id: 'valid', pin: 123})
      .expect(200)
      .end(done)
  })

  it('returns bad request when register returns error', function(done){
    request(app)
      .post('/register')
      .send({wallet_id: 'invalid', pin: 123})
      .expect(400)
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
})

describe('/location', function(){
  it('returns ok on geo.save success', function(done){
    var data = {
      lat: 123.4,
      lon: 45.6,
      id: "valid",
      name: "Wei Lu",
      email: "wei@example.com"
    }

    request(app)
      .post('/location')
      .send(data)
      .end(function(req, res){
        assert.equal(res.status, 200)
        assert.deepEqual(JSON.parse(res.text), geoRes)
        done()
      })
  })

  it('returns vad request on geo.save error', function(done){
    var data = { id: "invalid" }

    request(app)
      .post('/location')
      .send(data)
      .expect(400)
      .end(done)
  })
})
