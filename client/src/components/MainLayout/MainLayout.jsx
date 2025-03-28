import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import "./MainLayout.css";
import { ROUTES } from "../../config/routesConfig";

import UserService from "../../services/UserService";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchUser = async () => {
      const userDetails = await UserService.getUserDetails();
      setUser(userDetails);
    };
    fetchUser();
  }, []);

  if (!user) return null;

  const availableRoutes = ROUTES.filter(route =>
    route.roles.includes(user.isAdmin ? "admin" : "user")
  );

  return (
    <div className="layout">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        routes={availableRoutes}
      />
      <div className={`main-content scrollable ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}