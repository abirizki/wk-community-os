/**
 * frontend/src/pages/PBBPage.jsx
 * Modul Terpadu Pajak Bumi dan Bangunan (PBB-P2)
 * 1. Admin Kelurahan: Rekonsiliasi Makro, Upload Masal Data DHKP PBB (CSV Template Baku), Broadcast Push Reminder
 * 2. Ketua RT/RW: Meja Verifikasi Lapangan (Konfirmasi Lunas, Catatan Rumah Sewa/Pindah, Trigger Notifikasi Warga)
 * 3. Warga: Kartu Tagihan Digital, Notifikasi Tagihan Rilis, dan Tanda Lunas Resmi
 * Bumi Warga - Jabar Pintar Digital
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Search,
  Filter,
  ShieldCheck,
  CreditCard,
  Building2,
  Eye,
  UserCheck,
  Clock,
  Layers,
  X,
  FileSpreadsheet,
  AlertCircle,
  Home,
  Users
} from 'lucide-react';

export default function PBBPage() {
  const { user } = useAuth();
  const normalizedRole = user?.role === 'admin' ? 'admin_kelurahan' : (user?.role || 'warga');
  const isAdminKelurahan = ['admin_kelurahan', 'admin', 'superadmin', 'lurah', 'staf_kelurahan'].includes(normalizedRole);
  const isRT = normalizedRole === 'ketua_rt';
  const isRW = ['ketua_rw', 'admin_rw'].includes(normalizedRole);
  const isOfficer = isAdminKelurahan || isRT || isRW;

  // Active View Tab for Kelurahan / RT
  const [activeTab, setActiveTab] = useState(isAdminKelurahan ? 'rekonsiliasi' : isOfficer ? 'verifikasi_rt' : 'warga');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionToast, setActionToast] = useState('');

  // 1. Data States: Warga Pribadi
  const [myPbbData, setMyPbbData] = useState([]);
  const [processingNop, setProcessingNop] = useState(null);

  // 2. Data States: Kelurahan Summary & RW Breakdown
  const [pbbSummary, setPbbSummary] = useState(null);

  // 3. Data States: Daftar PBB Terfilter (Kelurahan & RT/RW)
  const [pbbList, setPbbList] = useState([]);
  const [filters, setFilters] = useState({
    rw: isRT || isRW ? (user?.rw || '001') : '',
    rt: isRT ? (user?.rt || '001') : '',
    status: 'ALL',
    tahun: '2026',
    search: ''
  });

  // 4. Modal State: Upload Masal CSV DHKP (Kelurahan)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [dryRunErrors, setDryRunErrors] = useState([]);
  const [kirimNotifOtomatis, setKirimNotifOtomatis] = useState(true);
  const [submittingUpload, setSubmittingUpload] = useState(false);

  // 5. Modal State: Verifikasi Lapangan RT
  const [selectedPbbForVerify, setSelectedPbbForVerify] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    status_pembayaran: 'PAID',
    catatan_rt: 'Sudah lunas ditunjukkan bukti setor / bank ke RT'
  });
  const [submittingVerify, setSubmittingVerify] = useState(false);

  // Format Mata Uang Rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  // Fetch Data Sesuai Peran
  const loadPbbData = async () => {
    try {
      setRefreshing(true);
      if (!isOfficer) {
        // Mode Warga
        const res = await api.get('/pbb/me');
        if (res.success) setMyPbbData(res.data || []);
      } else {
        // Mode Petugas (Kelurahan & RT/RW)
        const [sumRes, listRes] = await Promise.allSettled([
          api.get('/pbb/summary'),
          api.get(`/pbb/list?rw=${filters.rw}&rt=${filters.rt}&status=${filters.status}&tahun=${filters.tahun}&search=${filters.search}`)
        ]);

        if (sumRes.status === 'fulfilled' && sumRes.value?.success) {
          setPbbSummary(sumRes.value.data);
        }
        if (listRes.status === 'fulfilled' && listRes.value?.success) {
          setPbbList(listRes.value.data || []);
        }
      }
    } catch (err) {
      console.warn('[PBBPage] Load err:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPbbData();
  }, [filters.rw, filters.rt, filters.status, filters.tahun]);

  // Handle Pembayaran Mandiri Warga
  const handlePayWarga = async (nop, tahun) => {
    const key = `${nop}-${tahun}`;
    setProcessingNop(key);
    try {
      await api.put('/pbb/pay', { nop, tahun });
      setActionToast(`Tagihan NOP ${nop} berhasil dilunasi!`);
      setTimeout(() => setActionToast(''), 3500);
      loadPbbData();
    } catch (err) {
      alert(err.message || 'Gagal memproses pembayaran');
    } finally {
      setProcessingNop(null);
    }
  };

  // Handle Download Template CSV Baku
  const handleDownloadTemplate = () => {
    window.open('/api/pbb/download/template', '_blank');
  };

  // Parse & Validate Dry-Run File CSV
  const handleDryRunCsv = (rawText) => {
    setCsvContent(rawText);
    const lines = rawText.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setDryRunErrors(['File CSV kosong atau hanya berisi baris judul header']);
      setParsedRows([]);
      return;
    }

    const rows = [];
    const errs = [];

    // Baris ke-0 adalah Header
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      const [nop, nik_warga, nama_wajib_pajak, alamat_objek_pajak, rt, rw, tahunPajak, nominal, jatuhTempo, statusBayar] = parts;

      if (!nop) {
        errs.push(`Baris ${i + 1}: NOP tidak boleh kosong`);
        continue;
      }
      if (!nik_warga || nik_warga.length < 16) {
        errs.push(`Baris ${i + 1}: NIK wajib 16 digit (Ditemukan: "${nik_warga || 'kosong'}")`);
        continue;
      }

      rows.push({
        nop,
        nik_warga,
        nama_wajib_pajak: nama_wajib_pajak || 'Wajib Pajak',
        alamat_objek_pajak: alamat_objek_pajak || 'Kelurahan Kebonjati',
        rt: rt || '001',
        rw: rw || '001',
        tahun: parseInt(tahunPajak, 10) || 2026,
        nominal: parseFloat(nominal) || 150000,
        tanggal_jatuh_tempo: jatuhTempo || '2026-09-30',
        status_pembayaran: (statusBayar && statusBayar.toUpperCase() === 'PAID') ? 'PAID' : 'UNPAID'
      });
    }

    setParsedRows(rows);
    setDryRunErrors(errs);
  };

  // Submit Bulk Import DHKP PBB (Kelurahan)
  const handleSubmitBulkImport = async () => {
    if (parsedRows.length === 0) {
      alert('Tidak ada baris data valid untuk diimpor.');
      return;
    }

    setSubmittingUpload(true);
    try {
      const res = await api.post('/pbb/bulk-import', {
        csv_data: csvContent,
        tahun: filters.tahun || '2026',
        kirim_notifikasi: kirimNotifOtomatis
      });

      if (res.success) {
        setActionToast(res.message || 'Data DHKP PBB berhasil diunggah!');
        setTimeout(() => setActionToast(''), 4000);
        setShowUploadModal(false);
        setCsvContent('');
        setParsedRows([]);
        loadPbbData();
      } else {
        alert(res.message || 'Gagal mengunggah data PBB');
      }
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan saat mengunggah');
    } finally {
      setSubmittingUpload(false);
    }
  };

  // Submit Verifikasi Lapangan RT
  const handleSaveVerifyRT = async (e) => {
    e.preventDefault();
    if (!selectedPbbForVerify) return;

    setSubmittingVerify(true);
    try {
      const res = await api.put(`/pbb/verify-rt/${selectedPbbForVerify.id}`, {
        status_pembayaran: verifyForm.status_pembayaran,
        catatan_rt: verifyForm.catatan_rt,
        nik_warga: selectedPbbForVerify.nik_warga,
        nop: selectedPbbForVerify.nop
      });

      if (res.success) {
        setActionToast(`Verifikasi RT untuk NOP ${selectedPbbForVerify.nop} berhasil disimpan & notifikasi terkirim!`);
        setTimeout(() => setActionToast(''), 4000);
        setSelectedPbbForVerify(null);
        loadPbbData();
      } else {
        alert(res.message || 'Gagal menyimpan verifikasi');
      }
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan verifikasi');
    } finally {
      setSubmittingVerify(false);
    }
  };

  // Trigger Push Broadcast Reminder
  const handlePushReminder = async (targetRw = null) => {
    try {
      const res = await api.post('/pbb/push-reminder', {
        rw: targetRw,
        pesan_tambahan: `Pengingat Jatuh Tempo PBB 2026: Manfaatkan insentif diskon pajak sebelum tanggal jatuh tempo. Cek tagihan Anda di aplikasi Bumi Warga.`
      });
      if (res.success) {
        setActionToast(res.message);
        setTimeout(() => setActionToast(''), 4000);
      }
    } catch (e) {
      alert(e.message || 'Gagal mengirimkan broadcast reminder');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">

      {/* Action Toast Notification */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. HEADER UTAMA SESUAI PERAN                                              */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-700/30">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black border border-white/20 text-white shrink-0">
            <Building2 className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-400 text-blue-950">
                {isAdminKelurahan ? 'Rekonsiliasi Pajak Daerah' : isOfficer ? 'Verifikasi Pajak Lingkungan' : 'Pajak Daerah Mandiri'}
              </span>
              <span className="text-xs text-blue-200 font-mono">
                {isRT ? `RT ${user?.rt} / RW ${user?.rw}` : isRW ? `RW ${user?.rw}` : 'Kelurahan Kebonjati'}
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-bold text-white mt-0.5">
              {isAdminKelurahan
                ? 'Rekonsiliasi & Upload DHKP Pajak Bumi dan Bangunan (PBB-P2)'
                : isOfficer
                ? `Meja Verifikasi PBB Pengurus RT/RW`
                : 'Layanan Pembayaran Pajak Bumi dan Bangunan (PBB)'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdminKelurahan && (
            <>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Masal DHKP (CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => handlePushReminder(null)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/25 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="Kirim Notifikasi Pengingat PBB ke Seluruh RW & Warga"
              >
                <Send className="w-4 h-4 text-blue-200" />
                <span>Blast Reminder PBB</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={loadPbbData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RINGKASAN MAKRO KELURAHAN (BENTO KPI)                                 */}
      {/* ========================================================================= */}
      {isAdminKelurahan && pbbSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Kepatuhan PBB</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-blue-700 font-mono">
                {pbbSummary.summary?.persen_kepatuhan || 0}%
              </span>
              <span className="text-xs text-slate-400">Target 90%</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {pbbSummary.summary?.total_lunas} dari {pbbSummary.summary?.total_nop} NOP Lunas
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Realisasi Penerimaan</span>
            <span className="text-base sm:text-lg font-black text-emerald-700 font-mono mt-1 block">
              {formatRupiah(pbbSummary.summary?.total_terealisasi_rupiah)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Potensi: {formatRupiah(pbbSummary.summary?.total_potensi_rupiah)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Tertunggak</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-1 block">
              {pbbSummary.summary?.total_tertunggak} NOP
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Perlu verifikasi RT</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Tahun Ketetapan</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
              {filters.tahun || '2026'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">DHKP Resmi Bapenda</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAMPILAN ADMIN KELURAHAN & PENGURUS RT/RW                              */}
      {/* ========================================================================= */}
      {isOfficer ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          {/* Header & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>
                  {isAdminKelurahan
                    ? 'Daftar Ketetapan PBB & Verifikasi Lapangan Pengurus RT'
                    : `Daftar Objek Pajak Warga Lingkungan RT ${filters.rt}/RW ${filters.rw}`}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isAdminKelurahan
                  ? 'Data hasil upload DHKP diverifikasi langsung oleh RT di lapangan dan otomatis ternotifikasi ke akun warga.'
                  : 'Konfirmasi bukti setoran warga atau beri catatan faktual kepemilikan objek pajak.'}
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {isAdminKelurahan && (
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-500">RW:</label>
                  <select
                    value={filters.rw}
                    onChange={(e) => setFilters({ ...filters, rw: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                  >
                    <option value="">Semua RW</option>
                    <option value="001">RW 001</option>
                    <option value="002">RW 002</option>
                    <option value="003">RW 003</option>
                    <option value="004">RW 004</option>
                    <option value="005">RW 005</option>
                    <option value="006">RW 006</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-500">Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PAID">Lunas (PAID)</option>
                  <option value="UNPAID">Belum Bayar (UNPAID)</option>
                </select>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari NOP, NIK, nama WP..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && loadPbbData()}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">NOP (Nomor Objek Pajak)</th>
                  <th className="py-3 px-3">Nama Wajib Pajak</th>
                  <th className="py-3 px-3">Alamat Objek / Wilayah</th>
                  <th className="py-3 px-3">Nominal Tagihan</th>
                  <th className="py-3 px-3 text-center">Status Pembayaran</th>
                  <th className="py-3 px-3 text-center">Verifikasi RT</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pbbList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data PBB yang sesuai filter pencarian.
                    </td>
                  </tr>
                ) : (
                  pbbList.map((item) => {
                    const isPaid = item.status_pembayaran === 'PAID';
                    const isVerifiedRT = item.verifikasi_rt === 1;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.nop}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{item.nama_tampil || item.nama_wajib_pajak}</p>
                          <span className="text-[10px] text-slate-400 font-mono">NIK: {item.nik_warga}</span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-slate-800">{item.alamat_tampil || item.alamat_objek_pajak}</p>
                          <span className="text-[10px] font-bold text-slate-500">RT {item.rt_tampil}/RW {item.rw_tampil}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {formatRupiah(item.nominal)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isVerifiedRT ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={12} />
                              Diverifikasi RT
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Belum Cek
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPbbForVerify(item);
                              setVerifyForm({
                                status_pembayaran: item.status_pembayaran || 'PAID',
                                catatan_rt: item.catatan_rt || (isPaid ? 'Telah lunas terverifikasi RT' : 'Belum membayar')
                              });
                            }}
                            className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-extrabold text-[11px] border border-blue-200 transition-all cursor-pointer"
                          >
                            {isOfficer && (isRT || isRW) ? 'Verifikasi' : 'Detail'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 4. TAMPILAN WARGA (KARTU TAGIHAN PBB SAYA)                                 */
        /* ========================================================================= */
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                <span>Tagihan Pajak Bumi dan Bangunan (PBB-P2) Keluarga Saya</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pajak Anda berkontribusi langsung pada pembangunan infrastruktur dan fasilitas lingkungan RT/RW.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 font-mono bg-slate-100 px-3 py-1.5 rounded-xl">
              NIK: {user?.username}
            </span>
          </div>

          {myPbbData.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">Tidak Ada Tagihan PBB Terdaftar</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tidak ditemukan objek pajak PBB yang terhubung dengan NIK Anda. Jika Anda memiliki tanah/bangunan di wilayah kelurahan ini, hubungi Ketua RT untuk pendataan NOP.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPbbData.map((item) => {
                const isPaid = item.status_pembayaran === 'PAID';
                const isProcessing = processingNop === `${item.nop}-${item.tahun}`;

                return (
                  <div
                    key={`${item.nop}-${item.tahun}`}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tahun Pajak {item.tahun}</span>
                          <h4 className="text-base font-black text-slate-900 font-mono mt-0.5">{item.nop}</h4>
                          <p className="text-xs text-slate-600 mt-1 font-medium">{item.alamat_objek_pajak || 'Objek Pajak Kelurahan Kebonjati'}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
                        </span>
                      </div>

                      <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">Ketetapan Pajak</span>
                          <span className="text-lg font-black text-slate-900 font-mono">{formatRupiah(item.nominal)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-500 block">Jatuh Tempo</span>
                          <span className="text-xs font-bold text-slate-700 font-mono">{item.tanggal_jatuh_tempo || '30 Sept 2026'}</span>
                        </div>
                      </div>

                      {item.verifikasi_rt === 1 && (
                        <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                          <span>Status telah diverifikasi langsung oleh Pengurus RT setempat.</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {isPaid ? 'Simpan bukti pelunasan digital ini' : 'Bisa bayar via bank atau titip RT'}
                      </span>
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => handlePayWarga(item.nop, item.tahun)}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CreditCard size={14} />}
                          <span>Konfirmasi Pembayaran</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: UPLOAD MASAL DATA DHKP PBB (KELURAHAN)                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Upload Masal Data DHKP PBB (Format Baku CSV)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Data otomatis terhubung ke RT/RW binaan dan mengirim notifikasi rilis tagihan ke warga.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action: Download Template CSV */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-blue-900 block font-bold">Gunakan Format Template Resmi DHKP:</strong>
                  <span className="text-blue-700">Kolom: NOP, NIK_WARGA, NAMA_WAJIB_PAJAK, ALAMAT_OBJEK, RT, RW, TAHUN, NOMINAL, JATUH_TEMPO, STATUS_PEMBAYARAN</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-white hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-xl font-bold flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Unduh Template CSV</span>
                </button>
              </div>

              {/* Paste / File Input Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tempelkan Isi CSV atau Buka File:
                </label>
                <textarea
                  rows={6}
                  placeholder={`NOP,NIK_WARGA,NAMA_WAJIB_PAJAK,ALAMAT_OBJEK,RT,RW,TAHUN,NOMINAL,JATUH_TEMPO,STATUS_PEMBAYARAN\n32.73.010.001.001-0001.0,3273010101900001,Budi Santoso,Jl. Kebonjati No. 12,001,001,2026,175000,2026-09-30,UNPAID`}
                  value={csvContent}
                  onChange={(e) => handleDryRunCsv(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Validation Status / Dry-Run Status */}
              {csvContent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      Hasil Validasi Dry-Run: {parsedRows.length} baris valid
                    </span>
                    {dryRunErrors.length > 0 && (
                      <span className="text-rose-600 font-bold">{dryRunErrors.length} baris error</span>
                    )}
                  </div>

                  {dryRunErrors.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1 max-h-32 overflow-y-auto">
                      {dryRunErrors.slice(0, 5).map((err, i) => (
                        <p key={i}>• {err}</p>
                      ))}
                    </div>
                  )}

                  {parsedRows.length > 0 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>
                        Siap diimpor: Total {parsedRows.length} objek pajak. Nilai ketetapan:{' '}
                        <strong>
                          {formatRupiah(parsedRows.reduce((acc, r) => acc + (r.nominal || 0), 0))}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Checkbox Kirim Notifikasi Otomatis */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kirimNotifOtomatis}
                  onChange={(e) => setKirimNotifOtomatis(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Kirim notifikasi otomatis ke akun warga (Rilis Ketetapan Tagihan PBB {filters.tahun})</span>
              </label>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={submittingUpload || parsedRows.length === 0}
                  onClick={handleSubmitBulkImport}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingUpload && <RefreshCw size={14} className="animate-spin" />}
                  <span>Simpan & Rilis DHKP PBB</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: VERIFIKASI LAPANGAN PBB OLEH RT                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedPbbForVerify && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Verifikasi PBB oleh Pengurus RT</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPbbForVerify(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <p className="font-mono font-bold text-slate-900">NOP: {selectedPbbForVerify.nop}</p>
                <p className="text-slate-700">Wajib Pajak: {selectedPbbForVerify.nama_tampil}</p>
                <p className="text-slate-500">Alamat: {selectedPbbForVerify.alamat_tampil} (RT {selectedPbbForVerify.rt_tampil}/RW {selectedPbbForVerify.rw_tampil})</p>
                <p className="font-bold text-blue-800">Tagihan: {formatRupiah(selectedPbbForVerify.nominal)} (Tahun {selectedPbbForVerify.tahun})</p>
              </div>

              <form onSubmit={handleSaveVerifyRT} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Pembayaran Lapangan:</label>
                  <select
                    value={verifyForm.status_pembayaran}
                    onChange={(e) => setVerifyForm({ ...verifyForm, status_pembayaran: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    <option value="PAID">LUNAS (Warga telah membayar / bukti terkonfirmasi)</option>
                    <option value="UNPAID">BELUM BAYAR (Masih tertunggak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Faktual RT:</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Bukti setoran bank telah diserahkan ke RT, pemilik tinggal di RT 01..."
                    value={verifyForm.catatan_rt}
                    onChange={(e) => setVerifyForm({ ...verifyForm, catatan_rt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedPbbForVerify(null)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingVerify}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {submittingVerify && <RefreshCw size={14} className="animate-spin" />}
                    <span>Simpan & Kirim Notifikasi</span>
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
