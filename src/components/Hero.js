import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-ambient" aria-hidden="true" />
      <div className="hero-content">
        <p className="hero-kicker">Homagama | Colombo</p>
        <h2>Elevated essentials for him and her.</h2>
        <p>VÉRITÉ & CO. brings you flattering fits, premium comfort, and standout styles you can wear with confidence every day.</p>
        <div className="hero-actions">
          <a href="#collections" className="cta-button">Explore Collections</a>
          <a href="https://wa.me/94712524052" target="_blank" rel="noopener noreferrer" className="cta-button secondary">Talk on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
