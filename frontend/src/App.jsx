/**
 * Main Application Component
 * Sets up routing, authentication context, and global providers
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider, { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Import pages
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import RoomManagement from './pages/admin/RoomManagement';
import StaffDashboard from './pages/staff/StaffDashboard';
import GuestManagement from './pages/staff/GuestManagement';
import BookingManagement from './pages/staff/BookingManagement';
import BookingOperations from './pages/staff/BookingOperations';
import ServiceManagement from './pages/staff/ServiceManagement';
import BillingManagement from './pages/staff/BillingManagement';

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { isAdmin } = useAuth();
  
  if (isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/staff/dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#363636',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* Application Routes */}
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected route for role-based redirect */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              }
            />

            {/* Admin routes (Admin only) */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute adminOnly>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute adminOnly>
                  <RoomManagement />
                </ProtectedRoute>
              }
            />

            {/* Staff routes (Staff and Admin can access) */}
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/guests"
              element={
                <ProtectedRoute>
                  <GuestManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/bookings"
              element={
                <ProtectedRoute>
                  <BookingManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/operations"
              element={
                <ProtectedRoute>
                  <BookingOperations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/services"
              element={
                <ProtectedRoute>
                  <ServiceManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/billing"
              element={
                <ProtectedRoute>
                  <BillingManagement />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;