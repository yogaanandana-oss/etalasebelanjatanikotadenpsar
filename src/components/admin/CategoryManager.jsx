const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCategories } from '@/lib/categoriesContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

const EMPTY = { key: '', label_id: '', label_en: '', icon: '', sort_order: '' };

export default function CategoryManager() {
  const { toast } = useToast();
  const { categories, refresh } = useCategories();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!editing.label_id.trim() || !editing.key.trim()) {
      toast({ description: 'Kode & nama wajib / Key & name required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        key: editing.key.trim(),
        label_id: editing.label_id.trim(),
        label_en: (editing.label_en || '').trim() || editing.label_id.trim(),
        icon: (editing.icon || '').trim() || '🌱',
        sort_order: Number(editing.sort_order) || 0,
      };
      if (editing.id) {
        await db.entities.Category.update(editing.id, payload);
      } else {
        await db.entities.Category.create(payload);
      }
      await refresh();
      setEditing(null);
      toast({ description: 'Kategori disimpan / Saved' });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Hapus kategori ${c.label_id}? / Delete category?`)) return;
    try {
      await db.entities.Category.delete(c.id);
      await refresh();
      toast({ description: 'Kategori dihapus / Deleted' });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  return (
    <Card className="rounded-xl border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          <div className="leading-tight">
            <h2 className="font-display font-bold text-foreground">Kelola Kategori</h2>
            <p className="text-[0.7em] text-muted-foreground/70">Manage Categories</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setEditing({ ...EMPTY })} className="rounded-full">
          <Plus className="w-4 h-4 mr-1" />Tambah
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <div key={c.id || c.key} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card pl-2.5 pr-1 py-1">
            <span className="text-base leading-none">{c.icon || '🌱'}</span>
            <span className="text-sm font-medium text-foreground">{c.label_id}</span>
            <button onClick={() => setEditing({ ...c })} className="w-6 h-6 rounded-full hover:bg-secondary flex items-center justify-center">
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </button>
            <button onClick={() => remove(c)} className="w-6 h-6 rounded-full hover:bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-3 h-3 text-destructive" />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Kode / Key</Label>
                <Input value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} placeholder="Jamu" disabled={!!editing.id} />
              </div>
              <div className="space-y-1.5">
                <Label>Nama (ID)</Label>
                <Input value={editing.label_id} onChange={(e) => setEditing({ ...editing, label_id: e.target.value })} placeholder="Jamu" />
              </div>
              <div className="space-y-1.5">
                <Label>Nama (EN)</Label>
                <Input value={editing.label_en} onChange={(e) => setEditing({ ...editing, label_en: e.target.value })} placeholder="Herbal Tonic" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Ikon (emoji)</Label>
                  <Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="🍵" />
                </div>
                <div className="space-y-1.5">
                  <Label>Urutan</Label>
                  <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} placeholder="5" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}><X className="w-4 h-4 mr-1" />Batal</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}