import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="brand">
          <span className="brand-mark">V</span>
          <div className="brand-copy">
            <h1 className="logo">VÉRITÉ & CO.</h1>
            <p className="tagline">YOU REVERYDAY FASHION INSPIRATION</p>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#collections">Collections</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
