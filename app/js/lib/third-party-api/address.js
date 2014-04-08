'use strict';

function Address(address){
  this.address = address
}

Address.prototype.toString = function(){
  return this.address
}

module.exports = Address
