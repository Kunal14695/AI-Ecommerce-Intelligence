import React from 'react';
import { Info } from 'lucide-react';

export default function DecisionNotice({ customText }) {
  return (
    <div className="disclaimer-banner">
      <Info size={20} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong style={{ display: 'block', color: '#1e293b', marginBottom: '3px' }}>
          AI Decision Support Notice
        </strong>
        <span>
          {customText || 
            "All recommendations and comparison scores are decision-support outputs weighted by customer priorities. They do not constitute an absolute claim that one product is universally superior. Evaluate all specifications based on your specific requirements."
          }
        </span>
      </div>
    </div>
  );
}
