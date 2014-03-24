'use strict';

var xhr = require('xhr')
var Address = require('./address')
var Transaction = require('./transaction')
var Script = require('bitcoinjs-lib').Script

function Blockchain(testnet){
  if(testnet) throw new Error("testnet not supported")
}
Blockchain.apiRoot = "https://blockchain.info/"
Blockchain.corsParam = "cors=true"

function listAddresses(addresses, onAddresses, onTransactions){
  if(!addresses || !addresses.length) {
    var error = new Error("Addresses can't be blank")
    return onAddresses(error)
  }

  makeRequest('multiaddr', ["active=" + addresses.join('|')], function (err, resp, body) {
    if(err) return onAddresses(err)

    if(resp.statusCode !== 200) {
      console.error(resp.body)
      var error = new Error("Expect response status code to be 200, but got " + resp.statusCode)
      return onAddresses(error)
    }

    var body = JSON.parse(resp.body)
    onAddresses(null, parseAddresses(body.addresses))

    var transactions = parseTransactions(body.txs)
    if(transactions) onTransactions(null, transactions)
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
  makeRequest('unspent', ["active=" + addresses.join('|')], function (err, resp, body) {
    if(err) return callback(err)

    var body = JSON.parse(resp.body)
    callback(null, parseUnspentOutputs(body.unspent_outputs))
  })
}

function parseUnspentOutputs(apiUtxo) {
  if(!apiUtxo || !apiUtxo.length) return []

  return apiUtxo.map(toUnspentOutput)
}

function toUnspentOutput(out) {
  var script = out['script']
  var result = {
    hash: out['tx_hash'],
    outputIndex: out['tx_output_n'],
    scriptPubKey: script,
    address: addressFromScriptPubKey(script),
    value: out['value']
  }

  return result
}

function addressFromScriptPubKey(scriptHex){
  var script = Script.fromHex(scriptHex)
  return script.getToAddress().toString()
}

function toAddress(address){
  var result = new Address(address['address'])
  result.txCount = address['n_tx']
  result.totalSent = address['total_sent']
  result.totalReceived = address['total_received']
  result.balance = address['final_balance']
  return result
}

function parseTransactions(apiTxs){
  if(!apiTxs || !apiTxs.length) return null

  return apiTxs.map(toTransaction).sort(function(tx1, tx2){
    // most recent first
    return tx1.timestamp > tx2.timestamp ? -1 : 1
  })
}

function toTransaction(tx){
  var result = new Transaction(tx['hash'])
  result.timestamp = tx['time']
  result.amount = tx['result']
  if(tx['result'] > 0) {
    result.direction = 'incoming'
  } else {
    result.direction = 'outgoing'
    result.toAddress = tx['out'][0]['addr']
  }

  return result
}

function makeRequest(endpoint, params, callback){
  params = params || []
  params.push(Blockchain.corsParam)
  var uri = Blockchain.apiRoot + endpoint + '?' + params.join('&')

  xhr({
    uri: uri,
    headers: { "Content-Type": "application/json" }
  }, callback)
}

Blockchain.prototype.listAddresses = listAddresses
Blockchain.prototype.getUnspent = getUnspent
module.exports = Blockchain
