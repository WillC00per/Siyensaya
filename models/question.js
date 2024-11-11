const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true }, // Reference to the quiz
    question_text: { type: String, required: true },
    answer_options: [{ type: String, required: true }],
    correct_answer: { type: String, required: true }
});

module.exports = mongoose.model('Question', questionSchema);
