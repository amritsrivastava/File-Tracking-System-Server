var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  name: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    default: ''
  },
  division: {
    type: String,
    required: true
  },
  contact: {
    type: Number
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'emp'
  },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});

User.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameUnique: false
});

module.exports = mongoose.model('User', User);
