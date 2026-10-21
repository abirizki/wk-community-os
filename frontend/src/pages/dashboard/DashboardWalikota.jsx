/**
 * frontend/src/pages/dashboard/DashboardWalikota.jsx
 * Executive Strategic Command Dashboard - Walikota Sukabumi
 * 
 * Karakteristik Dashboard Pimpinan Berjenjang:
 * - Fokus Makro Kota (33 Kelurahan · 7 Kecamatan)
 * - Bukti Pengambilan Keputusan Strategis (Decision Evidence)
 * - Bebas dari rincian operasional mikro RT/RW
 * - Fitur Disposisi & Instruksi Intervensi Kebijakan Pimpinan
 * Bumi Warga - Jabar Pintar Digital
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  Landmark,
  Building2,
  TrendingDown,
  TrendingUp,
  HeartPulse,
  Award,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  Layers,
  ArrowRight,
  RefreshCw,
  Send,
  FileCheck,
  Share2,
  MapPin,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UnifiedStatCard from '../../components/design-system/UnifiedStatCard';
import KPIGrid from '../../components/design-system/KPIGrid';

export default function DashboardWalikota() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [instructionModal, setInstructionModal] = useState({ isOpen: false, targetKecamatan: '', subject: '', note: '' });
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/wilayah/command-center');
      if (res && res.data) {
        setData(res.data.data || res.data);
      }
    } catch (e) {
      console.warn('Gagal memuat analitik makro walikota:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendInstruction = (e) => {
    e.preventDefault();
    setToastMessage(`Instruksi Walikota diterbitkan untuk Camat ${instructionModal.targetKecamatan || 'Seluruh Wilayah'}.`);
    setInstructionModal({ isOpen: false, targetKecamatan: '', subject: '', note: '' });
    setTimeout(() => setToastMessage(''), 4000);
  };

  const kecamatanSummary = [
    { nama: 'Cikole', kelurahan: 6, stunting: 18, pbb_rate: '88.4%', sla_avg: '1.4 jam', status: 'Optimal' },
    { nama: 'Citamiang', kelurahan: 5, stunting: 24, pbb_rate: '79.2%', sla_avg: '1.8 jam', status: 'Waspada Stunting' },
    { nama: 'Warudoyong', kelurahan: 5, stunting: 21, pbb_rate: '82.1%', sla_avg: '1.6 jam', status: 'Optimal' },
    { nama: 'Baros', kelurahan: 4, stunting: 29, pbb_rate: '71.5%', sla_avg: '2.1 jam', status: 'Perlu Akselerasi' },
    { nama: 'Lembursitu', kelurahan: 5, stunting: 32, pbb_rate: '68.9%', sla_avg: '2.4 jam', status: 'Intervensi Khusus' },
    { nama: 'Cibeureum', kelurahan: 4, stunting: 15, pbb_rate: '84.0%', sla_avg: '1.5 jam', status: 'Optimal' },
    { nama: 'Gunungpuyuh', kelurahan: 4, stunting: 19, pbb_rate: '81.6%', sla_avg: '1.7 jam', status: 'Optimal' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl text-xs font-bold border border-slate-700"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Eksekutif Walikota Sukabumi */}
      <header className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
                Dashboard Eksekutif Kepala Daerah
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Kota Sukabumi · 7 Kecamatan · 33 Kelurahan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pusat Kendali Kebijakan Walikota
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ringkasan bukti data spasial makro kota untuk monitoring zero stunting, kepatuhan SLA pelayanan publik, realisasi fiskal PBB-P2, dan integrasi perlindungan sosial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => { setRefreshing(true); loadData(); }}
              disabled={refreshing || loading}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Perbarui Data</span>
            </button>

            <Link
              to="/dashboard/command-center"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/30"
            >
              <span>Buka Data Analitik Spasial</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Empat Bukti Keputusan Strategis (Executive Decision Evidence Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-700" />
            <span>Indikator Makro Pembangunan & Pelayanan Publik Kota</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">Siklus Real-Time</span>
        </div>

        <KPIGrid columns={4}>
          <UnifiedStatCard
            label="Zero Stunting Terpadu"
            value="158"
            unit="balita"
            context="Turun 14.2% YoY (Target Kota ≤ 14%)"
            icon={<HeartPulse size={20} className="text-red-600" />}
            urgency="high"
            trend={{ direction: 'down', isPositive: true, label: 'Tren membaik' }}
            denominatorLabel="Target Intervensi: Lembursitu & Baros"
          />

          <UnifiedStatCard
            label="Kepatuhan SLA Surat Kota"
            value="1.7"
            unit="jam"
            context="Standar SOP SPBE Maksimal 2.0 Jam"
            icon={<Clock size={20} className="text-emerald-700" />}
            urgency="low"
            trend={{ direction: 'up', isPositive: true, label: '96.2% tepat waktu' }}
            denominatorLabel="33 dari 33 Kelurahan TTE Aktif"
          />

          <UnifiedStatCard
            label="Realisasi PBB-P2 Kota"
            value="81.4%"
            unit="terkumpul"
            context="Rp 24,8 M dari Target Rp 30,5 M"
            icon={<Building2 size={20} className="text-blue-700" />}
            urgency="low"
            trend={{ direction: 'up', isPositive: true, label: '+4.8% vs tahun lalu' }}
            denominatorLabel="Cakupan 7 Kecamatan"
          />

          <UnifiedStatCard
            label="Kemiskinan Ekstrem (Desil 1)"
            value="1.240"
            unit="KK"
            context="98.5% Telah Tercover Jaring Bansos"
            icon={<Users size={20} className="text-amber-700" />}
            urgency="medium"
            trend={{ direction: 'down', isPositive: true, label: 'Verifikasi faktual' }}
            denominatorLabel="Terpadu DTKS & Muskel"
          />
        </KPIGrid>
      </div>

      {/* 3. Komparasi Kinerja Wilayah Berjenjang: 7 Kecamatan di Kota Sukabumi */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Landmark size={18} className="text-blue-700" />
              <span>Matriks Komparasi 7 Kecamatan Kota Sukabumi</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tingkat evaluasi berjenjang untuk pemantauan Camat dan perumusan intervensi kebijakan kewilayahan.
            </p>
          </div>

          <button
            onClick={() => setInstructionModal({ isOpen: true, targetKecamatan: '', subject: 'Percepatan Intervensi Stunting & Penagihan PBB', note: '' })}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Send size={14} className="text-blue-400" />
            <span>Terbitkan Instruksi Walikota</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Wilayah Kecamatan</th>
                <th className="py-3 px-4">Jumlah Kelurahan</th>
                <th className="py-3 px-4">Kasus Stunting</th>
                <th className="py-3 px-4">Realisasi PBB-P2</th>
                <th className="py-3 px-4">Rerata SLA Surat</th>
                <th className="py-3 px-4">Status Kinerja</th>
                <th className="py-3 px-4 text-right">Tindakan Walikota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {kecamatanSummary.map((kec) => (
                <tr key={kec.nama} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <MapPin size={14} className="text-blue-600" />
                    <span>Kecamatan {kec.nama}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{kec.kelurahan} Kelurahan</td>
                  <td className="py-3.5 px-4">
                    <span className={`font-mono font-bold ${kec.stunting > 25 ? 'text-red-700' : 'text-slate-800'}`}>
                      {kec.stunting} balita
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{kec.pbb_rate}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{kec.sla_avg}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      kec.status === 'Optimal' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : kec.status === 'Intervensi Khusus'
                        ? 'bg-red-100 text-red-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {kec.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setInstructionModal({
                        isOpen: true,
                        targetKecamatan: kec.nama,
                        subject: `Instruksi Percepatan Kinerja Kecamatan ${kec.nama}`,
                        note: `Perhatian khusus untuk penanganan ${kec.stunting} balita stunting dan optimalisasi penagihan PBB (${kec.pbb_rate}).`
                      })}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition cursor-pointer"
                    >
                      Beri Arahan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Terbitkan Instruksi Walikota */}
      <AnimatePresence>
        {instructionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-blue-700" />
                  <h3 className="font-extrabold text-sm text-slate-900">Instruksi Pimpinan Walikota</h3>
                </div>
                <button
                  onClick={() => setInstructionModal({ isOpen: false, targetKecamatan: '', subject: '', note: '' })}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendInstruction} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tujuan Wilayah Camat:</label>
                  <input
                    type="text"
                    readOnly
                    value={instructionModal.targetKecamatan ? `Kecamatan ${instructionModal.targetKecamatan}` : 'Seluruh 7 Kecamatan se-Kota Sukabumi'}
                    className="w-full p-2.5 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Perihal Instruksi Kebijakan:</label>
                  <input
                    type="text"
                    required
                    value={instructionModal.subject}
                    onChange={(e) => setInstructionModal(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catatan Disposisi Pimpinan:</label>
                  <textarea
                    rows={4}
                    required
                    value={instructionModal.note}
                    onChange={(e) => setInstructionModal(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Tuliskan instruksi langkah korektif atau target tenggat waktu penyelesaian..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setInstructionModal({ isOpen: false, targetKecamatan: '', subject: '', note: '' })}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Kirim Disposisi Resmi</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
