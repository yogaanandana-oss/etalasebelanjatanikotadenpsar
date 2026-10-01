import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Search, ShoppingBag, ClipboardList, Truck, Wallet, MapPin, Leaf, Clock, CheckCircle2, HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BaliPattern from '@/components/marketplace/BaliPattern';
import BaliDoodle from '@/components/marketplace/BaliDoodle';

const STEPS = [
  { icon: Search, id: 'Pilih Produk', en: 'Browse products', desc_id: 'Jelajahi sayur & buah segar dari petani lokal Denpasar.', desc_en: 'Browse fresh produce from local Denpasar farmers.' },
  { icon: ShoppingBag, id: 'Tambah ke Keranjang', en: 'Add to cart', desc_id: 'Pilih jumlah dan masukkan ke keranjang belanja Anda.', desc_en: 'Pick quantities and add items to your cart.' },
  { icon: ClipboardList, id: 'Isi Pengiriman', en: 'Checkout details', desc_id: 'Masukkan nama, HP, dan alamat pengiriman di Denpasar.', desc_en: 'Enter your name, phone, and delivery address in Denpasar.' },
  { icon: Wallet, id: 'Bayar COD', en: 'Pay on delivery', desc_id: 'Pilih Cash on Delivery dan bayar saat pesanan tiba.', desc_en: 'Choose Cash on Delivery and pay when it arrives.' },
  { icon: Truck, id: 'Terima Pesanan', en: 'Receive order', desc_id: 'Petani/kurir mengantar hasil panen langsung ke rumah Anda.', desc_en: 'Farmers/couriers deliver fresh harvest to your door.' },
];

const AREAS = ['Denpasar Utara', 'Denpasar Timur', 'Denpasar Selatan', 'Denpasar Barat'];

const FAQ = [
  { q_id: 'Apakah bisa bayar tunai?', q_en: 'Can I pay cash?', a_id: 'Ya, kami mendukung Cash on Delivery (COD) ke seluruh wilayah Kota Denpasar.', a_en: 'Yes, we support Cash on Delivery across all of Denpasar.' },
  { q_id: 'Berapa lama pengiriman?', q_en: 'How long is delivery?', a_id: 'Pesanan dikirim pada hari yang sama atau maksimal 1×24 jam setelah konfirmasi.', a_en: 'Orders ship same-day or within 24 hours of confirmation.' },
  { q_id: 'Apakah produk selalu segar?', q_en: 'Is produce always fresh?', a_id: 'Produk dipanen langsung dari kebun petani, sehingga selalu segar.', a_en: 'Produce is harvested directly from farms, so it stays fresh.' },
];

export default function ShoppingGuide() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 h-14 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div className="leading-tight">
            <h1 className="font-display font-bold text-foreground">Panduan Belanja</h1>
            <p className="text-[0.7em] text-muted-foreground/70">Shopping Guide</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-8">
        <div className="relative rounded-2xl bg-primary text-primary-foreground p-6 overflow-hidden">
          <BaliDoodle className="absolute -top-2 -right-2 text-primary-foreground/20 scale-[-1]" size={80} />
          <h2 className="font-display font-extrabold text-xl leading-tight">Cara Berbelanja di Etalase Belanja Tani</h2>
          <p className="text-[0.8em] text-primary-foreground/80">How to shop at Etalase Belanja Tani</p>
          <p className="text-sm text-primary-foreground/90 mt-2 max-w-lg">Belanja sayur & buah segar langsung dari petani lokal Denpasar, bayar tunai saat barang tiba (COD).</p>
        </div>

        <BaliPattern className="text-primary/20" height={18} />

        <div>
          <h3 className="font-display font-bold text-lg text-foreground mb-1">Langkah-langkah</h3>
          <p className="text-[0.7em] text-muted-foreground/70 mb-4">Steps</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Card key={i} className="p-4 rounded-xl flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                      <p className="font-display font-semibold text-foreground leading-tight">{s.id}</p>
                    </div>
                    <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{s.en}</p>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc_id}</p>
                    <p className="text-[0.7em] text-muted-foreground/70">{s.desc_en}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="w-5 h-5" />
              <h3 className="font-display font-bold text-foreground">Kebijakan COD</h3>
            </div>
            <p className="text-[0.7em] text-muted-foreground/70 -mt-2">Cash on Delivery Policy</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />Bayar tunai langsung saat pesanan diterima.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />Berlaku untuk seluruh wilayah Kota Denpasar.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />Pastikan nominal uang pas / sesuai total pesanan.</li>
              <li className="flex gap-2"><Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />Pesanan bisa COD atau Pre-Order (jika stok habis).</li>
            </ul>
          </Card>

          <Card className="p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="w-5 h-5" />
              <h3 className="font-display font-bold text-foreground">Area Pengiriman</h3>
            </div>
            <p className="text-[0.7em] text-muted-foreground/70 -mt-2">Delivery Areas · Kota Denpasar</p>
            <div className="grid grid-cols-2 gap-2">
              {AREAS.map((a) => (
                <div key={a} className="rounded-lg bg-secondary/60 px-3 py-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{a}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Pengiriman ke seluruh 4 kecamatan Kota Denpasar dengan estimasi 1×24 jam.</p>
          </Card>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-foreground">Pertanyaan Umum</h3>
          </div>
          <p className="text-[0.7em] text-muted-foreground/70 mb-4">FAQ</p>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <Card key={i} className="p-4 rounded-xl">
                <p className="font-display font-semibold text-foreground">{f.q_id}</p>
                <p className="text-[0.7em] text-muted-foreground/70">{f.q_en}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.a_id}</p>
                <p className="text-[0.7em] text-muted-foreground/70">{f.a_en}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/"><Button size="lg" className="rounded-full px-8"><ShoppingBag className="w-4 h-4 mr-1" />Mulai Belanja / Start Shopping</Button></Link>
        </div>
      </main>
    </div>
  );
}