class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //object contains all collections
    this.queryString = queryString; //object contains key value paris to customise the query result
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];// These are special attribtues
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    {
      /*
        The code you provided appears to be part of a method or constructor in a Node.js or MongoDB application using Mongoose.

        Here's an explanation of the code:

        javascript
        Copy code
        this.query = this.query.select('-__v');
        this.query: this.query refers to the current query object being constructed or modified. It suggests that the code is part of a query builder or middleware in a MongoDB/Mongoose application.
        .select('-__v'): The .select() method is used in Mongoose to specify which fields should be included or excluded in the query results. In this case, -__v is passed as an argument to exclude the __v field from the query results.
        In Mongoose, the __v field is automatically added to documents when using the Mongoose default schema option { versionKey: true }. It represents the document version, used for optimistic concurrency control.

        By including this.query.select('-__v'), the code ensures that the __v field is excluded from the query results. This can be useful when you don't need the version field in the query results or when you want to hide it from the output for security or aesthetic reasons.
      */
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
