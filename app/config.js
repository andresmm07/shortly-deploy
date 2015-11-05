var Bookshelf = require('bookshelf');
var mongoose = require('mongoose');
var path = require('path');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var host = process.env.host || '127.0.0.1';

var Schema = mongoose.Schema;

  var urlSchema = new Schema({
      url:  { type: String },
      base_url:  { type: String },
      code:  { type: String},
      title: { type: String},
      visits: { type: Number },
      date :  { type: Date, default: Date.now }
  });

  var userSchema = new Schema({
    username: { type: String },
    password: { type: String },
    date  :  { type: Date, default: Date.now }
  });  

  userSchema.methods.comparePassword = function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
      callback(isMatch);
    });
  };

  userSchema.methods.hashPassword = function() {
    var cipher = Promise.promisify(bcrypt.hash);
    return cipher(this.password, null, null).bind(this)
      .then(function(hash) {
        this.password = hash;
      });
  };

  urlSchema.methods.initialize = function(){
    var shasum = crypto.createHash('sha1');
    shasum.update(this.url);
    this.code = shasum.digest('hex').slice(0, 5);
  };

var User = mongoose.model('User', userSchema);
var Url = mongoose.model('Url', urlSchema); 
mongoose.connect('mongodb://127.0.0.1/shortly');
module.exports = { User: User, Url: Url };