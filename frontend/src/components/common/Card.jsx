import React from 'react';

export const Card = ({
  children,
  className = '',
  hero = false,
  solid = false,
  style = {},
  ...props
}) => {
  let cardClass = 'clay-card';
  if (hero) cardClass += ' clay-card-hero';
  if (solid) cardClass += ' clay-card-solid';

  return (
    <div
      className={`${cardClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
