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
    req.body.map(obj => {
      File.findOne({ _id: obj._id });
    });
  })
  .delete((req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /files/');
  });

module.exports = employeeFileRouter;
