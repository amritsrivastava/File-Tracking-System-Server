var express = require('express');
const bodyParse = require('body-parser');
var Employee = require('../models/user');
var employeeRouter = express.Router();

employeeRouter.use(bodyParse.json());
employeeRouter
  .route('/')
  .get((req, res, next) => {
    Employee.find()
      .then(
        employees => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(employees);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /employees/');
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /employees/');
  })
  .delete((req, res, next) => {
    Employee.remove({})
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

employeeRouter
  .route('/:empID')
  .get((req, res, next) => {
    Employee.findById(req.param.empID)
      .then(
        employee => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(employee);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(
      'POST operation not supported on /employees/' + req.params.commentId
    );
  })
  .put((req, res, next) => {
    Employee.findById(req.params.empID)
      .then(
        employee => {
          if (employee != null) {
            Process.findByIdAndUpdate(
              req.params.empID,
              {
                $set: req.body
              },
              { new: true }
            ).then(
              employee => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(employee);
              },
              err => next(err)
            );
          } else {
            err = new Error('Employee ' + req.params.empID + ' not found');
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    Employee.findByIdAndRemove(req.params.empID)
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = employeeRouter;
