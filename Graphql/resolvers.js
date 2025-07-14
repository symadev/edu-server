// graphql/resolvers.js
const Student = require("../models/Student");
const User = require("../models/User");
const Homework = require("../models/Homework");

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

  },
};

module.exports = resolvers;
