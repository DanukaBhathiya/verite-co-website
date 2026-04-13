import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          &copy; {new Date().getFullYear()} {'V\u00C9RIT\u00C9'} All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
