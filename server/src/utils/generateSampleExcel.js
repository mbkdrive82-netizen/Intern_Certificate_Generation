const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const sampleData = [
  {
    Name: 'Arun Kumar',
    College: 'ABC Engineering College',
    Department: 'CSE',
    Year: 'III',
    Company: 'TechCorp Solutions',
    Course: 'Full Stack Development'
  },
  {
    Name: 'Priya S',
    College: 'ABC Engineering College',
    Department: 'ECE',
    Year: 'II',
    Company: 'TechCorp Solutions',
    Course: 'Python Programming'
  },
  {
    Name: 'Rahul M',
    College: 'XYZ College of Technology',
    Department: 'IT',
    Year: 'IV',
    Company: 'Apex Innovations',
    Course: 'Digital Marketing'
  },
  {
    Name: 'Kavitha R',
    College: 'XYZ College of Technology',
    Department: 'CSE',
    Year: 'III',
    Company: 'Apex Innovations',
    Course: 'Data Analytics'
  },
  {
    Name: 'Suresh V',
    College: 'DEF Institute of Engineering',
    Department: 'MECH',
    Year: 'IV',
    Company: 'TechCorp Solutions',
    Course: 'AI & Machine Learning'
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
