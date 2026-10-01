const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Loader2, MessageSquare, Send, ShieldCheck, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Bi } from '@/components/ui/Bi';
import { useToast } from '@/components/ui/use-toast';
import { formatShortDate } from '@/lib/format';

function Stars({ value = 0, size = 16, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="text-accent"
          style={{ width: size, height: size }}
          fill={n <= Math.round(value) ? 'currentColor' : 'none'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Pilih rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 rounded-md hover:bg-secondary transition-colors"
          aria-label={`${n} bintang`}
        >
          <Star
            className="text-accent"
            style={{ width: 24, height: 24 }}
            fill={n <= active ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  const load = () => {
    setLoading(true);
    db.entities.Review.filter({ product_id: productId }, '-created_date', 100)
      .then((rows) => setReviews(Array.isArray(rows) ? rows : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (productId) load();
  }, [productId]);

  // Hanya akun yang telah membeli produk ini yang boleh menulis ulasan.
  useEffect(() => {
    let alive = true;
    db.auth.me()
      .then(async (u) => {
        if (!alive) return;
        setCurrentUser(u || null);
        if (!u) { setHasPurchased(false); setCheckingEligibility(false); return; }
        try {
          const orders = await db.entities.Order.filter({ created_by_id: u.id }, '-created_date', 100);
          const list = Array.isArray(orders) ? orders : [];
          const bought = list.some((o) => {
            if (o.status === 'cancelled' || o.status === 'expired') return false;
            try {
              const its = JSON.parse(o.items_json || '[]');
              return Array.isArray(its) && its.some((it) => it?.product?.id === productId);
            } catch { return false; }
          });
          if (alive) setHasPurchased(bought);
        } catch {
          if (alive) setHasPurchased(false);
        } finally {
          if (alive) setCheckingEligibility(false);
        }
      })
      .catch(() => { if (alive) { setCurrentUser(null); setHasPurchased(false); setCheckingEligibility(false); } });
    return () => { alive = false; };
  }, [productId]);

  useEffect(() => {
    if (currentUser?.full_name && !name) setName(currentUser.full_name);
  }, [currentUser]);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: 'Masuk terlebih dahulu untuk menulis ulasan', variant: 'destructive' });
      return;
    }
    if (!hasPurchased) {
      toast({ title: 'Hanya pelanggan yang telah membeli yang dapat menulis ulasan', variant: 'destructive' });
      return;
    }
    if (!rating) {
      toast({ title: 'Pilih rating bintang terlebih dahulu', variant: 'destructive' });
      return;
    }
    if (!name.trim() || !comment.trim()) {
      toast({ title: 'Lengkapi nama dan ulasan', variant: 'destructive' });
      return;
    }
    // Optimistic: reflect the review immediately, then reconcile with the server response.
    const tempId = `pending-${Date.now()}`;
    const optimistic = {
      id: tempId,
      product_id: productId,
      rating,
      name: name.trim(),
      comment: comment.trim(),
      created_date: new Date().toISOString(),
      _pending: true,
    };
    setReviews((prev) => [optimistic, ...prev]);
    const nameVal = name.trim();
    const commentVal = comment.trim();
    setName('');
    setRating(0);
    setComment('');
    setSubmitting(true);
    try {
      const created = await db.entities.Review.create({
        product_id: productId,
        rating,
        name: nameVal,
        comment: commentVal,
      });
      setReviews((prev) => prev.map((r) => (r.id === tempId ? created : r)));
      toast({ title: 'Ulasan terkirim. Terima kasih!' });
    } catch (err) {
      setReviews((prev) => prev.filter((r) => r.id !== tempId));
      toast({ title: 'Gagal mengirim ulasan', description: err?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="font-display font-bold text-lg text-foreground">Ulasan Pelanggan</h2>
      </div>
      <p className="text-[0.7em] text-muted-foreground/70 mb-4">Customer Reviews</p>

      <div className="flex items-center gap-3 mb-5 rounded-xl bg-secondary/60 p-4">
        <div className="text-center">
          <p className="font-display font-extrabold text-3xl text-foreground">{avg.toFixed(1)}</p>
          <Stars value={avg} />
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} ulasan</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Bagikan pengalaman Anda tentang kualitas sayuran dari produk ini.
          <span className="block text-[0.7em] text-muted-foreground/70 mt-0.5">Share your experience about this produce quality.</span>
        </div>
      </div>

      <Card className="p-5 rounded-xl mb-5">
        <h3 className="font-display font-semibold text-foreground mb-3">Tulis Ulasan</h3>
        <p className="text-[0.7em] text-muted-foreground/70 -mt-2 mb-3">Write a Review</p>
        {checkingEligibility ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="w-4 h-4 animate-spin" />Memeriksa riwayat pembelian…
          </div>
        ) : !currentUser ? (
          <div className="flex flex-col items-start gap-3 py-1">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-primary" />
              <span>Masuk untuk menulis ulasan. <span className="text-muted-foreground/70">Sign in to write a review.</span></span>
            </div>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/login">Masuk / Sign in</Link>
            </Button>
          </div>
        ) : !hasPurchased ? (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground py-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Hanya pelanggan yang telah membeli produk ini yang dapat menulis ulasan. <span className="block text-[0.7em] text-muted-foreground/70 mt-0.5">Only customers who have purchased this product can review it.</span></span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Rating:</span>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <Input
              placeholder="Nama Anda / Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
            <Textarea
              placeholder="Bagikan pendapat Anda tentang kualitas sayuran... / Share your opinion about the produce quality..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <Button type="submit" disabled={submitting} className="rounded-xl">
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Mengirim…</>
              ) : (
                <><Send className="w-4 h-4 mr-1.5" />Kirim Ulasan</>
              )}
            </Button>
          </form>
        )}
      </Card>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <p>Belum ada ulasan. Jadilah yang pertama!</p>
            <p className="text-[0.7em] text-muted-foreground/70">No reviews yet. Be the first!</p>
          </div>
        ) : (
          reviews.map((r) => (
            <Card key={r.id} className={`p-4 rounded-xl ${r._pending ? 'opacity-70' : ''}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {(r.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <p className="font-semibold text-foreground text-sm">{r.name}</p>
                    <p className="text-[0.7em] text-muted-foreground/70">
                      {formatShortDate(r.created_date)}{r._pending && <span className="ml-2 text-primary">· Mengirim…</span>}
                    </p>
                  </div>
                </div>
                <Stars value={r.rating} size={14} />
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-line">{r.comment}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}