const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../../../56_students_list.xlsx');
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found at: ${inputPath}`);
  process.exit(1);
}

const workbook = xlsx.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log(`Read ${rawData.length} rows from ${inputPath}`);
console.log('Sample raw row:', rawData[0]);

const formattedStudents = rawData.map((row, index) => {
  const studentNum = index + 1; // 1-indexed

  // Extract fields gracefully with exact keys
  const name = (row['Full Name'] || row['Name'] || row['Student Name'] || row['NAME'] || row['name'] || '').toString().trim();
  const college = 'Salem College of Engineering and Technology';
  const department = 'BME';
  const year = 'IV';

  let company = 'SRI TECH';
  let course = 'IoT Based Monitoring & Control of Solar Parabolic Water Heater';
  let fromDate = '15.07.2026';
  let endDate = '25.07.2026';

  if (studentNum >= 1 && studentNum <= 10) {
    // Batch 1 (1 to 10)
    company = 'TSMG';
    course = 'Installation & Commissioning of IoT Solar Parabolic Water Heater';
    fromDate = '01.07.2026';
    endDate = '11.07.2026';
  } else if (studentNum >= 11 && studentNum <= 20) {
    // Batch 2 (11 to 20)
    company = 'TSMG';
    course = 'Installation & Commissioning of IoT Solar Parabolic Water Heater';
    fromDate = '13.07.2026';
    endDate = '23.07.2026';
  } else if (studentNum >= 21 && studentNum <= 30) {
    // Batch 3 (21 to 30)
    company = 'SRI TECH';
    course = 'IoT Based Monitoring & Control of Solar Parabolic Water Heater';
    fromDate = '15.07.2026';
    endDate = '25.07.2026';
  } else if (studentNum >= 31 && studentNum <= 40) {
    // Batch 4 (31 to 40)
    company = 'SRI TECH';
    course = 'IoT Based Monitoring & Control of Solar Parabolic Water Heater';
    fromDate = '22.07.2026';
    endDate = '01.08.2026';
  } else if (studentNum >= 41 && studentNum <= 50) {
    // Batch 5 (41 to 50)
    company = 'SRI TECH';
    course = 'IoT Based Monitoring & Control of Solar Parabolic Water Heater';
    fromDate = '03.08.2026';
    endDate = '13.08.2026';
  } else if (studentNum >= 51) {
    // Batch 6 (51 to 56)
    company = 'SRI TECH';
    course = 'IoT Based Monitoring & Control of Solar Parabolic Water Heater';
    fromDate = '10.08.2026';
    endDate = '20.08.2026';
  }

  return {
    'Name': name,
    'College': college,
    'Department': department,
    'Year': year,
    'Company': company,
    'Course': course,
    'From Date': fromDate,
    'End Date': endDate
  };
});

const newWorksheet = xlsx.utils.json_to_sheet(formattedStudents);
const newWorkbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Students');

const rootOutputPath = path.join(__dirname, '../../../56_students_ready_for_upload.xlsx');
xlsx.writeFile(newWorkbook, rootOutputPath);

const publicOutputPath = path.join(__dirname, '../../../client/public/56_students_ready_for_upload.xlsx');
xlsx.writeFile(newWorkbook, publicOutputPath);

console.log(`Successfully generated ${formattedStudents.length} formatted student rows!`);
console.log(`Saved at: ${rootOutputPath}`);
console.log(`Saved at: ${publicOutputPath}`);
