// CompareBar React Component
// Replaces jQuery-based compare bar with React state management
const { useState, useEffect } = React;

function CompareBar() {
  const MAX_COMPARE = 3;
  const [compareList, setCompareList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('compareList') || '[]');
    } catch {
      return [];
    }
  });
  const [showToast, setShowToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
    // Update compare button styles on the page
    document.querySelectorAll('.compare-btn').forEach(btn => {
      const id = btn.dataset.id;
      if (compareList.includes(id)) {
        btn.classList.add('active', 'btn-secondary');
        btn.classList.remove('btn-outline-secondary');
        const icon = btn.querySelector('i');
        if (icon) { icon.className = 'bi bi-bar-chart-fill'; }
      } else {
        btn.classList.remove('active', 'btn-secondary');
        btn.classList.add('btn-outline-secondary');
        const icon = btn.querySelector('i');
        if (icon) { icon.className = 'bi bi-bar-chart'; }
      }
    });
  }, [compareList]);

  // Listen for compare-btn clicks (delegated, since cards are server-rendered)
  useEffect(() => {
    function handleCompareClick(e) {
      const btn = e.target.closest('.compare-btn');
      if (!btn) return;
      const id = btn.dataset.id;
      if (!id) return;
      setCompareList(prev => {
        if (prev.includes(id)) {
          return prev.filter(x => x !== id);
        } else {
          if (prev.length >= MAX_COMPARE) {
            setShowToast('You can compare up to 3 properties at a time.');
            setTimeout(() => setShowToast(null), 3000);
            return prev;
          }
          return [...prev, id];
        }
      });
    }
    document.addEventListener('click', handleCompareClick);
    return () => document.removeEventListener('click', handleCompareClick);
  }, []);

  // Expose clear function globally for inline onclick
  window.clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('compareList');
  };

  const compareUrl = '/properties/compare?ids=' + compareList.join(',');

  return (
    <>
      {compareList.length > 0 && (
        <div className="compare-bar">
          <span>Compare: <strong>{compareList.length}</strong> selected</span>
          <a href={compareUrl} className="btn btn-sm btn-accent ms-3">Compare Now</a>
          <button className="btn btn-sm btn-outline-light ms-2" onClick={window.clearCompare}>Clear</button>
        </div>
      )}
      {showToast && (
        <div className="react-toast react-toast-warning">{showToast}</div>
      )}
    </>
  );
}

const compareBarRoot = document.getElementById('react-compare-bar');
if (compareBarRoot) {
  ReactDOM.render(<CompareBar />, compareBarRoot);
}
