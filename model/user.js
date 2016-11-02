'use strict';

const mongoose = require('mongoose');
const League = require('./league');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

let userSchema = mongoose.Schema({
  name: {type: String, required: true},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  leagues: [League]

});

userSchema.methods.generateToken = function() {
  return jwt.sign({idd: this.username}, process.env.APP_SECRET);
};

userSchema.methods.generateHash = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 8, (err, data) => {
      if (err) return reject(err);
      this.password = data;
      resolve({token: this.generateToken()});
    });
  });
};

userSchema.methods.comparePassword = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, data) => {
      console.log('entered compare password');
      if (err || data === false){
        console.log('I entered this wrong password error');
        return reject(createError(401, 'Invalid username or password'));
      }
      resolve({token: this.generateToken()});
    });
  });
};

userSchema.methods.addLeague = function(data) {
  let result;
  return new Promise((resolve, reject) => {
    if (!data.name || !data.sports || !data.dues) return reject(createError(400, 'Required fields missing'));
    (new League(data)).save().then(league => {
      result = league;
      this.leagues.push(league);
      this.save();
      resolve(result);
    }, createError(404, 'Not Found'));
  });
};

userSchema.methods.removeLeague = function(leagueId) {
  return new Promise((resolve, reject) => {
    this.leagues.filter(value => {
      if (value === leagueId) return false;
      return true;
    });
    this.save().then(() => {
      return League.findByIdAndRemove(leagueId);
    }).then(league => resolve(league)).catch(reject)
  
  });
};
module.exports = mongoose.model('User', userSchema);