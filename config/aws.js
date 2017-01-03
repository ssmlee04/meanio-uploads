'use strict'

var _         = require('lodash')
var config = require('meanio').loadConfig() 
var AWS      = require('aws-sdk')

AWS.config.update({
  accessKeyId: config && config.aws && config.aws.key,
  secretAccessKey: config && config.aws && config.aws.secret,
  region: config && config.aws && config && config.aws.bucket || 'us-west-2'
})

module.exports = _.extend({
  AWS: AWS
}, {})
