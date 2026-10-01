const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, BookOpen, Clock, ShoppingBag, Pencil, Plus, Trash2, Loader2, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Image } from '@/components/ui/image';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import BaliPattern from '@/components/marketplace/BaliPattern';
import BaliDoodle from '@/components/marketplace/BaliDoodle';
import PageHeader from '@/components/marketplace/PageHeader';
import { useToast } from '@/components/ui/use-toast';

const FARMER_HERO = 'https://media.db.com/images/public/6aa8ed0c5f6fc170701cd715/d0137bc90_generated_image.png';

const EMPTY_POST = {
  title_id: '', title_en: '', category: '', icon: '🌱',
  excerpt_id: '', excerpt_en: '', body_id: '', body_en: '',
  publish_date: new Date().toISOString().slice(0, 10), read_time: '3 mnt',
};

export default function Blog() {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(null); // post being edited or null

  useEffect(() => {
    db.entities.BlogPost.list('-publish_date', 100)
      .then((rows) => setPosts(Array.isArray(rows) ? rows : rows.items || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
    db.auth.me()
      .then((u) => setIsAdmin(u?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  const startEdit = (post) => setEditing({ ...post });
  const startAdd = () => setEditing({ ...EMPTY_POST });
  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing.title_id.trim() || !editing.category.trim()) {
      toast({ title: 'Judul & kategori wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      if (editing.id) {
        const updated = await db.entities.BlogPost.update(editing.id, {
          title_id: editing.title_id, title_en: editing.title_en, category: editing.category,
          icon: editing.icon, excerpt_id: editing.excerpt_id, excerpt_en: editing.excerpt_en,
          body_id: editing.body_id, body_en: editing.body_en,
          publish_date: editing.publish_date, read_time: editing.read_time,
        });
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast({ title: 'Posting diperbarui' });
      } else {
        const created = await db.entities.BlogPost.create({
          title_id: editing.title_id, title_en: editing.title_en, category: editing.category,
          icon: editing.icon, excerpt_id: editing.excerpt_id, excerpt_en: editing.excerpt_en,
          body_id: editing.body_id, body_en: editing.body_en,
          publish_date: editing.publish_date, read_time: editing.read_time,
        });
        setPosts((prev) => [created, ...prev]);
        toast({ title: 'Posting ditambahkan' });
      }
      setEditing(null);
    } catch (e) {
      toast({ title: 'Gagal menyimpan', description: e?.message, variant: 'destructive' });
    }
  };

  const removePost = async (id) => {
    if (!confirm('Hapus posting ini? / Delete this post?')) return;
    try {
      await db.entities.BlogPost.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Posting dihapus' });
    } catch (e) {
      toast({ title: 'Gagal menghapus', description: e?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Blog Tani" en="Farmers Blog" />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="relative rounded-2xl overflow-hidden h-44 sm:h-56">
          <Image src={FARMER_HERO} alt="Petani Kota Denpasar memetik sayur dan buah segar" className="w-full h-full" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent flex items-end p-5 sm:p-6">
            <BaliDoodle className="absolute top-3 right-3 text-primary-foreground/25 scale-[-1]" size={64} />
            <div className="flex items-center gap-2 text-primary-foreground">
              <BookOpen className="w-5 h-5 shrink-0" />
              <div className="leading-tight">
                <h2 className="font-display font-extrabold text-xl sm:text-2xl">Tips, Resep & Cerita Petani Denpasar</h2>
                <p className="text-[0.8em] opacity-85">Tips, Recipes & Farmer Stories</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <BaliPattern className="text-primary/20 flex-1" height={18} />
          {isAdmin && (
            <Button onClick={startAdd} size="sm" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" />Tambah Posting / Add Post
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="font-display font-semibold text-foreground">Belum ada posting</p>
            <p className="text-sm text-muted-foreground/70">No posts yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {posts.map((p, i) => {
              const isOpen = open === i;
              return (
                <Card key={p.id} className="rounded-xl overflow-hidden flex flex-col relative">
                  <div className="bg-secondary/50 h-28 flex items-center justify-center text-5xl">{p.icon || '🌱'}</div>
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="w-8 h-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        aria-label="edit"
                      >
                        <Pencil className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={() => removePost(p.id)}
                        className="w-8 h-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        aria-label="delete"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <span className="inline-block w-fit text-[0.65rem] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">{p.category}</span>
                    <p className="font-display font-semibold text-foreground mt-2 leading-tight">{p.title_id}</p>
                    <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{p.title_en}</p>
                    <p className="text-sm text-muted-foreground mt-2">{p.excerpt_id}</p>
                    <p className="text-[0.8em] text-muted-foreground/70">{p.excerpt_en}</p>
                    <div className="flex items-center gap-3 text-[0.7rem] text-muted-foreground/70 mt-2">
                      <span>{p.publish_date}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{p.read_time}</span>
                    </div>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                    >
                      {isOpen ? 'Tutup / Close' : 'Baca / Read'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{p.body_id}</p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Link to="/"><Button size="lg" className="rounded-full px-8"><ShoppingBag className="w-4 h-4 mr-1" />Belanja Sayur Segar / Shop Fresh</Button></Link>
        </div>
      </main>

      {/* Edit / Add dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && cancelEdit()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Posting / Edit Post' : 'Tambah Posting / Add Post'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <div className="space-y-1.5">
                  <Label>Ikon / Icon</Label>
                  <Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} maxLength={4} />
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori / Category</Label>
                  <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="e.g. Tips Memasak" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Judul (ID) / Title (ID)</Label>
                <Input value={editing.title_id} onChange={(e) => setEditing({ ...editing, title_id: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Title (EN)</Label>
                <Input value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Ringkasan (ID) / Excerpt (ID)</Label>
                <Textarea value={editing.excerpt_id} onChange={(e) => setEditing({ ...editing, excerpt_id: e.target.value })} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Excerpt (EN)</Label>
                <Textarea value={editing.excerpt_en} onChange={(e) => setEditing({ ...editing, excerpt_en: e.target.value })} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Isi (ID) / Body (ID)</Label>
                <Textarea value={editing.body_id} onChange={(e) => setEditing({ ...editing, body_id: e.target.value })} rows={5} />
              </div>
              <div className="space-y-1.5">
                <Label>Body (EN)</Label>
                <Textarea value={editing.body_en} onChange={(e) => setEditing({ ...editing, body_en: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tanggal / Date</Label>
                  <Input type="date" value={editing.publish_date?.slice?.(0, 10) || ''} onChange={(e) => setEditing({ ...editing, publish_date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Lama Baca / Read time</Label>
                  <Input value={editing.read_time} onChange={(e) => setEditing({ ...editing, read_time: e.target.value })} placeholder="e.g. 4 mnt" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}><X className="w-4 h-4 mr-1" />Batal</Button>
            <Button onClick={saveEdit}><Save className="w-4 h-4 mr-1" />Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}