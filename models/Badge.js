const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the badge
const badgeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Trim any leading/trailing spaces
  },
  criteria: {
    type: String,
    required: true,
    enum: ['quiz', 'lesson', 'game'], // Restrict criteria to specific values
  },
  grade: {
    type: Number,
    required: true,
    min: 1, // Minimum grade value is 1
    max: 12, // Maximum grade value is 12
  },
  conditions: {
    quizzesCompleted: { type: Number, default: 0 }, // Quizzes required to earn the badge
    minimumScore: { type: Number, default: 0 },     // Minimum score required for quizzes
    lessonsCompleted: { type: Number, default: 0 }, // Lessons required to earn the badge
    gameProgress: { type: Number, default: 0 },     // Game progress required for the badge
  },
  imageUrl: {
    type: String, // URL or path to the uploaded image file
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
});

// Create and export the Badge model
const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;
