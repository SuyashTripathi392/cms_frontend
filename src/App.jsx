// import { Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { Toaster } from 'react-hot-toast';

// import Login from './pages/auth/Login';
// import Dashboard from './pages/dashboard/Dashboard';

// function PrivateRoute({ children }) {
//   const { user, loading } = useAuth();

//   if (loading) return <p>Loading...</p>;

//   return user ? children : <Navigate to="/login" />;
// }

// function PublicRoute({ children }) {
//   const { user, loading } = useAuth();

//   if (loading) return <p>Loading...</p>;

//   return !user ? children : <Navigate to="/dashboard" />;
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//       <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//       <Route path="*" element={<Navigate to="/dashboard" />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
      
//         <Toaster position="top-right" />
//         <AppRoutes />
      
//     </AuthProvider>
//   );
// }


import {  Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import About from './pages/About.jsx';
import Skills from './pages/Skills.jsx';
import Projects from './pages/Projects.jsx';
import Certificates from './pages/Certificates.jsx';
import Contact from './pages/Contact.jsx';

// 🛡️ Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="about" element={<About />} />
            <Route path="skills" element={<Skills />} />
            <Route path="projects" element={<Projects />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          
          {/* Catch all - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    
  );
}

export default App;