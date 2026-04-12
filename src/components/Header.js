import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="brand">
          <div className="brand-mark">
            <img src="/images/logo.png" alt="Verite & Co logo" className="brand-logo-image" />
          </div>
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
