import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { mensProducts, ladiesProducts } from '../data/products';

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  sizes: '',
  img: '',
  inStock: true,
  isNew: false,
  active: true
};

function AdminPanel() {
  const [products, setProducts] = useState({ mens: mensProducts, ladies: ladiesProducts });
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('mens');
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const saved = localStorage.getItem('veriteProducts');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setProducts({
        mens: Array.isArray(parsed.mens) ? parsed.mens : mensProducts,
        ladies: Array.isArray(parsed.ladies) ? parsed.ladies : ladiesProducts
      });
    } catch (err) {
      console.error('Failed to parse saved products:', err);
    }
  }, []);

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('veriteProducts', JSON.stringify(newProducts));
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      e.target.value = '';
      return;
    }

    const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB
    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image is too large. Please choose an image smaller than 1.5MB.');
      e.target.value = '';
      return;
    }

    try {
      const imageDataUrl = await fileToDataUrl(file);
      setFormData((prev) => ({ ...prev, img: imageDataUrl }));
    } catch (err) {
      console.error('Failed to read image file:', err);
      alert('Failed to read image. Please try another file.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanImage = formData.img.trim();
    if (!cleanImage) {
      alert('Please upload an image or provide an image path/URL.');
      return;
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: formData.price.trim(),
      sizes: formData.sizes.trim(),
      img: cleanImage
    };

    const newProducts = { ...products };
    if (editIndex !== null) {
      newProducts[category] = newProducts[category].map((item, index) =>
        (index === editIndex ? payload : item)
      );
    } else {
      newProducts[category] = [...newProducts[category], payload];
    }
    saveProducts(newProducts);
    resetForm();
  };

  const handleEdit = (cat, index) => {
    setCategory(cat);
    setEditIndex(index);
    setFormData({ ...products[cat][index] });
    setShowForm(true);
  };

  const handleDelete = (cat, index) => {
    if (window.confirm('Delete this product?')) {
      const newProducts = { ...products };
      newProducts[cat] = newProducts[cat].filter((_, i) => i !== index);
      saveProducts(newProducts);
    }
  };

  const toggleStock = (cat, index) => {
    const newProducts = { ...products };
    newProducts[cat] = newProducts[cat].map((item, i) =>
      (i === index ? { ...item, inStock: !item.inStock } : item)
    );
    saveProducts(newProducts);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setShowForm(false);
    setCategory('mens');
    setEditIndex(null);
  };

  return (
    <div className="admin-panel">
      <h2>Product Management</h2>
      <button onClick={() => setShowForm(!showForm)} className="btn-primary">
        {showForm ? 'Cancel' : '+ Add Product'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="mens">Men's</option>
            <option value="ladies">Ladies</option>
          </select>
          <input placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
          <input placeholder="Price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          <input placeholder="Sizes (optional)" value={formData.sizes} onChange={(e) => setFormData({...formData, sizes: e.target.value})} />
          <label className="field-label">Upload Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <p className="form-hint">Or enter image path/URL manually (example: /images/product.jpg)</p>
          <input placeholder="Image path or URL" value={formData.img} onChange={(e) => setFormData({...formData, img: e.target.value})} />
          {formData.img && (
            <div className="image-preview">
              <img src={formData.img} alt="Product preview" />
              <button type="button" onClick={() => setFormData({ ...formData, img: '' })}>Remove Image</button>
            </div>
          )}
          <p className="form-note">Note: Uploaded images are saved in this browser storage, not in /public/images on Vercel.</p>
          <label><input type="checkbox" checked={formData.isNew} onChange={(e) => setFormData({...formData, isNew: e.target.checked})} /> New Arrival</label>
          <label><input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({...formData, inStock: e.target.checked})} /> In Stock</label>
          <button type="submit" className="btn-success">{editIndex !== null ? 'Update' : 'Add'} Product</button>
        </form>
      )}

      <div className="products-list">
        <h3>Men's Products</h3>
        {products.mens.map((p, i) => (
          <div key={i} className="product-item">
            <img src={p.img} alt={p.title} />
            <div className="product-info">
              <h4>{p.title}</h4>
              <p>{p.price}</p>
              <span className={p.inStock ? 'in-stock' : 'out-stock'}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
              {p.isNew && <span className="new-badge">NEW</span>}
            </div>
            <div className="product-actions">
              <button onClick={() => toggleStock('mens', i)}>{p.inStock ? 'Mark Out' : 'Mark In'}</button>
              <button onClick={() => handleEdit('mens', i)}>Edit</button>
              <button onClick={() => handleDelete('mens', i)} className="btn-delete">Delete</button>
            </div>
          </div>
        ))}

        <h3>Ladies Products</h3>
        {products.ladies.map((p, i) => (
          <div key={i} className="product-item">
            <img src={p.img} alt={p.title} />
            <div className="product-info">
              <h4>{p.title}</h4>
              <p>{p.price}</p>
              <span className={p.inStock ? 'in-stock' : 'out-stock'}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
              {p.isNew && <span className="new-badge">NEW</span>}
            </div>
            <div className="product-actions">
              <button onClick={() => toggleStock('ladies', i)}>{p.inStock ? 'Mark Out' : 'Mark In'}</button>
              <button onClick={() => handleEdit('ladies', i)}>Edit</button>
              <button onClick={() => handleDelete('ladies', i)} className="btn-delete">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;
