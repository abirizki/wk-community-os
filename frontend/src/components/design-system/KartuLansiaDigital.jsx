/**
 * frontend/src/components/design-system/KartuLansiaDigital.jsx
 * Kartu Pemantauan Kesehatan Lansia Digital
 * Menampilkan catatan rekam medis berkala, status tensi, gula darah, dan kemandirian lansia.
 * Bumi Warga - Jabar Pintar Digital
 */

import React, { useState } from 'react';
import { 
  HeartPulse, 
  Activity, 
  Calendar, 
  User, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KartuLansiaDigital({
  data = {},
  onCatatPemeriksaan = null,
  readOnly = false,
  className = ''
}) {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const {
    id = null,
    posyandu_lansia_id = null,
    nik = '-',
    nama = 'Lansia',
    usia = '-',
    jenis_kelamin = 'L',
    rt = '001',
    rw = '001',
    alamat = 'Kebonjati',
    status_tinggal = 'Bersama Keluarga',
    riwayat_penyakit = '-',
    // Hasil Terakhir
    last_tanggal_pemeriksaan = null,
    last_tensi_sistolik = null,
    last_tensi_diastolik = null,
    last_gds = null,
    last_adl = 'Mandiri',
    last_berat_badan = null,
    last_tinggi_badan = null,
    tensi_sistolik = null,
    tensi_diastolik = null,
    gula_darah_sewaktu = null,
    skor_kemandirian_adl = null,
    tanggal_pemeriksaan = null,
    history = []
  } = data;

  const sistolik = last_tensi_sistolik || tensi_sistolik;
  const diastolik = last_tensi_diastolik || tensi_diastolik;
  const gds = last_gds || gula_darah_sewaktu;
  const adl = last_adl || skor_kemandirian_adl || 'Mandiri';
  const tglPemeriksaan = last_tanggal_pemeriksaan || tanggal_pemeriksaan;

  // Status Tensi
  const getTensiStatus = (sis, dia) => {
    if (!sis || !dia) return { label: 'Belum Diperiksa', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    if (sis >= 160 || dia >= 100) return { label: 'Hipertensi Tk 2', bg: 'bg-red-100 text-red-900 border-red-300' };
    if (sis >= 140 || dia >= 90) return { label: 'Hipertensi Tk 1', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
    if (sis >= 120 || dia >= 80) return { label: 'Prehipertensi', bg: 'bg-yellow-100 text-yellow-900 border-yellow-300' };
    return { label: 'Tensi Normal', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  };

  const tensiStatus = getTensiStatus(sistolik, diastolik);

  // Status Gula Darah Sewaktu
  const getGdsStatus = (g) => {
    if (!g) return null;
    if (g >= 200) return { label: 'GDS Tinggi (≥200)', bg: 'bg-red-100 text-red-900 border-red-300' };
    if (g >= 140) return { label: 'GDS Waspada (140-199)', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
    return { label: 'GDS Normal (<140)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  };

  const gdsStatus = getGdsStatus(gds);

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/50 p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${className}`}>
        {/* Dekorasi Aksen Kartu Lansia */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
              <HeartPulse size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Kartu Sehat Lansia
                </span>
                {status_tinggal === 'Sebatang Kara' && (
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    Sebatang Kara
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight mt-0.5">
                {nama}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
              {usia} Tahun · {jenis_kelamin === 'L' ? 'L' : 'P'}
            </span>
            <p className="text-[10px] font-mono text-slate-400 mt-1">NIK: {nik}</p>
          </div>
        </div>

        {/* Info Lokasi & Riwayat Sakit */}
        <div className="grid grid-cols-2 gap-2 py-2.5 text-xs text-slate-700 border-b border-emerald-100/70">
          <div>
            <span className="text-[10px] text-slate-400 block">Domisili</span>
            <p className="font-semibold text-slate-800">RT {rt} / RW {rw}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Riwayat / Keluhan</span>
            <p className="font-semibold text-slate-800 truncate">{riwayat_penyakit || 'Tidak ada riwayat kronis'}</p>
          </div>
        </div>

        {/* Vitals Terakhir */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Activity size={13} className="text-emerald-600" />
              <span>Pemeriksaan Terakhir:</span>
              <span className="font-normal text-slate-400">
                {tglPemeriksaan ? new Date(tglPemeriksaan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum tercatat'}
              </span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tensiStatus.bg}`}>
              {tensiStatus.label}
            </span>
          </div>

          {/* Grid Vitals */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white/80 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Tensi Darah</span>
              <p className="text-sm font-extrabold text-emerald-950">
                {sistolik && diastolik ? `${sistolik}/${diastolik}` : '-'}
                <span className="text-[10px] font-normal text-slate-400 ml-0.5">mmHg</span>
              </p>
            </div>
            <div className="p-2 bg-white/80 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Gula Darah</span>
              <p className="text-sm font-extrabold text-emerald-950">
                {gds ? `${gds}` : '-'}
                <span className="text-[10px] font-normal text-slate-400 ml-0.5">mg/dL</span>
              </p>
            </div>
            <div className="p-2 bg-white/80 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Kemandirian</span>
              <p className="text-xs font-extrabold text-emerald-950 truncate mt-0.5">
                {adl}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="mt-3.5 pt-2.5 border-t border-emerald-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowDetailModal(true)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText size={14} className="text-emerald-600" />
            <span>Lihat Riwayat Medis</span>
            <ChevronRight size={14} />
          </button>

          {!readOnly && onCatatPemeriksaan && (
            <button
              type="button"
              onClick={() => onCatatPemeriksaan(data)}
              className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              + Periksa Lansia
            </button>
          )}
        </div>
      </div>

      {/* Modal Detail Rekam Medis Lansia */}
      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-white rounded-2xl shadow-elevated border border-emerald-200 overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold">Rekam Medis Posyandu Lansia</h3>
                    <p className="text-xs text-emerald-100">{nama} · {usia} Thn · RT {rt}/RW {rw}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="p-1.5 rounded-lg text-emerald-100 hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Status Tensi Terkini</span>
                    <p className="font-extrabold text-emerald-950 text-sm">{sistolik && diastolik ? `${sistolik}/${diastolik} mmHg` : 'Belum ada data'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Gula Darah</span>
                    <p className="font-extrabold text-emerald-950 text-sm">{gds ? `${gds} mg/dL` : '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Kemandirian</span>
                    <p className="font-bold text-slate-800 text-sm">{adl}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Tanggal</th>
                        <th className="p-2.5">Tensi</th>
                        <th className="p-2.5">GDS</th>
                        <th className="p-2.5">BB / TB</th>
                        <th className="p-2.5">Keluhan & Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400">
                            Pemeriksaan tercatat: {tglPemeriksaan ? `${tglPemeriksaan} (Tensi ${sistolik}/${diastolik})` : 'Belum ada riwayat detail'}.
                          </td>
                        </tr>
                      ) : (
                        history.map((h, i) => (
                          <tr key={h.id || i} className="hover:bg-emerald-50/40">
                            <td className="p-2.5 font-semibold text-slate-900">{h.tanggal_pemeriksaan || '-'}</td>
                            <td className="p-2.5 font-bold text-emerald-900">{h.tensi_sistolik}/{h.tensi_diastolik}</td>
                            <td className="p-2.5">{h.gula_darah_sewaktu ? `${h.gula_darah_sewaktu} mg/dL` : '-'}</td>
                            <td className="p-2.5">{h.berat_badan_kg || '-'} kg / {h.tinggi_badan_cm || '-'} cm</td>
                            <td className="p-2.5 text-slate-500 truncate max-w-xs">{h.keluhan || h.tindakan_petugas || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold text-xs text-slate-800"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

