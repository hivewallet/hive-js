'use strict';

var crypto = require('crypto')

function formatEmail(email){
  return email.trim().toLowerCase()
}

function emailToAvatar(email){
  email = formatEmail(email)

  return [
    'https://www.gravatar.com/avatar/',
    crypto.createHash('md5').update(email).digest('hex'),
    '?size=200'
  ].join('')
}

module.exports = {
  emailToAvatar: emailToAvatar
}
