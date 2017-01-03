/*jshint -W079 */
'use strict'

/**
 * Module dependencies.
 */
var Promise = require('bluebird')
var request = require('request')
var mongoose = require('mongoose')
var im = require('imagemagick')
var Schema = mongoose.Schema
var fs = require('fs')
var path = require('path')
var config = require('meanio').loadConfig()
var AWS = require('./../../config/aws').AWS
var s3Stream = require('s3-upload-stream')(new AWS.S3())
var thumbWidth = 256
var thumbHeight = 256
var imageWidth = 353 * 1.5
var imageHeight = 257 * 1.5
var randomstring = require('randomstring')

var UploadmanagerSchema = new Schema({
  
}, {
  collection: 'oc_uploads'
})

var downloadFileOnly = function(uri, filename, callback) {
  return request.head(uri, function(err, res, body) {
    if (!res.headers['content-type'].match(/image/)) {
      return callback(new Error('text-not-an-image'))
    }
    return request(uri).pipe(fs.createWriteStream(filename))
    .on('error', function(err) {
      callback(err)
    }).on('close', function() {
      callback()
    })
  })
}

var downloadFile = function(uri, callback) {
  var subpath = randomstring.generate(24) + '.jpg'
  var fullpath = path.join(config.root, config.uploadFolder, subpath) 

  return Promise.resolve()
  .then(function() {
    return Promise.promisify(downloadFileOnly)(uri, fullpath)
  }).then(function() {
    callback(null, subpath)
  }).catch(function(err) {
    callback(err)
  })
}

var copyFile = function(source, target, cb) {
  var cbCalled = false

  var rd = fs.createReadStream(source)
  rd.on('error', function(err) {
    done(err)
  })
  var wr = fs.createWriteStream(target)
  wr.on('error', function(err) {
    done(err)
  })
  wr.on('close', function(ex) {
    done()
  })
  rd.pipe(wr)

  function done(err) {
    if (!cbCalled) {
      cb(err)
      cbCalled = true
    }
  }
}

var resizeImageFile = function(file, width, height, quality, next) {
  quality = quality || 85
  if (width <= 100) {
    quality = 100
  }

  Promise.promisify(im.crop.bind(im))({
    srcPath: file,
    dstPath: file,
    width: width,
    height: height,
    quality: 0.85,
    gravity: 'Center'
  }).then(function() {
    next(null, true)
  }).catch(function(err) {
    next(err)
  })
}

var uploadFileToAWS = function(subpath, type, next) {
  var fullpath = path.join(config.root, config.uploadFolder, path.basename(subpath)) 
  if (!fullpath) {
    return next(null, fullpath)
  }
  var ContentType
  if (['image'].indexOf(type) === -1) {
    return next('need a type')
  }
  if (type === 'image') {
    ContentType = 'image/jpeg'
  }

  var filename = path.basename(fullpath)
  var destfile =  filename.substring(0, 3) + '/' + filename.substring(3, 6) + '/' + filename.substring(6, 9) + '/' + filename.substring(9)
  var read = fs.createReadStream(fullpath)
  var bucket = config && config.aws && config.aws.bucket
  if (!bucket) {
    return next('error need a bucket for upload')
  }

  var upload = s3Stream.upload({
    Bucket: bucket,
    ACL: 'public-read',
    Key: type + '/' + destfile,
    ContentType: ContentType
  }, {
    maxPartSize: 1024 * 1024 * 3
  })

  // Optional configuration
  upload.maxPartSize(1024 * 1024 * 3) // 3 MB

  // upload.maxPartSize(20971520) // 20 MB
  upload.concurrentParts(10)

  upload.on('data', function (bytesRead) {

  })

  // Handle errors.
  upload.on('error', function (error) {
    next(error)
  })

  upload.on('uploaded', function (details) {
    next(null, details.Location)
  })

  // Pipe the incoming filestream through compression, and up to S3.
  // read.pipe(compress).pipe(upload)
  read.pipe(upload)
}

