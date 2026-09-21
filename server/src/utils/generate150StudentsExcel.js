const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const colleges = [
  'ABC Engineering College',
  'XYZ College of Technology',
  'DEF Institute of Engineering'
];

const departments = ['CSE', 'ECE', 'IT', 'EEE', 'MECH'];
const years = ['II', 'III', 'IV'];

const companyData = [
  {
    company: 'MBK',
    courses: [
      'Full Stack Web Development',
      'Python for Data Science',
      'Cloud Computing & DevOps',
      'MERN Stack Architecture'
    ],
    names: [
      'Aakash R', 'Abinaya S', 'Ajay Kumar M', 'Anand P', 'Archana K',
      'Balaji V', 'Bavithra N', 'Bharath C', 'Charan G', 'Deepa M',
      'Dhanush K', 'Dhivya R', 'Elango S', 'Ganesh Babu T', 'Gayathri P',
      'Gokulnath M', 'Hariharan B', 'Harini V', 'Hemalatha K', 'Irfan Ahmed S',
      'Jaganathan R', 'Jeevitha M', 'Kailash S', 'Kalaiyarasan P', 'Karthika D',
      'Kaviyarasu M', 'Keerthana N', 'Kishore Kumar B', 'Lavanya T', 'Madhan Raj K',
      'Manojkumar S', 'Meena R', 'Mohamed Bilal A', 'Monika V', 'Mugilan P',
      'Naveen Kumar R', 'Nithya Shree S', 'Parthiban K', 'Pavithra M', 'Prasanth V',
      'Praveen Kumar B', 'Priyanka S', 'Raghavan T', 'Rajesh K', 'Ramesh P',
      'Rohit S', 'Sangeetha M', 'Saravanan B', 'Sneha R', 'Surya Prakash K'
    ]
  },
  {
    company: 'SRITECH',
    courses: [
      'Embedded Systems & IoT',
      'Artificial Intelligence & ML',
      'Cyber Security & Ethical Hacking',
      'Data Analytics with PowerBI'
    ],
    names: [
      'Aadhira V', 'Abdul Rahman M', 'Abishek S', 'Aishwarya R', 'Akashdeep P',
      'Anitha K', 'Aravind M', 'Ashwin Kumar B', 'Balamurugan T', 'Bhuvana S',
      'Chandru P', 'Deepak Raj V', 'Devi Priya M', 'Dinesh Kumar K', 'Divyabharathi S',
      'Gautham R', 'Giridharan P', 'Gopinath M', 'Hariprasad S', 'Indhumathi K',
      'Jayanth B', 'Jithesh Kumar V', 'Kabilan R', 'Kanimozhi M', 'Karthikeyan P',
      'Kavitha S', 'Kiruthika B', 'Lokesh Kumar M', 'Manikandan R', 'Mithun P',
      'Mukesh S', 'Nandhini K', 'Naresh Kumar M', 'Nivetha P', 'Pradeep R',
      'Prathap S', 'Pugazhenthi K', 'Radhika M', 'Rahul Dravid S', 'Ranjith Kumar P',
      'Revathi B', 'Santhosh Kumar M', 'Sasikumar R', 'Senthamil Selvan P', 'Shalini S',
      'Sivasankar K', 'Subash M', 'Swetha R', 'Tamilselvan P', 'Vigneshwaran S'
    ]
  },
  {
    company: 'VENTHULIR',
    courses: [
      'VLSI Design & Verification',
      'Digital Marketing & Growth',
      'Robotics & Industrial Automation',
      'Mobile App Development (Flutter)'
    ],
    names: [
      'Aditya Narayan S', 'Ajith Kumar P', 'Akshaya M', 'Amarnath R', 'Annamalai K',
      'Appusamy V', 'Arunkumar S', 'Babu Rao M', 'Bhargavi P', 'Boopathi K',
      'Chitra S', 'Dayanidhi R', 'Dhanalakshmi M', 'Dharun Kumar P', 'Gnanavel S',
      'Gunasekaran K', 'Hari Priya M', 'Hemachandran R', 'Ilakkiya S', 'Janani P',
      'Jayachandran M', 'Kalidass R', 'Kamalesh S', 'Karthick Raja P', 'Kasthuri M',
      'Kaviarasan S', 'Kothandaraman R', 'Logeshwaran P', 'Madhumitha S', 'Mahalakshmi K',
      'Mohanraj M', 'Muthukumar P', 'Nagarajan S', 'Nalini R', 'Natarajan M',
      'Naveen Raj P', 'Nirmala S', 'Padmanabhan K', 'Poovarasan M', 'Pradeepa R',
      'Praveen Raj S', 'Ragul P', 'Rajkumar M', 'Rathnavel S', 'Rithika K',
      'Sabari Nathan M', 'Sakthi Vel P', 'Sandhiya S', 'Sathish Kumar R', 'Vinoth Kumar M'
    ]
  }
];

const allRows = [];

companyData.forEach(compObj => {
  compObj.names.forEach((name, idx) => {
    const college = colleges[idx % colleges.length];
    const department = departments[idx % departments.length];
    const year = years[idx % years.length];
    const course = compObj.courses[idx % compObj.courses.length];

    allRows.push({
      Name: name,
      College: college,
      Department: department,
      Year: year,
      Company: compObj.company,
      Course: course
    });
  });
});

console.log(`Generated ${allRows.length} student records (50 per company across ${companyData.length} companies).`);

const worksheet = xlsx.utils.json_to_sheet(allRows);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

// Write to multiple locations for instant availability
const locations = [
  path.join(__dirname, '../../../client/public/sample_students.xlsx'),
  path.join(__dirname, '../../../client/public/sample_students_150.xlsx'),
  path.join(__dirname, '../../../sample_students.xlsx'),
  path.join(__dirname, '../../../students_150_companies.xlsx')
];

locations.forEach(loc => {
  const dir = path.dirname(loc);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  xlsx.writeFile(workbook, loc);
  console.log('Saved:', loc);
});
