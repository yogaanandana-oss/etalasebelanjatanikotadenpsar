const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { X, Send, Loader2, LogIn, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';

const AGENT = 'farmer_assistant';
const AVATAR = 'https://media.db.com/images/public/6aa8ed0c5f6fc170701cd715/da4434ab7_generated_image.png';
const GREETING = "Salam sejahtera! 🌱 Saya **Pak Wayan**, petani lokal Denpasar. Mau saya bantu pilih sayur & buah segar hari ini? Tanyakan soal stok, harga, kesegaran, atau rekomendasi sayur untuk masak.\n\n(Hi, I'm Pak Wayan — ask me about fresh produce, prices, or recipes!)";

const toArr = (d) => (Array.isArray(d) ? d : d?.items || []);

export default function FarmerAssistant() {
  const [authed, setAuthed] = useState(null);
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    db.auth.isAuthenticated().then((v) => setAuthed(v)).catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = db.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(toArr(data?.messages));
    });
    return () => { try { unsub && unsub(); } catch { /* noop */ } };
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const start = async () => {
    setStarting(true);
    try {
      let conv = toArr(await db.agents.listConversations({ agent_name: AGENT }))[0];
      if (!conv) {
        conv = await db.agents.createConversation({ agent_name: AGENT, metadata: { name: 'Pak Wayan' } });
      }
      setConversation(conv);
      const msgs = toArr(conv?.messages);
      setMessages(msgs.length ? msgs : [{ role: 'assistant', content: GREETING }]);
    } catch {
      setMessages([{ role: 'assistant', content: GREETING }]);
    } finally {
      setStarting(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (authed && !conversation) start();
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    if (!conversation) await start();
    const conv = conversation;
    if (!conv) return;
    setInput('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', content: text }]);
    try {
      await db.agents.addMessage(conv, { role: 'user', content: text });
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Maaf, terjadi kendalan teknis. Coba lagi ya. 😊' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`fixed z-40 bottom-20 right-4 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full overflow-hidden shadow-lg ring-2 ring-primary/20 hover:scale-105 transition-transform ${open ? 'hidden' : ''}`}
        aria-label="Asisten Petani Pak Wayan"
      >
        <Image src={AVATAR} alt="Pak Wayan" className="w-full h-full" fittingType="fill" />
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
          <Sparkles className="w-3 h-3" />
        </span>
      </button>

      {open && (
        <div className="fixed z-50 inset-x-2 bottom-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px] max-h-[80vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-3 bg-primary text-primary-foreground">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary-foreground/30 shrink-0">
              <Image src={AVATAR} alt="Pak Wayan" className="w-full h-full" fittingType="fill" />
            </div>
            <div className="flex-1 leading-tight">
              <p className="font-display font-bold">Pak Wayan</p>
              <p className="text-[0.7em] opacity-80">Asisten Belanja Petani · Online</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-primary-foreground/15" aria-label="Tutup">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-background">
            {authed === false ? (
              <div className="text-center py-8 px-4">
                <LogIn className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-display font-semibold text-foreground">Masuk untuk mengobrol</p>
                <p className="text-sm text-muted-foreground/70 mb-4">Log in to chat with Pak Wayan</p>
                <Link to="/login"><Button className="rounded-full"><LogIn className="w-4 h-4 mr-1" />Masuk / Login</Button></Link>
              </div>
            ) : starting ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              messages.map((m, i) => {
                const isUser = m.role === 'user';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full overflow-hidden mr-2 shrink-0">
                        <Image src={AVATAR} alt="" className="w-full h-full" fittingType="fill" />
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <ReactMarkdown className="text-sm [&>p]:m-0 [&>p+p]:mt-2">{m.content}</ReactMarkdown>
                      )}
                      {m.tool_calls?.map((tc, j) => (
                        <div key={j} className="mt-1 text-[0.7em] text-muted-foreground inline-flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> memeriksa produk…
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
            {busy && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full overflow-hidden mr-2 shrink-0">
                  <Image src={AVATAR} alt="" className="w-full h-full" fittingType="fill" />
                </div>
                <div className="bg-secondary rounded-2xl px-3 py-2 flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>

          {authed !== false && (
            <div className="p-3 border-t border-border bg-card flex items-center gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder="Tanya Pak Wayan… (ask about fresh produce)"
                className="flex-1 resize-none max-h-24 text-sm rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={send} disabled={busy || !input.trim()} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 shrink-0">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}