// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  class: String,
  roll: String,
 assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
assignedParent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Student", studentSchema);

