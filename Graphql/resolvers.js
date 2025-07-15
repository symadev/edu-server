// graphql/resolvers.js
const Student = require("../models/Student");
const User = require("../models/User");
const Homework = require("../models/Homework");
const Attendance = require("../models/Attendance");

const resolvers = {
  Query: {
    // Fetch all students with populated teacher and parent fields
    students: async () => {
      return await Student.find().populate("assignedTeacher assignedParent");
    },

    // Fetch students based on user role (teacher or parent)
    studentsByUser: async (_, { userId, role }) => {
      if (role === "teacher") {
        return await Student.find({ assignedTeacher: userId }).populate("assignedTeacher assignedParent");
      } else if (role === "parent") {
        return await Student.find({ assignedParent: userId }).populate("assignedTeacher assignedParent");
      }
      return [];
    },

    // ✅ Fetch all teachers
    teachers: async () => {
      return await User.find({ role: "teacher" });
    },

    // ✅ Fetch all parents
    parents: async () => {
      return await User.find({ role: "parent" });
    },


    homeworks: async () => {
      return await Homework.find().populate('createdBy');
    },



     getAttendanceByStudent: async (_, { studentId }) => {
      return await Attendance.find({ student: studentId })
        .populate("student")
        .populate("markedBy");
    },

    getAttendanceByTeacher: async (_, { teacherId }) => {
      return await Attendance.find({ markedBy: teacherId })
        .populate("student")
        .populate("markedBy");
    },
  },

  Mutation: {
    // Add a new student
    addStudent: async (_, { input }) => {
      const newStudent = new Student(input);
      await newStudent.save();
      return await newStudent.populate("assignedTeacher assignedParent");
    },

    // Delete a student by ID
    deleteStudent: async (_, { id }) => {
      await Student.findByIdAndDelete(id);
      return { success: true, message: "Deleted successfully" };
    },


    addHomework: async (_, { input }) => {
      const newHW = new Homework(input);
      await newHW.save();
      return await newHW.populate('createdBy');

    },

    deleteHomework: async (_, { id }) => {
      await Homework.findByIdAndDelete(id);
      return { success: true, message: "Homework deleted successfully" };
    },

    

   addAttendance: async (_, { input }) => {
  try {
    const newAttendance = new Attendance(input);
    await newAttendance.save();
    return {
      success: true,
      message: "Attendance marked successfully.",
    };
  } catch (error) {
    console.error("Attendance Error:", error.message);
    return {
      success: false,
      message: "Failed to mark attendance: " + error.message,
    };
  }
}


  },
};

module.exports = resolvers;
