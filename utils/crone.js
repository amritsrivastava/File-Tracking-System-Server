const cron = require('node-cron');
const User = require('../models/user');
const File = require('../models/file');
const Mailer = require('./nodemailer');
const dateMath = require('date-arithmetic');

exports.task = cron.schedule(
  '0 0 11 * * *',
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
                    // '2020-01-24T06:19:42.509+00:00',
                    'day'
                  )
                ) {
                  User.findOne(file.steps[i - 1].empID)
                    .lean()
                    .then(emp => {
                      Mailer({
                        to: emp.email,
                        subject: `Your file ${file.name} not reached at the next step`,
                        text: `Your file named ${file.name} with file id ${file._id} does not reached to ${file.steps[i].division} division`
                      });
                    });
                }
              } else {
                if (
                  dateMath.eq(
                    dateMath.add(new Date().toISOString(), 1, 'day'),
                    // dateMath.add('2020-01-19T06:19:42.509+00:00', 1, 'day'),
                    file.steps[i].deadline,
                    'day'
                  )
                ) {
                  User.findOne(file.steps[i].empID)
                    .lean()
                    .then(emp => {
                      Mailer({
                        to: emp.email,
                        subject: `Tomorrow is the deadline of you file named ${file.name}`,
                        text: `Kindly complete the work of your file named ${file.name} with file id ${file._id} by tomorrow`
                      });
                    });
                } else if (
                  dateMath.gt(
                    new Date().toISOString(),
                    // '2020-01-22T06:19:42.509+00:00',
                    file.steps[i].deadline,
                    'day'
                  )
                ) {
                  User.findOne(file.steps[i].empID)
                    .lean()
                    .then(emp => {
                      Mailer({
                        to: emp.email,
                        subject: `Alert: Deadline crossed`,
                        text: `You have crossed your deadline, kindly complete the work of the file named ${file.name} with file id ${file._id}.`
                      });
                    });
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
