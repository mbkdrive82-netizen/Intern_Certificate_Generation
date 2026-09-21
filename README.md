# TN SKILLS – STUDENT & CERTIFICATE MANAGEMENT SYSTEM

A complete, production-ready, database-backed web application built for managing colleges, student directories, department-wise tracking, Excel bulk imports, student credentials, dynamic certificate templates, and automated PDF certificate generation with strict role-based authorization.

---

## 🚀 TECHNOLOGY STACK

- **Frontend:** React.js, Vite, React Router DOM, Axios, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs password hashing
- **File Processing:** Multer (File Uploads), SheetJS / xlsx (Excel parsing & generation)
- **PDF Generation:** pdf-lib (Dynamic PDF template & graphics rendering)

---

## 👥 ROLE HIERARCHY & DEMO CREDENTIALS

The system implements 4 distinct roles with strict backend-enforced security boundaries:

| Role | Access Scope & Capabilities | Username | Password |
| :--- | :--- | :--- | :--- |
| **SM GROUPS MASTER ADMIN** | Master access to colleges, student data, Excel upload, credential exports, companies, courses, templates, and single/bulk PDF certificate generation. | `smadmin` | `adminpass` |
| **TNSKILLS MONITORING** | State monitoring access to view all colleges, department statistics, student lists, and certificate status. *(Cannot issue certificates)* | `tnskillsadmin` | `tnskillspass` |
| **COLLEGE ADMIN (ABC College)** | Isolated access strictly limited to own college students and department filters. | `abcadmin` | `collegepass` |
| **COLLEGE ADMIN (XYZ Tech)** | Isolated access strictly limited to own college students. | `xyzadmin` | `collegepass` |
| **COLLEGE ADMIN (DEF Eng)** | Isolated access strictly limited to own college students. | `defadmin` | `collegepass` |
| **STUDENT** | Isolated access strictly limited to own student profile and own PDF certificate download. | `arun.kumar` | `studentpass` |

---

## 📦 INSTALLATION & SETUP

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (MongoDB Server running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Install Dependencies
Run the unified workspace setup command from the project root:
```bash
npm run install:all
```
*(Or install individually: `cd server && npm install`, `cd client && npm install`)*

---

## 🗄️ DATABASE SEEDING

Seed the MongoDB database with sample colleges, departments, companies, courses, students, and default certificate templates:
```bash
npm run seed
```

---

## ⚙️ ENVIRONMENT VARIABLES (`server/.env`)

The server uses standard environment configuration in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tnskills_db
JWT_SECRET=tnskills_super_secret_jwt_key_2026_master
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

---

## 🏃 RUNNING THE APPLICATION

### Start Backend Express Server (Port 5000)
```bash
npm run server
```

### Start Frontend Vite Dev Server (Port 3000)
```bash
npm run client
```

Open your browser at: **`http://localhost:3000/`**

---

## 📄 EXCEL UPLOAD FORMAT

When uploading student records via SM GROUPS Admin (`/admin/upload`), the `.xlsx` file must contain these exact column headers in Row 1:

| Name | College | Department | Year | Company | Course |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Arun Kumar | ABC Engineering College | CSE | III | TechCorp Solutions | Full Stack Development |
| Priya S | ABC Engineering College | ECE | II | TechCorp Solutions | Python Programming |

---

## 📜 CERTIFICATE GENERATION & DYNAMIC PLACEHOLDERS

Certificate templates support automatic text replacement for the following placeholders:
- `{{student_name}}`
- `{{student_id}}`
- `{{college_name}}`
- `{{department}}`
- `{{year}}`
- `{{company}}`
- `{{course}}`
- `{{sub_company_name}}`
- `{{certificate_date}}`

---

## 🔒 SECURITY FEATURES

1. **Password Security:** All passwords are salt-hashed using `bcryptjs`. Plain text passwords are never stored in `User` documents.
2. **Backend Authorization:** Direct parameter scoping ensures College Admins cannot access other colleges' records, and Students cannot view or download other students' certificates.
3. **Secure Download API:** `GET /api/student/certificate/download` extracts identity directly from the authenticated JWT token before streaming the PDF file.
