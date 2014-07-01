var Wallet = require('bitcoinjs-lib').Wallet
var networks = require('bitcoinjs-lib').networks
var validateSend = require('../validator')

describe('validate', function(){
  var wallet = new Wallet(new Buffer('ff', 'hex'), networks.testnet)
  var from = wallet.generateAddress()
  var utxo = {
    "hash":"6a4062273ac4f9ea4ffca52d9fd102b08f6c32faa0a4d1318e3a7b2e437bb9c7",
    "outputIndex": 0,
    "address" : from,
    "value": 20000
  }
  wallet.setUnspentOutputs([utxo])

  describe('address', function(){
    it('catches invalid address', function(done){
      validateSend(wallet, '123', 0, function(err){
        expect(err.message).toEqual('Please enter a valid address to send to')
        done()
      })
    })

    it('catches address with the wrong version', function(done){
      validateSend(wallet, 'LNjYu1akN22USK3sUrSuJn5WoLMKX5Az9B', 0, function(err){
        expect(err.message).toEqual('Please enter a valid address to send to')
        done()
      })
    })

    it('allows valid address', function(done){
      validateSend(wallet, 'mqMRh2h5QbLyD4K3jZQMk2DzRwf2GwSoSQ', 0.0001, function(err){
        expect(err).toBeUndefined()
        done()
      })
    })
  })

  describe('send amount', function(){
    it('must be above dust threshold', function(done){
      validateSend(wallet, 'mqMRh2h5QbLyD4K3jZQMk2DzRwf2GwSoSQ', 0.00000546, function(err){
        expect(err.message).toEqual('Please enter an amount above 0.00000546')
        done()
      })
    })
  })

})
