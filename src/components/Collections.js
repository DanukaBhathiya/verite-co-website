import React from 'react';
import './Collections.css';

function Collections() {
  const products = [
    { img: '/images/men\'s denim shorts - men.jpg', title: "Men's Denim Shorts" },
    { img: '/images/sarongs - men.jpg', title: 'Sarongs' },
    { img: '/images/ladies long floral skirt - ladies.jpg', title: 'Ladies Long Floral Skirt' },
    { img: '/images/ladies pants - ladies.jpg', title: 'Ladies Pants' }
  ];

  return (
    <section id="collections" className="collections">
      <div className="container">
        <h2>Our Collections</h2>
        <div className="collection-grid">
          {products.map((product, i) => (
            <div key={i} className="collection-card">
              <img src={product.img} alt={product.title} />
              <h3>{product.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Collections;
