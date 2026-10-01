import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BaliPattern from '@/components/marketplace/BaliPattern';
import PageHeader from '@/components/marketplace/PageHeader';

const FAQS = [
  { q_id: 'Apakah produk selalu segar?', q_en: 'Is the produce always fresh?', a_id: 'Ya. Sayur dan buah dipanen langsung dari kebun petani lokal Denpasar, lalu dikirim segar hari yang sama. Setiap produk menampilkan tanggal panen pada kartu.', a_en: 'Yes. Produce is harvested directly from local Denpasar farms and delivered same-day. Each card shows the harvest date.' },
  { q_id: 'Bagaimana jadwal panen dan restock?', q_en: 'What are the harvest and restock schedules?', a_id: 'Jadwal panen bergantung pada jenis sayur dan musim. Tanggal restock berikutnya selalu ditampilkan pada setiap produk, dan Anda bisa Pre-Order bila stok habis.', a_en: 'Harvest schedules depend on the crop and season. The next restock date is shown on each product, and you can pre-order when out of stock.' },
  { q_id: 'Bagaimana cara pembayaran COD?', q_en: 'How does COD payment work?', a_id: 'Pilih metode Cash on Delivery saat checkout. Anda membayar tunai langsung ke kurir saat pesanan diterima. Pastikan uang pas sesuai total pesanan.', a_en: 'Choose Cash on Delivery at checkout. You pay cash to the courier on delivery. Please prepare exact change matching the order total.' },
  { q_id: 'Bagaimana cara bayar dengan Virtual Account?', q_en: 'How do I pay with a Virtual Account?', a_id: 'Pilih Transfer Bank (Virtual Account) saat checkout, lalu pilih bank: BCA, BNI, BRI, Mandiri, atau Permata. Anda akan mendapat nomor Virtual Account unik untuk pesanan tersebut. Transfer tepat sesuai total ke nomor VA itu melalui ATM, mobile banking, atau internet banking. Pembayaran terverifikasi otomatis dan pesanan langsung diproses.', a_en: 'Choose Bank Transfer (Virtual Account) at checkout, then select a bank: BCA, BNI, BRI, Mandiri, or Permata. You will receive a unique Virtual Account number for the order. Transfer the exact total to that VA via ATM, mobile, or internet banking. Payment is verified automatically and the order is processed.' },
  { q_id: 'Bagaimana cara bayar dengan QRIS?', q_en: 'How do I pay with QRIS?', a_id: 'Pilih QRIS saat checkout, lalu scan kode QRIS yang ditampilkan menggunakan e-wallet (GoPay, OVO, DANA, ShopeePay) atau m-banking. Masukkan nominal sesuai total pesanan, konfirmasi, dan pembayaran selesai. Pesanan otomatis terverifikasi.', a_en: 'Choose QRIS at checkout, then scan the QRIS code using an e-wallet (GoPay, OVO, DANA, ShopeePay) or m-banking. Enter the amount matching the order total, confirm, and you are done. The order is verified automatically.' },
  { q_id: 'Apakah ada minimum pembelian?', q_en: 'Is there a minimum order?', a_id: 'Tidak ada minimum pembelian khusus. Namun pesanan dengan total lebih kecil mungkin dikenakan ongkos kirim sesuai jarak kecamatan.', a_en: 'There is no strict minimum. Very small orders may incur a distance-based delivery fee.' },
  { q_id: 'Bagaimana jika produk yang diterima rusak?', q_en: 'What if a delivered item is damaged?', a_id: 'Kami mengganti produk yang tidak sesuai kualitas. Hubungi layanan pelanggan dalam 24 jam setelah penerimaan, dan lihat halaman Kebijakan Pengembalian.', a_en: 'We replace items that do not meet quality. Contact support within 24 hours of delivery and see the Returns Policy page.' },
  { q_id: 'Area pengiriman mana saja yang dilayani?', q_en: 'Which delivery areas are covered?', a_id: 'Seluruh Kota Denpasar: Denpasar Utara, Timur, Selatan, dan Barat. Estimasi pengiriman 1×24 jam setelah konfirmasi.', a_en: 'All of Denpasar: North, East, South, and West. Delivery within 24 hours of confirmation.' },
  { q_id: 'Apa itu produk organik?', q_en: 'What are organic products?', a_id: 'Produk berlabel Organik ditanam tanpa pestisida kimia sintetis. Label organik/anorganik ditampilkan pada setiap kartu produk.', a_en: 'Organic-labeled products are grown without synthetic pesticides. The organic/non-organic label is shown on every product card.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="FAQ" en="Pertanyaan Umum" />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <HelpCircle className="w-5 h-5" />
          <div className="leading-tight">
            <h2 className="font-display font-extrabold text-xl text-foreground">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-[0.8em] text-muted-foreground/70">Frequently Asked Questions</p>
          </div>
        </div>

        <BaliPattern className="text-primary/20" height={18} />

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Card key={i} className="rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <div>
                    <p className="font-display font-semibold text-foreground">{f.q_id}</p>
                    <p className="text-[0.7em] text-muted-foreground/70">{f.q_en}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground">{f.a_id}</p>
                    <p className="text-[0.8em] text-muted-foreground/70 mt-1">{f.a_en}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Masih ada pertanyaan? Hubungi kami.</p>
          <Link to="/contact"><Button variant="outline" className="rounded-full px-6">Kontak Kami / Contact Us</Button></Link>
        </div>
      </main>
    </div>
  );
}