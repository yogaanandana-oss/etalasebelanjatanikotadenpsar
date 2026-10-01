import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, History } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

const ITEMS = [
  { id: 'home', label_id: 'Beranda', label_en: 'Home', icon: Home, route: '/' },
  { id: 'cart', label_id: 'Keranjang', label_en: 'Cart', icon: ShoppingBag, route: null },
  { id: 'orders', label_id: 'Pesanan', label_en: 'Orders', icon: History, route: '/order-history' },
  { id: 'account', label_id: 'Akun', label_en: 'Account', icon: User, route: '/profile' },
];

const STORAGE_KEY = 'navTabStacks';

function readStacks() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function writeStacks(stacks) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stacks)); } catch { /* ignore */ }
}

// Map a path to the tab it belongs to (route-based tabs only).
function tabForPath(pathname) {
  if (
    pathname.startsWith('/profile') ||
    pathname.startsWith('/loyalty-program') ||
    pathname.startsWith('/wishlist')
  ) {
    return 'account';
  }
  if (pathname.startsWith('/order-history')) return 'orders';
  return 'home';
}

export default function MobileNav() {
  const { count, setIsOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Persist the current path under its owning tab so swapping tabs returns here
  // instead of resetting to the tab root — preserves each tab's page position.
  useEffect(() => {
    const tab = tabForPath(location.pathname);
    const stacks = readStacks();
    if (stacks[tab] !== location.pathname) {
      stacks[tab] = location.pathname;
      writeStacks(stacks);
    }
  }, [location.pathname]);

  const activeTab = tabForPath(location.pathname);

  const goTab = (item) => {
    if (item.id === 'cart') { setIsOpen(true); return; }
    const stacks = readStacks();
    const target = stacks[item.id] || item.route;
    navigate(target || '/');
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border">
      <div className="grid grid-cols-4 h-16">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => goTab(item)}
              className="relative flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
              <span className={`flex flex-col items-center leading-tight text-[0.6rem] font-semibold ${active ? 'text-primary' : ''}`}>
                <span className="leading-tight">{item.label_id}</span>
                <span className="text-[0.55rem] text-muted-foreground/60 leading-tight">{item.label_en}</span>
              </span>
              {item.id === 'cart' && count > 0 && (
                <span className="absolute top-1.5 right-1/4 min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}