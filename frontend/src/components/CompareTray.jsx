import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Scale, X, ArrowRight } from 'lucide-react';

export default function CompareTray({ onNavigateToCompare }) {
  const { selectedProducts, removeProduct, clearCompare, canCompare } = useCompare();

  if (selectedProducts.length === 0) return null;

  return (
    <div className="compare-tray">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Scale size={20} color="#818cf8" />
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
          Compare ({selectedProducts.length}/2)
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {selectedProducts.map((prod) => (
          <div
            key={prod.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {prod.title}
            </span>
            <button
              onClick={() => removeProduct(prod.id)}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {canCompare ? (
          <button
            className="btn btn-primary btn-sm"
            style={{ borderRadius: '9999px', padding: '6px 14px' }}
            onClick={onNavigateToCompare}
          >
            Compare Now <ArrowRight size={14} />
          </button>
        ) : (
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Select 1 more item
          </span>
        )}
        <button
          onClick={clearCompare}
          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
