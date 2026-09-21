import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';

// SM GROUPS Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminColleges from './pages/admin/AdminColleges';
import AdminStudents from './pages/admin/AdminStudents';
import AdminExcelUpload from './pages/admin/AdminExcelUpload';
import AdminCredentials from './pages/admin/AdminCredentials';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCertificateTemplates from './pages/admin/AdminCertificateTemplates';
import AdminCertificateGenerate from './pages/admin/AdminCertificateGenerate';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminSettings from './pages/admin/AdminSettings';

// TNSKILLS Pages
import TNSkillsDashboard from './pages/tnskills/TNSkillsDashboard';
import TNSkillsColleges from './pages/tnskills/TNSkillsColleges';
import TNSkillsCollegeDetail from './pages/tnskills/TNSkillsCollegeDetail';

// COLLEGE Pages
import CollegeDashboard from './pages/college/CollegeDashboard';
import CollegeStudents from './pages/college/CollegeStudents';

// STUDENT Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentCertificate from './pages/student/StudentCertificate';

const RootRedirect = () => {
  const { user, loading, getDefaultRoute } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultRoute(user.role)} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* SM GROUPS Master Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SM_GROUPS_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/colleges" element={<AdminColleges />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/upload" element={<AdminExcelUpload />} />
            <Route path="/admin/credentials" element={<AdminCredentials />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/certificate-templates" element={<AdminCertificateTemplates />} />
            <Route path="/admin/generate-certificates" element={<AdminCertificateGenerate />} />
            <Route path="/admin/certificates" element={<AdminCertificates />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* TNSKILLS Monitoring Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['TNSKILLS_ADMIN', 'SM_GROUPS_ADMIN']} />}>
            <Route path="/tnskills/dashboard" element={<TNSkillsDashboard />} />
            <Route path="/tnskills/colleges" element={<TNSkillsColleges />} />
            <Route path="/tnskills/colleges/:id" element={<TNSkillsCollegeDetail />} />
          </Route>

          {/* COLLEGE Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['COLLEGE_ADMIN']} />}>
            <Route path="/college/dashboard" element={<CollegeDashboard />} />
            <Route path="/college/students" element={<CollegeStudents />} />
          </Route>

          {/* STUDENT Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/certificate" element={<StudentCertificate />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
