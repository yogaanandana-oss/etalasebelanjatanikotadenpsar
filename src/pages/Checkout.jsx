const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Banknote, Building2, QrCode, Loader2, ShoppingBag, Ticket, Award, LogIn, User } from 'lucide-react';

import { useCart } from '@/lib/cartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Image } from '@/components/ui/image';
import { useToast } from '@/components/ui/use-toast';
import {
  shopConfig,
  buildOrderRef,
  paymentLabel,
} from '@/lib/shopConfig';
import { formatIDR, finalPrice } from '@/lib/format';
import { effectivePrice, itemKey, gradeFullLabel, isWeightPriced } from '@/lib/grades';
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess';
import CheckoutGuide from '@/components/checkout/CheckoutGuide';
import { Bi } from '@/components/ui/Bi';

const METHODS = [
  {
    id: 'cod',
    label_id: 'COD (Bayar di Tempat)',
    label_en: 'Cash on Delivery',
    desc_id: 'Bayar tunai saat pesanan diterima',
    desc_en: 'Pay cash when your order arrives',
    icon: Banknote,
    accent: 'bg-accent',
  },
  {
    id: 'virtual_account',
    label_id: 'Transfer Bank (VA)',
    label_en: 'Bank Transfer (VA)',
    desc_id: 'BCA · BNI · BRI · Mandiri',
    desc_en: 'BCA · BNI · BRI · Mandiri',
    icon: Building2,
    accent: 'bg-primary',
  },
  {
    id: 'qris',
    label_id: 'QRIS',
    label_en: 'QRIS',
    desc_id: 'Scan & bayar dengan e-wallet / m-banking',
    desc_en: 'Scan & pay with e-wallet / m-banking',
    icon: QrCode,
    accent: 'bg-accent',
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [method, setMethod] = useState('cod');
  const [bank, setBank] = useState('bca');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState('');
  const [account, setAccount] = useState(null); // logged-in user or null
  const [voucher, setVoucher] = useState(null); // { type, percent, amount, note_id, note_en }
  const [codeInput, setCodeInput] = useState('');
  const [codeVoucher, setCodeVoucher] = useState(null); // matched Voucher record
  const [codeError, setCodeError] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);
  const { toast } = useToast();

  const applyCode = async () => {
    setCodeError('');
    setCodeVoucher(null);
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setCheckingCode(true);
    try {
      const rows = await db.entities.Voucher.list('-created_date', 200);
      const list = Array.isArray(rows) ? rows : rows.items || [];
      const match = list.find((v) => v.code.toUpperCase() === code);
      if (!match) {
        setCodeError('Kode tidak ditemukan / Code not found');
      } else if (!match.active) {
        setCodeError('Voucher tidak aktif / Voucher inactive');
      } else if (match.valid_date) {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (today !== match.valid_date) {
          setCodeError(`Voucher berlaku ${match.valid_date} / Valid only on ${match.valid_date}`);
        } else {
          setCodeVoucher(match);
        }
      } else {
        setCodeVoucher(match);
      }
    } catch {
      setCodeError('Gagal memeriksa kode / Failed to check code');
    } finally {
      setCheckingCode(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    db.auth
      .me()
      .then(async (u) => {
        if (cancelled) return;
        setAccount(u);
        try {
          const prev = await db.entities.Order.filter({ created_by_id: u.id }, '-created_date', 200);
          const list = Array.isArray(prev) ? prev : prev.items || [];
          const completed = list.filter((o) => ['paid', 'processing', 'shipped', 'completed'].includes(o.status));
          const ordersCount = completed.length;
          const ordersTotal = completed.reduce((s, o) => s + (Number(o.total) || 0), 0);
          if (
            ordersCount >= Number(shopConfig.voucherLoyaltyMinOrders || 0) &&
            ordersTotal >= Number(shopConfig.voucherLoyaltyMinTotal || 0)
          ) {
            const percent = Number(shopConfig.voucherLoyaltyPercent || 0);
            setVoucher({
              type: 'loyalty',
              percent,
              note_id: `Voucher Loyal ${percent}% aktif · ${ordersCount} pesanan`,
              note_en: `Loyalty voucher ${percent}% active · ${ordersCount} orders`,
            });
          } else {
            setVoucher(null);
          }
        } catch {
          setVoucher(null);
        }
      })
      .catch(() => {
        if (!cancelled) setAccount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  const codePercent = codeVoucher ? Number(codeVoucher.discount_percent) || 0 : 0;
  const codeFlat = codeVoucher ? Number(codeVoucher.discount_amount) || 0 : 0;
  const codeFlatPerUnit = !!codeVoucher?.per_unit;
  const autoPercent = voucher ? voucher.percent : 0;

  const autoPercentAmount = Math.round((subtotal * autoPercent) / 100);
  const codePercentAmount = Math.round((subtotal * codePercent) / 100);
  const codeFlatAmount = codeFlat > 0 ? (codeFlatPerUnit ? codeFlat * totalQty : codeFlat) : 0;
  const codeAmount = Math.max(codePercentAmount, codeFlatAmount);

  const usingCode = codeVoucher && codeAmount > 0 && codeAmount >= autoPercentAmount;
  const discountAmount = Math.max(autoPercentAmount, codeAmount);
  const discountPercent = usingCode && codeFlat === 0 ? Math.max(codePercent, autoPercent) : autoPercent;
  const discountSource = usingCode
    ? `Kode ${codeVoucher.code}`
    : voucher
      ? voucher.type === 'loyalty' ? 'Voucher Loyal' : 'Voucher Pertama'
      : '';
  const discountLabel = usingCode && codeFlatAmount > 0
    ? (codeFlatPerUnit ? `${formatIDR(codeFlat)} × ${totalQty}` : formatIDR(codeFlat))
    : `${discountPercent}%`;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleCancelOrder = async () => {
    if (!placedOrder?.id) return;
    try {
      await db.entities.Order.update(placedOrder.id, { status: 'cancelled', transaction_status: 'cancelled' });
      toast({ description: 'Pesanan dibatalkan / Order cancelled' });
    } catch {
      toast({ description: 'Gagal membatalkan / Cancel failed', variant: 'destructive' });
    } finally {
      clearCart();
      navigate('/');
    }
  };

  const handleEditOrder = async () => {
    if (!placedOrder?.id) return;
    try {
      await db.entities.Order.update(placedOrder.id, { status: 'cancelled', transaction_status: 'cancelled' });
    } catch {
      /* ignore — still allow editing */
    }
    toast({ description: 'Ubah pesanan — silakan perbarui keranjang / Edit order — please update your cart' });
    setPlacedOrder(null);
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 lg:px-6">
        <CheckoutSuccess
          order={placedOrder}
          onCancel={handleCancelOrder}
          onEdit={handleEditOrder}
          onBack={() => {
            clearCart();
            navigate('/');
          }}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <ShoppingBag className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="font-display font-semibold text-foreground">Keranjang masih kosong</p>
        <p className="text-sm text-muted-foreground/70">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">Tambahkan sayuran segar dulu sebelum checkout.</p>
        <p className="text-sm text-muted-foreground/70">Add some fresh produce before checking out.</p>
        <Button onClick={() => navigate('/')} className="rounded-full mt-2">
          Mulai belanja · Start shopping
        </Button>
      </div>
    );
  }

  const valid = customer.name.trim() && customer.phone.trim() && customer.address.trim();

  const handlePlace = async () => {
    setError('');
    if (!valid) {
      setError('Lengkapi nama, nomor HP, dan alamat pengiriman. / Please complete name, phone, and delivery address.');
      return;
    }
    setPlacing(true);
    const orderRef = buildOrderRef();
    try {
      const itemsSummary = items
        .map((i) => `${i.product.name_id || i.product.name}${i.grade ? ` (${gradeFullLabel(i.grade)})` : ''}${isWeightPriced(i.product) && i.weight ? ` ${i.weight}kg` : ''} x${i.quantity}${i.product.in_stock ? '' : ' (Pre-Order)'}`)
        .join(' · ');
      const created = await db.entities.Order.create({
        order_ref: orderRef,
        customer_name: customer.name,
        customer_phone: customer.phone,
        delivery_address: customer.address,
        items_summary: itemsSummary,
        items_json: JSON.stringify(items),
        total: finalTotal,
        payment_method: method,
        bank: method === 'virtual_account' ? bank : null,
        status: 'pending',
        transaction_status: 'pending',
        voucher_type: voucher ? voucher.type : 'none',
        discount_percent: discountPercent,
        discount_amount: discountAmount,
      });

      const order = {
        id: created.id,
        orderRef,
        customer,
        items,
        total: finalTotal,
        subtotal,
        discountAmount,
        voucherType: voucher ? voucher.type : 'none',
        method,
        bank: method === 'virtual_account' ? bank : null,
      };

      setPlacedOrder(order);

      // Notify admin by email (fire-and-forget; never block order success)
      db.functions
        .invoke('sendOrderNotification', {
          orderRef,
          customerName: customer.name,
          customerPhone: customer.phone,
          deliveryAddress: customer.address,
          itemsSummary,
          total: finalTotal,
          paymentMethod: method,
          voucherType: voucher ? voucher.type : 'none',
          discountAmount,
        })
        .catch(() => {});
    } catch (e) {
      setError('Gagal membuat pesanan. Coba lagi. / Failed to place order. Try again. ' + (e?.message || ''));
    } finally {
      setPlacing(false);
    }
  };

  const bankInfo = shopConfig.banks.find((b) => b.code === bank);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-extrabold text-lg text-foreground leading-tight">Checkout</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Top: customer + method */}
        <div className="space-y-6">
          <CheckoutGuide />
          <Card className="p-5 rounded-xl border-border">
            <h2 className="font-display font-bold text-[1.25rem] text-foreground leading-tight">Detail Pengiriman</h2>
            <p className="text-[0.7em] text-muted-foreground/70">Delivery Details</p>
            <div className="grid gap-4 mt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name"><Bi id="Nama" en="Name" /></Label>
                  <Input
                    id="name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Nama lengkap / Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone"><Bi id="No. HP / WhatsApp" en="Phone / WhatsApp" /></Label>
                  <Input
                    id="phone"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address"><Bi id="Alamat Pengiriman" en="Delivery Address" /></Label>
                <Textarea
                  id="address"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Jalan, RT/RW, kelurahan, kota, kode pos / Street, village, city, postal code"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-xl border-border">
            <h2 className="font-display font-bold text-[1.25rem] text-foreground leading-tight">Metode Pembayaran</h2>
            <p className="text-[0.7em] text-muted-foreground/70">Payment Method</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              {METHODS.map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`text-left rounded-xl border p-3 transition-colors ${
                      active ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${m.accent} flex items-center justify-center mb-2`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-semibold text-sm text-foreground leading-tight">{m.label_id}</p>
                    <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{m.label_en}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">{m.desc_id}</p>
                    <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{m.desc_en}</p>
                  </button>
                );
              })}
            </div>

            {method === 'virtual_account' && (
              <div className="mt-4 space-y-3">
                <Label><Bi id="Pilih Bank" en="Select Bank" /></Label>
                <Select value={bank} onValueChange={setBank}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shopConfig.banks.map((b) => (
                      <SelectItem key={b.code} value={b.code}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="rounded-lg bg-secondary/60 p-3 text-sm">
                  <p className="text-muted-foreground">Transfer ke / Transfer to:</p>
                  <p className="font-semibold text-foreground">{bankInfo?.accountName}</p>
                  <p className="font-display font-bold text-foreground">{bankInfo?.accountNumber}</p>
                </div>
              </div>
            )}

            {method === 'qris' && (
              <div className="mt-4 flex items-center gap-4 rounded-lg bg-secondary/60 p-3">
                <div className="w-16 h-16 rounded-lg bg-card border border-border flex items-center justify-center">
                  {shopConfig.qrisImage ? (
                    <Image src={shopConfig.qrisImage} alt="QRIS" className="w-full h-full" fittingType="fit" />
                  ) : (
                    <QrCode className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Kode QRIS toko akan ditampilkan setelah pesanan dibuat untuk Anda scan.
                  <span className="block text-[0.7em] text-muted-foreground/70 mt-1">
                    The shop QRIS code appears after your order is created for you to scan.
                  </span>
                </p>
              </div>
            )}

            {method === 'cod' && (
              <div className="mt-4 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
                Bayar tunai saat pesanan diterima oleh kurir. Siapkan uang pas jika memungkinkan.
                <span className="block text-[0.7em] text-muted-foreground/70 mt-1">
                  Pay cash when the courier delivers your order. Please prepare exact change if possible.
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Bottom: order summary (checkout) — placed below payment method */}
        <div>
          <Card className="p-5 rounded-xl border-border">
            <h2 className="font-display font-bold text-[1.25rem] text-foreground leading-tight">Ringkasan Pesanan</h2>
            <p className="text-[0.7em] text-muted-foreground/70">Order Summary</p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mt-4">
              {items.map((item) => {
                const { product, quantity, grade } = item;
                const unitPrice = effectivePrice(item);
                return (
                <div key={itemKey(item)} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                    <Image src={product.image_url} alt={product.name} className="w-full h-full" fittingType="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{product.name_id || product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {quantity} × {formatIDR(unitPrice)}
                      {grade && <span className="ml-1.5 text-primary font-semibold">· {gradeFullLabel(grade)}</span>}
                      {isWeightPriced(product) && item.weight > 0 && <span className="ml-1.5 text-foreground/70 font-semibold">· {item.weight} kg</span>}
                      {!product.in_stock && <span className="ml-1.5 text-accent font-semibold">· Pre-Order</span>}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatIDR(unitPrice * quantity)}
                  </span>
                </div>
                );
              })}
            </div>
            {account && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">{account.email || account.full_name}</span>
              </div>
            )}

            <div className="mt-4">
              <Label className="text-xs"><Bi id="Kode Voucher" en="Voucher Code" /></Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="cth. SEGAR10"
                  className="h-9 bg-card uppercase"
                />
                <Button variant="outline" size="sm" onClick={applyCode} disabled={checkingCode} className="h-9 shrink-0">
                  {checkingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pakai'}
                </Button>
              </div>
              {codeError && <p className="text-xs text-destructive mt-1">{codeError}</p>}
              {codeVoucher && (
                <p className="text-xs text-emerald-600 mt-1">
                  Voucher {codeVoucher.code} aktif ·{' '}
                  {Number(codeVoucher.discount_amount) > 0
                    ? codeVoucher.per_unit
                      ? `${formatIDR(codeVoucher.discount_amount)}/unit`
                      : formatIDR(codeVoucher.discount_amount)
                    : `${codeVoucher.discount_percent}%`}
                </p>
              )}
            </div>

            {voucher ? (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-primary">
                  {voucher.type === 'loyalty' ? <Award className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                  <p className="font-semibold text-sm leading-tight">{voucher.note_id}</p>
                </div>
                <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{voucher.note_en}</p>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                <p>Belum memenuhi syarat voucher loyal. Lanjutkan belanja untuk membukanya.</p>
                <p className="text-[0.7em] text-muted-foreground/70">Keep shopping to unlock the loyalty voucher.</p>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-muted-foreground">Diskon {discountSource} ({discountLabel})</span>
                <span className="text-primary font-semibold">−{formatIDR(discountAmount)}</span>
              </div>
            )}

            <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
              <Bi id="Total" en="Total" />
              <span className="font-display font-extrabold text-xl text-foreground">{formatIDR(finalTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <p className="text-xs text-muted-foreground line-through mt-0.5 text-right">{formatIDR(subtotal)}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Metode / Method: {paymentLabel(method, bank)}</p>

            {error && <p className="text-sm text-destructive mt-3">{error}</p>}

            <Button
              onClick={handlePlace}
              disabled={placing}
              className="w-full h-11 mt-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {placing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Memproses… / Processing…
                </>
              ) : (
                <>Buat Pesanan · Place Order · {formatIDR(finalTotal)}</>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}