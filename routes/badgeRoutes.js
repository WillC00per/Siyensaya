const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // Import Student model
const Badge = require('../models/Badge'); // Import Badge model
const { badgeUpload } = require('../routes/upload'); // Import badgeUpload middleware
const { io } = require('../server'); // Import the io instance from your server file

router.get('/badges/completion-report', async (req, res) => {
    try {
        // Fetch all badges
        const badges = await Badge.find();

        // Create a report object to hold the results, keyed by both grade and badge ID
        const report = {};

        for (const badge of badges) {
            // Initialize the report entry for each badge separately by grade and badge ID
            const reportKey = `${badge.grade}-${badge._id}`;
            report[reportKey] = {
                grade: badge.grade,
                badgeName: badge.name,
                totalStudents: 0,
                studentsWithBadge: 0,
                studentsWithoutBadge: 0,
                studentsWithBadgeNames: [], // To hold names of students with badge
                studentsWithoutBadgeNames: [] // To hold names of students without badge
            };

            // Find all students in the corresponding grade
            const studentsInGrade = await Student.find({ grade: badge.grade });
            report[reportKey].totalStudents = studentsInGrade.length;

            // Separate students with and without the badge directly
            const studentsWithBadge = studentsInGrade.filter(student =>
                student.badges.some(b => b.badge.toString() === badge._id.toString())
            );
            const studentsWithoutBadge = studentsInGrade.filter(student =>
                !student.badges.some(b => b.badge.toString() === badge._id.toString())
            );

            // Populate counts and names for students with and without the badge
            report[reportKey].studentsWithBadge = studentsWithBadge.length;
            report[reportKey].studentsWithBadgeNames = studentsWithBadge.map(student => student.fullName);

            report[reportKey].studentsWithoutBadge = studentsWithoutBadge.length;
            report[reportKey].studentsWithoutBadgeNames = studentsWithoutBadge.map(student => student.fullName);

            // Calculate completion percentage
            report[reportKey].completionPercentage = report[reportKey].totalStudents > 0
                ? ((report[reportKey].studentsWithBadge / report[reportKey].totalStudents) * 100).toFixed(2)
                : '0.00';
        }

        // Flatten the report for response formatting
        const formattedReport = Object.values(report).map(data => ({
            grade: data.grade,
            badgeName: data.badgeName,
            totalStudents: data.totalStudents,
            studentsWithBadge: data.studentsWithBadge,
            studentsWithBadgeNames: data.studentsWithBadgeNames,
            studentsWithoutBadge: data.studentsWithoutBadge,
            studentsWithoutBadgeNames: data.studentsWithoutBadgeNames,
            completionPercentage: data.completionPercentage
        }));

        // Log the formatted report before sending it
        console.log("Formatted Badge Completion Report:", formattedReport);

        res.status(200).json(formattedReport);
    } catch (error) {
        console.error('Error generating badge completion report:', error);
        res.status(500).json({ message: 'Error generating badge completion report', error });
    }
});



// Get students by grade and badge ID
router.get('/students', async (req, res) => {
    const { grade, badgeId } = req.query;

    try {
        // Find all students in the specified grade and populate their badges
        const students = await Student.find({ grade }).populate('badges.badge');

        // Filter students based on badge ID
        const studentsWithBadge = students.filter(student =>
            student.badges.some(badge => badge.badge._id.toString() === badgeId) // Ensure we use badge._id
        );

        const studentsWithoutBadge = students.filter(student =>
            !student.badges.some(badge => badge.badge._id.toString() === badgeId)
        );

        res.status(200).json({
            studentsWithBadge,
            studentsWithoutBadge
        });
    } catch (error) {
        console.error('Error fetching students by grade and badge:', error);
        res.status(500).json({ message: 'Error fetching students', error });
    }
});



