# 🔐 TN SKILLS & SM GROUPS - ADMIN & COLLEGE CREDENTIALS

**Live Portal URL**: [https://intern.thesmgroups.com](https://intern.thesmgroups.com)  
**API Backend**: [https://intern-certificate-generation.onrender.com](https://intern-certificate-generation.onrender.com)  
**Database**: MongoDB Atlas (`tnskills_db`)

---

## 👑 1. SM GROUPS - Master Super Admin
Full administrative access to manage all colleges, companies, templates, excel uploads, bulk generation, credentials, and system settings.

| Portal | Username | Password | Role / Permissions |
| :--- | :--- | :--- | :--- |
| [Login Portal](https://intern.thesmgroups.com) | `smadmin` | `adminpass` | **SM_GROUPS_ADMIN** (Full Control) |

---

## 🏛️ 2. TNSKILLS / NAAN MUDHALVAN - State Monitoring Admin
State-level monitoring portal to view overall progress, college-wise statistics, department distributions, and download state reports.

| Portal | Username | Password | Role / Permissions |
| :--- | :--- | :--- | :--- |
| [Login Portal](https://intern.thesmgroups.com) | `tnskillsadmin` | `tnskillspass` | **TNSKILLS_ADMIN** (State Monitoring) |

---

## 🎓 3. COLLEGE ADMIN PORTALS
College-specific administration dashboards for principal, HODs, and placement officers to view their enrolled students, department certificates, and issuing status.

| College Name | College Code | Username | Password | Enrolled Students |
| :--- | :--- | :--- | :--- | :--- |
| **AVS Engineering College** | `AEC92` | `aec92_admin` | `College@123` | **62 Students** |
| **Salem College of Engineering and Technology** | `SCET` | `scet_admin` | `College@123` | **105 Students** |

---

## 👨‍🎓 4. STUDENT PORTAL (Credentials Access)
Students can log in to view their verified certificate, preview high-resolution graphics, and download print-ready A4 PDF.

- **Student Login URL**: [https://intern.thesmgroups.com](https://intern.thesmgroups.com)
- **Student Credentials List**:
  - Super Admin can download all student usernames & generated passwords anytime from:
    👉 **Admin Portal > Student Credentials > Export to Excel (`student_credentials.xlsx`)**
  - **Sample Student Login**:
    - **Username**: `arasu.m`
    - **Password**: `TNS#sbuVbH`
    - **Student ID**: `TNS-2026-00001`

---

## 🛡️ Security Note
- Passwords are encrypted with **Bcrypt (10 salt rounds)**.
- To reset any college admin password or student password, navigate to **Admin Dashboard > College Management / Student Credentials** or use the API.
