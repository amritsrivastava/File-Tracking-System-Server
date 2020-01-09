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
      desc: String,
      sno: {
        type: Number,
        required: true
      }
    }
  ]
});

module.exports = mongoose.model('Process', Process);
// {
//   "title": "test",
//   "description": "description",
//   "name": "abc",
//   "steps":[
//     {
//       "title": "xyz",
//       "duration": 3,
//       "division": "pqr",
//       "sno": 99
//     }]
// }
