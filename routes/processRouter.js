var express = require('express');
const bodyParse = require('body-parser');
var Process = require('../models/process');
var processRouter = express.Router();
const authenticate = require('../authenticate');

processRouter.use(bodyParse.json());
processRouter.use(authenticate.verifyUser);
/* GET users listing. */
processRouter
  .route('/')
  .get(authenticate.verifyAdmin, (req, res, next) => {
    Process.find()
      .then(
        processes => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(processes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyAdmin, (req, res, next) => {
    if (req.body != null) {
      Process.create(req.body)
        .then(
          process => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(process);
          },
          err => next(err)
        )
        .catch(err => next(err));
    } else {
      err = new Error('Process not found in request body');
      err.status = 404;
      return next(err);
    }
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /processes/');
  })
  .delete(authenticate.verifyAdmin, (req, res, next) => {
    Process.remove({})
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

processRouter
  .route('/:processId')
  .get((req, res, next) => {
    Process.findById(req.params.processId)
      .then(
        process => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(process);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(
      'POST operation not supported on /processes/' + req.params.processId
    );
  })
  .put(authenticate.verifyAdmin, (req, res, next) => {
    Process.findById(req.params.processId)
      .then(
        process => {
          if (process != null) {
            Process.findByIdAndUpdate(
              req.params.processId,
              {
                $set: req.body
              },
              { new: true }
            ).then(
              process => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(process);
              },
              err => next(err)
            );
          } else {
            err = new Error('Process ' + req.params.processId + ' not found');
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyAdmin, (req, res, next) => {
    Process.findByIdAndRemove(req.params.processId)
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
module.exports = processRouter;
