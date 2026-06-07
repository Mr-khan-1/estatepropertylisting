// ImageGallery React Component
// Replaces Bootstrap carousel with a React image gallery with thumbnails
const { useState } = React;

function ImageGallery({ images, title }) {
  const [current, setCurrent] = useState(0);
  const placeholder = '/images/placeholder.svg';

  const imgs = (images && images.length > 0)
    ? images.map(img => '/uploads/' + img)
    : [placeholder];

  function prev() {
    setCurrent(i => (i - 1 + imgs.length) % imgs.length);
  }

  function next() {
    setCurrent(i => (i + 1) % imgs.length);
  }

  return (
    <div className="react-gallery mb-4">
      <div className="react-gallery__main" style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: '#0f172a' }}>
        <img
          src={imgs[current]}
          alt={title}
          style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s' }}
          onError={e => { e.target.src = placeholder; }}
        />
        {imgs.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                width: 40, height: 40, color: '#fff', cursor: 'pointer', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              onClick={next}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                width: 40, height: 40, color: '#fff', cursor: 'pointer', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            <div style={{
              position: 'absolute', bottom: 12, right: 14,
              background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: '20px',
              padding: '3px 12px', fontSize: '0.82rem', fontWeight: 600
            }}>
              {current + 1} / {imgs.length}
            </div>
          </>
        )}
      </div>

      {imgs.length > 1 && (
        <div className="react-gallery__thumbs d-flex gap-2 mt-2" style={{ overflowX: 'auto', paddingBottom: 4 }}>
          {imgs.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Thumb ${i + 1}`}
              onClick={() => setCurrent(i)}
              onError={e => { e.target.src = placeholder; }}
              style={{
                width: 72, height: 54, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                border: i === current ? '2px solid #2563eb' : '2px solid transparent',
                opacity: i === current ? 1 : 0.7,
                transition: 'border 0.2s, opacity 0.2s',
                flexShrink: 0
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const galleryRoot = document.getElementById('react-image-gallery');
if (galleryRoot) {
  let images = [];
  try { images = JSON.parse(galleryRoot.dataset.images || '[]'); } catch (e) {}
  ReactDOM.render(
    <ImageGallery images={images} title={galleryRoot.dataset.title || ''} />,
    galleryRoot
  );
}
