const express = require('express')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
const cors = require('cors');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');



const User = require("./models/User");
const Student = require("./models/Student");
const bcrypt = require("bcryptjs");




//middleWire
app.use(cors())


//Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB Error:", err));






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



///admin-teacher

app.get("/admin/teachers", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");
  const teachers = await User.find({ role: "teacher" });
  res.send(teachers);
});


app.post("/admin/teachers", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  const { name, email, password, subject, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
      subject,
      phone
    });

    res.status(201).send({ success: true, user: newTeacher });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});




app.delete("/admin/teachers/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  try {
    await User.findByIdAndDelete(req.params.id);
    res.send({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});


// admin-parents

// Get all parents
app.get("/admin/parents", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");
  const parents = await User.find({ role: "parent" });
  res.send(parents);
});

// Add parent
app.post("/admin/parents", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  const { name, email, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "parent",
    });

    res.status(201).send(newUser);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Delete parent
app.delete("/admin/parents/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  try {
    await User.findByIdAndDelete(req.params.id);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ message: "Delete failed" });
  }
});




// ✅ Get all students
app.get("/students", async (req, res) => {
  const students = await Student.find().populate("assignedTeacher assignedParent", "name email");
  res.send(students);
});

// ✅ Add new student
app.post("/students", async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.send({ success: true, newStudent: student });
});

// ✅ Delete student
app.delete("/students/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.send({ success: true });
});





// Example protected route:
app.get("/users", async (req, res) => {
  const { role } = req.query;
  const filteredUsers = await User.find({ role });
  res.send({ success: true, data: filteredUsers });
});



// users?role=teacher দিলে শুধু টিচার
//  /users?role=parent দিলে শুধু প্যারেন্ট
// /users দিলে সব ইউজার






//for the signup

  app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    res.status(201).send({ success: true, user: newUser });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});




//for the login

app.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    //  এখানে role include করে token জেনারেট করো, কারণ ড্যাশবোর্ডে role লাগবে
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



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
