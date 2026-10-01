const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Image } from '@/components/ui/image';

/**
 * Bilingual gratitude card featuring a Balinese farmer portrait,
 * Latin and Balinese script ("Matur suksma") thank-you messaging.
 * Used on the checkout success screen and per-order in order history.
 */
export default function ThankYouCard({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10 p-5 overflow-hidden ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-lg shrink-0">
          <Image
            src="https://media.db.com/images/public/6aa8ed0c5f6fc170701cd715/3e07d5cb1_generated_image.png"
            alt="Petani Bali tersenyum / Smiling Balinese farmer"
            className="w-full h-full"
            fittingType="fill"
            focalPointX={0.5}
            focalPointY={0.4}
          />
        </div>
        <div className="text-center sm:text-left leading-tight">
          <p className="font-display font-extrabold text-lg text-foreground">Terima kasih telah membeli produk petani lokal</p>
          <p className="font-display text-base text-primary mt-0.5">Matur suksma! 🙏</p>
          <p className="text-lg text-primary/80 mt-0.5" lang="ban" style={{ fontFamily: "'Noto Sans Balinese', 'Plus Jakarta Sans', sans-serif" }}>ᬫᬢᬸᬃᬲᬸᬓ᭄ᬱ᭄ᬫ</p>
          <p className="text-sm text-muted-foreground mt-1">Thank you for choosing local farmers' products</p>
          <p className="text-[0.7em] text-muted-foreground/70">Setiap pembelian Anda menopang keluarga petani Bali.</p>
        </div>
      </div>
    </div>
  );
}