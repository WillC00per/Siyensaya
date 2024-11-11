const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  time_limit: { type: Number, required: true, min: 1 }, // Required and must be at least 1
  passing_score: { type: Number, required: true, min: 0 }, // Required and must be non-negative
  grades: { type: [Number], required: true },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