// impath: subpath
// thpath: subpath
var FileToAWSImageThumb = function(imSubpath, empty, imWidth, imHeight, thWidth, thHeight) {

  return Promise.bind({})
  .then(function() {
    return FileToImageThumb(imSubpath, null, imWidth, imHeight, thWidth, thHeight)
  }).then(function(d) {
    this.image = d.image
    this.thumb = d.thumb
  }).then(function() {
    return Promise.promisify(uploadFileToAWS)(this.image, 'image').bind(this)
    .then(function(d) {
      this.image = d
    })
  }).then(function(d) {
    return Promise.promisify(uploadFileToAWS)(this.thumb, 'image').bind(this)
    .then(function(d) {
      this.thumb = d
    })
  }).then(function() {
    return {
      image: this.image, 
      thumb: this.thumb
    }
  })
}

// base64 to files under public folder
var Base64ToImageFile = function(data) {
  if (!data) {
    return Promise.reject('text-error-data')
  }
  var subpath = randomstring.generate(24) + '.jpg'
  var fullpath = path.join(config.root, config.uploadFolder, subpath) 

  return Promise.promisify(fs.writeFile)(fullpath, new Buffer(data, 'base64'))
  .then(function() {
    return {
      subpath: subpath
    }
  })
}

UploadmanagerSchema.statics.Base64ToAWSImage = function(data) {
  return Base64ToImageFile(data)
  .then(function(d) {
    return Promise.promisify(uploadFileToAWS)(d.subpath, 'image')
  })
}

// impath: subpath
// thpath: subpath
var FileToImageThumb = function(imSubpath, empty, imWidth, imHeight, thWidth, thHeight) {
  var thSubpath = randomstring.generate(24) + path.extname(imSubpath)
  var imFullpath = path.join(config.root, config.uploadFolder, path.basename(imSubpath)) 
  var thFullpath = path.join(config.root, config.uploadFolder, path.basename(thSubpath)) 
  imWidth = Math.max(50, imWidth || imageWidth)
  imHeight = Math.max(50, imHeight || imageHeight)
  thWidth = Math.max(50, thWidth || thumbWidth)
  thHeight = Math.max(50, thHeight || thumbHeight)

  return Promise.resolve()
  .then(function() {
    return Promise.promisify(copyFile)(imFullpath, thFullpath)
  }).then(function() {
    return Promise.promisify(resizeImageFile)(imFullpath, imWidth, imHeight, null)
  }).then(function() {
    return Promise.promisify(resizeImageFile)(thFullpath, thWidth, thHeight, null)
  }).then(function() {
    return {image: imSubpath, thumb: thSubpath}
  })
}

// downloadFile a file, and upload to become image and thumb
UploadmanagerSchema.statics.UrlToAWSImageThumb = function(url, empty, imWidth, imHeight, thWidth, thHeight) {
  // var that = this
  // var imSubpath = randomstring.generate(24)
  // var imFullpath = path.join(config.root, config.uploadFolder, imSubpath)

  return Promise.resolve()
  .then(function() {
    return Promise.promisify(downloadFile)(url)
  }).then(function(d) {
    return FileToAWSImageThumb(d, null, imWidth, imHeight, thWidth, thHeight)
  })
}

// upload a file in public folder to become image and thumb
UploadmanagerSchema.statics.FileToAWSImageThumb = function(subpath, empty, imWidth, imHeight, thWidth, thHeight) {

  return Promise.resolve()
  .then(function() {
    return FileToAWSImageThumb(subpath, null, imWidth, imHeight, thWidth, thHeight)
  })
}

UploadmanagerSchema.statics.Base64ToAWSImageThumb = function(data, empty, imWidth, imHeight, thWidth, thHeight) {

  return Promise.resolve()
  .then(function() {
    return Base64ToImageFile(data)
  }).then(function(d) {
    return FileToAWSImageThumb(d.subpath, null, imWidth, imHeight, thWidth, thHeight)
  })
}

UploadmanagerSchema.statics.Base64ToImageFile = function(data) {

  return Promise.resolve()
  .then(function() {
    return Base64ToImageFile(data)
  })
}

mongoose.model('Uploadmanager', UploadmanagerSchema)
