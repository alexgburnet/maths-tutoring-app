import "./Sidebar.css";

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>Menu</h2>
        <button className="close-btn" onClick={toggleSidebar}>×</button>
      </div>
      <ul className="sidebar-links">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/sessions">My Sessions</a></li>
        <li><a href="/notes">Notes</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </aside>
  );
}