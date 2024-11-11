const Lesson = require('../models/Lesson');
const Student = require('../models/Student');

// Mark a lesson as viewed by a student
const markLessonAsViewed = async (req, res) => {
    try {
        const { lessonId, studentId } = req.body;

        // Fetch the student by their ID
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if the lesson is already marked as viewed in lessonsProgress
        const lessonProgress = student.lessonsProgress.find(
            (progress) => progress.lesson.toString() === lessonId
        );

        if (lessonProgress) {
            // If the lesson has already been viewed, just update the lastAccessed time
            lessonProgress.watchedVideo = true; // Update based on your needs
            lessonProgress.lastAccessed = Date.now();
        } else {
            // If not, add a new lesson progress entry
            student.lessonsProgress.push({
                lesson: lessonId,
                watchedVideo: true,
                lastAccessed: Date.now(),
            });
        }

        await student.save();
        return res.status(200).json({ message: 'Lesson marked as viewed' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get list of students who viewed a specific lesson
const getStudentsWhoViewedLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;

        // Find all students who have viewed the lesson in their lessonsProgress
        const students = await Student.find({
            'lessonsProgress.lesson': lessonId,
            'lessonsProgress.watchedVideo': true, // or adjust based on what you are tracking
        }).select('fullName email');

        return res.status(200).json(students); // Send back the list of students
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all lessons along with the number of students who viewed them (for teacher)
const getAllLessonsWithStudentViews = async (req, res) => {
    try {
        // Fetch all lessons
        const lessons = await Lesson.find();

        // Fetch students with lesson view progress for each lesson
        const lessonData = await Promise.all(
            lessons.map(async (lesson) => {
                // Get students who viewed this lesson
                const studentsViewed = await Student.find({
                    'lessonsProgress.lesson': lesson._id,
                    'lessonsProgress.watchedVideo': true, // adjust based on tracking
                }).select('fullName');

                return {
                    _id: lesson._id,
                    title: lesson.title,
                    description: lesson.description,
                    studentCount: studentsViewed.length,
                    studentsViewed, // List of students who viewed the lesson
                };
            })
        );

        return res.status(200).json(lessonData);
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    markLessonAsViewed,
    getStudentsWhoViewedLesson,
    getAllLessonsWithStudentViews, // Add the teacher view function here
};
