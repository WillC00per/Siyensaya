const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Student = require('../models/Student');
const fs = require('fs');
const unzipper = require('unzipper');
const { Unrar } = require('node-unrar-js');
const Game = require('../models/Game');
// Ensure this model is correctly defined and exported

const router = express.Router();

// Set up file storage with Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/games/');
    console.log('Game file destination:', 'public/games/');
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const timestampedFilename = Date.now() + fileExtension;
    cb(null, timestampedFilename);
    console.log('Game file saved as:', timestampedFilename);
  }
});

const upload = multer({ storage });

// POST endpoint for uploading a game
router.post('/upload-game', upload.fields([{ name: 'gameFile' }, { name: 'gameThumbnail' }]), async (req, res) => {
  const gameFile = req.files.gameFile && req.files.gameFile[0];
  const thumbnailFile = req.files.gameThumbnail && req.files.gameThumbnail[0];

  if (!gameFile) return res.status(400).json({ error: 'No game file uploaded.' });
  if (!thumbnailFile) return res.status(400).json({ error: 'No thumbnail file uploaded.' });

  const { title, grade, createdBy, description = '' } = req.body;

  // Parse grade as an array of numbers
  let grades = [];
  try {
    grades = JSON.parse(grade);
    if (!Array.isArray(grades)) throw new Error();
    grades = grades.map(Number);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid grade format.' });
  }

  if (!title || !grades || !createdBy) {
    return res.status(400).json({ error: 'Missing required fields (title, grade, or createdBy)' });
  }

  const gameDir = path.join(__dirname, '../public/games', path.parse(gameFile.filename).name);
  const thumbnailsDir = path.join(__dirname, '../public/thumbnails');  // Directory for storing thumbnails

  try {
    // Move the thumbnail to the /public/thumbnails directory
    if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });
    const thumbnailFilePath = path.join(thumbnailsDir, thumbnailFile.filename);
    fs.renameSync(thumbnailFile.path, thumbnailFilePath);
    const thumbnailUrl = `/thumbnails/${thumbnailFile.filename}`;  // Set URL for the database

    // Extract game file
    if (gameFile.mimetype === 'application/zip' || gameFile.originalname.endsWith('.zip')) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(gameFile.path)
          .pipe(unzipper.Extract({ path: gameDir }))
          .on('close', resolve)
          .on('error', reject);
      });
    } else if (gameFile.mimetype === 'application/x-rar-compressed' || gameFile.originalname.endsWith('.rar')) {
      const fileBuffer = fs.readFileSync(gameFile.path);
      const extractor = Unrar.open(fileBuffer);
      if (!extractor) throw new Error('Failed to create extractor from the RAR file.');

      const extractedFiles = extractor.extractAll();
      for (const fileEntry of extractedFiles) {
        const outputPath = path.join(gameDir, fileEntry.fileHeader.name);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, fileEntry.getData());
      }
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload a .zip or .rar file.' });
    }

    // Check for index.html in the extracted directory
    const indexPath = path.join(gameDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(500).json({ error: 'Game extracted, but index.html is missing.' });
    }

    // Set gameUrl to point to index.html
    const extractedGameUrl = `/games/${path.parse(gameFile.filename).name}/index.html`;

    // Save the game to the database
    const newGame = new Game({
      title,
      description,
      grade: grades,
      gameUrl: extractedGameUrl,
      gameThumbnailUrl: thumbnailUrl,  // Add the thumbnail URL
      completedBy: [],
      createdBy
    });

    const savedGame = await newGame.save();

    console.log('Game saved successfully:', savedGame);

    res.json({
      message: 'Game uploaded and extracted successfully',
      gamePath: extractedGameUrl,
      gameThumbnailUrl: thumbnailUrl,
      gameId: savedGame._id,
    });

  } catch (error) {
    console.error('Error processing game file:', error);
    res.status(500).json({ error: 'Failed to process the game file. Please try again.' });
  } finally {
    // Cleanup the uploaded files
    fs.unlink(gameFile.path, (err) => {
      if (err) console.error('Error deleting game file:', err);
    });
  }
});

// Serve the extracted games with correct headers
router.use('/games', express.static(path.join(__dirname, '../public/games'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.wasm')) {
      res.setHeader('Content-Type', 'application/wasm');
    } else if (filePath.endsWith('.br')) {
      res.setHeader('Content-Encoding', 'br');
    }
  }
}));



router.get('/teachers-and-admins', async (req, res) => {
    try {
      const users = await User.find({ role: { $in: ['teacher', 'admin'] } }).select('firstName lastName _id');
      res.json(users);
    } catch (error) {
      console.error('Error fetching teachers and admins:', error);
      res.status(500).json({ error: 'Failed to fetch teachers and admins' });
    }
});

// Fetch games for a specific grade
// Fetch available games for the logged-in student based on their grade
// In your gameRoutes.js
router.get('/games/grade/:grade', async (req, res) => {
  try {
    const grade = req.params.grade; // No need to convert to Number
    if (!grade || !['1', '2', '3', '4', '5', '6'].includes(grade)) {
      return res.status(400).send('Invalid grade parameter. Must be between 1 and 6.');
    }

    // Query for games that have the grade as part of the array
    const games = await Game.find({ grade: { $in: [grade] } });

    if (games.length === 0) {
      return res.status(404).send('No games found for this grade.');
    }

    res.status(200).send(games);
  } catch (error) {
    console.error('Error fetching games by grade:', error);
    res.status(500).send('Internal server error');
  }
});



// Route to fetch all games (no grade filter)
router.get('/games', async (req, res) => {
  try {
      const games = await Game.find(); // Fetch all games from the database

      if (games.length === 0) {
          return res.status(404).send('No games found.');
      }

      res.status(200).send(games); // Send all games as a response
  } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).send('Internal server error');
  }
});

// Example of an API route in Express.js

// Endpoint to update completedBy array
router.post('/games/updateCompletedBy/:gameId', async (req, res) => {
  const { gameId } = req.params;
  const { studentId } = req.body;  // Get student ID from the request body

  // Log the received request data
  console.log('Received request to update completedBy:', { gameId, studentId });

  try {
      const game = await Game.findById(gameId);
      
      if (!game) {
          // Log when the game is not found
          console.log(`Game with ID ${gameId} not found`);
          return res.status(404).json({ message: 'Game not found' });
      }

      // Use MongoDB's $addToSet to add the studentId only if it doesn't already exist in the array
      const updatedGame = await Game.findByIdAndUpdate(
          gameId,
          { $addToSet: { completedBy: studentId } },  // Add studentId to completedBy if not already present
          { new: true }  // Return the updated game document
      );

      // Check if the student was added to the array
      if (updatedGame.completedBy.includes(studentId)) {
          console.log(`Student ${studentId} added to completedBy for game ${gameId}`);
          res.status(200).json({ message: 'Student added to completedBy' });
      } else {
          console.log(`Student ${studentId} is already in completedBy for game ${gameId}`);
          res.status(200).json({ message: 'Student already in completedBy' });
      }

  } catch (error) {
      // Log the error in case of failure
      console.error('Error updating completedBy:', error);
      res.status(500).json({ message: 'Error updating completedBy' });
  }
});




module.exports = router;
