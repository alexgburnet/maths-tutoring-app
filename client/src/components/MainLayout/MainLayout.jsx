import { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <header className="main-header">
          <button className="menu-btn" onClick={toggleSidebar}>☰</button>
          <h1>Welcome</h1>
        </header>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}