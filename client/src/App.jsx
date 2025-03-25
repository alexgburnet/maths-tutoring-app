import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import NotFound from "./components/NotFound";
import AuthPage from "./components/AuthPage/AuthPage";
import MainLayout from "./components/MainLayout/MainLayout";

function App() {
  
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/dashboard" element={<MainLayout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    );
}

export default App;