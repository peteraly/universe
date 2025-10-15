import React from 'react';

/**
 * Simple + icon button component
 * Clean, minimal design matching the app's black/white theme
 */
const AddButton = ({ onClick, className = '' }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`add-button ${className}`}
      aria-label="Add new item"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        color: '#000000',
        border: '2px solid #000000',
        fontSize: '24px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
        // Mobile touch optimization
        minWidth: '44px',
        minHeight: '44px',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Prevent text selection
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        // Ensure button is always visible
        opacity: 1,
        visibility: 'visible'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#000000';
        e.target.style.color = '#ffffff';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#ffffff';
        e.target.style.color = '#000000';
      }}
      onTouchStart={(e) => {
        e.target.style.backgroundColor = '#000000';
        e.target.style.color = '#ffffff';
      }}
      onTouchEnd={(e) => {
        e.target.style.backgroundColor = '#ffffff';
        e.target.style.color = '#000000';
      }}
    >
      +
    </button>
  );
};

export default AddButton;
