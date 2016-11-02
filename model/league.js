'use strict';

const mongoose = require('mongoose');
const member = require('./league_members');

let leagueSchema = mongoose.Schema({
  name: {type: String, unique: true, required: true},
  sport: {type: String, default: 'Football'},
  members: [member],
  startDate: {type: Date},
  dues: {type: Number, required: true}
});

module.exports = exports = mongoose.model('league', leagueSchema);