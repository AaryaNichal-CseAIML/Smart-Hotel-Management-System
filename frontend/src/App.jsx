import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { HotelDataProvider } from './context/HotelDataContext';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import CustomerPage from './pages/CustomerPage';
import StaffPage from './pages/StaffPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <ThemeProvider>
      <HotelDataProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="rooms" element={<RoomsPage />} />
                
                {/* Role 1: Customer Routes */}
                <Route path="customer" element={<CustomerPage />} />
                <Route path="my-bookings" element={<CustomerPage />} />
                <Route path="guest/bookings" element={<CustomerPage />} />
                <Route path="guest/dashboard" element={<CustomerPage />} />

                {/* Role 2: Staff Routes */}
                <Route path="staff" element={<StaffPage />} />
                <Route path="staff/dashboard" element={<StaffPage />} />

                {/* Role 3: Admin Routes */}
                <Route path="admin" element={<AdminPage />} />
                <Route path="admin/dashboard" element={<AdminPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </HotelDataProvider>
    </ThemeProvider>
  );
}
