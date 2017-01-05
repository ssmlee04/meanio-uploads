/*jshint -W079 */
'use strict'

/**
 * Module dependencies.
 */
var Promise = require('bluebird')
var should = require('should')
var path = require('path')
var fs = require('fs')
var mongoose = require('mongoose')
var config = require('meanio').loadConfig()
var Uploadmanager = mongoose.model('Uploadmanager')
var _ = require('lodash')
var request = Promise.promisify(require('request'))
var cookieJar = request.jar()
var randomstring = require('randomstring')
var del = require('del')


/**
 * Globals
 */
var numRepeat = 10
var user = {
  name: randomstring.generate(),
  email: randomstring.generate() + '@gmail.com',
  password: randomstring.generate() + '@gmail.com',
  roles: ['user'],
  verified: true
}
var googleImg = 'iVBORw0KGgoAAAANSUhEUgAAAJcAAACXCAMAAAAvQTlLAAABF1BMVEX////qQzU0qFNChfT7vAU8gvTz9/5pm/bh6f3m7f4edvMhePPqPi/7tgD7uAD7ugAyfvPpOCjpNCIopUv0+vb62NYAnjf97ezU6tnrTkKv2LhCrF7whX4YokLpLRnC4cn+9/bymZPoHgDt8v4zqkHo9Ov0qqX2vrrpOzb8wgB1vob+7s+ExZNUsmv/+e9XkPXT4PzsX1WZzqX4ycbudW374+JiuHdKqU7btQPsuxaTtfj8w0U8lrSux/prrEQDpljF1vsmf+Gmz8SRsD40pGf/4Kj86cGmsjY3oH85maKAqfc/jtQ/k8Q5nZL3qBT81oTtXC/xfCb1lxvvbyHNtyb8y2MAaPK1syznAhj2nzjuZirzjSD80nX4U1R1AAAFc0lEQVR4nO2YC1faSBiGQwCtEAzJxBgICSGFoMilQERbWy+tdXfb3bXdrXvt//8dO1wOEDIZkkmGePbMo+eoR8DHb9755hs4jsFgMBgMBoPBYDAYDMYzxDo+HzsN1x1C3FqjPT62rNSdjpza0LRNU5aEGZJs2rbkNtpHKUqN3UoGCmV8CLKcqTSOrDSsxg3BRjmt3Oyhc75rq/ZQkIOdlmoZd5dmljO0MZVaR7LdnSVtPJRDWs3MBNfahdWRG7ZWSzPJoa/lCFI0qykm7ZidD83oVtOS2W2aWuMKQbHmyDV6Wk7UZK1juseUtGrbOxYOqWLRsLJcsmitvDJUwu8SR2uOUKHRYC033iLCalGJV8xsUaoW14idLSrVam+rliBJ8hQJjoe7q9aRjZWSzQqcn502BM7Tw4y5uUMoVcsa4sY/W2qMz63Vo+G079rm+jOEDJ1RB5N5OVND/k3HXZlRqhY3Dsy8YNeCWqXVrph0q3VcCSwWfnpxMhLFanFOwCoK9rZp7xyWjFa1uOOAvSgPQ5x2DZtWtbga+lg0h6H+oEPr0nH2+wlSi+KUF4rH3L8IMdNNWatfyp3+mtk0k3Zz88LweJiDYl+8YoJJK8xh6V+JOcjpV4+YlOJ7NXMeZlpQ7LeTlZncSFuL+36YW4it1lLIpG3F9RflmoqJ/yzEZKo31FA8lHIrTucNQ0i7RXBry7gI2bRh2OO0rTjuSsx5xMQvJ0IlbSl4BuV8fP0r/XQtu8R6yf7GTRF7kSD2+njo8xK/Yx5/MNiPArHYo9/r8CPOq5CPQOElqdeTfx1LfaxXNgLFV4Ra/dcIL9wTonmV35F6IeJ1laDXG1Kvks/rEBf7iF75Twl64WIf1Wuf0OvM71VK0muQoNcD8/pfeD2HfKH24+Pz9BKfnoPXoe8cEnMJepH2r/4V1XObuN8j54mzxLyIz0fk/IUL/o7mCeS8+qRgvP4oFosF+DH/LEx/mn9XKPu9iOcv7sGvJV5rmCe8COLgjV+MfF71BV/8dmGMiF7qE6Jg5BcPr5eY+5PneYPolYo+qzz5vcMbMDF3fTP1IinYK/+OIN+O3o4vXs60eL7Xiv5CiHiRb0eOs1YLKX6bWxEV7GCA6BMvyL2WCymKH/glauSCvUOknvR0nLF4h0J8fX2z8gITTA9D4k99rHhxix0pXvIeQMSVRKQrWyDuqjMeSnANf7jxevFqPcpr3CK08gPyLjEDtocPm1qwYriuv0k2n/gywuRfXvi1YMVCi+3tI7Sy2XjLCFvYBcIKoofdlPuIVSSfCVdUDbRYuIztIbXipn6KoqO9eNDd/uSXA6QW8Wi/Th0EiBn6lpAp7++QWtnybQJe3CRIDIARrsNqHfUeKZZIueC/HeQFzdRRQP6V+kQFPGi+Lfu3YzHO0bhGUPRni8l3EBugNZoY8/+m+ZOvYmXii9AmXYwYDwxjUtVaremSKkqrpdW7QF2VuHl/t1GxAfEAvYmiBy/lQk3vTTqQSU83DO+Dwf1nz7lduE1KC65LULPwCECQv2i+XTuKYp9AHjQ1hFggzR+X6Y99YG8Q2MVCAfTP8/jnY9yCAsRiVQyAn8vJdVQP1VgV45u/5PM0tOJWDIbsrhjjDoRB29IutmAY8acINC0d12C3APgoQ240FGznx2v1ot6iIlEN6J3brFTs6JEASuDYg8HoRbpBkVHnIy4mMLqUizVHqfIRagbAhOCdFjJaVRCymQG1Q28bIlDqvaDxYb1UemdntVqijXQVkzSgGp3qTnLlQ9FGPZ03NusGABwNe516OlILWvVqd6IbqqoakOkXfdId1XcaqiAUONdrWh2iaS34Q9o+DAaDwWAwGAwGg8FgMJD8B0Y0n3erXn7HAAAAAElFTkSuQmCC'
var googleSubpath

