import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AuthForm from "./components/AuthForm/AuthForm";
import Dashboard from "./components/Dashboard/Dashboard";
import HomePage from "./components/HomePage/HomePage";
import Navbar from "./components/Navbar/Navbar";
import NotFound from "./components/NotFound";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./components/AdminPage/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { getTokenFromCookie } from "./auth";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!getTokenFromCookie());

  const handleLogout = () => {
      clearTokenCookie();
      onLogout();
      navigate("/");
    };

    return (
      <Router>
        <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
  
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthForm onAuth={() => setLoggedIn(true)} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard onLogout={() => setLoggedIn(false)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    );
}

export default App;