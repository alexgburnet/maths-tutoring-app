import React, { use } from 'react';
import { useState, useEffect } from 'react';
import UserService from '../../services/UserService';
import AuthService from '../../services/AuthService';

import './Sidebar.css';
import { FaUserCircle, FaBell, FaThLarge, FaTasks, FaCalendarAlt, FaStickyNote, FaStopwatch, FaChartLine, FaClock, FaCog, FaCheckCircle, FaUsers, FaBars, FaTimes } from 'react-icons/fa';
import { FaLock, FaSignOutAlt } from 'react-icons/fa';


export default function Sidebar({ isOpen, toggleSidebar }) {
  const [name, setname] = useState('Loading...');
  const [surname, setSurname] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [exp, setExp] = useState(0);

  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    console.log('Logging out...');
    await AuthService.logout();
    window.location.href = '/';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile') && !event.target.closest('.dropdown-menu')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = await UserService.getUserDetails();
      if (user) {
        setname(user.name);
        setSurname(user.surname);
        setIsAdmin(user.isAdmin);
        setExp(user.exp);
      } else {
        setname('Guest');
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <>
      {/* Toggle Button — shared but styled differently depending on sidebar state */}
      <button
        className={`sidebar-toggle-btn ${isOpen ? 'inside' : 'outside'}`}
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes size={25}/> : <FaBars size={25}/>}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {/* Top Profile Section */}
          <div className="sidebar-top">
            <div className="profile" onClick={() => setShowDropdown(prev => !prev)}>
              <FaUserCircle className="avatar" />
              <span className="username">{name} {surname} ▾</span>
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <a href="/settings" className="dropdown-item">
                  <FaCog /> Settings
                </a>
                <a href="/change-password" className="dropdown-item">
                  <FaLock /> Change Password
                </a>
                <button className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt /> Sign out
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="section">
            <div className="section-header">
              <FaUsers className="section-icon" />
              <span>{name} ▾</span>
            </div>
            <ul className="sidebar-links">
              <li className="active"><a href="/dashboard"><FaThLarge /> Dashboard</a></li>
            </ul>
          </div>

          {/* Footer */}
          <div className="settings-link">
            <a href="/settings"><FaCog /> Settings</a>
          </div>
        </div>
      </aside>
    </>
  );
}