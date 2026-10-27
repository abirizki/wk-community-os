/**
 * frontend/src/components/design-system/AIStrategyInsightEngine.jsx
 * AI Strategy & Strategic Decision Support Engine
 * 
 * Karakteristik:
 * - Menampilkan komparasi beban layanan saat ini (T) vs proyeksi tahun mendatang (T+1)
 * - Neraca daya tampung riil wilayah (Pendidikan PPDB, Kesehatan 1000 HPK, Desil DTKS, Ketenagakerjaan)
 * - Rekomendasi kebijakan preskriptif instan (Decision Support) dalam bahasa birokrasi resmi
 * - Ditempatkan tepat di bawah Hero Section pada dashboard pimpinan wilayah
 * Soft Sky Civic Utility Theme | Bumi Warga - Jabar Pintar Digital
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  GraduationCap,
  HeartPulse,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Compass,
  ShieldCheck,
  ChevronRight,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

const ICON_BY_SECTOR = {
  PENDIDIKAN: GraduationCap,
  KESEHATAN: HeartPulse,
  PERLINDUNGAN_SOSIAL: Users,
  KETENAGAKERJAAN: TrendingUp,
};

const COLOR_MAP = {
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-900',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    accent: 'bg-rose-600 text-white',
    ring: 'border-l-4 border-l-rose-500'
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    accent: 'bg-emerald-600 text-white',
    ring: 'border-l-4 border-l-emerald-500'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    accent: 'bg-amber-600 text-white',
    ring: 'border-l-4 border-l-amber-500'
  },
  blue: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-900',
    badge: 'bg-sky-100 text-sky-800 border-sky-300',
    accent: 'bg-sky-600 text-white',
    ring: 'border-l-4 border-l-sky-500'
  }
};

export default function AIStrategyInsightEngine({
  scope = {},
  title = 'AI Strategy: Rekomendasi Kebijakan & Daya Dukung Wilayah',
  subtitle = 'Analisis prediktif kohort tahun depan (T+1) vs kapasitas riil layanan pendidikan, kesehatan, dan perlindungan sosial',
  defaultExpanded = true,
  className = ''
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const loadStrategyData = async () => {
    try {
      setError(null);
      const params = {};
      if (scope.rw) params.rw = scope.rw;
      if (scope.rt) params.rt = scope.rt;

      const res = await api.get('/fasilitas/ai-strategy', { params });
      if (res && res.data && res.data.data) {
        setData(res.data.data);
      } else if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('Gagal memuat analitik AI strategy:', err.message);
      setError('Belum dapat memuat proyeksi AI strategy.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStrategyData();
  }, [scope.rw, scope.rt]);

  const insights = data?.executive_insights || [];
  const indexDayaDukung = data?.index_daya_dukung || { score: 82, status: 'MEMADAI', color: 'blue' };

  const filteredInsights = insights.filter(item => {
    if (selectedFilter === 'ALL') return true;
    return item.sektor === selectedFilter;
  });

  return (
    <div className={`bg-white rounded-3xl border border-sky-200/90 shadow-sm overflow-hidden ${className}`}>
      {/* 1. Header Banner AI Strategy */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white p-5 sm:p-6 relative">
        <div className="absolute right-0 top-0 w-72 h-72 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-[10px] font-black uppercase tracking-wider">
                <Sparkles size={12} className="text-sky-300 animate-pulse" />
                <span>AI Strategy & Decision Support Engine</span>
              </span>
              <span className="text-[11px] text-slate-300 font-mono">
                Siklus Perencanaan T vs T+1
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              {title}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Indeks Daya Dukung & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2.5">
              <Compass size={18} className="text-sky-400" />
              <div>
                <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">
                  Indeks Daya Dukung
                </div>
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{indexDayaDukung.score}%</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30">
                    {indexDayaDukung.status}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setRefreshing(true); loadStrategyData(); }}
              disabled={refreshing || loading}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20 cursor-pointer"
              title="Perbarui Rekomendasi AI"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* 2. Sektor Filter Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'Semua Wawasan', icon: Layers },
            { id: 'PENDIDIKAN', label: 'Pendidikan & PPDB T+1', icon: GraduationCap },
            { id: 'KESEHATAN', label: 'Kesehatan & 1000 HPK', icon: HeartPulse },
            { id: 'PERLINDUNGAN_SOSIAL', label: 'Bansos & Desil', icon: Users },
            { id: 'KETENAGAKERJAAN', label: 'Ketenagakerjaan Muda', icon: TrendingUp },
          ].map(tab => {
            const IconComponent = tab.icon;
            const active = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10'
                }`}
              >
                <IconComponent size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Cards Body */}
      <div className="p-5 sm:p-6 bg-slate-50/50">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw size={24} className="animate-spin text-sky-600" />
            <p className="text-xs font-semibold">Menganalisis pipa kohort demografi dan daya tampung wilayah...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Tidak ada rekomendasi kritis untuk filter yang dipilih saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredInsights.map(item => {
              const IconComp = ICON_BY_SECTOR[item.sektor] || Sparkles;
              const colorTheme = COLOR_MAP[item.badge_color] || COLOR_MAP.blue;
              const numbers = item.ringkasan_angka || {};

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all ${colorTheme.ring}`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Sektor, Badge & Urgensi */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl ${colorTheme.bg} ${colorTheme.text} flex items-center justify-center border ${colorTheme.border}`}>
                          <IconComp size={16} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                          {item.sektor.replace('_', ' ')}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${colorTheme.badge}`}>
                        {item.badge_status}
                      </span>
                    </div>

                    {/* Judul Strategis */}
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {item.judul}
                    </h3>

                    {/* 4-Box Neraca Komparasi Beban vs Daya Dukung */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-1">
                      {/* Box 1: Beban Tahun Berjalan (T) */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                          {numbers.tahun_ini_label || 'Tahun Ini (T)'}
                        </div>
                        <div className="text-xs font-black text-slate-800 mt-0.5">
                          {numbers.tahun_ini_value || '-'}
                        </div>
                      </div>

                      {/* Box 2: Proyeksi Tahun Datang (T+1) */}
                      <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/80">
                        <div className="text-[9px] font-bold text-sky-800 uppercase tracking-tight flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{numbers.tahun_depan_label || 'Tahun Depan (T+1)'}</span>
                        </div>
                        <div className="text-xs font-black text-sky-950 mt-0.5">
                          {numbers.tahun_depan_value || '-'}
                        </div>
                      </div>

                      {/* Box 3: Kapasitas Layanan Riil Wilayah */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                          {numbers.daya_dukung_label || 'Daya Tampung'}
                        </div>
                        <div className="text-xs font-black text-slate-800 mt-0.5">
                          {numbers.daya_dukung_value || '-'}
                        </div>
                      </div>

                      {/* Box 4: Keseimbangan Neraca (Surplus/Defisit) */}
                      <div className={`p-2.5 rounded-xl ${colorTheme.bg} border ${colorTheme.border}`}>
                        <div className={`text-[9px] font-bold uppercase tracking-tight ${colorTheme.text}`}>
                          {numbers.neraca_label || 'Neraca Keseimbangan'}
                        </div>
                        <div className={`text-xs font-black mt-0.5 ${colorTheme.text}`}>
                          {numbers.neraca_value || '-'}
                        </div>
                      </div>
                    </div>

                    {/* Temuan Kritis Evidence */}
                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                      <div className="font-bold text-[10px] uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                        <Info size={12} className="text-sky-600" />
                        <span>Fakta Temuan Demografi:</span>
                      </div>
                      <p>{item.temuan_kritis}</p>
                    </div>

                    {/* Rekomendasi Kebijakan AI Strategy */}
                    <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200 text-xs text-sky-950 leading-relaxed">
                      <div className="font-extrabold text-[10px] uppercase text-sky-800 tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-sky-600" />
                        <span>Rekomendasi Kebijakan AI Strategy:</span>
                      </div>
                      <p className="font-medium text-slate-800">{item.rekomendasi_kebijakan}</p>
                    </div>
                  </div>

                  {/* Tombol Aksi Cepat */}
                  {item.aksi_cepat && (
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Pintasan Kebijakan
                      </span>

                      <Link
                        to={item.aksi_cepat.link || '/dashboard'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <span>{item.aksi_cepat.label}</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

