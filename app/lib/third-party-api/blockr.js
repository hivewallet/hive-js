'use strict';

var xhr = require('hive-xhr')
var Address = require('./address')
var Transaction = require('./transaction')
var btcToSatoshi = require('hive-convert').btcToSatoshi
var Bitcoin = require('bitcoinjs-lib')
var async = require('async')

var apiRoot = null;

var networks = {
  testnet: "https://tbtc.blockr.io/api/v1/",
  bitcoin: "https://btc.blockr.io/api/v1/",
  litecoin: "https://ltc.blockr.io/api/v1/"
}

function Blockr(network){
  this.network = network || 'bitcoin'
  apiRoot = networks[network]
}

function listAddresses(addresses, onAddresses){
  if(!addresses || !addresses.length) {
    var error = new Error("Addresses cannot be blank")
    return onAddresses(error)
  }

  makeRequest('address/info/' + addresses.join(','), function (err, resp) {
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
  batchRequests(addresses, requestUnspent, callback)
}

function batchRequests(items, fn, callback) {
  items = items.slice() // do not modify items
  var batches = []
  var itemsPerBatch = 20

  while(items.length > itemsPerBatch){
    var batch = items.splice(0, itemsPerBatch)
    batches.push(batch)
  }
  batches.push(items)

  async.parallel(batches.map(function(batch){
    return fn(batch)
  }),
  function(err, results) {
    if(err) return callback(err);

    callback(null, Array.prototype.concat.apply([], results))
  })
}

function requestUnspent(addresses){
  return function(callback){
    makeRequest('address/unspent/' + addresses.join(','), function (err, resp) {
      if(err) return callback(err)

      var utxo = JSON.parse(resp.body).data
      callback(null, parseUnspentOutputs(utxo))
    })
  }
}

function sendTx(txHex, callback) {
  var uri = apiRoot + "tx/push"

  // begin cors proxy
  var param = encodeURIComponent(uri)
  var corsUri = process.env.PROXY_URL + "?url=" + param
  // end cors proxy

  xhr({
    uri: corsUri,
    method: 'POST',
    body: JSON.stringify({hex: txHex}),
    headers: { "Content-Type": "application/json" }
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

function toAddress(address){
  var result = new Address(address['address'])
  result.txCount = address['nb_txs']
  result.totalReceived = address['totalreceived']
  result.balance = address['balance']
  result.totalSent = result.totalReceived - result.balance
  return result
}

function getTransactions(addresses, callback) {
  batchRequests(addresses, requestTransactionsForAddresses, callback)
}

function getUnconfirmedTransactions(addresses, callback) {
  batchRequests(addresses, requestUnconfirmedTransactionsForAddresses, callback)
}

function requestTransactionsForAddresses(addresses){
  return function(callback){
    makeRequest('address/txs/' + addresses.join(','), function (err, resp) {
      if(err) return callback(err)

      var txs = JSON.parse(resp.body).data
      parseTransactions(txs, callback)
    })
  }
}

function requestUnconfirmedTransactionsForAddresses(addresses){
  return function(callback){
    makeRequest('address/unconfirmed/' + addresses.join(','), function (err, resp) {
      if(err) return callback(err)

      var txs = JSON.parse(resp.body).data
      parseUnconfirmedTransactions(txs, callback)
    })
  }
}

function transactionsById(apiTxs, txField){
  if(!apiTxs) return [];
  if(!Array.isArray(apiTxs)) { apiTxs = [apiTxs] }

  var results = {}
  apiTxs.forEach(function(address){
    if(address[txField].length === 0) return;

    address[txField].forEach(function(tx){
      var id = tx.tx
      if(results[id] && results[id].amount < 0) return; // tx keyed by sent addr takes precedence e.g. change1 -> dest + change2 we want change1

      results[id] = tx
    })
  })

  return results
}

function parseTransactions(apiTxs, callback){
  var transactions = transactionsById(apiTxs, 'txs')

  var txIds = Object.keys(transactions)
  if(txIds.length === 0) return callback(null, []);

  batchRequests(txIds, requestTransactions, function(err, txs){
    if(err) return callback(err);

    txs.forEach(function(tx){
      var firstOut = tx.vouts[0]
      var id = tx.tx

      transactions[id].toAddress = firstOut.address
      if(transactions[id].amount < 0) {
        transactions[id].amount = -firstOut.amount
      }
    })

    return callback(null, values(transactions).map(toTransaction))
  })
}

function parseUnconfirmedTransactions(apiTxs, callback){
  var transactions = transactionsById(apiTxs, 'unconfirmed')

  var txIds = Object.keys(transactions)
  if(txIds.length === 0) return callback(null, []);

  batchRequests(txIds, requestRawTransactions, function(err, txs){
    if(err) return callback(err);

    txs.forEach(function(resp){
      var tx = resp.tx
      var firstOut = tx.vout[0]
      var id = tx.txid

      transactions[id].raw = tx.hex
      transactions[id].toAddress = firstOut.scriptPubKey.addresses[0]
      if(transactions[id].amount < 0) {
        transactions[id].amount = -firstOut.value
      }
    })

    return callback(null, values(transactions).map(toTransaction))
  })
}

function requestTransactions(txIds){
  return makeTransactionRequest(txIds, 'info')
}

function requestRawTransactions(txIds){
  return makeTransactionRequest(txIds, 'raw')
}

function makeTransactionRequest(txIds, type){
  return function(callback){
    makeRequest('tx/' + type + '/' + txIds.join(','), function (err, resp) {
      if(err) return callback(err)

      var txs = JSON.parse(resp.body).data
      if(!Array.isArray(txs)) { txs = [txs] }
      callback(null, txs)
    })
  }
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
  result.pending = !tx['confirmations']
  result.raw = tx.raw

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

function txToHiveTx(tx) {
  var result = new Transaction(tx.getId())
  var out = tx.outs[0]
  result.timestamp = (new Date()).getTime()
  result.amount = -out.value
  result.direction = 'outgoing'

  var network = Bitcoin.networks[this.network]
  result.toAddress = Bitcoin.Address.fromOutputScript(out.script, network).toString()
  result.pending = true

  return result
}


Blockr.prototype.listAddresses = listAddresses
Blockr.prototype.getUnspent = getUnspent
Blockr.prototype.sendTx = sendTx
Blockr.prototype.getTransactions = getTransactions
Blockr.prototype.getUnconfirmedTransactions = getUnconfirmedTransactions
Blockr.prototype.txToHiveTx = txToHiveTx
module.exports = Blockr
