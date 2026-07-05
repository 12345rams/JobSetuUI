import React, { useState, useEffect, useRef } from 'react';

export default function CustomDropdown({ value, onChange, placeholder, options }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClick(e) { 
      if (ref.current && !ref.current.contains(e.target)) { 
        setOpen(false); 
        setSearch(''); 
      } 
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  return (
    <div className="jf-dropdown" ref={ref}>
      <button type="button" className={`jf-dropdown-btn ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <span className={value ? 'jf-dd-selected' : 'jf-dd-placeholder'}>{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="jf-dropdown-menu">
          <div className="jf-dd-search-wrap">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              ref={searchRef} 
              className="jf-dd-search" 
              placeholder="Search..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onClick={e => e.stopPropagation()} 
            />
          </div>
          <div className="jf-dd-options">
            {filtered.length === 0 && <div className="jf-dropdown-empty">No results</div>}
            {filtered.map(opt => (
              <div 
                key={opt.value} 
                className={`jf-dropdown-item ${opt.value === value ? 'active' : ''}`} 
                onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
