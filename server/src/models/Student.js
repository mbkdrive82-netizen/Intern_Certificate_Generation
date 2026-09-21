const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    year: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tempPassword: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for quick searching & filtering
StudentSchema.index({ name: 1, collegeId: 1, department: 1 });

module.exports = mongoose.model('Student', StudentSchema);
