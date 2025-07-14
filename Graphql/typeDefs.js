// graphql/typeDefs.js
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

  type Query {
    students: [Student]
    studentsByUser(userId: ID!, role: String!): [Student]
     teachers: [User]   
  parents: [User]
  }

  type Mutation {
    addStudent(input: AddStudentInput!): Student
    deleteStudent(id: ID!): Response
  }

  type Response {
    success: Boolean!
    message: String
  }
`;

module.exports = typeDefs;
