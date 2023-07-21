const express = require('express');
const courseController = require('./../controllers/courseController');
const router = express.Router();
const authController = require('./../controllers/authController');

router
  .route('/')
  .get(courseController.getAllCourses)
  .post(authController.protect, courseController.createCourse)
  .delete(authController.protect, courseController.deleteCourseByName)
  .patch(authController.protect, courseController.updateCourseByName);
router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(courseController.updateCourse)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    courseController.deleteCourse
  );

module.exports = router;
