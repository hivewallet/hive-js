'use strict';

var xhr = require('xhr')
var Address = require('./address')
var Transaction = require('./transaction')
var Script = require('bitcoinjs-lib').Script
var Blockchain = require('./blockchain')
var Big = require('big.js')

var apiRoot = null;

function Blockr(testnet){
  if(testnet) {
    apiRoot = "https://tbtc.blockr.io/api/v1/"
  } else {
    apiRoot = "https://btc.blockr.io/api/v1/"
  }
}

function listAddresses(addresses, onAddresses, onTransactions){
  if(!addresses || !addresses.length) {
    var error = new Error("Addresses can't be blank")
    return onAddresses(error)
  }

  makeRequest('address/info/' + addresses.join(','), function (err, resp, body) {
    if(err) return onAddresses(err)

    if(resp.statusCode !== 200) {
      console.error(resp.body)
      var error = new Error("Expect response status code to be 200, but got " + resp.statusCode)
      return onAddresses(error)
    }

    onAddresses(null, parseAddresses(JSON.parse(resp.body).data))
    getTransactions(addresses, onTransactions)
  })

  function parseAddresses(apiAddresses){
    var parsedAddresses = {}
    apiAddresses.forEach(function(a){
      var parsed = toAddress(a)
      parsedAddresses[parsed.address] = parsed
    })

    // sort by original order
    return addresses.map(function(a){
      return parsedAddresses[a]
    })
  }
}

function getUnspent(addresses, callback){
  makeRequest('address/unspent/' + addresses.join(','), function (err, resp, body) {
    if(err) return callback(err)

    var utxo = JSON.parse(resp.body).data
    callback(null, parseUnspentOutputs(utxo))
  })
}

function parseUnspentOutputs(apiUtxo) {
  if(!apiUtxo || !apiUtxo.length) return [];

  return inlineAddress('unspent', apiUtxo).map(toUnspentOutput)
}

function inlineAddress(collectionField, data) {
  var result = []
  data.forEach(function(out){
    var collection = out[collectionField]
    if(collection.length > 0) {
      var address = out.address
      collection.forEach(function(obj){
        obj.address = address
        result.push(obj)
      })
    }
  })
  return result
}

function toUnspentOutput(out) {
  var result = {
    hash: out['tx'],
    outputIndex: out['n'],
    address: out['address'],
    value: btcToSatoshi(out['amount'])
  }

  return result
}

function btcToSatoshi(btc) {
  return parseInt((new Big(btc)).times(100000000))
}

function toAddress(address){
  var result = new Address(address['address'])
  result.txCount = address['nb_txs']
  result.totalReceived = address['totalreceived']
  result.balance = address['balance']
  result.totalSent = result.totalReceived - result.balance
  return result
}

function getTransactions(addresses, callback) {
  makeRequest('address/txs/' + addresses.join(','), function (err, resp, body) {
    if(err) return callback(err)

    var txs = JSON.parse(resp.body).data
    callback(null, parseTransactions(txs))
  })
}

function parseTransactions(apiTxs){
  if(!apiTxs || !apiTxs.length) return []

  return inlineAddress('txs', apiTxs).map(toTransaction).sort(function(tx1, tx2){
    // most recent first
    return tx1.timestamp > tx2.timestamp ? -1 : 1
  })
}

function toTransaction(tx){
  var result = new Transaction(tx['tx'])
  result.timestamp = Date.parse(tx['time_utc'])
  result.amount = btcToSatoshi(tx['amount'])
  result.pending = tx['confirmations'] < 6
  if(result.amount > 0) {
    result.direction = 'incoming'
  } else {
    result.direction = 'outgoing'
    result.toAddress = tx['address']
  }

  return result
}

function makeRequest(endpoint, params, callback){
  var uri = apiRoot + endpoint
  if(Array.isArray(params)){
    uri +=  '?' + params.join('&')
  } else if (params instanceof Function) {
    callback = params
  }

  xhr({
    uri: uri
  }, callback)
}

Blockr.prototype.listAddresses = listAddresses
Blockr.prototype.getUnspent = getUnspent
Blockr.prototype.sendTx = Blockchain.prototype.sendTx //for now
module.exports = Blockr
