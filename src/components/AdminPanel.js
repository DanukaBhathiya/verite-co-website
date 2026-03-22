import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel() {
  const [products, setProducts] = useState({ mens: [], ladies: [] });
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('mens');
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', sizes: '', img: '', inStock: true, isNew: false, active: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('veriteProducts');
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('veriteProducts', JSON.stringify(newProducts));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProducts = { ...products };
    if (editIndex !== null) {
      newProducts[category][editIndex] = formData;
    } else {
      newProducts[category].push(formData);
    }
    saveProducts(newProducts);
    resetForm();
  };

  const handleEdit = (cat, index) => {
    setCategory(cat);
    setEditIndex(index);
    setFormData(products[cat][index]);
    setShowForm(true);
  };

  const handleDelete = (cat, index) => {
    if (window.confirm('Delete this product?')) {
      const newProducts = { ...products };
      newProducts[cat].splice(index, 1);
      saveProducts(newProducts);
    }
  };

  const toggleStock = (cat, index) => {
    const newProducts = { ...products };
    newProducts[cat][index].inStock = !newProducts[cat][index].inStock;
    saveProducts(newProducts);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '', sizes: '', img: '', inStock: true, isNew: false, active: true });
    setShowForm(false);
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
          <input placeholder="Image path (e.g., /images/product.jpg)" value={formData.img} onChange={(e) => setFormData({...formData, img: e.target.value})} required />
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
