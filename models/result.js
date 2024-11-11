const mongoose = require('mongoose');

// Define the Result schema
const resultSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    quiz_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Quiz', 
        required: true 
    },
    score: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 100 
    },
    feedback: { 
        type: String, 
        maxlength: 500 
    },
    time_taken: { 
        type: Number  // time in seconds
    },
    attempt: { 
        type: Number, 
        default: 1 
    },
    passed: { 
        type: Boolean 
    }
}, { 
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Create indexes to improve query performance
resultSchema.index({ user_id: 1 });
resultSchema.index({ quiz_id: 1 });

// Export the Result model
module.exports = mongoose.model('Result', resultSchema);
