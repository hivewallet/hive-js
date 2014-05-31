'use strict'

function validate(pin, allowBlank) {
  if(allowBlank && (pin == undefined || pin == '')) {
    return true
  }

  var pinNumber = parseInt(pin, 10)
  if(isNaN(pinNumber)) return false;

  return pin.length === 4
}

module.exports = validate
