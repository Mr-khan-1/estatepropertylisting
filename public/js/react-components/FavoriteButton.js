// FavoriteButton React Component
// Replaces plain JS fetch with a React component for toggle favorite
const { useState } = React;

function FavoriteButton({ propertyId, initialFavorited }) {
  const [favorited, setFavorited] = useState(initialFavorited === 'true' || initialFavorited === true);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/properties/${propertyId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setFavorited(data.favorited);
    } catch (err) {
      console.error('Favorite toggle failed', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={`btn fav-btn ${favorited ? 'btn-danger' : 'btn-outline-danger'}`}
      onClick={handleToggle}
      disabled={loading}
    >
      <i className={`bi ${favorited ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
      {loading ? 'Saving...' : favorited ? 'Saved' : 'Save'}
    </button>
  );
}

const favRoot = document.getElementById('react-favorite-btn');
if (favRoot) {
  ReactDOM.render(
    <FavoriteButton
      propertyId={favRoot.dataset.propertyId}
      initialFavorited={favRoot.dataset.favorited}
    />,
    favRoot
  );
}
