var Bookshelf = require('bookshelf');
var mongoose = require('mongoose');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var host = process.env.host || '127.0.0.1';

//mongo URI: mongodb://MongoLab-c:cnc8Hxo5LglLCo3s5fJbbI_.8CRjQqZSa08klgCzIok-@ds048878.mongolab.com:48878/MongoLab-c

// var db = Bookshelf.initialize({
//   client: 'sqlite3',
//   connection: {
//     host: host,
//     user: 'your_database_user',
//     password: 'password',
//     database: 'shortlydb',
//     charset: 'utf8',
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   }
// });

var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/shortly');

var User;
var Url;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  var urlSchema = new Schema({
      url  :  { type: String },
      base_url   :  { type: String },
      code   :  { type: String},
      title : { type: String},
      visits : { type: Number },
      date  :  { type: Date, default: Date.now }
  });

  var userSchema = new Schema({
    username: { type: String },
    password: { type: String },
    date  :  { type: Date, default: Date.now }
  });  


  User = mongoose.model('User', userSchema);
  Url = mongoose.model('Url', urlSchema);

  
  
});

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
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
    this.on('creating', function(model, attrs, options){
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('url'));
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
};

//   comparePassword: function(attemptedPassword, callback) {
// bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//   callback(isMatch);
// });
//   },
//   hashPassword: function(){
    // var cipher = Promise.promisify(bcrypt.hash);
    // return cipher(this.get('password'), null, null).bind(this)
    //   .then(function(hash) {
    //     this.set('password', hash);
    //   });
//   }

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('base_url', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });


// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });


module.exports = {User: User, Url:Url};
