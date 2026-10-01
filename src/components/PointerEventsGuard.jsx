import { useEffect } from 'react';

const OPEN_LAYER =
  '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"], [role="listbox"][data-state="open"]';

// Modal Radix (popup, drawer, dropdown) kadang meninggalkan `pointer-events: none`
// di <body> setelah ditutup — terutama di HP — sehingga semua sentuhan mati.
// Komponen ini melepas kunci itu bila tidak ada modal yang benar-benar terbuka.
export default function PointerEventsGuard() {
  useEffect(() => {
    const release = () => {
      const b = document.body;
      if (b.style.pointerEvents !== 'none' && !b.hasAttribute('data-scroll-locked')) return;
      if (document.querySelector(OPEN_LAYER)) return;
      b.style.pointerEvents = '';
      b.removeAttribute('data-scroll-locked');
    };
    const timer = setInterval(release, 400);
    document.addEventListener('touchstart', release, { passive: true, capture: true });
    document.addEventListener('pointerdown', release, { capture: true });
    return () => {
      clearInterval(timer);
      document.removeEventListener('touchstart', release, { capture: true });
      document.removeEventListener('pointerdown', release, { capture: true });
    };
  }, []);

  return null;
}