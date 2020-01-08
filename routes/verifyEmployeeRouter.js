var express = require('express');
const bodyParse = require('body-parser');
const User = require('../models/user');
var verifyEmployeeRouter = express.Router();
const authenticate = require('../authenticate');

verifyEmployeeRouter.use(bodyParse.json());
verifyEmployeeRouter.use(authenticate.verifyUser);

verifyEmployeeRouter
  .route('/')
  .get(authenticate.verifyAdmin, (req, res, next) => {
    User.find({ isVerified: false })
      .then(
        emp => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(emp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyAdmin, (req, res, next) => {
    if (req.body) {
      req.body.forEach(_id => {
        User.findByIdAndUpdate({ _id }, { isVerified: true }).catch(err =>
          next(err)
        );
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ status: 'Verified Successfully!!' });
    }
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /employee/verify');
  })
  .delete((req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /employee/verify');
  });

verifyEmployeeRouter
  .route('/:userId')
  .get((req, res, next) => {
    User.findById(req.params.userId)
      .then(
        user => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(user);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyAdmin, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { isVerified: true })
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ status: 'Verified Successfully' });
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(
      'PUT operation not supported on /employee/verify/' + req.params.userId
    );
  })
  .delete((req, res, next) => {
    res.statusCode = 403;
    res.end(
      'DELETE operation not supported on /employee/verify' + req.params.userId
    );
  });

module.exports = verifyEmployeeRouter;
