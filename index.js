const express = require('express')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
const cors = require('cors');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const User = require("./models/User");
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

// Example protected route:
app.get("/users", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Only admin can access");
  const users = await User.find();
  res.send(users);
});





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
