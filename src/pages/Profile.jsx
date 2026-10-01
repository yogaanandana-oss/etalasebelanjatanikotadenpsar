const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Save, Loader2, ShoppingBag, Package, Trash2, AlertTriangle, LogOut, UserRound, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatIDR, formatShortDate } from '@/lib/format';
import BaliPattern from '@/components/marketplace/BaliPattern';
import OrderDetailPanel from '@/components/marketplace/OrderDetailPanel';
import { useAuth } from '@/lib/AuthContext';

const STATUS = {
  pending: { id: 'Menunggu', en: 'Pending', cls: 'bg-amber-100 text-amber-700' },
  paid: { id: 'Dibayar', en: 'Paid', cls: 'bg-blue-100 text-blue-700' },
  processing: { id: 'Diproses', en: 'Processing', cls: 'bg-indigo-100 text-indigo-700' },
  shipped: { id: 'Dikirim', en: 'Shipped', cls: 'bg-purple-100 text-purple-700' },
  completed: { id: 'Selesai', en: 'Completed', cls: 'bg-emerald-100 text-emerald-700' },
  expired: { id: 'Kedaluwarsa', en: 'Expired', cls: 'bg-rose-100 text-rose-700' },
  cancelled: { id: 'Dibatalkan', en: 'Cancelled', cls: 'bg-rose-100 text-rose-700' },
};

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [form, setForm] = useState({ delivery_phone: '', delivery_address: '' });
  const [saving, setSaving] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setForm({
      delivery_phone: user.delivery_phone || '',
      delivery_address: user.delivery_address || '',
    });
    setOrdersLoading(true);
    db.entities.Order.filter({ created_by_id: user.id }, '-created_date', 50)
      .then((d) => setOrders(Array.isArray(d) ? d : d.items || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [isAuthenticated, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await db.auth.updateMe({
        delivery_phone: form.delivery_phone.trim(),
        delivery_address: form.delivery_address.trim(),
      });
      toast({ title: 'Info pengiriman disimpan / Delivery info saved' });
    } catch {
      toast({ title: 'Gagal menyimpan / Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    setSigningOut(true);
    logout(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await db.functions.invoke('deleteMyAccount', {});
      toast({ title: 'Akun berhasil dihapus / Account deleted' });
      setTimeout(() => { db.auth.logout('/'); }, 500);
    } catch (err) {
      setDeleting(false);
      toast({
        title: 'Gagal menghapus akun / Failed to delete account',
        description: err?.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
          <div className="max-w-3xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div className="leading-tight">
              <h1 className="font-display font-extrabold text-lg text-foreground">Profil Pelanggan</h1>
              <p className="text-[0.7em] text-muted-foreground/70">My Profile</p>
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-6">
          <BaliPattern className="text-primary/20" height={18} />
          <Card className="p-8 rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UserRound className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">Masuk ke Akun Anda</h2>
              <p className="text-[0.7em] text-muted-foreground/70">Sign in to your account</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Masuk untuk melihat profil, riwayat pesanan, dan voucher loyalitas Anda.
              <br />
              <span className="text-[0.85em] text-muted-foreground/70">Sign in to view your profile, order history, and loyalty vouchers.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild className="h-11 rounded-xl px-6">
                <Link to="/login">Masuk / Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl px-6">
                <Link to="/register">Buat Akun / Create Account</Link>
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div className="leading-tight">
            <h1 className="font-display font-extrabold text-lg text-foreground">Profil Pelanggan</h1>
            <p className="text-[0.7em] text-muted-foreground/70">My Profile</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <BaliPattern className="text-primary/20" height={18} />

        <Card className="p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-lg">
              {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-foreground truncate">{user?.full_name || 'Pelanggan'}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />{user?.email}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-xl space-y-4">
          <div>
            <h2 className="font-display font-bold text-foreground">Informasi Pengiriman</h2>
            <p className="text-[0.7em] text-muted-foreground/70">Delivery Information · digunakan saat checkout</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label><Phone className="w-3.5 h-3.5 inline mr-1" />Nomor HP / Phone</Label>
              <Input
                value={form.delivery_phone}
                onChange={(e) => setForm((f) => ({ ...f, delivery_phone: e.target.value }))}
                placeholder="0812xxxxxxx"
                className="h-10 bg-card"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label><MapPin className="w-3.5 h-3.5 inline mr-1" />Alamat Pengiriman / Delivery Address</Label>
              <Textarea
                value={form.delivery_address}
                onChange={(e) => setForm((f) => ({ ...f, delivery_address: e.target.value }))}
                placeholder="Jl. ... Kecamatan, Kota Denpasar"
                className="bg-card min-h-[80px]"
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full h-11">
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            <span className="flex flex-col leading-tight">
              <span>Simpan Info</span>
              <span className="text-[0.7em] font-normal opacity-80">Save</span>
            </span>
          </Button>
        </Card>

        <Card className="p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-display font-bold text-foreground">Riwayat Pesanan</h2>
              <p className="text-[0.7em] text-muted-foreground/70">Order History · {orders.length} pesanan</p>
            </div>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-medium text-foreground">Belum ada pesanan</p>
              <p className="text-sm text-muted-foreground/70">No orders yet</p>
              <Link to="/" className="inline-block mt-3">
                <Button variant="outline" size="sm">Mulai Belanja / Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const st = STATUS[o.status] || STATUS.pending;
                const open = expandedId === o.id;
                const toggle = () => setExpandedId(open ? null : o.id);
                return (
                  <div key={o.id} className="rounded-xl border border-border overflow-hidden">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={open}
                      onClick={toggle}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
                      className="p-3 cursor-pointer select-none touch-manipulation hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-sm text-foreground truncate">{o.order_ref}</p>
                          <p className="text-xs text-muted-foreground">{formatShortDate(o.created_date)} · {o.customer_name}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[0.7rem] font-semibold ${st.cls}`}>{st.id}</span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">{o.items_summary || '—'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[0.7rem] text-muted-foreground capitalize">{o.payment_method}</span>
                        <span className="font-display font-bold text-sm text-foreground">{formatIDR(o.total)}</span>
                      </div>
                      <p className="text-xs font-semibold text-primary mt-1">{open ? 'Sembunyikan / Hide' : 'Rincian / Details'}</p>
                    </div>
                    {open && (
                      <div className="px-3 pb-3">
                        <OrderDetailPanel order={o} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-display font-bold text-foreground">Keluar dari Akun</h2>
              <p className="text-[0.7em] text-muted-foreground/70">Sign Out · keluar dari perangkat ini</p>
            </div>
          </div>
          <Button variant="outline" className="w-full h-11 rounded-xl" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <LogOut className="w-4 h-4 mr-1.5" />}
            Keluar / Sign Out
          </Button>
        </Card>

        <Card className="p-5 rounded-xl border-destructive/30 space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            <div>
              <h2 className="font-display font-bold text-foreground">Hapus Akun</h2>
              <p className="text-[0.7em] text-muted-foreground/70">Delete Account · tindakan ini menghapus akun secara permanen</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Akun Anda akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
            <br />
            <span className="text-[0.85em] text-muted-foreground/70">Your account will be permanently erased. This action cannot be undone.</span>
          </p>
          <Button variant="destructive" className="w-full h-11 rounded-xl" onClick={() => { setDelOpen(true); setConfirmText(''); }}>
            <Trash2 className="w-4 h-4 mr-1.5" />Hapus Akun / Delete Account
          </Button>
        </Card>
      </main>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2 mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Yakin menghapus akun?</DialogTitle>
            <DialogDescription className="text-center">
              Ketik <b>HAPUS</b> untuk menghapus akun Anda secara permanen.
              <br />
              <span className="text-[0.85em] text-muted-foreground/70">Type HAPUS to permanently delete your account.</span>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="HAPUS"
            className="text-center font-semibold"
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setDelOpen(false)} disabled={deleting}>
              Batal / Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-full"
              disabled={deleting || confirmText.trim().toUpperCase() !== 'HAPUS'}
              onClick={handleDelete}
            >
              {deleting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
              Hapus / Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}