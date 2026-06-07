// SearchBar React Component
// Replaces the plain HTML hero search form with a React-powered interactive version
const { useState } = React;

function SearchBar() {
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (category) params.set('category', category);
    if (maxPrice) params.set('maxPrice', maxPrice);
    window.location.href = '/properties?' + params.toString();
  }

  return (
    <form onSubmit={handleSubmit} className="row g-2 align-items-center">
      <div className="col-md-4">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Enter city or location..."
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <select className="form-select form-select-lg" value={type} onChange={e => setType(e.target.value)}>
          <option value="">Any Type</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>
      <div className="col-md-2">
        <select className="form-select form-select-lg" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Any Category</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>
      <div className="col-md-2">
        <input
          type="number"
          className="form-control form-control-lg"
          placeholder="Max Price"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <button type="submit" className="btn btn-accent btn-lg w-100">
          <i className="bi bi-search me-2"></i>Search
        </button>
      </div>
    </form>
  );
}

// Mount to DOM
const searchBarRoot = document.getElementById('react-search-bar');
if (searchBarRoot) {
  ReactDOM.render(<SearchBar />, searchBarRoot);
}
