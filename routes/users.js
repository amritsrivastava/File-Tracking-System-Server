var express = require('express');
const bodyParse = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var router = express.Router();
router.use(bodyParse.json());

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, function(
  req,
  res,
  next
) {
  User.find({})
    .then(
      users => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
      },
      err => next(err)
    )
    .catch(err => next(err));
});

router.post('/signup', (req, res, next) => {
  User.register(
    new User({
      email: req.body.email,
      name: req.body.name,
      division: req.body.division
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        if (req.body.designation) user.designation = req.body.designation;
        if (req.body.contact) user.contact = req.body.contact;
        if (req.body.role === 'emp' || req.body.role === 'qrg')
          user.role = req.body.role;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });
      }
    }
  );
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: false,
        status: 'Login unsuccessful!',
        err: info
      });
    }

    req.logIn(user, err => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          success: false,
          status: 'Login unsuccessful!',
          err: 'Could not log in user!'
        });
      }
    });

    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      token,
      role: user.role,
      status: 'You are successfully logged in!'
    });
  })(req, res, next);
});

router.get(
  '/facebook/token',
  passport.authenticate('facebook-token'),
  (req, res) => {
    if (req.user) {
      var token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        token,
        status: 'You are successfully logged in!'
      });
    }
  }
);

router.get('/checkJWTToken', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-type', 'application/json');
      return res.json({ status: 'JWT invalid', success: false, err: info });
    } else {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      return res.json({ status: 'JWT valid', success: true, user });
    }
  })(req, res);
});

module.exports = router;
