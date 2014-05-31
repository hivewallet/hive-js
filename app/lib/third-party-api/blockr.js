'use strict';

var xhr = require('hive-xhr')
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

function listAddresses(addresses, onAddresses){
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

function sendTx(txHex, callback) {
  var uri = apiRoot + "tx/push"
  xhr({
    uri: uri,
    method: 'POST',
    body: JSON.stringify({hex: txHex})
  }, function(err, resp, body){
    if(resp.statusCode !== 200) {
      console.error(body)
      return callback(err)
    }
    console.log(body)
    callback(null)
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
    parseTransactions(txs, callback)
  })
}

function parseTransactions(apiTxs, callback){
  if(!apiTxs) return callback(null, []);
  if(!Array.isArray(apiTxs)) { apiTxs = [apiTxs] }

  var result = {}
  apiTxs.forEach(function(address){
    if(address.txs.length === 0) return;

    address.txs.forEach(function(tx){
      result[tx.tx] = tx
    })
  })

  var txIds = Object.keys(result)
  if(txIds.length === 0) return callback(null, []);

  makeRequest('tx/info/' + txIds.join(','), function (err, resp, body) {
    if(err) return callback(err)

    var txs = JSON.parse(resp.body).data
    if(!Array.isArray(txs)) { txs = [txs] }

    txs.forEach(function(tx){
      var firstOut = tx.vouts[0]
      var id = tx.tx
      result[id].toAddress = firstOut.address
      if(result[id].amount < 0) {
        result[id].amount = -firstOut.amount
      }
    })

    return callback(null, values(result).map(toTransaction))
  })
}

function values(obj){
  return Object.keys(obj).map(function(key){
    return obj[key]
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
    result.toAddress = tx.toAddress
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
Blockr.prototype.sendTx = sendTx
Blockr.prototype.getTransactions = getTransactions
module.exports = Blockr
