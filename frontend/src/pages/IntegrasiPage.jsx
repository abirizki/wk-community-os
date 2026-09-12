import React, { useState, useEffect } from 'react';
import {
  Network,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Send,
  Download,
  Key,
  Database,
  Smartphone,
  Fingerprint,
  UserCheck,
  Eye,
  Camera,
  Activity,
  ArrowRight,
  Sparkles,
  Layers,
  Lock,
  FileCheck2,
  Share2,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function IntegrasiPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dukcapil'); // 'dukcapil' | 'sapawarga'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ══════════════════════════════════════
  // DUKCAPIL STATE
  // ══════════════════════════════════════
  const [dukcapilMode, setDukcapilMode] = useState('nik'); // 'nik' | 'biometric' | 'kematian'
  const [inputNik, setInputNik] = useState('3273010203850003');
  const [inputNama, setInputNama] = useState('Budi Santoso');
  const [inputTglLahir, setInputTglLahir] = useState('1985-03-02');
  const [biometricSimulatedImage, setBiometricSimulatedImage] = useState('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD_mock_biometric_face_stream_2026');
  const [dukcapilResult, setDukcapilResult] = useState(null);
  const [dukcapilLogs, setDukcapilLogs] = useState([]);
  const [loadingVerify, setLoadingVerify] = useState(false);

  // ══════════════════════════════════════
  // SAPAWARGA & SATU DATA STATE
  // ══════════════════════════════════════
  const [partnerKeys, setPartnerKeys] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [webhookEventType, setWebhookEventType] = useState('SURAT_APPROVED');
  const [targetPartner, setTargetPartner] = useState('SAPAWARGA_JABAR');
  const [webhookPayloadJson, setWebhookPayloadJson] = useState(JSON.stringify({
    nomor_surat: '470/08/SKTM/KBJ/2026',
    nik_pemohon: '3273010203850003',
    nama_pemohon: 'Budi Santoso',
    jenis_surat: 'Surat Keterangan Tidak Mampu (SKTM)',
    status: 'SELESAI',
    disahkan_oleh: 'Lurah Kebonjati'
  }, null, 2));
  const [webhookResult, setWebhookResult] = useState(null);
  const [loadingWebhook, setLoadingWebhook] = useState(false);

  // Satu Data Export
  const [satuDataExport, setSatuDataExport] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);

  // Load Initial Data
  useEffect(() => {
    fetchDukcapilLogs();
    fetchPartnerData();
  }, []);

  const fetchDukcapilLogs = async () => {
    try {
      const res = await api.get('/integrasi/dukcapil/logs?limit=10');
      if (res?.data) {
        setDukcapilLogs(res.data);
      }
    } catch (e) {
      console.warn('Gagal memuat log dukcapil:', e.message);
    }
  };

  const fetchPartnerData = async () => {
    try {
      const [keysRes, whRes] = await Promise.allSettled([
        api.get('/integrasi/partner/keys'),
        api.get('/integrasi/partner/webhook/logs?limit=10')
      ]);
      if (keysRes.status === 'fulfilled' && keysRes.value?.data) {
        setPartnerKeys(keysRes.value.data);
      }
      if (whRes.status === 'fulfilled' && whRes.value?.data) {
        setWebhookLogs(whRes.value.data);
      }
    } catch (e) {
      console.warn('Gagal memuat data partner:', e.message);
    }
  };

  // ══════════════════════════════════════
  // DUKCAPIL HANDLERS
  // ══════════════════════════════════════
  const handleQuickFill = (nik, nama, tgl) => {
    setInputNik(nik);
    setInputNama(nama);
    setInputTglLahir(tgl);
    setDukcapilResult(null);
  };

  const handleVerifyDukcapil = async () => {
    setLoadingVerify(true);
    setError('');
    setSuccessMsg('');
    setDukcapilResult(null);

    try {
      let res;
      if (dukcapilMode === 'nik') {
        res = await api.post('/integrasi/dukcapil/verify-nik', {
          nik: inputNik,
          nama: inputNama,
          tanggal_lahir: inputTglLahir
        });
      } else if (dukcapilMode === 'biometric') {
        res = await api.post('/integrasi/dukcapil/verify-biometric', {
          nik: inputNik,
          face_image_base64: biometricSimulatedImage
        });
      } else {
        res = await api.post('/integrasi/dukcapil/check-kematian', {
          nik: inputNik
        });
      }

      if (res?.data) {
        setDukcapilResult(res.data);
        setSuccessMsg('Verifikasi Dukcapil Kemendagri berhasil diproses!');
        fetchDukcapilLogs();
      }
    } catch (err) {
      setError(err.message || 'Gagal memverifikasi ke Dukcapil Kemendagri');
    } finally {
      setLoadingVerify(false);
    }
  };

  // ══════════════════════════════════════
  // SAPAWARGA / WEBHOOK HANDLERS
  // ══════════════════════════════════════
  const handleSendWebhook = async () => {
    setLoadingWebhook(true);
    setError('');
    setSuccessMsg('');
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(webhookPayloadJson);
      } catch (e) {
        throw new Error('Format Payload JSON tidak valid!');
      }

      const res = await api.post('/integrasi/partner/webhook/test', {
        event_type: webhookEventType,
        payload: parsedPayload,
        target_partner: targetPartner
      });

      if (res?.data) {
        setWebhookResult(res.data);
        setSuccessMsg(`Webhook event ${webhookEventType} berhasil dikirim ke ${targetPartner}!`);
        fetchPartnerData();
      }
    } catch (err) {
      setError(err.message || 'Gagal mengirim webhook');
    } finally {
      setLoadingWebhook(false);
    }
  };

  const handleGenerateSatuData = async () => {
    setLoadingExport(true);
    try {
      const res = await api.get('/integrasi/satudata/export?kode_kota=32.72');
      if (res?.data) {
        setSatuDataExport(res.data);
        setSuccessMsg('Paket data agregat Satu Data Jabar (SDI) berhasil disusun!');
      }
    } catch (err) {
      setError(err.message || 'Gagal menyusun paket Satu Data Jabar');
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ══════════════════════════════════════
          HERO BANNER & BADGES
         ══════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-primary p-6 lg:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <Network size={13} className="animate-pulse" />
                Interoperabilitas Ekosistem Pemda
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                <ShieldCheck size={13} />
                Permendagri No. 102/2019
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                <Lock size={13} />
                UU PDP No. 27/2022 (Zero Data Hoarding)
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Pusat Integrasi Dukcapil & Sapawarga / Satu Data Jabar
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-3xl">
              Gateway federasi data kependudukan nasional terenkripsi IPsec VPN dan integrasi API terbuka Pemerintah Provinsi Jawa Barat (JDS).
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => { fetchDukcapilLogs(); fetchPartnerData(); }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Segarkan Konektivitas
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ALERT MESSAGES
         ══════════════════════════════════════ */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ══════════════════════════════════════
          STATUS CARDS
         ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* VPN Dukcapil */}
        <div className="p-4 rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Tunnel VPN Dukcapil</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">CONNECTED</span>
          </div>
          <p className="text-xl font-bold text-on-surface mt-2 flex items-center gap-2">
            <Server size={20} className="text-emerald-600" />
            IPsec IKEv2
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">Kemendagri Data Center (18ms)</p>
        </div>

        {/* UU PDP Zero Hoarding */}
        <div className="p-4 rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Kepatuhan UU PDP</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">ENFORCED</span>
          </div>
          <p className="text-xl font-bold text-on-surface mt-2 flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-600" />
            Zero Data Hoarding
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">Biometrik dimusnahkan in-memory</p>
        </div>

        {/* Sapawarga Gateway */}
        <div className="p-4 rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Gateway Sapawarga</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">ACTIVE</span>
          </div>
          <p className="text-xl font-bold text-on-surface mt-2 flex items-center gap-2">
            <Smartphone size={20} className="text-teal-600" />
            OIDC / Webhooks
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">3 Kunci API Mitra JDS Terdaftar</p>
        </div>

        {/* Satu Data Jabar */}
        <div className="p-4 rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Satu Data Jabar</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">SYNCHRONIZED</span>
          </div>
          <p className="text-xl font-bold text-on-surface mt-2 flex items-center gap-2">
            <Database size={20} className="text-indigo-600" />
            SDI 2.0 West Java
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">33 Kelurahan Kota Sukabumi</p>
        </div>
      </div>

      {/* ══════════════════════════════════════
          TAB NAVIGATION
         ══════════════════════════════════════ */}
      <div className="flex border-b border-outline-variant">
        <button
          onClick={() => setActiveTab('dukcapil')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'dukcapil'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <UserCheck size={16} />
          Adapter DUKCAPIL Kemendagri & Biometrik
        </button>
        <button
          onClick={() => setActiveTab('sapawarga')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sapawarga'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Share2 size={16} />
          SAPAWARGA & SATU DATA JABAR (JDS)
        </button>
      </div>

      {/* ══════════════════════════════════════
          TAB CONTENT 1: DUKCAPIL KEMENDAGRI
         ══════════════════════════════════════ */}
      {activeTab === 'dukcapil' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Simulator (Col 5) */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Fingerprint className="text-emerald-600" size={20} />
                  Simulator Verifikasi Dukcapil
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  SANDBOX / LIVE
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Gunakan profil uji coba kependudukan untuk menguji web service Dukcapil Kemendagri.
              </p>

              {/* Mode Selection */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-lg border border-outline-variant text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDukcapilMode('nik')}
                  className={`py-1.5 rounded-md transition-all ${dukcapilMode === 'nik' ? 'bg-white shadow text-emerald-700 font-bold' : 'text-on-surface-variant'}`}
                >
                  NIK Match
                </button>
                <button
                  type="button"
                  onClick={() => setDukcapilMode('biometric')}
                  className={`py-1.5 rounded-md transition-all ${dukcapilMode === 'biometric' ? 'bg-white shadow text-emerald-700 font-bold' : 'text-on-surface-variant'}`}
                >
                  Biometrik Wajah
                </button>
                <button
                  type="button"
                  onClick={() => setDukcapilMode('kematian')}
                  className={`py-1.5 rounded-md transition-all ${dukcapilMode === 'kematian' ? 'bg-white shadow text-emerald-700 font-bold' : 'text-on-surface-variant'}`}
                >
                  Cek Kematian
                </button>
              </div>

              {/* Preset Quick Fill */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant block mb-1.5">
                  Preset Profil Warga Uji:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('3273010203850003', 'Budi Santoso', '1985-03-02')}
                    className="px-2.5 py-1 text-[11px] rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant font-medium text-on-surface"
                  >
                    Budi Santoso (Valid)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('3273014504900004', 'Siti Rahayu', '1990-04-05')}
                    className="px-2.5 py-1 text-[11px] rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant font-medium text-on-surface"
                  >
                    Siti Rahayu (Valid)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('3273019999990001', 'Almarhum Sumarna', '1945-01-01')}
                    className="px-2.5 py-1 text-[11px] rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-medium"
                  >
                    Sumarna (Meninggal)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('3273000000000099', 'Warga Fiktif', '2000-01-01')}
                    className="px-2.5 py-1 text-[11px] rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-medium"
                  >
                    Tidak Terdaftar
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    Nomor Induk Kependudukan (NIK 16 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={inputNik}
                    onChange={(e) => setInputNik(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="3273xxxxxxxxxxxx"
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {dukcapilMode === 'nik' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-on-surface block mb-1">
                        Nama Lengkap (Sesuai KTP-el)
                      </label>
                      <input
                        type="text"
                        value={inputNama}
                        onChange={(e) => setInputNama(e.target.value)}
                        placeholder="BUDI SANTOSO"
                        className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface block mb-1">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        value={inputTglLahir}
                        onChange={(e) => setInputTglLahir(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {dukcapilMode === 'biometric' && (
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Citra Wajah Biometrik (Simulasi Stream Base64)
                    </label>
                    <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-400">
                        <Camera size={24} />
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-medium">
                        Kamera Biometrik Aktif: Citra terenkripsi Base64 (Zero Hoarding dijamin)
                      </p>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                        Ambang Batas Kemiripan Standar: ≥ 80%
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyDukcapil}
                  disabled={loadingVerify || inputNik.length !== 16}
                  className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loadingVerify ? (
                    <><RefreshCw size={16} className="animate-spin" /> Memverifikasi ke Kemendagri...</>
                  ) : (
                    <><ShieldCheck size={16} /> Eksekusi Verifikasi Kemendagri</>
                  )}
                </button>
              </div>
            </div>

            {/* Verification Result Box (Col 7) */}
            <div className="lg:col-span-7 p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
                  <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                    <Activity className="text-emerald-600" size={20} />
                    Hasil Verifikasi & Audit Trail UU PDP
                  </h2>
                  {dukcapilResult && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      dukcapilResult.is_matched
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {dukcapilResult.is_matched ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {dukcapilResult.is_matched ? 'TERVERIFIKASI COCOK' : 'TIDAK COCOK / GAGAL'}
                    </span>
                  )}
                </div>

                {!dukcapilResult ? (
                  <div className="py-16 text-center text-on-surface-variant space-y-2">
                    <UserCheck size={36} className="mx-auto text-on-surface-variant/40" />
                    <p className="text-sm font-medium">Belum ada verifikasi yang dijalankan</p>
                    <p className="text-xs text-on-surface-variant/70">Pilih preset data uji dan klik tombol eksekusi untuk melihat respon web service.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Status & Keterangan */}
                    <div className={`p-4 rounded-xl border ${
                      dukcapilResult.is_matched ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
                    }`}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Respon Layanan Kemendagri</p>
                      <p className="text-sm font-bold text-on-surface mt-1">{dukcapilResult.keterangan || dukcapilResult.message}</p>
                    </div>

                    {/* Matrix Rincian */}
                    {dukcapilResult.match_details && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant">
                          <span className="text-[10px] text-on-surface-variant block">Status NIK</span>
                          <span className="text-xs font-bold text-emerald-700">TERDAFTAR</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant">
                          <span className="text-[10px] text-on-surface-variant block">Nama Sesuai</span>
                          <span className={`text-xs font-bold ${dukcapilResult.match_details.nama_matched ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {dukcapilResult.match_details.nama_matched ? 'COCOK (100%)' : 'BERBEDA'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant">
                          <span className="text-[10px] text-on-surface-variant block">Tgl Lahir Sesuai</span>
                          <span className={`text-xs font-bold ${dukcapilResult.match_details.tanggal_lahir_matched ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {dukcapilResult.match_details.tanggal_lahir_matched ? 'COCOK' : 'BERBEDA'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant">
                          <span className="text-[10px] text-on-surface-variant block">Status Warga</span>
                          <span className="text-xs font-bold text-emerald-700">
                            {dukcapilResult.match_details.status_kependudukan}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Biometric Similarity Score */}
                    {dukcapilResult.similarity_score !== undefined && (
                      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-on-surface">Skor Kemiripan Biometrik Wajah:</span>
                          <span className="font-bold text-emerald-700 text-sm">{dukcapilResult.similarity_score}%</span>
                        </div>
                        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(dukcapilResult.similarity_score, 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-on-surface-variant">
                          Ambang Batas Minimum: <strong>{dukcapilResult.threshold_required}%</strong>. Hasil verifikasi sah sebagai identitas biometrik KTP-el.
                        </p>
                      </div>
                    )}

                    {/* Status Kematian Detail */}
                    {dukcapilResult.akta_kematian && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                        <p className="font-bold">Akta Kematian Ditemukan:</p>
                        <p>Nomor Akta: <span className="font-mono">{dukcapilResult.akta_kematian.nomor_akta}</span></p>
                        <p>Tanggal Kematian: {dukcapilResult.akta_kematian.tanggal_kematian}</p>
                      </div>
                    )}

                    {/* UU PDP Anti-Tampering Hash Box */}
                    {dukcapilResult.compliance && (
                      <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 space-y-1 text-xs font-mono">
                        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-sans font-semibold">
                          <span className="flex items-center gap-1.5"><Lock size={12} /> SHA-256 Anti-Tampering Log (UU PDP)</span>
                          <span>{dukcapilResult.compliance.permendagri || 'Permendagri 102/2019'}</span>
                        </div>
                        <p className="break-all text-[11px] text-slate-400">
                          {dukcapilResult.compliance.integrity_hash}
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans pt-1">
                          Zero Data Hoarding: Data masukan telah dihapus dari memori server seketika setelah perbandingan.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-outline-variant text-[11px] text-on-surface-variant flex items-center justify-between">
                <span>Protokol Keamanan: TLS 1.3 / IPsec Tunnel</span>
                <span className="text-emerald-700 font-medium">Kemendagri RI Integrated</span>
              </div>
            </div>
          </div>

          {/* Real-time Audit Logs Table */}
          <div className="p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Shield size={18} className="text-emerald-600" />
                  Audit Trail Verifikasi Dukcapil (Kepatuhan UU PDP No. 27/2022)
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Setiap kueri verifikasi dicatat dengan hash kriptografis untuk audit transparansi publik dan mencegah manipulasi data.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchDukcapilLogs}
                className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold hover:bg-surface-container flex items-center gap-1.5"
              >
                <RefreshCw size={12} /> Segarkan Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">NIK Diminta</th>
                    <th className="py-2.5 px-3">Jenis Verifikasi</th>
                    <th className="py-2.5 px-3">Hasil</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                    <th className="py-2.5 px-3">Integrity Hash (SHA-256)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {dukcapilLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-on-surface-variant/60">
                        Belum ada riwayat transaksi verifikasi
                      </td>
                    </tr>
                  ) : (
                    dukcapilLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-container-low/50">
                        <td className="py-2.5 px-3 whitespace-nowrap text-on-surface-variant">
                          {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-on-surface">
                          {log.nik_diminta}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface">
                            {log.jenis_verifikasi}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            log.is_matched ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.is_matched ? 'MATCHED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-on-surface-variant max-w-xs truncate">
                          {log.keterangan}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-on-surface-variant/80 max-w-[140px] truncate">
                          {log.integrity_hash}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB CONTENT 2: SAPAWARGA & SATU DATA
         ══════════════════════════════════════ */}
      {activeTab === 'sapawarga' && (
        <div className="space-y-6">
          {/* Section 1: Partner API Gateway & Kredensial */}
          <div className="p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Key className="text-teal-600" size={20} />
                  Kredensial Resmi Partner API JDS (Bearer Token Gateway)
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Mitra Pemerintah Provinsi Jawa Barat mengakses endpoint status surat, bansos, dan desil melalui API Key terdaftar.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                Gateway RBAC Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {partnerKeys.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">{p.partner_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      AKTIF
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-semibold">API Key Bearer:</label>
                    <div className="flex items-center gap-2 bg-surface p-2 rounded border border-outline-variant font-mono text-[11px] text-on-surface break-all">
                      <span>{p.api_key}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant uppercase font-semibold block mb-1">Perizinan Scope:</label>
                    <div className="flex flex-wrap gap-1">
                      {(typeof p.scopes === 'string' ? JSON.parse(p.scopes) : p.scopes).map((sc, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-mono">
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Webhook Event Dispatcher Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Send className="text-teal-600" size={20} />
                  Pengirim Webhooks Event Real-time
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  EVENT-DRIVEN
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Kirimkan notifikasi push instan ke aplikasi mobile Sapawarga saat dokumen warga disetujui atau bansos disalurkan.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">Tipe Event:</label>
                    <select
                      value={webhookEventType}
                      onChange={(e) => setWebhookEventType(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="SURAT_APPROVED">SURAT_APPROVED (Surat Disetujui)</option>
                      <option value="SURAT_REJECTED">SURAT_REJECTED (Surat Ditolak)</option>
                      <option value="BANSOS_DISBURSED">BANSOS_DISBURSED (Bansos Diserahkan)</option>
                      <option value="DESIL_UPDATED">DESIL_UPDATED (Desil DTSEN Diperbarui)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">Target Mitra:</label>
                    <select
                      value={targetPartner}
                      onChange={(e) => setTargetPartner(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="SAPAWARGA_JABAR">SAPAWARGA_JABAR</option>
                      <option value="SATU_DATA_JABAR">SATU_DATA_JABAR</option>
                      <option value="DISKOMINFO_SUKABUMI">DISKOMINFO_SUKABUMI</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">Payload JSON (Simulasi Data):</label>
                  <textarea
                    rows={6}
                    value={webhookPayloadJson}
                    onChange={(e) => setWebhookPayloadJson(e.target.value)}
                    className="w-full p-3 rounded-lg border border-outline-variant bg-surface font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendWebhook}
                  disabled={loadingWebhook}
                  className="w-full h-10 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loadingWebhook ? (
                    <><RefreshCw size={14} className="animate-spin" /> Mengirim Webhook ke Mitra...</>
                  ) : (
                    <><Send size={14} /> Kirim Webhook ke {targetPartner}</>
                  )}
                </button>
              </div>
            </div>

            {/* Webhook Log History (Col 6) */}
            <div className="lg:col-span-6 p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant pb-3 mb-3">
                  <Activity className="text-teal-600" size={20} />
                  Log Pengiriman Webhook Mitra
                </h3>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {webhookLogs.length === 0 ? (
                    <div className="py-12 text-center text-on-surface-variant text-xs">
                      Belum ada log pengiriman webhook tercatat
                    </div>
                  ) : (
                    webhookLogs.map((w, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-outline-variant bg-surface-container-low text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-on-surface">{w.event_type}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            HTTP {w.response_code || 200} SUCCESS
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          Target: {w.target_url} ({w.partner_name})
                        </p>
                        <p className="text-[10px] text-on-surface-variant/70 font-mono">
                          {new Date(w.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant text-[11px] text-on-surface-variant flex items-center justify-between">
                <span>Webhook Event Driven</span>
                <span className="text-teal-700 font-semibold">Respon Rata-rata: 45ms</span>
              </div>
            </div>
          </div>

          {/* Section 3: Satu Data Jabar SDI Aggregator */}
          <div className="p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Database className="text-indigo-600" size={20} />
                  Paket Agregat Satu Data Jabar (Standar Satu Data Indonesia / SDI)
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Menyusun metrik kependudukan, kemiskinan desil, stunting, dan kapasitas publik 33 Kelurahan Kota Sukabumi.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateSatuData}
                disabled={loadingExport}
                className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loadingExport ? (
                  <><RefreshCw size={14} className="animate-spin" /> Menyusun Paket Data SDI...</>
                ) : (
                  <><Download size={14} /> Generate Paket Satu Data Jabar</>
                )}
              </button>
            </div>

            {satuDataExport && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] font-semibold text-indigo-700 uppercase">Total Kecamatan</span>
                    <p className="text-lg font-bold text-indigo-950 mt-0.5">{satuDataExport.ringkasan_kota.total_kecamatan}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] font-semibold text-indigo-700 uppercase">Total Kelurahan</span>
                    <p className="text-lg font-bold text-indigo-950 mt-0.5">{satuDataExport.ringkasan_kota.total_kelurahan}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] font-semibold text-indigo-700 uppercase">Total Penduduk</span>
                    <p className="text-lg font-bold text-indigo-950 mt-0.5">
                      {satuDataExport.ringkasan_kota.total_penduduk_terdata.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] font-semibold text-indigo-700 uppercase">Checksum SHA-256</span>
                    <p className="text-xs font-mono font-bold text-indigo-950 mt-1 truncate">
                      {satuDataExport.metadata.checksum.substring(0, 16)}...
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">Pratinjau JSON Standar SDI:</label>
                  <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
                    {JSON.stringify(satuDataExport, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

