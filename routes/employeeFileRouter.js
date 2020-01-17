var express = require('express');
const bodyParse = require('body-parser');
var File = require('../models/file');
var User = require('../models/user');
var employeeFileRouter = express.Router();
const dateMath = require('date-arithmetic');
var authenticate = require('../authenticate');
const Mailer = require('../utils/nodemailer');

employeeFileRouter.use(bodyParse.json());
employeeFileRouter.use(authenticate.verifyUser);

employeeFileRouter
  .route('/')
  .get((req, res, next) => {
    User.findById(req.user._id)
      .populate('files')
      .lean()
      .then(
        resp => {
          if (resp.files) {
            const fileObj = resp.files.map(file => {
              let userStep, nextStep;
              file.steps.forEach((step, i) => {
                if (
                  JSON.stringify(step.empID) == JSON.stringify(req.user._id)
                ) {
                  userStep = step;
                  if (i === file.steps.length - 1) {
                    nextStep = 'File process completed';
                  } else {
                    nextStep = file.steps[i].division;
                  }
                }
              });
              return {
                _id: file._id,
                name: file.name,
                processTitle: file.processTitle,
                step: userStep,
                nextStep
              };
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fileObj);
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json([]);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /file/employee');
  })
  .put((req, res, next) => {
    if (req.body) {
      req.body.map(obj => {
        File.findById(obj._id)
          .then(
            file => {
              let i;
              for (i = 0; i < file.steps.length; i++) {
                if (
                  file.steps[i].status === false &&
                  JSON.stringify(req.user._id) ===
                    JSON.stringify(file.steps[i].empID)
                ) {
                  file.steps[i].status = true;
                  file.steps[i].completedOn = new Date().toISOString();
                  if (i === file.steps.length - 1) {
                    file.status = true;
                    break;
                  }
                  console.log(i);
                  User.find({
                    division: file.steps[i + 1].division
                  }).then(users => {
                    if (users) {
                      users.forEach(user => {
                        Mailer({
                          to: user.email,
                          subject: `New file in your division`,
                          text: `A file named ${file.name} with file id ${file._id} is assigned to your division.`
                        });
                      });
                    }
                  });
                  break;
                }
              }
              let nextStep;
              if (i === file.steps.length - 1) {
                nextStep = 'Completed';
              } else {
                nextStep = file.steps[i + 1].division;
              }
              File.findByIdAndUpdate(obj._id, file)
                .then(
                  resp => {
                    User.findById(req.user._id)
                      .then(emp => {
                        emp.files.remove(obj._id);
                        User.findByIdAndUpdate(req.user._id, {
                          files: emp.files
                        }).then(
                          resp => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({
                              status: 'Status updated successfully',
                              nextStep
                            });
                          },
                          err => next(err)
                        );
                      })
                      .catch(err => next(err));
                  },
                  err => next(err)
                )
                .catch(err => next(err));
            },
            err => next(err)
          )
          .catch(err => next(err));
      });
    }
  })
  .delete((req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /file/employee');
  });

employeeFileRouter
  .route('/:fileId')
  .get((req, res, next) => {
    File.findById(req.params.fileId)
      .then(
        file => {
          for (let i = 0; i < file.steps.length; i++) {
            if (
              JSON.stringify(req.user._id) ===
              JSON.stringify(file.steps[i].empID)
            ) {
              const fileObj = {
                name: file.name,
                processTitle: file.processTitle,
                steps: file.steps[i]
              };
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(fileObj);
            }
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    File.findById(req.params.fileId)
      .lean()
      .then(
        file => {
          for (let i = 0; i < file.steps.length; i++) {
            if (!file.steps[i].status) {
              file.steps[i].empID = req.user._id;
              file.steps[i].scannedOn = new Date().toISOString();
              file.steps[i].deadline = dateMath.add(
                file.steps[i].scannedOn,
                file.steps[i].duration,
                'day'
              );
              break;
            }
          }
          File.findByIdAndUpdate(req.params.fileId, {
            isProcessStarted: true,
            steps: file.steps
          }).then(
            resp => {
              User.findByIdAndUpdate(req.user._id, {
                $push: { files: req.params.fileId }
              }).then(resp => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({
                  status: 'File added successfully'
                });
              });
            },
            err => next(err)
          );
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put((req, res, next) => {
    File.findById(req.params.fileId)
      .lean()
      .then(
        file => {
          let i;
          for (i = 0; i < file.steps.length; i++) {
            if (
              file.steps[i].status === false &&
              JSON.stringify(req.user._id) ===
                JSON.stringify(file.steps[i].empID)
            ) {
              file.steps[i].status = true;
              file.steps[i].completedOn = new Date().toISOString();
              if (i === file.steps.length - 1) {
                file.status = true;
                break;
              }
              console.log(i);
              User.find({
                division: file.steps[i + 1].division
              }).then(users => {
                if (users) {
                  users.forEach(user => {
                    Mailer({
                      to: user.email,
                      subject: `New file in your division`,
                      text: `A file named ${file.name} with file id ${file._id} is assigned to your division.`
                    });
                  });
                }
              });
              break;
            }
          }
          let nextStep;
          if (i === file.steps.length - 1) {
            nextStep = 'Completed';
          } else {
            nextStep = file.steps[i].division;
          }
          File.findByIdAndUpdate(req.params.fileId, {
            steps: file.steps,
            status: file.status
          })
            .then(
              resp => {
                User.findById(req.user._id)
                  .then(emp => {
                    emp.files.remove(req.params.fileId);
                    User.findByIdAndUpdate(req.user._id, {
                      files: emp.files
                    }).then(
                      resp => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({
                          status: 'Status updated successfully',
                          nextStep
                        });
                      },
                      err => next(err)
                    );
                  })
                  .catch(err => next(err));
              },
              err => next(err)
            )
            .catch(err => next(err));
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /file/employee');
  });

module.exports = employeeFileRouter;
