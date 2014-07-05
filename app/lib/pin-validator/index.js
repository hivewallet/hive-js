'use strict';

function validate(pin) {

  var pinNumber = parseInt(pin, 10)
  if(isNaN(pinNumber)) return false;

  return pin.length === 4
}

module.exports = validate
