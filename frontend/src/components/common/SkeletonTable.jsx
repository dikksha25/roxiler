import React from 'react';

export const SkeletonTable = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="clay-table-wrapper" style={{ overflow: 'hidden' }}>
      <table className="clay-table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, cIdx) => (
              <th key={`sk-th-${cIdx}`}>
                <div
                  className="clay-skeleton"
                  style={{ height: '18px', width: `${60 + (cIdx % 3) * 20}%`, borderRadius: '8px' }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={`sk-tr-${rIdx}`}>
              {Array.from({ length: columns }).map((_, cIdx) => (
                <td key={`sk-td-${rIdx}-${cIdx}`}>
                  <div
                    className="clay-skeleton"
                    style={{
                      height: '20px',
                      width: cIdx === 0 ? '40%' : cIdx === columns - 1 ? '70%' : `${50 + ((rIdx + cIdx) % 4) * 15}%`,
                      borderRadius: '10px',
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

export default SkeletonTable;
