import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Clock, Phone, Navigation, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BaliPattern from '@/components/marketplace/BaliPattern';
import PageHeader from '@/components/marketplace/PageHeader';
import { Bi } from '@/components/ui/Bi';

// Fix default marker icons (Vite/Leaflet bundling quirk)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Kantor operasional EBT di pusat Kota Denpasar
const OFFICE = {
  name_id: 'Kantor Operasional EBT',
  name_en: 'EBT Operational Office',
  address_id: 'Jl. WR Supratman No. 1, Dangin Puri Klod, Denpasar Timur, Kota Denpasar, Bali 80235',
  address_en: 'Jl. WR Supratman No. 1, Dangin Puri Klod, East Denpasar, Denpasar City, Bali 80235',
  lat: -8.6736,
  lng: 115.2127,
  hours_id: 'Senin–Sabtu, 08.00–17.00 WITA',
  hours_en: 'Mon–Sat, 8 AM – 5 PM (Bali time)',
  phone: '+62 361 000 000',
};

// Memaksa Leaflet menghitung ulang ukuran setelah peta dipasang,
// agar tile langsung terlihat (umum di layout yang di-render setelah mount).
function InvalidateSize() {
  const map = useMap();
  React.useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

const PICKUP_STEPS = [
  { id: 'Pilih produk dan bayar via COD / transfer / QRIS', en: 'Pick products and pay via COD / transfer / QRIS' },
  { id: 'Tunggu konfirmasi pesanan via email atau telepon', en: 'Wait for order confirmation by email or phone' },
  { id: 'Ambil pesanan di kantor operasional EBT pada jam buka', en: 'Pick up your order at the EBT office during opening hours' },
  { id: 'Periksa kualitas dan kesegaran hasil panen saat pengambilan', en: 'Check produce quality and freshness on pickup' },
];

export default function Locations() {
  const mapUrl = `https://www.openstreetmap.org/?mlat=${OFFICE.lat}&mlon=${OFFICE.lng}#map=17/${OFFICE.lat}/${OFFICE.lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${OFFICE.lat},${OFFICE.lng}`;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Lokasi Toko" en="Store Locations" />

      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-8">
        <div className="relative rounded-2xl bg-primary text-primary-foreground p-6 overflow-hidden">
          <Store className="absolute -bottom-3 -right-3 text-primary-foreground/15" size={72} />
          <h2 className="font-display font-extrabold text-xl leading-tight">Ambil Hasil Panen Langsung di Denpasar</h2>
          <p className="text-[0.8em] text-primary-foreground/80">Pick Up Fresh Harvest in Denpasar</p>
          <p className="text-sm text-primary-foreground/90 mt-2 max-w-lg">
            Kunjungi kantor operasional EBT untuk mengambil pesanan langsung dari petani lokal Kota Denpasar.
          </p>
        </div>

        <BaliPattern className="text-primary/20" height={18} />

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="w-5 h-5" />
              <div className="leading-tight">
                <p className="font-display font-bold text-foreground">{OFFICE.name_id}</p>
                <p className="text-[0.7em] text-muted-foreground/70">{OFFICE.name_en}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex gap-2.5">
                <Navigation className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <Bi id={OFFICE.address_id} en={OFFICE.address_en} />
              </div>
              <div className="flex gap-2.5">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <Bi id={OFFICE.hours_id} en={OFFICE.hours_en} />
              </div>
              <div className="flex gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{OFFICE.phone}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild className="rounded-full">
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="w-4 h-4 mr-1.5" />Rute / Directions
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4 mr-1.5" />Buka Peta / Open Map
                </a>
              </Button>
            </div>
          </Card>

          <Card className="rounded-xl overflow-hidden">
            <div style={{ height: 420 }} className="bg-muted">
              <MapContainer
                center={[OFFICE.lat, OFFICE.lng]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
              >
                <InvalidateSize />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[OFFICE.lat, OFFICE.lng]}>
                  <Popup>
                    <strong>{OFFICE.name_id}</strong>
                    <br />
                    {OFFICE.address_id}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </Card>
        </div>

        <Card className="p-6 rounded-xl space-y-4">
          <div className="leading-tight">
            <p className="font-display font-bold text-foreground">Cara Ambil Pesanan / How to Pick Up</p>
            <p className="text-[0.7em] text-muted-foreground/70">Pickup guide</p>
          </div>
          <ol className="space-y-3">
            {PICKUP_STEPS.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <Bi id={s.id} en={s.en} />
              </li>
            ))}
          </ol>
        </Card>
      </main>
    </div>
  );
}