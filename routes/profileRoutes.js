const express = require('express');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student'); // Assuming you have a Student model defined
const router = express.Router();

// Fetch student profile
router.get('/profile/:id', async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await Student.findById(studentId)
            .populate({
                path: 'quizScores.quizId', // Populate the quiz data using the quizId
                select: 'title' // Only select the quiz title
            })
            .populate({
                path: 'badges.badge', // Populate the badge field to include badge details
                select: 'name imageUrl', // Ensure you include the 'name' and 'imageUrl' fields from Badge
            })
            .exec();

        if (!student) {
            return res.status(404).send('Student not found');
        }

        // Log student information and badges
        console.log(`Student ID: ${studentId}`);
        student.badges.forEach((badgeItem, index) => {
            console.log(`Badge ${index + 1}: Name: ${badgeItem.badge.name}, Image URL: ${badgeItem.badge.imageUrl}`);
        });

        // Transform quiz scores to include quiz names
        const quizScores = student.quizScores.map(quiz => ({
            quizId: quiz.quizId._id, // Get the quiz ID
            title: quiz.quizId.title, // Get the quiz title
            score: quiz.score,
            dateTaken: quiz.dateTaken,
        }));

        // Convert gameProgress from Map to Object
        const gameProgressObj = {};
        student.gameProgress.forEach((value, key) => {
            gameProgressObj[key] = value;
        });

        // Prepare the profile data to send back
        const profileData = {
            fullName: student.fullName,
            grade: student.grade,
            quizScores: quizScores,
            lessonsProgress: student.lessonsProgress,
            gameProgress: gameProgressObj, // Send as a plain object
            badges: student.badges.map(b => ({
                badgeName: b.badge.name,
                imageUrl: b.badge.imageUrl,
                dateEarned: b.dateEarned,
            })), // Extract badge name and imageUrl
            latestBadges: student.badges.slice(-3).map(b => ({
                badgeName: b.badge.name,
                imageUrl: b.badge.imageUrl,
                dateEarned: b.dateEarned,
            })), // Get the latest 3 badges with name and image
            avatarUrl: student.avatarUrl || null, // Add avatar URL if exists
        };

        // Log profile data before sending the response (optional)
        console.log(`Profile data for student ${studentId}:`, profileData);

        res.status(200).json(profileData);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).send('Internal server error');
    }
});

// Endpoint to fetch available avatars from the uploads/avatars directory
router.get('/avatars', (req, res) => {
    const avatarDir = path.join(__dirname, '../uploads/avatars');

    fs.readdir(avatarDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching avatars' });
        }

        // Filter to only include image files (jpg, png, etc.)
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

        res.status(200).json(imageFiles);
    });
});

// Endpoint to update the student's avatar
router.post('/upload-avatar/:id', async (req, res) => {
    const studentId = req.params.id;
    const { avatarUrl } = req.body; // Expect the avatar URL (file name) in the request body

    if (!avatarUrl) {
        return res.status(400).json({ message: 'Avatar URL is required' });
    }

    try {
        // Find the student by ID
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update the student's avatar URL
        student.avatarUrl = `/uploads/avatars/${avatarUrl}`;
        await student.save();

        res.status(200).json({ message: 'Avatar updated successfully', avatarUrl: student.avatarUrl });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: 'Error updating avatar' });
    }
});

module.exports = router;
