const mongoose = require('mongoose');



//we create the model here //for the mongoose 

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["parent", "teacher", "admin"], default: "parent" }
});

module.exports = mongoose.model("User", userSchema);
