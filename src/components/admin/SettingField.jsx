const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bi } from '@/components/ui/Bi';
import { useToast } from '@/components/ui/use-toast';

export default function SettingField({
  settingKey,
  icon: Icon,
  title,
  titleEn,
  description,
  descriptionEn,
  label,
  placeholder,
  multiline,
  value,
  recordId,
  onSaved,
}) {
  const { toast } = useToast();
  const [val, setVal] = useState(value ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVal(value ?? '');
  }, [value]);

  const save = async () => {
    setSaving(true);
    try {
      if (recordId) {
        await db.entities.Setting.update(recordId, { value: val });
      } else {
        const created = await db.entities.Setting.create({ key: settingKey, value: val });
        onSaved?.(settingKey, created.id);
      }
      toast({ title: `${title} tersimpan / saved` });
    } catch {
      toast({ title: 'Gagal menyimpan / Failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-primary">
        {Icon && <Icon className="w-5 h-5" />}
        <div className="leading-tight">
          <h2 className="font-display font-semibold text-foreground">{title}</h2>
          {titleEn && <p className="text-[0.7em] text-muted-foreground/70">{titleEn}</p>}
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
          {descriptionEn && <span className="block text-[0.7em] text-muted-foreground/70">{descriptionEn}</span>}
        </p>
      )}
      <div className="space-y-1.5">
        {label && <Label>{label}</Label>}
        {multiline ? (
          <Textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="bg-card"
          />
        ) : (
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            className="h-11 bg-card"
          />
        )}
      </div>
      <Button onClick={save} disabled={saving} className="w-full h-11">
        {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
        <Bi id="Simpan" en="Save" />
      </Button>
    </Card>
  );
}