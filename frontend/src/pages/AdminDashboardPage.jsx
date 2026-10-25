import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Users, ShoppingBag, Package, DollarSign, Scale,
  Star, Plus, Trash2, Check, MapPin, Truck, ShieldCheck,
  TrendingUp, AlertTriangle, Search, Filter, RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, pins, orders
  const [dashboardData, setDashboardData] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [pinsList, setPinsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search filters
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

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
    setPinMsg('');
    try {
      await api.createAdminServiceablePin({
        pincode: newPin,
        area_name: newArea,
        city: newCity,
        state: newState,
        is_serviceable: true
      });
      setPinMsg('PIN registered successfully!');
      setNewPin('');
      setNewArea('');
      setNewCity('');
      setNewState('');
      const updatedPins = await api.getAdminServiceablePins();
      setPinsList(updatedPins);
    } catch (err) {
      setPinMsg(`Error: ${err.message}`);
    }
  };

  const handleTogglePin = async (pinObj) => {
    try {
      await api.updateAdminServiceablePin(pinObj.id, {
        is_serviceable: !pinObj.is_serviceable
      });
      const updated = await api.getAdminServiceablePins();
      setPinsList(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setPMsg('');
    try {
      await api.adminCreateProduct({
        category_id: parseInt(pCatId, 10),
        brand: pBrand,
        model_name: pModel,
        title: pTitle,
        description: pDesc,
        price: parseFloat(pPrice),
        stock: parseInt(pStock, 10),
        is_available: true
      });
      setPMsg('Product created successfully in catalogue!');
      setPBrand('');
      setPModel('');
      setPTitle('');
      setPDesc('');
      setPPrice('');
      const prods = await api.getProducts();
      setProductsList(prods);
    } catch (err) {
      setPMsg(`Error: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to remove this product from the catalogue?')) return;
    await api.adminDeleteProduct(id);
    setProductsList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await api.updateAdminOrderStatus(orderId, { status: newStatus });
    const ords = await api.getAdminOrders();
    setOrdersList(ords);
  };

  if (loading || !dashboardData) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center', color: '#565959' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px auto' }} />
        <div style={{ fontWeight: 600 }}>Loading Seller Central Console...</div>
      </div>
    );
  }

  const { metrics } = dashboardData;

  const filteredProducts = productsList.filter(
    (p) =>
      p.title.toLowerCase().includes(prodSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const filteredOrders = ordersList.filter(
    (o) =>
      String(o.id).includes(orderSearch) ||
      (o.shipping_address?.city || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.status || '').toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div style={{ background: '#f0f2f2', minHeight: '100vh', paddingBottom: '48px' }}>
      {/* Amazon Seller Central Top Bar */}
      <div
        style={{
          background: '#232f3e',
          color: 'white',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #131921'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.5px' }}>smartcommerce</span>
            <span style={{ fontSize: '0.85rem', color: '#febd69', fontWeight: 700, marginLeft: '3px' }}>seller central</span>
          </div>
          <span style={{ fontSize: '0.75rem', background: '#37475a', padding: '3px 8px', borderRadius: '4px' }}>
            Store: SmartCommerce Direct (India) 🇮🇳
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem' }}>
          <span style={{ color: '#4ade80', fontWeight: 600 }}>● Account Health: Excellent</span>
          <button
            onClick={loadAll}
            className="btn btn-sm"
            style={{ background: '#37475a', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <RefreshCw size={12} /> Sync Live Data
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '24px' }}>
        {/* Amazon Seller KPI Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          {/* Revenue */}
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: '8px', border: '1px solid #d5d9d9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#565959', textTransform: 'uppercase' }}>
              Gross Merchandise Value
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f1111', marginTop: '6px' }}>
              ₹{Math.round(metrics.total_revenue).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#007600', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={12} /> +18.4% vs last cycle
            </div>
          </div>

          {/* Orders */}
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: '8px', border: '1px solid #d5d9d9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#565959', textTransform: 'uppercase' }}>
              Total Orders Fulfilled
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f1111', marginTop: '6px' }}>
              {metrics.total_orders}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#565959', marginTop: '4px' }}>
              100% On-Time Delivery Rate
            </div>
          </div>

          {/* Products */}
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: '8px', border: '1px solid #d5d9d9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#565959', textTransform: 'uppercase' }}>
              Active Catalogue Items
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f1111', marginTop: '6px' }}>
              {metrics.total_products}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#007185', fontWeight: 600, marginTop: '4px' }}>
              Across {categoriesList.length} Electronic Categories
            </div>
          </div>

          {/* Serviceable PINs */}
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: '8px', border: '1px solid #d5d9d9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#565959', textTransform: 'uppercase' }}>
              Serviceable PIN Hubs
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f1111', marginTop: '6px' }}>
              {pinsList.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#007600', fontWeight: 700, marginTop: '4px' }}>
              ✓ Same-Day / 24h Express
            </div>
          </div>

          {/* AI Decision Comparisons */}
          <div style={{ background: 'white', padding: '18px 20px', borderRadius: '8px', border: '1px solid #d5d9d9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#565959', textTransform: 'uppercase' }}>
              AI Decision Sessions
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#c45500', marginTop: '6px' }}>
              {metrics.total_comparisons}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#565959', marginTop: '4px' }}>
              {metrics.total_reviews} VADER Aspect Reviews
            </div>
          </div>
        </div>

        {/* Tab Navigation (Amazon Style) */}
        <div
          style={{
            display: 'flex',
            background: 'white',
            borderRadius: '8px 8px 0 0',
            border: '1px solid #d5d9d9',
            borderBottom: 'none',
            overflow: 'hidden'
          }}
        >
          {[
            { id: 'overview', label: 'Dashboard Overview' },
            { id: 'products', label: `Manage Inventory (${productsList.length})` },
            { id: 'pins', label: `Logistics & Serviceable PINs (${pinsList.length})` },
            { id: 'orders', label: `Manage Orders (${ordersList.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 22px',
                border: 'none',
                background: activeTab === tab.id ? '#ffffff' : '#f7f7f7',
                borderBottom: activeTab === tab.id ? '3px solid #e67a00' : '1px solid #d5d9d9',
                borderRight: '1px solid #e7e7e7',
                fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? '#0f1111' : '#565959',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div
          style={{
            background: 'white',
            border: '1px solid #d5d9d9',
            borderRadius: '0 0 8px 8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                {/* Recent Orders Overview */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1111', marginBottom: '14px' }}>
                    Recent Orders & Fulfillment Status
                  </h3>
                  <div style={{ border: '1px solid #e7e7e7', borderRadius: '6px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead style={{ background: '#f7f7f7', borderBottom: '1px solid #e7e7e7' }}>
                        <tr>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order ID</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Destination</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Amount</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersList.slice(0, 6).map((ord) => (
                          <tr key={ord.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#007185' }}>
                              #{ord.id}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#333' }}>
                              {ord.shipping_address?.city || 'Jaipur'} ({ord.shipping_address?.pincode || '302022'})
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                              ₹{Math.round(ord.total_amount).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: ord.status === 'delivered' ? '#dcfce7' : '#fef9c3',
                                  color: ord.status === 'delivered' ? '#15803d' : '#854d0e'
                                }}
                              >
                                {ord.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Logistics Hubs Summary */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1111', marginBottom: '14px' }}>
                    Active Delivery Hubs ({pinsList.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pinsList.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          padding: '10px 14px',
                          border: '1px solid #e7e7e7',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: p.is_serviceable ? '#ffffff' : '#fcfcfc'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 800, color: '#0f1111', fontSize: '0.9rem' }}>
                            {p.pincode}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#565959', marginLeft: '8px' }}>
                            {p.area_name}, {p.city}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: p.is_serviceable ? '#007600' : '#cc0c39',
                            background: p.is_serviceable ? '#f0fdf4' : '#fef2f2',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: `1px solid ${p.is_serviceable ? '#bbf7d0' : '#fecaca'}`
                          }}
                        >
                          {p.is_serviceable ? '24h Delivery' : 'Suspended'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE INVENTORY */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
                {/* Products List Table */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search size={15} color="#565959" style={{ position: 'absolute', top: '9px', left: '10px' }} />
                      <input
                        type="text"
                        value={prodSearch}
                        onChange={(e) => setProdSearch(e.target.value)}
                        placeholder="Search inventory SKU or brand..."
                        style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#565959' }}>
                      Showing {filteredProducts.length} items
                    </span>
                  </div>

                  <div style={{ border: '1px solid #e7e7e7', borderRadius: '6px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead style={{ background: '#f7f7f7', borderBottom: '1px solid #e7e7e7' }}>
                        <tr>
                          <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Item Name</th>
                          <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Brand</th>
                          <th style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>Price</th>
                          <th style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>Stock</th>
                          <th style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '10px', fontWeight: 600, color: '#0f1111', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.title}
                            </td>
                            <td style={{ padding: '10px', color: '#565959' }}>{p.brand}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>
                              ₹{Math.round(p.price).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: p.stock > 5 ? '#f0fdf4' : '#fffbeb',
                                  color: p.stock > 5 ? '#15803d' : '#b45309',
                                  border: `1px solid ${p.stock > 5 ? '#bbf7d0' : '#fde68a'}`
                                }}
                              >
                                {p.stock} units
                              </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                title="Delete SKU"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Product Form */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f1111', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} color="#e67a00" /> Add New Inventory Item
                  </h3>
                  {pMsg && (
                    <div style={{ padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '12px', background: pMsg.startsWith('Error') ? '#fef2f2' : '#f0fdf4', color: pMsg.startsWith('Error') ? '#b91c1c' : '#15803d' }}>
                      {pMsg}
                    </div>
                  )}
                  <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>Category</label>
                      <select value={pCatId} onChange={(e) => setPCatId(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        {categoriesList.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>Brand</label>
                      <input required type="text" value={pBrand} onChange={(e) => setPBrand(e.target.value)} placeholder="e.g. Sony" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>

                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>Model Name</label>
                      <input required type="text" value={pModel} onChange={(e) => setPModel(e.target.value)} placeholder="e.g. WH-1000XM5" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>

                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>Title</label>
                      <input required type="text" value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="e.g. Sony WH-1000XM5 Wireless Headphones" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>Price (₹)</label>
                        <input required type="number" value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="24990" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>Stock Units</label>
                        <input required type="number" value={pStock} onChange={(e) => setPStock(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>Description</label>
                      <textarea required rows={2} value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Product overview..." style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>

                    <button
                      type="submit"
                      style={{
                        background: '#ffd814',
                        border: '1px solid #fcd200',
                        color: '#0f1111',
                        fontWeight: 700,
                        padding: '8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '4px'
                      }}
                    >
                      Save SKU to Inventory
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGISTICS & SERVICEABLE PINS */}
          {activeTab === 'pins' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1111', marginBottom: '14px' }}>
                    Registered Delivery Hubs & Postal Coverage
                  </h3>
                  <div style={{ border: '1px solid #e7e7e7', borderRadius: '6px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead style={{ background: '#f7f7f7', borderBottom: '1px solid #e7e7e7' }}>
                        <tr>
                          <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Postal PIN</th>
                          <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Area Name</th>
                          <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>City, State</th>
                          <th style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>Serviceability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pinsList.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '10px', fontWeight: 800, color: '#007185' }}>{p.pincode}</td>
                            <td style={{ padding: '10px', color: '#0f1111' }}>{p.area_name}</td>
                            <td style={{ padding: '10px', color: '#565959' }}>{p.city}, {p.state}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleTogglePin(p)}
                                style={{
                                  background: p.is_serviceable ? '#f0fdf4' : '#fef2f2',
                                  border: `1px solid ${p.is_serviceable ? '#bbf7d0' : '#fecaca'}`,
                                  color: p.is_serviceable ? '#15803d' : '#b91c1c',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                {p.is_serviceable ? 'Active (24h Delivery)' : 'Disabled'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Register New PIN Form */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f1111', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} color="#e67a00" /> Register Express PIN Hub
                  </h3>
                  {pinMsg && (
                    <div style={{ padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '12px', background: pinMsg.startsWith('Error') ? '#fef2f2' : '#f0fdf4', color: pinMsg.startsWith('Error') ? '#b91c1c' : '#15803d' }}>
                      {pinMsg}
                    </div>
                  )}
                  <form onSubmit={handleAddPin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>6-Digit Postal PIN *</label>
                      <input required maxLength={6} type="text" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="e.g. 302022" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>Hub / Area Name *</label>
                      <input required type="text" value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="e.g. Sitapura Logistics Hub" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>City *</label>
                        <input required type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Jaipur" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '3px' }}>State *</label>
                        <input required type="text" value={newState} onChange={(e) => setNewState(e.target.value)} placeholder="Rajasthan" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                    <button
                      type="submit"
                      style={{
                        background: '#ffd814',
                        border: '1px solid #fcd200',
                        color: '#0f1111',
                        fontWeight: 700,
                        padding: '8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '4px'
                      }}
                    >
                      Add Serviceable Hub
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MANAGE ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={15} color="#565959" style={{ position: 'absolute', top: '9px', left: '10px' }} />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order ID or City..."
                    style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#565959' }}>
                  Total Orders: {filteredOrders.length}
                </span>
              </div>

              <div style={{ border: '1px solid #e7e7e7', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead style={{ background: '#f7f7f7', borderBottom: '1px solid #e7e7e7' }}>
                    <tr>
                      <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Order #</th>
                      <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Customer Delivery Address</th>
                      <th style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>Items</th>
                      <th style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>Total Value</th>
                      <th style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px', fontWeight: 800, color: '#007185' }}>
                          ORD-{ord.id}
                        </td>
                        <td style={{ padding: '10px', color: '#333' }}>
                          <div style={{ fontWeight: 600 }}>{ord.shipping_address?.recipient_name || 'Customer'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {ord.shipping_address?.address_line}, {ord.shipping_address?.city} ({ord.shipping_address?.pincode})
                          </div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>
                          {(ord.items || []).length} units
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: '#0f1111' }}>
                          ₹{Math.round(ord.total_amount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: ord.status === 'delivered' ? '#dcfce7' : '#fffbeb',
                              color: ord.status === 'delivered' ? '#15803d' : '#854d0e',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
