import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Search, ClipboardList, Truck, HandCoins, CheckCircle2, ShoppingBag, Building2, QrCode, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BaliPattern from '@/components/marketplace/BaliPattern';
import PageHeader from '@/components/marketplace/PageHeader';

const STEPS = [
  { icon: Search, id: 'Pilih Produk', en: 'Browse products', d_id: 'Jelajahi sayur & buah segar, lalu masukkan ke keranjang.', d_en: 'Browse fresh produce and add items to your cart.' },
  { icon: ClipboardList, id: 'Isi Data Pengiriman', en: 'Fill delivery details', d_id: 'Masukkan nama, nomor HP, dan alamat lengkap di Kota Denpasar.', d_en: 'Enter name, phone, and full address in Denpasar.' },
  { icon: Wallet, id: 'Pilih COD', en: 'Select COD', d_id: 'Pada halaman checkout, pilih metode pembayaran Cash on Delivery.', d_en: 'At checkout, choose the Cash on Delivery payment method.' },
  { icon: Truck, id: 'Terima & Periksa', en: 'Receive & inspect', d_id: 'Kurir mengantar pesanan. Periksa kondisi sayur sebelum membayar.', d_en: 'The courier delivers your order. Inspect produce before paying.' },
  { icon: HandCoins, id: 'Bayar Tunai', en: 'Pay cash', d_id: 'Bayar tunai sesuai total pesanan langsung ke kurir.', d_en: 'Pay cash matching the order total directly to the courier.' },
  { icon: CheckCircle2, id: 'Selesai', en: 'Done', d_id: 'Pesanan selesai. Simpan struk/order_ref untuk pelacakan.', d_en: 'Order complete. Keep your order ref for tracking.' },
];

const TIPS = [
  'Siapkan uang pas sesuai total pesanan agar transaksi cepat.',
  'Pastikan nomor HP aktif agar kurir bisa menghubungi Anda.',
  'Periksa kesegaran sayur sebelum membayar ke kurir.',
  'Tidak ada biaya tambahan untuk pembayaran COD.',
];

const VA_STEPS = [
  { icon: Building2, id: 'Pilih Transfer Bank (VA)', en: 'Select Bank Transfer (VA)', d_id: 'Pada checkout, pilih metode Transfer Bank (Virtual Account), lalu pilih bank: BCA, BNI, BRI, Mandiri, atau Permata.', d_en: 'At checkout choose Bank Transfer (Virtual Account), then pick a bank: BCA, BNI, BRI, Mandiri, or Permata.' },
  { icon: Smartphone, id: 'Dapatkan Nomor VA', en: 'Get VA number', d_id: 'Nomor Virtual Account unik ditampilkan setelah pesanan dibuat. Catat atau salin nomor tersebut.', d_en: 'A unique VA number is shown after the order is created. Copy it.' },
  { icon: HandCoins, id: 'Transfer Sesuai Total', en: 'Transfer exact total', d_id: 'Transfer tepat sesuai total pesanan melalui ATM, mobile banking, atau internet banking ke nomor VA tersebut.', d_en: 'Transfer the exact order total via ATM, mobile, or internet banking to that VA number.' },
  { icon: CheckCircle2, id: 'Verifikasi Otomatis', en: 'Auto verification', d_id: 'Pembayaran terverifikasi otomatis. Pesanan langsung diproses dan dikirim.', d_en: 'Payment is verified automatically. The order is processed and delivered.' },
];

const QRIS_STEPS = [
  { icon: QrCode, id: 'Pilih QRIS', en: 'Select QRIS', d_id: 'Pada checkout, pilih metode pembayaran QRIS.', d_en: 'At checkout, choose the QRIS payment method.' },
  { icon: Smartphone, id: 'Scan Kode QRIS', en: 'Scan the QRIS', d_id: 'Scan kode QRIS yang ditampilkan menggunakan e-wallet (GoPay, OVO, DANA, ShopeePay) atau m-banking.', d_en: 'Scan the QRIS code using an e-wallet (GoPay, OVO, DANA, ShopeePay) or m-banking.' },
  { icon: HandCoins, id: 'Bayar Sesuai Total', en: 'Pay the total', d_id: 'Masukkan nominal sesuai total pesanan, lalu konfirmasi pembayaran.', d_en: 'Enter the amount matching the order total and confirm.' },
  { icon: CheckCircle2, id: 'Selesai', en: 'Done', d_id: 'Pembayaran selesai dan terverifikasi otomatis. Pesanan langsung diproses.', d_en: 'Payment complete and auto-verified. The order is processed.' },
];

function MethodSection({ icon: Icon, title, titleEn, steps, accentClass }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg text-foreground leading-tight">{title}</h3>
      </div>
      <p className="text-[0.7em] text-muted-foreground/70 mb-4">{titleEn}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {steps.map((s, i) => {
          const SIcon = s.icon;
          return (
            <Card key={i} className="p-4 rounded-xl flex gap-3">
              <div className={`w-10 h-10 rounded-lg ${accentClass} flex items-center justify-center shrink-0`}>
                <SIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                  <p className="font-display font-semibold text-foreground leading-tight">{s.id}</p>
                </div>
                <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{s.en}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.d_id}</p>
                <p className="text-[0.7em] text-muted-foreground/70">{s.d_en}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function PaymentGuide() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Cara Pembayaran" en="Payment Guide" />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-8">
        <div className="relative rounded-2xl bg-primary text-primary-foreground p-6 overflow-hidden">
          <Wallet className="absolute -bottom-3 -right-3 text-primary-foreground/15" size={72} />
          <h2 className="font-display font-extrabold text-xl leading-tight">Panduan Pembayaran</h2>
          <p className="text-[0.8em] text-primary-foreground/80">Payment Guide</p>
          <p className="text-sm text-primary-foreground/90 mt-2 max-w-lg">
            Pilih metode pembayaran yang nyaman: COD (bayar di tempat), Transfer Bank (Virtual Account), atau QRIS.
          </p>
        </div>

        <BaliPattern className="text-primary/20" height={18} />

        <MethodSection icon={Wallet} title="Pembayaran COD (Bayar di Tempat)" titleEn="Cash on Delivery" steps={STEPS} accentClass="bg-primary/10 text-primary" />
        <MethodSection icon={Building2} title="Pembayaran Virtual Account" titleEn="Virtual Account Transfer" steps={VA_STEPS} accentClass="bg-primary/10 text-primary" />
        <MethodSection icon={QrCode} title="Pembayaran QRIS" titleEn="QRIS Payment" steps={QRIS_STEPS} accentClass="bg-accent/15 text-accent-foreground" />

        <Card className="p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-display font-bold text-foreground">Tips Pembayaran COD</h3>
          </div>
          <p className="text-[0.7em] text-muted-foreground/70 -mt-2">COD Payment Tips</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {TIPS.map((t, i) => (
              <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />{t}</li>
            ))}
          </ul>
        </Card>

        <div className="text-center">
          <Link to="/"><Button size="lg" className="rounded-full px-8"><ShoppingBag className="w-4 h-4 mr-1" />Coba Belanja / Try Shopping</Button></Link>
        </div>
      </main>
    </div>
  );
}