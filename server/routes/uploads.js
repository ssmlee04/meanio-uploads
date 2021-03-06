'use strict'

var uploads = require('../controllers/uploads')

module.exports = function(Uploads, app, auth) {

  app.route('/apis/v1/uploads/multipart-upload')
    .post(auth.requiresLogin, uploads.multipartMiddleware, uploads.showFilePath)

  app.route('/apis/v1/uploads/base64-upload')
    .post(auth.requiresLogin, uploads.uploadBase64Image)

  app.route('/apis/v1/uploads/multipart-upload-aws')
    .post(auth.requiresLogin, auth.requiresAdmin, uploads.multipartMiddleware, uploads.uploadToAWSImage)

  app.route('/apis/v1/uploads/base64-upload-aws')
    .post(auth.requiresLogin, auth.requiresAdmin, uploads.uploadBase64ImageAWS)
}
