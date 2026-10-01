const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, Lock, RefreshCw, Ticket, Save, X, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import PageHeader from '@/components/marketplace/PageHeader';

const EMPTY = { code: '', description: '', discount_percent: '', active: true };

export default function AdminVouchers() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.entities.Voucher.list('-created_date', 200);
      setVouchers(Array.isArray(data) ? data : data.items || []);
    } catch {
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    db.auth.me().then((u) => { setMe(u); if (u?.role !== 'admin') setDenied(true); }).catch(() => setDenied(true));
    fetchVouchers();
  }, [fetchVouchers]);

  const save = async () => {
    if (!editing.code.trim() || !editing.discount_percent) {
      toast({ description: 'Kode & diskon wajib / Code & discount required', variant: 'destructive' });
      return;
    }
    try {
      const payload = {
        code: editing.code.trim().toUpperCase(),
        description: editing.description.trim(),
        discount_percent: Number(editing.discount_percent) || 0,
        active: !!editing.active,
      };
      if (editing.id) {
        const updated = await db.entities.Voucher.update(editing.id, payload);
        setVouchers((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      } else {
        const created = await db.entities.Voucher.create(payload);
        setVouchers((prev) => [created, ...prev]);
      }
      setEditing(null);
      toast({ description: 'Voucher disimpan / Saved' });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  const remove = async (v) => {
    if (!confirm(`Hapus voucher ${v.code}? / Delete voucher ${v.code}?`)) return;
    try {
      await db.entities.Voucher.delete(v.id);
      setVouchers((prev) => prev.filter((x) => x.id !== v.id));
      toast({ description: 'Voucher dihapus / Deleted' });
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
      <PageHeader id="Manajemen Voucher" en="Voucher Management" />
      <main className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Kelola kode voucher diskon untuk pelanggan.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchVouchers} disabled={loading} className="rounded-full">
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />Segarkan
            </Button>
            <Button size="sm" onClick={() => setEditing({ ...EMPTY })} className="rounded-full">
              <Plus className="w-4 h-4 mr-1" />Tambah
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : vouchers.length === 0 ? (
          <Card className="p-10 text-center rounded-xl">
            <Ticket className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-display font-semibold">Belum ada voucher</p>
            <p className="text-sm text-muted-foreground/70">No vouchers yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {vouchers.map((v) => (
              <Card key={v.id} className="p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-foreground">{v.code}</p>
                    <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full ${v.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                      {v.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{v.description || 'Tanpa keterangan'}</p>
                </div>
                <span className="font-display font-extrabold text-primary">{v.discount_percent}%</span>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...v })}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(v)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing?.id ? 'Edit Voucher' : 'Tambah Voucher'}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Kode / Code</Label>
                <Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} placeholder="HEMAT10" className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label>Diskon (%) / Discount (%)</Label>
                <Input type="number" min="0" max="100" value={editing.discount_percent} onChange={(e) => setEditing({ ...editing, discount_percent: e.target.value })} placeholder="10" />
              </div>
              <div className="space-y-1.5">
                <Label>Keterangan / Description</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} placeholder="Diskon pembelian pertama" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 accent-[hsl(var(--primary))]" />
                <span>Aktif / Active</span>
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}><X className="w-4 h-4 mr-1" />Batal</Button>
            <Button onClick={save}><Save className="w-4 h-4 mr-1" />Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}