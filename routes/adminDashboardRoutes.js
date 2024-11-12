const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure the path is correct
const Student = require('../models/Student'); // Student model
const Quiz = require('../models/Quiz'); // Quiz model
const Badge = require('../models/Badge');

// Get the 6 most recently registered students
router.get('/recent-students', async (req, res) => {
    try {
        const recentStudents = await Student.find()
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .limit(6) // Limit the results to 6
            .populate('user'); // Populate the user field if it exists
        res.status(200).json(recentStudents);
    } catch (error) {
        console.error('Error fetching recent students:', error);
        res.status(500).json({ message: 'Error fetching recent students', error });
    }
});

// Get the 6 most recent teachers
router.get('/recent-teachers', async (req, res) => {
    try {
        const recentTeachers = await User.find({ role: 'teacher' })
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .limit(6); // Limit the results to 6
        res.status(200).json(recentTeachers);
    } catch (error) {
        console.error('Error fetching recent teachers:', error);
        res.status(500).json({ message: 'Error fetching recent teachers', error });
    }
});

// Search for students by name
router.get('/search/students', async (req, res) => {
    const query = req.query.query ? req.query.query.trim() : ''; // Trim the query
    try {
        if (!query) {
            return res.status(400).json({ message: 'Search term is required' });
        }
        
        // Use the static method to search by name
        const students = await Student.searchByName(query); // You may consider adding .limit(20) here

        if (students.length === 0) {
            return res.status(204).json({ message: 'No students found' });
        }

        res.status(200).json(students);
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({ message: 'Error searching students', error });
    }
});

// Search for teachers by name or email
router.get('/search/teachers', async (req, res) => {
    const query = req.query.query ? req.query.query.trim() : ''; // Trim the query
    try {
        if (!query) {
            return res.status(400).json({ message: 'Search term is required' });
        }

        const teachers = await User.find({
            role: 'teacher',
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        });

        if (teachers.length === 0) {
            return res.status(204).json({ message: 'No teachers found' });
        }

        res.status(200).json(teachers);
    } catch (error) {
        console.error('Error searching teachers:', error);
        res.status(500).json({ message: 'Error searching teachers', error });
    }
});

// Get all students in a specific grade
router.get('/all-students/:grade', async (req, res) => {
    const { grade } = req.params;
    try {
        const studentsInGrade = await Student.find({ grade })
            .populate('user'); // Populate the user field for student details
        res.status(200).json(studentsInGrade);
    } catch (error) {
        console.error('Error fetching students by grade:', error);
        res.status(500).json({ message: 'Error fetching students by grade', error });
    }
});

// Get all teachers
router.get('/all-teachers', async (req, res) => {
    try {
        const allTeachers = await User.find({ role: 'teacher' });
        res.status(200).json(allTeachers);
    } catch (error) {
        console.error('Error fetching all teachers:', error);
        res.status(500).json({ message: 'Error fetching all teachers', error });
    }
});

// Get detailed information of a student by ID
router.get('/student/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const studentDetails = await Student.findById(id)
            .populate('user') // Populating related user information
            .populate({
                path: 'quizScores.quizId',
                model: 'Quiz', // Populate quiz information from the Quiz model
                select: 'title' // Only retrieve the title of the quiz
            })
            .populate('badges') // Populate the badges field if it exists
            .populate('lessonsProgress'); // Populate the lessonsProgress field if it exists

        if (!studentDetails) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(studentDetails);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ message: 'Error fetching student details', error });
    }
});

// Get total number of students for percentage calculation
router.get('/total-students', async (req, res) => {
    try {
        const totalCount = await Student.countDocuments();
        res.status(200).json({ totalCount });
    } catch (error) {
        console.error('Error fetching total student count:', error);
        res.status(500).json({ message: 'Error fetching total student count', error });
    }
});

// Get data for charts (e.g., student registrations by grade)
router.get('/chart/data', async (req, res) => {
    try {
        const studentsByGrade = await Student.aggregate([
            {
                $group: {
                    _id: '$grade', // Group by grade
                    count: { $sum: 1 } // Count number of students in each grade
                }
            }
        ]);
        res.status(200).json(studentsByGrade);
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ message: 'Error fetching chart data', error });
    }
});

