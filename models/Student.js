const mongoose = require('mongoose');
const Badge = require('./Badge'); // Assuming the Badge model is in the same directory
const Game = require('./Game');

// Define the Student schema
const studentSchema = new mongoose.Schema({
  studentNumber: {
    type: String,
    required: [true, 'Student number is required'],
    unique: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
  },
  grade: {
    type: Number,
    required: [true, 'Grade is required'],
    min: [1, 'Grade must be at least 1'],
    max: [12, 'Grade cannot be more than 12'],
  },
  quizScores: [
    {
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: [true, 'Quiz ID is required'],
      },
      score: {
        type: Number,
        required: [true, 'Score is required'],
        min: [0, 'Score cannot be less than 0'],
      },
      dateTaken: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  badges: [
    {
      badge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge', // Reference the Badge schema
        required: true,
      },
      badgeName: { // Add badge name to be stored
        type: String,
        required: true,
      },
      dateEarned: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  lessonsProgress: [
    {
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
      },
      watchedVideo: {
        type: Boolean,
        default: false,
      },
      openedPresentation: {
        type: Boolean,
        default: false,
      },
      watchedYouTube: {
        type: Boolean,
        default: false,
      },
      lastAccessed: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  fullName: {
    type: String,
  },
  gameProgress: {
    type: Map,
    of: Boolean,
    default: {},
  },
  avatarUrl: {
    type: String, // Store the URL/path to the student's avatar
    default: '',  // Default to an empty string if no avatar is uploaded
  },
}, {
  timestamps: true,
});

// Instance method to count completed quizzes
studentSchema.methods.countCompletedQuizzes = function() {
  return this.quizScores.length; // Total number of unique quizzes completed
};

// Instance method to count completed lessons
studentSchema.methods.countCompletedLessons = function() {
  return this.lessonsProgress.filter(lesson => 
    lesson.watchedVideo || lesson.openedPresentation || lesson.watchedYouTube
  ).length;
};

// Instance method to count game progress
studentSchema.methods.countGameProgress = function() {
  return Array.from(this.gameProgress.values()).filter(progress => progress === true).length;
};

// Middleware to populate fullName before saving
studentSchema.pre('save', async function(next) {
  try {
    const user = await mongoose.model('User').findById(this.user);
    if (user) {
      this.fullName = `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim();
      next();
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
});

// Function to check and award badges
async function checkAndAwardBadges(student) {
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
      const completedLessons = student.lessonsProgress.filter(lesson => 
        lesson.watchedVideo || lesson.openedPresentation
      ).length;
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
        student.badges.push({ 
          badge: badge._id, 
          badgeName: badge.name,  // Add the badge name when awarding
          dateEarned: new Date() 
        });
        awardedBadges.push(badge.name);
      }
    }
  });

  // Save student only if new badges are awarded
  if (awardedBadges.length > 0) {
    await student.save();
    console.log(`Badges awarded: ${awardedBadges.join(', ')}`);
  }
}

// Automatically award badges after any student update (quiz, lesson, or game)
studentSchema.post('save', async function(doc, next) {
  try {
    await checkAndAwardBadges(doc); // Call the function to check for badges
  } catch (error) {
    console.error('Error awarding badges:', error);
  }
  next();
});

studentSchema.methods.getAvailableGames = async function() {
  try {
    // Fetch games where the student's grade is within the game’s grade range
    const games = await Game.find({
      grade: { $in: [this.grade] } // Match games that include this grade in the grade array
    });
    
    return games;
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
};


const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
