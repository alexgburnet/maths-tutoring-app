import React, { use } from 'react';
import { useState, useEffect } from 'react';
import UserService from '../../services/UserService';
import AuthService from '../../services/AuthService';
import { NavLink } from "react-router-dom";

import './Sidebar.css';
import { FiChevronDown } from 'react-icons/fi';
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { RxAvatar } from "react-icons/rx";
import { FaCog, FaUsers } from 'react-icons/fa';
import { FiSidebar } from "react-icons/fi";
import { FaLock, FaSignOutAlt } from 'react-icons/fa';


export default function Sidebar({ isOpen, toggleSidebar, routes }) {
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

  const handleDropdownNav = () => {
    setShowDropdown(false);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleMobilenav = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
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
        <FiSidebar size={20}/>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {/* Top Profile Section */}
          <div className="sidebar-top">
            <div className="profile" onClick={() => setShowDropdown(prev => !prev)}>
              <RxAvatar className="avatar" />
              <span className="username">{name} {surname} <FiChevronDown /></span>
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <NavLink
                  to="/settings"
                  className="dropdown-item"
                  onClick={handleDropdownNav}
                >
                  <FaCog /> Settings
                </NavLink>

                <NavLink
                  to="/change-password"
                  className="dropdown-item"
                  onClick={handleDropdownNav}
                >
                  <FaLock /> Change Password
                </NavLink>

                <button className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt /> Sign out
                </button>
              </div>
            )}
          </div>

          <hr className="horizontal-line"/>

          {/* Navigation */}
          <div className="section">
            <div className="section-header">
              <FaUsers className="section-icon" />
              <span>{name}</span>
              <FiChevronDown />
            </div>
            <ul className="sidebar-links">
              {routes.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      isActive ? 'sidebar-link active-link' : 'sidebar-link'
                    }
                    onClick={handleMobilenav}
                  >
                    <Icon />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <NavLink
            className="settings-link"
            to="/settings"
            onClick={handleMobilenav}
          >
            <p><HiOutlineCog6Tooth /> Settings</p>
          </NavLink>
        </div>
      </aside>
    </>
  );
}