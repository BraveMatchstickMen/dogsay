'use strict'

var config = require('./config')

exports.thumb = function(key) {
    if (key.indexOf('http') > -1) return key

    return config.qiniu.thumb + key
}