// ReviewForm React Component
// Replaces plain HTML review form with React with star rating UI
const { useState } = React;

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="d-flex gap-1 mb-2" style={{ fontSize: '1.6rem', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          style={{ color: star <= (hovered || value) ? '#f59e0b' : '#cbd5e1', transition: 'color 0.15s' }}
        >
          ★
        </span>
      ))}
      <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: 8, alignSelf: 'center' }}>
        {['', 'Terrible', 'Poor', 'Average', 'Very Good', 'Excellent'][hovered || value] || 'Select rating'}
      </span>
    </div>
  );
}

function ReviewForm({ propertyId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    setSubmitting(true);
    // Submit via standard form POST (backend handles it)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/properties/${propertyId}/review`;
    const r = document.createElement('input'); r.name = 'rating'; r.value = rating; form.appendChild(r);
    const c = document.createElement('input'); c.name = 'comment'; c.value = comment; form.appendChild(c);
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <div className="mt-4">
      <h5 className="mb-3">Write a Review</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Your Rating</label>
          <StarRating value={rating} onChange={setRating} />
          <input type="hidden" name="rating" value={rating} />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Your Comment</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Share your experience with this property..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !rating || !comment.trim()}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

const reviewFormRoot = document.getElementById('react-review-form');
if (reviewFormRoot) {
  ReactDOM.render(
    <ReviewForm propertyId={reviewFormRoot.dataset.propertyId} />,
    reviewFormRoot
  );
}
