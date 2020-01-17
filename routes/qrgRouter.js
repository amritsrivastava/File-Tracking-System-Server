var express = require('express');
const bodyParse = require('body-parser');
var Process = require('../models/process');
var qrgRouter = express.Router();
qrgRouter.use(bodyParse.json());

qrgRouter.route('/process').get((req, res, next) => {
  Process.find({}, { name: 1, title: 1, _id: 0 })
    .then(
      processes => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(processes);
      },
      err => next(err)
    )
    .catch(err => next(err));
});

module.exports = qrgRouter;
