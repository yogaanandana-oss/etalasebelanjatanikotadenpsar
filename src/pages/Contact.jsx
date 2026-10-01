import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import BaliPattern from '@/components/marketplace/BaliPattern';
import PageHeader from '@/components/marketplace/PageHeader';
import { useSettings } from '@/lib/settingsContext';
import { shopConfig } from '@/lib/shopConfig';

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const { settings } = useSettings() || {};
  const shopName = settings?.shop_name?.value || shopConfig.shopName;
  const waNumber = settings?.whatsapp_number?.value || shopConfig.whatsappNumber;
  const contactPhone = settings?.contact_phone?.value || '+62 361 000 000';
  const contactEmail = settings?.contact_email?.value || 'hello@etalasetani.id';

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: '', phone: '', message: '' });
      toast({ title: 'Pesan terkirim', description: 'Tim kami akan menghubungi Anda segera.' });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Kontak Kami" en="Contact Us" />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-8">
        <div className="relative rounded-2xl bg-primary text-primary-foreground p-6 overflow-hidden">
          <MessageCircle className="absolute -bottom-3 -right-3 text-primary-foreground/15" size={72} />
          <h2 className="font-display font-extrabold text-xl leading-tight">Butuh Bantuan?</h2>
          <p className="text-[0.8em] text-primary-foreground/80">Need Help?</p>
          <p className="text-sm text-primary-foreground/90 mt-2 max-w-lg">
            Tim layanan pelanggan kami siap membantu Anda berbelanja sayur segar dari petani lokal Denpasar.
          </p>
        </div>

        <BaliPattern className="text-primary/20" height={18} />

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5 rounded-xl space-y-4">
            <h3 className="font-display font-bold text-foreground">Informasi Kontak</h3>
            <p className="text-[0.7em] text-muted-foreground/70 -mt-3">Contact Information</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary shrink-0" /><span className="text-muted-foreground">{contactPhone}</span></div>
              <div className="flex items-center gap-3"><MessageCircle className="w-4 h-4 text-primary shrink-0" /><span className="text-muted-foreground">WhatsApp: {waNumber}</span></div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary shrink-0" /><span className="text-muted-foreground">{contactEmail}</span></div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary shrink-0" /><span className="text-muted-foreground">Kota Denpasar, Bali</span></div>
              <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-primary shrink-0" /><span className="text-muted-foreground">Setiap hari · 07.00–20.00 WITA</span></div>
            </div>
          </Card>

          <Card className="p-5 rounded-xl">
            <h3 className="font-display font-bold text-foreground mb-1">Kirim Pesan</h3>
            <p className="text-[0.7em] text-muted-foreground/70 mb-4">Send a Message</p>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Nama / Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Nomor HP / Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0812xxxxxxx" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="message">Pesan / Message</Label>
                <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tuliskan pesan Anda..." rows={4} required />
              </div>
              <Button type="submit" disabled={sending} className="w-full rounded-lg">
                {sending ? 'Mengirim...' : <><Send className="w-4 h-4 mr-1" />Kirim Pesan / Send</>}
              </Button>
            </form>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/faq"><Button variant="outline" className="rounded-full px-6">Lihat FAQ / View FAQ</Button></Link>
        </div>
      </main>
    </div>
  );
}