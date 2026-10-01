const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Loader2, ImagePlus, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const LOCATIONS = ['Denpasar Utara', 'Denpasar Timur', 'Denpasar Selatan', 'Denpasar Barat'];

const EMPTY = {
  name: '', location: 'Denpasar Utara', story_id: '', story_en: '',
  image_url: '', specialties_id: '', specialties_en: '', years_farming: '',
};

export default function FarmerEditor({ open, farmer, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEdit = Boolean(farmer?.id);

  useEffect(() => {
    if (open) {
      setForm(farmer ? { ...EMPTY, ...farmer, years_farming: farmer.years_farming ?? '' } : EMPTY);
    }
  }, [open, farmer]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      set('image_url', file_url);
      toast({ description: 'Gambar diunggah / Image uploaded' });
    } catch {
      toast({ description: 'Gagal mengunggah / Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.story_id.trim()) {
      toast({ description: 'Lengkapi nama & cerita / Complete name & story', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location,
        story_id: form.story_id.trim(),
        story_en: form.story_en.trim(),
        image_url: form.image_url,
        specialties_id: form.specialties_id,
        specialties_en: form.specialties_en,
        years_farming: form.years_farming === '' ? null : Number(form.years_farming),
      };
      if (isEdit) {
        await db.entities.Farmer.update(farmer.id, payload);
        toast({ description: 'Petani diperbarui / Farmer updated' });
      } else {
        await db.entities.Farmer.create(payload);
        toast({ description: 'Petani ditambahkan / Farmer added' });
      }
      onSaved?.();
      onClose?.();
    } catch {
      toast({ description: 'Gagal menyimpan / Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Petani' : 'Tambah Petani'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Edit farmer partner' : 'Add a new farmer partner'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Nama Petani</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nama petani" />
            </div>
            <div className="space-y-1">
              <Label>Kecamatan</Label>
              <Select value={form.location} onValueChange={(v) => set('location', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Cerita (Indonesia)</Label>
            <Textarea value={form.story_id} onChange={(e) => set('story_id', e.target.value)} rows={3} />
          </div>
          <div className="space-y-1">
            <Label>Story (English)</Label>
            <Textarea value={form.story_en} onChange={(e) => set('story_en', e.target.value)} rows={3} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Komoditas (ID)</Label>
              <Input value={form.specialties_id} onChange={(e) => set('specialties_id', e.target.value)} placeholder="Sayur, cabai, …" />
            </div>
            <div className="space-y-1">
              <Label>Specialties (EN)</Label>
              <Input value={form.specialties_en} onChange={(e) => set('specialties_en', e.target.value)} placeholder="Veggies, chili, …" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Lama Bertani (tahun)</Label>
            <Input type="number" min="0" value={form.years_farming} onChange={(e) => set('years_farming', e.target.value)} placeholder="cth. 15" />
          </div>

          <div className="space-y-1">
            <Label>Foto Petani</Label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-sm px-3 py-2 rounded-md border border-input hover:bg-accent">
                <ImagePlus className="w-4 h-4" />
                {uploading ? 'Mengunggah…' : 'Unggah'}
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
              </label>
              {form.image_url && <span className="text-xs text-muted-foreground">Gambar dipilih</span>}
            </div>
            {form.image_url && (
              <img src={form.image_url} alt="preview" className="mt-2 w-24 h-24 rounded-lg object-cover" />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
              {isEdit ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}