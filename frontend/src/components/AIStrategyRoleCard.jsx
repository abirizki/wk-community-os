/**
 * frontend/src/components/AIStrategyRoleCard.jsx
 * Kanaya AI Strategy & Tactical Governance Decision Support Card
 * Disesuaikan khusus untuk role ketua_rt dan ketua_rw (Non-Posyandu)
 * Menampilkan indikator tata kelola, keuangan iuran, bansos, kepatuhan PBB, dan aduan lingkungan
 * Bumi Warga - Jabar Pintar Digital
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Users,
  FileCheck2,
  Clock,
  ChevronRight,
  RefreshCw,
  Home,
  MessageSquareQuote
} from 'lucide-react';
import { api } from '../utils/api';

export default function AIStrategyRoleCard({
  role = 'ketua_rt', // 'ketua_rt' | 'ketua_rw'
  scope = {},
  className = ''
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    iuranRate: null,
    iuranLunas: 0,
    iuranTotal: 0,
    kasSaldo: null,
    pbbVerifRate: null,
    pbbVerifCount: 0,
    pbbTotalCount: 0,
    bansosDesilCovered: null,
    bansosEligibleWarga: 0,
    bansosUncoveredWarga: 0,
    aduanSlaHours: 24,
    aduanPending: 0,
    aduanResolved: 0,
    kontrakanTerdata: 0,
    rtBinaanCount: 1
  });

  const rtScope = scope.rt || '001';
  const rwScope = scope.rw || '001';

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [kasRes, pbbRes, aduanRes] = await Promise.allSettled([
        api.get(`/keuangan/rekap?rw=${rwScope}${role === 'ketua_rt' ? `&rt=${rtScope}` : ''}`),
        api.get(`/pbb?limit=50&rw=${rwScope}${role === 'ketua_rt' ? `&rt=${rtScope}` : ''}`),
        api.get(`/pengaduan?status=SEMUA`)
      ]);

      let calculatedKasSaldo = null;
      let calculatedIuranRate = null;
      let calculatedIuranLunas = 0;
      let calculatedIuranTotal = 0;

      if (kasRes.status === 'fulfilled' && kasRes.value?.data?.data) {
        const kasData = kasRes.value.data.data;
        if (kasData.saldo !== undefined && kasData.saldo !== null) calculatedKasSaldo = kasData.saldo;
        if (kasData.persentase_lunas !== undefined && kasData.persentase_lunas !== null) {
          calculatedIuranRate = Math.round(kasData.persentase_lunas);
        }
        if (kasData.total_kk_lunas !== undefined) calculatedIuranLunas = kasData.total_kk_lunas;
        if (kasData.total_kk !== undefined) calculatedIuranTotal = kasData.total_kk;
      }

      let calculatedPbbRate = null;
      let calculatedPbbVerif = 0;
      let calculatedPbbTotal = 0;
      if (pbbRes.status === 'fulfilled' && pbbRes.value?.data?.data) {
        const pbbItems = pbbRes.value.data.data;
        if (Array.isArray(pbbItems) && pbbItems.length > 0) {
          calculatedPbbTotal = pbbItems.length;
          calculatedPbbVerif = pbbItems.filter(p => p.status_pembayaran === 'PAID' || p.verifikasi_rt === 'VALID' || p.verifikasi_rt === 1).length;
          calculatedPbbRate = Math.round((calculatedPbbVerif / calculatedPbbTotal) * 100);
        }
      }

      let pendingAduan = 0;
      let resolvedAduan = 0;
      if (aduanRes.status === 'fulfilled' && aduanRes.value?.data?.data) {
        const aduanItems = aduanRes.value.data.data;
        if (Array.isArray(aduanItems)) {
          pendingAduan = aduanItems.filter(a => a.status === 'MENUNGGU' || a.status === 'DIPROSES').length;
          resolvedAduan = aduanItems.filter(a => a.status === 'SELESAI').length;
        }
      }

      setData(prev => ({
        ...prev,
        iuranRate: calculatedIuranRate,
        iuranLunas: calculatedIuranLunas,
        iuranTotal: calculatedIuranTotal,
        kasSaldo: calculatedKasSaldo,
        pbbVerifRate: calculatedPbbRate,
        pbbVerifCount: calculatedPbbVerif,
        pbbTotalCount: calculatedPbbTotal,
        aduanPending: pendingAduan,
        aduanResolved: resolvedAduan
      }));
    } catch (err) {
      console.warn('AIStrategyRoleCard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, rtScope, rwScope]);

  const isRT = role === 'ketua_rt';
  const unpaidKK = data.iuranTotal > data.iuranLunas ? data.iuranTotal - data.iuranLunas : 0;
  const unverifiedPBB = data.pbbTotalCount > data.pbbVerifCount ? data.pbbTotalCount - data.pbbVerifCount : 0;

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/20 to-white p-5 sm:p-6 shadow-xs ${className}`}>
      {/* Header Bar */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-sky-800 border border-sky-200 uppercase">
                <ShieldCheck className="h-3 w-3 text-sky-600" />
                Kanaya AI Strategic Support
              </span>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">
                {isRT ? `Lingkup RT ${rtScope} / RW ${rwScope}` : `Lingkup Wilayah RW ${rwScope}`}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 mt-0.5">
              {isRT ? 'Tata Kelola & Resiliensi Rukun Tetangga' : 'Tata Kelola & Koordinasi Kewilayahan Rukun Warga'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {isRT 
                ? 'Analitik faktual keuangan kas, kepatuhan PBB, dan respon aduan lingkungan berbasis data lapangan.'
                : 'Pemerataan jaring pengaman, konsolidasi kas wilayah, dan pemantauan tindak lanjut aduan warga.'}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={fetchData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 min-h-[38px] text-xs font-bold text-slate-700 shadow-xs transition hover:bg-sky-50 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            title="Segarkan Indikator AI"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>Perbarui Analitik</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars Strategic Grid */}
      <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Pilar 1: Keuangan & Iuran */}
        <div className="rounded-2xl border-2 border-slate-200/90 bg-white p-3.5 shadow-[0_3px_0_0_#cbd5e1] hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isRT ? 'Kolektibilitas Iuran' : 'Kas Wilayah'}
            </span>
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600 border border-sky-100">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {isRT 
                ? (data.iuranRate !== null ? `${data.iuranRate}%` : '-') 
                : (data.kasSaldo !== null ? `Rp ${(data.kasSaldo / 1000000).toFixed(1)}jt` : '-')}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {isRT 
                ? (data.iuranTotal > 0 ? `${data.iuranLunas}/${data.iuranTotal} KK` : 'Belum Ada Data') 
                : (data.kasSaldo !== null ? 'Saldo Tercatat' : 'Belum Rekap')}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-600 transition-all duration-500"
              style={{ width: `${Math.min(100, isRT ? (data.iuranRate || 0) : 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            {data.iuranRate !== null 
              ? (data.iuranRate >= 80 ? 'Penerimaan iuran kas berjalan tertib' : 'Perlu pemantauan iuran bulan berjalan')
              : 'Menunggu pencatatan kas buku berjalan'}
          </p>
        </div>

        {/* Pilar 2: Bansos & Inklusi Sosial */}
        <div className="rounded-2xl border-2 border-slate-200/90 bg-white p-3.5 shadow-[0_3px_0_0_#cbd5e1] hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isRT ? 'Verifikasi Bansos' : 'Supervisi Desil'}
            </span>
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600 border border-sky-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              Ground Check
            </span>
            <span className="text-[10px] font-bold text-sky-700">Aktif</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-sky-600 transition-all duration-500" style={{ width: '100%' }} />
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            {isRT ? 'Verifikasi faktual calon penerima desil 1-2' : 'Koordinasi usulan bansos berkeadilan'}
          </p>
        </div>

        {/* Pilar 3: PBB & Kepatuhan Lapangan */}
        <div className="rounded-2xl border-2 border-slate-200/90 bg-white p-3.5 shadow-[0_3px_0_0_#cbd5e1] hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isRT ? 'Verifikasi PBB-P2' : 'Ketertiban PBB'}
            </span>
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600 border border-sky-100">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {data.pbbVerifRate !== null ? `${data.pbbVerifRate}%` : '-'}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {data.pbbTotalCount > 0 ? `${data.pbbVerifCount}/${data.pbbTotalCount} SPPT` : 'Belum Ada SPPT'}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-600 transition-all duration-500"
              style={{ width: `${Math.min(100, data.pbbVerifRate || 0)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            {data.pbbVerifRate !== null ? 'Objek pajak terkonfirmasi NIK pemohon' : 'Menunggu data SPPT dari Bapenda'}
          </p>
        </div>

        {/* Pilar 4: Respon Aduan Warga */}
        <div className="rounded-2xl border-2 border-slate-200/90 bg-white p-3.5 shadow-[0_3px_0_0_#cbd5e1] hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isRT ? 'Aduan Warga' : 'Eskalasi Masalah'}
            </span>
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600 border border-sky-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {data.aduanPending > 0 ? `${data.aduanPending} Aktif` : 'Nihil'}
            </span>
            <span className="text-[10px] font-bold text-emerald-700">
              {data.aduanResolved} Selesai
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-sky-600 transition-all duration-500" style={{ width: '100%' }} />
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            {data.aduanPending > 0 ? `${data.aduanPending} tiket memerlukan tindak lanjut` : 'Tidak ada aduan warga tertahan'}
          </p>
        </div>
      </div>

      {/* AI Prescriptive Tactical Insights */}
      <div className="relative mt-4 rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-600 text-white text-[11px]">
            ⚡
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Tindakan Prioritas Wilayah ({isRT ? 'Ketua RT' : 'Ketua RW'})
          </h4>
        </div>

        <div className="space-y-2">
          {isRT ? (
            <>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                  1
                </span>
                <p>
                  <strong>Verifikasi Pelayanan Surat:</strong> Pastikan seluruh permohonan pengantar surat ditinjau tepat waktu sesuai SOP pelayanan 24 jam.
                </p>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                  2
                </span>
                <p>
                  <strong>Pemeriksaan Lapangan Kelompok Rentan:</strong> Verifikasi data lansia sebatang kara dan anak yatim agar terdaftar pada radar perlindungan sosial kelurahan.
                </p>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                  3
                </span>
                <p>
                  <strong>Ketertiban Hunian & Domisili:</strong> Laporkan warga pendatang baru atau penghuni kontrakan untuk pemutakhiran data kependudukan berkala.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                  1
                </span>
                <p>
                  <strong>Supervisi Bansos & Kesejahteraan:</strong> Evaluasi pemerataan usulan bantuan sosial antar-RT agar tepat sasaran bagi keluarga desil 1-2.
                </p>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                  2
                </span>
                <p>
                  <strong>Koordinasi Kas & Fasilitas RW:</strong> Pastikan transparansi laporan operasional pos kamling dan kebersihan lingkungan antar pengurus RT.
                </p>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                  3
                </span>
                <p>
                  <strong>Kamtibmas Wilayah:</strong> Monitoring stabilitas ketertiban hunian sewa dan mitigasi cepat terhadap aduan lingkungan warga.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
