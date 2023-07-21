const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (object, ...props) => {
  const newObject = {};
  Object.keys(object).forEach(key => {
    if (props.includes(key)) {
      newObject[key] = object[key];
    }
  });

  return newObject;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Execute Query
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  // Send Response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password || passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use /updateMyPassword',
        400
      )
    );
  }

  const filterBody = filterObj(req.body, 'name', 'email', 'brief');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    updatedUser,
  });
};

exports.deleteMe  = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {active: false});

  res.status(204).json({
    status: "success",
    data: null
  })
})
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No User Found with That ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    brief: req.body.brief,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const newUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //to return the update user rather than the original
    runValidators: true,
  });

  if (!newUser) {
    return next(new AppError('No User Found with That ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      newUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No Tour Found with That ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
