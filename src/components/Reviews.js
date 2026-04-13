import React from 'react';
import './Reviews.css';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'veriteShopReviews';
const EMPTY_FORM = { name: '', rating: 5, comment: '' };

const clampRating = (value) => Math.min(5, Math.max(1, Number(value) || 1));

const normalizeReview = (review = {}) => ({
  id: review.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: String(review.name || '').trim(),
  rating: clampRating(review.rating),
  comment: String(review.comment || '').trim(),
  createdAt: review.created_at || review.createdAt || new Date().toISOString()
});

function Reviews() {
  const [reviews, setReviews] = React.useState([]);
  const [formData, setFormData] = React.useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [cloudConnected, setCloudConnected] = React.useState(false);

  const loadLocalReviews = React.useCallback(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeReview).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error('Failed to parse local reviews:', err);
      return [];
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (hasSupabaseConfig && supabase) {
        try {
          const { data, error } = await supabase
            .from('shop_reviews')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          if (!mounted) return;

          setReviews((data || []).map(normalizeReview));
          setCloudConnected(true);
          setStatus('Live reviews are synced from cloud.');
          return;
        } catch (err) {
          console.error('Failed to load cloud reviews, falling back to local:', err);
        }
      }

      if (mounted) {
        setCloudConnected(false);
        setReviews(loadLocalReviews());
        setStatus('Cloud reviews unavailable. Showing local reviews only on this device.');
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [loadLocalReviews]);

  const averageRating = React.useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = formData.name.trim();
    const comment = formData.comment.trim();
    const rating = clampRating(formData.rating);

    if (name.length < 2) {
      setStatus('Please enter at least 2 characters for your name.');
      return;
    }

    if (comment.length < 10) {
      setStatus('Please write at least 10 characters in your review.');
      return;
    }

    if (comment.length > 400) {
      setStatus('Review is too long. Keep it under 400 characters.');
      return;
    }

    setIsSubmitting(true);
    setStatus('Submitting your review...');

    try {
      if (hasSupabaseConfig && supabase) {
        const { data, error } = await supabase
          .from('shop_reviews')
          .insert([{ name, rating, comment }])
          .select()
          .single();

        if (error) {
          console.error('Cloud review insert failed, saving locally:', error);
          const localReview = normalizeReview({ name, rating, comment, createdAt: new Date().toISOString() });
          setReviews((prev) => {
            const updated = [localReview, ...prev];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
          setCloudConnected(false);
          setStatus('Cloud submit failed. Your review was saved on this device.');
        } else {
          const saved = normalizeReview(data);
          setReviews((prev) => [saved, ...prev]);
          setCloudConnected(true);
          setStatus('Thank you. Your review was published.');
        }
      } else {
        const localReview = normalizeReview({ name, rating, comment, createdAt: new Date().toISOString() });
        setReviews((prev) => {
          const updated = [localReview, ...prev];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        setCloudConnected(false);
        setStatus('Thank you. Your review was saved on this device.');
      }

      setFormData(EMPTY_FORM);
    } catch (err) {
      console.error('Review submit failed:', err);
      setStatus(`Could not submit review: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="reviews">
      <div className="container">
        <div className="reviews-head">
          <h2>Customer Reviews</h2>
          <p className="reviews-subtitle">Share your shopping experience with {'V\u00C9RIT\u00C9'}.</p>
          <div className="reviews-summary">
            <strong>{reviews.length ? averageRating.toFixed(1) : '0.0'}</strong>
            <span>{'\u2605'.repeat(Math.round(averageRating || 0)).padEnd(5, '\u2606')}</span>
            <em>({reviews.length} review{reviews.length === 1 ? '' : 's'})</em>
          </div>
          {status && <p className="reviews-status">{status}</p>}
          {!cloudConnected && hasSupabaseConfig && (
            <p className="reviews-hint">
              Cloud review storage is currently unavailable. New reviews may be stored locally.
            </p>
          )}
        </div>

        <div className="reviews-layout">
          <form className="review-form" onSubmit={handleSubmit}>
            <h3>Leave a Review</h3>
            <input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              maxLength={50}
              required
            />
            <label htmlFor="review-rating">Rating</label>
            <select
              id="review-rating"
              value={formData.rating}
              onChange={(e) => setFormData((prev) => ({ ...prev, rating: Number(e.target.value) }))}
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
            <textarea
              placeholder="Tell us what you loved..."
              value={formData.comment}
              onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
              maxLength={400}
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>

          <div className="review-list">
            {reviews.length === 0 ? (
              <div className="review-empty">
                <p>No reviews yet. Be the first to share your feedback.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="review-card">
                  <div className="review-card-top">
                    <h4>{review.name}</h4>
                    <span className="review-stars">{'\u2605'.repeat(review.rating).padEnd(5, '\u2606')}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <time className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Reviews;
