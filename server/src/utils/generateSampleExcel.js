const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const sampleData = [
  {
    Name: 'Arun Kumar',
    College: 'AVS Engineering College',
    Department: 'ECE',
    Year: 'IV',
    Company: 'SRI TECH',
    Course: 'IoT Application (ESP32)',
    'From Date': '01.06.2026',
    'End Date': '15.06.2026'
  },
  {
    Name: 'Priya S',
    College: 'AVS Engineering College',
    Department: 'ECE',
    Year: 'IV',
    Company: 'SRI TECH',
    Course: 'IoT Application (ESP32)',
    'From Date': '01.06.2026',
    'End Date': '15.06.2026'
  },
  {
    Name: 'Rahul M',
    College: 'Paavai Engineering College',
    Department: 'CSE',
    Year: 'III',
    Company: 'VENTHULIR',
    Course: 'Full Stack Web Development',
    'From Date': '05.06.2026',
    'End Date': '20.06.2026'
  },
  {
    Name: 'Kavitha R',
    College: 'Paavai Engineering College',
    Department: 'IT',
    Year: 'III',
    Company: 'MBK',
    Course: 'Artificial Intelligence & Machine Learning',
    'From Date': '10.06.2026',
    'End Date': '25.06.2026'
  },
  {
    Name: 'Suresh V',
    College: 'AVS Engineering College',
    Department: 'MECH',
    Year: 'IV',
    Company: 'PAVECH',
    Course: 'Embedded Systems Design',
    'From Date': '01.06.2026',
    'End Date': '15.06.2026'
  }
];

const worksheet = xlsx.utils.json_to_sheet(sampleData);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

// Ensure client/public directory exists
const clientPublicDir = path.join(__dirname, '../../../client/public');
if (!fs.existsSync(clientPublicDir)) {
  fs.mkdirSync(clientPublicDir, { recursive: true });
}

const outputPath = path.join(clientPublicDir, 'sample_students.xlsx');
xlsx.writeFile(workbook, outputPath);

// Also copy to root for user visibility
const rootOutputPath = path.join(__dirname, '../../../sample_students.xlsx');
xlsx.writeFile(workbook, rootOutputPath);

console.log(`Sample Excel successfully generated at: ${outputPath} and ${rootOutputPath}`);
