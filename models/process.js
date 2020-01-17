var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Process = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  steps: [
    {
      title: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      },
      division: {
        type: String,
        required: true
      },
      desc: String
    }
  ]
});

module.exports = mongoose.model('Process', Process);
