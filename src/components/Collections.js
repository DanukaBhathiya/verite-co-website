import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Collections.css';
import { mensProducts, ladiesProducts } from '../data/products';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';

function Collections() {
  const [products, setProducts] = React.useState({ mens: mensProducts, ladies: ladiesProducts });

  React.useEffect(() => {
    const normalizeExternalLink = (link) => {
      const trimmed = (link || '').trim();
      if (!trimmed) return '';
      return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    };

    const loadProducts = async () => {
      if (hasSupabaseConfig && supabase) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (!data || data.length === 0) {
            setProducts({ mens: mensProducts, ladies: ladiesProducts });
            return;
          }

          const mapRow = (row) => ({
            id: row.id,
            img: row.img || '',
            title: row.title || '',
            description: row.description || '',
            sizes: row.sizes || '',
            price: row.price || '',
            inStock: row.in_stock === undefined ? true : Boolean(row.in_stock),
            isNew: Boolean(row.is_new),
            active: row.active === undefined ? true : Boolean(row.active),
            facebookLink: normalizeExternalLink(row.facebook_link || '')
          });

          setProducts({
            mens: data.filter((row) => row.category === 'mens').map(mapRow),
            ladies: data.filter((row) => row.category === 'ladies').map(mapRow)
          });
          return;
        } catch (err) {
          console.error('Failed to load cloud products, falling back to local:', err);
        }
      }

      const saved = localStorage.getItem('veriteProducts');
      if (saved) {
        try {
          setProducts(JSON.parse(saved));
          return;
        } catch (err) {
          console.error('Failed to parse local products:', err);
        }
      }
      setProducts({ mens: mensProducts, ladies: ladiesProducts });
    };

    loadProducts();
  }, []);

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    mobileFirst: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnDotsHover: true,
    swipe: true,
    draggable: true,
    touchMove: true,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 2, arrows: true } },
      { breakpoint: 1024, settings: { slidesToShow: 3, arrows: true } }
    ]
  };

  const activeProducts = (prods) => prods.filter(p => p.active);
  const getProductLink = (product) => {
    const link = (product.facebookLink || '').trim();
    if (!link) return '';
    return /^https?:\/\//i.test(link) ? link : `https://${link}`;
  };

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
                  {getProductLink(product) ? (
                    <a
                      href={getProductLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="product-image-link"
                    >
                      <img src={product.img} alt={product.title} />
                    </a>
                  ) : (
                    <img src={product.img} alt={product.title} />
                  )}
                  <div className="card-content">
                    <h4>{product.title}</h4>
                    <p className="price">{product.price}</p>
                    {getProductLink(product) && (
                      <a href={getProductLink(product)} target="_blank" rel="noopener noreferrer" className="product-link">
                        View on Facebook
                      </a>
                    )}
                  </div>
                  <div className="card-overlay">
                    <h4>{product.title}</h4>
                    <p className="description">{product.description}</p>
                    {product.sizes && <p className="sizes">Sizes: {product.sizes}</p>}
                    <p className="price">{product.price}</p>
                    {getProductLink(product) && (
                      <a href={getProductLink(product)} target="_blank" rel="noopener noreferrer" className="product-link overlay-link">
                        Open Facebook Post
                      </a>
                    )}
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
                  {getProductLink(product) ? (
                    <a
                      href={getProductLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="product-image-link"
                    >
                      <img src={product.img} alt={product.title} />
                    </a>
                  ) : (
                    <img src={product.img} alt={product.title} />
                  )}
                  <div className="card-content">
                    <h4>{product.title}</h4>
                    <p className="price">{product.price}</p>
                    {getProductLink(product) && (
                      <a href={getProductLink(product)} target="_blank" rel="noopener noreferrer" className="product-link">
                        View on Facebook
                      </a>
                    )}
                  </div>
                  <div className="card-overlay">
                    <h4>{product.title}</h4>
                    <p className="description">{product.description}</p>
                    <p className="price">{product.price}</p>
                    {getProductLink(product) && (
                      <a href={getProductLink(product)} target="_blank" rel="noopener noreferrer" className="product-link overlay-link">
                        Open Facebook Post
                      </a>
                    )}
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
