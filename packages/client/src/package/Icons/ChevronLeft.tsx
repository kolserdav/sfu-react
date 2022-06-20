import React from 'react';

function ChevronLeft({ color, className }: { color: string; className: string }) {
  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
      >
        <path fill={`${color}`} d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
      </svg>
    </div>
  );
}

export default ChevronLeft;
