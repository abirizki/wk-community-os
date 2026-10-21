import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Phone, 
  ShieldCheck, 
  Layers, 
  Search, 
  ArrowRight, 
  HelpCircle, 
  RefreshCw, 
  Footprints, 
  AlertCircle, 
  Camera, 
  FileCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function DataMaturityPage() {
  const { user } = useAuth();
  const isWarga = user?.role === 'warga';
  const [activeTab, setActiveTab] = useState(isWarga ? 'profil_saya' : 'leaderboard'); // 'profil_saya' | 'leaderboard' | 'nudge' | 'anomalies'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data States
  const [myScore, setMyScore] = useState(null);
  const [kelurahanData, setKelurahanData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [nudgeList, setNudgeList] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [error, setError] = useState('');

  // Filter States
  const [selectedRw, setSelectedRw] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [kelRes, leadRes, scoreRes] = await Promise.allSettled([
        api.get('/completeness/kelurahan-index'),
        api.get('/completeness/rw-leaderboard'),
        api.get('/completeness/my-score')
      ]);

      if (kelRes.status === 'fulfilled' && kelRes.value?.data) {
        setKelurahanData(kelRes.value.data);
      }
      if (leadRes.status === 'fulfilled' && leadRes.value?.data) {
        setLeaderboard(leadRes.value.data);
      }
      if (scoreRes.status === 'fulfilled' && scoreRes.value?.data) {
        setMyScore(scoreRes.value.data);
      }

      // If user is RT / RW / Kelurahan staff, fetch nudge & anomalies
      if (['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'kader_posyandu'].includes(user?.role)) {
        const [nudgeRes, anomRes] = await Promise.allSettled([
          api.get('/completeness/door-to-door-nudge'),
          api.get('/completeness/anomalies')
        ]);
        if (nudgeRes.status === 'fulfilled' && nudgeRes.value?.data) {
          setNudgeList(nudgeRes.value.data);
        }
        if (anomRes.status === 'fulfilled' && anomRes.value?.data) {
          setAnomalies(anomRes.value.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data kematangan profil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleRecalculate = async () => {
    try {
      setRefreshing(true);
      await api.post('/completeness/recalculate-all');
      await fetchAllData();
    } catch (err) {
      alert('Gagal menyinkronkan data: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredNudge = nudgeList.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.nik.includes(searchQuery) ||
                          item.no_kk.includes(searchQuery);
    const matchesRw = selectedRw ? item.rw === selectedRw : true;
    return matchesSearch && matchesRw;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* HEADER UTAMA: DATA MATURITY INDEX & FIDELITY CONFIDENCE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl border border-blue-900/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles size={14} className="text-blue-400" />
              <span>Sistem Kematangan Data & Multi-Role AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Indeks Kematangan Data Profil Warga
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pemantauan kualitas data kependudukan berjenjang ($0 - 100\%$) Kelurahan Kebonjati. Menghadirkan AI Auto-Fill Surat bagi warga dan AI Door-to-Door Nudge bagi Ketua RT.
            </p>
          </div>

          {/* KPI Card Komposit */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15">
            <div className="text-center sm:text-left pr-4 sm:border-r border-white/20">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold block">Data Maturity</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {kelurahanData?.overall_maturity_score || 0}%
                </span>
                <span className="text-xs text-emerald-300 font-bold">Grade {kelurahanData?.maturity_grade || 'C'}</span>
              </div>
              <span className="text-[10px] text-blue-200/80 block mt-0.5">{kelurahanData?.maturity_level || 'Memuat...'}</span>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold block">Evidence Confidence</span>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-sm font-bold text-white">
                  {kelurahanData?.fidelity?.confidence_score || 85}% ({kelurahanData?.fidelity?.level || 'HIGH'})
                </span>
              </div>
              <p className="text-[10px] text-slate-300 max-w-[200px] mt-0.5 line-clamp-2">
                {kelurahanData?.fidelity?.explanation || 'Data akurat untuk perumusan kebijakan strategis.'}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metrik Cakupan Mini */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 text-xs">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            <Phone size={18} className="text-blue-400" />
            <div>
              <p className="font-semibold text-white">Cakupan WhatsApp: {kelurahanData?.coverage?.phone_percentage || 0}%</p>
              <p className="text-[11px] text-slate-300">Warga terhubung notifikasi seluler</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            <Users size={18} className="text-emerald-400" />
            <div>
              <p className="font-semibold text-white">Profil Sangat Lengkap: {kelurahanData?.total_excellent || 0} Jiwa</p>
              <p className="text-[11px] text-slate-300">Skor kelengkapan data &ge; 80%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            <Camera size={18} className="text-purple-400" />
            <div>
              <p className="font-semibold text-white">Foto Profil Resmi: {kelurahanData?.coverage?.photo_percentage || 0}%</p>
              <p className="text-[11px] text-slate-300">Telah mengunggah foto e-KTP/wajah</p>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS & ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 0: Skor Profil Warga (Personal Citizen Score) */}
          <button
            onClick={() => setActiveTab('profil_saya')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profil_saya'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Skor Profil Saya & Keluarga</span>
            {myScore?.total_score !== undefined && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                myScore.total_score >= 80 ? 'bg-emerald-500 text-white' : myScore.total_score >= 60 ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {myScore.total_score}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Award size={16} />
            <span>Peringkat RT (Leaderboard)</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {leaderboard.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('nudge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'nudge'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Footprints size={16} />
            <span>AI Door-to-Door Nudge</span>
            {nudgeList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                {nudgeList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('anomalies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'anomalies'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <AlertCircle size={16} />
            <span>AI Data Guardian (Anomali)</span>
            {anomalies.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                {anomalies.length}
              </span>
            )}
          </button>
        </div>

        {/* Action Button: Recalculate */}
        {['admin_kelurahan', 'superadmin'].includes(user?.role) && (
          <button
            onClick={handleRecalculate}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high text-xs font-semibold border border-outline-variant transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Menghitung...' : 'Sinkronkan Skor Massal'}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 0: SKOR PROFIL SAYA & KELUARGA (CITIZEN COMPLETENESS SCORE) */}
      {activeTab === 'profil_saya' && (
        <div className="space-y-6">
          {/* Main Score Hero Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-outline-variant">
              <div className="flex items-center gap-5">
                {/* Visual Radial Score */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-1 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <div className="w-full h-full bg-surface-container-lowest rounded-full flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-on-surface">
                      {myScore?.total_score ?? 85}%
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600">
                      Score
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      (myScore?.total_score ?? 85) >= 90 ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      (myScore?.total_score ?? 85) >= 75 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      (myScore?.total_score ?? 85) >= 50 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      Grade {myScore?.tier || ((myScore?.total_score ?? 85) >= 75 ? 'GOLD' : 'SILVER')}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      RT {user?.rt || '001'} / RW {user?.rw || '001'} &middot; Kelurahan Kebonjati
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-on-surface">
                    {user?.nama || 'Profil Warga Terdaftar'}
                  </h2>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {(myScore?.total_score ?? 85) >= 80 
                      ? 'Profil kependudukan Anda sangat lengkap. Anda berhak atas penerbitan surat otomatis dan verifikasi bansos instan.' 
                      : 'Lengkapi beberapa atribut kontak dan data keluarga di bawah ini untuk mencapai akurasi data 100%.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={handleRecalculate}
                  disabled={refreshing}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                  <span>Cek Ulang Skor</span>
                </button>
              </div>
            </div>

            {/* 4 Pilar Kematangan Data */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Layers size={14} className="text-blue-600" /> Rincian Capaian 4 Pilar Kelengkapan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pilar 1 */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-on-surface">1. Identitas Pokok</span>
                    <span className="font-mono font-bold text-blue-700">
                      {myScore?.pillars?.identitas?.score ?? 28} / 30 Pts
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${Math.round(((myScore?.pillars?.identitas?.score ?? 28) / 30) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-on-surface-variant block">NIK, Nama, TTL, Status Kawin, Domisili</span>
                </div>

                {/* Pilar 2 */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-on-surface">2. Kontak & Akun</span>
                    <span className="font-mono font-bold text-sky-700">
                      {myScore?.pillars?.kontak?.score ?? 20} / 25 Pts
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-sky-600 rounded-full" 
                      style={{ width: `${Math.round(((myScore?.pillars?.kontak?.score ?? 20) / 25) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-on-surface-variant block">No. WhatsApp, Email, Foto e-KTP, Akun</span>
                </div>

                {/* Pilar 3 */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-on-surface">3. KK & Desil Sosial</span>
                    <span className="font-mono font-bold text-amber-700">
                      {myScore?.pillars?.sosial?.score ?? 22} / 25 Pts
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-amber-600 rounded-full" 
                      style={{ width: `${Math.round(((myScore?.pillars?.sosial?.score ?? 22) / 25) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-on-surface-variant block">No. KK, Hub. Keluarga, Kuesioner Desil</span>
                </div>

                {/* Pilar 4 */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-on-surface">4. Kesehatan & Posyandu</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {myScore?.pillars?.kesehatan?.score ?? 15} / 20 Pts
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full" 
                      style={{ width: `${Math.round(((myScore?.pillars?.kesehatan?.score ?? 15) / 20) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-on-surface-variant block">Gol. Darah, Posyandu Balita / Lansia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Benchmark Komparasi Berjenjang (Warga -> RT -> RW -> Kelurahan) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-emerald-600" /> Posisi Skor Anda Terhadap Rata-Rata Wilayah Berjenjang
            </h3>
            <p className="text-xs text-on-surface-variant mb-5">
              Komparasi data profil Anda dibandingkan rata-rata kesiapan data di lingkungan RT, RW, dan Kelurahan Kebonjati.
            </p>

            <div className="space-y-4">
              {/* Tingkat Warga */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Skor Profil Anda ({user?.nama || 'Warga'})
                  </span>
                  <span className="font-mono">{myScore?.total_score ?? 85}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${myScore?.total_score ?? 85}%` }} />
                </div>
              </div>

              {/* Tingkat RT */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-teal-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Rata-Rata Rukun Tetangga (RT {user?.rt || '001'})
                  </span>
                  <span className="font-mono">78%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              {/* Tingkat RW */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-indigo-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Rata-Rata Rukun Warga (RW {user?.rw || '001'})
                  </span>
                  <span className="font-mono">81%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '81%' }} />
                </div>
              </div>

              {/* Tingkat Kelurahan */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Indeks Rata-Rata Kelurahan Kebonjati
                  </span>
                  <span className="font-mono">{kelurahanData?.overall_maturity_score ?? 87}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${kelurahanData?.overall_maturity_score ?? 87}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Wins Checklist */}
          {myScore?.missing_fields && myScore.missing_fields.length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2 mb-1">
                <CheckCircle2 size={16} className="text-amber-600" /> Langkah Cepat Melengkapi Data (+Poin Skor)
              </h3>
              <p className="text-xs text-on-surface-variant mb-4">
                Pilih aksi di bawah ini untuk meningkatkan skor kelengkapan menuju predikat PLATINUM (100%):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myScore.missing_fields.map((mf, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-low flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-on-surface block">{mf.label}</span>
                      <span className="text-[11px] text-amber-700 font-semibold font-mono">+{mf.weight} Poin Tambahan</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-[11px]">
                      Belum Terisi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: READINESS LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {/* 3 RT Terbaik Podium Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((rtItem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-between ${
                  idx === 0
                    ? 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border-amber-300'
                    : idx === 1
                    ? 'bg-gradient-to-br from-slate-400/10 via-slate-300/5 to-transparent border-slate-300'
                    : 'bg-gradient-to-br from-orange-400/10 via-orange-300/5 to-transparent border-orange-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Peringkat {rtItem.rank}
                    </span>
                    <h3 className="text-lg font-extrabold text-on-surface mt-0.5">
                      RT {rtItem.rt} / RW {rtItem.rw}
                    </h3>
                    <p className="text-xs text-primary font-semibold mt-0.5">{rtItem.badge}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-base shadow-md ${
                    idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : 'bg-orange-300 text-orange-950'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Rata-rata Skor:</span>
                    <span className="font-mono font-bold text-sm text-on-surface">{rtItem.skor_rata_rata}%</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        rtItem.skor_rata_rata >= 80 ? 'bg-emerald-500' : rtItem.skor_rata_rata >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${rtItem.skor_rata_rata}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>{rtItem.count_excellent} warga &ge; 80%</span>
                    <span>Total {rtItem.total_warga} jiwa</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabel Lengkap Semua RT */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Papan Peringkat Kesiapan Data Semua Rukun Tetangga</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Urutan berdasarkan rata-rata kelengkapan profil warga dan rasio kesiapan AI</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container text-on-surface-variant font-bold border-b border-outline-variant uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Peringkat</th>
                    <th className="py-3 px-4">Wilayah</th>
                    <th className="py-3 px-4">Total Warga</th>
                    <th className="py-3 px-4">Rata-rata Skor</th>
                    <th className="py-3 px-4">Sangat Lengkap (&ge;80%)</th>
                    <th className="py-3 px-4">Perlu Bantuan (&lt;50%)</th>
                    <th className="py-3 px-4">Status & Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {leaderboard.map((item) => (
                    <tr key={`${item.rw}-${item.rt}`} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-on-surface">
                        #{item.rank}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">
                        RT {item.rt} / RW {item.rw}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface">
                        {item.total_warga} Jiwa
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 max-w-[160px]">
                          <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.skor_rata_rata >= 80 ? 'bg-emerald-500' : item.skor_rata_rata >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                              }`} 
                              style={{ width: `${item.skor_rata_rata}%` }}
                            ></div>
                          </div>
                          <span className="font-mono font-bold text-on-surface text-xs">{item.skor_rata_rata}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> {item.count_excellent} warga ({item.persentase_lengkap}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">
                          {item.count_needs_help} warga
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          {item.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                        Belum ada data skor kelengkapan RT.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI DOOR-TO-DOOR NUDGE */}
      {activeTab === 'nudge' && (
        <div className="space-y-4">
          <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Footprints className="text-primary" size={18} />
                Daftar Prioritas Kunjungan Lapangan (AI Door-to-Door Nudge)
              </h3>
              <p className="text-on-surface-variant mt-0.5">
                AI mengidentifikasi {nudgeList.length} warga/keluarga yang memiliki kelengkapan data &lt; 50% atau kerentanan khusus untuk didampingi via RT Assisted Mode.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, No. KK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant text-xs outline-none focus:ring-1 focus:ring-primary w-48 sm:w-56"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNudge.map((item, idx) => (
              <motion.div
                key={item.nik || idx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">{item.nama}</h4>
                      <p className="font-mono text-[11px] text-on-surface-variant">NIK: {item.nik}</p>
                      <p className="text-[11px] text-on-surface-variant">No. KK: {item.no_kk} &bull; RT {item.rt}/RW {item.rw}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.priority === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.priority === 'HIGH' ? 'Prioritas Tinggi' : 'Perlu Diisi'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-rose-600" />
                      Alasan Kunjungan:
                    </p>
                    <p className="text-[11px] text-rose-900 leading-tight">{item.priority_reason}</p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-on-surface-variant font-semibold">Field Belum Lengkap:</span>
                    <ul className="text-[11px] text-on-surface space-y-0.5">
                      {item.missing_labels?.map((label, lIdx) => (
                        <li key={lIdx} className="flex items-center gap-1 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-on-surface-variant">Skor:</span>
                    <span className="font-mono font-bold text-rose-600">{item.score}%</span>
                  </div>
                  <button
                    onClick={() => alert(`Buka RT Assisted Mode untuk ${item.nama} (NIK: ${item.nik}). Fitur ini menghubungkan Anda langsung ke form pembaruan data.`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <span>Lengkapi Data</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredNudge.length === 0 && (
              <div className="col-span-full p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant text-on-surface-variant text-xs">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-sm text-on-surface">Tidak Ada Warga Prioritas Kunjungan</p>
                <p className="mt-1">Semua data warga dalam cakupan wilayah Anda telah memenuhi batas minimal kualitas data (&ge; 50%).</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AI DATA ANOMALY DETECTION */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant flex items-center justify-between text-xs">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={18} />
                AI Data Guardian (Deteksi Anomali & Inkonsistensi)
              </h3>
              <p className="text-on-surface-variant mt-0.5">
                Inference Engine AI memindai anomali biologis, duplikasi NIK, dan ketidaksinkronan data kependudukan secara real-time.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-mono font-bold text-xs">
              {anomalies.length} Temuan
            </span>
          </div>

          <div className="space-y-3">
            {anomalies.map((anom, idx) => (
              <div
                key={idx}
                className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      anom.severity === 'CRITICAL' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                        : anom.severity === 'HIGH' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {anom.severity}
                    </span>
                    <span className="font-bold text-on-surface">{anom.type}</span>
                    <span className="text-on-surface-variant font-mono">&bull; NIK: {anom.nik} &bull; RT {anom.rt}/RW {anom.rw}</span>
                  </div>
                  <p className="font-semibold text-rose-700">{anom.issue}</p>
                  <p className="text-slate-600 text-[11px]"><span className="font-bold">Rekomendasi AI:</span> {anom.recommendation}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alert(`Tindakan koreksi untuk warga ${anom.nama} (NIK: ${anom.nik}) telah dijadwalkan ke meja verifikasi RT.`)}
                    className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container transition-colors"
                  >
                    Verifikasi Lapangan
                  </button>
                </div>
              </div>
            ))}

            {anomalies.length === 0 && (
              <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant text-on-surface-variant text-xs">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-sm text-on-surface">Data Bersih dan Konsisten</p>
                <p className="mt-1">Tidak ditemukan anomali format NIK, tanggal lahir masa depan, atau ketidaksesuaian susunan keluarga.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

