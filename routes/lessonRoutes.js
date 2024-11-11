// Import required modules
const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine destination based on file type
        if (file.mimetype.startsWith('video/')) {
            cb(null, 'uploads/videos/');
        } else if (file.mimetype.startsWith('application/') || file.mimetype.startsWith('image/')) {
            cb(null, 'uploads/presentations/'); // Create a new folder for presentations
        } else {
            cb(new Error('File type not supported'), false);
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save with timestamp
    },
});

const upload = multer({ storage });


// Helper function to validate grade
const isValidGrade = (grade) => grade >= 1 && grade <= 12;

// Middleware for logging requests
router.use((req, res, next) => {
    console.log(`Received request for: ${req.originalUrl}`);
    next();
});

// Fetch all lessons with the count of students who viewed them for the teacher
router.get('/lessons/teacher-lessons', async (req, res) => {
    try {
        const lessons = await Lesson.find().populate({
            path: 'studentsViewed',
            select: 'fullName email'
        });

        const lessonData = lessons.map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            grade: lesson.grade,
            studentCount: lesson.studentsViewed.length,
            studentsViewed: lesson.studentsViewed
        }));

        res.status(200).json(lessonData);
    } catch (error) {
        console.error('Error fetching lessons for teacher:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Create a new lesson
// Create a new lesson
router.post('/lessons', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'presentation', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, description, youtubeLink, grade } = req.body;

        console.log('Received lesson data:', req.body);

        // Ensure grade is provided and valid
        if (!isValidGrade(grade)) {
            return res.status(400).json({ error: 'Grade must be between 1 and 12' });
        }

        // Save file paths if uploaded
        const video = req.files['video'] ? `/uploads/videos/${req.files['video'][0].filename}` : null;
        const presentation = req.files['presentation'] ? `/uploads/presentations/${req.files['presentation'][0].filename}` : null;

        // Validate YouTube link if provided
        let youtubeThumbnail = null;
        const isValidYouTubeLink = youtubeLink && youtubeLink.includes('youtube.com');
        if (isValidYouTubeLink) {
            const videoId = youtubeLink.split('v=')[1];
            youtubeThumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        }

        // Create and save the lesson
        const lesson = new Lesson({
            title,
            description,
            grade,
            video,
            presentation, // Add presentation file path
            youtubeLink: isValidYouTubeLink ? youtubeLink : null,
            youtubeThumbnail,
            studentsViewed: []
        });

        await lesson.save();
        console.log('Lesson saved to database:', lesson);
        res.status(201).json(lesson);
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ error: 'Error creating lesson' });
    }
});


// Edit an existing lesson
router.put('/lessons/:lessonId', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'presentation', maxCount: 1 }]), async (req, res) => {
    const { title, description, youtubeLink, grade } = req.body;
    const lessonId = req.params.lessonId;

    if (!isValidGrade(grade)) {
        return res.status(400).json({ error: 'Grade must be between 1 and 12' });
    }

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        // Update lesson details
        lesson.title = title || lesson.title;
        lesson.description = description || lesson.description;
        lesson.grade = grade || lesson.grade;

        // Check if new files are uploaded
        if (req.files['video']) {
            lesson.video = `/uploads/videos/${req.files['video'][0].filename}`;
        }
        if (req.files['presentation']) {
            lesson.presentation = `/uploads/presentations/${req.files['presentation'][0].filename}`;
        }

        if (youtubeLink && youtubeLink.includes('youtube.com')) {
            const videoId = youtubeLink.split('v=')[1];
            lesson.youtubeLink = youtubeLink;
            lesson.youtubeThumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        }

        await lesson.save();
        res.status(200).json(lesson);
    } catch (error) {
        console.error('Error editing lesson:', error);
        res.status(500).json({ error: 'Error editing lesson' });
    }
});




// Fetch a list of lessons by grade
router.get('/lessons/grade/:grade', async (req, res) => {
    const grade = Number(req.params.grade);
    
    if (!isValidGrade(grade)) {
        return res.status(400).json({ error: 'Invalid grade parameter. Must be between 1 and 12.' });
    }

    try {
        const lessons = await Lesson.find({ grade });
        if (lessons.length === 0) {
            return res.status(404).json({ error: 'No lessons found for this grade.' });
        }

        res.status(200).json(lessons);
    } catch (error) {
        console.error('Error fetching lessons by grade:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch details of a specific lesson by lessonId (ObjectId)
router.get('/lessons/:lessonId', async (req, res) => {
    const lessonId = req.params.lessonId;

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        res.status(200).json(lesson);
    } catch (error) {
        console.error('Error fetching lesson details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track lesson view by student
// Track lesson view by student
router.post('/lessons/:lessonId/view', async (req, res) => {
    const { studentId } = req.body;
    const lessonId = req.params.lessonId;

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        // Check if the student has already viewed the lesson
        if (!lesson.studentsViewed.includes(studentId)) {
            lesson.studentsViewed.push(studentId);
            await lesson.save();
        }

        res.status(200).json({ message: 'Lesson viewed successfully' });
    } catch (error) {
        console.error('Error tracking lesson view:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Fetch all lessons a student has viewed
router.get('/students/:studentId/lessons-viewed', async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const lessons = await Lesson.find({ studentsViewed: studentId });
        res.status(200).json(lessons);
    } catch (error) {
        console.error('Error fetching viewed lessons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to mark a lesson as viewed
router.post('/mark-viewed', async (req, res) => {
    const { lessonId, studentId } = req.body;

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        if (!lesson.studentsViewed.includes(studentId)) {
            lesson.studentsViewed.push(studentId);
            await lesson.save();
        }

        res.status(200).json({ message: 'Lesson marked as viewed' });
    } catch (error) {
        console.error('Error marking lesson as viewed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get students who viewed a lesson
router.get('/lessons/:lessonId/viewed-students', async (req, res) => {
    const lessonId = req.params.lessonId;

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        res.status(200).json(lesson.studentsViewed);
    } catch (error) {
        console.error('Error fetching viewed students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all lessons with the count of students who viewed them for the teacher
// Route to get all lessons with the count and details of students who viewed them for the teacher




module.exports = router;
