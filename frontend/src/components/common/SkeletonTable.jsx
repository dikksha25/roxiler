import React from 'react';

export const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="clay-table-wrapper" style={{ overflow: 'hidden', padding: '1rem' }}>
      <table className="clay-table">
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, cIdx) => (
              <th key={`skel-th-${cIdx}`}>
                <div className="clay-shimmer" style={{ height: '16px', width: '70%', borderRadius: '6px' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rIdx) => (
            <tr key={`skel-tr-${rIdx}`}>
              {Array.from({ length: cols }, (_, cIdx) => (
                <td key={`skel-td-${rIdx}-${cIdx}`}>
                  <div
                    className="clay-shimmer"
                    style={{
                      height: '18px',
                      width: cIdx === 0 ? '40%' : cIdx === 1 ? '75%' : '60%',
                      borderRadius: '8px',
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
