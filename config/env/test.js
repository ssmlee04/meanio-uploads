'use strict'

module.exports = {
  server: 'http://localhost:3000',
  mongodb: {
    db: 'mongodb://127.0.0.1:27017/meanio-test',
    dbOptions: {
      user: '',
      pass: ''
    }
  },
  aws: {
    key: process.env.AWS_ACCESS_KEY || '',
    secret: process.env.AWS_ACCESS_SECRET || '',
    region: process.env.AWS_REGION || 'us-west-2',
    bucket: process.env.AWS_S3_BUCKET || ''
  },
  debug: true,
  aggregate: true,
  mongoose: {
    debug: false
  },
  app: {
    name: ''
  }
}
