// graphql/resolvers.js
const Student = require("../models/Student");
const User = require("../models/User");
const Homework = require("../models/Homework");
const Attendance = require("../models/Attendance");
const Notification = require("../models/Notification");
const Result = require("../models/Result");
const Feedback = require("../models/Feedback");

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


    // homeworks: async () => {
    //   return await Homework.find().populate('createdBy');   ......>>> this is wrong , cause because of this every teacher show the homeworks  not 
    // the specific or the assign one 
    // },


    homeworksByTeacher: async (_, { teacherId }) => {
      return await Homework.find({ createdBy: teacherId }).populate("createdBy");
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






    getResultsByStudent: async (_, { studentId }) => {
      return await Result.find({ student: studentId })
        .populate("student")
        .populate("addedBy");
    },



    myChild: async (_, { parentId }) => {
      return await Student.findOne({ assignedParent: parentId }).populate("assignedTeacher assignedParent");
    },
    homeworkByChild: async (_, { childId }) => {
      const student = await Student.findById(childId);
      if (!student) return [];
      return await Homework.find({ class: student.class }).populate("createdBy");
    },

    attendanceByChild: async (_, { childId }) => {
      return await Attendance.find({ student: childId });
    },
    resultByChild: async (_, { childId }) => {
      return await Result.find({ student: childId });
    },

    notificationsByParent: async (_, { parentId }) => {
      try {
        const notifications = await Notification.find({ parentId }).sort({ createdAt: -1 });
        return notifications;
      } catch (error) {
        throw new Error('Failed to fetch notifications');
      }
    },



 



  },




  Mutation: {
    // Add a new student
    addStudent: async (_, { input }) => {
      const newStudent = new Student(input);
      await newStudent.save();
      return await newStudent.populate("assignedTeacher assignedParent");
    },

     deleteStudent: async (_, { studentId }) => {
    await Student.findByIdAndDelete(studentId);
    return { success: true, message: "Student data deleted" };
  },

    addHomework: async (_, { input }) => {
      const newHW = new Homework(input);
      await newHW.save();
      const populatedHW = await newHW.populate("createdBy");

      // Step 1: Find all students of this class
      const students = await Student.find({ class: input.class });

      // Step 2: Get all unique parent IDs
      const parentIds = students
        .map((s) => s.assignedParent)
        .filter(Boolean); // avoid nulls

      // Step 3: Create notifications for each parent
      for (const parentId of parentIds) {
        await Notification.create({
          parentId,
          message: "New homework has been assigned.",
          type: "homework",
        });
      }

      return populatedHW;
    },







    deleteHomework: async (_, { id }) => {
      await Homework.findByIdAndDelete(id);
      return { success: true, message: "Homework deleted successfully" };
    },
     deleteResult: async (_, { resultId }) => {
    await Result.findByIdAndDelete(resultId);
    return { success: true, message: "Result deleted" };
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
    },




    addResult: async (_, { input }) => {
      try {
        const newResult = new Result(input);
        await newResult.save();

        const student = await Student.findById(input.student);
        if (student?.assignedParent) {
          await Notification.create({
            parentId: student.assignedParent,
            message: "Report card has been published.",
            type: "result",
          });
        }

        return {
          success: true,
          message: "Result added successfully.",
        };
      } catch (error) {
        console.error("Error adding result:", error.message);
        return {
          success: false,
          message: "Failed to add result: " + error.message,
        };
      }
    },

    //notification 

    createNotification: async (_, { input }) => {
      return await Notification.create(input);
    },


    markNotificationsAsRead: async (_, { parentId }) => {
      const result = await Notification.updateMany(
        { parentId, isRead: false },
        { $set: { isRead: true } }
      );
      return { success: true, message: `${result.modifiedCount} notifications marked as read` };
    },


    deleteReadNotifications: async (_, { parentId }) => {
      await Notification.deleteMany({ parentId, isRead: true });
      return "Read notifications deleted successfully";
    },





  createFeedbackOrComplaint: async (_, { input }) => {
      try {
        const feedback = new Feedback({
          type: input.type,
          subject: input.subject,
          message: input.message,
          rating: input.rating || null,
          createdAt: new Date(),
        });

        await feedback.save();

        return {
          success: true,
          message: 'Successfully saved your submission.',
        };
      } catch (error) {
        console.error('Error saving feedback:', error);
        return {
          success: false,
          message: 'Failed to save submission.',
        };
      }
    },





  },






};

module.exports = resolvers;
