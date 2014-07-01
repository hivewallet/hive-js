var Wallet = require('bitcoinjs-lib').Wallet
var networks = require('bitcoinjs-lib').networks
var validateSend = require('../validator')

describe('validate', function(){
  var wallet = new Wallet(new Buffer('ff', 'hex'), networks.testnet)

  describe('address', function(){
    it('catches invalid address', function(done){
      validateSend(wallet, '123', 0, function(err){
        expect(err.message).toEqual('Please enter a valid address to send to.')
        done()
      })
    })

    it('catches address with the wrong version', function(done){
      validateSend(wallet, 'LNjYu1akN22USK3sUrSuJn5WoLMKX5Az9B', 0, function(err){
        expect(err.message).toEqual('Please enter a valid address to send to.')
        done()
      })
    })

    it('allows valid address', function(done){
      validateSend(wallet, 'mqMRh2h5QbLyD4K3jZQMk2DzRwf2GwSoSQ', 0, function(err){
        expect(err).toBeUndefined()
        done()
      })
    })
  })
})
