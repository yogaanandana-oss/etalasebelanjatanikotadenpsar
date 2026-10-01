import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BaliPattern from '@/components/marketplace/BaliPattern';
import PageHeader from '@/components/marketplace/PageHeader';

const SECTIONS = [
  {
    icon: Mail,
    id: 'Data yang Kami Kumpulkan',
    en: 'Data We Collect',
    items: [
      'Akun Google/Gmail (nama dan alamat email) saat Anda masuk.',
      'Data pesanan: nama penerima, nomor telepon, dan alamat pengiriman.',
      'Riwayat belanja dan penggunaan voucher loyalitas.',
    ],
  },
  {
    icon: Eye,
    id: 'Penggunaan Data',
    en: 'How We Use Data',
    items: [
      'Memproses dan mengirim pesanan Anda.',
      'Menghitung voucher loyalitas dan diskon otomatis.',
      'Menghubungi Anda terkait status pesanan.',
    ],
  },
  {
    icon: Lock,
    id: 'Keamanan Data',
    en: 'Data Security',
    items: [
      'Data disimpan di platform Base44 yang terlindungi.',
      'Kredensial Gmail tidak pernah kami simpan; login ditangani Google.',
      'Akses data terbatas untuk admin EBT saja.',
    ],
  },
  {
    icon: Trash2,
    id: 'Hak Anda & Penghapusan',
    en: 'Your Rights & Deletion',
    items: [
      'Anda dapat meminta salinan data Anda kapan saja.',
      'Anda dapat meminta penghapusan akun dan data terkait.',
      'Hubungi kami melalui halaman Kontak untuk permintaan tersebut.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Kebijakan Privasi" en="Privacy Policy" />
      <main className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <BaliPattern className="text-primary/20" height={18} />
        <div className="text-center space-y-1">
          <Shield className="w-10 h-10 mx-auto text-primary" />
          <h1 className="font-display font-extrabold text-2xl text-foreground">Kebijakan Privasi EBT</h1>
          <p className="text-sm text-muted-foreground/70">EBT Privacy Policy</p>
        </div>

        <Card className="p-5 rounded-xl space-y-2">
          <p className="text-sm text-muted-foreground">
            EBT (Etalase Belanja Tani Kota Denpasar) berkomitmen melindungi data pribadi Anda, termasuk akun Gmail.
            Halaman ini menjelaskan bagaimana data Anda dikumpulkan, digunakan, dan dilindungi.
          </p>
          <p className="text-[0.8em] text-muted-foreground/70">
            EBT is committed to protecting your personal data, including your Gmail account. This page explains how your data is collected, used, and protected.
          </p>
        </Card>

        <div className="space-y-4">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></span>
                  <div className="leading-tight">
                    <h2 className="font-display font-bold text-foreground">{s.id}</h2>
                    <p className="text-[0.7em] text-muted-foreground/70">{s.en}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {s.items.map((it, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FileText className="w-3.5 h-3.5 text-primary/60 shrink-0 mt-0.5" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="rounded-full px-8"><Link to="/contact">Hubungi Kami / Contact Us</Link></Button>
        </div>
      </main>
    </div>
  );
}