import React, { useState } from 'react';

interface SimpleTooltipProps {
  content: string;
  children: React.ReactNode;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 text-gray-300 text-[10px] font-mono rounded shadow-xl whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
};

export default SimpleTooltip;