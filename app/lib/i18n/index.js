'use strict';

var translate = require('counterpart')

translate.setSeparator('*')
translate.registerTranslations('en', require('./en'))
translate.registerTranslations('zh-CN', require('./zh-CN'))

module.exports = translate
