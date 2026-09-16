/**
 * frontend/src/pages/dashboard/DashboardKetuaRT.jsx
 * Dedicated Action-Oriented Dashboard for Ketua RT (Sprint 2)
 * Features: SLA Countdown, Aging Sorting, Quick One-Touch Verification, Action Center
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
  SLABadge
} from '../../components/design-system';
import {
  FileCheck,
  Clock,
  AlertTriangle,
  Users,
  Wallet,
  Baby,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowUpDown,
  RefreshCw,
  Eye,
  FileText,
  Gift,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardKetuaRT() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);

  // RT Data
  const [pendingDocs, setPendingDocs] = useState([]);
  const [docStats, setDocStats] = useState({ pending_rt: 0, total_approved: 0, total_rejected: 0, compliance_rate: '100%' });
  const [iuranSummary, setIuranSummary] = useState({ total_kk: 0, sudah_bayar: 0, belum_bayar: 0, persentase: '0%' });
  const [balitaRisikoCount, setBalitaRisikoCount] = useState(0);
  const [auditSanggahanPending, setAuditSanggahanPending] = useState([]);

  // Sorting: 'aging_desc' (paling lama di atas) | 'aging_asc' (terbaru di atas)
  const [sortBy, setSortBy] = useState('aging_desc');

  // Quick Action Modal / State
  const [processingId, setProcessingId] = useState(null);
  const [rejectModalDoc, setRejectModalDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState('');

  // Fetch all RT Dashboard Data
  const loadRTData = async () => {
    try {
      setRefreshing(true);

      // 1. Role AI Brief
      setLoadingBrief(true);
      api.get('/analytics/role-brief')
        .then((res) => {
          if (res.success) setAiBrief(res.data);
        })
        .catch((e) => console.warn('Brief fetch warn:', e.message))
        .finally(() => setLoadingBrief(false));

      // 2. Pending Dokumen di RT
      const [docListRes, docStatsRes, iuranRes, bansosRes, balitaRes] = await Promise.allSettled([
        api.get('/dokumen?status=SUBMITTED&approval_step=RT'),
        api.get(`/dokumen/stats?rt=${user?.rt || '001'}&rw=${user?.rw || '001'}`),
        api.get(`/keuangan/iuran?rt=${user?.rt || '001'}&rw=${user?.rw || '001'}`),
        api.get('/bansos/audit-sanggahan'),
        api.get(`/posyandu/balita/stats?rt=${user?.rt || '001'}`)
      ]);

      // Handle Dokumen Antrean
      if (docListRes.status === 'fulfilled' && docListRes.value?.success) {
        const rawDocs = docListRes.value.data || [];
        // Filter specifically documents needing RT verification
        const forRT = rawDocs.filter((d) => d.approval_step === 'RT' && d.status !== 'REJECTED');
        setPendingDocs(forRT);
      }

      // Handle Stats
      if (docStatsRes.status === 'fulfilled' && docStatsRes.value?.success) {
        setDocStats(docStatsRes.value.data || {});
      }

      // Handle Iuran
      if (iuranRes.status === 'fulfilled' && iuranRes.value?.data) {
        const iuranList = iuranRes.value.data || [];
        const lunas = iuranList.filter((i) => i.status_bayar === 'LUNAS').length;
        const total = iuranList.length || 1;
        const pct = Math.round((lunas / total) * 100);
        setIuranSummary({
          total_kk: total,
          sudah_bayar: lunas,
          belum_bayar: total - lunas,
          persentase: `${pct}%`
        });
      }

      // Handle Bansos Sanggahan
      if (bansosRes.status === 'fulfilled' && bansosRes.value?.data) {
        const list = bansosRes.value.data || [];
        const pendingSanggahan = list.filter((s) => s.status_review === 'PENDING_KELURAHAN' && s.rt === (user?.rt || '001'));
        setAuditSanggahanPending(pendingSanggahan);
      }

      // Handle Balita Risiko
      if (balitaRes.status === 'fulfilled' && balitaRes.value?.data) {
        const bStats = balitaRes.value.data || {};
        setBalitaRisikoCount(bStats.berisiko_stunting || (bStats.gizi_kurang || 0) + (bStats.gizi_buruk || 0));
      }

    } catch (err) {
      console.warn('[DashboardRT] Error loading data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRTData();
  }, [user?.rt, user?.rw]);

  // ===========================================================================
  // SORTING AGING LOGIC
  // ===========================================================================
  const sortedDocs = useMemo(() => {
    const list = [...pendingDocs];
    list.sort((a, b) => {
      const timeA = new Date(a.created_at || a.rt_received_at || 0).getTime();
      const timeB = new Date(b.created_at || b.rt_received_at || 0).getTime();
      // aging_desc: paling lama diajukan (timestamp terkecil) berada di paling atas
      if (sortBy === 'aging_desc') {
        return timeA - timeB;
      }
      // aging_asc: paling baru diajukan di atas
      return timeB - timeA;
    });
    return list;
  }, [pendingDocs, sortBy]);

  // ===========================================================================
  // ONE-TOUCH QUICK VERIFICATION
  // ===========================================================================
  const handleQuickApprove = async (docId, docTitle) => {
    if (!window.confirm(`Setujui permohonan surat "${docTitle}" dan teruskan ke Ketua RW?`)) {
      return;
    }

    try {
      setProcessingId(docId);
      const res = await api.patch(`/dokumen/${docId}/approve`, {
        catatan: 'Disetujui oleh Ketua RT melalui Verifikasi Cepat (One-Touch).'
      });

      if (res.success) {
        setActionSuccessToast(`Surat "${docTitle}" berhasil diverifikasi dan diteruskan ke RW!`);
        setTimeout(() => setActionSuccessToast(''), 4000);
        // Refresh local list
        setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
        loadRTData();
      } else {
        alert(res.message || 'Gagal memproses persetujuan');
      }
    } catch (e) {
      alert(e.message || 'Terjadi kesalahan saat memproses verifikasi');
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickReject = async () => {
    if (!rejectModalDoc) return;
    if (!rejectReason.trim()) {
      alert('Mohon masukkan alasan penolakan agar pemohon dapat memperbaiki.');
      return;
    }

    try {
      setProcessingId(rejectModalDoc.id);
      const res = await api.patch(`/dokumen/${rejectModalDoc.id}/reject`, {
        catatan: rejectReason.trim()
      });

      if (res.success) {
        setActionSuccessToast(`Permohonan surat berhasil ditolak dengan pemberitahuan ke warga.`);
        setTimeout(() => setActionSuccessToast(''), 4000);
        setPendingDocs((prev) => prev.filter((d) => d.id !== rejectModalDoc.id));
        setRejectModalDoc(null);
        setRejectReason('');
        loadRTData();
      } else {
        alert(res.message || 'Gagal menolak dokumen');
      }
    } catch (e) {
      alert(e.message || 'Terjadi kesalahan saat menolak permohonan');
    } finally {
      setProcessingId(null);
    }
  };

  // ===========================================================================
  // ACTION CENTER DATA
  // ===========================================================================
  const actionItems = useMemo(() => {
    const list = [];

    // 1. Berkas mendekati / melampaui SLA 4 jam
    sortedDocs.forEach((doc) => {
      const created = doc.rt_received_at || doc.created_at;
      const deadline = doc.sla_deadline;
      
      list.push({
        id: `act-doc-${doc.id}`,
        title: `Verifikasi: ${doc.jenis_surat || doc.jenis_dokumen || 'Surat Pengantar'}`,
        description: `Pemohon: ${doc.nama_pemohon || doc.nik_pemohon}. Keperluan: "${doc.keperluan || '-'}"`,
        severity: 'critical',
        deadline: deadline ? `Tenggat SLA: ${new Date(deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'SLA 24 Jam',
        icon: 'FileCheck',
        primaryAction: {
          label: 'Setujui',
          onClick: () => handleQuickApprove(doc.id, doc.jenis_surat || 'Surat')
        },
        secondaryAction: {
          label: 'Tolak / Revisi',
          onClick: () => {
            setRejectModalDoc(doc);
            setRejectReason('');
          }
        }
      });
    });

    // 2. Sanggahan Bansos RT Pending
    if (auditSanggahanPending.length > 0) {
      list.push({
        id: 'act-bansos-sanggahan',
        title: `${auditSanggahanPending.length} Usulan Sanggahan Bansos Menunggu Review`,
        description: 'Laporan lapangan ketidaklayakan penerima bansos sedang dalam peninjauan Kelurahan.',
        severity: 'high',
        icon: 'Gift',
        primaryAction: {
          label: 'Cek Status Sanggahan',
          onClick: () => navigate('/dashboard/bansos')
        }
      });
    }

    // 3. KK Menunggak Iuran
    if (iuranSummary.belum_bayar > 0) {
      list.push({
        id: 'act-iuran-warga',
        title: `${iuranSummary.belum_bayar} KK Belum Membayar Iuran Bulan Ini`,
        description: `Kolektivitas iuran wilayah RT mencapai ${iuranSummary.persentase} (${iuranSummary.sudah_bayar}/${iuranSummary.total_kk} KK).`,
        severity: 'medium',
        icon: 'Wallet',
        primaryAction: {
          label: 'Buka Buku Kas RT',
          onClick: () => navigate('/dashboard/keuangan')
        }
      });
    }

    return list;
  }, [sortedDocs, auditSanggahanPending, iuranSummary, navigate]);

  return (
    <DashboardShell
      // 1. Header Role Ketua RT
      header={
        <RoleHeader
          role="ketua_rt"
          userName={user?.nama || 'Ketua RT'}
          scopeLabel={`RT ${user?.rt || '001'} / RW ${user?.rw || '001'} · Kelurahan Kebonjati`}
          onRefresh={loadRTData}
          loading={refreshing}
        />
      }
      // 2. Role-Scoped AI Brief
      briefCard={
        <AIBriefCard
          brief={aiBrief}
          loading={loadingBrief}
          onRetry={loadRTData}
        />
      }
      // 3. Grid KPI RT (Maksimal 4)
      kpiGrid={
        <KPIGrid columns={4}>
          <KPICard
            label="Antrean Masuk RT"
            value={pendingDocs.length}
            unit="berkas"
            icon={<FileCheck size={20} />}
            urgency={pendingDocs.length > 0 ? 'critical' : 'low'}
            onClick={() => {
              const el = document.getElementById('antrean-verifikasi-rt');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <KPICard
            label="Kepatuhan SLA RT"
            value={pendingDocs.length === 0 ? '100%' : `${Math.max(60, 100 - pendingDocs.length * 10)}%`}
            unit="target"
            icon={<Clock size={20} />}
            urgency={pendingDocs.length > 2 ? 'high' : 'low'}
          />
          <KPICard
            label="Kolektivitas Iuran"
            value={iuranSummary.persentase}
            unit={`${iuranSummary.sudah_bayar} KK`}
            icon={<Wallet size={20} />}
            urgency="medium"
            onClick={() => navigate('/dashboard/keuangan')}
          />
          <KPICard
            label="Balita Risiko di RT"
            value={balitaRisikoCount}
            unit="anak"
            icon={<Baby size={20} />}
            urgency={balitaRisikoCount > 0 ? 'high' : 'low'}
            onClick={() => navigate('/dashboard/posyandu')}
          />
        </KPIGrid>
      }
      // 4. Action Center Prioritas
      actionCenter={
        <ActionCenter
          title="Tindakan Prioritas & Verifikasi Berkas RT"
          actions={actionItems}
          onRefresh={loadRTData}
          isRefreshing={refreshing}
        />
      }
    >
      {/* Toast Notifikasi Berhasil */}
      <AnimatePresence>
        {actionSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SECTION ANTREAN VERIFIKASI DOKUMEN RT (DENGAN SORTING AGING)               */}
      {/* ========================================================================= */}
      <div id="antrean-verifikasi-rt" className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
        {/* Header Seksi & Kontrol Sorting */}
        <div className="p-4 sm:p-5 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/30">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-on-surface">
                Daftar Antrean Permohonan Surat Warga
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary">
                {pendingDocs.length} berkas
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Prioritas persetujuan berjenjang. Berkas dengan waktu tunggu paling lama diutamakan.
            </p>
          </div>

          {/* Kontrol Tombol Urutkan Berdasarkan Aging */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setSortBy((prev) => (prev === 'aging_desc' ? 'aging_asc' : 'aging_desc'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer"
              title="Ubah urutan antrean berdasarkan waktu tunggu (aging)"
            >
              <ArrowUpDown size={14} className="text-primary" />
              <span>
                {sortBy === 'aging_desc' ? 'Paling Lama Diajukan' : 'Paling Baru Diajukan'}
              </span>
            </button>

            <button
              type="button"
              onClick={loadRTData}
              disabled={refreshing}
              className="p-1.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              title="Muat ulang antrean"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tabel / Daftar Antrean Surat */}
        {sortedDocs.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-on-surface">Semua Berkas Surat RT Selesai Diverifikasi!</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              Tidak ada permohonan surat warga yang tertahan di tingkat RT {user?.rt || '001'}. Kepatuhan pelayanan prima terjaga.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {sortedDocs.map((doc, idx) => {
              const isProcessingThis = processingId === doc.id;
              const docTitle = doc.jenis_surat || doc.jenis_dokumen || 'Surat Pengantar';
              const createdDate = doc.rt_received_at || doc.created_at;

              return (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 hover:bg-surface-container-low/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Info Dokumen & Pemohon */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {doc.nomor_registrasi || `REG-${doc.id}`}
                      </span>
                      <StatusBadge status="PENDING_RT" />
                      {/* SLA Countdown Badge */}
                      <SLABadge
                        deadline={doc.sla_deadline}
                        createdAt={createdDate}
                        status={doc.status}
                      />
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-on-surface tracking-tight">
                      {docTitle}
                    </h4>

                    <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span><strong>Pemohon:</strong> {doc.nama_pemohon || 'Warga'} (NIK: {doc.nik_pemohon})</span>
                      <span>•</span>
                      <span><strong>Keperluan:</strong> {doc.keperluan || '-'}</span>
                      <span>•</span>
                      <span>Diajukan: {createdDate ? new Date(createdDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</span>
                    </div>
                  </div>

                  {/* ONE-TOUCH QUICK ACTIONS BUTTONS */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 self-end lg:self-center">
                    {/* Tombol Tolak / Kembalikan */}
                    <button
                      type="button"
                      disabled={isProcessingThis}
                      onClick={() => {
                        setRejectModalDoc(doc);
                        setRejectReason('');
                      }}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 active:scale-95 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Kembalikan atau tolak permohonan surat"
                    >
                      <XCircle size={15} />
                      <span>Tolak / Catatan</span>
                    </button>

                    {/* Tombol One-Touch Setujui */}
                    <button
                      type="button"
                      disabled={isProcessingThis}
                      onClick={() => handleQuickApprove(doc.id, docTitle)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Verifikasi dengan satu klik dan teruskan ke RW"
                    >
                      {isProcessingThis ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      <span>Setujui (Teruskan RW)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL PENOLAKAN / CATATAN REVISI DOKUMEN                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rejectModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <XCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Kembalikan / Tolak Permohonan</h4>
                    <p className="text-[11px] text-on-surface-variant">Sampaikan alasan kekurangan berkas kepada pemohon.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectModalDoc(null)}
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg space-y-1">
                <p><strong>Dokumen:</strong> {rejectModalDoc.jenis_surat || rejectModalDoc.jenis_dokumen}</p>
                <p><strong>Pemohon:</strong> {rejectModalDoc.nama_pemohon || rejectModalDoc.nik_pemohon}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Alasan Penolakan / Catatan Perbaikan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Lampiran foto KTP/KK buram, silakan ajukan ulang dengan foto yang jelas."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalDoc(null)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg text-on-surface-variant hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleQuickReject}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
                >
                  Kirim Penolakan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

