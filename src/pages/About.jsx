const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Leaf, Sprout, MapPin, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BaliPattern from '@/components/marketplace/BaliPattern';
import BaliDoodle from '@/components/marketplace/BaliDoodle';
import PageHeader from '@/components/marketplace/PageHeader';
import { Image } from '@/components/ui/image';

const FARMER_IMG = 'https://media.db.com/images/public/6aa8ed0c5f6fc170701cd715/da4434ab7_generated_image.png';

const VALUES = [
  { icon: Sprout, id: 'Segar dari Kebun', en: 'Fresh from the farm', d_id: 'Sayuran dipanen langsung oleh petani lokal, bukan dari gudang.', d_en: 'Vegetables harvested directly by local farmers, not from warehouses.' },
  { icon: Users, id: 'Berdayakan Petani', en: 'Empowering farmers', d_id: 'Mendukung ekonomi petani lokal Kota Denpasar dengan harga yang adil.', d_en: 'Supporting local Denpasar farmers with fair prices.' },
  { icon: Leaf, id: 'Pilihan Organik', en: 'Organic options', d_id: 'Menyediakan produk organik dan anorganik yang jelas asal-usulnya.', d_en: 'Clear-origin organic and non-organic produce.' },
  { icon: Heart, id: 'Layanan Ramah', en: 'Friendly service', d_id: 'Pengiriman cepat ke seluruh Denpasar dengan sistem bayar di tempat (COD).', d_en: 'Fast delivery across Denpasar with cash-on-delivery.' },
];

const STATS = [
  { v: '4', id: 'Kecamatan Terjangkau', en: 'Districts covered' },
  { v: '60+', id: 'Produk Segar', en: 'Fresh products' },
  { v: '100%', id: 'Panen Lokal', en: 'Locally grown' },
  { v: '24 jam', id: 'Estimasi Kirim', en: 'Delivery estimate' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Tentang Kami" en="About Us" />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-8">
        <div className="relative rounded-2xl bg-primary text-primary-foreground p-6 overflow-hidden">
          <BaliDoodle className="absolute -top-2 -right-2 text-primary-foreground/20 scale-[-1]" size={80} />
          <h2 className="font-display font-extrabold text-xl leading-tight">Etalase Belanja Tani Kota Denpasar</h2>
          <p className="text-[0.8em] text-primary-foreground/80">EBT · Denpasar Local Farmers Market</p>
          <p className="text-sm text-primary-foreground/90 mt-2 max-w-lg">
            Menghubungkan petani lokal Denpasar langsung dengan warga kota, agar sayur & buah segar sampai ke meja Anda tanpa perantara.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden h-48 sm:h-64 relative">
          <Image src={FARMER_IMG} alt="Petani lokal Denpasar memanen sayur dan buah segar" className="w-full h-full" fittingType="fill" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/70 to-transparent p-4">
            <p className="text-white font-display font-bold leading-tight">Petani lokal Denpasar memanen sayur & buah segar</p>
            <p className="text-white/80 text-xs">Local farmers harvesting fresh produce</p>
          </div>
        </div>

        <BaliPattern className="text-primary/20" height={18} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <Card key={s.id} className="p-4 rounded-xl text-center">
              <p className="font-display font-extrabold text-2xl text-primary">{s.v}</p>
              <p className="text-xs font-semibold text-foreground leading-tight mt-1">{s.id}</p>
              <p className="text-[0.65rem] text-muted-foreground/70 leading-tight">{s.en}</p>
            </Card>
          ))}
        </div>

        <div>
          <h3 className="font-display font-bold text-lg text-foreground mb-1">Visi Kami</h3>
          <p className="text-[0.7em] text-muted-foreground/70 mb-3">Our Vision</p>
          <Card className="p-5 rounded-xl space-y-2">
            <p className="text-sm text-muted-foreground">
              Menjadi etalase digital utama bagi petani Kota Denpasar untuk menjual hasil panen secara langsung kepada warga,
              sehingga petani mendapat harga yang adil dan warga menikmati sayur segar berkualitas tinggi.
            </p>
            <p className="text-[0.8em] text-muted-foreground/70">
              To become the main digital storefront for Denpasar farmers to sell their harvest directly to residents,
              giving farmers fair prices and residents fresh, high-quality produce.
            </p>
          </Card>
        </div>

        <div>
          <h3 className="font-display font-bold text-lg text-foreground mb-1">Nilai yang Kami Pegang</h3>
          <p className="text-[0.7em] text-muted-foreground/70 mb-4">Our Values</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.id} className="p-4 rounded-xl flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground leading-tight">{v.id}</p>
                    <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{v.en}</p>
                    <p className="text-sm text-muted-foreground mt-1">{v.d_id}</p>
                    <p className="text-[0.7em] text-muted-foreground/70">{v.d_en}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/60 p-5 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Melayani seluruh wilayah Kota Denpasar: Denpasar Utara, Timur, Selatan, dan Barat.
          </p>
        </div>

        <div className="text-center">
          <Link to="/">
            <Button size="lg" className="rounded-full px-8"><ShoppingBag className="w-4 h-4 mr-1" />Mulai Belanja / Start Shopping</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}