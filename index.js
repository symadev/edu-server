// server.js (or index.js)
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Models and GraphQL schema
const User = require('./models/User');
const Student = require('./models/Student');
const typeDefs = require('./Graphql/typeDefs');
const resolvers = require('./Graphql/resolvers');

// App setup
const app = express();
const port = process.env.PORT || 4000;




// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));




// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error(' DB Error:', err));




// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).send("Forbidden");
  }
};







const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};





// Start Apollo Server and attach to /graphql
async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({ req })
  }));





  // REST API routes (Admin only)
  app.get("/admin/teachers", verifyToken ,verifyAdmin, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send("Forbidden");
    const teachers = await User.find({ role: "teacher" });
    res.send(teachers);
  });




  app.post("/admin/teachers", verifyToken ,verifyAdmin, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send("Forbidden");
    const { name, email, password, subject, phone } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newTeacher = await User.create({ name, email, password: hashedPassword, role: "teacher", subject, phone });
      res.status(201).send({ success: true, user: newTeacher });
    } catch (err) {
      res.status(400).send({ success: false, message: err.message });
    }
  });





  app.delete("/admin/teachers/:id", verifyToken ,verifyAdmin, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send("Forbidden");
    try {
      await User.findByIdAndDelete(req.params.id);
      res.send({ message: "Teacher deleted successfully" });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });





  app.get("/admin/parents",verifyToken ,verifyAdmin, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send("Forbidden");
    const parents = await User.find({ role: "parent" });
    res.send(parents);
  });





  app.post("/admin/parents",verifyToken ,verifyAdmin, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send("Forbidden");
    const { name, email, phone, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ name, email, phone, password: hashedPassword, role: "parent" });
      res.status(201).send(newUser);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });





  app.delete("/admin/parents/:id", verifyToken ,verifyAdmin, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send("Forbidden");
    try {
      await User.findByIdAndDelete(req.params.id);
      res.send({ success: true });
    } catch (err) {
      res.status(500).send({ message: "Delete failed" });
    }
  });



 app.get("/admin/current", verifyToken ,verifyAdmin, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("name email");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



app.put("/admin/update", verifyToken ,verifyAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("name email");

    res.status(200).json({
      message: "Profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

  app.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.send(user);
});






  // Auth Routes
  app.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const newUser = await User.create({ name, email, password: hashedPassword, role });
      res.status(201).send({ success: true, user: newUser });
    } catch (err) {
      res.status(400).send({ success: false, message: err.message });
    }
  });





  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid email" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Wrong password" });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.send({ token, user });
    } catch (err) {
      res.status(500).send({ message: "Login failed", error: err.message });
    }
  });





  // Basic routes
  app.get('/', (req, res) => {
    res.send(' EduHalo Server is Running');
  });



  // Start server
  app.listen(port, () => {
    console.log(` Server ready at http://localhost:${port}/graphql`);
  });
}

startServer();
