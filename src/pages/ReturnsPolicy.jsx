import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, RefreshCcw, Phone, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BaliPattern from '@/components/marketplace/BaliPattern';
import PageHeader from '@/components/marketplace/PageHeader';

const CONDITIONS = [
'Produk sayur/buah yang diterima dalam kondisi rusak, busuk, atau tidak sesuai pesanan.',
'Klaim diajukan maksimal 24 jam setelah pesanan diterima.',
'Produk masih dalam kemasan asli atau belum diolah lebih lanjut.',
'Disertai bukti foto produk yang bermasalah.'];

const STEPS = [
{ id: 'Hubungi Layanan Pelanggan', en: 'Contact support', d_id: 'Kirim pesan via halaman Kontak atau WhatsApp dengan nomor pesanan dan foto produk.', d_en: 'Message us via Contact page or WhatsApp with your order number and photos.' },
{ id: 'Verifikasi Klaim', en: 'Verify the claim', d_id: 'Tim kami memverifikasi laporan Anda dalam 1×24 jam.', d_en: 'Our team reviews your report within 24 hours.' },
{ id: 'Penggantian Produk', en: 'Product replacement', d_id: 'Produk pengganti dikirim gratis pada pengiriman berikutnya.', d_en: 'A replacement is delivered free on the next delivery.' },
{ id: 'Selesai', en: 'Done', d_id: 'Pesanan pengganti sampai dan transaksi dianggap selesai.', d_en: 'The replacement arrives and the case is closed.' }];

export default function ReturnsPolicy() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Kebijakan Pengembalian" en="Returns Policy" />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-8">
        <div className="relative rounded-2xl bg-primary text-primary-foreground p-6 overflow-hidden">
          <RefreshCcw className="absolute -bottom-3 -right-3 text-primary-foreground/15" size={72} />
          <h2 className="font-display font-extrabold text-xl leading-tight">Garansi Kualitas Sayur Segar</h2>
          <p className="text-[0.8em] text-primary-foreground/80">Fresh Produce Quality Guarantee</p>
          <p className="text-sm text-primary-foreground/90 mt-2 max-w-lg">
            Kami berkomitmen mengganti produk yang tidak sesuai kualitas. Berikut syarat dan prosedur penukaran produk sayuran.
          </p>
        </div>

        <BaliPattern className="text-primary/20" height={18} />

        <div>
          <h3 className="font-display font-bold text-lg text-foreground mb-1">Syarat Pengembalian</h3>
          <p className="text-[0.7em] text-muted-foreground/70 mb-4">Return Conditions</p>
          <Card className="p-5 rounded-xl space-y-3">
            {CONDITIONS.map((c, i) =>
            <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{c}</span>
              </div>
            )}
          </Card>
        </div>

        <div>
          <h3 className="font-display font-bold text-lg text-foreground mb-1">Prosedur Penukaran</h3>
          <p className="text-[0.7em] text-muted-foreground/70 mb-4">Exchange Procedure</p>
          <div className="space-y-3">
            {STEPS.map((s, i) =>
            <Card key={i} className="p-4 rounded-xl flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground leading-tight">{s.id}</p>
                  <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{s.en}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.d_id}</p>
                  <p className="text-[0.7em] text-muted-foreground/70">{s.d_en}</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-5 rounded-xl flex items-center gap-3">
            <Clock className="w-8 h-8 text-accent shrink-0" />
            <div>
              <p className="font-display font-semibold text-foreground">Batas Waktu Klaim</p>
              <p className="text-[0.7em] text-muted-foreground/70">Claim deadline · 24 jam</p>
            </div>
          </Card>
          <Card className="p-5 rounded-xl flex items-center gap-3">
            <Phone className="w-8 h-8 text-primary shrink-0" />
            <div>
              <p className="font-display font-semibold text-foreground">Bantuan Pelanggan</p>
              <p className="text-[0.7em] text-muted-foreground/70">Via halaman Kontak / WhatsApp</p>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/contact"><Button size="lg" className="rounded-full px-8"><Phone className="w-4 h-4 mr-1" />Ajukan Klaim / File a Claim</Button></Link>
        </div>
      </main>
    </div>);

}