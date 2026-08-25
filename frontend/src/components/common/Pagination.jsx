import React from 'react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  // Generate page numbers window
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 1.75rem',
        fontSize: '0.95rem',
        color: 'var(--clay-text-muted)',
        flexWrap: 'wrap',
        gap: '1rem',
        borderTop: '2px solid rgba(124, 58, 237, 0.08)',
        background: 'rgba(255, 255, 255, 0.4)',
      }}
    >
      {/* Total Count & Page Size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <span>
          Showing <strong style={{ color: 'var(--clay-text-primary)' }}>{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
          <strong style={{ color: 'var(--clay-text-primary)' }}>{Math.min(totalItems, currentPage * pageSize)}</strong> of{' '}
          <strong style={{ color: 'var(--clay-text-primary)' }}>{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clay-text-dim)', fontWeight: 600 }}>Per page:</span>
            <select
              className="clay-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '0.35rem 0.85rem',
                minHeight: '38px',
                fontSize: '0.88rem',
                width: 'auto',
                borderRadius: '14px',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          className="clay-btn clay-btn-secondary clay-btn-sm"
          disabled={isFirst}
          onClick={() => onPageChange(1)}
          style={{ minHeight: '38px', padding: '0.35rem 0.75rem', borderRadius: '14px' }}
          title="First Page"
        >
          &laquo;
        </button>

        <button
          type="button"
          className="clay-btn clay-btn-secondary clay-btn-sm"
          disabled={isFirst}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ minHeight: '38px', padding: '0.35rem 0.85rem', borderRadius: '14px' }}
        >
          &larr; Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`clay-btn ${p === currentPage ? 'clay-btn-primary' : 'clay-btn-secondary'} clay-btn-sm`}
            onClick={() => onPageChange(p)}
            style={{
              minHeight: '38px',
              minWidth: '38px',
              padding: '0.35rem',
              borderRadius: '14px',
              fontWeight: p === currentPage ? 900 : 700,
            }}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className="clay-btn clay-btn-secondary clay-btn-sm"
          disabled={isLast}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ minHeight: '38px', padding: '0.35rem 0.85rem', borderRadius: '14px' }}
        >
          Next &rarr;
        </button>

        <button
          type="button"
          className="clay-btn clay-btn-secondary clay-btn-sm"
          disabled={isLast}
          onClick={() => onPageChange(totalPages)}
          style={{ minHeight: '38px', padding: '0.35rem 0.75rem', borderRadius: '14px' }}
          title="Last Page"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};
