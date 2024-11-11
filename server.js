  // Import required modules
  const express = require('express');
  const bodyParser = require('body-parser');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const crypto = require('crypto');
  const path = require('path');
  const http = require('http'); // Import http module for Socket.IO
  const socketIo = require('socket.io'); // Import Socket.IO

  require('dotenv').config(); // For environment variables

  const User = require('./models/User');
 
  const Student = require('./models/Student');
  const quizRoutes = require('./routes/quizRoutes');
  const badgeRoutes = require('./routes/badgeRoutes'); // Ensure correct path to your routes file
  
  const profileRoutes = require('./routes/profileRoutes'); 
  const avatarUpload = require('./routes/avatarUpload');
  const uploadGames = require('./routes/uploadGames');
  const lessonRoutes = require('./routes/lessonRoutes');
  const adminDashboardRoutes = require('./routes/adminDashboardRoutes')

  // Create Express app
  const app = express();
  const server = http.createServer(app); // Create HTTP server
  // Configure CORS for Express
app.use(cors({
  origin: ['http://localhost:3001'], // Replace with your client URL
  methods: ['GET', 'POST', 'PUT'], // Allowed methods
  credentials: true, // Allows credentials like cookies
}));

// Initialize Socket.IO with CORS options
const io = socketIo(server, {
  cors: {
      origin: ['http://localhost:3001'], // Same as above
      methods: ['GET', 'POST'], // Allowed methods
      credentials: true // Allows credentials
  }
});
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/games', express.static(path.join(__dirname, 'public/games'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.wasm.gz')) {
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Content-Type', 'application/wasm');
        } else if (filePath.endsWith('.js.gz')) {
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.data.gz')) {
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Content-Type', 'application/octet-stream');
        }
    }
}));

// Serve static files from the React app


  // Define secret key for JWT authentication
  const secretKey = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quiz_platform', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
    });

  // Middleware to verify JWT token
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid or missing authorization header');
      return res.status(401).send('Invalid or missing authorization header');
    }
    const token = authHeader.split(' ')[1];
    console.log('Received token:', token);
    try {
      const decoded = jwt.verify(token, secretKey);
      console.log('Decoded token:', decoded);
      req.user = decoded; // Attach decoded user data to request object
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).send('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).send('Invalid token format');
      } else {
        return res.status(500).send('Token verification failed');
      }
    }
  };

  // Register route
