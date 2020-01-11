var express = require('express');
const bodyParse = require('body-parser');
var Employee = require('../models/user');
const authenticate = require('../authenticate');
var employeeRouter = express.Router();

employeeRouter.use(bodyParse.json());
employeeRouter.use(authenticate.verifyUser);

employeeRouter
  .route('/')
  .get(authenticate.verifyAdmin, (req, res, next) => {
    Employee.find({ isVerified: true, role: { $in: ['emp', 'qrg'] } })
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
  .delete(authenticate.verifyAdmin, (req, res, next) => {
    Employee.remove({ role: { $in: ['emp', 'qrg'] } })
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
    Employee.findById(req.params.empID)
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
  .put(
    authenticate.verifyEmpAndQrg,
    authenticate.verifyEmpID,
    (req, res, next) => {
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
    }
  )
  .delete(
    authenticate.verifyEmpAndQrg,
    authenticate.verifyEmpID,
    (req, res, next) => {
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
    }
  );

module.exports = employeeRouter;
