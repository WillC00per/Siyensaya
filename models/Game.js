const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  grade: { type: [Number], required: true },
  gameUrl: { type: String, required: true },
  gameThumbnailUrl: { type: String, required: true }, // Added field for the game thumbnail URL
  completedBy: { type: Array, default: [] },
  createdBy: { type: String, required: true },
});


module.exports = mongoose.model('game', gameSchema);
