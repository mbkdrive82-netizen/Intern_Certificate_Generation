const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CertificateTemplate',
      default: null
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null
    },
    filePath: {
      type: String,
      required: true
    },
    previewImagePath: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'GENERATED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    errorMessage: {
      type: String,
      default: ''
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Certificate', CertificateSchema);
