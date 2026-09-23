const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    logoPath: {
      type: String,
      default: ''
    },
    bgImagePath: {
      type: String,
      default: ''
    },
    templateStyle: {
      type: String,
      enum: ['sritech', 'mbk', 'venthulir', 'pavech', 'default'],
      default: 'default'
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model('Company', CompanySchema);