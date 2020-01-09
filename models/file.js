var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var File = new Schema({
  processName: {
    type: String,
    required: true
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
      },
      status: {
        type: Boolean,
        default: false,
        required: true
      },
      empID: {
        type: String,
        required: true
      },
      scannedOn: Date,
      completedOn: Date
    }
  ]
});

module.exports = mongoose.model('File', File);
