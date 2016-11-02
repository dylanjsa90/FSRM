'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const User = require('../model/user');
const BasicHttp = require('../lib/basic_http');
const jwtAuth = require('../lib/jwt_auth');
const authorization = require('../lib/authorization');

let authRouter = module.exports = exports = Router();

authRouter.post('/signup', jsonParser, (req, res, next) => {
  if (!req.body.username || !req.body.password || req.body.username === undefined || req.body.password === undefined) {
    return next(createError(400, 'Username and password are required'));
  }
  User.find({'username': req.body.username}, function(err, user) {
    if (err) return err;

    if(user.length !== 0) {
      if (user[0].username) {
        console.log('Username already exists');
        return next(createError(310, 'Error'));
      }
    }
  });

  let newUser = new User();
  newUser.username = req.body.username;
  newUser.password = req.body.password;
  newUser.name = req.body.name;

  newUser.generateHash(req.body.password).then((tokenData) => {
    newUser.save().then(() => {
      console.log(tokenData);
      res.json(tokenData);
    }, err => {
      createError(400, 'Bad Request');
    });
  }, createError(500, 'Server Error'));
});

authRouter.get('/signin', BasicHttp, (req, res, next) => {
  User.findOne({'username': req.auth.username}, (err, user) => {
    if (!user || err) return next(createError(401, 'Bad Auth'));
    user.comparePassword(req.auth.password).then(res.json.bind(res)).catch((err) => {
      next(err);
    });
  });
});

// Authorization/role edit route, currently not in our mvp I believe
authRouter.put('/editrole/:userid', jsonParser, jwtAuth, authorization(), (req, res, next) => {
  User.update({_id: req.params.userid}, {$set: {role: req.body.role}}).then(res.json.bind(res), createError(500, 'Server Error'));
});

// For admin to see all users
authRouter.get('/users', jsonParser, jwtAuth, authorization(), (req, res, next) => {
  User.find().then(res.json.bind(res), createError(500, 'Server Error'));
});
