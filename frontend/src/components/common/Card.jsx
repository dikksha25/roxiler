import React from 'react';

export const Card = ({
  children,
  className = '',
  interactive = false,
  style = {},
  ...props
}) => {
  return (
    <div
      className={`glass-card ${interactive ? 'interactive' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
