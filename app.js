const express = require('express');
{
  /*
    Express is a popular web application framework for Node.js that simplifies the process of building robust and scalable web applications. It provides a minimal and flexible set of features, allowing developers to create web servers, define routes, handle HTTP requests and responses, and manage middleware effectively.
  */
}
const morgan = require('morgan');
{
  /*
    Morgan is a popular logging middleware for Node.js and Express applications. It provides a simple way to log HTTP requests and responses, allowing you to monitor and analyze incoming and outgoing traffic in your server.

    Here are some key features and benefits of using Morgan:

    Request Logging: Morgan captures information about each incoming request, such as the HTTP method, URL, request headers, request body (if applicable), and the client's IP address. It logs this information in a configurable format, making it easier to track and analyze incoming traffic.

    Response Logging: In addition to request logging, Morgan can also log details about the server's responses, including the response status code, response headers, and response body. This helps in monitoring the server's behavior and understanding the data sent back to clients.
  */
}
const cors = require('cors');
{
  /*
    the term "CORS" stands for Cross-Origin Resource Sharing, which is a mechanism that allows web browsers to securely make requests to a different domain than the one serving the web page. It is a browser-based security feature.

    To handle CORS in a Node.js application, you typically need to configure your server to include appropriate headers in the responses. There are several middleware packages available that simplify the process of handling CORS in Node.js. One popular middleware package is "cors."

    The cors package for Node.js provides a middleware function that can be used to enable CORS in your server. It allows you to specify which origins, methods, headers, and other configurations are allowed for cross-origin requests.
  */
}
const rateLimit = require('express-rate-limit');
{
  /*
    - Distributed Denial-of-Service (DDoS) Attack

    In Node.js, the "rateLimit" middleware is used to control the rate at which requests are processed by an application. It helps protect against brute force attacks, DDoS attacks, and other forms of abuse by limiting the number of requests that can be made from a specific IP address or within a certain time frame.
  */
}
const helmet = require('helmet');
{
  /*
    In Node.js, "helmet" refers to a popular security middleware package called "helmet.js." Helmet helps secure your Express.js applications by setting various HTTP headers related to security. It provides an easy way to enhance the security of your Node.js web application by mitigating common security vulnerabilities.

    Helmet simplifies the process of setting security-related headers by providing a collection of middleware functions that you can use in your application. These middleware functions automatically add the appropriate headers to the HTTP responses.
  */
}
const mongoSanitize = require('express-mongo-sanitize'); //Quiry Injection
{
  /*
    In Node.js, "mongo-sanitize" is a middleware package that helps prevent MongoDB query injection attacks by sanitizing user input. It is commonly used with applications that interact with MongoDB databases to ensure the security and integrity of data.

    When user input is directly used in MongoDB queries without proper sanitization, it can lead to malicious attacks such as query manipulation or injection. The "mongo-sanitize" package helps mitigate these risks by removing or escaping characters that could potentially alter the structure or behavior of MongoDB queries.
  */
}
const xss = require('xss-clean'); //Cross-Site Scripting (XSS) attacks
{
  /*
    In Node.js, "xss-clean" is a middleware package that helps protect web applications from Cross-Site Scripting (XSS) attacks. XSS attacks occur when malicious users inject malicious scripts into web pages viewed by other users, allowing them to execute unauthorized code in the victim's browser.

    The "xss-clean" package provides a middleware function that sanitizes user input to prevent XSS attacks by removing or encoding potentially malicious HTML and JavaScript code. It helps ensure that user-supplied data is safe to be displayed in web pages without introducing security vulnerabilities.  
  */
}
const hpp = require('hpp');
{
  /*
    In the context of web application security in Node.js, "hpp" stands for "HTTP Parameter Pollution." HPP refers to an attack where an attacker manipulates or pollutes the HTTP parameters of a request in order to modify the behavior of the application or exploit vulnerabilities.

    HTTP Parameter Pollution attacks can occur when an application accepts multiple values for a parameter and does not properly handle or sanitize them. This can lead to unexpected behavior or security vulnerabilities.

    To mitigate HTTP Parameter Pollution attacks, the "hpp" package can be used in Node.js applications. The "hpp" package provides middleware that prevents parameter pollution by allowing only the last occurrence of a parameter or by whitelisting specific parameters.
  */
}

const AppError = require('./utils/appError');
const courseRouter = require('./routes/courseRoutes');
const userRouter = require('./routes/userRoutes');
const emailRouter = require('./routes/emailRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(
  cors({
    //origin: 'http://localhost:3000', Replace with the allowed origin(s) of your choice
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
  })
);

//	1) Global Middlewares
//  set security Http headers
app.use(helmet());

//  Develpment logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//  Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//  Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

//  Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//  Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

//  Serving Static Files
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

//	START Route	//
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/users', userRouter);
app.use('/sendemails', emailRouter);

app.all('*', (req, res, next) => {
  //  To Handle All Http Functions
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));

  // Whenever we pass an argument to the next, it will consider as Error and it will skip all middlewares in callstack and go to the middleware the handle errors
});

app.use(globalErrorHandler);

module.exports = app;
