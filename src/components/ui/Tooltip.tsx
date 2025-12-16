'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  className?: string;
}

export function Tooltip({ 
  content,
  position = 'auto',
  className = '' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; placement: string } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current) {
      setTooltipPosition(null);
      return;
    }

    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current?.offsetWidth || 200;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 40;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const padding = 10;

      let top = 0;
      let left = 0;
      let placement = position;

      if (position === 'auto') {
        // Calculate available space
        const spaceAbove = triggerRect.top;
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceLeft = triggerRect.left;
        const spaceRight = viewportWidth - triggerRect.right;

        // Determine best vertical position
        if (spaceBelow >= tooltipHeight + padding) {
          placement = 'bottom';
        } else if (spaceAbove >= tooltipHeight + padding) {
          placement = 'top';
        } else if (spaceRight >= tooltipWidth + padding) {
          placement = 'right';
        } else if (spaceLeft >= tooltipWidth + padding) {
          placement = 'left';
        } else {
          // Force top if no good space
          placement = 'top';
        }
      }

      // Calculate position based on placement
      switch (placement) {
        case 'top':
          top = triggerRect.top - tooltipHeight - padding;
          left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + padding;
          left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
          left = triggerRect.left - tooltipWidth - padding;
          break;
        case 'right':
          top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
          left = triggerRect.right + padding;
          break;
      }

      // Keep tooltip within viewport bounds
      if (left < padding) left = padding;
      if (left + tooltipWidth > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipHeight > viewportHeight - padding) {
        top = viewportHeight - tooltipHeight - padding;
      }

      setTooltipPosition({ top, left, placement: placement as string });
    };

    calculatePosition();

    // Recalculate on scroll or resize
    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);

    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isVisible, position]);

  const getArrowStyle = () => {
    if (!tooltipPosition || !triggerRef.current) return {};
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const placement = tooltipPosition.placement;

    switch (placement) {
      case 'top':
        return {
          bottom: '-4px',
          left: `${triggerRect.left + triggerRect.width / 2 - tooltipPosition.left}px`,
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          top: '-4px',
          left: `${triggerRect.left + triggerRect.width / 2 - tooltipPosition.left}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          right: '-4px',
          top: `${triggerRect.top + triggerRect.height / 2 - tooltipPosition.top}px`,
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          left: '-4px',
          top: `${triggerRect.top + triggerRect.height / 2 - tooltipPosition.top}px`,
          transform: 'translateY(-50%)',
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => e.stopPropagation()}
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

      </div>
      
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-xl"
          style={{
            top: tooltipPosition?.top ?? 0,
            left: tooltipPosition?.left ?? 0,
            pointerEvents: 'none',
            maxWidth: '300px',
          }}
        >
          {content}
          <div 
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
            style={getArrowStyle()}
          />
        </div>,
        document.body
      )}
    </>
  );
}