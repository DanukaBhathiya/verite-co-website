import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <h2>Verite & Co.</h2>
        <p>Premium Fashion for Gents & Women</p>
        <a href="#collections" className="cta-button">Shop Now</a>
      </div>
    </section>
  );
}

export default Hero;
