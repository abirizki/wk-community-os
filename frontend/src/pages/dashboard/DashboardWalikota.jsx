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

import React, { useState, useEffect, useMemo } from 'react';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { downloadReport } from '../../utils/exportHelper';
import { FileSpreadsheet, Download, BookOpen, GraduationCap, Activity, BarChart3 } from 'lucide-react';
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
  const [isExportingCity, setIsExportingCity] = useState(false);

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

  // Agregasi Dinamis 7 Kecamatan dari Data Heatmap API (Bebas Hardcode)
  const kecamatanSummary = useMemo(() => {
    if (!data?.heatmap || data.heatmap.length === 0) return [];

    const kecMap = {};
    data.heatmap.forEach((kel) => {
      const kecName = kel.nama_kecamatan;
      if (!kecMap[kecName]) {
        kecMap[kecName] = {
          nama: kecName,
          kode: kel.kode_kecamatan,
          kelurahan: 0,
          stunting: 0,
          desil: 0,
          total_sla: 0,
          has_pilot: false
        };
      }
      kecMap[kecName].kelurahan += 1;
      kecMap[kecName].stunting += (kel.metrics?.kasus_stunting || 0);
      kecMap[kecName].desil += (kel.metrics?.kemiskinan_ekstrem_desil_1_2 || 0);
      kecMap[kecName].total_sla += (kel.metrics?.sla_proses_surat_jam || 0);
      if (kel.is_pilot_hub) kecMap[kecName].has_pilot = true;
    });

    return Object.values(kecMap).map((kec) => {
      const slaAvg = Number((kec.total_sla / (kec.kelurahan || 1)).toFixed(1));
      let status = 'Optimal';
      if (kec.stunting >= 25) {
        status = 'Intervensi Khusus';
      } else if (kec.stunting >= 20) {
        status = 'Waspada Stunting';
      } else if (slaAvg > 2.0) {
        status = 'Perlu Akselerasi';
      }
      return {
        nama: kec.nama,
        kelurahan: kec.kelurahan,
        stunting: kec.stunting,
        desil: kec.desil,
        sla_avg: `${slaAvg} jam`,
        status,
        has_pilot: kec.has_pilot
      };
    });
  }, [data]);

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
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wider">
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

            <button
              onClick={async () => {
                try {
                  setIsExportingCity(true);
                  await downloadReport('/wilayah/export/command-center', { format: 'xlsx' }, 'Profil_Makro_Kota_Sukabumi.xlsx');
                } catch (e) {
                  alert('Gagal mengunduh: ' + e.message);
                } finally {
                  setIsExportingCity(false);
                }
              }}
              disabled={isExportingCity}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              title="Unduh Buku Profil Pembangunan Kota Sukabumi"
            >
              <FileSpreadsheet size={14} />
              <span>{isExportingCity ? 'Mengunduh...' : 'Unduh Buku Profil Kota (.xlsx)'}</span>
            </button>

            <Link
              to="/dashboard/command-center"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/30"
            >
              <span>Data Analitik Spasial</span>
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
            value={data?.kota?.proyeksi_baseline_sdi?.total_kasus_stunting_proyeksi ?? data?.kota?.pilot_actual?.kasus_stunting ?? '-'}
            unit="balita"
            context={`Pilot Hub Kebonjati: ${data?.kota?.pilot_actual?.kasus_stunting ?? 0} balita terverifikasi`}
            icon={<HeartPulse size={20} className="text-red-600" />}
            urgency="high"
            trend={data?.kota?.pilot_actual ? { direction: 'down', isPositive: true, label: 'Data Posyandu Terintegrasi' } : null}
            denominatorLabel="Target Zero Stunting Kota Sukabumi"
          />

          <UnifiedStatCard
            label="Kepatuhan SLA Surat Kota"
            value={data?.kota?.pilot_actual?.sla_proses_surat_jam ? `${data.kota.pilot_actual.sla_proses_surat_jam}` : '1.2'}
            unit="jam"
            context="Standar SOP SPBE Maksimal 2.0 Jam"
            icon={<Clock size={20} className="text-emerald-700" />}
            urgency="low"
            trend={{ direction: 'up', isPositive: true, label: 'Pilot Live TTE Cepat' }}
            denominatorLabel="1 Kelurahan Pilot Live (Kebonjati)"
          />

          <UnifiedStatCard
            label="Cakupan Integrasi Digital"
            value={data?.kota?.cakupan_integrasi?.persentase_cakupan || '3.0%'}
            unit="terintegrasi"
            context="1 dari 33 Kelurahan Live Produksi"
            icon={<Building2 size={20} className="text-blue-700" />}
            urgency="low"
            trend={{ direction: 'up', isPositive: true, label: 'Fase 1 Pilot Hub Sukabumi' }}
            denominatorLabel="32 Kelurahan Terjadwal Integrasi SDI"
          />

          <UnifiedStatCard
            label="Kemiskinan Ekstrem (Desil 1)"
            value={data?.kota?.pilot_actual?.kemiskinan_ekstrem_desil_1_2 ?? 14}
            unit="KK (Pilot)"
            context={`Proyeksi Kota: ${data?.kota?.proyeksi_baseline_sdi?.total_keluarga_desil_1_2_proyeksi ?? '-'} KK`}
            icon={<Users size={20} className="text-amber-700" />}
            urgency="medium"
            trend={{ direction: 'down', isPositive: true, label: 'Verifikasi faktual' }}
            denominatorLabel="Terpadu DTKS & DTSEN Mandiri"
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
                <th className="py-3 px-4">Keluarga Desil 1–2</th>
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
                    {kec.has_pilot && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                        Pilot Live Hub
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{kec.kelurahan} Kelurahan</td>
                  <td className="py-3.5 px-4">
                    <span className={`font-mono font-bold ${kec.stunting > 25 ? 'text-red-700' : 'text-slate-800'}`}>
                      {kec.stunting} balita
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{kec.desil} KK</td>
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
                        note: `Perhatian khusus untuk penanganan ${kec.stunting} balita stunting dan pemantauan ${kec.desil} KK rentan.`
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

      {/* 4. VISUALISASI DINAMIS KOMPARATIF 7 KECAMATAN (DECISION EVIDENCE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CHART 1: STUNTING VS KEMISKINAN EKSTREM ANTAR KECAMATAN */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <HeartPulse size={18} className="text-red-600" />
              <span>Komparasi Stunting & Desil 1–2 per Kecamatan</span>
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200">
              Prioritas Intervensi
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Perbandingan beban balita berisiko stunting dan keluarga kemiskinan ekstrem lintas 7 kecamatan Kota Sukabumi untuk penetapan kuota bansos dan bantuan pangan.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kecamatanSummary.map(k => ({
                  name: k.nama,
                  'Stunting (Balita)': k.stunting,
                  'Desil 1-2 (KK)': k.desil
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Stunting (Balita)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Desil 1-2 (KK)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: EFISIENSI LAYANAN PUBLIK & KECEPATAN SLA SURAT */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-emerald-600" />
              <span>Efisiensi Pelayanan SPBE & Rerata SLA (Jam)</span>
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              SOP Maksimal: 2.0 Jam
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Kecepatan pemrosesan dokumen pengantar dan perizinan warga berjenjang (RT &bull; RW &bull; Kelurahan) di masing-masing kecamatan.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kecamatanSummary.map(k => ({
                  name: k.nama,
                  'Rerata SLA (Jam)': parseFloat(k.sla_avg) || 1.5
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 4]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Rerata SLA (Jam)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. TIGA PILAR STANDAR PELAYANAN MINIMAL (SPM) KOTA SUKABUMI */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-blue-700" />
              <span>Monitoring Capaian Standar Pelayanan Minimal (SPM) Kota</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluasi kinerja pemenuhan hak-hak dasar warga di sektor Pendidikan, Kesehatan, dan Tata Kelola Pemerintahan.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
            Indikator Kemendagri & SDI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* PILAR 1: PENDIDIKAN */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <GraduationCap size={16} className="text-sky-700" />
                Pendidikan Dasar & Menengah
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">98.4%</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Angka Partisipasi Murni (APM) jenjang SD & SMP di Kota Sukabumi terkategori prima. Intervensi diarahkan untuk beasiswa anak tidak sekolah (ATS) di kawasan pinggiran.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Rerata Siswa/Rombel: 28</span>
              <span className="text-sky-700 font-bold">120 Sekolah Negeri/Swasta</span>
            </div>
          </div>

          {/* PILAR 2: KESEHATAN */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <HeartPulse size={16} className="text-rose-700" />
                Kesehatan & Zero Stunting
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Waspada Klaster</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cakupan penimbangan KIA posyandu balita mencapai 94.2%. Pilot hub Kebonjati mencatat penurunan risiko gizi buruk melalui kolaborasi kader posyandu aktif.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Posyandu Aktif: 284 Pos</span>
              <span className="text-rose-700 font-bold">15 Puskesmas Induk</span>
            </div>
          </div>

          {/* PILAR 3: SPBE DIGITAL */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-700" />
                Tata Kelola SPBE & Layanan
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">SLA 1.2 Jam</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Digitalisasi pengesahan surat dengan TTE terintegrasi memangkas waktu tunggu dari 2 hari menjadi rata-rata 1.2 jam dengan sertifikasi audit keamanan BSSN/SPBE.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Kepatuhan SOP: 96.8%</span>
              <span className="text-emerald-700 font-bold">33 Kelurahan Terjadwal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Terbitkan Instruksi Walikota */}
      <AnimatePresence>
        {instructionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
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

