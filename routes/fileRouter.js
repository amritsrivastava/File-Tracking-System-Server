var express = require('express');
const bodyParse = require('body-parser');
var File = require('../models/file');
var Process = require('../models/process');
var User = require('../models/user');
var config = require('../config');
var fileRouter = express.Router();
var authenticate = require('../authenticate');
var QRCode = require('qrcode');
var path = require('path');
const Mailer = require('../utils/nodemailer');

fileRouter.use(bodyParse.json());
fileRouter.use(authenticate.verifyUser);

fileRouter
  .route('/')
  .get((req, res, next) => {
    if (req.user.role === 'admin') {
      File.find()
        .then(files => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(files);
        })
        .catch(err => next(err));
    } else if (req.user.role === 'qrg') {
      File.find({ isProcessStarted: false })
        .then(
          files => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(files);
          },
          err => next(err)
        )
        .catch(err => next(err));
    } else {
      var err = new Error('You are not authorized to perform this operation!');
      err.status = 403;
      next(err);
    }
  })
  .post((req, res, next) => {
    if (req.body != null) {
      File.create(req.body)
        .then(
          file => {
            QRCode.toFile(
              path.join(__dirname, `../public/qr/${file._id}.png`),
              JSON.stringify({ fileId: file._id }),
              { type: 'png' },
              function(err) {
                if (err) {
                  var err = new Error('Unable to generate QR for this file!');
                  err.status = 500;
                  next(err);
                } else {
                  Process.findOne({ name: req.body.processName })
                    .lean()
                    .then(process => {
                      if (process) {
                        File.findByIdAndUpdate(file._id, {
                          qr: `${config.secureHost}public/qr/${file._id}.png`,
                          processTitle: process.title,
                          steps: process.steps
                        })
                          .then(
                            resp => {
                              User.find({
                                division: process.steps[0].division
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
                              if (resp) {
                                res.statusCode = 200;
                                res.setHeader(
                                  'Content-Type',
                                  'application/json'
                                );
                                res.json({
                                  qr: `${config.secureHost}public/qr/${resp._id}.png`,
                                  status: 'File added successfully'
                                });
                              }
                            },
                            err => next(err)
                          )
                          .catch(err => next(err));
                      } else {
                        var err = new Error(
                          'Process not found with unique process name ' +
                            req.body.processName
                        );
                        err.status = 500;
                        next(err);
                      }
                    })
                    .catch(err => next(err));
                }
              }
            );
          },
          err => next(err)
        )
        .catch(err => next(err));
    } else {
      err = new Error('File not found in request body');
      err.status = 404;
      return next(err);
    }
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /files/');
  })
  .delete((req, res, next) => {
    if (req.user.role === 'admin') {
      req.body.forEach(id => {
        File.findByIdAndRemove(id).catch(err => next(err));
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ status: 'Successfully deleted' });
    } else if (req.user.role === 'qrg') {
      req.body.forEach(id => {
        File.remove({ _id: id, isProcessStarted: false }).catch(err =>
          next(err)
        );
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ status: 'Successfully deleted' });
    } else {
      var err = new Error('You are not authorized to perform this operation!');
      err.status = 403;
      next(err);
    }
  });

fileRouter
  .route('/:fileId')
  .get((req, res, next) => {
    File.findById(req.params.fileId)
      .lean()
      .then(
        file => {
          if (req.user.role === 'admin') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(file);
          } else {
            const obj = {
              name: file.name,
              process: file.processTitle,
              steps: file.steps.map(step => ({
                title: step.title,
                division: step.division,
                status: step.status
              }))
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(obj);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /files/' + req.params.fileId);
  })
  .put((req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'qrg')
      File.update({ _id: req.params.fileId, isProcessStarted: false }, req.body)
        .then(
          file => {
            if (req.body.processName) {
              Process.findOne({ name: req.body.processName })
                .lean()
                .then(process => {
                  if (process) {
                    File.findByIdAndUpdate(req.params.fileId, {
                      steps: process.steps
                    })
                      .then(
                        file => {
                          if (req.user.role === 'admin') {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(file);
                          } else {
                            const obj = {
                              name: file.name,
                              process: file.processTitle,
                              steps: file.steps.map(step => ({
                                title: step.title,
                                division: step.division,
                                status: step.status
                              }))
                            };
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(obj);
                          }
                        },
                        err => next(err)
                      )
                      .catch(err => next(err));
                  } else {
                    var err = new Error(
                      'Process not found with unique process name ' +
                        req.body.processName
                    );
                    err.status = 500;
                    next(err);
                  }
                })
                .catch(err => next(err));
            } else {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ status: 'Updated Successfully' });
            }
          },
          err => next(err)
        )
        .catch(err => next(err));
    else {
      var err = new Error('You are not authorized to perform this operation!');
      err.status = 403;
      next(err);
    }
  })
  .delete((req, res, next) => {
    if (req.user.role === 'admin') {
      File.findByIdAndRemove(req.params.fileId)
        .then(
          resp => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ status: 'Successfully deleted' });
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
    if (req.user.role === 'qrg') {
      File.findByIdAndRemove(req.params.fileId, { isProcessStarted: false })
        .then(
          resp => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ status: 'Successfully deleted' });
          },
          err => next(err)
        )
        .catch(err => next(err));
    } else {
      var err = new Error('You are not authorized to perform this operation!');
      err.status = 403;
      next(err);
    }
  });

module.exports = fileRouter;
