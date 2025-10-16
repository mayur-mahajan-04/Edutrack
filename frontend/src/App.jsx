import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import FaceRecognition from './pages/FaceRecognition';
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import ModelPreloader from './components/ModelPreloader';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Loading />;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to={`/${user.role}`} />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to={`/${user.role}`} />} 
        />
        
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teacher/*" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/face" 
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher']}>
              <FaceRecognition />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to={`/${user.role}`} /> : 
              <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/unauthorized" 
          element={<div style={{padding: '20px', textAlign: 'center'}}>Unauthorized Access</div>} 
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <ModelPreloader />
            <AppRoutes />
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;