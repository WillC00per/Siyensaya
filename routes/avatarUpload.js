const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for avatar image uploads
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/'); // Directory to store avatar images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save with timestamp
    },
});

const uploadAvatar = multer({ storage: avatarStorage });

// Middleware for logging requests
router.use((req, res, next) => {
    console.log(`Received request for: ${req.originalUrl}`);
    next();
});

// Upload avatar
router.post('/upload-avatar', uploadAvatar.single('avatar'), async (req, res) => {
    try {
        console.log('Received avatar upload request:', req.file);
        
        // Check if the avatar file is provided
        if (!req.file) {
            return res.status(400).json({ error: 'Avatar image upload is required' });
        }

        // Construct the avatar URL
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Temporarily bypass user association
        // If you want to return just the avatar URL for now, without updating any user:
        console.log(`Avatar file uploaded: ${avatarUrl}`);

        res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the avatar upload router
module.exports = router;
