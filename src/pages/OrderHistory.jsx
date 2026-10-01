const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock, ShoppingBag, Repeat, Package, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/lib/cartContext';
import { formatIDR } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/marketplace/PageHeader';
import OrderDetailPanel from '@/components/marketplace/OrderDetailPanel';
import ThankYouCard from '@/components/marketplace/ThankYouCard';

const STATUS = {
  pending: { id: 'Menunggu', en: 'Pending', tone: 'bg-amber-100 text-amber-700' },
  paid: { id: 'Dibayar', en: 'Paid', tone: 'bg-emerald-100 text-emerald-700' },
  processing: { id: 'Diproses', en: 'Processing', tone: 'bg-blue-100 text-blue-700' },
  shipped: { id: 'Dikirim', en: 'Shipped', tone: 'bg-indigo-100 text-indigo-700' },
  completed: { id: 'Selesai', en: 'Completed', tone: 'bg-emerald-100 text-emerald-700' },
  expired: { id: 'Kedaluwarsa', en: 'Expired', tone: 'bg-muted text-muted-foreground' },
  cancelled: { id: 'Dibatalkan', en: 'Cancelled', tone: 'bg-destructive/15 text-destructive' },
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    db.auth
      .me()
      .then(async (u) => {
        try {
          const data = await db.entities.Order.filter({ created_by_id: u.id }, '-created_date', 200);
          setOrders(Array.isArray(data) ? data : data.items || []);
        } catch {
          setOrders([]);
        } finally {
          setLoading(false);
        }
      })
      .catch(() => { setNeedLogin(true); setLoading(false); });
  }, []);

  const reorder = (order) => {
    try {
      const items = JSON.parse(order.items_json || '[]');
      if (!items.length) {
        toast({ description: 'Tidak ada item untuk diulang / No items to reorder', variant: 'destructive' });
        return;
      }
      items.forEach((i) => { for (let q = 0; q < (i.quantity || 1); q++) addItem(i.product); });
      toast({ description: 'Item dimasukkan ke keranjang / Added to cart' });
      navigate('/checkout');
    } catch {
      toast({ description: 'Gagal mengulang pesanan / Reorder failed', variant: 'destructive' });
    }
  };

  if (needLogin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6 text-center">
        <Lock className="w-8 h-8 text-primary" />
        <p className="font-display font-semibold">Masuk untuk melihat riwayat belanja</p>
        <p className="text-sm text-muted-foreground/70">Sign in to view your order history</p>
        <Button asChild className="rounded-full"><Link to="/login">Masuk / Sign in</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Riwayat Belanja" en="Order History" />
      <main className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <Card className="p-10 text-center rounded-xl">
            <Package className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-display font-semibold">Belum ada pesanan</p>
            <p className="text-sm text-muted-foreground/70">No orders yet</p>
            <Button asChild className="rounded-full mt-3"><Link to="/"><ShoppingBag className="w-4 h-4 mr-1" />Mulai belanja</Link></Button>
          </Card>
        ) : (
          orders.map((o) => {
            const st = STATUS[o.status] || STATUS.pending;
            const open = expandedId === o.id;
            return (
              <Card key={o.id} className="rounded-xl overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId(open ? null : o.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(open ? null : o.id); } }}
                  className="p-4 cursor-pointer select-none touch-manipulation"
                  aria-expanded={open}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display font-bold text-foreground">{o.order_ref}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${st.tone}`}>{st.id}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{o.items_summary}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-display font-extrabold text-foreground">{formatIDR(o.total)}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      {open ? 'Sembunyikan / Hide' : 'Rincian / Details'}
                    </span>
                  </div>
                </div>

                {open && (
                  <div className="px-4 pb-4 space-y-4">
                    <ThankYouCard />
                    <OrderDetailPanel order={o} />
                    <Button size="sm" variant="outline" onClick={() => reorder(o)} className="rounded-full w-full">
                      <Repeat className="w-4 h-4 mr-1" />Pesan lagi / Reorder
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}