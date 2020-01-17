var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var File = new Schema({
  name: {
    type: String,
    required: true
  },
  processName: {
    type: String,
    required: true
  },
  processTitle: {
    type: String,
    default: ''
  },
  qr: String,
  isProcessStarted: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: false,
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
      status: {
        type: Boolean,
        default: false,
        required: true
      },
      empID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      scannedOn: Date,
      completedOn: Date,
      deadline: Date
    }
  ]
});

module.exports = mongoose.model('File', File);
