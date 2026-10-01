const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle2, XCircle, Trash2, Loader2, Lock, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Bi } from '@/components/ui/Bi';
import PageHeader from '@/components/marketplace/PageHeader';

export default function AdminReviews() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [revs, prods] = await Promise.all([
        db.entities.Review.list('-created_date', 500),
        db.entities.Product.list('-created_date', 500),
      ]);
      const rList = Array.isArray(revs) ? revs : revs.items || [];
      const pList = Array.isArray(prods) ? prods : prods.items || [];
      const pMap = {};
      pList.forEach((p) => { pMap[p.id] = p; });
      setProducts(pMap);
      setReviews(rList);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    db.auth.me().then((u) => { setMe(u); if (u?.role !== 'admin') setDenied(true); }).catch(() => setDenied(true));
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'pending') return reviews.filter((r) => !r.approved);
    if (filter === 'approved') return reviews.filter((r) => r.approved);
    return reviews;
  }, [reviews, filter]);

  const toggleApprove = async (r) => {
    try {
      const updated = await db.entities.Review.update(r.id, { approved: !r.approved });
      setReviews((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({ description: updated.approved ? 'Ulasan disetujui / Approved' : 'Ulasan dicabut / Unapproved' });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  const remove = async (r) => {
    if (!confirm('Hapus ulasan ini? / Delete this review?')) return;
    try {
      await db.entities.Review.delete(r.id);
      setReviews((prev) => prev.filter((x) => x.id !== r.id));
      toast({ description: 'Ulasan dihapus / Review deleted' });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6 text-center">
        <Lock className="w-7 h-7 text-destructive" />
        <p className="font-display font-semibold">Akses ditolak / Access denied</p>
        <Button asChild variant="outline"><Link to="/"><ArrowLeft className="w-4 h-4 mr-1" />Kembali</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader id="Manajemen Ulasan" en="Review Management" />
      <main className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            {['all', 'pending', 'approved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`h-8 px-3 rounded-full text-xs font-semibold ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}
              >
                {f === 'all' ? 'Semua / All' : f === 'pending' ? 'Menunggu / Pending' : 'Disetujui / Approved'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="rounded-full">
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />Segarkan
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center rounded-xl">
            <p className="font-display font-semibold">Tidak ada ulasan</p>
            <p className="text-sm text-muted-foreground/70">No reviews</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => {
              const p = products[r.product_id];
              return (
                <Card key={r.id} className="p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{r.name}</span>
                        <span className="inline-flex items-center gap-0.5 text-xs text-amber-500">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`} />
                          ))}
                        </span>
                        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${r.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {r.approved ? 'Disetujui' : 'Menunggu'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p ? (p.name_id || p.name) : 'Produk tidak tersedia'}</p>
                      <p className="text-sm text-foreground mt-1.5">{r.comment}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleApprove(r)} title={r.approved ? 'Cabut' : 'Setujui'}>
                        {r.approved ? <XCircle className="w-4 h-4 text-muted-foreground" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(r)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}