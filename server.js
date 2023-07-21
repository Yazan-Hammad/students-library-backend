const mongoose = require('mongoose'); //TODO
{
  // Mongoose is an Object-Data Mapping (ODM) library for Node.js, designed to work with MongoDB, a popular NoSQL database. It provides a simple and intuitive way to interact with MongoDB, allowing you to define schemas, models, and perform various operations on the database.
}
const dotenv = require('dotenv');
{
  // dotenv is a popular Node.js library that simplifies the process of managing environment variables in your Node.js applications. Environment variables are key-value pairs that contain configuration information and sensitive data such as API keys, database credentials, and other settings specific to your application.
  // When you develop a Node.js application, you often need to store and access these environment variables. dotenv allows you to define these variables in a special file called .env and loads them into the process.env object, which is accessible throughout your application.
}

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
{
  // The provided code sets up an event listener for the 'uncaughtException' event in a Node.js application. The 'uncaughtException' event is emitted when an unhandled error occurs in the application.
  
  // process.on('uncaughtException', (err) => { ... }): This line sets up an event listener for the 'uncaughtException' event emitted by the Node.js process object (process). It takes a callback function as the second argument, which will be executed when the 'uncaughtException' event occurs.
  // (err) => { ... }: This is the callback function that will be called when an uncaught exception occurs. It takes the err parameter, which represents the error object thrown during the unhandled exception.
  // console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');: This line logs a message indicating that an uncaught exception occurred. It serves as a notification that an error was thrown and the application is shutting down.
  // console.log(err.name, err.message);: This line logs the name and message of the error object (err). This information helps in identifying the type and reason for the unhandled exception.
  // process.exit(1);: This line terminates the Node.js process with an exit code of 1. By calling process.exit(), the application forcefully stops execution, preventing it from continuing after the unhandled exception.
  // In summary, the code sets up an event listener to capture unhandled exceptions in a Node.js application. When an uncaught exception occurs, it logs a message and the error details, and then terminates the application. This is a common practice to catch and handle unhandled exceptions gracefully, rather than allowing the application to crash unexpectedly.
}

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));
{
  //   The provided code establishes a connection to a MongoDB database using Mongoose, an Object-Data Mapping (ODM) library for Node.js.
  // Here's a breakdown of what the code does:
  // mongoose.connect(DB, { ... }): This line initiates the connection to the MongoDB database specified by the DB variable. The DB variable should contain the connection string or URL of the MongoDB database.
  // The object passed as the second argument to the connect method is an options object that configures the connection. The options used in this code snippet are:
  // useNewUrlParser: true: This option enables the new MongoDB connection string parser. It is used to handle the deprecation warning for the old URL parser.
  // useCreateIndex: true: This option enables Mongoose to use the MongoDB driver's createIndex() function instead of the deprecated ensureIndex() function when creating indexes.
  // useFindAndModify: false: This option disables the use of the deprecated findOneAndUpdate() and findOneAndDelete() functions in favor of the MongoDB driver's updateOne(), updateMany(), deleteOne(), and deleteMany() functions.
  // .then(() => console.log('DB connection successful!')): This code attaches a callback function to the promise returned by the connect method. The callback function will be executed when the database connection is established successfully. In this case, it logs the message "DB connection successful!" to the console.
  // Overall, the code connects to a MongoDB database using Mongoose, configures the connection with specific options, and logs a success message when the connection is established.
  // 2.1. useNewUrlParser: true: This option enables the new MongoDB connection string parser provided by the MongoDB driver. In previous versions of MongoDB, the connection string parser was deprecated, and a new parser was introduced to address certain parsing-related issues and improvements.
  // By setting useNewUrlParser to true, Mongoose instructs the MongoDB driver to use the new connection string parser. This ensures that your application uses the latest and recommended parsing behavior for MongoDB connection strings. It helps prevent any potential issues or deprecation warnings related to the old parser.
  // The new connection string parser handles various connection string formats, including the latest features introduced in MongoDB. It allows you to utilize connection string options, such as specifying the authentication database, replica set name, read preference, and more, in a standardized and reliable manner.
  // By including useNewUrlParser: true in the Mongoose connection options, you ensure that your application benefits from the improvements and advancements in the MongoDB connection string parsing mechanism. It helps maintain compatibility and future-proof your code as MongoDB continues to evolve.
  // 2.2. useCreateIndex: true: This option enables Mongoose to use the createIndex() function provided by the MongoDB driver when creating indexes for your database collections.
  // In MongoDB, indexes improve query performance by allowing the database to quickly locate and retrieve specific documents based on the indexed fields. In previous versions of Mongoose, the ensureIndex() function was used to create indexes. However, this function has been deprecated in favor of the createIndex() function provided by the MongoDB driver.
  // By setting useCreateIndex to true in the Mongoose connection options, you instruct Mongoose to use the createIndex() function when creating indexes for your collections. This ensures that your application utilizes the recommended method for index creation and avoids any potential deprecation warnings related to the older ensureIndex() function.
  // Using the createIndex() function aligns Mongoose with the latest practices and enhancements in the MongoDB driver. It allows you to take advantage of any performance improvements or optimizations introduced in the newer index creation process.
  // Enabling useCreateIndex: true in your Mongoose connection options ensures that your application benefits from the most up-to-date index creation functionality, helping to improve query performance and maintain compatibility with future versions of MongoDB.
  // Overall, this option is used to enable the usage of the createIndex() function for index creation in Mongoose, ensuring compatibility with the latest MongoDB driver and best practices for index management.
  // 2.3. useFindAndModify: false: This option controls the usage of the deprecated findOneAndUpdate() and findOneAndDelete() functions in Mongoose for updating and deleting documents.
  // In earlier versions of Mongoose, the findOneAndUpdate() and findOneAndDelete() functions were commonly used for performing update and delete operations on individual documents in a MongoDB collection. However, these functions have been deprecated in favor of the MongoDB driver's updateOne(), updateMany(), deleteOne(), and deleteMany() functions.
  // By setting useFindAndModify to false in the Mongoose connection options, you disable the usage of the deprecated findOneAndUpdate() and findOneAndDelete() functions. Instead, Mongoose will utilize the recommended MongoDB driver functions for update and delete operations.
  // Disabling useFindAndModify ensures that your application aligns with the latest practices and avoids any potential issues or deprecation warnings related to the deprecated functions. It encourages the use of the updated and more efficient functions provided by the MongoDB driver.
  // Using the MongoDB driver functions directly provides better control and performance for update and delete operations. These functions offer more flexibility and granularity when updating or deleting documents, allowing you to specify conditions, use atomic updates, and handle complex operations more effectively.
  // Overall, setting useFindAndModify: false in the Mongoose connection options ensures that your application utilizes the recommended MongoDB driver functions for update and delete operations, avoiding deprecated functions and maintaining compatibility with future versions of Mongoose and MongoDB.
}

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
{
  /*
  The provided code starts a server and listens for incoming HTTP requests on a specified port. Here's a breakdown of what the code does:

  const server = app.listen(port, () => { ... }): This line starts an HTTP server using the app object. The app object represents your Express application that has been previously configured and set up.

  port: This variable represents the port number on which the server will listen for incoming requests. The value of port should be a valid port number, such as 3000 or 8080. It determines the network interface through which the server will accept connections.

  By executing this code, your Node.js application creates an HTTP server using the Express framework and starts listening for incoming requests on the specified port. Once the server starts successfully, the console will display a message indicating the port on which the server is running. The server will continue to run until it is explicitly stopped or the process is terminated. 
  */
}

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
{
  /*
    In Node.js, both uncaughtException and unhandledRejection are related to error handling, but they handle different types of errors. Here's the difference between the two:

    uncaughtException: This event is emitted when an exception is thrown but not caught anywhere in the application. It represents an unhandled synchronous error. When an uncaught exception occurs, Node.js emits the uncaughtException event, and if there is no listener for this event, the default behavior is to print the error stack trace and terminate the process. By attaching a listener to this event, you can catch the unhandled exception and perform custom error handling or cleanup tasks before the process terminates.

    It's important to note that uncaughtException is considered a fallback mechanism and should not be relied upon as the primary error handling strategy. It's recommended to fix the underlying issues that cause unhandled exceptions rather than relying on this event.

    unhandledRejection: This event is emitted when a Promise is rejected but no .catch() or catch() handler is attached to handle the rejection. It represents an unhandled asynchronous error. When an unhandled promise rejection occurs, Node.js emits the unhandledRejection event, and if there is no listener for this event, it will result in a default behavior similar to an uncaught exception, printing the error stack trace and terminating the process. By attaching a listener to this event, you can catch the unhandled promise rejection and perform custom error handling or logging.

    Handling unhandledRejection events allows you to catch and handle errors that occur during asynchronous operations, particularly with Promises. It's recommended to attach .catch() or catch() handlers to promises or use async/await error handling to prevent unhandled promise rejections.

    To summarize, uncaughtException handles uncaught synchronous errors, while unhandledRejection handles unhandled asynchronous promise rejections. Both events provide an opportunity to catch and handle errors before the process terminates, allowing you to perform custom error handling, logging, or cleanup tasks. However, it's generally preferable to handle exceptions and rejections explicitly within the code using proper error handling mechanisms rather than relying solely on these events.
  */
}
