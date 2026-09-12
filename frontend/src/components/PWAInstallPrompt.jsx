import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    const handler = (e) => {
      // Prevent automatic browser mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed in this session
      const dismissed = sessionStorage.getItem('bw_pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      console.log('[PWA] Bumi Warga successfully installed.');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('bw_pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="fixed bottom-5 left-5 right-5 md:left-auto md:right-8 md:bottom-8 z-50 max-w-sm bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-elevated p-4 backdrop-blur-md overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Smartphone size={22} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-on-surface">Install Bumi Warga</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary flex items-center gap-0.5">
                <Sparkles size={10} /> PWA
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
              Pasang aplikasi di layar utama ponsel atau desktop untuk akses cepat, notifikasi, dan mode tanpa internet.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                <Download size={14} /> Pasang Sekarang
              </button>
              <button
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition"
              >
                Nanti Saja
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

