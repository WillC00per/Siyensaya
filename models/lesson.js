const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    grade: { type: Number, required: true },
    video: { type: String }, // File path for uploaded videos
    presentation: { type: String }, // File path for uploaded presentations (PowerPoint, PDF, etc.)
    youtubeLink: { type: String }, // YouTube video link
    youtubeThumbnail: { type: String }, // Thumbnail URL for YouTube video
    studentsViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // Array to track students who viewed the lesson
}, { timestamps: true });


module.exports = mongoose.model('Lesson', lessonSchema);
