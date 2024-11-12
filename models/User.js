  const mongoose = require('mongoose');

  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'admin', 'teacher'],
      default: 'student'
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    firstName: {
      type: String,
      required: true
    },
    middleName: {
      type: String
    },
    lastName: {
      type: String,
      required: true
    },
    birthday: {
      type: Date,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    studentDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    employeeNumber: {
      type: String,
      validate: {
        validator: function (value) {
          return this.role !== 'student' || !!value;
        },
        message: 'Employee number is required for teachers and admins'
      }
    }
  }, {
    timestamps: true
  });

  const User = mongoose.model('User', userSchema);
  module.exports = User;
