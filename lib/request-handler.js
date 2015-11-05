var request = require('request');
var util = require('../lib/utility');
var Promise = require('bluebird');

var db = require('../app/config');
var User = require('../app/config').User;
var Link = require('../app/config').Url;

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err, links){
    if(err) return console.error("Error fetching links", err);
    res.send(200, links)
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find({url: uri}, function(err, links){
    if(err) return console.error("Error finding link", err);
    if(links.length > 0){
      return res.send(200, links);
    }else{
      util.getUrlTitle(uri, function(err, title){
        if(err){
          console.error("Error reading url heading: ", err);
          return res.send(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });
        newLink.initialize();
        newLink.save(function(err, link){
          if(err) return console.error("Error saving link: ", err);
          res.send(200, link);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({username: username}, function(err, users){
    if(users.length === 0){
      res.redirect('/login');
    }else{
      users[0].comparePassword(password, function(match){
        if(match) {
          util.createSession(req, res, users[0]);
        }else{
          res.redirect('login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({username:username}, function(err, users){
    if(err) console.error("Error signing up", err);
    if(users.length === 0){
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.hashPassword().then(function(){;
        newUser.save(function(err, user){
          if(err) return console.error("Error saving user: ", err);
          util.createSession(req,res, user);
        });
      });
    }else{
      console.log("account already exists");
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  Link.find({code: req.params[0]}, function(err,links){
    if(err) return console.error("Error nav to link", err);
    if(links.length === 0) {
      res.redirect('/');
    }else{
      links[0].visits = links[0].visits+1;
      links[0].save(function(err, link){
        return res.redirect(links[0].url);
      });
    }
  });

  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};