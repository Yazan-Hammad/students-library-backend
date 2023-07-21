const mongoose = require('mongoose');
const axios = require('axios');
const slugify = require('slugify');
const validator = require('validator');

const isWorking = async function (value) {
  if (value === 'Not-Available') {
    return true;
  }
  try {
    const response = await axios.head(value);
    return response.status === 200; // URL is valid if the response status is 200 (OK)
  } catch (error) {
    console.log(value, 'HERE THE ERROR🚗');
    return false; // URL is invalid if an error occurs or the response status is not 200
  }
};

const courseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'A course must have ID'],
    unique: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^[0-9]+$/.test(value);
      },
      message: 'ID must contain only numbers.',
    },
  },
  slug: String,
  name: {
    type: String,
    required: [true, 'A course must have a name'],
    unique: true,
    validate: {
      validator: function (value) {
        return /^[A-Za-z\s]+$/.test(value);
      },
      message: 'Name can only contain alphabetic characters and spaces',
    },
  },
  department: {
    type: String,
    required: [true, 'A course must have a department'],
    trim: true,
    validate: {
      validator: function (value) {
        const validValues = ['cs', 'sw', 'cis', 'bit'];
        return validValues.includes(value.toLowerCase());
      },
      message: 'Departments is either: CS, SW, CIS, or BIT',
    },
  },
  image: {
    type: String,
    unique: true,
  },
  book: {
    type: String,
    unique: true,
    validate: {
      validator: isWorking,
      message: 'Entered Book URL is invalid or inaccessible.',
    },
  },
  videos: {
    type: String,
    unique: true,
    validate: {
      validator: isWorking,
      message: 'Entered Videos URL is invalid or inaccessible.',
    },
  },
});

//  Document Middleware
//  We can have multilple middlewares[pre, post]
//  But if we make more than one, we have to use next();
courseSchema.pre('save', function (next) { //This function executed before the document be saved to the database
  this.slug = slugify(this.name, {lower: true});
  next();
});

//  Aggregation Middleware
courseSchema.pre('aggregate', function () {
  console.log(this);
  next();
})

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
