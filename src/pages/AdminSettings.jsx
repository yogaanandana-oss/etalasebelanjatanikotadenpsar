const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ScrollText, Mail, Store, Phone, CreditCard, QrCode, Bell, Ticket, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/settingsContext';
import SettingField from '@/components/admin/SettingField';
import BanksEditor from '@/components/admin/BanksEditor';

export default function AdminSettings() {
  const ctx = useSettings() || {};
  const { settings, refresh } = ctx;
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    db.auth
      .me()
      .then((u) => {
        if (u?.role !== 'admin') setDenied(true);
      })
      .catch(() => setDenied(true));
  }, []);

  const get = (k, fb = '') => (settings && settings[k] ? settings[k].value : fb);
  const idOf = (k) => (settings && settings[k] ? settings[k].id : null);
  const onSaved = async () => {
    await refresh();
  };

  if (denied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-display font-bold text-foreground">Akses ditolak / Access denied</p>
        <p className="text-sm text-muted-foreground">Halaman ini khusus admin.</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-1" />Beranda
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground leading-tight">Pengaturan Etalase</h1>
            <p className="text-[0.7em] text-muted-foreground/70 leading-tight">Storefront Settings</p>
          </div>
          <Link to="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />Kelola Produk
            </Button>
          </Link>
        </div>

        <SettingField
          settingKey="shop_name"
          icon={Store}
          title="Nama Toko"
          titleEn="Shop Name"
          description="Nama etalase yang tampil di header, footer, dan pesanan."
          descriptionEn="Shop name shown in the header, footer, and order messages."
          value={get('shop_name', 'Etalase Belanja Tani Kota Denpasar')}
          recordId={idOf('shop_name')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="whatsapp_number"
          icon={Phone}
          title="Nomor WhatsApp"
          titleEn="WhatsApp Number"
          description="Nomor format internasional, angka saja (mis. 6281234567890)."
          descriptionEn="International format, digits only (e.g. 6281234567890)."
          placeholder="6281234567890"
          value={get('whatsapp_number')}
          recordId={idOf('whatsapp_number')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="contact_phone"
          icon={Phone}
          title="Telepon Kontak"
          titleEn="Contact Phone"
          description="Nomor telepon yang tampil di halaman Kontak."
          descriptionEn="Phone number shown on the Contact page."
          placeholder="+62 361 000 000"
          value={get('contact_phone')}
          recordId={idOf('contact_phone')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="contact_email"
          icon={Mail}
          title="Email Kontak"
          titleEn="Contact Email"
          description="Email yang tampil di halaman Kontak."
          descriptionEn="Email shown on the Contact page."
          placeholder="hello@etalasetani.id"
          value={get('contact_email')}
          recordId={idOf('contact_email')}
          onSaved={onSaved}
        />

        <BanksEditor value={get('banks')} recordId={idOf('banks')} onSaved={onSaved} />

        <SettingField
          settingKey="qris_merchant_name"
          icon={QrCode}
          title="Nama Merchant QRIS"
          titleEn="QRIS Merchant Name"
          description="Nama merchant yang tampil pada opsi pembayaran QRIS."
          descriptionEn="Merchant name shown on the QRIS payment option."
          value={get('qris_merchant_name', 'TaniSegar Market')}
          recordId={idOf('qris_merchant_name')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="qris_image"
          icon={CreditCard}
          title="Gambar QRIS (URL)"
          titleEn="QRIS Image URL"
          description="URL gambar QRIS. Kosongkan untuk menampilkan placeholder."
          descriptionEn="QRIS image URL. Leave empty to show a placeholder."
          placeholder="https://..."
          value={get('qris_image')}
          recordId={idOf('qris_image')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="voucher_first_time_percent"
          icon={Ticket}
          title="Voucher Pembelian Pertama (%)"
          titleEn="First-Time Voucher (%)"
          description="Diskon otomatis untuk pelanggan saat checkout pertama kali."
          descriptionEn="Auto discount for a customer's first checkout."
          placeholder="10"
          value={get('voucher_first_time_percent', '10')}
          recordId={idOf('voucher_first_time_percent')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="voucher_loyalty_min_orders"
          icon={Award}
          title="Voucher Loyal — Min. Jumlah Pesanan"
          titleEn="Loyalty Voucher — Min. Orders"
          description="Jumlah pesanan minimum untuk membuka voucher loyal."
          descriptionEn="Minimum number of orders to unlock the loyalty voucher."
          placeholder="5"
          value={get('voucher_loyalty_min_orders', '5')}
          recordId={idOf('voucher_loyalty_min_orders')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="voucher_loyalty_min_total"
          icon={Award}
          title="Voucher Loyal — Min. Total Belanja (Rp)"
          titleEn="Loyalty Voucher — Min. Spend (IDR)"
          description="Total belanja kumululatif minimum (Rp) untuk membuka voucher loyal."
          descriptionEn="Minimum cumulative spend (IDR) to unlock the loyalty voucher."
          placeholder="500000"
          value={get('voucher_loyalty_min_total', '500000')}
          recordId={idOf('voucher_loyalty_min_total')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="voucher_loyalty_percent"
          icon={Award}
          title="Voucher Loyal — Diskon (%)"
          titleEn="Loyalty Voucher — Discount (%)"
          description="Persentase diskon voucher loyal saat syarat terpenuhi."
          descriptionEn="Loyalty discount percentage once thresholds are met."
          placeholder="15"
          value={get('voucher_loyalty_percent', '15')}
          recordId={idOf('voucher_loyalty_percent')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="welcome_marquee"
          icon={ScrollText}
          title="Teks Berjalan"
          titleEn="Running Marquee"
          description="Teks berjalan di bagian atas etalase."
          descriptionEn="Scrolling text at the top of the storefront."
          multiline
          value={get('welcome_marquee', 'Selamat Datang, Selamat Berbelanja! 🌿')}
          recordId={idOf('welcome_marquee')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="weekly_report_email"
          icon={Mail}
          title="Email Laporan Mingguan"
          titleEn="Weekly Report Email"
          description="Rangkuman penjualan dikirim otomatis ke email ini setiap Senin 08.00 WITA."
          descriptionEn="A weekly sales summary is auto-sent here every Monday at 08.00 WITA."
          placeholder="anda@email.com"
          value={get('weekly_report_email')}
          recordId={idOf('weekly_report_email')}
          onSaved={onSaved}
        />

        <SettingField
          settingKey="order_notification_email"
          icon={Bell}
          title="Email Notifikasi Pesanan"
          titleEn="Order Notification Email"
          description="Notifikasi otomatis dikirim ke email ini setiap ada pesanan baru (COD/VA/QRIS)."
          descriptionEn="An automatic notification is sent here whenever a new order is placed."
          placeholder="anda@email.com"
          value={get('order_notification_email')}
          recordId={idOf('order_notification_email')}
          onSaved={onSaved}
        />

        <Link to="/admin/products" className="block text-center text-sm text-muted-foreground hover:text-foreground">
          ← Kembali ke kelola produk / Back to products
        </Link>
      </div>
    </div>
  );
}