// Award badges based on student progress
router.post('/students/:studentId/award-badges', async (req, res) => {
    const { studentId } = req.params;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Fetch available badges for the student's grade
        const availableBadges = await Badge.find({ grade: student.grade });
        const awardedBadges = [];

        availableBadges.forEach(badge => {
            let awardBadge = false;

            // Quiz-based badges
            if (badge.criteria === 'quiz' && student.quizScores) {
                const requiredQuizzes = badge.conditions.quizzesCompleted || 0;
                const minimumScore = badge.conditions.minimumScore || 0;
                const quizzesMeetingCriteria = student.quizScores.filter(quiz => quiz.score >= minimumScore).length;

                if (quizzesMeetingCriteria >= requiredQuizzes) {
                    awardBadge = true;
                }
            }

            // Lesson-based badges
            if (badge.criteria === 'lesson' && student.lessonsProgress) {
                const completedLessons = student.lessonsProgress.filter(lesson => lesson.watchedVideo || lesson.openedPresentation).length;
                const requiredLessons = badge.conditions.lessonsCompleted || 0;

                if (completedLessons >= requiredLessons) {
                    awardBadge = true;
                }
            }

            // Game-based badges
            if (badge.criteria === 'game' && student.gameProgress) {
                const completedGameProgress = Array.from(student.gameProgress.values()).filter(progress => progress).length;
                const requiredGameProgress = badge.conditions.gameProgress || 0;

                if (completedGameProgress >= requiredGameProgress) {
                    awardBadge = true;
                }
            }

            // Award the badge if criteria are met
            if (awardBadge) {
                const alreadyHasBadge = student.badges.some(b => b.badge.toString() === badge._id.toString());
                if (!alreadyHasBadge) {
                    student.badges.push({ badge: badge._id, dateEarned: new Date() });
                    awardedBadges.push(badge.name);
                }
            }
        });

        await student.save();

        if (awardedBadges.length > 0) {
            // Log awarded badges information
            console.log(`Awarding badges to student ${studentId}: ${awardedBadges.join(', ')}`);

            // Emit a socket event to notify the student
            console.log('About to emit badgeAwarded event...');
            io.to(studentId).emit('badgeAwarded', { message: `Congratulations! You earned the badge(s): ${awardedBadges.join(', ')}` });

            // Log the emission of the event
            console.log(`Emitted 'badgeAwarded' event to student ${studentId}`);

            res.status(200).json({ message: `Badges awarded: ${awardedBadges.join(', ')}`, badges: student.badges });
        } else {
            // Log when no badges are awarded
            console.log(`No badges awarded for student ${studentId}`);
            res.status(200).json({ message: 'No badges awarded at this time' });
        }
    } catch (error) {
        console.error('Error awarding badges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new badge with image upload
router.post('/badges', badgeUpload.single('image'), async (req, res) => {
    const { name, criteria, grade, quizzesCompleted, minimumScore, lessonsCompleted, gameProgress } = req.body;

    // Use the uploaded file's path
    const imageUrl = req.file ? `/uploads/badges/${req.file.filename}` : null; // Adjust the URL according to your server configuration

    // Validate required fields
    if (!name || !criteria || !grade || !imageUrl) {
        return res.status(400).json({ error: 'Name, criteria, grade, and image are required.' });
    }

    // Create a new badge
    try {
        const newBadge = new Badge({
            name,
            criteria,
            grade,
            conditions: {
                quizzesCompleted: quizzesCompleted || 0,
                minimumScore: minimumScore || 0,
                lessonsCompleted: lessonsCompleted || 0,
                gameProgress: gameProgress || 0,
            },
            imageUrl,
        });

        await newBadge.save();
        res.status(201).json({ message: 'Badge created successfully', badge: newBadge });
    } catch (error) {
        console.error('Error creating badge:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a specific badge
router.get('/badges/:badgeId', async (req, res) => {
    const { badgeId } = req.params;

    try {
        const badge = await Badge.findById(badgeId);
        if (!badge) {
            return res.status(404).json({ error: 'Badge not found' });
        }

        res.status(200).json(badge);
    } catch (error) {
        console.error('Error fetching badge:', error);
        res.status(500).json({ error: 'Error fetching badge' });
    }
});

// Fetch all badges for a grade
router.get('/badges/grade/:grade', async (req, res) => {
    const { grade } = req.params;

    try {
        const badges = await Badge.find({ grade });
        if (badges.length === 0) {
            return res.status(404).json({ error: 'No badges found for this grade' });
        }

        res.status(200).json(badges);
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get achieved and unachieved badges for a student
router.get('/students/:studentId/badges', async (req, res) => {
    const { studentId } = req.params;

    try {
        const student = await Student.findById(studentId).populate('badges.badge'); // Populate the badge details
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Fetch available badges for the student's grade
        const availableBadges = await Badge.find({ grade: student.grade });

        // Separate badges into achieved and unachieved
        const achievedBadges = student.badges.map(b => b.badge);
        const unachievedBadges = availableBadges.filter(badge => !achievedBadges.some(ab => ab._id.toString() === badge._id.toString()));

        res.status(200).json({ achievedBadges, unachievedBadges });
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get badge completion percentage per grade
router.get('/badges/completion-per-grade', async (req, res) => {
    try {
        const badgeCompletionData = await Badge.calculateBadgeCompletionPercentage();
        res.status(200).json(badgeCompletionData);
    } catch (error) {
        console.error('Error fetching badge completion percentage per grade:', error);
        res.status(500).json({ message: 'Error fetching badge completion percentage per grade', error });
    }
});

// Get badge completion report by grade


module.exports = router;
