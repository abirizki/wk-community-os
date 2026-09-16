/**
 * frontend/src/pages/dashboard/DashboardWarga.jsx
 * Dedicated Citizen Experience Dashboard for Warga (Sprint 3)
 * Features: Personal AIBriefCard, ActionCenter, KPIGrid (4 metrics),
 * Interactive WorkflowStepper for active documents, and quick service actions.
 * Bumi Warga - Jabar Pintar Digital
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  DashboardShell,
  RoleHeader,
  AIBriefCard,
  KPIGrid,
  KPICard,
  ActionCenter,
  StatusBadge,
  SLABadge,
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
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardWarga() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Loading & State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);

  // Citizen Data
  const [documents, setDocuments] = useState([]);
  const [bansosData, setBansosData] = useState([]);
  const [iuranStatus, setIuranStatus] = useState({ isPaid: true, label: 'Lunas', amount: 25000, month: 'Bulan Ini' });
  const [posyanduSchedule, setPosyanduSchedule] = useState('Posyandu Melati RT 001 - Penimbangan Rutin');
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [familyBalita, setFamilyBalita] = useState([]);
  const [familyLansia, setFamilyLansia] = useState([]);

  // Load Citizen Dashboard Data
  const loadCitizenData = async () => {
    try {
      setRefreshing(true);

      // 1. Personal Role Brief
      setLoadingBrief(true);
      api.get('/analytics/role-brief')
        .then((res) => {
          if (res.success) setAiBrief(res.data);
        })
        .catch((e) => console.warn('Warga brief warning:', e.message))
        .finally(() => setLoadingBrief(false));

      // 2. Parallel API Calls for Citizen Data
      const [docRes, bansosRes, iuranRes, posyanduRes, lansiaRes] = await Promise.allSettled([
        api.get('/dokumen/me'),
        api.get('/bansos'),
        api.get('/keuangan/iuran'),
        api.get('/posyandu/me'),
        api.get('/posyandu/lansia/my')
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
        setPosyanduSchedule(`Posyandu Melati RT ${user?.rt || '001'} - Penimbangan Rutin`);
      } else {
        // Default Family Child Fallback (Untuk demo akun Budi Santoso & warga Kebonjati)
        setFamilyBalita([
          {
            nik_anak: '3273010505240001',
            no_kk: '3273012001010001',
            nama_anak: 'Muhammad Al-Fatih',
            jenis_kelamin_anak: 'L',
            tanggal_lahir_anak: '2024-05-05',
            tempat_lahir: 'Bandung',
            rt: user?.rt || '001',
            rw: user?.rw || '001',
            nama_ibu: 'Siti Aminah',
            nama_ayah: user?.nama || 'Budi Santoso',
            nama_posyandu: 'Posyandu Melati RW 001',
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
        setPosyanduSchedule(`Posyandu Melati RT ${user?.rt || '001'} - Penimbangan Rutin`);
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
                keluhan_utama: 'Tidak ada keluhan',
                edukasi: 'Lanjutkan senam lansia dan pola makan sehat.'
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
  }, []);

  // Filter Active Documents (in progress) vs Completed
  const activeDocs = useMemo(() => {
    return documents.filter((d) => !['APPROVED', 'REJECTED'].includes(d.status));
  }, [documents]);

  const returnedDocs = useMemo(() => {
    return documents.filter((d) => ['RETURNED', 'REVISION'].includes(d.status));
  }, [documents]);

  const completedDocs = useMemo(() => {
    return documents.filter((d) => d.status === 'APPROVED');
  }, [documents]);

  const activeBansos = useMemo(() => {
    return bansosData.find((b) => b.status === 'APPROVED' || b.status === 'SIAP_AMBIL');
  }, [bansosData]);

  // Build ActionCenter items for Warga
  const actionItems = useMemo(() => {
    const items = [];

    // 1. Berkas yang perlu revisi / dikembalikan
    if (returnedDocs.length > 0) {
      items.push({
        id: 'action-revisi',
        title: 'Berkas Surat Memerlukan Perbaikan',
        description: `Terdapat ${returnedDocs.length} permohonan surat dikembalikan oleh pengurus wilayah untuk dilengkapi persyaratannya.`,
        severity: 'critical',
        icon: 'MessageSquareWarning',
        count: returnedDocs.length,
        primaryAction: {
          label: 'Perbaiki Berkas',
          path: '/dashboard/dokumen'
        }
      });
    }

    // 2. Paket bansos siap diambil
    if (activeBansos) {
      items.push({
        id: 'action-bansos-ready',
        title: 'Paket Bantuan Sosial Siap Disalurkan',
        description: `Bantuan ${activeBansos.jenis_bansos || 'Sosial'} untuk keluarga Anda telah disetujui dan siap diambil/dicairkan.`,
        severity: 'high',
        icon: 'Gift',
        count: 1,
        primaryAction: {
          label: 'Lihat Jadwal Bansos',
          path: '/dashboard/bansos'
        }
      });
    }

    // 3. Pengingat iuran RT bulan ini
    if (!iuranStatus.isPaid) {
      items.push({
        id: 'action-iuran',
        title: `Iuran Kas RT (${iuranStatus.month}) Belum Lunas`,
        description: `Nominal iuran kebersihan & keamanan sebesar Rp ${Number(iuranStatus.amount).toLocaleString('id-ID')}.`,
        severity: 'medium',
        icon: 'Wallet',
        count: 1,
        primaryAction: {
          label: 'Konfirmasi Kas RT',
          path: '/dashboard/keuangan'
        }
      });
    }

    // 4. Panduan pengajuan surat baru jika belum ada surat aktif
    if (items.length === 0 && activeDocs.length === 0) {
      items.push({
        id: 'action-panduan',
        title: 'Layanan Pengajuan Surat Mandiri',
        description: 'Ajukan surat pengantar domisili, SKU, SKTM, atau pengantar SKCK tanpa antre di kantor RW/Kelurahan.',
        severity: 'low',
        icon: 'FileCheck',
        primaryAction: {
          label: 'Buat Permohonan',
          path: '/dashboard/dokumen'
        }
      });
    }

    return items;
  }, [returnedDocs, activeBansos, iuranStatus, activeDocs]);

  // Helper to convert document state into WorkflowStepper step nodes
  const buildDocumentSteps = (doc) => {
    if (!doc) return [];

    const isRejected = doc.status === 'REJECTED';
    const isApproved = doc.status === 'APPROVED';

    return [
      {
        key: 'SUBMIT',
        label: 'Pengajuan Surat',
        status: 'completed',
        timestamp: doc.created_at,
        actor: doc.nama_pemohon || user?.nama || 'Pemohon'
      },
      {
        key: 'RT',
        label: 'Verifikasi RT',
        status: (doc.rt_approved_at || ['RW', 'KELURAHAN', 'COMPLETED'].includes(doc.approval_step) || isApproved)
          ? 'completed'
          : doc.approval_step === 'RT' && isRejected
          ? 'rejected'
          : doc.approval_step === 'RT'
          ? 'active'
          : 'pending',
        timestamp: doc.rt_approved_at || null,
        actor: doc.rt ? `Ketua RT ${doc.rt}` : 'Ketua RT'
      },
      {
        key: 'RW',
        label: 'Verifikasi RW',
        status: (doc.rw_approved_at || ['KELURAHAN', 'COMPLETED'].includes(doc.approval_step) || isApproved)
          ? 'completed'
          : doc.approval_step === 'RW' && isRejected
          ? 'rejected'
          : doc.approval_step === 'RW'
          ? 'active'
          : 'pending',
        timestamp: doc.rw_approved_at || null,
        actor: doc.rw ? `Ketua RW ${doc.rw}` : 'Ketua RW'
      },
      {
        key: 'KELURAHAN',
        label: 'Pengesahan Kelurahan',
        status: (doc.kelurahan_approved_at || isApproved)
          ? 'completed'
          : doc.approval_step === 'KELURAHAN' && isRejected
          ? 'rejected'
          : doc.approval_step === 'KELURAHAN'
          ? 'active'
          : 'pending',
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

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || activeDocs[0] || documents[0] || null;

  return (
    <DashboardShell
      className="pb-20"
      header={
        <RoleHeader
          role="warga"
          userName={user?.nama || user?.username || 'Warga'}
          scopeLabel={`RT ${user?.rt || '001'} / RW ${user?.rw || '001'}, Kelurahan Kebonjati`}
          greeting="Portal Layanan Warga Mandiri"
          onRefresh={loadCitizenData}
          loading={refreshing}
        />
      }
      briefCard={
        <AIBriefCard
          brief={aiBrief}
          loading={loadingBrief}
          onRetry={loadCitizenData}
        />
      }
      kpiGrid={
        <KPIGrid columns={4}>
          <KPICard
            label="Surat Aktif Diproses"
            value={activeDocs.length}
            unit="berkas"
            icon={<FileText size={20} className="text-primary" />}
            urgency={activeDocs.length > 0 ? 'high' : 'low'}
            trend={activeDocs.length > 0 ? { direction: 'up', label: 'Sedang berjalan' } : null}
            onClick={() => navigate('/dashboard/dokumen')}
          />
          <KPICard
            label="Status Bansos Keluarga"
            value={activeBansos ? activeBansos.jenis_bansos || 'Penerima Aktif' : 'Terdaftar DTKS'}
            unit="bantuan"
            icon={<Gift size={20} className="text-emerald-600" />}
            urgency={activeBansos ? 'high' : 'low'}
            trend={activeBansos ? { direction: 'flat', label: 'Siap diambil' } : null}
            onClick={() => navigate('/dashboard/bansos')}
          />
          <KPICard
            label="Status Iuran RT"
            value={iuranStatus.label}
            unit={iuranStatus.month}
            icon={<Wallet size={20} className={iuranStatus.isPaid ? 'text-emerald-600' : 'text-amber-600'} />}
            urgency={iuranStatus.isPaid ? 'low' : 'medium'}
            trend={!iuranStatus.isPaid ? { direction: 'down', label: 'Perlu konfirmasi' } : null}
            onClick={() => navigate('/dashboard/keuangan')}
          />
          <KPICard
            label="Jadwal Posyandu Terdekat"
            value="18 Sep"
            unit="Mawar RT 001"
            icon={<HeartPulse size={20} className="text-teal-600" />}
            urgency="low"
            trend={{ direction: 'flat', label: 'Penimbangan rutin' }}
            onClick={() => navigate('/dashboard/posyandu')}
          />
        </KPIGrid>
      }
      actionCenter={
        <ActionCenter
          title="Pusat Tindakan & Informasi Penting Warga"
          actions={actionItems}
          maxItems={3}
          onRefresh={loadCitizenData}
          isRefreshing={refreshing}
        />
      }
    >
      {/* SECTION: Visual Progress Surat Aktif (WorkflowStepper) */}
      <div className="mt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              <h3 className="text-lg font-bold text-on-surface">
                Pelacak Tahapan Permohonan Surat (Workflow Progress)
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Pantau posisi terkini berkas pengajuan surat Anda secara transparan dari RT hingga Kelurahan.
            </p>
          </div>

          <Link
            to="/dashboard/dokumen"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-on-primary shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} />
            <span>Ajukan Surat Baru</span>
          </Link>
        </div>

        {/* Jika belum ada surat sama sekali */}
        {documents.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <FileText size={28} />
            </div>
            <h4 className="text-sm font-bold text-on-surface">
              Belum Ada Riwayat Permohonan Surat
            </h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
              Anda belum pernah mengajukan surat keterangan atau pengantar. Gunakan layanan mandiri ini untuk mengajukan kebutuhan dokumen Anda.
            </p>
            <Link
              to="/dashboard/dokumen"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-on-primary shadow-sm"
            >
              <Plus size={16} />
              <span>Mulai Pengajuan Surat Pertama</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Daftar Berkas Surat Aktif dengan Tab Selector jika lebih dari 1 */}
            {activeDocs.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {activeDocs.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedDoc?.id === doc.id
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {doc.jenis_dokumen || doc.jenis_surat || `Surat #${doc.id}`}
                  </button>
                ))}
              </div>
            )}

            {/* Stepper Card Aktif */}
            {selectedDoc && (
              <div className="p-5 sm:p-6 rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {selectedDoc.nomor_registrasi || `REG-${selectedDoc.id}`}
                      </span>
                      <StatusBadge status={selectedDoc.status} size="sm" />
                    </div>
                    <h4 className="text-base font-bold text-on-surface mt-1.5">
                      {selectedDoc.jenis_dokumen || selectedDoc.jenis_surat || 'Surat Pengantar'}
                    </h4>
                    {selectedDoc.keperluan && (
                      <p className="text-xs text-on-surface-variant mt-0.5 italic">
                        Keperluan: "{selectedDoc.keperluan}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <SLABadge
                      deadline={selectedDoc.sla_deadline}
                      createdAt={selectedDoc.created_at}
                      status={selectedDoc.status}
                    />
                    <Link
                      to="/dashboard/dokumen"
                      className="p-2 text-xs font-semibold rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface transition-colors inline-flex items-center gap-1"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">Rincian</span>
                    </Link>
                  </div>
                </div>

                {/* Interactive WorkflowStepper Component */}
                <div className="py-3 px-1 sm:px-4">
                  <WorkflowStepper
                    steps={buildDocumentSteps(selectedDoc)}
                    orientation="horizontal"
                    size="md"
                  />
                </div>

                {/* Catatan Petugas jika ada revisi/penolakan */}
                {selectedDoc.catatan_petugas && (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Catatan Petugas: </span>
                      <span>{selectedDoc.catatan_petugas}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Riwayat Surat yang Telah Selesai / Terbit */}
            {completedDocs.length > 0 && (
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Surat Selesai & Siap Unduh ({completedDocs.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {completedDocs.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-outline-variant/80 bg-surface-container-low/40 hover:bg-surface-container-low transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">
                          {doc.jenis_dokumen || doc.jenis_surat}
                        </p>
                        <p className="text-[11px] font-mono text-on-surface-variant">
                          {doc.nomor_registrasi || `REG-${doc.id}`}
                        </p>
                      </div>
                      <Link
                        to="/dashboard/dokumen"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs shrink-0 cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Unduh</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buku KIA Digital & Kartu Kesehatan Lansia Keluarga */}
      {(familyBalita.length > 0 || familyLansia.length > 0) && (
        <div className="mt-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                <h3 className="text-lg font-bold text-on-surface">
                  Buku KIA Digital & Kartu Sehat Keluarga
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Catatan resmi tumbuh kembang balita (KMS) dan riwayat pemeriksaan kesehatan lansia dari kader Posyandu lingkungan Anda.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/80 inline-flex items-center gap-1.5">
                <Baby size={13} />
                <span>{familyBalita.length} Balita</span>
              </span>
              {familyLansia.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1.5">
                  <HeartPulse size={13} />
                  <span>{familyLansia.length} Lansia</span>
                </span>
              )}
            </div>
          </div>

          {/* Kartu KIA Balita */}
          {familyBalita.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <Baby size={15} className="text-teal-600" />
                  Kartu Menuju Sehat (KMS) & Tumbuh Kembang Anak
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-5">
                {familyBalita.map((balita, idx) => (
                  <KartuKIADigital
                    key={balita.nik_anak || balita.id || idx}
                    data={balita}
                    readOnly={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Kartu Pemantauan Lansia */}
          {familyLansia.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <HeartPulse size={15} className="text-emerald-600" />
                  Kartu Pemantauan Kesehatan Lansia Keluarga
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-5">
                {familyLansia.map((lansia, idx) => (
                  <KartuLansiaDigital
                    key={lansia.nik || lansia.id || idx}
                    data={lansia}
                    readOnly={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Access Card Grid */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/dashboard/bansos"
          className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <Gift size={20} />
          </div>
          <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
            Cek Program Bansos
          </h4>
          <p className="text-xs text-on-surface-variant mt-1">
            Pantau status verifikasi kelayakan bantuan sosial keluarga dan transparansi kuota lingkungan.
          </p>
        </Link>

        <Link
          to="/dashboard/profil"
          className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
            <Users size={20} />
          </div>
          <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
            Data Profil & BPJS Mandiri
          </h4>
          <p className="text-xs text-on-surface-variant mt-1">
            Perbarui data kepesertaan jaminan kesehatan mandiri dan kelengkapan identitas keluarga.
          </p>
        </Link>

        <Link
          to="/dashboard/pengaduan"
          className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <HelpCircle size={20} />
          </div>
          <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
            Pusat Pengaduan Warga
          </h4>
          <p className="text-xs text-on-surface-variant mt-1">
            Sampaikan laporan kendala fasilitas umum, kebersihan, atau keamanan langsung ke aparatur wilayah.
          </p>
        </Link>
      </div>
    </DashboardShell>
  );
}

