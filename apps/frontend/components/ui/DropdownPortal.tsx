'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  align?: 'left' | 'right';
  width?: number;
}

export function DropdownPortal({
  open,
  children,
  onClose,
  anchorRef,
  align = 'right',
  width = 160,
}: DropdownPortalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, anchorRef, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const rect = anchorRef.current?.getBoundingClientRect();
  
  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
  };

  if (rect) {
    if (align === 'right') {
      style.right = window.innerWidth - rect.right;
      style.top = rect.bottom + 4;
    } else {
      style.left = rect.left;
      style.top = rect.bottom + 4;
    }
    style.minWidth = width;
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      style={style}
    >
      {children}
    </div>,
    document.body
  );
}
