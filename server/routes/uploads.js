'use strict'

var uploads = require('../controllers/uploads')

module.exports = function(Uploads, app, auth) {

  app.route('/apis/v1/uploads/multipart-upload')
    .post(uploads.multipartMiddleware, uploads.showFilePath)

  app.route('/apis/v1/uploads/base64-upload')
    .post(uploads.uploadBase64Image)  

  app.route('/apis/v1/uploads/multipart-upload-aws')
    .post(auth.requiresLogin, auth.requiresAdmin, uploads.multipartMiddleware, uploads.uploadToAWSImageThumb)
  
  app.route('/apis/v1/uploads/base64-upload-aws')
    .post(auth.requiresLogin, auth.requiresAdmin, uploads.uploadBase64ImageAWS)
}
