/*jshint -W079 */
'use strict'

/**
 * Module dependencies.
 */
var Promise = require('bluebird')
var should = require('should')
var mongoose = require('mongoose')
var Uploadmanager = mongoose.model('Uploadmanager')
var _ = require('lodash')
var randomstring = require('randomstring')

/**
 * Globals
 */
var numRepeat = 50

/**
 * Test Suites
 */
describe('<Unit Test>', function() {
  describe('Model Uploadmanager:', function() {
    this.timeout(8000)

    before(function(done) {
      return Promise.resolve()
      .then(function() {
      
      }).then(function() {
        done()
      }).catch(function(err) {
        should.not.exist(err)
        done()
      })
    })

    describe('Method insert', function() {
      it('should be able to upload something correctly (upload)', function(done) {
        done()
      })
    })

    after(function(done) {
      return Promise.resolve()
      .then(function() {

      }).then(function() {

      }).then(function() {
        done()
      }).catch(function(err) {
        console.log(err.stack)
        should.not.exist(err)
        done()
      })
    })
  })
})
