import React from 'react';
import './Contact.css';

function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2>Contact Us</h2>
        <div className="contact-info">
          <div className="contact-item">
            <h3>📍 Location</h3>
            <p>Homagama, Colombo, Sri Lanka</p>
          </div>
          <div className="contact-item">
            <h3>💬 WhatsApp</h3>
            <a href="https://wa.me/94712524052" target="_blank" rel="noopener noreferrer">071 252 4052</a>
          </div>
          <div className="contact-item">
            <h3>📱 Facebook</h3>
            <a href="https://web.facebook.com/profile.php?id=61587902504009" target="_blank" rel="noopener noreferrer">Visit our page</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
