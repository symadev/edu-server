const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  title: String,
  description: String,
  class: String,
  dueDate: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Homework', homeworkSchema);
