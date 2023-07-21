const AppError = require('../utils/appError');
const Course = require('./../models/courseModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.getAllCourses = catchAsync(async (req, res, next) => {
  // Execute Query
  const features = new APIFeatures(Course.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const courses = await features.query;

  // Send Response
  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: {
      courses,
    },
  });
});

exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No Course Found with That ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});

exports.createCourse = catchAsync(async (req, res, next) => {
  const newCourse = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      course: newCourse,
    },
  });
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  const newCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //to return the update tuor rather than the original
    runValidators: true,
  });

  if (!newCourse) {
    return next(new AppError('No Course Found with That ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      newCourse,
    },
  });
});

exports.updateCourseByName = catchAsync(async (req, res, next) => {
  const {currentName, ...updatedCourse} = req.body;

  const newCourse = await Course.findOneAndUpdate(
    {name: currentName},
    updatedCourse,
    {
      new: true, //to return the update tuor rather than the original
      runValidators: true,
    }
  );

  if (!newCourse) {
    return next(new AppError('No Course Found with That Name', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      newCourse,
    },
  });
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(new AppError('No Course Found with That ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deleteCourseByName = catchAsync(async (req, res, next) => {
  const course = await Course.findOneAndDelete({name: req.body.name});

  if (!course) {
    return next(new AppError('No Course Found with That Name', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