// Get average quiz scores per grade
// Get average quiz scores per grade
router.get('/quiz-averages', async (req, res) => {
    console.log('Request received for quiz averages'); // Log the request

    try {
        console.log('Fetching all students to calculate quiz averages...'); // Log the start of fetching students

        // Fetch all students with quizScores
        const students = await Student.find({}).select('grade quizScores'); // Only select grade and quizScores
        console.log(`Total students fetched: ${students.length}`); // Log number of students fetched

        // Create a map to hold total scores and count per grade
        const gradeMap = new Map();

        // Iterate over each student to calculate totals and counts
        students.forEach(student => {
            const { grade, quizScores } = student;
            quizScores.forEach(({ score }) => {
                // If the grade doesn't exist in the map, initialize it
                if (!gradeMap.has(grade)) {
                    gradeMap.set(grade, { totalScore: 0, count: 0 });
                }

                // Update the total score and count for this grade
                const gradeData = gradeMap.get(grade);
                gradeData.totalScore += score;
                gradeData.count += 1;
            });
        });

        // Calculate averages
        const averages = Array.from(gradeMap.entries()).map(([grade, data]) => ({
            grade,
            averageScore: data.count > 0 ? (data.totalScore / data.count) : 0 // Avoid division by zero
        }));

        console.log('Calculated averages:', averages); // Log the calculated averages

        // If there are no averages, return an empty array
        if (averages.length === 0) {
            console.log('No averages found, returning empty array.'); // Log the case of no averages
            return res.status(200).json([]);
        }

        res.status(200).json(averages); // Return the averages
    } catch (error) {
        console.error('Error fetching average quiz scores:', error); // Log the error
        res.status(500).json({ message: 'Error fetching average quiz scores', error });
    }
});

// Get average badges per grade
router.get('/average-badges', async (req, res) => {
    try {
        console.log('Fetching all students and badges...');
        
        // Fetch all students and badges
        const students = await Student.find().populate('badges.badge'); // Populate badges to get badge details
        const badges = await Badge.find(); // Fetch all badges

        console.log(`Fetched ${students.length} students and ${badges.length} badges.`);

        // Create a map to hold total badges and counts per grade
        const gradeBadgeMap = new Map();

        // Initialize map for each grade with total badges and student count
        for (let grade = 1; grade <= 6; grade++) {
            gradeBadgeMap.set(grade, { totalBadges: 0, studentCount: 0, completedCount: 0 });
        }

        // Iterate over each student to count badges
        students.forEach(student => {
            const { grade, badges: studentBadges } = student;
            const badgeCount = studentBadges.length; // Count badges for the student

            // Update the total badges and student count for this grade
            if (gradeBadgeMap.has(grade)) {
                const gradeData = gradeBadgeMap.get(grade);
                gradeData.totalBadges += badgeCount; // Increment total badges
                gradeData.studentCount += 1; // Increment student count

                // Check if student completed all available badges for their grade
                const totalAvailableBadges = badges.filter(badge => badge.grade === grade).length;
                if (badgeCount === totalAvailableBadges) {
                    gradeData.completedCount += 1; // Increment completed count
                }

                console.log(`Updated grade ${grade}: total badges = ${gradeData.totalBadges}, student count = ${gradeData.studentCount}, completed count = ${gradeData.completedCount}`);
            } else {
                console.warn(`Grade ${grade} not found in map.`);
            }
        });

        // Calculate average badges per student and percentage of completion
        const averageBadges = Array.from(gradeBadgeMap.entries()).map(([grade, data]) => {
            const totalAvailableBadges = badges.filter(badge => badge.grade === grade).length; // Count total available badges for this grade
            const averageBadgeCount = data.studentCount > 0 ? (data.totalBadges / data.studentCount) : 0; // Average badges per student
            const completionPercentage = totalAvailableBadges > 0 ? (data.completedCount / data.studentCount) * 100 : 0; // Percentage of students who completed all badges

            return {
                grade,
                averageBadges: averageBadgeCount,
                totalAvailableBadges,
                completionPercentage: parseFloat(completionPercentage.toFixed(2)) // Fix to 2 decimal places
            };
        });

        console.log('Calculated average badges per grade:', averageBadges);

        res.status(200).json(averageBadges); // Return the average badges per grade
    } catch (error) {
        console.error('Error fetching average badges per grade:', error);
        res.status(500).json({ message: 'Error fetching average badges per grade', error });
    }
});



module.exports = router;
