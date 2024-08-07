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

  const now = new Date();

  ScheduledExamModel.find({
    start_time: { $lte: now },
    end_time: { $gte: now }
  })
  .populate('selectedExamId')
  .exec((err, scheduledExams) => {
    if (err) {
      console.error('Error fetching scheduled exams:', err);
      return res.status(500).json({ success: false, message: 'Error fetching scheduled exams' });
    } else {
      console.log('Scheduled Exams:', scheduledExams);

      const exams = scheduledExams.map(se => {
        if (se.selectedExamId) {
          return {
            _id: se.selectedExamId._id,  // Directly use _id from the populated Exam
            name: se.selectedExamId.name,
            start_time: se.start_time,
            end_time: se.end_time,
            // Add other fields from either the scheduled exam or the populated exam as needed
          };
        } else {
          console.warn('Scheduled exam with missing selectedExamId:', se._id);
          return null;
        }
      }).filter(exam => exam !== null);  // Filter out any null values
      
      // Assuming you want to return all exams
      console.log('Exam Details:', exams);
      return res.status(200).json({ success: true, exams });
    }
  });

};

exports.getScheduledExamsList = async (req, res, next) => {
  const exam = await ScheduledExamModel.find();
  return res.status(200).json({ sucess: true, exam });
};

//Get list of exams
exports.scheduleExam = async (req, res, next) => {
  try {
    const { examName, selectedExamId, start_time, end_time } = req.body;
    
    const newScheduledExam = new ScheduledExamModel({
        name: examName,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        selectedExamId: selectedExamId
    });

    await newScheduledExam.save();

    res.status(200).json({ success: true});
    } catch (error) {
        console.error('Error creating scheduled exam:', error);
        res.status(500).json({ message: "Failed to create scheduled exam", error: error.message });
    }
};

exports.createExam = async (req, res, next) => {
  console.log(req.body);

  let body = req.body;
  keys = Object.keys(body);
  console.log(keys, "This is dflka");
  for (let index = 0; index < EXAM_FIELDS.length; index++) {
    const key = EXAM_FIELDS[index];
    // console.log(!body[key]);
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
