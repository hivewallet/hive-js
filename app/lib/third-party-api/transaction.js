'use strict';

function Transaction(id){
  this.id = id
}

Transaction.prototype.toString = function(){
  return this.id
}

module.exports = Transaction
