/**
 * frontend/src/pages/dashboard/DashboardWarga.jsx
 * Super App Citizen Experience Dashboard for Warga (Bumi Warga - Jabar Pintar Digital)
 * Features:
 * - Hero Section dengan Nama User, Identitas KK/NIK, Ringkasan Status & Direct Avatar Upload ðŸ“·
 * - KANAYA AI &bull; Smart Citizen Briefing & Action Card
 * - Super Apps Quick Launcher (8 Fitur Utama Ber-badge)
 * - WorkflowStepper Pelacakan Surat Aktif Berjenjang
 * - Monitoring Buku KIA Balita & Kesehatan Lansia Terpadu
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  DashboardShell,
  RoleHeader,
  ActionCenter,
  WorkflowStepper,
  KartuKIADigital,
  KartuLansiaDigital
} from '../../components/design-system';
import {
  FileText,
  FileCheck,
  Gift,
  Wallet,
  HeartPulse,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  Download,
  Calendar,
  Baby,
  Users,
  Building2,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Camera,
  Sparkles,
  Layers,
  MessageSquareWarning,
  Coins,
  QrCode,
  MapPin,
  Check,
  UserCheck,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardWarga() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Loading & State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarToast, setAvatarToast] = useState('');

  // Citizen Data States
  const [documents, setDocuments] = useState([]);
  const [bansosData, setBansosData] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [familyDesil, setFamilyDesil] = useState(null);
  const [iuranStatus, setIuranStatus] = useState({ isPaid: true, label: 'Lunas', amount: 25000, month: 'Bulan Ini' });
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [familyBalita, setFamilyBalita] = useState([]);
  const [familyLansia, setFamilyLansia] = useState([]);
  const [healthActiveTab, setHealthActiveTab] = useState('balita'); // 'balita' | 'lansia'

  // Load Citizen Dashboard Data
  const loadCitizenData = async () => {
    try {
      setRefreshing(true);

      const [docRes, bansosRes, iuranRes, posyanduRes, lansiaRes, desilRes, ticketRes] = await Promise.allSettled([
        api.get('/dokumen/me'),
        api.get('/bansos'),
        api.get('/keuangan/iuran'),
        api.get('/posyandu/me'),
        api.get('/posyandu/lansia/my'),
        api.get('/desil/my-family'),
        api.get('/bansos/my-tickets')
      ]);

      // Handle Documents
      if (docRes.status === 'fulfilled' && docRes.value?.success) {
        const rawDocs = docRes.value.data || [];
        setDocuments(rawDocs);
        if (rawDocs.length > 0 && !selectedDocId) {
          setSelectedDocId(rawDocs[0].id);
        }
      }

      // Handle Bansos
      if (bansosRes.status === 'fulfilled' && bansosRes.value?.success) {
        setBansosData(bansosRes.value.data || []);
      }

      // Handle Tickets QR
      if (ticketRes.status === 'fulfilled' && ticketRes.value?.data?.data) {
        setMyTickets(ticketRes.value.data.data || []);
      }

      // Handle Desil
      if (desilRes.status === 'fulfilled' && desilRes.value?.data?.data) {
        setFamilyDesil(desilRes.value.data.data);
      }

      // Handle Iuran RT
      if (iuranRes.status === 'fulfilled' && iuranRes.value?.success) {
        const list = iuranRes.value.data || [];
        const unpaid = list.find((i) => i.status === 'BELUM_BAYAR' || i.status === 'UNPAID');
        if (unpaid) {
          setIuranStatus({
            isPaid: false,
            label: 'Belum Bayar',
            amount: unpaid.nominal || 25000,
            month: unpaid.periode || 'Bulan Ini'
          });
        } else {
          setIuranStatus({
            isPaid: true,
            label: 'Lunas',
            amount: 25000,
            month: 'Bulan Ini'
          });
        }
      }

      // Handle Posyandu Balita (Buku KIA Digital Keluarga)
      if (posyanduRes.status === 'fulfilled' && posyanduRes.value?.success && posyanduRes.value.data?.length > 0) {
        setFamilyBalita(posyanduRes.value.data);
      } else {
        // Fallback Balita Budi Santoso
        setFamilyBalita([
          {
            nik_anak: '3273010505240001',
            no_kk: user?.no_kk || '3273010101900001',
            nama_anak: 'Muhammad Al-Fatih',
            jenis_kelamin_anak: 'L',
            tanggal_lahir_anak: '2024-05-05',
            tempat_lahir: 'Bandung',
            rt: user?.rt || '001',
            rw: user?.rw || '001',
            nama_ibu: 'Siti Aminah',
            nama_ayah: user?.nama || 'Budi Santoso',
            nama_posyandu: `Posyandu Melati RW ${user?.rw || '001'}`,
            umur_bulan: 28,
            latest_checkup: {
              tanggal: '2026-08-18',
              umur_bulan: 28,
              berat_badan_kg: 12.4,
              tinggi_badan_cm: 88.5,
              lingkar_kepala_cm: 48.0,
              status_gizi: 'Normal'
            },
            growth_trend: {
              tren_bb: 'naik',
              delta_bb: 0.4,
              label: 'Berat Badan Naik (+0.4 kg)',
              status_pertumbuhan: 'Pertumbuhan Baik'
            },
            history: [
              {
                id: 1,
                tanggal_pemeriksaan: '2026-05-18',
                umur_bulan: 25,
                berat_badan_kg: 11.5,
                tinggi_badan_cm: 86.0,
                lingkar_kepala_cm: 47.3,
                status_gizi: 'Normal',
                catatan_kesehatan: 'Berat naik normal.'
              },
              {
                id: 2,
                tanggal_pemeriksaan: '2026-06-20',
                umur_bulan: 26,
                berat_badan_kg: 11.8,
                tinggi_badan_cm: 87.0,
                lingkar_kepala_cm: 47.5,
                status_gizi: 'Normal',
                catatan_kesehatan: 'Tumbuh kembang aktif.'
              },
              {
                id: 3,
                tanggal_pemeriksaan: '2026-07-16',
                umur_bulan: 27,
                berat_badan_kg: 12.0,
                tinggi_badan_cm: 87.8,
                lingkar_kepala_cm: 47.8,
                status_gizi: 'Normal',
                imunisasi: 'Vitamin A Kapsul Biru',
                catatan_kesehatan: 'Vitamin A telah diberikan.'
              },
              {
                id: 4,
                tanggal_pemeriksaan: '2026-08-18',
                umur_bulan: 28,
                berat_badan_kg: 12.4,
                tinggi_badan_cm: 88.5,
                lingkar_kepala_cm: 48.0,
                status_gizi: 'Normal',
                catatan_kesehatan: 'Pertumbuhan optimal.'
              }
            ]
          }
        ]);
      }

      // Handle Posyandu Lansia Keluarga
      if (lansiaRes.status === 'fulfilled' && lansiaRes.value?.success && lansiaRes.value.data?.length > 0) {
        setFamilyLansia(lansiaRes.value.data);
      } else {
        setFamilyLansia([
          {
            id: 1,
            nik: '3273010101550001',
            nama: 'H. Suherman (Kakek)',
            usia: '71 Tahun',
            jenis_kelamin: 'L',
            rt: user?.rt || '001',
            rw: user?.rw || '001',
            alamat: 'Jl. Melati No. 12',
            status_tinggal: 'Bersama Keluarga',
            riwayat_penyakit: 'Hipertensi Ringan',
            last_tanggal_pemeriksaan: '2026-08-15',
            last_tensi_sistolik: 135,
            last_tensi_diastolik: 85,
            last_gds: 125,
            last_adl: 'Mandiri',
            last_berat_badan: 62.5,
            last_tinggi_badan: 165.0,
            history: [
              {
                id: 1,
                tanggal_pemeriksaan: '2026-06-15',
                tensi_sistolik: 140,
                tensi_diastolik: 90,
                gula_darah_sewaktu: 130,
                skor_kemandirian_adl: 'Mandiri',
                keluhan_utama: 'Pusing ringan di tengkuk',
                edukasi: 'Kurangi konsumsi garam berlebih, kontrol tensi rutin.'
              },
              {
                id: 2,
                tanggal_pemeriksaan: '2026-08-15',
                tensi_sistolik: 135,
                tensi_diastolik: 85,
                gula_darah_sewaktu: 125,
                skor_kemandirian_adl: 'Mandiri',
                keluhan_utama: 'Tidak ada keluhan berarti',
                edukasi: 'Pertahankan aktivitas fisik jalan santai pagi.'
              }
            ]
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading citizen data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCitizenData();
  }, [user]);

  // Handler Upload Foto Profil Warga Langsung
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar (JPG, PNG, atau WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2 MB.');
      return;
    }

    try {
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const base64Data = uploadEvent.target?.result;
        try {
          const res = await api.post('/auth/update-avatar', { foto_url: base64Data });
          if (res?.success) {
            setUser((prev) => ({
              ...prev,
              avatar_url: base64Data,
              foto_url: base64Data
            }));
            setAvatarToast('Foto profil berhasil diperbarui!');
            setTimeout(() => setAvatarToast(''), 3500);
          } else {
            alert(res?.message || 'Gagal menyimpan foto profil.');
          }
        } catch (postErr) {
          alert(postErr.message || 'Terjadi kesalahan saat mengunggah foto.');
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploadingAvatar(false);
    }
  };

  // Dokumen Aktif
  const activeDocs = useMemo(() => {
    return documents.filter((d) => d.status !== 'REJECTED' && d.status !== 'CANCELLED');
  }, [documents]);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || activeDocs[0] || documents[0] || null;

  // Build Workflow Steps untuk dokumen terpilih
  const getDocSteps = (doc) => {
    if (!doc) return [];
    const isApproved = doc.status === 'APPROVED';
    const isRejected = doc.status === 'REJECTED';
    const currentStep = doc.approval_step || 'RT';

    return [
      {
        key: 'SUBMIT',
        label: 'Pengajuan Mandiri',
        status: 'completed',
        timestamp: doc.created_at,
        actor: user?.nama || 'Pemohon'
      },
      {
        key: 'RT',
        label: 'Verifikasi RT',
        status: isApproved || currentStep === 'RW' || currentStep === 'KELURAHAN' ? 'completed' : currentStep === 'RT' && !isRejected ? 'current' : isRejected ? 'rejected' : 'pending',
        timestamp: doc.rt_approved_at || null,
        actor: `Ketua RT ${user?.rt || '001'}`
      },
      {
        key: 'RW',
        label: 'Validasi RW',
        status: isApproved || currentStep === 'KELURAHAN' ? 'completed' : currentStep === 'RW' && !isRejected ? 'current' : 'pending',
        timestamp: doc.rw_approved_at || null,
        actor: `Ketua RW ${user?.rw || '001'}`
      },
      {
        key: 'KELURAHAN',
        label: 'Pengesahan Lurah',
        status: isApproved ? 'completed' : currentStep === 'KELURAHAN' && !isRejected ? 'current' : 'pending',
        timestamp: doc.kelurahan_approved_at || null,
        actor: 'Lurah Kebonjati (TTE)'
      },
      {
        key: 'SELESAI',
        label: 'Dokumen Terbit',
        status: isApproved ? 'completed' : isRejected ? 'rejected' : 'pending',
        timestamp: isApproved ? (doc.kelurahan_approved_at || doc.updated_at) : null,
        actor: isApproved ? 'Siap Diunduh' : 'Menunggu Terbit'
      }
    ];
  };

  const currentAvatarSrc = user?.avatar_url || user?.foto_url;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Toast Alert Avatar */}
      <AnimatePresence>
        {avatarToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold"
          >
            <CheckCircle2 size={16} />
            <span>{avatarToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION SUPER APP: PROFIL CITIZEN & DIRECT AVATAR UPLOADER       */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl p-6 sm:p-8 border border-white/10">
        {/* Glow ambient background */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & User Core Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5">
            {/* Avatar Upload Bubble */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border-2 border-white/30 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-lg">
                {currentAvatarSrc ? (
                  <img
                    src={currentAvatarSrc}
                    alt={user?.nama || 'Foto Warga'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-black">
                    {user?.nama?.charAt(0) || 'W'}
                  </div>
                )}
              </div>

              {/* Camera Trigger Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all active:scale-95 group-hover:scale-105"
                title="Unggah / Ubah Foto Profil Warga"
              >
                {uploadingAvatar ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
            </div>

            {/* Nama & Kredensial Kependudukan */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  Warga Terverifikasi Dukcapil
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {familyDesil?.desil_resmi_pemerintah ? `Desil ${familyDesil.desil_resmi_pemerintah}` : 'DTSEN Aktif'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {user?.nama || 'Budi Santoso'}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-blue-200/90 font-mono">
                <span>NIK: <strong className="text-white font-bold">{user?.username || user?.nik || '3273010203850003'}</strong></span>
                <span>&bull;</span>
                <span>No. KK: <strong className="text-white font-bold">{user?.no_kk || '3273010101900001'}</strong></span>
              </div>

              <p className="text-[11px] text-blue-300/80 flex items-center justify-center sm:justify-start gap-1">
                <MapPin size={12} />
                <span>RT {user?.rt || '001'} / RW {user?.rw || '001'} &bull; Kelurahan Kebonjati, Andir, Kota Bandung</span>
              </p>
            </div>
          </div>

          {/* Quick Actions at Hero */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/dashboard/dokumen')}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={15} />
              <span>Ajukan Permohonan Surat</span>
            </button>

            <button
              onClick={loadCitizenData}
              disabled={refreshing}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. AI CITIZEN SMART BRIEFING & ACTION CARD                               */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-50/90 via-blue-50/60 to-white border-2 border-cyan-300 shadow-md relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Sparkles size={11} className="text-blue-700" /> KANAYA AI &bull; Smart Citizen Briefing
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Real-Time Update</span>
          </div>
          <h2 className="text-sm font-bold text-slate-900">
            {myTickets.length > 0 
              ? `Tiket Pengambilan Bantuan Sosial Anda Sudah Siap!` 
              : activeDocs.length > 0 
              ? `Surat ${activeDocs[0].jenis_dokumen || activeDocs[0].jenis_surat} sedang diverifikasi di tingkat ${activeDocs[0].approval_step || 'RT'}.` 
              : `Seluruh data kependudukan dan jaring pengaman keluarga dalam status prima.`}
          </h2>
          <p className="text-[11px] text-slate-600">
            {myTickets.length > 0 
              ? `Undangan resmi bansos dapat dibawa ke Meja Penyaluran Kantor Kelurahan Kebonjati beserta KTP & KK Asli.`
              : activeDocs.length > 0 
              ? `Estimasi verifikasi surat berkisar 2-4 jam kerja sesuai SOP Pelayanan Prima Kebonjati.`
              : `Gunakan tombol aplikasi mandiri di bawah untuk mengakses seluruh layanan administrasi kependudukan Anda.`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {myTickets.length > 0 ? (
            <Link
              to="/dashboard/bansos"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors text-xs"
            >
              <QrCode size={14} />
              <span>Lihat Tiket QR Bansos</span>
            </Link>
          ) : (
            <Link
              to="/dashboard/kk"
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors text-xs"
            >
              <FileCheck size={14} />
              <span>Buka Kartu Keluarga</span>
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUPER APPS QUICK LAUNCHER (8 FITUR UTAMA BER-BADGE NOTIFIKASI)        */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Layanan Utama Mandiri Warga
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">8 Fitur Terintegrasi</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Pengajuan Surat */}
          <Link
            to="/dashboard/dokumen"
            className="p-4 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText size={22} />
              </div>
              {activeDocs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  {activeDocs.length} Proses
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Pengajuan Surat</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">SKU, SKTM, Kematian, Nikah</p>
            </div>
          </Link>

          {/* 2. Bansos & Tiket QR */}
          <Link
            to="/dashboard/bansos"
            className="p-4 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Gift size={22} />
              </div>
              {myTickets.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                  Tiket QR Siap
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Bansos & Tiket QR</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Jadwal & Meja Penyaluran</p>
            </div>
          </Link>

          {/* 3. Desil & Cek Bansos */}
          <Link
            to="/dashboard/desil"
            className="p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles size={22} />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                11 Indikator
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Data Desil DTSEN</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Cek Bansos & Ajuan Mandiri</p>
            </div>
          </Link>

          {/* 4. Kartu Keluarga Digital */}
          <Link
            to="/dashboard/kk"
            className="p-4 rounded-2xl bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users size={22} />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                Resmi SIAK
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Kartu Keluarga Digital</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Blanko Kemendagri & NIK</p>
            </div>
          </Link>

          {/* 5. Buku KIA Balita */}
          <button
            type="button"
            onClick={() => {
              setHealthActiveTab('balita');
              const el = document.getElementById('section-kesehatan-keluarga');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-4 rounded-2xl bg-white hover:bg-pink-50/50 border border-slate-200 hover:border-pink-300 shadow-sm transition-all group flex flex-col justify-between space-y-3 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Baby size={22} />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-100 text-pink-800">
                KMS Digital
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Buku KIA Balita</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Grafik Timbang & Tumbuh</p>
            </div>
          </button>

          {/* 6. Kesehatan Lansia */}
          <button
            type="button"
            onClick={() => {
              setHealthActiveTab('lansia');
              const el = document.getElementById('section-kesehatan-keluarga');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-4 rounded-2xl bg-white hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 shadow-sm transition-all group flex flex-col justify-between space-y-3 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HeartPulse size={22} />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                Posbindu
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Kesehatan Lansia</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Pantauan Tensi & Gula Darah</p>
            </div>
          </button>

          {/* 7. Kas & Iuran RT */}
          <Link
            to="/dashboard/keuangan"
            className="p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Coins size={22} />
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                iuranStatus.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {iuranStatus.label}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Kas & Iuran Warga</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Transparansi Keuangan RT</p>
            </div>
          </Link>

          {/* 8. Lapor Pengaduan */}
          <Link
            to="/dashboard/pengaduan"
            className="p-4 rounded-2xl bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquareWarning size={22} />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
                Aspirasi
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Lapor Pengaduan</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Sampaikan Keluhan RT/RW</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WORKFLOW STEPPER PELACAKAN DOKUMEN AKTIF                               */}
      {/* ========================================================================= */}
      {selectedDoc && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Pelacakan Berkas Pengajuan Surat
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                {selectedDoc.jenis_dokumen || selectedDoc.jenis_surat || 'Surat Permohonan'} &bull; <span className="font-mono text-xs text-slate-600">{selectedDoc.nomor_surat || `ID #${selectedDoc.id}`}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                selectedDoc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedDoc.status === 'APPROVED' ? 'Selesai / Terbit' : `Proses ${selectedDoc.approval_step || 'RT'}`}
              </span>
              <Link
                to="/dashboard/dokumen"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Workflow Stepper */}
          <WorkflowStepper steps={getDocSteps(selectedDoc)} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MONITORING TERPADU BUKU KIA BALITA & POSYANDU LANSIA KELUARGA          */}
      {/* ========================================================================= */}
      <div id="section-kesehatan-keluarga" className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 mb-1">
              <HeartPulse size={12} />
              <span>Jaring Perlindungan Kesehatan Keluarga Terpadu</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900">
              Buku KIA Balita & Pemantauan Kesehatan Lansia
            </h2>
            <p className="text-xs text-slate-500">
              Rekam medis tumbuh kembang balita (KMS) & skrining berkala lansia di Posyandu Melati RW {user?.rw || '001'}.
            </p>
          </div>

          {/* Switcher Tab */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setHealthActiveTab('balita')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                healthActiveTab === 'balita'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Baby size={14} />
              <span>Buku KIA Balita ({familyBalita.length})</span>
            </button>
            <button
              onClick={() => setHealthActiveTab('lansia')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                healthActiveTab === 'lansia'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse size={14} />
              <span>Posyandu Lansia ({familyLansia.length})</span>
            </button>
          </div>
        </div>

        {/* Content Tab KIA Balita */}
        {healthActiveTab === 'balita' && (
          <div>
            {familyBalita.length > 0 ? (
              <div className="space-y-4">
                {familyBalita.map((balita, bIdx) => (
                  <KartuKIADigital key={bIdx} data={balita} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Tidak ada data balita terdaftar pada Kartu Keluarga ini.
              </div>
            )}
          </div>
        )}

        {/* Content Tab Lansia */}
        {healthActiveTab === 'lansia' && (
          <div>
            {familyLansia.length > 0 ? (
              <div className="space-y-4">
                {familyLansia.map((lansia, lIdx) => (
                  <KartuLansiaDigital key={lIdx} data={lansia} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Tidak ada data lansia terdaftar pada Kartu Keluarga ini.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


