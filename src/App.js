import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Collections from './components/Collections';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Collections />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
