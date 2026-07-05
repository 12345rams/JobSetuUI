import React from 'react';

export default function StarDisplay({ rating }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
    </span>
  );
}
