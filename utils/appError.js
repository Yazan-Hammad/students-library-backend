class AppError extends Error {
	constructor(message, statusCode) {
		super(message);

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4')? 'fail': 'error';
		this.isOperational = true;
		

		Error.captureStackTrace(this, this.constructor);
		{
      /*
				The code you provided is a line used in JavaScript or TypeScript to capture the current stack trace when an error occurs. It is typically used in custom error classes to include the stack trace information when creating an instance of the error.

				Here's a breakdown of the code:

				javascript
				Copy code
				Error.captureStackTrace(this, this.constructor);
				Error: Error is the built-in JavaScript error object that represents an error condition.
				captureStackTrace: captureStackTrace is a method available on the Error object that captures the current stack trace.
				this: this refers to the instance of the custom error class in which this line of code is being executed.
				this.constructor: this.constructor refers to the constructor function of the custom error class. It is used to associate the stack trace with the constructor function itself.
				By calling Error.captureStackTrace(this, this.constructor), the stack trace will be captured and associated with the current instance of the custom error class. This allows the error object to retain the stack trace information when it is thrown or logged, providing helpful debugging information to locate the source of the error.

				Note that captureStackTrace is available in modern JavaScript environments and may not be supported in all older or specialized JavaScript runtime environments. It is commonly used in Node.js and modern browsers.
			*/
    }
	}
}

module.exports = AppError;