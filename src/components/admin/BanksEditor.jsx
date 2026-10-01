const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Landmark } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bi } from '@/components/ui/Bi';
import { useToast } from '@/components/ui/use-toast';

const DEFAULT_BANKS = [
  { code: 'bca', name: 'Bank BCA', accountNumber: '', accountName: '' },
  { code: 'bni', name: 'Bank BNI', accountNumber: '', accountName: '' },
  { code: 'bri', name: 'Bank BRI', accountNumber: '', accountName: '' },
  { code: 'mandiri', name: 'Bank Mandiri', accountNumber: '', accountName: '' },
];

export default function BanksEditor({ value, recordId, onSaved }) {
  const { toast } = useToast();
  const [banks, setBanks] = useState(DEFAULT_BANKS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) setBanks(parsed);
      } catch {
        /* ignore */
      }
    }
  }, [value]);

  const update = (i, field, v) => {
    setBanks((prev) => prev.map((b, idx) => (idx === i ? { ...b, [field]: v } : b)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const val = JSON.stringify(banks);
      if (recordId) {
        await db.entities.Setting.update(recordId, { value: val });
      } else {
        const created = await db.entities.Setting.create({ key: 'banks', value: val });
        onSaved?.('banks', created.id);
      }
      toast({ title: 'Rekening bank tersimpan / Banks saved' });
    } catch {
      toast({ title: 'Gagal menyimpan / Failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Landmark className="w-5 h-5" />
        <div className="leading-tight">
          <h2 className="font-display font-semibold text-foreground">Rekening Bank</h2>
          <p className="text-[0.7em] text-muted-foreground/70">Bank Accounts (Virtual Account Transfer)</p>
        </div>
      </div>
      <div className="space-y-3">
        {banks.map((b, i) => (
          <div key={b.code} className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
            <Label className="text-xs font-semibold">{b.name}</Label>
            <Input
              value={b.accountNumber}
              onChange={(e) => update(i, 'accountNumber', e.target.value)}
              placeholder="No. Rekening / Account No."
              className="h-10 bg-card"
            />
            <Input
              value={b.accountName}
              onChange={(e) => update(i, 'accountName', e.target.value)}
              placeholder="Atas Nama / Account Name"
              className="h-10 bg-card"
            />
          </div>
        ))}
      </div>
      <Button onClick={save} disabled={saving} className="w-full h-11">
        {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
        <Bi id="Simpan" en="Save" />
      </Button>
    </Card>
  );
}