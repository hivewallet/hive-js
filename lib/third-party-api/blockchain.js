'use strict';

var xhr = require('xhr')
var Address = require('./address')

function Blockchain(testnet){
  if(testnet) throw new Error("testnet not supported")
}

Blockchain.prototype.listAddresses = listAddresses

function listAddresses(addresses, callback){
  if(!addresses || !addresses.length) {
    var error = new Error("Addresses can't be blank")
    return callback(error)
  }

  xhr({
    uri: "https://blockchain.info/multiaddr?cors=true&active=" + addresses.join('|'),
    headers: {
        "Content-Type": "application/json"
    }
  }, function (err, resp, body) {
    if(err) return callback(err)

    if(resp.statusCode !== 200) {
      console.err(resp.body)
      var error = new Error("Expect response status code to be 200, but got " + resp.statusCode)
      return callback(error)
    }

    var body = JSON.parse(resp.body)
    callback(null, parseAddresses(body.addresses))
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

module.exports = Blockchain
