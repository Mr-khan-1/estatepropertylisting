// PropertyFilters React Component
// Replaces the static filter form with an interactive React-powered filter panel
const { useState } = React;

function PropertyFilters({ initialQuery }) {
  const q = initialQuery || {};
  const [city, setCity] = useState(q.city || '');
  const [type, setType] = useState(q.type || '');
  const [category, setCategory] = useState(q.category || '');
  const [minPrice, setMinPrice] = useState(q.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(q.maxPrice || '');
  const [bedrooms, setBedrooms] = useState(q.bedrooms || '');
  const [sort, setSort] = useState(q.sort || '');

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (sort) params.set('sort', sort);
    window.location.href = '/properties?' + params.toString();
  }

  function handleClear() {
    window.location.href = '/properties';
  }

  const hasFilters = city || type || category || minPrice || maxPrice || bedrooms || sort;

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      <div className="col-md-2">
        <input
          type="text"
          className="form-control"
          placeholder="City"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
          <option value="">Any Type</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>
      <div className="col-md-2">
        <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Any Category</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>
      <div className="col-md-1">
        <input
          type="number"
          className="form-control"
          placeholder="Min PKR"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
        />
      </div>
      <div className="col-md-1">
        <input
          type="number"
          className="form-control"
          placeholder="Max PKR"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="col-md-1">
        <input
          type="number"
          className="form-control"
          placeholder="Beds"
          value={bedrooms}
          onChange={e => setBedrooms(e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      <div className="col-md-1 d-flex gap-2">
        <button type="submit" className="btn btn-primary w-100">
          <i className="bi bi-search"></i>
        </button>
        {hasFilters && (
          <button type="button" className="btn btn-outline-secondary" onClick={handleClear}>
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>
    </form>
  );
}

// Mount to DOM — pass server-rendered query as JSON via data attribute
const filtersRoot = document.getElementById('react-property-filters');
if (filtersRoot) {
  let initialQuery = {};
  try {
    initialQuery = JSON.parse(filtersRoot.dataset.query || '{}');
  } catch (e) {}
  ReactDOM.render(<PropertyFilters initialQuery={initialQuery} />, filtersRoot);
}
