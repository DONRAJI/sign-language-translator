import React from 'react';
import { NavLink } from 'react-router-dom';
import { IoHome, IoVideocamOutline, IoSettingsOutline } from "react-icons/io5";
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <nav className="nav-container">
        {/* ✅ className을 간단하게 "nav-item"으로 고정합니다. */}
        <NavLink to="/home" className="nav-item">
          <IoHome />
          <span>홈</span>
        </NavLink>
        <NavLink to="/translator" className="nav-item">
          <IoVideocamOutline />
          <span>수어통역</span>
        </NavLink>
        <NavLink to="#" className="nav-item">
          <IoSettingsOutline />
          <span>설정</span>
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;