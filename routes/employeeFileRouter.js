var express = require('express');
const bodyParse = require('body-parser');
var File = require('../models/file');
var User = require('../models/user');
var employeeFileRouter = express.Router();
var authenticate = require('../authenticate');

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
          const fileObj = resp.files.map(file => {
            let userStep;
            file.steps.forEach(step => {
              if (JSON.stringify(step.empID) == JSON.stringify(req.user._id)) {
                userStep = step;
              }
            });
            return {
              name: file.name,
              processTitle: file.processTitle,
              step: userStep
            };
          });
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(fileObj);
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
              for (let i = 0; i < file.steps.length; i++) {
                if (
                  JSON.stringify(req.user._id) ===
                  JSON.stringify(file.steps[i].empID)
                ) {
                  file.steps[i].status = true;
                  break;
                }
              }
              File.findByIdAndUpdate(obj._id, { steps: file.steps })
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
                              status: 'Status updated successfully'
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
              break;
            }
          }
          File.findByIdAndUpdate(req.params.fileId, { steps: file.steps }).then(
            resp => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({
                status: 'File added successfully'
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
      .then(
        file => {
          for (let i = 0; i < file.steps.length; i++) {
            if (
              JSON.stringify(req.user._id) ===
              JSON.stringify(file.steps[i].empID)
            ) {
              file.steps[i].status = true;
              break;
            }
          }
          File.findByIdAndUpdate(req.params.empID, { steps: file.steps })
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
                          status: 'Status updated successfully'
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
