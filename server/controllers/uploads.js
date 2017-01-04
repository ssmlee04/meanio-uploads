/*jshint -W079 */
'use strict'

/**
 * Module dependencies.
 */
var multiparty = require('multiparty')
var path = require('path')
var mongoose = require('mongoose')
var config = require('meanio').loadConfig()
var Uploadmanager = mongoose.model('Uploadmanager')

exports.uploadBase64Image = function (req, res) {
  var data = req.body.data

  return Promise.resolve()
  .then(function() {
    return Uploadmanager.Base64ToImageFile(data)
  }).then(function(d) {
    res.json(d)
  }).catch(function(err) {
    console.log(err.stack)
    res.json(500, {error: 'text-error-upload-base64'})
  })
}

exports.uploadBase64ImageAWS = function (req, res) {
  var data = req.body.data

  return Promise.resolve()
  .then(function() {
    return Uploadmanager.Base64ToAWSImage(data)
  }).then(function(d) {
    d = d.replace(config.s3path, config.cloudFront)
    res.json(d)
  }).catch(function(err) {
    console.log(err.stack)
    res.json(500, {error: 'text-error-upload-base64'})
  })
}

exports.multipartMiddleware = function (req, res, next) {
  var form = new multiparty.Form()

  form.uploadDir = path.join(config.root, config.uploadFolder)
  form.maxFilesSize = 5 * 1024 * 1024 // 5 mb

  form.parse(req, function(err, fields, files) {
    if (err) {
      return res.json(err.statusCode, err)
    }

    for (var key in fields) {
      var value = fields[key]
      fields[key] = value[0]
    }
    req.body = fields

    if (!files || !files.upload || !files.upload.length) {
      req.subpath = null
    } else {
      req.subpath = (files.upload[0].path || [0]).slice((files.upload[0].path || [0]).indexOf(config.uploadFolder) + config.uploadFolder.length + 1)
    }

    next(null, {'subpath': req.subpath})
  })
}

exports.showFilePath = function(req, res) {
  console.log({
    subpath: req.subpath
  })
  res.json({
    subpath: req.subpath
  })
}

exports.uploadToAWSImageThumb = function(req, res) {
  var subpath = req.subpath

  return Promise.resolve()
  .then(function() {
    return Uploadmanager.FileToAWSImageThumb(subpath)
  }).then(function(d) {
    res.json(d)
  }).catch(function(err) {
    console.log(err)
    console.log(err.stack)
    res.json(500, {error: 'text-error-upload-base64-aws'})
  })
}

