import React, { useState } from 'react';
import { CheckCircle2, Copy, MessageCircle, ArrowLeft, QrCode, X, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { shopConfig, openWhatsApp, buildConfirmMessage, paymentLabel } from '@/lib/shopConfig';
import { formatIDR } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';
import { Bi } from '@/components/ui/Bi';
import ThankYouCard from '@/components/marketplace/ThankYouCard';

export default function CheckoutSuccess({ order, onBack, onCancel, onEdit }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState('');
  const [busy, setBusy] = useState(false);
  const { orderRef, customer, items, total, method, bank } = order;
  const bankInfo = shopConfig.banks.find((b) => b.code === bank);

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
    toast({ description: 'Disalin ke clipboard / Copied to clipboard' });
  };

  const handleConfirm = () => {
    openWhatsApp(buildConfirmMessage({ orderRef, total, method, bank }));
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    if (!confirm('Batalkan pesanan ini? / Cancel this order?')) return;
    setBusy(true);
    try {
      await onCancel();
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async () => {
    if (!onEdit) return;
    setBusy(true);
    try {
      await onEdit();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-2xl text-foreground leading-tight">Pesanan Dibuat!</h1>
          <p className="text-[0.7em] text-muted-foreground/70">Order Placed!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ref <span className="font-semibold text-foreground">{orderRef}</span> · silakan selesaikan pembayaran di bawah.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Ref <span className="font-semibold text-foreground">{orderRef}</span> · please complete payment below.
          </p>
        </div>
      </div>

      <ThankYouCard className="mb-5" />

      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="flex items-center justify-between text-sm">
          <Bi id="Metode pembayaran" en="Payment method" />
          <span className="font-semibold text-foreground">{paymentLabel(method, bank)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <Bi id="Total tagihan" en="Total due" />
          <span className="font-display font-extrabold text-lg text-foreground">{formatIDR(total)}</span>
        </div>

        {method === 'cod' && (
          <div className="rounded-lg bg-secondary/60 p-4 text-sm text-foreground">
            Pembayaran dilakukan tunai saat pesanan diterima. Pastikan uang pas atau siapkan uang kembalian.
            <span className="block text-[0.7em] text-muted-foreground/70 mt-1">
              Payment is made in cash when your order arrives. Please prepare exact change.
            </span>
          </div>
        )}

        {method === 'virtual_account' && bankInfo && (
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
              Transfer ke rekening berikut
            </p>
            <p className="text-[0.7em] uppercase tracking-wide text-muted-foreground/60 leading-tight">
              Transfer to the following account
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{bankInfo.name}</span>
              <span className="font-semibold text-foreground">{bankInfo.accountName}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-display font-extrabold text-lg tracking-wide text-foreground">
                {bankInfo.accountNumber}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => copy(bankInfo.accountNumber, 'va')}
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                {copied === 'va' ? 'Disalin · Copied' : 'Salin · Copy'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Transfer sesuai nominal <span className="font-semibold text-foreground">{formatIDR(total)}</span>. Pembayaran diverifikasi manual oleh toko.
              <span className="block text-[0.7em] text-muted-foreground/70 mt-1">
                Transfer exactly <span className="font-semibold text-foreground">{formatIDR(total)}</span>. Payment is verified manually by the shop.
              </span>
            </p>
          </div>
        )}

        {method === 'qris' && (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-52 h-52 rounded-xl border border-border bg-secondary/40 flex items-center justify-center overflow-hidden">
              {shopConfig.qrisImage ? (
                <Image src={shopConfig.qrisImage} alt="QRIS" className="w-full h-full" fittingType="fit" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                  <QrCode className="w-12 h-12" />
                  <p className="text-xs font-semibold">QRIS {shopConfig.qrisMerchantName}</p>
                  <p className="text-[0.65rem]">Tambahkan gambar QRIS Anda di shopConfig / Add your QRIS image in shopConfig</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Scan dengan e-wallet/m-banking, bayar <span className="font-semibold text-foreground">{formatIDR(total)}</span>.
              <span className="block text-[0.7em] text-muted-foreground/70 mt-1">
                Scan with e-wallet/m-banking, pay <span className="font-semibold text-foreground">{formatIDR(total)}</span>.
              </span>
            </p>
          </div>
        )}

        {method !== 'cod' && (
          <Button
            onClick={handleConfirm}
            className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold"
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            Konfirmasi via WhatsApp · Confirm via WhatsApp
          </Button>
        )}
      </div>

      <div className="mt-4 text-center text-xs text-muted-foreground">
        Pesanan / Order: {items.map((i) => `${i.product.name_id || i.product.name} x${i.quantity}${i.product.in_stock ? '' : ' (Pre-Order)'}`).join(' · ')}
      </div>

      {onCancel && onEdit && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handleEdit} disabled={busy} className="rounded-xl">
            {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Pencil className="w-4 h-4 mr-1.5" />}
            Ubah Pesanan
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={busy} className="rounded-xl">
            <X className="w-4 h-4 mr-1.5" />
            Batalkan Pesanan
          </Button>
        </div>
      )}

      <div className="mt-6">
        <Button variant="outline" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Kembali belanja · Back to shopping
        </Button>
      </div>
    </div>
  );
}