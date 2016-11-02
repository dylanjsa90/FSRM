'use strict';

const mongoose = require('mongoose');
const league = require('./league');

let userSchema = mongoose.Schema({
  name: {type: String, required: true},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  leagues: [league]

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

module.exports = mongoose.model('User', userSchema);