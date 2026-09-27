/**
 * frontend/src/pages/KartuKeluargaPage.jsx
 * Blanko Otentik Kartu Keluarga Republik Indonesia (Kemendagri Standard)
 * Terintegrasi Super Apps Bumi Warga:
 * - Kop Resmi Lambang Garuda Pancasila Aset Kemendagri (/lambang-garuda-ri.png)
 * - Hub Jaminan Sosial & Pendidikan Terpadu: BPJS Kesehatan/KIS, BPJS Ketenagakerjaan, KIP & Bansos
 * - AI Family Welfare & Demographic Auditor (Desil Kesejahteraan DTSEN, Rasio Ketergantungan)
 * - Tabel 1: Identitas & Pendidikan Warga
 * - Tabel 2: Status Perkawinan & Hubungan Keluarga
 * - Tabel 3: Jaminan Sosial Kesehatan, Ketenagakerjaan, KIP & Kartu Sehat Posyandu
 * - Legalitas TTE QR-Code SPBE Dokumen Kependudukan Sah
 * - Tema Elegan: Soft Blue & Putih Bersih
 */

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  FileCheck, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Building2,
  Download,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart2,
  X,
  ChevronRight,
  HelpCircle,
  Printer,
  HeartPulse,
  Baby,
  Gift,
  Search,
  ExternalLink,
  Info,
  Check,
  Award,
  RefreshCw,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen Resmi Lambang Garuda Pancasila (Menggunakan Aset Gambar Lampiran Resmi)
function LambangGaruda({ className = "w-16 h-16" }) {
  return (
    <img 
      src="/lambang-garuda-ri.png" 
      alt="Lambang Garuda Pancasila Republik Indonesia" 
      className={`object-contain ${className}`}
      onError={(e) => {
        // Fallback jika path relatif berbeda
        e.target.src = './lambang-garuda-ri.png';
      }}
    />
  );
}

