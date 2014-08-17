var Wallet = require('bitcoinjs-lib').Wallet
var networks = require('bitcoinjs-lib').networks
var validateSend = require('../validator')

describe('validate', function(){
  var wallet = new Wallet(new Buffer(128/8), networks.testnet)
  var to = 'mqMRh2h5QbLyD4K3jZQMk2DzRwf2GwSoSQ'
  var from = wallet.generateAddress()
  var utxo = {
    "hash":"6a4062273ac4f9ea4ffca52d9fd102b08f6c32faa0a4d1318e3a7b2e437bb9c7",
    "outputIndex": 0,
    "address" : from,
    "value": 29999
  }
  wallet.setUnspentOutputs([utxo])

  var fundsUnavailableMessage = "Some funds are temporarily unavailable. To send this transaction, you will need to wait for your pending transactions to be confirmed first (this should not take more than a few minutes)."
  var fundsUnavailableLink = "https://github.com/hivewallet/hive-osx/wiki/Sending-Bitcoin-from-a-pending-transaction"

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

    it('allows valid pubKeyHash address', function(done){
      validateSend(wallet, to, 0.0001, function(err){
        expect(err).toBeNull()
        done()
      })
    })

    it('allows valid p2sh address', function(done){
      validateSend(wallet, '2MvR3wixpB1usCNRugN6ufwxfT4GEFxoRhQ', 0.0001, function(err){
        expect(err).toBeNull()
        done()
      })
    })
  })

  describe('send amount', function(){
    it('must be above dust threshold', function(done){
      validateSend(wallet, to, 0.00000546, function(err){
        expect(err.message).toEqual('Please enter an amount above')
        done()
      })
    })

    it('catches amount more than wallet balance', function(done){
      validateSend(wallet, to, 0.0003, function(err){
        expect(err.message).toEqual("You do not have enough funds in your wallet")
        done()
      })
    })

    describe('trying to empty wallet without including fee', function(){
      var sendableAmountMessage = "It seems like you are trying to empty your wallet. Taking transaction fee into account, we estimated that the max amount you can send is. We have amended the value in the amount field for you"

      it('amount equals balance exactly', function(done){
        validateSend(wallet, to, 0.00029999, function(err){
          expect(err.message).toEqual(sendableAmountMessage)
          expect(err.interpolations.sendableBalance).toEqual(0.00019999)
          done()
        })
      })

      it('balance - feePerKb < amount < balance', function(done){
        validateSend(wallet, to, 0.0002, function(err){
          expect(err.message).toEqual(sendableAmountMessage)
          expect(err.interpolations.sendableBalance).toEqual(0.00019999)
          done()
        })
      })

      it('asks user to try later when there is pending utxo', function(done){
        var pendingUtxo = cloneObject(utxo)
        pendingUtxo.pending = true
        pendingUtxo.outputIndex = 1
        pendingUtxo.value = 0 // lazy: does not need to reset after test

        wallet.setUnspentOutputs([utxo, pendingUtxo])

        validateSend(wallet, to, 0.0002, function(err){
          expect(err.message).toEqual(fundsUnavailableMessage)
          expect(err.href).toContain(fundsUnavailableLink)
          done()
        })
      })
    })

    it('returns fee when amount is valid', function(done){
      validateSend(wallet, to, 0.0001, function(err, fee){
        expect(err).toBeNull()
        expect(fee).toEqual(0.0001)
        done()
      })
    })

    describe('when confirmed balance < amount + fee <= balance', function(){
      beforeEach(function(){
        var pendingUtxo = cloneObject(utxo)
        pendingUtxo.pending = true
        pendingUtxo.outputIndex = 1

        wallet.setUnspentOutputs([utxo, pendingUtxo])
      })

      afterEach(function(){
        wallet.setUnspentOutputs([utxo])
      })

      it('prompt user to wait', function(done){
        validateSend(wallet, to, 0.00049998, function(err){
          expect(err.message).toEqual(fundsUnavailableMessage)
          expect(err.href).toContain(fundsUnavailableLink)
          done()
        })
      })
    })
  })

  // quick and dirty: does not deal with functions on object
  function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj))
  }
})
