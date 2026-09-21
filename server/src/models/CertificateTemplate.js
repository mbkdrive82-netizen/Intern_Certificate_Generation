const mongoose = require('mongoose');

const CertificateTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    filePath: {
      type: String,
      default: ''
    },
    smLogoPath: {
      type: String,
      default: ''
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

module.exports = mongoose.model('CertificateTemplate', CertificateTemplateSchema);
