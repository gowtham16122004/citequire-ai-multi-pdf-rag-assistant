import React from 'react';

export const CiteQuireIcon = ({ size = 28, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer container */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#6D5AE6" />
      {/* Document Silhouette */}
      <path
        d="M9 8C9 7.44772 9.44772 7 10 7H18L23 12V23C23 23.5523 22.5523 24 22 24H10C9.44772 24 9 23.5523 9 23V8Z"
        fill="#FFFFFF"
        fillOpacity="0.96"
      />
      {/* Document Fold Accent */}
      <path d="M18 7V12H23L18 7Z" fill="#DDD6FE" />
      {/* AI Spark / Intelligent Node Symbol */}
      <circle cx="16" cy="17" r="2.5" fill="#6D5AE6" />
      <path 
        d="M16 11V13M16 21V23M10 17H12M20 17H22" 
        stroke="#6D5AE6" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
};
