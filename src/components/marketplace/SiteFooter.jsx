import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home, BookOpen, Users, User, ShieldCheck, Heart, Truck, Package,
  Wallet, HelpCircle, RefreshCcw, MapPin, Phone, BookMarked, Award, History, Leaf, Sprout,
} from 'lucide-react';
import BaliPattern from '@/components/marketplace/BaliPattern';
import { useSettings } from '@/lib/settingsContext';
import { shopConfig } from '@/lib/shopConfig';

const COLS = [
  {
    title: { id: 'Belanja', en: 'Shop' },
    links: [
      { to: '/', id: 'Beranda', en: 'Home', icon: Home },
      { to: '/shopping-guide', id: 'Panduan Belanja', en: 'Shopping Guide', icon: BookOpen },
      { to: '/farmer-partners', id: 'Mitra & Daftar Petani', en: 'Farmer Partners', icon: Users },
      { to: '/wishlist', id: 'Daftar Keinginan', en: 'Wishlist', icon: Heart },
    ],
  },
  {
    title: { id: 'Layanan', en: 'Service' },
    links: [
      { to: '/order-tracking', id: 'Status Pesanan', en: 'Order Tracking', icon: Package },
      { to: '/payment-guide', id: 'Cara Pembayaran', en: 'Payment Guide', icon: Wallet },
      { to: '/loyalty-program', id: 'Program Loyalitas', en: 'Loyalty Program', icon: Award },
      { to: '/order-history', id: 'Riwayat Belanja', en: 'Order History', icon: History },
      { to: '/quality-guide', id: 'Panduan Kualitas', en: 'Quality Guide', icon: Leaf },
      { to: '/delivery-areas', id: 'Lokasi Pengiriman', en: 'Delivery Areas', icon: Truck },
      { to: '/returns-policy', id: 'Kebijakan Pengembalian', en: 'Returns Policy', icon: RefreshCcw },
    ],
  },
  {
    title: { id: 'Informasi', en: 'Info' },
    links: [
      { to: '/about', id: 'Tentang Kami', en: 'About Us', icon: MapPin },
      { to: '/blog', id: 'Blog Tani', en: 'Farmers Blog', icon: BookMarked },
      { to: '/faq', id: 'FAQ', en: 'FAQ', icon: HelpCircle },
      { to: '/privacy-policy', id: 'Kebijakan Privasi', en: 'Privacy Policy', icon: ShieldCheck },
      { to: '/contact', id: 'Kontak Kami', en: 'Contact Us', icon: Phone },
    ],
  },
];

export default function SiteFooter() {
  const { settings } = useSettings() || {};
  const shopName = settings?.shop_name?.value || shopConfig.shopName;
  return (
    <footer className="mt-10 border-t border-border bg-secondary/40">
      <BaliPattern className="text-primary/20" height={18} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        {COLS.map((col) => (
          <div key={col.title.id} className="space-y-3">
            <div className="leading-tight">
              <p className="font-display font-bold text-foreground">{col.title.id}</p>
              <p className="text-[0.7em] text-muted-foreground/70">{col.title.en}</p>
            </div>
            <div className="space-y-2">
              {col.links.map((l) => {
                const Icon = l.icon;
                return (
                  <Link key={l.to} to={l.to} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex flex-col leading-tight">
                      <span className="leading-tight">{l.id}</span>
                      <span className="text-[0.7em] text-muted-foreground/70 leading-tight">{l.en}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        <div className="space-y-3">
          <div className="leading-tight">
            <p className="font-display font-bold text-foreground">Akun</p>
            <p className="text-[0.7em] text-muted-foreground/70">Account</p>
          </div>
          <div className="space-y-2">
            <Link to="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <User className="w-4 h-4 shrink-0" />
              <span className="flex flex-col leading-tight">
                <span className="leading-tight">Profil Pelanggan</span>
                <span className="text-[0.7em] text-muted-foreground/70 leading-tight">My Profile</span>
              </span>
            </Link>
            <Link to="/admin/products" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="flex flex-col leading-tight">
                <span className="leading-tight">Admin</span>
                <span className="text-[0.7em] text-muted-foreground/70 leading-tight">Dashboard</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground/70 pb-5 px-4">
        {shopName} · Panen segar dari petani lokal
      </div>
    </footer>
  );
}