/**
 * Test Suites
 */
describe('<Unit Test>', function() {
  describe('Model Uploadmanager:', function() {
    this.timeout(8000)

    before(function(done) {
      return Promise.resolve()
      .delay(2000)
      .then(function() {
        var User = mongoose.model('User')
        return User.remove({}).exec()
        .then(function() {
          return User.create(user)
        })
      }).then(function() {
        /*
         * Login this user and store the login session
         */
        return request({
          uri: config.server + '/apis/v1/auth/login',
          method: 'POST',
          body: {
            email: user.email,
            password: user.password
          },
          json: true
        })
        .spread(function(response, body) {
          console.log(response.statusCode)
          var myCookie = request.cookie(response.headers['set-cookie'][0])
          cookieJar.setCookie(myCookie, config.server)
        })
      }).then(function() {
        done()
      }).catch(function(err) {
        should.not.exist(err)
        done()
      })
    })

    describe('Method base64 to file', function() {
      it('should be able to convert base64 to image file (Base64ToImageFile)', function(done) {
        return Uploadmanager.Base64ToImageFile(googleImg)
        .then(function(d) {
          googleSubpath = d.subpath
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })

      it('should be able to convert base64 to AWS iamge and thumb (Base64ToAWSImageThumb)', function(done) {
        return Uploadmanager.Base64ToAWSImageThumb(googleImg)
        .then(function(d) {
          d.image.indexOf('amazonaws.com').should.be.above(-1)
          d.thumb.indexOf('amazonaws.com').should.be.above(-1)
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })

      it('should be able to interpret multipart uploads (/multipart-upload)', function(done) {
        return Promise.resolve()
        .then(function() {
          return request({
            uri: config.server + '/apis/v1/uploads/multipart-upload',
            formData: {
              // Pass data via Streams
              upload: fs.createReadStream(path.join(config.root, 'public', googleSubpath))
            },
            method: 'POST',
            jar: cookieJar
          })
          .spread(function(response, body) {
            body = JSON.parse(body)
            response.statusCode.should.equal(200)
            should.exist(body.subpath)
          })
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })

      it('should be able to interpret base64 uploads (/base64-upload)', function(done) {
        return Promise.resolve()
        .then(function() {
          return request({
            uri: config.server + '/apis/v1/uploads/base64-upload',
            body: {
              // Pass data via Streams
              data: googleImg
            },
            method: 'POST',
            json: true,
            jar: cookieJar
          })
          .spread(function(response, body) {
            // body = JSON.parse(body)
            response.statusCode.should.equal(200)
            should.exist(body.subpath)
          })
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })

      it('should fail to do multipart upload if you are not loggedin (/multipart-upload)', function(done) {
        return Promise.resolve()
        .then(function() {
          return request({
            uri: config.server + '/apis/v1/uploads/multipart-upload',
            formData: {
              // Pass data via Streams
              upload: fs.createReadStream(path.join(config.root, 'public', googleSubpath))
            },
            method: 'POST',
            // jar: cookieJar
          })
          .spread(function(response, body) {
            body = JSON.parse(body)
            response.statusCode.should.equal(401)
            should.not.exist(body.subpath)
          })
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })

      it('should fail to do base64 upload if you are not loggedin (/base64-upload)', function(done) {
        return Promise.resolve()
        .then(function() {
          return request({
            uri: config.server + '/apis/v1/uploads/base64-upload',
            body: {
              // Pass data via Streams
              data: googleImg
            },
            method: 'POST',
            json: true,
            // jar: cookieJar
          })
          .spread(function(response, body) {
            // body = JSON.parse(body)
            response.statusCode.should.equal(401)
            should.not.exist(body.subpath)
          })
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })

      it('should fail to do multipart upload if you are not an admin (/multipart-upload-aws)', function(done) {
        return Promise.resolve()
        .then(function() {
          return request({
            uri: config.server + '/apis/v1/uploads/multipart-upload-aws',
            formData: {
              // Pass data via Streams
              upload: fs.createReadStream(path.join(config.root, 'public', googleSubpath))
            },
            method: 'POST',
            jar: cookieJar
          })
          .spread(function(response, body) {
            body = JSON.parse(body)
            response.statusCode.should.equal(401)
            should.not.exist(body.image)
            should.not.exist(body.thumb)
          })
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })

      it('should fail to do base64 upload if you are not an admin (/base64-upload-aws)', function(done) {
        return Promise.resolve()
        .then(function() {
          return request({
            uri: config.server + '/apis/v1/uploads/base64-upload-aws',
            body: {
              // Pass data via Streams
              data: googleImg
            },
            method: 'POST',
            json: true,
            jar: cookieJar
          })
          .spread(function(response, body) {
            // body = JSON.parse(body)
            response.statusCode.should.equal(401)
            should.not.exist(body.image)
            should.not.exist(body.thumb)
          })
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })

      it('should be able to do multipart upload to AWS if you are an admin (/multipart-upload-aws)', function(done) {
        return Promise.resolve()
        .then(function() {
          var User = mongoose.model('User')
          return Promise.cast(User.update({email: user.email}, {roles: ['admin', 'user']}).exec())
        }).then(function() {
          return request({
            uri: config.server + '/apis/v1/uploads/multipart-upload-aws',
            formData: {
              // Pass data via Streams
              upload: fs.createReadStream(path.join(config.root, 'public', googleSubpath))
            },
            method: 'POST',
            jar: cookieJar
          })
          .spread(function(response, body) {
            body = JSON.parse(body)
            response.statusCode.should.equal(200)
            body.image.indexOf('amazonaws.com').should.be.above(-1)
            body.thumb.indexOf('amazonaws.com').should.be.above(-1)
          })
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })

      it('should be able to do multipart upload to AWS if you are an admin (/base64-upload-aws)', function(done) {
        return Promise.resolve()
        .then(function() {
          return request({
            uri: config.server + '/apis/v1/uploads/base64-upload-aws',
            body: {
              // Pass data via Streams
              data: googleImg
            },
            method: 'POST',
            json: true,
            jar: cookieJar
          })
          .spread(function(response, body) {
            // body = JSON.parse(body)
            response.statusCode.should.equal(200)
            body.indexOf('amazonaws.com').should.be.above(-1)
          })
        }).then(function() {
          done()
        }).catch(function(err) {
          should.not.exist(err)
          done()
        })
      })
    })

    after(function(done) {
      return Promise.resolve()
      .then(function() {

      }).then(function() {
        del(['public/*', 'public']).then(function() {})
      }).then(function() {
        done()
      }).catch(function(err) {
        console.log(err)
        should.not.exist(err)
        done()
      })
    })
  })
})
