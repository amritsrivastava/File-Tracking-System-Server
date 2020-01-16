const cron = require('node-cron');
const User = require('../models/user');

exports.task = cron.schedule(
  '0-59 * * * * *',
  () => {
    User.find({ role: 'emp' })
      .lean()
      .then(resp => {
        console.log(resp);
      });
  },
  {
    scheduled: true
  }
);
