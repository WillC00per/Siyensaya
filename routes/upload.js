const multer = require('multer');
const path = require('path');

// Configure multer for badge image uploads
const badgeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/badges/'); // Path where badges will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save image with timestamp
    },
});

const badgeUpload = multer({ storage: badgeStorage });

// Configure multer for avatar image uploads
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/'); // Path where avatars will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save image with timestamp
    },
});

const avatarUpload = multer({ storage: avatarStorage });

module.exports = { badgeUpload, avatarUpload }; // Export both upload configurations
