import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '48px 0 24px 0', marginTop: '64px', borderTop: '1px solid #1e293b' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        <div>
          <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
            SmartCommerce AI
          </h3>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            Next-generation decision intelligence platform combining transparent multi-criteria product comparison, privacy-conscious location-aware delivery, and hybrid TF-IDF recommendations.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
            Core AI Architecture
          </h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>• Multi-Criteria Benefit vs Cost Normalization</li>
            <li>• Bayesian Rating Adjustment & VADER NLP</li>
            <li>• Hybrid Content-Based TF-IDF Recommender</li>
            <li>• Reverse Geocoding OSM Nominatim Proxy</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
            Compliance & Privacy
          </h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            Designed in strict compliance with India's Digital Personal Data Protection (DPDP) Act 2023. Explicit geolocation consent, purpose limitation, and zero continuous tracking.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
            Academic Project
          </h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            B.Tech Minor Project<br />
            <strong>Poornima University, Jaipur</strong><br />
            Department of Computer Engineering
          </p>
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
        <span>© 2026 Poornima University. All rights reserved.</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="#10b981" /> Decision Support Prototype
        </span>
      </div>
    </footer>
  );
}
