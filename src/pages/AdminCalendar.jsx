const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Sprout, Truck,
  Package, Loader2, Lock, Leaf, Pencil, Plus, X, Save, MapPin, Droplets,
} from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, addMonths, parseISO, isAfter, isBefore, differenceInCalendarDays,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Bi } from '@/components/ui/Bi';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import BaliPattern from '@/components/marketplace/BaliPattern';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const EVENT_META = {
  harvest: { icon: Sprout, label: 'Panen', en: 'Harvest', dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700', ring: 'text-emerald-600' },
  restock: { icon: Truck, label: 'Restock', en: 'Restock', dot: 'bg-accent', chip: 'bg-accent/15 text-accent-foreground', ring: 'text-accent' },
};

export default function AdminCalendar() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [editEvent, setEditEvent] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addProduct, setAddProduct] = useState('');
  const [addType, setAddType] = useState('harvest');
  const [addDate, setAddDate] = useState('');
  const [editSubak, setEditSubak] = useState('');

  const refreshProducts = async () => {
    const d = await db.entities.Product.list('-created_date', 500);
    setProducts(Array.isArray(d) ? d : d.items || []);
  };

  const openEdit = (e) => {
    const d = e.type === 'harvest' ? e.product.harvest_date : e.product.restock_date;
    setEditEvent(e);
    setEditDate(d ? d.slice(0, 10) : '');
    setEditSubak(e.product.subak || '');
  };

  const saveEdit = async () => {
    if (!editEvent || !editDate) return;
    setSaving(true);
    try {
      const field = editEvent.type === 'harvest' ? 'harvest_date' : 'restock_date';
      const payload = { [field]: editDate };
      if ((editEvent.product.subak || '') !== editSubak.trim()) payload.subak = editSubak.trim();
      await db.entities.Product.update(editEvent.product.id, payload);
      await refreshProducts();
      setEditEvent(null);
      toast({ description: 'Jadwal diperbarui / Schedule updated' });
    } catch (err) {
      toast({ description: 'Gagal menyimpan / Failed: ' + (err?.message || ''), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setAddDate(format(selected, 'yyyy-MM-dd'));
    setAddType('harvest');
    setAddProduct(products[0]?.id || '');
    setAddOpen(true);
  };

  const saveAdd = async () => {
    if (!addProduct || !addDate) return;
    setSaving(true);
    try {
      const field = addType === 'harvest' ? 'harvest_date' : 'restock_date';
      await db.entities.Product.update(addProduct, { [field]: addDate });
      await refreshProducts();
      setAddOpen(false);
      toast({ description: 'Jadwal ditambahkan / Schedule added' });
    } catch (err) {
      toast({ description: 'Gagal menyimpan / Failed: ' + (err?.message || ''), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    db.auth.me().then(setMe).catch(() => setMe(null));
    db.entities.Product.list('-created_date', 500)
      .then((d) => setProducts(Array.isArray(d) ? d : d.items || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (me && me.role !== 'admin') setDenied(true);
  }, [me]);

  const events = useMemo(() => {
    const map = {};
    const push = (key, ev) => { (map[key] ||= []).push(ev); };
    products.forEach((p) => {
      if (p.harvest_date) push(p.harvest_date.slice(0, 10), { type: 'harvest', product: p });
      if (p.restock_date) push(p.restock_date.slice(0, 10), { type: 'restock', product: p });
    });
    return map;
  }, [products]);

  const days = useMemo(() => {
    const gs = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const ge = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gs, end: ge });
  }, [cursor]);

  const upcoming = useMemo(() => {
    const today = new Date();
    const list = [];
    Object.entries(events).forEach(([key, evs]) => {
      const d = parseISO(key);
      if (!isBefore(d, today) || isSameDay(d, today)) {
        evs.forEach((e) => list.push({ date: d, ...e }));
      }
    });
    list.sort((a, b) => a.date - b.date);
    return list.slice(0, 8);
  }, [events]);

  const monthCount = useMemo(() => {
    const inMonth = days.filter((d) => isSameMonth(d, cursor));
    const harvest = inMonth.reduce((s, d) => s + (events[format(d, 'yyyy-MM-dd')]?.filter((e) => e.type === 'harvest').length || 0), 0);
    const restock = inMonth.reduce((s, d) => s + (events[format(d, 'yyyy-MM-dd')]?.filter((e) => e.type === 'restock').length || 0), 0);
    return { harvest, restock };
  }, [days, events, cursor]);

  if (denied) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-destructive" />
        </div>
        <p className="font-display font-semibold text-foreground">Akses ditolak</p>
        <p className="text-sm text-muted-foreground/70">Access denied</p>
        <Button asChild variant="outline" className="rounded-full mt-2">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-1.5" />Kembali / Back</Link>
        </Button>
      </div>
    );
  }

  const selectedKey = format(selected, 'yyyy-MM-dd');
  const selectedEvents = events[selectedKey] || [];

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link to="/admin/products"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div className="leading-tight">
            <h1 className="font-display font-extrabold text-lg text-foreground">Kalender Panen & Restock</h1>
            <p className="text-[0.7em] text-muted-foreground/70">Harvest & Restock Calendar</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/admin/products"><Package className="w-4 h-4 mr-1.5" />Produk</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <BaliPattern className="text-primary/20" height={18} />

        {/* Legend + month stats */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
            <Sprout className="w-4 h-4" />Panen · {monthCount.harvest}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent-foreground font-semibold">
            <Truck className="w-4 h-4" />Restock · {monthCount.restock}
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Calendar */}
          <Card className="p-4 lg:p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCursor((c) => addMonths(c, -1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-display font-bold text-foreground capitalize">
                  {format(cursor, 'MMMM yyyy', { locale: idLocale })}
                </p>
                <Button variant="link" size="sm" className="h-6 p-0 text-xs" onClick={() => { const t = new Date(); setCursor(startOfMonth(t)); setSelected(t); }}>
                  Hari ini / Today
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCursor((c) => addMonths(c, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-[0.7rem] font-semibold text-muted-foreground/70 py-1">{w}</div>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {days.map((d) => {
                  const key = format(d, 'yyyy-MM-dd');
                  const evs = events[key] || [];
                  const inMonth = isSameMonth(d, cursor);
                  const isToday = isSameDay(d, new Date());
                  const isSelected = isSameDay(d, selected);
                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(d)}
                      className={`relative min-h-[58px] sm:min-h-[72px] rounded-lg border p-1.5 text-left transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'
                      } ${!inMonth ? 'opacity-40' : ''}`}
                    >
                      <span className={`text-xs font-semibold ${isToday ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground' : 'text-foreground'}`}>
                        {format(d, 'd')}
                      </span>
                      <div className="mt-1 flex flex-col gap-0.5">
                        {evs.slice(0, 3).map((e, i) => {
                          const meta = EVENT_META[e.type];
                          return (
                            <span key={i} className={`truncate text-[0.6rem] px-1 rounded ${meta.chip} font-medium leading-tight`} title={`${meta.label}: ${e.product.name_id || e.product.name}`}>
                              {meta.label} {e.product.name_id || e.product.name}
                            </span>
                          );
                        })}
                        {evs.length > 3 && <span className="text-[0.6rem] text-muted-foreground">+{evs.length - 3}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Side panel: selected day + upcoming */}
          <div className="space-y-4">
            <Card className="p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-4 h-4 text-primary" />
                <p className="font-display font-semibold text-foreground capitalize">{format(selected, 'EEEE, d MMM yyyy', { locale: idLocale })}</p>
              </div>
              <p className="text-[0.7em] text-muted-foreground/70 mb-3">Selected date</p>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3 text-center">Tidak ada jadwal. / No schedules.</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((e, i) => {
                    const meta = EVENT_META[e.type];
                    const Icon = meta.icon;
                    return (
                      <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-2.5">
                        <span className={`w-8 h-8 rounded-lg ${meta.chip} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-foreground leading-tight">{e.product.name_id || e.product.name}</p>
                          <p className="text-xs text-muted-foreground">{meta.label} · {meta.en}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {e.product.subak && (
                              <span className="inline-flex items-center gap-0.5 text-[0.65rem] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">
                                <Droplets className="w-3 h-3" />{e.product.subak}
                              </span>
                            )}
                            {e.product.farmer_location && (
                              <span className="inline-flex items-center gap-0.5 text-[0.65rem] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                                <MapPin className="w-3 h-3" />{e.product.farmer_location}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(e)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={openAdd}>
                <Plus className="w-4 h-4 mr-1.5" />Tambah Jadwal / Add Schedule
              </Button>
            </Card>

            <Card className="p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-4 h-4 text-primary" />
                <p className="font-display font-semibold text-foreground">Jadwal Mendatang</p>
              </div>
              <p className="text-[0.7em] text-muted-foreground/70 -mt-2 mb-3">Upcoming schedules</p>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3 text-center">Belum ada jadwal. / None.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {upcoming.map((e, i) => {
                    const meta = EVENT_META[e.type];
                    const Icon = meta.icon;
                    const diff = differenceInCalendarDays(e.date, new Date());
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg ${meta.chip} flex items-center justify-center shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">{e.product.name_id || e.product.name}</p>
                          <p className="text-[0.7em] text-muted-foreground/70 capitalize">{meta.label} · {format(e.date, 'd MMM', { locale: idLocale })}</p>
                          {(e.product.subak || e.product.farmer_location) && (
                            <p className="text-[0.65rem] text-muted-foreground/70 truncate">
                              {e.product.subak ? `${e.product.subak} · ` : ''}{e.product.farmer_location || ''}
                            </p>
                          )}
                        </div>
                        <span className="text-[0.65rem] font-semibold text-muted-foreground shrink-0">
                          {diff === 0 ? 'Hari ini' : diff === 1 ? 'Besok' : `${diff} hari`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Edit schedule dialog */}
      <Dialog open={!!editEvent} onOpenChange={(v) => !v && setEditEvent(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Ubah Jadwal / Edit Schedule</DialogTitle>
          </DialogHeader>
          {editEvent && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {EVENT_META[editEvent.type].label} · {editEvent.product.name_id || editEvent.product.name}
              </p>
              <div className="space-y-1.5">
                <Label>Tanggal / Date</Label>
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Subak</Label>
                <Input value={editSubak} onChange={(e) => setEditSubak(e.target.value)} placeholder="cth. Subak Sembung" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEvent(null)} disabled={saving}>Batal</Button>
            <Button onClick={saveEdit} disabled={saving || !editDate}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add schedule dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Jadwal / Add Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Produk / Product</Label>
              <Select value={addProduct} onValueChange={setAddProduct}>
                <SelectTrigger><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name_id || p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Jenis / Type</Label>
              <Select value={addType} onValueChange={setAddType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="harvest">Panen / Harvest</SelectItem>
                  <SelectItem value="restock">Restock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal / Date</Label>
              <Input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>Batal</Button>
            <Button onClick={saveAdd} disabled={saving || !addProduct || !addDate}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}