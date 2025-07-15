const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
 status: {
  type: String,
  enum: ["present", "absent", "late"],  // lowercase
  default: "present",
},

  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Usually a teacher
    required: true,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
