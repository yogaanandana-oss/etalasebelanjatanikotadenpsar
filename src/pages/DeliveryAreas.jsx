import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Truck, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BaliPattern from '@/components/marketplace/BaliPattern';
import PageHeader from '@/components/marketplace/PageHeader';

const AREAS = [
  { name: 'Denpasar Utara', en: 'North Denpasar', desc_id: 'Mencakup Sumerta, Ubung, dan sekitarnya. Pengiriman 1×24 jam.', desc_en: 'Covers Sumerta, Ubung and nearby areas.' },
  { name: 'Denpasar Timur', en: 'East Denpasar', desc_id: 'Mencakup Kesiman, Penatih, dan sekitarnya. Pengiriman 1×24 jam.', desc_en: 'Covers Kesiman, Penatih and nearby areas.' },
  { name: 'Denpasar Selatan', en: 'South Denpasar', desc_id: 'Mencakup Sanur, Pedungan, dan sekitarnya. Pengiriman 1×24 jam.', desc_en: 'Covers Sanur, Pedungan and nearby areas.' },
  { name: 'Denpasar Barat', en: 'West Denpasar', desc_id: 'Mencakup Padangsambian, Pemecutan, dan sekitarnya. Pengiriman 1×24 jam.', desc_en: 'Covers Padangsambian, Pemecutan and nearby areas.' },
];

export default function DeliveryAreas() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Lokasi Pengiriman" en="Delivery Areas" />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-8">
        <div className="relative rounded-2xl bg-primary text-primary-foreground p-6 overflow-hidden">
          <Truck className="absolute -bottom-3 -right-3 text-primary-foreground/15" size={72} />
          <h2 className="font-display font-extrabold text-xl leading-tight">Jangkauan Layanan Kota Denpasar</h2>
          <p className="text-[0.8em] text-primary-foreground/80">Service Coverage · Denpasar</p>
          <p className="text-sm text-primary-foreground/90 mt-2 max-w-lg">
            Kami mengantar hasil panen segar ke seluruh empat kecamatan Kota Denpasar.
          </p>
        </div>

        <BaliPattern className="text-primary/20" height={18} />

        <div className="grid sm:grid-cols-2 gap-3">
          {AREAS.map((a) => (
            <Card key={a.name} className="p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="w-5 h-5" />
                <div className="leading-tight">
                  <p className="font-display font-bold text-foreground">{a.name}</p>
                  <p className="text-[0.7em] text-muted-foreground/70">{a.en}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{a.desc_id}</p>
              <p className="text-[0.8em] text-muted-foreground/70">{a.desc_en}</p>
              <div className="flex items-center gap-1 text-xs font-semibold text-accent pt-1">
                <Clock className="w-3.5 h-3.5" />1×24 jam
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-display font-bold text-foreground">Ketentuan Pengiriman</h3>
          </div>
          <p className="text-[0.7em] text-muted-foreground/70 -mt-2">Delivery Terms</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />Gratis ongkir untuk seluruh wilayah Kota Denpasar.</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />Estimasi tiba 1×24 jam setelah konfirmasi pesanan.</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />Kurir menghubungi Anda sebelum pengiriman.</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />Pembayaran COD diterima oleh kurir langsung.</li>
          </ul>
        </Card>

        <div className="text-center">
          <Link to="/"><Button size="lg" className="rounded-full px-8"><ShoppingBag className="w-4 h-4 mr-1" />Mulai Belanja / Start Shopping</Button></Link>
        </div>
      </main>
    </div>
  );
}