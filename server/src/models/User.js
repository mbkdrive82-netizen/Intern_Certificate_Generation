const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['SM_GROUPS_ADMIN', 'TNSKILLS_ADMIN', 'COLLEGE_ADMIN', 'STUDENT'],
      required: true
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      default: null
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', UserSchema);
