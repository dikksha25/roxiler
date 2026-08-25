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
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: 'rgba(255, 255, 255, 0.01)',
      }}
    >
      {/* Total Count & Page Size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>
          Showing <strong>{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
          <strong>{Math.min(totalItems, currentPage * pageSize)}</strong> of{' '}
          <strong>{totalItems}</strong> records
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Per page:</span>
            <select
              className="input-field"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto' }}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={isFirst}
          onClick={() => onPageChange(1)}
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
          title="First Page"
        >
          &laquo;
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={isFirst}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
        >
          &larr; Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`btn ${p === currentPage ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onPageChange(p)}
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.6rem',
              minWidth: '32px',
              fontWeight: p === currentPage ? 700 : 400,
            }}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className="btn btn-secondary"
          disabled={isLast}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
        >
          Next &rarr;
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={isLast}
          onClick={() => onPageChange(totalPages)}
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
          title="Last Page"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};
