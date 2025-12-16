import { useState } from 'react';

interface TooltipProps {
  note: string;
}

export function Tooltip({ note }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Empêche le clic sur la ligne
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:bg-gray-100 rounded transition"
        title="View notes"
      >
        <svg 
          className="w-5 h-5 text-gray-500 hover:text-gray-700" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop pour fermer en cliquant à l'extérieur */}
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          
          {/* Popover */}
          <div className="absolute right-0 top-8 z-20 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-4 max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}