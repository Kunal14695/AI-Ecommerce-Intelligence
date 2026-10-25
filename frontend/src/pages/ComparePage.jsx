import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import DecisionNotice from '../components/DecisionNotice';
import {
  Scale, Sliders, CheckCircle, AlertTriangle, ArrowRight,
  TrendingUp, Award, ShoppingCart, Info, RotateCcw, ShieldCheck
} from 'lucide-react';

export default function ComparePage({ onSelectProduct }) {
  const { selectedProducts, setComparePair } = useCompare();
  const { addToCart } = useCart();
  const [selectorList, setSelectorList] = useState([]);
  const [productAId, setProductAId] = useState(selectedProducts[0]?.id || 1);
  const [productBId, setProductBId] = useState(selectedProducts[1]?.id || 2);
  const [preset, setPreset] = useState('Budget-first');
  const [weights, setWeights] = useState({
    price: 0.40,
    performance: 0.15,
    features: 0.15,
    ratings: 0.15,
    brand_warranty: 0.10,
    availability: 0.05,
  });
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load dropdown selector products
  useEffect(() => {
    api.getCompareSelector().then(setSelectorList).catch(console.error);
  }, []);

  // Update dropdowns if selectedProducts in context changes
  useEffect(() => {
    if (selectedProducts.length >= 1) setProductAId(selectedProducts[0].id);
    if (selectedProducts.length >= 2) setProductBId(selectedProducts[1].id);
  }, [selectedProducts]);

  // Run comparison
  const runComparison = async (activeWeights = weights, activePreset = preset) => {
    if (!productAId || !productBId) return;
    if (productAId === productBId) {
      setError('Please select two different products to compare.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.compare({
        product_a_id: productAId,
        product_b_id: productBId,
        preset: activePreset,
        weights: activePreset === 'Custom' ? activeWeights : null,
      });
      setComparisonResult(res);
      setComparePair(res.product_a, res.product_b);
    } catch (err) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison(weights, preset);
  }, [productAId, productBId]);

  // Handle Preset selection
  const handlePresetSelect = (presetName) => {
    setPreset(presetName);
    let newWeights = { ...weights };
    if (presetName === 'Budget-first') {
      newWeights = { price: 0.40, performance: 0.15, features: 0.15, ratings: 0.15, brand_warranty: 0.10, availability: 0.05 };
    } else if (presetName === 'Performance-first') {
      newWeights = { price: 0.15, performance: 0.40, features: 0.20, ratings: 0.15, brand_warranty: 0.05, availability: 0.05 };
    } else if (presetName === 'Reliability-first') {
      newWeights = { price: 0.20, performance: 0.20, features: 0.15, ratings: 0.25, brand_warranty: 0.15, availability: 0.05 };
    }
    setWeights(newWeights);
    runComparison(newWeights, presetName);
  };

  // Handle Custom Slider change (auto-normalizing)
  const handleSliderChange = (criterion, rawVal) => {
    setPreset('Custom');
    const val = Number(rawVal) / 100;
    const oldVal = weights[criterion];
    const diff = val - oldVal;

    // Distribute remaining difference proportionally among other weights
    const otherKeys = Object.keys(weights).filter(k => k !== criterion);
    const otherSum = otherKeys.reduce((acc, k) => acc + weights[k], 0);

    let updated = { ...weights, [criterion]: val };
    if (otherSum > 0) {
      for (const k of otherKeys) {
        updated[k] = Math.max(0.01, updated[k] - diff * (updated[k] / otherSum));
      }
    }
    // Final clamp to ensure sum is 1.0
    const total = Object.values(updated).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(updated)) {
      updated[k] = Number((updated[k] / total).toFixed(3));
    }
    setWeights(updated);
    runComparison(updated, 'Custom');
  };

  const handleSwapProducts = () => {
    const temp = productAId;
    setProductAId(productBId);
    setProductBId(temp);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
          <Scale size={15} /> Transparent Decision Intelligence
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>AI Product Comparison Engine</h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Compare any two devices weighted by your personal preference profile. All score calculations are 100% explainable and verifiable.
        </p>
      </div>

      {/* Decision Support Legal Disclaimer Notice */}
      <DecisionNotice />

      {/* Product Selector Bar */}
      <div className="card" style={{ padding: '24px', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
          {/* Product A Dropdown */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Product A (Baseline)
            </label>
            <select
              value={productAId}
              onChange={(e) => setProductAId(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.9rem', background: 'white' }}
            >
              {selectorList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (₹{Math.round(p.price).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '18px' }}>
            <button
              onClick={handleSwapProducts}
              className="btn btn-secondary btn-sm"
              title="Swap Product A and B (test score symmetry)"
              style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Product B Dropdown */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Product B (Challenger)
            </label>
            <select
              value={productBId}
              onChange={(e) => setProductBId(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.9rem', background: 'white' }}
            >
              {selectorList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (₹{Math.round(p.price).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginTop: '14px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Category or Spec Mismatch Warnings */}
      {comparisonResult?.category_warning && (
        <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '12px 16px', borderRadius: '0 8px 8px 0', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#b45309' }}>
          <AlertTriangle size={18} flexShrink={0} />
          <span>{comparisonResult.category_warning}</span>
        </div>
      )}

      {/* Main Comparison Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Preference Weights Control Panel */}
        <div className="card" style={{ padding: '24px', position: 'sticky', top: '92px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sliders size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Preference Weights</h3>
          </div>

          {/* Presets */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Preset Profiles
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['Budget-first', 'Performance-first', 'Reliability-first'].map((pName) => (
                <button
                  key={pName}
                  onClick={() => handlePresetSelect(pName)}
                  className={`btn btn-sm ${preset === pName ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'flex-start', fontSize: '0.825rem' }}
                >
                  {pName}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Weight Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Custom Weights ({Math.round(Object.values(weights).reduce((a, b) => a + b, 0) * 100)}%)
            </span>

            {[
              { key: 'price', label: 'Price & Economy', icon: '💰' },
              { key: 'performance', label: 'Hardware Compute', icon: '⚡' },
              { key: 'features', label: 'Features & Screen', icon: '✨' },
              { key: 'ratings', label: 'Reviews & VADER', icon: '⭐' },
              { key: 'brand_warranty', label: 'Warranty & Brand', icon: '🛡️' },
              { key: 'availability', label: 'In-Stock Delivery', icon: '📦' },
            ].map(({ key, label, icon }) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>{icon} {label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--primary)' }}>
                    {Math.round(weights[key] * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(weights[key] * 100)}
                  onChange={(e) => handleSliderChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results Area */}
        {comparisonResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Score Comparison Card */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center' }}>
                {/* Product A Score Header */}
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={comparisonResult.product_a.image_url}
                    alt={comparisonResult.product_a.title}
                    style={{ width: '90px', height: '90px', objectFit: 'contain', margin: '0 auto 12px' }}
                  />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {comparisonResult.product_a.title}
                  </h4>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    ₹{Math.round(comparisonResult.product_a.price).toLocaleString('en-IN')}
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: comparisonResult.score_a >= comparisonResult.score_b ? '#4f46e5' : '#64748b' }}>
                      {Math.round(comparisonResult.score_a * 100)}
                      <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* VS Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: 800, padding: '8px 14px', borderRadius: '50%', fontSize: '0.9rem' }}>
                    VS
                  </span>
                </div>

                {/* Product B Score Header */}
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={comparisonResult.product_b.image_url}
                    alt={comparisonResult.product_b.title}
                    style={{ width: '90px', height: '90px', objectFit: 'contain', margin: '0 auto 12px' }}
                  />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {comparisonResult.product_b.title}
                  </h4>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    ₹{Math.round(comparisonResult.product_b.price).toLocaleString('en-IN')}
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: comparisonResult.score_b >= comparisonResult.score_a ? '#4f46e5' : '#64748b' }}>
                      {Math.round(comparisonResult.score_b * 100)}
                      <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Progress Bar */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${comparisonResult.score_a / (comparisonResult.score_a + comparisonResult.score_b) * 100}%`, background: 'var(--primary)', transition: 'all 0.3s ease' }} />
                  <div style={{ width: `${comparisonResult.score_b / (comparisonResult.score_a + comparisonResult.score_b) * 100}%`, background: 'var(--secondary)', transition: 'all 0.3s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                  <span>{comparisonResult.product_a.brand} share: {Math.round(comparisonResult.score_a / (comparisonResult.score_a + comparisonResult.score_b) * 100)}%</span>
                  <span>{comparisonResult.product_b.brand} share: {Math.round(comparisonResult.score_b / (comparisonResult.score_a + comparisonResult.score_b) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Natural Language Explanation & Conditional Recommendation */}
            <div className="card" style={{ padding: '24px', background: 'linear-gradient(to right, #ffffff, #fbfbfe)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Award size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  AI Analysis & Recommendation
                </h3>
              </div>

              <p style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.6, marginBottom: '14px' }}>
                {comparisonResult.ai_summary}
              </p>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                <strong>Conditional Decision Rule: </strong>
                {comparisonResult.conditional_recommendation}
              </div>
            </div>

            {/* Pros and Cons Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                  {comparisonResult.product_a.brand} Highlights
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {comparisonResult.pros_a.map((pro, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#047857' }}>
                      <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{pro}</span>
                    </div>
                  ))}
                  {comparisonResult.cons_a.map((con, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#b91c1c' }}>
                      <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                  {comparisonResult.product_b.brand} Highlights
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {comparisonResult.pros_b.map((pro, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#047857' }}>
                      <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{pro}</span>
                    </div>
                  ))}
                  {comparisonResult.cons_b.map((con, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#b91c1c' }}>
                      <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Criteria Breakdown Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>
                Multi-Criteria Normalization Breakdown
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: '#ffffff', color: '#64748b' }}>
                      <th style={{ padding: '12px 18px' }}>Evaluation Criterion</th>
                      <th style={{ padding: '12px 18px' }}>Weight</th>
                      <th style={{ padding: '12px 18px' }}>{comparisonResult.product_a.brand} Raw / Score</th>
                      <th style={{ padding: '12px 18px' }}>{comparisonResult.product_b.brand} Raw / Score</th>
                      <th style={{ padding: '12px 18px' }}>Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonResult.criteria_breakdown.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                          {row.label}
                        </td>
                        <td style={{ padding: '14px 18px', fontFamily: 'JetBrains Mono', color: 'var(--primary)' }}>
                          {Math.round(row.weight * 100)}%
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontWeight: 600 }}>{row.raw_a}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                            Norm: {Math.round(row.score_a * 100)}/100
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontWeight: 600 }}>{row.raw_b}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                            Norm: {Math.round(row.score_b * 100)}/100
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span className={`badge ${row.advantage === 'Tie' ? 'badge-neutral' : (row.advantage === 'Product A' ? 'badge-primary' : 'badge-success')}`}>
                            {row.advantage === 'Product A' ? comparisonResult.product_a.brand : (row.advantage === 'Product B' ? comparisonResult.product_b.brand : 'Tie')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginBottom: '2rem' }}>
              <button
                onClick={() => addToCart(comparisonResult.product_a.id, 1)}
                className="btn btn-secondary"
              >
                <ShoppingCart size={16} /> Add {comparisonResult.product_a.brand} to Cart
              </button>
              <button
                onClick={() => addToCart(comparisonResult.product_b.id, 1)}
                className="btn btn-primary"
              >
                <ShoppingCart size={16} /> Add {comparisonResult.product_b.brand} to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
