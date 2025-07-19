const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Student {
    _id: ID!
    name: String!
    class: String!
    roll: String!
    section: String!
    assignedTeacher: User
    assignedParent: User
  }

  input AddStudentInput {
    name: String!
    class: String!
    roll: String!
    section: String!
    assignedTeacher: ID!
    assignedParent: ID!
  }

  type Homework {
    _id: ID!
    title: String!
    description: String!
  
    class: String!
    dueDate: String!
    createdBy: User
  }

  input AddHomeworkInput {
    title: String!
    description: String!
    
    class: String!
    dueDate: String!
    createdBy: ID!
  }

 

  
  type Attendance {
  _id: ID!
  student: Student!       
  date: String!
  status: String!
  markedBy: User!          
}

input AddAttendanceInput {
  date: String!
  student: ID!            
  status: String!
  markedBy: ID!
}



 

  type Result {
  _id: ID!
  student: Student!
  subject: String!
  marks: Int!
  grade: String
  remarks: String
  addedBy: User!
  date: String
}

input AddResultInput {
  student: ID!
  subject: String!
  marks: Int!
  grade: String
  remarks: String
  addedBy: ID!
}




type Notification {
  _id: ID!
  parentId: ID!
  message: String!
  type: String!
  isRead: Boolean!
  createdAt: String!
}

input NotificationInput {
  parentId: ID!
  message: String!
  type: String!
  isRead: Boolean
}


input FeedbackInput {
    type: String!      
    subject: String!
    message: String!
    rating: Int         
  }

  












type Response {
    success: Boolean!
    message: String
  }





  type Query {
    students: [Student]
    studentsByUser(userId: ID!, role: String!): [Student]
    teachers: [User]
    parents: [User]
    homeworksByTeacher(teacherId: ID!): [Homework]
    getAttendanceByStudent(studentId: ID!): [Attendance]
    getAttendanceByTeacher(teacherId: ID!): [Attendance]
    getResultsByStudent(studentId: ID!): [Result]
    notificationsByParent(parentId: ID!): [Notification]



    myChild(parentId: ID!): Student
    homeworkByChild(childId: ID!): [Homework]
    attendanceByChild(childId: ID!): [Attendance]
    resultByChild(childId: ID!): [Result]
  
  }




  type Mutation {
    addStudent(input: AddStudentInput!): Student
    deleteStudent(studentId: ID!): Response

    addHomework(input: AddHomeworkInput!): Homework
    deleteHomework(id: ID!): Response
    deleteResult(resultId: ID!): Response


     addAttendance(input: AddAttendanceInput!): Response
    addResult(input: AddResultInput!):  Response


    createNotification(input: NotificationInput!): Notification
  
    markNotificationsAsRead(parentId: ID!): Response

    deleteReadNotifications(parentId: ID!): Response



     createFeedbackOrComplaint(input: FeedbackInput!): Response



   
  }
`;

module.exports = typeDefs;
