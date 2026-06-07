// AdminChart React Component
// Replaces Chart.js vanilla JS with a React-managed bar chart using SVG
const { useState, useEffect } = React;

function AdminChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-muted text-center py-4">No data available</div>;
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = 100 / data.length;
  const chartHeight = 180;
  const padding = { top: 20, bottom: 40, left: 30, right: 10 };

  function getBarHeight(count) {
    return ((count / maxCount) * (chartHeight - padding.top - padding.bottom));
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * maxCount));

  return (
    <div style={{ position: 'relative' }}>
      <svg
        width="100%"
        viewBox={`0 0 ${100 + padding.left + padding.right} ${chartHeight}`}
        preserveAspectRatio="none"
        style={{ overflow: 'visible', display: 'block' }}
      >
        {/* Grid lines */}
        {gridLines.map((val, i) => {
          const y = chartHeight - padding.bottom - ((val / maxCount) * (chartHeight - padding.top - padding.bottom));
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={100 + padding.left}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="0.5"
              />
              <text x={padding.left - 2} y={y + 3} textAnchor="end" fontSize="3.5" fill="#94a3b8">{val}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const bh = getBarHeight(d.count);
          const x = padding.left + i * barWidth + barWidth * 0.15;
          const w = barWidth * 0.7;
          const y = chartHeight - padding.bottom - bh;
          const isHovered = false; // React re-render would handle this with useState
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={w}
                height={bh || 0.5}
                rx="1.5"
                fill="#2563eb"
                opacity="0.9"
              />
              {d.count > 0 && (
                <text x={x + w / 2} y={y - 2} textAnchor="middle" fontSize="3.5" fill="#2563eb" fontWeight="700">
                  {d.count}
                </text>
              )}
              <text
                x={x + w / 2}
                y={chartHeight - padding.bottom + 8}
                textAnchor="middle"
                fontSize="4"
                fill="#64748b"
              >
                {d.month}
              </text>
            </g>
          );
        })}

        {/* X-axis line */}
        <line
          x1={padding.left}
          x2={100 + padding.left}
          y1={chartHeight - padding.bottom}
          y2={chartHeight - padding.bottom}
          stroke="#e2e8f0"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

const chartRoot = document.getElementById('react-admin-chart');
if (chartRoot) {
  let chartData = [];
  try {
    const raw = document.getElementById('monthlyCountsData');
    if (raw) chartData = JSON.parse(raw.textContent || '[]');
  } catch (e) {}
  ReactDOM.render(<AdminChart data={chartData} />, chartRoot);
}
