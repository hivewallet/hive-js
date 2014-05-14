var request = require('supertest')
var proxyquire =  require('proxyquire')
var assert = require('assert')

var token = 'sometoken'
var fakeAuth = {
  register: function(name, pin, callback){
    if(name === 'valid') {
      callback(null, token)
    } else {
      callback(new Error('boo'), null)
    }
  },
  login: function(name, pin, callback) {
    callback(null, token)
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

  // TODO: clean db & setup db
  // beforeEach(function(){
  // })

  it('sets user session on auth.register success', function(done){
    request(app)
      .post('/register')
      .send({wallet_id: 'valid', pin: 123})
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.deepEqual(res.text, token)
        assert(res.headers['set-cookie'])
        done()
      })
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

describe('/login', function(){
  it('sets user session on successful login', function(done){
    request(app)
      .post('/login')
      .send({wallet_id: 'valid', pin: 123})
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.deepEqual(res.text, token)
        assert(res.headers['set-cookie'])
        done()
      })
  })
})

describe('/location', function(){
  function postWithCookie(endpoint, data, callback){
    request(app)
      .post('/login')
      .send({wallet_id: 'valid', pin: 123})
      .end(function(err, res){
        request(app)
          .post(endpoint)
          .set('cookie', res.headers['set-cookie'])
          .send(data)
          .end(callback)
      })
  }

  it('returns ok on geo.save success', function(done){
    var data = {
      lat: 123.4,
      lon: 45.6,
      id: "valid",
      name: "Wei Lu",
      email: "wei@example.com"
    }
    postWithCookie('/location', data, function(err, res){
      assert.equal(res.status, 200)
      assert.deepEqual(JSON.parse(res.text), geoRes)
      done()
    })
  })

  it('returns vad request on geo.save error', function(done){
    var data = { id: "invalid" }

    postWithCookie('/location', data, function(err, res){
      assert.equal(res.status, 400)
      done()
    })
  })

  it('returns unauthorized if session cookie is not found', function(done){
    var data = { id: "valid" }

    request(app)
      .post('/location')
      .send(data)
      .expect(401)
      .end(done)
  })
})
