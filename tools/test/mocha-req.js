'use strict';

process.env.NODE_ENV = 'test';

var appRoot = __dirname + '/../../';

require('meanio/lib/core_modules/module/util').preload(appRoot + '/server', 'model');
