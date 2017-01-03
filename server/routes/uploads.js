'use strict'

var uploads = require('../controllers/uploads')

module.exports = function(Uploads, app, auth) {

  app.route('/apis/v1/uploads/multipart-upload')
    .post(uploads.multipartMiddleware, uploads.showFilePath)

  app.route('/apis/v1/uploads/base64-upload')
    .post(auth.requiresLogin, uploads.uploadBase64Image)  

  app.route('/apis/v1/uploads/multipart-upload-aws')
    .post(uploads.multipartMiddleware, auth.requiresAdmin, uploads.uploadToAWSImageThumb)
  
  app.route('/apis/v1/uploads/base64-upload-aws')
    .post(auth.requiresLogin, uploads.uploadBase64ImageAWS)
}
