import React from 'react';
import { User, Phone, MapPin, CreditCard } from 'lucide-react';
import OrderItemsDetail from '@/components/marketplace/OrderItemsDetail';

const PAYMENT = {
  cod: 'Cash on Delivery (COD)',
  virtual_account: 'Transfer Bank (Virtual Account)',
  qris: 'QRIS',
};

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground/70">{label}</p>
        {children}
      </div>
    </div>
  );
}

// Rincian lengkap satu pesanan: item, harga, total, data pemesan & pembayaran.
export default function OrderDetailPanel({ order: o }) {
  return (
    <div className="space-y-4">
      <OrderItemsDetail order={o} />

      <div className="border-t border-border pt-3 space-y-2.5 text-sm">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
          Informasi Pemesanan · Order Information
        </p>
        <InfoRow icon={User} label="Nama / Name">
          <p className="font-semibold text-foreground">{o.customer_name || '—'}</p>
        </InfoRow>
        <InfoRow icon={Phone} label="Telepon / Phone">
          <p className="font-semibold text-foreground">{o.customer_phone || '—'}</p>
        </InfoRow>
        {o.delivery_address && (
          <InfoRow icon={MapPin} label="Alamat Pengiriman / Delivery Address">
            <p className="font-semibold text-foreground">{o.delivery_address}</p>
          </InfoRow>
        )}
        <InfoRow icon={CreditCard} label="Metode Pembayaran / Payment Method">
          <p className="font-semibold text-foreground">{PAYMENT[o.payment_method] || o.payment_method}</p>
          {o.va_number && <p className="text-xs text-muted-foreground">No. VA: {o.va_number}</p>}
          {o.transaction_status && <p className="text-xs text-muted-foreground">Status transaksi: {o.transaction_status}</p>}
        </InfoRow>
      </div>
    </div>
  );
}