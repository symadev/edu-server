const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
  },
  remarks: {
    type: String,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Usually the teacher
    required: true,
  },
  date: {
    type: String,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model("Result", resultSchema);
