const xlsx = require('xlsx');
const path = require('path');

const inputPath = path.join(__dirname, '../../../salem college internship.xlsx');
const outputPath = path.join(__dirname, '../../../salem_college_internship_formatted.xlsx');

const wb = xlsx.readFile(inputPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rawData = xlsx.utils.sheet_to_json(ws);

console.log(`Processing ${rawData.length} rows from raw Excel...`);

const formattedRows = rawData.map(row => {
  const rawName = (row['Full Name'] || row['Student Name'] || '').trim();
  const rawBranch = (row['Branch'] || row['Department'] || '').trim();
  const rawCourse = (row['Course Name'] || row['Course'] || 'IoT Application (ESP32)').trim();
  
  let dept = 'ECE';
  if (rawBranch.toLowerCase().includes('biomedical') || rawBranch.toLowerCase().includes('bme')) {
    dept = 'BME';
  } else if (rawBranch.toLowerCase().includes('electronics') || rawBranch.toLowerCase().includes('ece')) {
    dept = 'ECE';
  } else if (rawBranch) {
    dept = rawBranch;
  }

  return {
    'Student Name': rawName,
    'College Name': 'Salem College of Engineering and Technology',
    'Department': dept,
    'Academic Year': 'IV Year',
    'Sub Company': 'MBK TECHNOLOGY',
    'Course': rawCourse
  };
});

const newWb = xlsx.utils.book_new();
const newWs = xlsx.utils.json_to_sheet(formattedRows);

// Set column widths for readability
newWs['!cols'] = [
  { wch: 28 }, // Student Name
  { wch: 30 }, // College Name
  { wch: 15 }, // Department
  { wch: 15 }, // Academic Year
  { wch: 22 }, // Sub Company
  { wch: 32 }  // Course
];

xlsx.utils.book_append_sheet(newWb, newWs, 'Students');
xlsx.writeFile(newWb, outputPath);

console.log(`Successfully created formatted Excel file at: ${outputPath}`);
console.log(`Total rows written: ${formattedRows.length}`);
console.log('Sample row:', formattedRows[0]);
