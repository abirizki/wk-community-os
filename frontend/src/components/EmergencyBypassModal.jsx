import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, X, ShieldAlert, CheckCircle2, KeyRound, AlertCircle, Send } from 'lucide-react';
import { api } from '../utils/api';

export default function EmergencyBypassModal({ isOpen, onClose, onSuccess, doc }) {
  const [reason, setReason] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const quickReasons = [
    'Ketua RT berhalangan (sakit / di luar kota)',
    'Rujukan darurat pasien ke IGD / Rumah Sakit',
    'Pengurusan akta kematian & pemakaman mendesak',
    'Kebutuhan beasiswa / SPMB tenggat waktu kritis'
  ];

  const handleBypass = async (e) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 5) {
      setErrorMsg('Alasan kedaruratan wajib diisi minimal 5 karakter untuk audit akuntabilitas.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post(`/dokumen/${doc.id}/emergency-bypass`, {
        emergency_reason: reason.trim(),
        pin: pin || '123456'
      });

      if (res.success) {
        if (onSuccess) onSuccess(res);
        onClose();
      } else {
        throw new Error(res.message || 'Gagal melakukan bypass darurat.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses bypass darurat.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !doc) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="fixed inset-0" onClick={!loading ? onClose : undefined} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden z-10"
        >
          {/* Header Amber/Red Emergency */}
          <div className="bg-gradient-to-r from-rose-700 via-amber-600 to-rose-800 text-white p-6 relative">
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1.5 text-rose-100 text-xs font-bold uppercase tracking-wider">
              <Zap size={16} className="text-amber-300 animate-pulse" />
              <span>Protokol Kedaruratan Kewilayahan RW</span>
            </div>
            <h3 className="text-xl font-black">Bypass Verifikasi RT (Darurat)</h3>
            <p className="text-xs text-rose-100 mt-1 leading-relaxed">
              Lewati verifikasi RT karena kondisi mendesak dan langsung teruskan dokumen ke Kelurahan untuk pengesahan TTE.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleBypass} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Document Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-gray-800">
                <span>{doc.nama_pemohon}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono">RT {doc.rt} / RW {doc.rw}</span>
              </div>
              <div className="text-gray-600 font-medium">Surat: <strong className="text-gray-900">{doc.jenis_dokumen}</strong></div>
              <div className="text-gray-500 text-[11px] truncate">Keperluan: {doc.keperluan}</div>
            </div>

            {/* Alasan Kedaruratan */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Alasan Kedaruratan (Wajib Diisi untuk Audit Akuntabilitas) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan alasan darurat mengapa perlu melewati verifikasi Ketua RT..."
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                required
              />

              {/* Quick Reason Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickReasons.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReason(chip)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-600 font-semibold transition-colors border border-gray-200"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* PIN Keamanan RW */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                PIN Jabatan Ketua RW (Otorisasi Keamanan)
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="PIN 6-digit (bawaan: 123456)"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                />
                <KeyRound size={16} className="absolute right-3.5 top-3 text-gray-400" />
              </div>
              <span className="text-[10px] text-gray-400 block mt-1">Kosongkan jika ingin menggunakan PIN sesi aktif.</span>
            </div>

            {/* Warning Audit Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Tindakan bypass darurat akan dicatat secara permanen di riwayat audit <strong>dokumen_workflow_history</strong> dan dapat ditinjau oleh Kelurahan Kebonjati.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Zap size={14} className="animate-spin" /> : <Zap size={14} />}
                <span>Eksekusi Bypass Darurat</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
