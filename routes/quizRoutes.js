    // Import required modules
    const express = require('express');
    const router = express.Router();
    const Quiz = require('../models/Quiz');
    const Question = require('../models/Question');
    const Result = require('../models/Result');
    const Student = require('../models/Student');
    

    // Create a new quiz
    // Create a new quiz

    router.get('/quizzes/completion-report', async (req, res) => {
        try {
            // Fetch all quizzes
            const quizzes = await Quiz.find(); // Assuming Quiz is a Mongoose model
    
            // Create a report object to hold the results, keyed by quiz ID
            const report = {};
    
            for (const quiz of quizzes) {
                // Initialize the report entry for each quiz
                const reportKey = `${quiz._id}`;
                report[reportKey] = {
                    title: quiz.title, // Assuming quizzes have a 'title' field
                    grades: quiz.grades, // Get the grades for the quiz
                    totalStudents: 0,
                    studentsCompleted: 0,
                    studentsNotCompleted: 0,
                    averageScore: 0,
                    studentsCompletedNames: [], // Names of students who completed the quiz
                    studentsNotCompletedNames: [], // Names of students who did not complete the quiz
                    studentsCompletedScores: [], // Scores of students who completed the quiz
                    studentsNotCompletedNames: [], // Names of students who did not complete the quiz
                };
    
                // Find all students in the grades for this quiz
                const students = await Student.find({ grade: { $in: quiz.grades } }); // Adjust this query to filter by grade
                report[reportKey].totalStudents = students.length;
    
                // Separate students who completed and did not complete the quiz
                const studentsCompleted = students.filter(student =>
                    student.quizScores.some(score => score.quizId.toString() === quiz._id.toString())
                );
    
                const studentsNotCompleted = students.filter(student =>
                    !student.quizScores.some(score => score.quizId.toString() === quiz._id.toString())
                );
    
                // Populate counts and names for students who completed and did not complete the quiz
                report[reportKey].studentsCompleted = studentsCompleted.length;
                report[reportKey].studentsCompletedNames = studentsCompleted.map(student => student.fullName);
    
                report[reportKey].studentsNotCompleted = studentsNotCompleted.length;
                report[reportKey].studentsNotCompletedNames = studentsNotCompleted.map(student => student.fullName);
    
                // Calculate average score of students who completed the quiz
                const totalScore = studentsCompleted.reduce((sum, student) => {
                    const score = student.quizScores.find(score => score.quizId.toString() === quiz._id.toString());
                    return sum + (score ? score.score : 0);
                }, 0);
    
                report[reportKey].averageScore = studentsCompleted.length > 0 ? (totalScore / studentsCompleted.length) : 0;
    
                // Store the scores for the modal
                report[reportKey].studentsCompletedScores = studentsCompleted.map(student => {
                    const score = student.quizScores.find(score => score.quizId.toString() === quiz._id.toString());
                    return { name: student.fullName, score: score ? score.score : 0 };
                });
            }
    
            // Flatten the report for response formatting
            const formattedReport = Object.values(report).map(data => ({
                title: data.title,
                grades: data.grades,
                totalStudents: data.totalStudents,
                studentsCompleted: data.studentsCompleted,
                studentsNotCompleted: data.studentsNotCompleted,
                averageScore: data.averageScore,
                studentsCompletedNames: data.studentsCompletedNames,
                studentsNotCompletedNames: data.studentsNotCompletedNames,
                studentsCompletedScores: data.studentsCompletedScores,
            }));
    
            // Log the formatted report before sending it
            console.log("Formatted Quiz Completion Report:", formattedReport);
    
            res.status(200).json(formattedReport);
        } catch (error) {
            console.error('Error generating quiz completion report:', error.message);
            res.status(500).json({ message: 'Error generating quiz completion report', error: error.message });
        }
    });
    
    
    
    router.post('/quizzes', async (req, res) => {
        try {
            const quizData = req.body;

            console.log('Received quiz data:', quizData);

            // Ensure all required fields are provided
            if (quizData.time_limit == null || quizData.passing_score == null) {
                return res.status(400).send('Time limit and passing score are required');
            }

            // Check if grades field is included and valid
            if (!quizData.grades || !Array.isArray(quizData.grades) || quizData.grades.some(isNaN)) {
                return res.status(400).send('Invalid or missing grades');
            }

            // Validate grades range
            const validGrades = quizData.grades.every(grade => grade >= 1 && grade <= 6);
            if (!validGrades) {
                return res.status(400).send('Grades must be between 1 and 6');
            }

            const quiz = new Quiz(quizData);
            await quiz.save();

            console.log('Quiz saved to database:', quiz);

            res.status(201).send(quiz);
        } catch (error) {
            console.error('Error creating quiz:', error);
            res.status(500).send('Error creating quiz');
        }
    });

    // Fetch quiz details including questions and time_limit
    router.get('/quizzes/:quizId', async (req, res) => {
        try {
            const quizId = req.params.quizId;

            // Find the quiz by ID and populate questions
            const quiz = await Quiz.findById(quizId).populate('questions');
            
            if (!quiz) {
                return res.status(404).send('Quiz not found');
            }

            // Send the quiz data including questions and time_limit
            res.status(200).send({
                title: quiz.title,
                description: quiz.description,
                time_limit: quiz.time_limit,
                passing_score: quiz.passing_score,
                grades: quiz.grades,
                questions: quiz.questions
            });
        } catch (error) {
            console.error('Error fetching quiz details:', error);
            res.status(500).send('Internal server error');
        }
    });


    // Create questions for a quiz
    router.post('/quizzes/:quizId/questions', async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const questionsData = req.body.questions;

            // Ensure quizId is valid
            const existingQuiz = await Quiz.findById(quizId);
            if (!existingQuiz) {
                return res.status(404).send('Quiz not found');
            }

            // Check if the quiz already has questions
            const existingQuestions = await Question.find({ quiz_id: quizId });
            if (existingQuestions.length > 0) {
                return res.status(400).send('This quiz already has a set of questions.');
            }

            // Validate questions before creating them
            const invalidQuestions = questionsData.filter(question => 
                !question.answer_options.includes(question.correct_answer)
            );
            if (invalidQuestions.length > 0) {
                return res.status(400).send('Some questions have correct answers not included in the answer options.');
            }

            // Create questions with correct quiz_id
            const questions = questionsData.map(question => ({
                ...question,
                quiz_id: quizId
            }));

            const createdQuestions = await Question.create(questions);
            res.status(201).send(createdQuestions);
        } catch (error) {
            console.error('Error creating questions:', error);
            res.status(500).send('Internal server error');
        }
    });

    // Fetch quizzes for a specific grade
    router.get('/quizzes/grade/:grade', async (req, res) => {
        try {
            const grade = Number(req.params.grade); // Convert to number
            if (isNaN(grade) || grade < 1 || grade > 6) {
                return res.status(400).send('Invalid grade parameter. Must be between 1 and 6.');
            }

            const quizzes = await Quiz.find({ grades: grade });

            if (quizzes.length === 0) {
                return res.status(404).send('No quizzes found for this grade.');
            }

            res.status(200).send(quizzes);
        } catch (error) {
            console.error('Error fetching quizzes by grade:', error);
            res.status(500).send('Internal server error');
        }
    });

    // Fetch all quizzes
    router.get('/quizzes', async (req, res) => {
        try {
            const quizzes = await Quiz.find();
            res.status(200).send(quizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            res.status(500).send('Internal server error');
        }
    });

    // Fetch questions for a quiz
    router.get('/quizzes/:quizId/questions', async (req, res) => {
        try {
            const questions = await Question.find({ quiz_id: req.params.quizId });
            // Shuffle questions
            questions.sort(() => Math.random() - 0.5);
            res.status(200).send(questions);
        } catch (error) {
            console.error('Error fetching questions:', error);
            res.status(500).send('Internal server error');
        }
    });


    // Submit quiz answers
    // Submit quiz answers
    router.post('/quizzes/:quizId/submit', async (req, res) => {
        try {
            const { studentId, answers, time_taken, feedback, attempt } = req.body;
            const quizId = req.params.quizId;

            // Validate request body
            if (!studentId || !Array.isArray(answers) || !time_taken || !feedback || !attempt) {
                return res.status(400).send('Invalid request body');
            }

            const questions = await Question.find({ quiz_id: quizId });
            const quiz = await Quiz.findById(quizId);

            if (!quiz) {
                return res.status(404).send('Quiz not found');
            }

            // Validate answers format
            if (answers.length !== questions.length) {
                return res.status(400).send('Invalid answers format. Ensure it matches the number of questions.');
            }

            let score = 0;
            questions.forEach((question, index) => {
                if (question.correct_answer === answers[index]) {
                    score++;
                }
            });

            // Calculate percentage score
            const percentageScore = (score / questions.length) * 100;

            // Determine pass/fail based on passing percentage
            const passed = percentageScore >= quiz.passing_score;

            // Create result
            const result = new Result({
                user_id: studentId,
                quiz_id: quizId,
                score: percentageScore, // percentage score
                feedback: feedback,
                time_taken: time_taken,
                attempt: attempt,
                passed: passed
            });

            await result.save();

            // Update student's quizScores
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).send('Student not found');
            }

            // Check if the quiz has already been taken
            const existingQuizScore = student.quizScores.find(qs => qs.quizId.toString() === quizId);
            if (existingQuizScore) {
                // Update existing score
                existingQuizScore.score = percentageScore;
                existingQuizScore.dateTaken = new Date();
            } else {
                // Add new quiz score
                student.quizScores.push({
                    quizId: quizId,
                    score: percentageScore,
                    dateTaken: new Date()
                });
            }

            await student.save();

            res.status(200).send(result);
        } catch (error) {
            console.error('Error submitting quiz answers:', error);
            res.status(500).send('Internal server error');
        }
    });

    router.put('/quizzes/:quizId', async (req, res) => {
        try {
            const quizId = req.params.quizId;
            const { questions, ...quizUpdates } = req.body; // Separate questions from quiz data
    
            // Ensure the quiz exists
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                return res.status(404).send('Quiz not found');
            }
    
            // Update quiz main fields
            Object.assign(quiz, quizUpdates);
            await quiz.save();
    
            // If questions are provided in the request, update them individually
            if (questions && Array.isArray(questions)) {
                // Loop through each question in the update payload
                for (const questionData of questions) {
                    if (questionData._id) {
                        // Find and update existing question by ID
                        await Question.findByIdAndUpdate(questionData._id, questionData, { new: true });
                    } else {
                        // Create new question if no ID is provided and assign it to the quiz
                        const newQuestion = new Question({ ...questionData, quiz_id: quizId });
                        await newQuestion.save();
                        quiz.questions.push(newQuestion._id); // Associate with quiz
                    }
                }
                await quiz.save(); // Save updated question references in quiz
            }
    
            res.status(200).send(quiz);
        } catch (error) {
            console.error('Error updating quiz:', error);
            res.status(500).send('Internal server error');
        }
    });

    

    // Fetch quiz details including questions and time_limit
router.get('/quizzes/:quizId', async (req, res) => {
    try {
        const quizId = req.params.quizId;

        // Find the quiz by ID and populate questions
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).send('Quiz not found');
        }

        // Fetch related questions
        const questions = await Question.find({ quiz_id: quizId });

        // Send the quiz data including questions and time_limit
        res.status(200).send({
            title: quiz.title,
            description: quiz.description,
            time_limit: quiz.time_limit,
            passing_score: quiz.passing_score,
            grades: quiz.grades,
            questions: questions // Include questions in response
        });
    } catch (error) {
        console.error('Error fetching quiz details:', error);
        res.status(500).send('Internal server error');
    }
});



    module.exports = router;
