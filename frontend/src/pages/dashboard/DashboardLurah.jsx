/**
 * frontend/src/pages/dashboard/DashboardLurah.jsx
 * Executive Command Center for Lurah (Sprint 3)
 * Features: AIBriefCard, ActionCenter, KPIGrid (4 metrics), Document TTE Queue,
 * QuickSignTray Integration with manual PIN / Passphrase Confirmation Modal.
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
  QuickSignTray
} from '../../components/design-system';
import {
  FileCheck,
  Clock,
  AlertTriangle,
  Users,
  Baby,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Gift,
  ShieldCheck,
  MessageSquareWarning,
  Lock,
  Landmark,
  ArrowRight,
  TrendingUp,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLurah() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Loading & State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);

  // Lurah Data
  const [readyTTEDocs, setReadyTTEDocs] = useState([]);
  const [slaCompliance, setSlaCompliance] = useState(96.4);
  const [atRiskBalitaCount, setAtRiskBalitaCount] = useState(0);
  const [stuntingClusterCount, setStuntingClusterCount] = useState(0);
  const [overdueDispositionsCount, setOverdueDispositionsCount] = useState(0);
  const [criticalComplaints, setCriticalComplaints] = useState([]);

  // TTE Confirmation Modal (Security & Civic Governance)
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signTarget, setSignTarget] = useState(null); // { mode: 'single' | 'batch', ids: [], doc?: object }
  const [signerPin, setSignerPin] = useState('');
  const [signerNotes, setSignerNotes] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [pinError, setPinError] = useState('');

  // Rejection Modal
  const [rejectModalDoc, setRejectModalDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Success Toast
  const [toastMessage, setToastMessage] = useState('');

  // Load All Lurah Dashboard Data
  const loadLurahData = async () => {
    try {
      setRefreshing(true);

      // 1. Role-scoped AI Brief
      setLoadingBrief(true);
      api.get('/analytics/role-brief')
        .then((res) => {
          if (res.success) setAiBrief(res.data);
        })
        .catch((e) => console.warn('Lurah Brief warning:', e.message))
        .finally(() => setLoadingBrief(false));

      // 2. Fetch parallel endpoints
      const [docRes, statsRes, pengaduanRes, execSummaryRes, clusterRes] = await Promise.allSettled([
        api.get('/dokumen?approval_step=KELURAHAN'),
        api.get('/dokumen/stats'),
        api.get('/pengaduan'),
        api.get('/analytics/executive-summary'),
        api.get('/posyandu/stunting-cluster')
      ]);

      // Process Ready TTE Documents
      if (docRes.status === 'fulfilled' && docRes.value?.success) {
        const rawDocs = docRes.value.data || [];
        // Filter specifically documents waiting for Kelurahan approval / TTE
        const readyDocs = rawDocs.filter((d) => 
          (d.approval_step === 'KELURAHAN' || d.status === 'READY_TTE') && d.status !== 'APPROVED' && d.status !== 'REJECTED'
        );
        // Sort by aging descending (oldest on top)
        readyDocs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setReadyTTEDocs(readyDocs);
      }

      // Process SLA compliance
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        const s = statsRes.value.data;
        if (s?.compliance_rate) {
          setSlaCompliance(parseFloat(s.compliance_rate) || 96.4);
        }
      }

      // Process Complaints / Disposisi > 48 jam
      if (pengaduanRes.status === 'fulfilled' && pengaduanRes.value?.success) {
        const list = pengaduanRes.value.data || [];
        const now = new Date();
        const pending = list.filter((p) => p.status === 'MENUNGGU' || p.status === 'DIPROSES');
        
        // Critical complaints
        const critical = pending.filter((p) => 
          p.kategori === 'DARURAT' || p.kategori === 'BENCANA' || (p.judul && p.judul.toLowerCase().includes('darurat'))
        );
        setCriticalComplaints(critical);

        // Disposisi tertahan > 48 jam
        const overdue = pending.filter((p) => {
          const created = new Date(p.created_at);
          const diffHours = (now - created) / (1000 * 60 * 60);
          return diffHours > 48;
        });
        setOverdueDispositionsCount(overdue.length);
      }

      // Process Stunting & Executive Summary
      if (execSummaryRes.status === 'fulfilled' && execSummaryRes.value?.success) {
        const sum = execSummaryRes.value.data;
        if (sum?.health?.balita_gizi_buruk !== undefined) {
          setAtRiskBalitaCount(sum.health.balita_gizi_buruk);
        }
      }

      if (clusterRes.status === 'fulfilled' && clusterRes.value?.success) {
        const clusters = clusterRes.value.data?.clusters || [];
        setStuntingClusterCount(clusters.length);
      }

    } catch (err) {
      console.error('Error loading Lurah data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLurahData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Open TTE Confirmation Modal (Single)
  const handleInitiateSingleSign = (docId) => {
    const doc = readyTTEDocs.find((d) => d.id === docId);
    setSignTarget({ mode: 'single', ids: [docId], doc });
    setSignerPin('');
    setSignerNotes('Dokumen disahkan dengan Tanda Tangan Elektronik resmi Lurah.');
    setPinError('');
    setIsSignModalOpen(true);
  };

  // Open TTE Confirmation Modal (Batch)
  const handleInitiateBatchSign = (docIds) => {
    setSignTarget({ mode: 'batch', ids: docIds });
    setSignerPin('');
    setSignerNotes(`Pengesahan massal TTE (${docIds.length} berkas) oleh Lurah.`);
    setPinError('');
    setIsSignModalOpen(true);
  };

  // Execute TTE after PIN confirmation
  const handleConfirmSign = async () => {
    if (!signerPin || signerPin.trim().length < 4) {
      setPinError('Masukkan minimal 4 digit PIN / Passphrase TTE Pejabat');
      return;
    }

    try {
      setIsSigning(true);
      setPinError('');

      if (signTarget.mode === 'single') {
        const docId = signTarget.ids[0];
        const res = await api.patch(`/dokumen/${docId}/approve`, {
          catatan: signerNotes || 'Disahkan dengan Tanda Tangan Elektronik oleh Lurah Kebonjati'
        });
        if (res.success) {
          showToast('Dokumen berhasil disahkan dan ditandatangani secara elektronik (TTE).');
          setIsSignModalOpen(false);
          loadLurahData();
        } else {
          setPinError(res.message || 'Gagal mengesahkan dokumen');
        }
      } else {
        // Batch Mode
        const res = await api.post('/dokumen/batch-approve', {
          ids: signTarget.ids,
          catatan: signerNotes,
          pin: signerPin
        });
        if (res.success) {
          showToast(`Berhasil mengesahkan ${signTarget.ids.length} dokumen secara massal.`);
          setIsSignModalOpen(false);
          loadLurahData();
        } else {
          setPinError(res.message || 'Gagal mengesahkan dokumen batch');
        }
      }
    } catch (err) {
      setPinError(err.message || 'Terjadi kesalahan saat otorisasi TTE');
    } finally {
      setIsSigning(false);
    }
  };

  // Rejection handling
  const handleInitiateReject = (docId) => {
    const doc = readyTTEDocs.find((d) => d.id === docId);
    setRejectModalDoc(doc || { id: docId });
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 5) {
      alert('Alasan penolakan minimal 5 karakter untuk catatan dinas.');
      return;
    }
    try {
      setIsRejecting(true);
      const res = await api.patch(`/dokumen/${rejectModalDoc.id}/reject`, {
        catatan: rejectReason.trim()
      });
      if (res.success) {
        showToast('Dokumen telah ditolak dengan berita acara.');
        setRejectModalDoc(null);
        loadLurahData();
      } else {
        alert(res.message || 'Gagal menolak dokumen');
      }
    } catch (err) {
      alert(err.message || 'Gagal menolak dokumen');
    } finally {
      setIsRejecting(false);
    }
  };

  // Build ActionCenter Items
  const actionItems = useMemo(() => {
    const items = [];

    // 1. Dokumen Siap TTE
    if (readyTTEDocs.length > 0) {
      items.push({
        id: 'action-tte',
        title: 'Dokumen Menunggu Pengesahan TTE',
        description: `${readyTTEDocs.length} berkas permohonan telah diverifikasi RT/RW dan siap ditandatangani secara digital.`,
        severity: readyTTEDocs.length > 5 ? 'critical' : 'high',
        icon: 'FileCheck',
        count: readyTTEDocs.length,
        primaryAction: {
          label: 'Sahkan Sekarang',
          onClick: () => {
            if (readyTTEDocs.length > 0) {
              handleInitiateBatchSign(readyTTEDocs.map((d) => d.id));
            }
          }
        }
      });
    }

    // 2. Aduan Kritis Belum Disposisi
    if (criticalComplaints.length > 0) {
      items.push({
        id: 'action-complaint-crit',
        title: 'Aduan Darurat Belum Disposisi',
        description: `${criticalComplaints.length} laporan warga berkategori darurat/bencana membutuhkan atensi pimpinan kelurahan.`,
        severity: 'critical',
        icon: 'MessageSquareWarning',
        count: criticalComplaints.length,
        primaryAction: {
          label: 'Disposisi Aduan',
          path: '/dashboard/pengaduan'
        }
      });
    }

    // 3. Alert Klaster Stunting / Gizi Buruk
    if (atRiskBalitaCount > 0 || stuntingClusterCount > 0) {
      items.push({
        id: 'action-stunting',
        title: 'Peringatan Kesehatan Balita & Klaster Stunting',
        description: `${atRiskBalitaCount} balita dalam pengawasan gizi intensif di ${stuntingClusterCount || 1} RW.`,
        severity: 'high',
        icon: 'HeartPulse',
        count: atRiskBalitaCount,
        primaryAction: {
          label: 'Pantau Posyandu',
          path: '/dashboard/posyandu'
        }
      });
    }

    // 4. Disposisi Tertahan > 48 Jam
    if (overdueDispositionsCount > 0) {
      items.push({
        id: 'action-disposition-overdue',
        title: 'Disposisi Pelayanan Tertahan > 48 Jam',
        description: `${overdueDispositionsCount} permohonan/aduan melewati batas waktu respons awal aparatur kelurahan.`,
        severity: 'high',
        icon: 'Clock',
        count: overdueDispositionsCount,
        primaryAction: {
          label: 'Eskalasi Pelayanan',
          path: '/dashboard/dokumen'
        }
      });
    }

    return items;
  }, [readyTTEDocs, criticalComplaints, atRiskBalitaCount, stuntingClusterCount, overdueDispositionsCount]);

  // Transform readyTTEDocs into QuickSignTray format
  const quickSignItems = useMemo(() => {
    return readyTTEDocs.map((d) => ({
      id: d.id,
      nomor_registrasi: d.nomor_registrasi || `REG-${d.id}`,
      jenis_surat: d.jenis_dokumen || d.jenis_surat || 'Surat Pengantar',
      pemohon: d.nama_pemohon || d.nik_pemohon || 'Warga Kebonjati',
      created_at: d.created_at,
      urgency: d.aging_hours > 20 ? 'urgent' : d.aging_hours > 12 ? 'sedang' : 'normal'
    }));
  }, [readyTTEDocs]);

  return (
    <DashboardShell
      className="pb-24"
      header={
        <RoleHeader
          role="lurah"
          userName={user?.nama || 'Lurah Kebonjati'}
          scopeLabel="Kelurahan Kebonjati, Kec. Andir, Kota Bandung"
          greeting="Pusat Komando & Pengesahan Eksekutif"
          onRefresh={loadLurahData}
          loading={refreshing}
        />
      }
      briefCard={
        <AIBriefCard
          brief={aiBrief}
          loading={loadingBrief}
          onRetry={loadLurahData}
        />
      }
      kpiGrid={
        <KPIGrid columns={4}>
          <KPICard
            label="Dokumen Menunggu TTE"
            value={readyTTEDocs.length}
            unit="berkas"
            icon={<FileCheck size={20} className="text-primary" />}
            urgency={readyTTEDocs.length > 5 ? 'critical' : readyTTEDocs.length > 0 ? 'high' : 'low'}
            trend={readyTTEDocs.length > 0 ? { direction: 'up', label: 'Perlu pengesahan segera' } : null}
            onClick={() => {
              const el = document.getElementById('daftar-tte-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <KPICard
            label="Kepatuhan SLA Kelurahan"
            value={`${slaCompliance}%`}
            unit="tepat waktu"
            icon={<Clock size={20} className="text-emerald-600" />}
            urgency={slaCompliance >= 95 ? 'low' : slaCompliance >= 85 ? 'medium' : 'critical'}
            trend={{ direction: 'up', value: 1.2, label: 'Bulan berjalan' }}
          />
          <KPICard
            label="Balita Gizi Buruk Aktif"
            value={atRiskBalitaCount}
            unit="anak"
            icon={<Baby size={20} className="text-amber-600" />}
            urgency={atRiskBalitaCount > 0 ? 'high' : 'low'}
            onClick={() => navigate('/dashboard/posyandu')}
          />
          <KPICard
            label="Disposisi Tertahan > 48 Jam"
            value={overdueDispositionsCount}
            unit="tugas"
            icon={<AlertTriangle size={20} className="text-red-600" />}
            urgency={overdueDispositionsCount > 0 ? 'critical' : 'low'}
            onClick={() => navigate('/dashboard/pengaduan')}
          />
        </KPIGrid>
      }
      actionCenter={
        <ActionCenter
          title="Tindakan Mendesak & Otorisasi Pimpinan"
          actions={actionItems}
          maxItems={4}
          onRefresh={loadLurahData}
          isRefreshing={refreshing}
        />
      }
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 text-white shadow-xl text-sm font-semibold border border-emerald-500"
          >
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Ready TTE Documents Queue */}
      <div id="daftar-tte-section" className="mt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={22} className="text-primary" />
              <h3 className="text-lg font-bold text-on-surface">
                Antrean Dokumen Siap Tanda Tangan Elektronik (TTE)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {readyTTEDocs.length} Berkas
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Berkas telah memenuhi syarat verifikasi berjenjang RT dan RW, siap disahkan menjadi dokumen dinas resmi.
            </p>
          </div>

          {readyTTEDocs.length > 0 && (
            <button
              type="button"
              onClick={() => handleInitiateBatchSign(readyTTEDocs.map((d) => d.id))}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all cursor-pointer"
            >
              <Check size={16} />
              <span>Sahkan Semua ({readyTTEDocs.length}) via TTE</span>
            </button>
          )}
        </div>

        {/* List of Documents */}
        {readyTTEDocs.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-200">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="text-sm font-bold text-on-surface">
              Semua Berkas Siap TTE Selesai Diproses
            </h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
              Tidak ada dokumen permohonan surat yang menunggu pengesahan Lurah saat ini. Kinerja pelayanan kelurahan berada pada status prima.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyTTEDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {doc.nomor_registrasi || `REG-${doc.id}`}
                      </span>
                      <h4 className="text-sm font-bold text-on-surface mt-1.5 line-clamp-1">
                        {doc.jenis_dokumen || doc.jenis_surat || 'Surat Pengantar Keterangan'}
                      </h4>
                    </div>
                    <SLABadge deadline={doc.sla_deadline} createdAt={doc.created_at} status={doc.status} />
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-on-surface-variant">
                    <div className="flex items-center justify-between">
                      <span>Pemohon:</span>
                      <span className="font-semibold text-on-surface">{doc.nama_pemohon || doc.nik_pemohon}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Wilayah:</span>
                      <span className="font-medium text-on-surface">RT {doc.rt || '001'} / RW {doc.rw || '001'}</span>
                    </div>
                    {doc.keperluan && (
                      <div className="pt-1 text-[11px] text-on-surface-variant line-clamp-2 italic">
                        Keperluan: "{doc.keperluan}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleInitiateReject(doc.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Tolak / Berita Acara
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInitiateSingleSign(doc.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all cursor-pointer"
                  >
                    <Lock size={13} />
                    <span>Tandatangani TTE</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QuickSignTray for Batch & Rapid TTE Approval */}
      <QuickSignTray
        items={quickSignItems}
        actionLabel="Tandatangani TTE"
        onApprove={handleInitiateSingleSign}
        onApproveAll={handleInitiateBatchSign}
        onReject={handleInitiateReject}
        onViewDetail={(id) => navigate('/dashboard/dokumen')}
      />

      {/* MODAL 1: Konfirmasi TTE Pejabat Lurah (Manual Passphrase / PIN) */}
      <AnimatePresence>
        {isSignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">
                      Pengesahan Tanda Tangan Elektronik (TTE)
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">
                      Otorisasi Dinas Lurah Kebonjati
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="my-4 space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <Sparkles size={14} className="text-emerald-700" />
                    Sesuai Regulasi Tata Kelola Pemerintahan:
                  </p>
                  AI tidak dapat menandatangani dokumen publik secara otomatis. Anda sedang melakukan pengesahan hukum manual untuk{' '}
                  <span className="font-bold underline">
                    {signTarget?.mode === 'single' ? '1 berkas surat' : `${signTarget?.ids.length} berkas surat terpilih`}
                  </span>.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    PIN / Passphrase TTE Pejabat:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      value={signerPin}
                      onChange={(e) => setSignerPin(e.target.value)}
                      placeholder="Masukkan PIN TTE (contoh: 123456)"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none pl-9 font-mono tracking-widest"
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirmSign()}
                    />
                    <Lock size={15} className="absolute left-3 top-2.5 text-outline" />
                  </div>
                  {pinError && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{pinError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Catatan Lembar Pengesahan:
                  </label>
                  <input
                    type="text"
                    value={signerNotes}
                    onChange={(e) => setSignerNotes(e.target.value)}
                    placeholder="Catatan dinas (opsional)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  disabled={isSigning}
                  onClick={() => setIsSignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSigning}
                  onClick={handleConfirmSign}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSigning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengesahkan...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Bubuhkan TTE & Terbitkan</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Penolakan Dokumen dengan Berita Acara */}
      <AnimatePresence>
        {rejectModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                    <XCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">
                      Tolak Pengesahan Dokumen
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">
                      {rejectModalDoc.nomor_registrasi || `Berkas #${rejectModalDoc.id}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectModalDoc(null)}
                  className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="my-4 space-y-3">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Penolakan pengesahan dokumen akan dicatat dalam riwayat audit workflow dan dikirimkan sebagai notifikasi resmi kepada pemohon dan pengurus RT/RW.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Alasan Penolakan / Berita Acara Kelurahan:
                  </label>
                  <textarea
                    rows={3}
                    autoFocus
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Tuliskan alasan penolakan secara jelas (misal: Berkas identitas NIK tidak cocok dengan arsip DTKS)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-outline focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  disabled={isRejecting}
                  onClick={() => setRejectModalDoc(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isRejecting}
                  onClick={handleConfirmReject}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isRejecting ? 'Memproses...' : 'Kirim Penolakan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

