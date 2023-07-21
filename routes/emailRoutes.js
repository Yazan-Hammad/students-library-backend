const express = require('express');
const router = express.Router();
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');
const AppError = require('../utils/appError');

router.post(
  '/',
  catchAsync(async (req, res, next) => {
    try {
      const options = req.body;
      sendEmail(options);

      res
        .status(200)
        .json({ status: 'success', message: 'Email sent successfully' });
    } catch (error) {
      next(new AppError(error.message, 500));
    }

    next();
  })
);

module.exports = router;
