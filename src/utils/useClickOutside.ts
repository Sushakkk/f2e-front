import * as React from 'react';

export function useClickOutside(
  rootRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef.current;

      if (el && !el.contains(e.target as Node)) {
        onClose();
      }
    }

    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onDocKeyDown);

    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, [rootRef, onClose]);
}
