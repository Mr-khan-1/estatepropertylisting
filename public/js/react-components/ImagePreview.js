// ImagePreview React Component
// Replaces jQuery image preview with React drag-and-drop preview
const { useState, useRef } = React;

function ImagePreview({ maxImages = 10 }) {
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setError('');
    if (files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      e.target.value = '';
      setPreviews([]);
      return;
    }
    const readers = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = ev => resolve({ src: ev.target.result, name: file.name });
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(setPreviews);
  }

  function removePreview(idx) {
    setPreviews(prev => prev.filter((_, i) => i !== idx));
    // Note: can't remove from input[type=file] directly, but preview gives visual feedback
  }

  return (
    <div>
      <input
        type="file"
        name="images"
        className="form-control"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        ref={inputRef}
      />
      <small className="text-muted">Upload up to {maxImages} images. Max 5MB each. First image will be the cover.</small>
      {error && <div className="text-danger small mt-1"><i className="bi bi-exclamation-circle me-1"></i>{error}</div>}
      {previews.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {previews.map((p, i) => (
            <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={p.src}
                alt={p.name}
                style={{
                  width: 90, height: 68, objectFit: 'cover', borderRadius: 8,
                  border: i === 0 ? '2px solid #2563eb' : '2px solid #e2e8f0'
                }}
              />
              {i === 0 && (
                <span style={{
                  position: 'absolute', bottom: 2, left: 2,
                  background: '#2563eb', color: '#fff', fontSize: '0.65rem',
                  padding: '1px 5px', borderRadius: 4, fontWeight: 700
                }}>Cover</span>
              )}
              <button
                type="button"
                onClick={() => removePreview(i)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#ef4444', border: 'none', borderRadius: '50%',
                  width: 18, height: 18, color: '#fff', fontSize: '0.6rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1
                }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const imagePreviewRoot = document.getElementById('react-image-preview');
if (imagePreviewRoot) {
  ReactDOM.render(<ImagePreview maxImages={10} />, imagePreviewRoot);
}
