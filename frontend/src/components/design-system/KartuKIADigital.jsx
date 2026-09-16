/**
 * frontend/src/components/design-system/KartuKIADigital.jsx
 * Kartu Menuju Sehat (KMS) & KIA Digital
 * Desain ramah keluarga menyerupai buku fisik KIA dengan tata letak resmi dan hierarki jelas.
 * Bumi Warga - Jabar Pintar Digital
 */

import React, { useState } from 'react';
import { 
  Baby, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronRight, 
  Activity, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  User, 
  Users, 
  MapPin, 
  Award, 
  X, 
  FileText,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KartuKIADigital({
  data = {},
  onCatatBaru = null,
  readOnly = false,
  className = ''
}) {
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const {
    nik_anak = '-',
    no_kk = '-',
    nama_anak = 'Balita',
    jenis_kelamin_anak = 'L',
    tanggal_lahir_anak = '',
    tempat_lahir = 'Bandung',
    rt = '001',
    rw = '001',
    kelurahan = 'Kebonjati',
    nama_ibu = '-',
    nama_ayah = '-',
    nama_posyandu = 'Posyandu Melati RW 001',
    umur_bulan = null,
    latest_checkup = null,
    growth_trend = null,
    history = []
  } = data;

  // Hitung usia teks
  const formatUsia = (bulan, tglLahir) => {
    let bln = bulan;
    if (bln === null || bln === undefined) {
      if (tglLahir) {
        const diffMs = Date.now() - new Date(tglLahir).getTime();
        bln = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
      } else {
        bln = 0;
      }
    }
    const thn = Math.floor(bln / 12);
    const sisaBln = bln % 12;
    if (thn > 0) {
      return `${thn} Thn ${sisaBln > 0 ? `${sisaBln} Bln` : ''} (${bln} Bulan)`;
    }
    return `${bln} Bulan`;
  };

  const isLaki = jenis_kelamin_anak === 'L';
  const usiaTeks = formatUsia(umur_bulan || latest_checkup?.umur_bulan, tanggal_lahir_anak);

  // Status gizi badge color
  const getStatusGiziBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('buruk') || s.includes('stunting') || s.includes('kurang')) {
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        label: status || 'Perlu Perhatian Gizi'
      };
    }
    if (s.includes('lebih') || s.includes('obesitas')) {
      return {
        bg: 'bg-purple-100 text-purple-900 border-purple-300',
        label: status || 'Risiko Gizi Lebih'
      };
    }
    return {
      bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      label: 'Pertumbuhan Baik (Normal)'
    };
  };

  const giziBadge = getStatusGiziBadge(latest_checkup?.status_gizi);

  // Growth trend indicator
  const tren = growth_trend?.tren_bb || 'tetap';
  const delta = growth_trend?.delta_bb || 0;

  return (
    <>
      <div 
        className={`relative overflow-hidden rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/60 p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${className}`}
      >
        {/* Dekorasi Aksen Buku KIA Fisik */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-teal-100/40 blur-2xl pointer-events-none" />

        {/* Top Header Resmi */}
        <div className="flex items-start justify-between gap-3 border-b border-teal-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${
              isLaki ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
            }`}>
              <Baby size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                  Kartu KIA & KMS Digital
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {nama_posyandu}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight mt-0.5">
                {nama_anak}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
              isLaki ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-pink-50 text-pink-800 border-pink-200'
            }`}>
              {isLaki ? 'Laki-Laki (L)' : 'Perempuan (P)'}
            </span>
            <p className="text-[10px] font-mono text-slate-400 mt-1">NIK: {nik_anak}</p>
          </div>
        </div>

        {/* Informasi Utama Orang Tua & Domisili */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 text-xs text-slate-700 border-b border-teal-100/70">
          <div>
            <span className="text-[10px] text-slate-400 block">Usia Saat Ini</span>
            <p className="font-bold text-slate-900">{usiaTeks}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Nama Ibu / Ayah</span>
            <p className="font-semibold text-slate-800 truncate">
              {nama_ibu !== '-' ? nama_ibu : nama_ayah}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block">Domisili</span>
            <p className="font-semibold text-slate-800">
              RT {rt} / RW {rw}, Kel. {kelurahan}
            </p>
          </div>
        </div>

        {/* Pengukuran Terakhir & Status Gizi */}
        <div className="mt-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <Activity size={13} className="text-teal-600" />
              <span>Pengukuran Terakhir:</span>
              <span className="font-normal text-slate-400">
                {latest_checkup?.tanggal ? new Date(latest_checkup.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum ada data'}
              </span>
            </span>

            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${giziBadge.bg}`}>
              {giziBadge.label}
            </span>
          </div>

          {/* Grid Metrik Antropometri */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white/80 rounded-xl border border-teal-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Berat Badan</span>
              <p className="text-sm sm:text-base font-extrabold text-teal-950 font-mono tabular-nums">
                {latest_checkup?.berat_badan_kg ? `${latest_checkup.berat_badan_kg} kg` : '-'}
              </p>
            </div>
            <div className="p-2 bg-white/80 rounded-xl border border-teal-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Tinggi Badan</span>
              <p className="text-sm sm:text-base font-extrabold text-teal-950 font-mono tabular-nums">
                {latest_checkup?.tinggi_badan_cm ? `${latest_checkup.tinggi_badan_cm} cm` : '-'}
              </p>
            </div>
            <div className="p-2 bg-white/80 rounded-xl border border-teal-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Lingkar Kepala</span>
              <p className="text-sm sm:text-base font-extrabold text-teal-950 font-mono tabular-nums">
                {latest_checkup?.lingkar_kepala_cm ? `${latest_checkup.lingkar_kepala_cm} cm` : '-'}
              </p>
            </div>
          </div>

          {/* Indikator Tren Pertumbuhan Aman */}
          <div className="p-2.5 rounded-xl bg-teal-100/40 border border-teal-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {tren === 'naik' && <TrendingUp size={16} className="text-emerald-600 shrink-0" />}
              {tren === 'turun' && <TrendingDown size={16} className="text-amber-600 shrink-0" />}
              {tren === 'tetap' && <Minus size={16} className="text-sky-600 shrink-0" />}
              <span className="font-semibold text-slate-800">
                {growth_trend?.label || 'Grafik berat badan dalam rentang aman'}
              </span>
            </div>
            <span className="text-[10px] text-teal-800 font-bold bg-white px-2 py-0.5 rounded shadow-2xs">
              {growth_trend?.status_pertumbuhan || 'Sehat'}
            </span>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="mt-4 pt-3 border-t border-teal-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText size={14} className="text-teal-600" />
            <span>Buka Lembar Pertumbuhan ({history.length} Catatan)</span>
            <ChevronRight size={14} />
          </button>

          {!readOnly && onCatatBaru && (
            <button
              type="button"
              onClick={() => onCatatBaru(data)}
              className="text-xs font-bold bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              + Catat Timbang
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL / DRAWER LEMBAR PERTUMBUHAN KMS                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-elevated border border-teal-200 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 bg-teal-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Baby size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold">Lembar Pertumbuhan Antropometri (KMS)</h3>
                    <p className="text-xs text-teal-100">{nama_anak} · NIK: {nik_anak}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1.5 rounded-lg text-teal-100 hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content: Tabel & Riwayat */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {/* Ringkasan Status */}
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Status Gizi Terkini</span>
                    <p className="font-extrabold text-teal-950 text-sm">{latest_checkup?.status_gizi || 'Normal'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Pemeriksaan Terakhir</span>
                    <p className="font-bold text-slate-800">{latest_checkup?.tanggal || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Petugas</span>
                    <p className="font-bold text-slate-800">{latest_checkup?.petugas || 'Kader Posyandu'}</p>
                  </div>
                </div>

                {/* Tabel Riwayat Bulanan */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Tanggal</th>
                        <th className="p-2.5">Usia</th>
                        <th className="p-2.5 text-right">Berat (kg)</th>
                        <th className="p-2.5 text-right">Tinggi (cm)</th>
                        <th className="p-2.5 text-right">Lingkar Kpl</th>
                        <th className="p-2.5">Status Gizi</th>
                        <th className="p-2.5">Imunisasi / Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-slate-400">
                            Belum ada riwayat pemeriksaan tercatat.
                          </td>
                        </tr>
                      ) : (
                        history.map((rec, idx) => (
                          <tr key={rec.id || idx} className="hover:bg-teal-50/40 transition-colors">
                            <td className="p-2.5 font-semibold text-slate-900 whitespace-nowrap font-mono tabular-nums">
                              {rec.tanggal_pemeriksaan || rec.tanggal || '-'}
                            </td>
                            <td className="p-2.5 whitespace-nowrap font-mono tabular-nums">
                              {rec.umur_bulan !== undefined ? `${rec.umur_bulan} bln` : '-'}
                            </td>
                            <td className="p-2.5 text-right font-extrabold text-teal-900 font-mono tabular-nums">
                              {rec.berat_badan_kg ? `${rec.berat_badan_kg} kg` : '-'}
                            </td>
                            <td className="p-2.5 text-right font-bold text-slate-800 font-mono tabular-nums">
                              {rec.tinggi_badan_cm ? `${rec.tinggi_badan_cm} cm` : '-'}
                            </td>
                            <td className="p-2.5 text-right text-slate-600 font-mono tabular-nums">
                              {rec.lingkar_kepala_cm ? `${rec.lingkar_kepala_cm} cm` : '-'}
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                                {rec.status_gizi || 'Normal'}
                              </span>
                            </td>
                            <td className="p-2.5 text-[11px] text-slate-500 max-w-xs truncate">
                              {rec.imunisasi && rec.imunisasi !== '-' ? `[${rec.imunisasi}] ` : ''}
                              {rec.catatan_kesehatan || rec.catatan || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-slate-400 italic text-center">
                  * Kartu KIA Digital ini tersinkronisasi resmi dengan Pangkalan Data Posyandu Kelurahan Kebonjati.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
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

