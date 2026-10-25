import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Users, ShoppingBag, Package, DollarSign, Scale,
  Star, Plus, Trash2, Check, MapPin, Truck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, pins, orders
  const [dashboardData, setDashboardData] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [pinsList, setPinsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New PIN form
  const [newPin, setNewPin] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  // New Product form
  const [pBrand, setPBrand] = useState('');
  const [pModel, setPModel] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('10');
  const [pCatId, setPCatId] = useState('1');
  const [pMsg, setPMsg] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [dash, prods, cats, pins, ords] = await Promise.all([
        api.getAdminDashboard(),
        api.getProducts(),
        api.getCategories(),
        api.getAdminServiceablePins(),
        api.getAdminOrders()
      ]);
      setDashboardData(dash);
      setProductsList(prods);
      setCategoriesList(cats);
      setPinsList(pins);
      setOrdersList(ords);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddPin = async (e) => {
    e.preventDefault();
    try {
      setPinMsg('');
      await api.addAdminServiceablePin({
        pincode: newPin,
        area_name: newArea,
        city: newCity,
        state: newState,
        estimated_delivery_days: 3
      });
      setNewPin('');
      setNewArea('');
      setNewCity('');
      setNewState('');
      setPinMsg('PIN added to delivery network!');
      const updatedPins = await api.getAdminServiceablePins();
      setPinsList(updatedPins);
    } catch (err) {
      setPinMsg(`Error: ${err.message}`);
    }
  };

  const handleDeletePin = async (id) => {
    if (!confirm('Remove this PIN from serviceable coverage?')) return;
    await api.deleteAdminServiceablePin(id);
    setPinsList(prev => prev.filter(p => p.id !== id));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setPMsg('');
      await api.adminCreateProduct({
        category_id: Number(pCatId),
        brand: pBrand,
        model_name: pModel,
        title: pTitle,
        description: pDesc,
        price: Number(pPrice),
        stock: Number(pStock),
        is_available: true,
        warranty_months: 12,
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
        specifications: []
      });
      setPMsg('Product created successfully in catalog!');
      setPBrand('');
      setPModel('');
      setPTitle('');
      setPDesc('');
      setPPrice('');
      const updatedProds = await api.getProducts();
      setProductsList(updatedProds);
    } catch (err) {
      setPMsg(`Error: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.adminDeleteProduct(id);
    setProductsList(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await api.updateAdminOrderStatus(orderId, { status: newStatus });
    const ords = await api.getAdminOrders();
    setOrdersList(ords);
  };

  if (loading || !dashboardData) {
    return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading Admin Console...</div>;
  }

  const { metrics } = dashboardData;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Portal</h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Catalogue management, serviceable delivery PINs, order operations, and customer analytics
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        {[
          { id: 'overview', label: 'Analytics Overview' },
          { id: 'products', label: `Catalogue (${productsList.length})` },
          { id: 'pins', label: `Serviceable PINs (${pinsList.length})` },
          { id: 'orders', label: `Orders (${ordersList.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? 'var(--primary)' : '#64748b',
              borderBottom: activeTab === t.id ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.925rem'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Analytics Overview */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>TOTAL REVENUE</span>
                <DollarSign size={16} color="var(--primary)" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px' }}>
                ₹{Math.round(metrics.total_revenue).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>ORDERS</span>
                <Package size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px' }}>
                {metrics.total_orders}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>PRODUCTS</span>
                <ShoppingBag size={16} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px' }}>
                {metrics.total_products}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>AI COMPARISONS</span>
                <Scale size={16} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px' }}>
                {metrics.total_comparisons}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>REVIEWS & VADER</span>
                <Star size={16} color="#ec4899" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px' }}>
                {metrics.total_reviews}
              </div>
            </div>
          </div>

          {/* Recent Operations tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
                Recent Comparisons Logged
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dashboardData.recent_comparisons.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.product_a} vs {c.product_b}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Scores: {Math.round(c.score_a * 100)}% vs {Math.round(c.score_b * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
                Recent Order Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dashboardData.recent_orders.map((o) => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Order #{o.id} - {o.user_name}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>₹{Math.round(o.total_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <span className="badge badge-primary">{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Catalogue Management */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '28px', alignItems: 'start' }}>
          {/* Add Product Form */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
              Add New Product to Catalog
            </h3>
            {pMsg && <div style={{ padding: '8px 12px', background: pMsg.startsWith('Error') ? '#fef2f2' : '#ecfdf5', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>{pMsg}</div>}
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category</label>
                <select value={pCatId} onChange={(e) => setPCatId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Brand</label>
                <input required type="text" value={pBrand} onChange={e => setPBrand(e.target.value)} placeholder="e.g. Sony" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Model Name</label>
                <input required type="text" value={pModel} onChange={e => setPModel(e.target.value)} placeholder="e.g. WH-CH720N" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Full Title</label>
                <input required type="text" value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="e.g. Sony WH-CH720N Wireless Headphones" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Price (₹)</label>
                  <input required type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="9990" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Stock</label>
                  <input required type="number" value={pStock} onChange={e => setPStock(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description</label>
                <textarea required rows={2} value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Lightweight noise canceling headphones..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
                <Plus size={16} /> Save Product
              </button>
            </form>
          </div>

          {/* Product List */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
              Current Catalog Products
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
              {productsList.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.title}</div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {p.brand} • ₹{Math.round(p.price).toLocaleString('en-IN')} • Stock: {p.stock}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="btn btn-sm"
                    style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px' }}
                    title="Delete product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Serviceable PIN Codes */}
      {activeTab === 'pins' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '28px', alignItems: 'start' }}>
          {/* Add PIN Form */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
              Add Serviceable PIN Code
            </h3>
            {pinMsg && <div style={{ padding: '8px 12px', background: pinMsg.startsWith('Error') ? '#fef2f2' : '#ecfdf5', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>{pinMsg}</div>}
            <form onSubmit={handleAddPin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>6-Digit Postal PIN *</label>
                <input required maxLength={6} type="text" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="e.g. 302022" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Area Name *</label>
                <input required type="text" value={newArea} onChange={e => setNewArea(e.target.value)} placeholder="e.g. Sitapura Logistics Hub" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>City *</label>
                  <input required type="text" value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="Jaipur" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>State *</label>
                  <input required type="text" value={newState} onChange={e => setNewState(e.target.value)} placeholder="Rajasthan" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
                <Plus size={16} /> Authorize PIN Code
              </button>
            </form>
          </div>

          {/* Serviceable PINs Table */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
              Active Delivery Serviceable Areas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
              {pinsList.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        {p.pincode}
                      </span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Active</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {p.area_name}, {p.city}, {p.state} (Est. {p.estimated_delivery_days} days)
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePin(p.id)}
                    className="btn btn-sm"
                    style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px' }}
                    title="Remove PIN coverage"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Order Status Management */}
      {activeTab === 'orders' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            All Customer Orders & Status Operations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {ordersList.map((o) => (
              <div key={o.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Order #{o.id} - {o.user_name} ({o.user_email})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Amount: ₹{Math.round(o.total_amount).toLocaleString('en-IN')} • City: {o.city} ({o.pincode}) • Items: {o.item_count}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge ${o.status === 'DELIVERED' ? 'badge-success' : 'badge-primary'}`}>
                    {o.status}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: 'white' }}
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
