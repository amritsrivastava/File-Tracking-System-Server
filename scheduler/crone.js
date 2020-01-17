const cron = require('node-cron');
const User = require('../models/user');
const File = require('../models/file');
const dateMath = require('date-arithmetic');

exports.task = cron.schedule(
  '* * * * * *',
  () => {
    File.find({ status: false, isProcessStarted: true })
      .lean()
      .then(files => {
        files.forEach(file => {
          for (let i = 0; i < file.steps.length; i++) {
            if (file.steps[i].status === false) {
              if (file.steps[i].scannedOn == null) {
                if (
                  dateMath.lte(
                    dateMath.add(file.steps[i - 1].completedOn, 2, 'day'),
                    new Date().toISOString,
                    // '2020-01-22T06:19:42.509+00:00',
                    'day'
                  )
                ) {
                  console.log(
                    'Your file not reached at the next step',
                    file._id,
                    file.steps[i - 1].empID
                  );
                }
              } else {
                if (
                  dateMath.eq(
                    dateMath.add(new Date().toISOString, 1, 'day'),
                    // dateMath.add('2020-01-19T06:19:42.509+00:00', 1, 'day'),
                    file.steps[i].deadline,
                    'day'
                  )
                ) {
                  console.log('Tomorrow is your deadline');
                } else if (
                  dateMath.gt(
                    new Date().toISOString,
                    // '2020-01-22T06:19:42.509+00:00',
                    file.steps[i].deadline,
                    'day'
                  )
                ) {
                  console.log('You crossed your deadline');
                }
              }
            }
          }
        });
      });
  },
  {
    scheduled: true
  }
);
