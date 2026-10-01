const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, MapPin, Sprout, Award, Pencil, Plus, Trash2, Leaf, Package, Sunrise, Droplets, Quote } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { useToast } from '@/components/ui/use-toast';
import BaliPattern from '@/components/marketplace/BaliPattern';
import BaliDoodle from '@/components/marketplace/BaliDoodle';
import PageHeader from '@/components/marketplace/PageHeader';
import FarmerEditor from '@/components/admin/FarmerEditor';

const DISTRICTS = ['Denpasar Utara', 'Denpasar Timur', 'Denpasar Selatan', 'Denpasar Barat'];

const SAWAH_IMG = 'https://media.db.com/images/public/6aa8ed0c5f6fc170701cd715/16f8275f1_generated_image.png';
const KEBUN_IMG = 'https://media.db.com/images/public/6aa8ed0c5f6fc170701cd715/177715951_generated_image.png';

export default function FarmerPartners() {
  const { toast } = useToast();
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const isAdmin = me?.role === 'admin';

  const fetchFarmers = useCallback(() => {
    setLoading(true);
    Promise.all([
      db.entities.Farmer.list('-created_date', 100),
      db.entities.Product.list('-created_date', 500),
    ])
      .then(([d, p]) => {
        setFarmers(Array.isArray(d) ? d : d.items || []);
        setProducts(Array.isArray(p) ? p : p.items || []);
      })
      .catch(() => {
        setFarmers([]);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    db.auth.me().then(setMe).catch(() => setMe(null));
    fetchFarmers();
  }, [fetchFarmers]);

  const visibleProducts = useMemo(
    () => products.filter((p) => !p.hidden),
    [products]
  );

  const groups = useMemo(() => {
    return DISTRICTS.map((loc, i) => {
      const items = visibleProducts.filter((p) => p.farmer_location === loc);
      const organic = items.filter((p) => p.is_organic).length;
      const cats = [...new Set(items.map((p) => p.category))];
      const sample = items.slice(0, 6).map((p) => p.name_id || p.name);
      return { loc, total: items.length, organic, cats, sample, chapter: i + 1 };
    });
  }, [visibleProducts]);

  const openAdd = () => { setEditing(null); setShowEditor(true); };
  const openEdit = (f) => { setEditing(f); setShowEditor(true); };

  const onDelete = async (f) => {
    if (!confirm(`Hapus petani "${f.name}"? / Delete farmer "${f.name}"?`)) return;
    try {
      await db.entities.Farmer.delete(f.id);
      toast({ description: 'Petani dihapus / Farmer deleted' });
      fetchFarmers();
    } catch {
      toast({ description: 'Gagal menghapus / Delete failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-16">
      <PageHeader id="Mitra Petani" en="Farmer Partners" />

      {/* Hero naratif — panorama sawah */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={SAWAH_IMG} alt="Sawah Bali saat fajar" className="w-full h-full" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-background" />
        </div>
        <BaliDoodle className="absolute -top-3 -left-3 text-white/25 z-10" size={96} />
        <BaliDoodle className="absolute -bottom-3 -right-3 text-white/25 scale-[-1] z-10" size={96} />
        <div className="max-w-3xl mx-auto px-4 lg:px-6 py-20 lg:py-28 text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-white/90 text-xs font-semibold uppercase tracking-[0.25em] mb-6">
            <Sunrise className="w-4 h-4" />
            <span>Kisah Petani Denpasar</span>
            <Sunrise className="w-4 h-4" />
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-6xl text-white leading-[1.05] drop-shadow-lg">
            Dari Subak ke Meja Anda
          </h1>
          <p className="text-lg lg:text-xl text-white/80 mt-3 font-display drop-shadow">From Subak to Your Table</p>
          <BaliPattern className="text-white/40 mt-7 mx-auto max-w-xs" height={16} />
          <p className="max-w-2xl mx-auto text-sm lg:text-base text-white/90 mt-6 leading-relaxed drop-shadow">
            Sebelum matahari benar-benar tinggi, sawah-sawah di empat kecamatan Kota Denpasar sudah ramai.
            Tangan-tangan petani memetik sayur, memilih yang terbaik, lalu membawanya segar — bukan dalam seminggu,
            tetapi pagi itu juga. Inilah kisah di balik setiap ikat kangkung, setiap buah tomat, setiap butih padi
            yang sampai ke dapur Anda.
          </p>
          <p className="max-w-2xl mx-auto text-[0.8em] text-white/60 mt-3 italic drop-shadow">
            Before the sun climbs high, the fields across four districts of Denpasar are already alive —
            hands picking, choosing, carrying it all fresh to your kitchen the very same morning.
          </p>
          {isAdmin && (
            <div className="mt-8">
              <Button size="sm" onClick={openAdd} className="rounded-full bg-white text-primary hover:bg-white/90">
                <Plus className="w-4 h-4 mr-1" />Tambah Petani / Add Farmer
              </Button>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-10 space-y-14">
        {/* Narasi pembuka */}
        <section className="max-w-2xl mx-auto text-center space-y-4">
          <Quote className="w-6 h-6 text-primary/40 mx-auto" />
          <p className="font-display text-lg lg:text-xl text-foreground leading-relaxed">
            “Bertani bukan sekadar pekerjaan — itu cara kami menjaga tanah yang diwariskan turun-temurun.
            Setiap panen adalah percakapan antara kami, air subak, dan musim.”
          </p>
          <p className="text-sm text-muted-foreground/70">
            <span className="font-semibold text-foreground">Petani Mitra EBT</span> · Kota Denpasar
          </p>
        </section>

        <BaliPattern className="text-primary/20" height={18} />

        {/* Bab per kecamatan */}
        <section className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="font-display font-extrabold text-2xl text-foreground">Empat Babak, Empat Kecamatan</h2>
            <p className="text-[0.8em] text-muted-foreground/70">Four Chapters, Four Districts</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-8">
              {groups.map((g) => (
                <div key={g.loc} className="relative pl-16 lg:pl-24">
                  <div className="absolute left-0 top-0 flex flex-col items-center">
                    <span className="font-display font-extrabold text-4xl lg:text-5xl text-primary/30 leading-none">
                      {String(g.chapter).padStart(2, '0')}
                    </span>
                    <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-muted-foreground/60 mt-1">Bab</span>
                  </div>
                  <div className="border-l-2 border-primary/20 pl-6 lg:pl-8">
                    <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />{g.loc}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                      Di kecamatan ini, <span className="font-semibold text-foreground">{g.total} jenis komoditas</span> dipanen
                      oleh kelompok tani mitra — di antaranya <span className="font-semibold text-emerald-600">{g.organic} komoditas organik</span> yang
                      tumbuh tanpa bahan kimia, tersebar di {g.cats.length} kategori.
                    </p>

                    <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
                      <div className="rounded-lg bg-secondary/60 p-3 text-center">
                        <Package className="w-4 h-4 text-primary mx-auto" />
                        <p className="font-display font-bold text-foreground mt-1">{g.total}</p>
                        <p className="text-[0.6rem] text-muted-foreground">Komoditas</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 text-center">
                        <Leaf className="w-4 h-4 text-emerald-600 mx-auto" />
                        <p className="font-display font-bold text-foreground mt-1">{g.organic}</p>
                        <p className="text-[0.6rem] text-muted-foreground">Organik</p>
                      </div>
                      <div className="rounded-lg bg-secondary/60 p-3 text-center">
                        <Sprout className="w-4 h-4 text-primary mx-auto" />
                        <p className="font-display font-bold text-foreground mt-1">{g.cats.length}</p>
                        <p className="text-[0.6rem] text-muted-foreground">Kategori</p>
                      </div>
                    </div>

                    {g.sample.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Yang dipanen di sini · Harvested here</p>
                        <div className="flex flex-wrap gap-1.5">
                          {g.sample.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Selingan panorama kebun sayur */}
        <section className="relative h-56 lg:h-72 rounded-3xl overflow-hidden shadow-xl">
          <Image src={KEBUN_IMG} alt="Kebun sayur di Bali" className="w-full h-full" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-center px-8 lg:px-14 max-w-xl">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Dari Kebun ke Dapur</p>
            <p className="font-display font-extrabold text-2xl lg:text-3xl text-white leading-tight drop-shadow">
              Setiap petak kebun adalah janji kesegaran.
            </p>
            <p className="text-sm text-white/75 mt-2 drop-shadow">
              Dirawat tangan petani, dipanen di pagi hari, sampai ke Anda tanpa menunggu lama.
            </p>
          </div>
        </section>

        {/* Profil petani */}
        <section className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="font-display font-extrabold text-2xl text-foreground">Wajah-wajah di Balik Panen</h2>
            <p className="text-[0.8em] text-muted-foreground/70">The Faces Behind Every Harvest</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
          ) : farmers.length === 0 ? (
            <p className="text-sm text-muted-foreground/70 text-center py-8">
              Belum ada profil petani. / No farmer profiles yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {farmers.map((f) => (
                <Card key={f.id} className="rounded-2xl overflow-hidden flex flex-col shadow-lg">
                  <div className="h-48 bg-secondary relative">
                    {f.image_url ? (
                      <Image src={f.image_url} alt={f.name} className="w-full h-full" fittingType="fill" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-secondary">
                        <Sprout className="w-14 h-14 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-card/90 text-foreground backdrop-blur">
                      <MapPin className="w-3 h-3 text-primary" />{f.location}
                    </span>
                    {f.years_farming != null && (
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[0.65rem] font-semibold text-white px-2.5 py-1 rounded-full bg-primary/80">
                        <Award className="w-3 h-3" />{f.years_farming} tahun bertani
                      </span>
                    )}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <button
                          onClick={() => openEdit(f)}
                          className="w-7 h-7 rounded-full bg-card/90 hover:bg-card text-foreground flex items-center justify-center shadow"
                          title="Edit petani"
                        >
                          <Pencil className="w-3.5 h-3.5 text-primary" />
                        </button>
                        <button
                          onClick={() => onDelete(f)}
                          className="w-7 h-7 rounded-full bg-card/90 hover:bg-card text-foreground flex items-center justify-center shadow"
                          title="Hapus petani"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground">{f.name}</h3>
                    <Quote className="w-4 h-4 text-primary/30 mt-2 mb-1" />
                    <p className="text-sm text-foreground/90 leading-relaxed italic">{f.story_id}</p>
                    {f.story_en && (
                      <p className="text-[0.8em] text-muted-foreground/70 mt-2 italic">{f.story_en}</p>
                    )}
                    {f.specialties_id && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground/70 mb-2 flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-primary" />Komoditas unggulan · Specialties
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {f.specialties_id.split(',').map((s, i) => (
                            <span key={i} className="text-[0.65rem] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{s.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Penutup */}
        <section className="text-center pt-4">
          <BaliPattern className="text-primary/20 mx-auto max-w-xs" height={16} />
          <p className="font-display text-lg text-foreground mt-4 max-w-xl mx-auto">
            Setiap kali Anda memesan, Anda menjadi bagian dari kisah ini.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">Every order makes you part of this story.</p>
        </section>
      </main>

      {showEditor && (
        <FarmerEditor
          open={showEditor}
          farmer={editing}
          onClose={() => setShowEditor(false)}
          onSaved={fetchFarmers}
        />
      )}
    </div>
  );
}