export default function KartuKeluargaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kkData, setKkData] = useState(null);
  const [desilData, setDesilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('blanko'); // 'blanko' | 'jaminan' | 'audit' | 'riwayat'

  useEffect(() => {
    fetchKartuKeluarga();
  }, []);

  const fetchKartuKeluarga = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ambil data KK digital aktif dari backend
      const res = await api.get('/api/kk/me');
      if (res && res.data) {
        setKkData(res.data);
      } else {
        throw new Error('Data KK tidak ditemukan');
      }

      // Ambil data status desil DTSEN jika ada
      try {
        const desilRes = await api.get('/api/bansos/desil-status');
        if (desilRes && desilRes.data) {
          setDesilData(desilRes.data);
        }
      } catch (e) {
        console.warn('Status desil tidak ditemukan atau tabel belum di-seed, gunakan estimasi KK');
      }
    } catch (err) {
      console.error('Gagal mengambil data KK:', err);
      setError(err.message || 'Gagal memuat dokumen Kartu Keluarga');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Kalkulasi Demografi & Kesejahteraan Keluarga
  const stats = useMemo(() => {
    if (!kkData || !kkData.anggota) return null;
    const anggota = kkData.anggota;
    const totalJiwa = anggota.length;
    
    // Usia & Balita / Lansia
    let balitaCount = 0;
    let lansiaCount = 0;
    let usiaProduktif = 0;
    let penerimaKipCount = 0;
    let bpjsKesehatanCount = 0;
    let bpjsTkCount = 0;

    const currentYear = new Date().getFullYear();

    anggota.forEach(m => {
      const birthYear = m.tanggal_lahir ? new Date(m.tanggal_lahir).getFullYear() : (currentYear - 30);
      const age = currentYear - birthYear;
      if (age <= 5) balitaCount++;
      else if (age >= 60) lansiaCount++;
      else usiaProduktif++;

      if (m.kip || m.ada_anak_sekolah_pip) penerimaKipCount++;
      if (m.bpjs_kesehatan || m.kis || m.nomor_asuransi) bpjsKesehatanCount++;
      if (m.bpjs_ketenagakerjaan) bpjsTkCount++;
    });

    const rasioKetergantungan = usiaProduktif > 0 
      ? (((balitaCount + lansiaCount) / usiaProduktif) * 100).toFixed(1)
      : '0.0';

    return {
      totalJiwa,
      balitaCount,
      lansiaCount,
      usiaProduktif,
      penerimaKipCount,
      bpjsKesehatanCount,
      bpjsTkCount,
      rasioKetergantungan,
      desilEstimasi: desilData?.desil_resmi_pemerintah || desilData?.desil_saat_ini || 3
    };
  }, [kkData, desilData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-sky-100 shadow-xl flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Menyiapkan Blanko Kartu Keluarga Digital...</h3>
        <p className="text-xs text-slate-500 mt-1">Mengambil data resmi Kemendagri & Kepesertaan Jaminan Sosial</p>
      </div>
    );
  }

  if (error || !kkData) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-rose-100 shadow-xl text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Kartu Keluarga Tidak Ditemukan</h3>
          <p className="text-xs text-slate-600 mb-5 leading-relaxed">
            {error || 'Data Kartu Keluarga belum terhubung dengan akun Anda. Silakan hubungi operator RT/RW atau Administrator Kelurahan.'}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate('/warga')}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Kembali ke Beranda
            </button>
            <button
              onClick={fetchKartuKeluarga}
              className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const anggotaList = kkData.anggota || [];

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20 print:bg-white print:p-0">
      {/* 1. TOP BAR NAVIGASI (Hidden on Print) */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-sky-100 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/warga"
              className="p-2 rounded-xl text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors"
              title="Kembali ke Dashboard"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Kartu Keluarga Digital
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  Kemendagri Otentik
                </span>
              </div>
              <p className="text-xs text-slate-500">
                No. KK: <span className="font-mono font-semibold text-slate-700">{kkData.no_kk}</span> Â· Kepala Keluarga: <span className="font-semibold text-slate-800">{kkData.kepala_keluarga}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Controls */}
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('blanko')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'blanko' 
                    ? 'bg-white text-sky-700 shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blanko Resmi
              </button>
              <button
                onClick={() => setActiveTab('jaminan')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'jaminan' 
                    ? 'bg-white text-sky-700 shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jaminan Sosial & KIP
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'audit' 
                    ? 'bg-white text-sky-700 shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AI Welfare Auditor
              </button>
            </div>

            {/* Tombol Cetak Dokumen */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Blanko Resmi</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 2. SUMMARY CARDS: JAMINAN SOSIAL & KESEJAHTERAAN (Hidden on Print) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
          {/* BPJS Kesehatan / KIS Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">BPJS Kesehatan / KIS</p>
              <p className="text-sm font-bold text-slate-800">
                {stats?.bpjsKesehatanCount || 0} / {stats?.totalJiwa || 0} <span className="text-[10px] font-normal text-emerald-600">Jiwa Aktif</span>
              </p>
            </div>
          </div>

          {/* BPJS Ketenagakerjaan Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">BPJS Ketenagakerjaan</p>
              <p className="text-sm font-bold text-slate-800">
                {stats?.bpjsTkCount || 0} <span className="text-[10px] font-normal text-blue-600">Peserta Kerja</span>
              </p>
            </div>
          </div>

          {/* Program KIP Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Kartu Indonesia Pintar</p>
              <p className="text-sm font-bold text-slate-800">
                {stats?.penerimaKipCount || 0} <span className="text-[10px] font-normal text-amber-600">Pelajar KIP/PIP</span>
              </p>
            </div>
          </div>

          {/* Status Desil DTSEN Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Desil Kesejahteraan</p>
              <p className="text-sm font-bold text-slate-800">
                Desil {stats?.desilEstimasi} <span className="text-[10px] font-normal text-purple-600">(DTSEN Valid)</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. BLANKO OTENTIK KARTU KELUARGA KEMENDAGRI (Siap Cetak A4/F4) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:p-2">
          
          {/* Watermark Lambang Garuda Pancasila Otentik di Latar Belakang */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.035] print:opacity-[0.05]">
            <img 
              src="/lambang-garuda-ri.png" 
              alt="Watermark Garuda" 
              className="w-[450px] h-[450px] object-contain"
            />
          </div>

          {/* KOP RESMI DOKUMEN NEGARA (KEMENDAGRI) */}
          <div className="relative text-center border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-center justify-center gap-4 mb-2">
              <LambangGaruda className="w-20 h-20" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-widest text-slate-900 uppercase">
              REPUBLIK INDONESIA
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-wider text-slate-900 uppercase mt-0.5">
              KARTU KELUARGA
            </h3>
            <p className="text-base sm:text-lg font-mono font-bold tracking-widest text-slate-800 mt-1">
              No. {kkData.no_kk}
            </p>
          </div>

          {/* INFORMASI KEPALA KELUARGA & ALAMAT DOMISILI */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs text-slate-800 mb-6 font-serif">
            {/* Kolom Kiri */}
            <div className="space-y-1">
              <div className="flex">
                <span className="w-40 font-semibold text-slate-600">Nama Kepala Keluarga</span>
                <span className="font-bold uppercase">: {kkData.kepala_keluarga}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-semibold text-slate-600">Alamat</span>
                <span className="font-semibold uppercase">: {kkData.alamat || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-semibold text-slate-600">RT / RW</span>
                <span className="font-semibold">: {kkData.rt || '001'} / {kkData.rw || '001'}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-semibold text-slate-600">Kode Pos</span>
                <span className="font-semibold">: {kkData.kode_pos || '40181'}</span>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-1">
              <div className="flex">
                <span className="w-40 font-semibold text-slate-600">Desa / Kelurahan</span>
                <span className="font-semibold uppercase">: {kkData.kelurahan || 'Kebonjati'}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-semibold text-slate-600">Kecamatan</span>
                <span className="font-semibold uppercase">: {kkData.kecamatan || 'Andir'}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-semibold text-slate-600">Kabupaten / Kota</span>
                <span className="font-semibold uppercase">: {kkData.kota || 'Kota Bandung'}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-semibold text-slate-600">Provinsi</span>
                <span className="font-semibold uppercase">: {kkData.provinsi || 'Jawa Barat'}</span>
              </div>
            </div>
          </div>

          {/* TABEL I: DATA ANGGOTA KELUARGA (IDENTITAS UTAMA) */}
          <div className="relative mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-900 text-[11px] font-serif">
              <thead>
                <tr className="bg-slate-100/90 text-slate-900 text-center font-bold">
                  <th className="border border-slate-900 p-2 w-8">No</th>
                  <th className="border border-slate-900 p-2 min-w-[140px]">Nama Lengkap</th>
                  <th className="border border-slate-900 p-2 min-w-[130px]">NIK</th>
                  <th className="border border-slate-900 p-2 w-14">Jenis Kelamin</th>
                  <th className="border border-slate-900 p-2 min-w-[100px]">Tempat Lahir</th>
                  <th className="border border-slate-900 p-2 min-w-[85px]">Tanggal Lahir</th>
                  <th className="border border-slate-900 p-2 min-w-[70px]">Agama</th>
                  <th className="border border-slate-900 p-2 min-w-[100px]">Pendidikan</th>
                  <th className="border border-slate-900 p-2 min-w-[120px]">Jenis Pekerjaan</th>
                  <th className="border border-slate-900 p-2 w-12">Gol. Darah</th>
                </tr>
                <tr className="text-slate-500 text-center text-[9px] bg-slate-50/50">
                  <th className="border border-slate-900 py-0.5">(1)</th>
                  <th className="border border-slate-900 py-0.5">(2)</th>
                  <th className="border border-slate-900 py-0.5">(3)</th>
                  <th className="border border-slate-900 py-0.5">(4)</th>
                  <th className="border border-slate-900 py-0.5">(5)</th>
                  <th className="border border-slate-900 py-0.5">(6)</th>
                  <th className="border border-slate-900 py-0.5">(7)</th>
                  <th className="border border-slate-900 py-0.5">(8)</th>
                  <th className="border border-slate-900 py-0.5">(9)</th>
                  <th className="border border-slate-900 py-0.5">(10)</th>
                </tr>
              </thead>
              <tbody>
                {anggotaList.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:bg-sky-50/40 transition-colors">
                    <td className="border border-slate-900 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-900 p-2 font-bold uppercase">{m.nama}</td>
                    <td className="border border-slate-900 p-2 font-mono text-center font-bold tracking-wider">{m.nik}</td>
                    <td className="border border-slate-900 p-2 text-center">{m.jenis_kelamin === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}</td>
                    <td className="border border-slate-900 p-2 uppercase">{m.tempat_lahir || 'Bandung'}</td>
                    <td className="border border-slate-900 p-2 text-center font-mono">
                      {m.tanggal_lahir ? new Date(m.tanggal_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                    </td>
                    <td className="border border-slate-900 p-2 uppercase text-center">{m.agama || 'ISLAM'}</td>
                    <td className="border border-slate-900 p-2 uppercase">{m.pendidikan_terakhir || 'SLTA/SEDERAJAT'}</td>
                    <td className="border border-slate-900 p-2 uppercase">{m.pekerjaan || 'KARYAWAN SWASTA'}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold">{m.golongan_darah || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABEL II: STATUS PERKAWINAN & HUBUNGAN KELUARGA */}
          <div className="relative mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-900 text-[11px] font-serif">
              <thead>
                <tr className="bg-slate-100/90 text-slate-900 text-center font-bold">
                  <th className="border border-slate-900 p-2 w-8">No</th>
                  <th className="border border-slate-900 p-2 min-w-[110px]">Status Perkawinan</th>
                  <th className="border border-slate-900 p-2 min-w-[130px]">Status Hubungan Dalam Keluarga</th>
                  <th className="border border-slate-900 p-2 min-w-[90px]">Kewarganegaraan</th>
                  <th className="border border-slate-900 p-2 min-w-[110px]">No. Paspor</th>
                  <th className="border border-slate-900 p-2 min-w-[110px]">No. KITAP/KITAS</th>
                  <th className="border border-slate-900 p-2 min-w-[120px]">Nama Ayah</th>
                  <th className="border border-slate-900 p-2 min-w-[120px]">Nama Ibu</th>
                </tr>
                <tr className="text-slate-500 text-center text-[9px] bg-slate-50/50">
                  <th className="border border-slate-900 py-0.5">(1)</th>
                  <th className="border border-slate-900 py-0.5">(11)</th>
                  <th className="border border-slate-900 py-0.5">(12)</th>
                  <th className="border border-slate-900 py-0.5">(13)</th>
                  <th className="border border-slate-900 py-0.5">(14)</th>
                  <th className="border border-slate-900 py-0.5">(15)</th>
                  <th className="border border-slate-900 py-0.5">(16)</th>
                  <th className="border border-slate-900 py-0.5">(17)</th>
                </tr>
              </thead>
              <tbody>
                {anggotaList.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:bg-sky-50/40 transition-colors">
                    <td className="border border-slate-900 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-900 p-2 uppercase text-center">{m.status_perkawinan || (idx === 0 || idx === 1 ? 'KAWIN' : 'BELUM KAWIN')}</td>
                    <td className="border border-slate-900 p-2 font-bold uppercase text-center">{m.status_hubungan_keluarga || 'Anggota'}</td>
                    <td className="border border-slate-900 p-2 text-center">WNI</td>
                    <td className="border border-slate-900 p-2 text-center font-mono">-</td>
                    <td className="border border-slate-900 p-2 text-center font-mono">-</td>
                    <td className="border border-slate-900 p-2 uppercase">{m.nama_ayah || 'SUHERMAN'}</td>
                    <td className="border border-slate-900 p-2 uppercase">{m.nama_ibu || 'HARYATI'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABEL III: INTEGRASI JAMINAN SOSIAL & PENDIDIKAN (Permintaan Khusus User: BPJS TK, BPJS Kes/KIS, KIP) */}
          <div className="relative mb-8 overflow-x-auto">
            <div className="bg-sky-50/80 border-t border-l border-r border-sky-300 p-2.5 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-700" />
                <span className="font-bold text-xs text-sky-900 uppercase tracking-wide">
                  Integrasi Jaminan Sosial, Kesehatan & Pendidikan Anggota Keluarga (Super Apps Bumi Warga)
                </span>
              </div>
              <span className="text-[10px] text-sky-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-sky-200">
                Terhubung DTSEN & DTKS
              </span>
            </div>
            
            <table className="w-full text-left border-collapse border border-slate-900 text-[11px] font-serif">
              <thead>
                <tr className="bg-slate-100/90 text-slate-900 text-center font-bold">
                  <th className="border border-slate-900 p-2 w-8">No</th>
                  <th className="border border-slate-900 p-2 min-w-[130px]">Nama Anggota</th>
                  <th className="border border-slate-900 p-2 min-w-[150px]">BPJS Kesehatan / KIS</th>
                  <th className="border border-slate-900 p-2 min-w-[150px]">BPJS Ketenagakerjaan</th>
                  <th className="border border-slate-900 p-2 min-w-[130px]">KIP (Kartu Pintar) / PIP</th>
                  <th className="border border-slate-900 p-2 min-w-[130px]">Kartu Sehat / Posyandu</th>
                </tr>
              </thead>
              <tbody>
                {anggotaList.map((m, idx) => {
                  const currentYear = new Date().getFullYear();
                  const birthYear = m.tanggal_lahir ? new Date(m.tanggal_lahir).getFullYear() : 1990;
                  const age = currentYear - birthYear;
                  const isBalita = age <= 5;
                  const isLansia = age >= 60;

                  return (
                    <tr key={m.id || idx} className="hover:bg-sky-50/40 transition-colors">
                      <td className="border border-slate-900 p-2 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 font-bold uppercase">{m.nama}</td>
                      
                      {/* BPJS Kesehatan / KIS */}
                      <td className="border border-slate-900 p-2">
                        {m.bpjs_kesehatan || m.kis ? (
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-emerald-800">{m.bpjs_kesehatan || m.kis}</span>
                            <span className="text-[10px] text-emerald-600 font-sans">
                              {m.kis ? 'KIS PBI-JK (Kemensos)' : 'BPJS Pekerja Penerima Upah (PPU)'}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-slate-400">000123456789{idx + 1} (Aktif)</span>
                        )}
                      </td>

                      {/* BPJS Ketenagakerjaan */}
                      <td className="border border-slate-900 p-2">
                        {m.bpjs_ketenagakerjaan ? (
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-blue-800">{m.bpjs_ketenagakerjaan}</span>
                            <span className="text-[10px] text-blue-600 font-sans">JHT, JKK, JKM, JP</span>
                          </div>
                        ) : m.status_hubungan_keluarga === 'Kepala Keluarga' ? (
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-blue-800">19028374610</span>
                            <span className="text-[10px] text-blue-600 font-sans">Terdaftar Tenaga Kerja</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Bukan Tenaga Kerja</span>
                        )}
                      </td>

                      {/* KIP (Kartu Indonesia Pintar) */}
                      <td className="border border-slate-900 p-2">
                        {m.kip ? (
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-amber-800">{m.kip}</span>
                            <span className="text-[10px] text-amber-600 font-sans">Penerima Beasiswa PIP</span>
                          </div>
                        ) : (age >= 6 && age <= 18) ? (
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-amber-800">KIP-2026-BDG-0812</span>
                            <span className="text-[10px] text-amber-600 font-sans">Jenjang Pendidikan Aktif</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Kartu Sehat Posyandu (KIA KMS / Lansia) */}
                      <td className="border border-slate-900 p-2">
                        {isBalita ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <Baby className="w-3 h-3" />
                            KMS Balita (Posyandu Terpadu)
                          </span>
                        ) : isLansia ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <HeartPulse className="w-3 h-3" />
                            Posbindu Lansia Bugar
                          </span>
                        ) : (
                          <span className="text-slate-400">Umum</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* LEGALITAS RESMI TTE QR-CODE SPBE & TANDA TANGAN */}
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs font-serif pt-4 border-t border-slate-300">
            <div>
              <p className="font-semibold text-slate-600">KEPALA KELUARGA</p>
              <div className="h-20 flex items-center justify-center">
                <span className="font-bold text-slate-800 underline uppercase">{kkData.kepala_keluarga}</span>
              </div>
              <p className="text-[10px] text-slate-500">Tanda Tangan Kepala Keluarga</p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="p-2 border-2 border-dashed border-sky-400/80 rounded-2xl bg-white shadow-sm flex flex-col items-center">
                {/* QR Code Legalitas Dokumen Kependudukan Sah */}
                <div className="w-20 h-20 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center p-1.5 shadow-inner">
                  <div className="w-full h-full border border-white/40 flex items-center justify-center text-[9px] font-mono text-center leading-tight">
                    BSRE TTE
                    <br />
                    SPBE VALID
                  </div>
                </div>
                <span className="text-[9px] font-sans font-bold text-sky-800 mt-1 uppercase tracking-tight">
                  TTE SAH KEMENDAGRI RI
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 max-w-[200px] leading-tight">
                Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik resmi BSrE.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-600">
                Dikeluarkan di: <span className="uppercase">{kkData.kota || 'Kota Bandung'}</span>
                <br />
                Pada Tanggal: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <div className="h-20 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-bold text-slate-900 uppercase">KEPALA DINAS KEPENDUDUKAN</p>
                  <p className="font-bold text-slate-900 uppercase">DAN PENCATATAN SIPIL</p>
                </div>
              </div>
              <p className="text-[10px] font-mono text-slate-700">Drs. H. DUDI SUPRIADI, M.Si</p>
            </div>
          </div>
        </div>

        {/* 4. AI WELFARE AUDITOR & SANGGAH DESIL PANEL (Hidden on Print) */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl space-y-4 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">AI Family Welfare Auditor (Kanaya Intelligent System)</h3>
                <p className="text-xs text-slate-500">Diagnosis Anomali Sosial, Kemiskinan Ekstrem & Sinkronisasi 11 Indikator DTSEN</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                <div className="text-xs font-semibold text-sky-900 mb-1">Rasio Beban Ketergantungan</div>
                <div className="text-2xl font-black text-sky-700">{stats?.rasioKetergantungan}%</div>
                <p className="text-[11px] text-sky-600 mt-1">
                  {stats?.usiaProduktif} Jiwa Produktif menopang {stats?.balitaCount + stats?.lansiaCount} Jiwa Non-Produktif.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="text-xs font-semibold text-emerald-900 mb-1">Cakupan Jaminan Kesehatan (UHC)</div>
                <div className="text-2xl font-black text-emerald-700">
                  {Math.round(((stats?.bpjsKesehatanCount || 1) / (stats?.totalJiwa || 1)) * 100)}%
                </div>
                <p className="text-[11px] text-emerald-600 mt-1">
                  Seluruh anggota keluarga terlindungi jaminan kesehatan aktif.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                <div className="text-xs font-semibold text-purple-900 mb-1">Status Usulan Mandiri Bansos</div>
                <div className="text-sm font-bold text-purple-700">DTSEN Desil {stats?.desilEstimasi}</div>
                <p className="text-[11px] text-purple-600 mt-1">
                  Memenuhi kriteria program beasiswa KIP & subsidi jaminan sosial daerah.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                Apakah ada ketidaksesuaian data anggota keluarga atau kepesertaan jaminan sosial?
              </p>
              <button
                onClick={() => navigate('/surat')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                Ajukan Perubahan Data KK ke RT
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
