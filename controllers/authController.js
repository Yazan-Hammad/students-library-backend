const crypto = require('crypto');
{
  /*
    In the context of Node.js, the "crypto" package is a built-in module that provides cryptographic functionality. It allows you to perform various cryptographic operations
  */
}
const { promisify } = require('util');
{
  /*
     The promisify function in the 'util' module is a powerful tool for working with asynchronous JavaScript code in a more readable and manageable way. It allows you to convert functions that follow the traditional error-first callback style into functions that return Promises.

    The typical callback style in JavaScript involves passing a function as a callback to another function. The callback function is called when the asynchronous operation completes, receiving an error (if any) as the first argument and the result as the subsequent arguments. Here's an example of a function that follows the callback style:

    function readFile(path, callback) {
    // Asynchronous operation to read a file
    // ...
    if (error) {
      callback(error); // Error occurred, call the callback with the error
    } else {
      callback(null, data); // Operation completed successfully, call the callback with the data
    }
  }

    In line 114, the promisify function is used to convert the function, which follows the callback style, into a Promise-based function. Now, instead of passing a callback to readFile, you can call readFilePromise and handle the result using then and catch methods on the returned Promise.

    Using promisify, you can convert other asynchronous functions that follow the callback pattern into Promises, making it easier to work with asynchronous operations in JavaScript and allowing you to take advantage of features like async/await syntax for more readable code.
    */
}
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // it disable browser form editing the cookie
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    brief: req.body.brief,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    /*
      The .iat property in decoded.iat stands for "issued at," and it represents the timestamp when the JWT was issued. It is a standard claim in the JWT specification and is used to determine the age or freshness of the token.
    */
    
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  /*
    A password reset token is a randomly generated unique code or token that is used to verify the identity of a user who wants to reset their password. It is a temporary credential provided to the user to authenticate their request for a password change or reset.

    When a user initiates a password reset process, typically by clicking on a "Forgot Password" link or button, the system generates a password reset token. This token is then sent to the user through a secure communication channel, such as email or SMS. The user is instructed to enter the token on a password reset page or provide it as part of the password reset flow.

    The password reset token serves two primary purposes:

    Identity verification: By requiring the user to provide the token, it ensures that the person attempting to reset the password is the legitimate owner of the account. It adds an extra layer of security and prevents unauthorized access to user accounts.

    Authorization and password reset: Once the user provides the correct token, they are granted temporary authorization to change their password. They are usually redirected to a password reset page where they can enter a new password of their choice.

    The password reset token is typically time-limited, meaning it has an expiration time. This ensures that the token is only valid for a specific duration, enhancing security by preventing its misuse if intercepted or obtained by unauthorized parties.

    It's worth noting that the exact implementation of password reset tokens may vary depending on the system or application. Some systems may use random strings as tokens, while others may encrypt or hash the token before sending it to the user. Additionally, additional security measures such as rate limiting or captcha challenges may be applied to protect against abuse or automated attacks.
  */
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password?\n Plese copy this key and paste it in the input key,\n\nKey:\n${resetToken}\n\n\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(err.message, '💥');

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 3) Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  // 1) Get user from collection
  const user = await User.findById(id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  /*
    In Mongoose and Node.js, the decision to use await user.save() instead of User.findByIdAndUpdate() depends on the specific requirements and context of your application. Let's explore the differences between these two approaches:

    await user.save(): This approach is used when you have an existing user instance and you want to save any changes made to that instance. When you call user.save(), Mongoose will persist the changes to the database.

    User.findByIdAndUpdate(): This method is used when you want to update a document directly in the database without retrieving the document first. It is a convenient way to update a document based on its unique identifier (_id) without loading the entire document into memory.

    The choice between these two approaches depends on factors such as:

    a) Need for document validation: If your Mongoose schema has defined validation rules (e.g., required fields, data type constraints), calling await user.save() will trigger the validation process. If any validation errors occur, the save operation will fail, and you can handle the errors appropriately. On the other hand, User.findByIdAndUpdate() does not trigger validation by default, so you won't have the benefit of validation checks unless you explicitly enable them.

    b) Document-level operations: When you use await user.save(), you can perform additional operations on the user instance before saving it. For example, you can modify other fields, invoke instance methods, or apply middleware hooks defined in your schema. User.findByIdAndUpdate() does not provide the same level of flexibility since it operates at the database level, bypassing the Mongoose middleware and instance methods.

    c) Performance considerations: If you only need to update a specific field or a limited set of fields in a document, using User.findByIdAndUpdate() can be more efficient. It reduces the amount of data transfer between the application and the database by only sending the modified fields. In contrast, await user.save() will send the entire document, potentially causing more network overhead.

    In summary, if you have an existing user instance and want to save changes while leveraging document validation and additional operations, await user.save() is a suitable choice. However, if you only need to update specific fields and don't require document-level operations or validation, User.findByIdAndUpdate() can be more efficient. Consider your specific requirements and trade-offs to determine the appropriate approach in your application.
  */

  // User.findByIdAndUpdate will NOT work as intended!
  // Dont use Update with any thing related to passwords

  // 4) Log user in, send JWT
  createSendToken(user, 201, res);
});
