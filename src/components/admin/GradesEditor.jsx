import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

const EMPTY_ROW = { label: '', label_en: '', weight_kg: '', price: '' };

// Editor untuk daftar grade produk (mis. kecil/sedang/besar).
// Berat boleh dikosongkan dan bisa diedit kapan saja oleh admin.
export default function GradesEditor({ grades, onChange, weightPriced = false }) {
  const rows = Array.isArray(grades) ? grades : [];

  const set = (i, field, value) => {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };
  const add = () => onChange([...rows, { ...EMPTY_ROW }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <Label>
        Pilihan Ukuran
        <span className="text-muted-foreground/70 font-normal text-xs"> · Size options (mis. kecil/sedang/besar). Berat boleh dikosongkan & diedit nanti.</span>
      </Label>
      <div className="space-y-2">
        {rows.map((g, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <Input
              className="col-span-4 h-9 bg-card"
              placeholder="Ukuran (mis. Kecil)"
              value={g.label || ''}
              onChange={(e) => set(i, 'label', e.target.value)}
            />
            <Input
              className="col-span-3 h-9 bg-card"
              placeholder="English (Small)"
              value={g.label_en || ''}
              onChange={(e) => set(i, 'label_en', e.target.value)}
            />
            <Input
              className="col-span-2 h-9 bg-card"
              type="number"
              min="0"
              step="0.1"
              placeholder="Berat (kg)"
              value={g.weight_kg ?? ''}
              onChange={(e) => set(i, 'weight_kg', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              className="col-span-2 h-9 bg-card"
              type="number"
              min="0"
              step="500"
              placeholder={weightPriced ? 'Harga/kg' : 'Harga'}
              value={g.price ?? ''}
              onChange={(e) => set(i, 'price', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="col-span-1 h-9 flex items-center justify-center text-muted-foreground hover:text-destructive"
              aria-label="Hapus grade"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={add} className="rounded-full h-8">
        <Plus className="w-3.5 h-3.5 mr-1" />Tambah Ukuran / Add size
      </Button>
    </div>
  );
}