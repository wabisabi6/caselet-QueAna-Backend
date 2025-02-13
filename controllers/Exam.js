const { errResponse } = require("../middleware/ErrorResponse");
const mongoose = require("mongoose");
const ExamModel = require("../models/Exams");
const ScheduledExamModel = require("../models/ScheduledExam");

const { Types } = require("mongoose");
const EXAM_FIELDS = [
  "name",
  "problem_context",
  "data_summary",
  "difficulty",
  "total_questions",
];
exports.getExam = async (req, res, next) => {
  const exam = await ExamModel.find();
  return res.status(200).json({ sucess: true, exam });
};


exports.deleteExam = async (req, res, next) => 
{
  console.log("Delete Exam from Backend was called");

  if (!req.params.exam_id) {
    return res.status(400).json({ success: false, message: "Exam id is required" });
  }

  try {
    // Attempt to delete the exam by its ID
    const result = await ExamModel.deleteOne({ _id: req.params.exam_id });

    // If the exam was not found and deleted, result.deletedCount will be 0
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    // If the delete operation was successful, return a success response
    return res.status(200).json({ success: true, message: "Exam deleted successfully" });
    
  } catch (error) {
    // If an error occurs, return an error response
    return res.status(500).json({ success: false, message: "An error occurred while deleting the exam" });
  }
}

exports.getExamDetails = async (req, res, next) => 
{
  if (!req.params.exam_id) {
    return res.status(400).json({ sucess: false, exam: "Exam id is invalid" });
  }
  const exam = await ExamModel.aggregate([
    { $match: { _id: new Types.ObjectId(req.params.exam_id) } },
    {
      $lookup: {
        from: "questions",
        localField: "_id",
        foreignField: "exam_id",
        as: "question",
      },
    },
  ]);

  // console.log(exam);
  let totalQuestions = exam[0].total_questions;
  let spotsTaken = await exam[0].question.map((question) => {
    return question.question_no;
  });
  let questions_available = [];

  for (let index = 1; index <= totalQuestions; index++) {
    // console.log("as");
    console.log(spotsTaken);
    if (!spotsTaken.includes(index)) {
      console.log("takn", index);
      questions_available.push(index);
    }
  }
  exam[0].questions_available = questions_available;

  return res.status(200).json({ sucess: true, exam });
};

exports.getScheduledExam = async (req, res, next) => {
  try 
  {
    const now = new Date();
    const scheduledExams = await ScheduledExamModel.find({
      start_time: { $lte: now },
      end_time: { $gte: now }
    })
    .populate('selectedExamIds') // Populate the array of exams
    .exec();

    // Process the scheduled exams
    const exams = scheduledExams.flatMap(se => { // Use flatMap to handle multiple exams per practice
      if (se.selectedExamIds && se.selectedExamIds.length > 0) {
        return se.selectedExamIds.map(exam => ({
          _id: exam._id,              // Exam ID
          name: exam.name,            // Exam name
          duration: exam.duration,    // Exam duration
          difficulty: exam.difficulty, // Exam difficulty
          total_questions: exam.total_questions, // Total questions
          problem_context: exam.problem_context, // Problem context
          data_summary: exam.data_summary,       // Data summary
          start_time: se.start_time,  // Practice start time
          end_time: se.end_time       // Practice end time
        }));
      } else {
        console.warn('Scheduled exam with no associated exams:', se._id);
        return []; // Return an empty array for practices with no associated exams
      }
    });
    // Return the response
    return res.status(200).json({
      success: true,
      exams
    });
  }
  catch (error) {
    console.error('Error fetching scheduled exams:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching scheduled exams'
    });
  }

}

exports.getScheduledExamsById = async (req, res, next) => {
  try {
    const { practiceId } = req.body;

    // Validate input
    if (!practiceId) {
      return res.status(400).json({ success: false, message: "Practice ID is required" });
    }

    // Find the ScheduledExam and populate the associated Exam
    const practice = await ScheduledExamModel.findById(practiceId).populate("selectedExamIds");

    // If no practice is found, return a 404 error
    if (!practice) {
      return res.status(404).json({ success: false, message: "Practice not found" });
    }

    // Prepare the response data for all associated exams
    const associatedExams = practice.selectedExamIds.map((exam) => ({ // UPDATED: Map through `selectedExamIds` array
      _id: exam._id,
      name: exam.name,
      duration: exam.duration,
      difficulty: exam.difficulty,
      total_questions: exam.total_questions,
      problem_context: exam.problem_context,
      data_summary: exam.data_summary,
      start_time: practice.start_time, // Add practice details
      end_time: practice.end_time,
    }));

    return res.status(200).json({
      success: true,
      exams: associatedExams,
    });
  } catch (error) {
    console.error("Error fetching exams by practice ID:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getScheduledExamsList = async (req, res, next) => {
  const exam = await ScheduledExamModel.find();
  console.log("Data from ScheduledExamModel: ", exam)
  return res.status(200).json({ success: true, exam });
};

//Get list of exams
exports.scheduleExam = async (req, res, next) => {
  try {
    const { practiceName, selectedExamIds, start_time, end_time } = req.body;
    
    // Validation for input fields
    if (!practiceName || !selectedExamIds || selectedExamIds.length === 0 || !start_time || !end_time) {
      return res.status(400).json({
          success: false,
          body: "Please provide all required fields: selectedExamIds (array), start_time, end_time",
      });
    }

    const newPractice = new ScheduledExamModel({
        practiceName: practiceName,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        selectedExamIds: selectedExamIds
    });

    await newPractice.save();

    return res.status(200).json({
      success: true,
      message: "Practice scheduled successfully.",
      practiceId: newPractice._id, // Returning the practice ID to the client
    });

  } catch (error) {
      console.error('Error creating scheduled exam:', error);
      res.status(500).json({ message: "Failed to create scheduled exam", error: error.message });
  }
};

exports.createExam = async (req, res, next) => {
  console.log(req.body);

  let body = req.body;
  keys = Object.keys(body);
  for (let index = 0; index < EXAM_FIELDS.length; index++) {
    const key = EXAM_FIELDS[index];
    if(key != "difficulty")
    {
      if (!keys.includes(key) || !body[key]) {
        console.log(key);
        return res
          .status(400)
          .json({ sucess: false, body: `${key} not found, please enter it ` });
      }
    }
  }
  const question_bank = await ExamModel.create(body);

  res.status(200).json({ success: true, body: question_bank });
};
