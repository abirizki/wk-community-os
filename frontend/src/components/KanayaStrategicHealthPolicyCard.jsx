/**
 * frontend/src/components/KanayaStrategicHealthPolicyCard.jsx
 * Reusable Executive Health Policy Radar & Decision Support Card
 * Evidence-Based Life-Cycle Health (1000 HPK, Stunting & Geriatri)
 * Dapat dipasang di: Dashboard Lurah, Dashboard RW, Dashboard RT, dan Posyandu Page
 * Bumi Warga - Jabar Pintar Digital
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Baby, 
  Heart, 
  HeartPulse, 
  Activity, 
  ChevronRight, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { api } from '../utils/api';

export default function KanayaStrategicHealthPolicyCard({
  role = 'aparatur',
  scope = {},
  metrics: incomingMetrics = null,
  compact = false,
  className = ''
}) {
  const [loading, setLoading] = useState(!incomingMetrics);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState(incomingMetrics || {
    totalBalita: 0,
    sudahTimbangBalita: 0,
    persenTimbangBalita: 0,
    balitaGiziKurang: 0,
    totalBumil: 0,
    bumilKek: 0,
    totalLansia: 0,
    lansiaRisiko: 0
  });

  const rtScope = scope.rt || '';
  const rwScope = scope.rw || '';
  const kelurahanScope = scope.kelurahan || 'Kebonjati';

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (rtScope && rtScope !== 'all') params.append('rt', rtScope);
      if (rwScope && rwScope !== 'all') params.append('rw', rwScope);

      const [balitaRes, lansiaRes, targetBalitaRes, targetBumilRes] = await Promise.allSettled([
        api.get(`/posyandu/balita/stats?${params}`),
        api.get(`/posyandu/lansia/stats?${params}`),
        api.get(`/posyandu/warga-target?category=balita&${params}`),
        api.get(`/posyandu/warga-target?category=bumil&${params}`)
      ]);

      const bStats = balitaRes.status === 'fulfilled' && balitaRes.value?.data ? balitaRes.value.data : {};
      const lStats = lansiaRes.status === 'fulfilled' && lansiaRes.value?.data ? lansiaRes.value.data : {};
      const tBalita = targetBalitaRes.status === 'fulfilled' && Array.isArray(targetBalitaRes.value?.data) ? targetBalitaRes.value.data : [];
      const tBumil = targetBumilRes.status === 'fulfilled' && Array.isArray(targetBumilRes.value?.data) ? targetBumilRes.value.data : [];

      const totalBalita = Number(bStats.total_balita || tBalita.length || 0);
      const sudahTimbang = tBalita.filter(b => b.sudah_ditimbang_bulan_ini === 1).length;
      const persenTimbang = totalBalita > 0 ? Math.round((sudahTimbang / totalBalita) * 100) : (totalBalita > 0 ? 85 : 0);
      const giziKurang = Number(bStats.berisiko_stunting || tBalita.filter(b => b.last_status_gizi === 'Gizi Kurang' || b.last_status_gizi === 'Gizi Buruk').length || 0);

      const totalBumil = tBumil.length;
      const bumilKek = tBumil.filter(b => b.status_kek === 'Risiko KEK' || (b.lila_cm && b.lila_cm < 23.5)).length;

      const totalLansia = Number(lStats.total_lansia || 0);
      const lansiaRisiko = Number(lStats.total_hipertensi || 0) + Number(lStats.total_diabetes || 0);

      setMetrics({
        totalBalita,
        sudahTimbangBalita: sudahTimbang,
        persenTimbangBalita: persenTimbang,
        balitaGiziKurang: giziKurang,
        totalBumil,
        bumilKek,
        totalLansia,
        lansiaRisiko
      });
    } catch (err) {
      console.warn('[KanayaStrategicHealthPolicyCard] Fetch error, keeping defaults:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!incomingMetrics) {
      fetchMetrics();
    } else {
      setMetrics(incomingMetrics);
      setLoading(false);
    }
  }, [incomingMetrics, rtScope, rwScope]);

  // Scope label formatting
  const scopeLabel = React.useMemo(() => {
    if (role === 'ketua_rt') {
      return `Wilayah RT ${rtScope || '—'} / RW ${rwScope || '—'}`;
    }
    if (role === 'ketua_rw' || role === 'admin_rw') {
      return `Wilayah RW ${rwScope || '—'} · Komparasi Antar-RT`;
    }
    if (['lurah', 'admin_kelurahan', 'admin', 'camat'].includes(role)) {
      return `Kelurahan ${kelurahanScope} · Zero Stunting`;
    }
    return `Wilayah Binaan Posyandu Terintegrasi`;
  }, [role, rtScope, rwScope, kelurahanScope]);

  // Storytelling narrative brief
  const narrative = React.useMemo(() => {
    const dPersen = metrics.persenTimbangBalita || 0;
    const bKurang = metrics.balitaGiziKurang || 0;
    const bKek = metrics.bumilKek || 0;
    const lRentan = metrics.lansiaRisiko || 0;

    if (role === 'ketua_rt') {
      return `Cakupan penimbangan balita RT Anda tercatat ${dPersen}%. Terdapat ${bKurang} balita perlu pemantauan PMT, ${bKek} ibu hamil terindikasi risiko KEK, serta ${lRentan} lansia memerlukan kunjungan tensi berkala.`;
    }
    if (role === 'ketua_rw' || role === 'admin_rw') {
      return `Agregasi Posyandu RW Anda mencatat ${dPersen}% balita telah ditimbang. ${bKurang} balita dalam pengawasan gizi intensif dan ${bKek} ibu hamil risiko KEK diprioritaskan untuk bansos nutrisi RW.`;
    }
    if (role === 'lurah') {
      return `Intervensi Zero Stunting Kelurahan ${kelurahanScope}: ${dPersen}% balita terdata dalam Buku KIA Digital. Terdapat ${bKurang} balita gizi kurang di klaster teritorial dan ${bKek} bumil KEK sasaran 1000 HPK aktif.`;
    }
    return `Pemantauan siklus hidup 1000 HPK & Geriatri: ${dPersen}% balita ditimbang, ${bKurang} balita perhatian gizi, ${bKek} bumil KEK, dan ${lRentan} lansia komorbid terpantau.`;
  }, [role, metrics, kelurahanScope]);

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-white border border-teal-200/70 shadow-xs relative overflow-hidden transition-all ${className}`}>
      {/* Decorative Blur Orbs */}
      <div className="absolute right-0 top-0 w-40 h-40 bg-teal-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-32 h-32 bg-emerald-300/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-teal-100/90 text-teal-800 text-[10px] font-extrabold uppercase tracking-wider border border-teal-200">
                Kanaya AI Strategic Health Policy
              </span>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">
                {scopeLabel}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
              Radar Deteksi Dini 1000 HPK & Kesehatan Geriatri
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchMetrics}
          disabled={refreshing}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white/90 hover:bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/80 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          title="Perbarui data radar kesehatan"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Narrative Storytelling */}
      <div className="relative z-10 mt-3 pt-2.5 border-t border-teal-100/80">
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {loading ? (
            <span className="flex items-center gap-2 text-teal-700">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mengkalkulasi radar kesehatan siklus hidup...
            </span>
          ) : (
            narrative
          )}
        </p>
      </div>

      {/* 4 Micro KPI Pills */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-teal-100/60">
        {/* Pill 1: Cakupan Timbang */}
        <div className="p-2 rounded-xl bg-white/95 border border-teal-100 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500">Cakupan Timbang (D/S)</span>
            <Baby size={13} className="text-teal-600" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-teal-800 font-mono mt-0.5">
            {metrics.persenTimbangBalita}% <span className="text-[10px] text-slate-400 font-normal">({metrics.sudahTimbangBalita || 0}/{metrics.totalBalita || 0})</span>
          </span>
        </div>

        {/* Pill 2: Perhatian Gizi Balita */}
        <div className="p-2 rounded-xl bg-white/95 border border-teal-100 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500">Perhatian Gizi</span>
            <Activity size={13} className="text-rose-600" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-rose-600 font-mono mt-0.5">
            {metrics.balitaGiziKurang || 0} <span className="text-[10px] text-slate-500 font-normal">anak</span>
          </span>
        </div>

        {/* Pill 3: Bumil Risiko KEK */}
        <div className="p-2 rounded-xl bg-white/95 border border-teal-100 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500">Bumil Risiko KEK</span>
            <Heart size={13} className="text-amber-600" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-amber-700 font-mono mt-0.5">
            {metrics.bumilKek || 0} <span className="text-[10px] text-slate-400 font-normal">ibu (LILA &lt; 23.5)</span>
          </span>
        </div>

        {/* Pill 4: Lansia Berisiko / PTM */}
        <div className="p-2 rounded-xl bg-white/95 border border-teal-100 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500">Lansia Risiko PTM</span>
            <HeartPulse size={13} className="text-purple-600" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-purple-700 font-mono mt-0.5">
            {metrics.lansiaRisiko || 0} <span className="text-[10px] text-slate-500 font-normal">jiwa komorbid</span>
          </span>
        </div>
      </div>

      {/* Action Footer */}
      {!compact && (
        <div className="relative z-10 mt-3 pt-2.5 border-t border-teal-100/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck size={12} className="text-teal-600" />
            Terhubung Master KIA, DTSEN Desil & Rekam Medis Posyandu
          </span>
          <Link
            to="/dashboard/posyandu"
            className="inline-flex items-center gap-1 font-bold text-teal-800 hover:text-teal-950 transition-colors"
          >
            <span>Buka Modul Posyandu</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
