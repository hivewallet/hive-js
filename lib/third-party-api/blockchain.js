'use strict';

var xhr = require('xhr')
var Address = require('./address')
var Transaction = require('./transaction')

function Blockchain(testnet){
  if(testnet) throw new Error("testnet not supported")
}

Blockchain.prototype.listAddresses = listAddresses

function listAddresses(addresses, onAddresses, onTransactions){
  if(!addresses || !addresses.length) {
    var error = new Error("Addresses can't be blank")
    return onAddresses(error)
  }

  xhr({
    uri: "https://blockchain.info/multiaddr?cors=true&active=" + addresses.join('|'),
    headers: {
        "Content-Type": "application/json"
    }
  }, function (err, resp, body) {
    if(err) return onAddresses(err)

    if(resp.statusCode !== 200) {
      console.err(resp.body)
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

module.exports = Blockchain
