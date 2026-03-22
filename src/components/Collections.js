import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Collections.css';
import { mensProducts, ladiesProducts } from '../data/products';

function Collections() {
  const [products, setProducts] = React.useState({ mens: mensProducts, ladies: ladiesProducts });

  React.useEffect(() => {
    const saved = localStorage.getItem('veriteProducts');
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, arrows: false } }
    ]
  };

  const activeProducts = (prods) => prods.filter(p => p.active);

  return (
    <section id="collections" className="collections">
      <div className="container">
        <h2>Our Collections</h2>
        
        <div className="carousel-section">
          <h3>Men's Products</h3>
          <Slider {...settings}>
            {activeProducts(products.mens).map((product, i) => (
              <div key={i} className="carousel-item">
                <div className="collection-card">
                  {product.isNew && <span className="badge new">NEW</span>}
                  {!product.inStock && <span className="badge out-of-stock">OUT OF STOCK</span>}
                  <img src={product.img} alt={product.title} />
                  <div className="card-content">
                    <h4>{product.title}</h4>
                    <p className="price">{product.price}</p>
                  </div>
                  <div className="card-overlay">
                    <h4>{product.title}</h4>
                    <p className="description">{product.description}</p>
                    {product.sizes && <p className="sizes">Sizes: {product.sizes}</p>}
                    <p className="price">{product.price}</p>
                    {!product.inStock && <p className="stock-status">Currently Out of Stock</p>}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <div className="carousel-section">
          <h3>Ladies Products</h3>
          <Slider {...settings}>
            {activeProducts(products.ladies).map((product, i) => (
              <div key={i} className="carousel-item">
                <div className="collection-card">
                  {product.isNew && <span className="badge new">NEW</span>}
                  {!product.inStock && <span className="badge out-of-stock">OUT OF STOCK</span>}
                  <img src={product.img} alt={product.title} />
                  <div className="card-content">
                    <h4>{product.title}</h4>
                    <p className="price">{product.price}</p>
                  </div>
                  <div className="card-overlay">
                    <h4>{product.title}</h4>
                    <p className="description">{product.description}</p>
                    <p className="price">{product.price}</p>
                    {!product.inStock && <p className="stock-status">Currently Out of Stock</p>}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

export default Collections;
