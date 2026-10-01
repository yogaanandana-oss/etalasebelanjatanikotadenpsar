const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const DEFAULT = 'Selamat Datang, Selamat Berbelanja! 🌿';

export default function WelcomeMarquee() {
  const [text, setText] = useState(DEFAULT);

  useEffect(() => {
    db.entities.Setting.filter({ key: 'welcome_marquee' }, '-updated_date', 50)
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : rows?.items || [];
        if (list.length) setText(list[0].value || DEFAULT);
      })
      .catch(() => {});
  }, []);

  const item = (
    <span className="inline-flex items-center gap-2 px-8 text-sm font-semibold">
      <Sparkles className="w-4 h-4 shrink-0 opacity-80" />
      {text}
    </span>
  );

  return (
    <div className="relative overflow-hidden bg-primary text-primary-foreground border-y border-primary-foreground/20">
      <div className="flex whitespace-nowrap animate-marquee py-2 will-change-transform">
        {item}
        {item}
      </div>
    </div>
  );
}