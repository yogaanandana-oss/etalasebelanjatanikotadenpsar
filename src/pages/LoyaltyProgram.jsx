const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Ticket, Star, ShoppingBag, LogIn, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatIDR } from '@/lib/format';
import BaliPattern from '@/components/marketplace/BaliPattern';
import PageHeader from '@/components/marketplace/PageHeader';
import { shopConfig } from '@/lib/shopConfig';

export default function LoyaltyProgram() {
  const [account, setAccount] = useState(null);
  const [stats, setStats] = useState({ count: 0, total: 0 });

  useEffect(() => {
    db.auth
      .me()
      .then(async (u) => {
        setAccount(u);
        try {
          const prev = await db.entities.Order.filter({ created_by_id: u.id }, '-created_date', 200);
          const list = Array.isArray(prev) ? prev : prev.items || [];
          const completed = list.filter((o) => ['paid', 'processing', 'shipped', 'completed'].includes(o.status));
          setStats({
            count: completed.length,
            total: completed.reduce((s, o) => s + (Number(o.total) || 0), 0),
          });
        } catch { /* ignore */ }
      })
      .catch(() => setAccount(null));
  }, []);

  const minOrders = Number(shopConfig.voucherLoyaltyMinOrders || 0);
  const minTotal = Number(shopConfig.voucherLoyaltyMinTotal || 0);
  const loyaltyPct = Number(shopConfig.voucherLoyaltyPercent || 0);
  const firstPct = Number(shopConfig.voucherFirstTimePercent || 0);
  const progressOrders = Math.min(100, (stats.count / minOrders) * 100);
  const progressTotal = Math.min(100, (stats.total / minTotal) * 100);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Program Loyalitas" en="Loyalty Program" />
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <BaliPattern className="text-primary/20" height={18} />
        <div className="text-center space-y-1">
          <Award className="w-10 h-10 mx-auto text-accent" />
          <h1 className="font-display font-extrabold text-2xl text-foreground">Program Loyalitas EBT</h1>
          <p className="text-sm text-muted-foreground/70">EBT Loyalty Program</p>
        </div>

        {/* Account status */}
        <Card className="p-5 rounded-xl">
          {account ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-primary" />
                <p className="font-semibold text-foreground text-sm truncate">{account.email || account.full_name}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <ProgressBlock label="Pesanan selesai" en="Completed orders" value={`${stats.count} / ${minOrders}`} pct={progressOrders} />
                <ProgressBlock label="Total belanja" en="Total spend" value={`${formatIDR(stats.total)} / ${formatIDR(minTotal)}`} pct={progressTotal} />
              </div>
              {stats.count >= minOrders && stats.total >= minTotal ? (
                <p className="mt-3 text-sm font-semibold text-emerald-600">Voucher loyal {loyaltyPct}% aktif untuk Anda!</p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Terus belanja untuk membuka voucher loyal {loyaltyPct}%.</p>
              )}
            </>
          ) : (
            <div className="text-center space-y-2">
              <p className="font-display font-semibold text-foreground">Masuk untuk melihat progres loyalitas Anda</p>
              <p className="text-sm text-muted-foreground/70">Sign in to track your loyalty progress</p>
              <Button asChild className="rounded-full"><Link to="/login"><LogIn className="w-4 h-4 mr-1" />Masuk dengan Gmail</Link></Button>
            </div>
          )}
        </Card>

        {/* How it works */}
        <Card className="p-5 rounded-xl space-y-3">
          <h2 className="font-display font-bold text-foreground">Cara Kerja</h2>
          <p className="text-[0.7em] text-muted-foreground/70 -mt-2">How It Works</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Step n="1" id="Buat akun dengan Gmail" en="Sign up with Gmail" desc_id="Masuk lewat Google saat checkout." desc_en="Sign in with Google at checkout." />
            <Step n="2" id="Dapat voucher pertama" en="Get first voucher" desc_id={`Diskon ${firstPct}% otomatis di pesanan pertama.`} desc_en={`${firstPct}% off on your first order.`} />
            <Step n="3" id="Buka voucher loyal" en="Unlock loyalty" desc_id={`Belanja ${minOrders}× dan total ${formatIDR(minTotal)} untuk ${loyaltyPct}%.`} desc_en={`Shop ${minOrders}× and spend ${formatIDR(minTotal)} to unlock ${loyaltyPct}%.`} />
          </div>
        </Card>

        {/* Rewards */}
        <Card className="p-5 rounded-xl space-y-3">
          <h2 className="font-display font-bold text-foreground">Hadiah</h2>
          <p className="text-[0.7em] text-muted-foreground/70 -mt-2">Rewards</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Reward icon={Ticket} title="Voucher Pembelian Pertama" en="First-Time Voucher" desc={`Diskon ${firstPct}% otomatis saat checkout pertama.`} />
            <Reward icon={Award} title="Voucher Loyal" en="Loyalty Voucher" desc={`Diskon ${loyaltyPct}% setelah syarat terpenuhi.`} />
          </div>
        </Card>

        <div className="text-center">
          <Button asChild size="lg" className="rounded-full px-8"><Link to="/"><ShoppingBag className="w-4 h-4 mr-1" />Belanja Sekarang / Shop Now</Link></Button>
        </div>
      </main>
    </div>
  );
}

function ProgressBlock({ label, en, value, pct }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <p className="text-[0.7em] text-muted-foreground/70">{en}</p>
      <div className="h-2 rounded-full bg-secondary mt-1.5 overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Step({ n, id, en, desc_id, desc_en }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-1.5">{n}</span>
      <p className="font-semibold text-sm text-foreground leading-tight">{id}</p>
      <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{en}</p>
      <p className="text-xs text-muted-foreground mt-1">{desc_id}</p>
      <p className="text-[0.7em] text-muted-foreground/70">{desc_en}</p>
    </div>
  );
}

function Reward({ icon: Icon, title, en, desc }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
      <span className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-accent" /></span>
      <div className="leading-tight">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-[0.7em] text-muted-foreground/70">{en}</p>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </div>
    </div>
  );
}