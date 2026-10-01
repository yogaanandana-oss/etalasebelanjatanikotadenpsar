import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, Plus, MonitorSmartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import BaliPattern from '@/components/marketplace/BaliPattern';

const SESSION_KEY = 'ebt_install_session_shown';
const DISMISS_KEY = 'ebt_install_dismissed';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) return;

    // Always show on the first open of the web (once per browser session),
    // regardless of whether the browser fires `beforeinstallprompt`.
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, '1');
      if (!localStorage.getItem(DISMISS_KEY)) {
        setTimeout(() => setOpen(true), 1500);
      }
    }

    const onBIP = (e) => {
      e.preventDefault();
      setDeferred(e);
      setIos(false);
    };
    const onInstalled = () => {
      setDeferred(null);
      setOpen(false);
      localStorage.setItem(DISMISS_KEY, '1');
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    const ua = navigator.userAgent || '';
    const isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua) && !window.MSStream;
    if (isIOS) setIos(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const onInstall = async () => {
    if (!deferred) return;
    setBusy(true);
    try {
      deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice?.outcome === 'accepted') {
        localStorage.setItem(DISMISS_KEY, '1');
      }
    } finally {
      setDeferred(null);
      setOpen(false);
      setBusy(false);
    }
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setOpen(false);
  };

  const showGeneric = !ios && !deferred;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDismiss()}>
      <DialogContent className="sm:max-w-sm rounded-2xl overflow-hidden">
        <div className="-mx-6 -mt-6 mb-4 bg-primary text-primary-foreground px-6 pt-5 pb-4">
          <BaliPattern className="text-primary-foreground/30" height={16} />
          <div className="flex items-center gap-3 mt-2">
            <span className="w-11 h-11 rounded-xl bg-primary-foreground/15 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </span>
            <div className="leading-tight">
              <h2 className="font-display font-extrabold text-lg">Pasang Aplikasi EBT</h2>
              <p className="text-[0.7em] opacity-80">Install the EBT app</p>
            </div>
          </div>
        </div>

        <DialogHeader className="space-y-2 text-center">
          <DialogTitle className="text-foreground">Apakah mau download EBT?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pasang EBT di layar utama HP Anda untuk berbelanja panen segar kapan saja, lebih cepat.
            <br />
            <span className="text-[0.85em] text-muted-foreground/70">Install EBT on your home screen to shop fresh harvest anytime, faster.</span>
          </DialogDescription>
        </DialogHeader>

        {ios ? (
          <div className="space-y-2 text-sm text-muted-foreground bg-secondary/60 rounded-lg p-3">
            <p className="font-semibold text-foreground text-[0.8em]">Cara pasang di iPhone/iPad:</p>
            <p className="flex items-center gap-1.5"><Share className="w-4 h-4 text-primary" /> Ketuk tombol <b>Share</b> di Safari.</p>
            <p className="flex items-center gap-1.5"><Plus className="w-4 h-4 text-primary" /> Pilih <b>Tambah ke Layar Utama</b>.</p>
          </div>
        ) : null}

        {showGeneric ? (
          <div className="space-y-2 text-sm text-muted-foreground bg-secondary/60 rounded-lg p-3">
            <p className="flex items-center gap-1.5 font-semibold text-foreground text-[0.8em]">
              <MonitorSmartphone className="w-4 h-4 text-primary" /> Cara memasang di komputer:
            </p>
            <p>Klik ikon <b>Install</b> (⊕) di ujung kanan address bar browser, atau menu <b>⋮ → Pasang aplikasi</b>.</p>
            <p className="text-[0.85em] text-muted-foreground/70">Click the Install icon (⊕) in the address bar, or menu ⋮ → Install app.</p>
          </div>
        ) : null}

        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button variant="outline" onClick={onDismiss} disabled={busy} className="rounded-full">
            Nanti saja / Later
          </Button>
          {!ios && (
            <Button onClick={onInstall} disabled={busy || !deferred} className="rounded-full">
              {busy ? 'Memproses…' : (<><Download className="w-4 h-4 mr-1.5" />Download EBT</>)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}