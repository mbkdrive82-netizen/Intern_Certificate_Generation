const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Course', CourseSchema);
