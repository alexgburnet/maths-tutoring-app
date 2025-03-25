import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import NotFound from "./components/NotFound";
import AuthPage from "./components/AuthPage/AuthPage";
import Dashboard from "./components/Dashboard/Dashboard";
import YourBookings from "./components/Your Bookings/YourBookings";
import Settings from "./components/Settings/Settings";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import MakeBooking from "./components/MakeBooking/MakeBooking";
import Notes from "./components/Notes/Notes";
import Worksheets from "./components/Worksheets/Worksheets";

import MainLayout from "./components/MainLayout/MainLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<AuthPage />} />

          <Route path="/signup" element={<AuthPage />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/MakeBooking" element={<MakeBooking />} />
            <Route path="/YourBookings" element={<YourBookings />} />
            <Route path="/Notes" element={<Notes />} />
            <Route path="/Worksheets" element={<Worksheets />} />
            <Route path="/settings" element={<Settings />} />
            {/* You can keep adding more protected routes here */}
          </Route>

          {/* Admin-only Routes */}
          <Route
            element={
              <AdminRoute>
                <MainLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin" element={<AdminPanel />} />
            {/* More admin-only pages can go here */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    );
}

export default App;