app.post('/register', async (req, res) => {
  try {
    const students = req.body.students; // Expecting an array of student objects

    // Check if students array is valid
    if (!Array.isArray(students) || students.length === 0) {
      console.log('No students provided or invalid format');
      return res.status(400).send('No students provided or invalid format');
    }

    // Array to hold promises for user creation
    const userPromises = students.map(async (studentData) => {
      const {
        username, password, role, studentNumber, email, firstName, middleName, lastName, birthday, address, contactNumber, grade, employeeNumber, gameProgress
      } = studentData;

      console.log('Registering user with data:', studentData);

      // Check for missing required fields
      if (!username || !password || !role || !email || !firstName || !lastName || !birthday || !address || !contactNumber ||
          (role === 'student' && (!studentNumber || !grade)) || 
          ((role === 'teacher' || role === 'admin') && !employeeNumber)) {
        console.log('Missing required fields for:', username);
        throw new Error('Missing required fields for ' + username);
      }

      // Check if user already exists (username or email)
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        console.log('Username or email already exists:', existingUser);
        throw new Error('Username or email already exists for ' + username);
      }

      // Check if student number already exists for students
      if (role === 'student') {
        const existingStudent = await Student.findOne({ studentNumber });
        if (existingStudent) {
          console.log('Student number already exists:', existingStudent);
          throw new Error('Student number already exists for ' + studentNumber);
        }
      }

      // Hash the password
      console.log('Hashing password for user:', username);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      console.log('Saving new user');
      const newUser = new User({
        username,
        password: hashedPassword,
        role,
        email,
        firstName,
        middleName,
        lastName,
        birthday,
        address,
        contactNumber,
        employeeNumber: role !== 'student' ? employeeNumber : undefined, // Employee number for non-students
      });

      await newUser.save();
      console.log('New user saved:', newUser);

      // If the user is a student, create the student document
      if (role === 'student') {
        console.log('Creating student record');
        
        // Ensure gameProgress is correctly formatted as an object
        const formattedGameProgress = gameProgress && typeof gameProgress === 'object' 
          ? gameProgress 
          : {}; 

        // Create the student document using the new schema
        const student = new Student({
          studentNumber,
          user: newUser._id,
          grade,
          quizScores: [],  // Initialize empty quiz scores
          badges: [],  // Initialize empty badges
          lessonsProgress: [],  // Initialize empty lesson progress
          gameProgress: formattedGameProgress // Handle game progress
        });

        try {
          console.log('Saving student record');
          const savedStudent = await student.save();
          console.log('Student record saved successfully:', savedStudent);

          // Link the saved student document to the user
          newUser.studentDetails = savedStudent._id;
          await newUser.save();
          console.log('Student linked to user successfully');
        } catch (studentSaveError) {
          console.error('Error details during student save:', studentSaveError);
          throw new Error('Error saving student record for ' + username);
        }
      }

      return newUser; // Return the new user for later processing
    });

    // Execute all user creation promises
    await Promise.all(userPromises);
    
    // If all steps are successful, send a success response
    res.status(201).send('All users registered successfully');
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(400).send('Error: ' + error.message);
  }
});


  // Login route
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received login request with body:', req.body);

    if (!username || !password) {
      return res.status(400).send('Missing username or password');
    }

    try {
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(400).send('User not found');
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).send('Invalid credentials');
      }

      // Find the corresponding student record
      const student = await Student.findOne({ user: user._id });

      if (user.role === 'student' && !student) {
        return res.status(400).send('Student profile not found');
      }

      const tokenPayload = {
        id: user._id,
        role: user.role,
        studentId: student ? student._id : null, // Include studentId if it's a student
        grade: student ? student.grade : null // Include the student's grade
      };

      const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

      res.status(200).json({ 
        token, 
        role: user.role, 
        studentId: student ? student._id : null,
        grade: student ? student.grade : null  // Ensure grade is included
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Internal server error');
    }
  });

  // Get student by ID
  app.get('/students/:id', async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).send('Student not found');
      }
      res.status(200).send(student);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Protected route - Get current user based on token
  app.get('/user', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        console.log('User not found with ID:', req.user.id);
        return res.status(404).send('User not found');
      }
      console.log('User found:', user);
      res.status(200).json({ role: user.role, firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
      console.error('Error finding user:', error);
      res.status(500).send('Internal server error');
    }
  });

  // Get all usernames endpoint
  app.get('/usernames', async (req, res) => {
    try {
      const users = await User.find({}, 'username');
      const usernames = users.map(user => user.username);
      res.json(usernames);
    } catch (error) {
      console.error('Error fetching usernames:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get user data by username
  app.get('/users/:username', async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user by username:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get all users endpoint
  app.get('/users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update user data by username
  app.put('/users/:username', async (req, res) => {
    const { username } = req.params;
    const updatedUserData = req.body;

    try {
      const updatedUser = await User.findOneAndUpdate({ username }, updatedUserData, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete user by username
  app.delete('/users/:username', async (req, res) => {
    const { username } = req.params;
    try {
      await User.findOneAndDelete({ username });
      res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send({ error: 'An error occurred while deleting the user' });
    }
  });

  app.get('/api/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'uploads/presentations', fileName);
    
    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error('File download error:', err);
            res.status(500).send('File not found');
        }
    });
});


  // Use routes
  app.use('/api', quizRoutes);
  app.use('/api', lessonRoutes);
  app.use('/api', badgeRoutes);
  app.use('/api', profileRoutes);
  app.use('/api', avatarUpload);
  app.use('/api', adminDashboardRoutes);
  app.use('/api', uploadGames);
  

  badgeRoutes.io = io;

  // Serve static files from the public directory
  app.use('/games', express.static(path.join(__dirname, 'public/games')));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/uploads/avatars', express.static('uploads/avatars'));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Fallback to serve React app
  // app.use((req, res, next) => {
  //   if (req.method === 'GET' && req.accepts('html') && !req.is('json') && !req.path.includes('.')) {
  //     res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  //   } else {
  //     next();
  //   }
  // });

  // Socket.IO connection
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle custom events here
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Example of emitting an event
    socket.emit('welcome', { message: 'Welcome to the quiz platform!' });
  });

  app.use(express.static(path.join(__dirname, 'quiz-platform-client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'quiz-platform-client/build', 'index.html'));
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

