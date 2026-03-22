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
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [imageStatus, setImageStatus] = useState('');

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

  const loadImageElement = (dataUrl) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  const canvasToBlob = (canvas, quality) => new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create compressed image blob.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const compressImageFile = async (file) => {
    const sourceDataUrl = await fileToDataUrl(file);
    const sourceImage = await loadImageElement(sourceDataUrl);

    const MAX_DIMENSION = 1400;
    const TARGET_SIZE_BYTES = 450 * 1024;
    const MIN_QUALITY = 0.45;
    const QUALITY_STEP = 0.07;
    const SCALE_STEP = 0.85;
    const MIN_DIMENSION = 700;

    let width = sourceImage.width;
    let height = sourceImage.height;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not initialize image processing.');
    }

    const drawSource = (drawWidth, drawHeight) => {
      canvas.width = drawWidth;
      canvas.height = drawHeight;
      context.clearRect(0, 0, drawWidth, drawHeight);
      context.drawImage(sourceImage, 0, 0, drawWidth, drawHeight);
    };

    drawSource(width, height);

    let quality = 0.9;
    let blob = await canvasToBlob(canvas, quality);

    while (blob.size > TARGET_SIZE_BYTES && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
      blob = await canvasToBlob(canvas, quality);
    }

    while (
      blob.size > TARGET_SIZE_BYTES &&
      width > MIN_DIMENSION &&
      height > MIN_DIMENSION
    ) {
      width = Math.max(MIN_DIMENSION, Math.round(width * SCALE_STEP));
      height = Math.max(MIN_DIMENSION, Math.round(height * SCALE_STEP));
      drawSource(width, height);

      quality = 0.82;
      blob = await canvasToBlob(canvas, quality);
      while (blob.size > TARGET_SIZE_BYTES && quality > MIN_QUALITY) {
        quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
        blob = await canvasToBlob(canvas, quality);
      }
    }

    const compressedDataUrl = await fileToDataUrl(blob);
    return {
      dataUrl: compressedDataUrl,
      originalBytes: file.size,
      compressedBytes: blob.size
    };
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      e.target.value = '';
      return;
    }

    const MAX_SOURCE_SIZE = 12 * 1024 * 1024; // 12MB
    if (file.size > MAX_SOURCE_SIZE) {
      alert('Image is too large. Please choose an image smaller than 12MB.');
      e.target.value = '';
      return;
    }

    setIsCompressingImage(true);
    setImageStatus('Optimizing image...');

    try {
      const compressed = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, img: compressed.dataUrl }));
      setImageStatus(
        `Image optimized: ${formatBytes(compressed.originalBytes)} -> ${formatBytes(compressed.compressedBytes)}`
      );
    } catch (err) {
      console.error('Failed to read image file:', err);
      alert('Failed to process image. Please try another file.');
      setImageStatus('');
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCompressingImage) {
      alert('Please wait until image optimization is complete.');
      return;
    }

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
    setImageStatus('');
    setIsCompressingImage(false);
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
          {imageStatus && <p className="form-status">{imageStatus}</p>}
          <p className="form-hint">Or enter image path/URL manually (example: /images/product.jpg)</p>
          <input placeholder="Image path or URL" value={formData.img} onChange={(e) => setFormData({...formData, img: e.target.value})} />
          {formData.img && (
            <div className="image-preview">
              <img src={formData.img} alt="Product preview" />
              <button type="button" onClick={() => setFormData({ ...formData, img: '' })}>Remove Image</button>
            </div>
          )}
          <p className="form-note">Note: Uploaded images are auto-optimized and saved in browser storage, not in /public/images on Vercel.</p>
          <label><input type="checkbox" checked={formData.isNew} onChange={(e) => setFormData({...formData, isNew: e.target.checked})} /> New Arrival</label>
          <label><input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({...formData, inStock: e.target.checked})} /> In Stock</label>
          <button type="submit" className="btn-success" disabled={isCompressingImage}>{isCompressingImage ? 'Processing Image...' : editIndex !== null ? 'Update' : 'Add'} Product</button>
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
