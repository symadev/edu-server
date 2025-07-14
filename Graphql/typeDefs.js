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

  type Response {
    success: Boolean!
    message: String
  }

  type Query {
    students: [Student]
    studentsByUser(userId: ID!, role: String!): [Student]
    teachers: [User]
    parents: [User]
    homeworks: [Homework]
  }

  type Mutation {
    addStudent(input: AddStudentInput!): Student
    deleteStudent(id: ID!): Response

    addHomework(input: AddHomeworkInput!): Homework
    deleteHomework(id: ID!): Response
  }
`;

module.exports = typeDefs;
