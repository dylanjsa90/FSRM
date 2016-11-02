'use strict';

const mongoose = require('mongoose');

let memberSchema = mongoose.Schema({
  name: {type: String, required: true},
  overdue: {type: Boolean, required: true, default: true},
  amountDue: Number,
  contact: {
    phone: {type: String},
    email: {type: String}
  },
  leagueId: String,
  role: {type: String, default: 'basic'},
  daysOverdue: {type: Number, default: 0}
});

module.exports = exports = mongoose.model('member', memberSchema);