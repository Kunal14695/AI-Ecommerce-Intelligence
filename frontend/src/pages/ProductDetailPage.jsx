import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import DecisionNotice from '../components/DecisionNotice';
import {
  Star, ShoppingCart, Scale, Check, ShieldCheck,
  Sparkles, ThumbsUp, ThumbsDown, MessageSquare
} from 'lucide-react';

export default function ProductDetailPage({ productId, onNavigate }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isSelected, toggleProduct } = useCompare();

  const [product, setProduct] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], stats: {} });
  const [loading, setLoading] = useState(true);

  // New review form state
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewTextInput, setReviewTextInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const [pData, rData] = await Promise.all([
          api.getProductDetail(productId),
          api.getProductReviews(productId)
        ]);
        setProduct(pData);
        setReviewsData(rData);
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) loadDetail();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      return;
    }
    try {
      setSubmittingReview(true);
      setReviewMsg('');
      const newRev = await api.createReview({
        product_id: product.id,
        rating: ratingInput,
        review_text: reviewTextInput
      });
      setReviewTextInput('');
      setReviewMsg('Thank you! Your review was analyzed with VADER sentiment and published.');
      // Refresh reviews
      const rData = await api.getProductReviews(product.id);
      setReviewsData(rData);
    } catch (err) {
      setReviewMsg(`Error: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center', color: '#64748b' }}>
        Loading product specifications and reviews...
      </div>
    );
  }

  const inCompare = isSelected(product.id);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Top Product Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '36px', marginBottom: '3rem' }}>
        {/* Product Image */}
        <div className="card" style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
          <img
            src={product.image_url}
            alt={product.title}
            style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }}
          />
        </div>

        {/* Product Buying Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              {product.brand} • {product.category?.name}
            </span>
            <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
            {product.title}
          </h1>

          {/* Rating & Review sentiment summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', padding: '4px 8px', borderRadius: '6px' }}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <strong style={{ fontSize: '0.95rem' }}>{product.average_rating ? product.average_rating.toFixed(1) : '4.0'}</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({product.review_count || 0} reviews)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#047857' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>{product.warranty_months} Months Official Warranty</span>
            </div>
          </div>

          {/* Price */}
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{Math.round(product.price).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Inclusive of all taxes & doorstep delivery check</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
            {product.description}
          </p>

          {/* Buttons: Add to Cart and Compare Toggle */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
            <button
              onClick={handleAddToCart}
              disabled={!product.is_available || product.stock === 0}
              className={`btn btn-lg ${addedToCart ? 'btn-success' : 'btn-primary'}`}
              style={{ flex: 1 }}
            >
              {addedToCart ? (
                <>
                  <Check size={18} /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} /> Add to Cart
                </>
              )}
            </button>

            <button
              onClick={() => {
                toggleProduct(product);
                onNavigate('compare');
              }}
              className={`btn btn-lg ${inCompare ? 'btn-outline' : 'btn-secondary'}`}
            >
              <Scale size={18} /> {inCompare ? 'In Comparison Tray' : 'Compare with Another'}
            </button>
          </div>
        </div>
      </div>

      {/* Decision Support Legal Notice */}
      <DecisionNotice />

      {/* Detailed Specifications Table */}
      <div className="card" style={{ marginBottom: '3rem', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '1.05rem' }}>
          Technical Hardware Specifications
        </div>
        <div style={{ padding: '8px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <tbody>
              {product.specifications?.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: idx === product.specifications.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 24px', fontWeight: 600, color: '#475569', width: '35%' }}>
                    {s.name}
                  </td>
                  <td style={{ padding: '12px 24px', color: '#0f172a' }}>
                    {s.raw_value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Reviews & VADER Sentiment Section */}
      <div className="card" style={{ padding: '28px', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Customer Intelligence & VADER Sentiment
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Aspect-mined feedback powered by Lexicon and Sentiment Polarity
            </p>
          </div>

          {reviewsData.stats?.aspect_counts?.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {reviewsData.stats.aspect_counts.map((asp, i) => (
                <span key={i} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                  #{asp.aspect} ({asp.count})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          {reviewsData.reviews?.map((rev) => (
            <div key={rev.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rev.user_name}</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={13} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </div>
                </div>

                {/* VADER Badge */}
                <span className={`badge ${rev.sentiment_label === 'Positive' ? 'badge-success' : (rev.sentiment_label === 'Negative' ? 'badge-danger' : 'badge-neutral')}`}>
                  {rev.sentiment_label} (VADER: {rev.sentiment_score.toFixed(2)})
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                {rev.review_text}
              </p>

              {rev.aspect_tags && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                  {rev.aspect_tags.split(',').map((tag, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', color: '#6366f1', background: '#eef2ff', padding: '1px 6px', borderRadius: '4px' }}>
                      🏷️ {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Review Form */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>
            Write a Verified Review
          </h4>

          {reviewMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: reviewMsg.startsWith('Error') ? '#fef2f2' : '#ecfdf5', color: reviewMsg.startsWith('Error') ? '#991b1b' : '#065f46', fontSize: '0.85rem', marginBottom: '14px' }}>
              {reviewMsg}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Overall Rating (1 to 5 Stars)
              </label>
              <select
                value={ratingInput}
                onChange={(e) => setRatingInput(Number(e.target.value))}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Average / Balanced)</option>
                <option value={2}>⭐⭐ (2 - Below Average)</option>
                <option value={1}>⭐ (1 - Unsatisfied)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Your Honest Experience (mention battery, display, performance, or camera)
              </label>
              <textarea
                required
                rows={3}
                value={reviewTextInput}
                onChange={(e) => setReviewTextInput(e.target.value)}
                placeholder="The battery backup lasts all day, but the camera takes a second to focus in low light..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
            >
              {submittingReview ? 'Analyzing sentiment...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
