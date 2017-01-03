'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Uploads = new Module('meanio-uploads');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Uploads.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Uploads.routes(app, auth, database);

  return Uploads;
});
