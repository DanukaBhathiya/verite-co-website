import React, { useState, useEffect, useRef } from 'react';
import './AdminPanel.css';
import { mensProducts, ladiesProducts } from '../data/products';

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  sizes: '',
  img: '',
  facebookLink: '',
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
  const [dataSyncStatus, setDataSyncStatus] = useState('');
  const importFileInputRef = useRef(null);

  const normalizeExternalLink = (link) => {
    const trimmed = String(link || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const sanitizeProduct = (product = {}) => ({
    ...EMPTY_FORM,
    ...product,
    title: String(product.title || '').trim(),
    description: String(product.description || '').trim(),
    price: String(product.price || '').trim(),
    sizes: String(product.sizes || '').trim(),
    img: String(product.img || '').trim(),
    facebookLink: normalizeExternalLink(product.facebookLink || ''),
    inStock: product.inStock === undefined ? true : Boolean(product.inStock),
    isNew: Boolean(product.isNew),
    active: product.active === undefined ? true : Boolean(product.active)
  });

  const normalizeProductSet = (value) => ({
    mens: Array.isArray(value?.mens) ? value.mens.map(sanitizeProduct) : [],
    ladies: Array.isArray(value?.ladies) ? value.ladies.map(sanitizeProduct) : []
  });

  useEffect(() => {
    const saved = localStorage.getItem('veriteProducts');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const normalizeLegacy = (items) => (Array.isArray(items) ? items.map((item) => ({
        ...EMPTY_FORM,
        ...item,
        title: String(item.title || '').trim(),
        description: String(item.description || '').trim(),
        price: String(item.price || '').trim(),
        sizes: String(item.sizes || '').trim(),
        img: String(item.img || '').trim(),
        facebookLink: (() => {
          const trimmed = String(item.facebookLink || '').trim();
          if (!trimmed) return '';
          return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        })(),
        inStock: item.inStock === undefined ? true : Boolean(item.inStock),
        isNew: Boolean(item.isNew),
        active: item.active === undefined ? true : Boolean(item.active)
      })) : []);

      const normalized = {
        mens: normalizeLegacy(parsed?.mens),
        ladies: normalizeLegacy(parsed?.ladies)
      };
      setProducts({
        mens: normalized.mens.length ? normalized.mens : mensProducts,
        ladies: normalized.ladies.length ? normalized.ladies : ladiesProducts
      });
    } catch (err) {
      console.error('Failed to parse saved products:', err);
    }
  }, []);

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('veriteProducts', JSON.stringify(newProducts));
  };

  const handleExportProducts = () => {
    try {
      const payload = JSON.stringify(products, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `verite-products-${dateStamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDataSyncStatus('Products exported successfully.');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export products.');
    }
  };

  const handleImportProducts = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const imported = normalizeProductSet(parsed);

      if (!imported.mens.length && !imported.ladies.length) {
        alert('Import file has no products.');
        return;
      }

      const shouldImport = window.confirm('Import will replace current product list. Continue?');
      if (!shouldImport) return;

      saveProducts(imported);
      setDataSyncStatus(`Imported ${imported.mens.length + imported.ladies.length} products successfully.`);
      resetForm();
    } catch (err) {
      console.error('Import failed:', err);
      alert('Invalid JSON file. Please select a valid product export.');
    } finally {
      e.target.value = '';
    }
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
      img: cleanImage,
      facebookLink: normalizeExternalLink(formData.facebookLink || '')
    };

    const newProducts = { ...products };
    if (editIndex !== null) {
      newProducts[category] = newProducts[category].map((item, index) =>
        (index === editIndex ? payload : item)
      );
    } else {
      newProducts[category] = [payload, ...newProducts[category]];
    }
    saveProducts(newProducts);
    resetForm();
  };

  const handleEdit = (cat, index) => {
    setCategory(cat);
    setEditIndex(index);
    const product = products[cat][index];
    setFormData({
      ...EMPTY_FORM,
      ...product,
      facebookLink: product.facebookLink || ''
    });
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
      <div className="admin-top-actions">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
        <button type="button" onClick={handleExportProducts} className="btn-secondary">
          Export Products
        </button>
        <button type="button" onClick={() => importFileInputRef.current?.click()} className="btn-secondary">
          Import Products
        </button>
        <input
          ref={importFileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportProducts}
          style={{ display: 'none' }}
        />
      </div>
      {dataSyncStatus && <p className="sync-status">{dataSyncStatus}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="mens">Men's</option>
            <option value="ladies">Ladies</option>
          </select>
          <input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          <input placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
          <input placeholder="Sizes (optional)" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} />
          <input
            placeholder="Facebook product link (optional)"
            value={formData.facebookLink}
            onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
          />
          <label className="field-label">Upload Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imageStatus && <p className="form-status">{imageStatus}</p>}
          <p className="form-hint">Or enter image path/URL manually (example: /images/product.jpg)</p>
          <input placeholder="Image path or URL" value={formData.img} onChange={(e) => setFormData({ ...formData, img: e.target.value })} />
          {formData.img && (
            <div className="image-preview">
              <img src={formData.img} alt="Product preview" />
              <button type="button" onClick={() => setFormData({ ...formData, img: '' })}>Remove Image</button>
            </div>
          )}
          <p className="form-note">Note: Uploaded images are auto-optimized and saved in browser storage, not in /public/images on Vercel.</p>
          <label><input type="checkbox" checked={formData.isNew} onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })} /> New Arrival</label>
          <label><input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })} /> In Stock</label>
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
              {p.facebookLink && (
                <a href={p.facebookLink} target="_blank" rel="noopener noreferrer">Facebook Link</a>
              )}
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
              {p.facebookLink && (
                <a href={p.facebookLink} target="_blank" rel="noopener noreferrer">Facebook Link</a>
              )}
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
