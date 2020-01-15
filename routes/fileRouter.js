var express = require('express');
const bodyParse = require('body-parser');
var File = require('../models/file');
var fileRouter = express.Router();
var QRCode = require('qrcode');
var path = require('path');

fileRouter.use(bodyParse.json());

fileRouter
  .route('/')
  .get((req, res, next) => {
    File.find()
      .then(
        files => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(files);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    if (req.body != null) {
      File.create(req.body)
        .then(
          file => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(file);
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
    File.remove({})
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

fileRouter
  .route('/:fileId')
  .get((req, res, next) => {
    File.findById(req.params.fileId)
      .then(
        file => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(file);
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
    File.findById(req.params.fileId)
      .then(
        file => {
          if (file != null) {
            File.findByIdAndUpdate(
              req.params.fileId,
              {
                $set: req.body
              },
              { new: true }
            ).then(
              file => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(file);
              },
              err => next(err)
            );
          } else {
            err = new Error('File ' + req.params.fileId + ' not found');
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    File.findByIdAndRemove(req.params.fileId)
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

fileRouter.route('/new/qr').get((req, res, next) => {
  console.log();
  QRCode.toFile(
    path.join(__dirname, '../public/qr/image.png'),
    JSON.stringify({
      name: 'Amrit',
      _id: 'sajhfdkhakjshdfi8763928 9bn9879r8n9'
    }),
    { type: 'png' },
    function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Saved successfully');
      }
    }
  );
  return next();
});
module.exports = fileRouter;
