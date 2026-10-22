import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  ShieldCheck, 
  FileText, 
  Gift, 
  MessageSquareWarning, 
  Award, 
  Users, 
  HeartPulse, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Save, 
  Copy, 
  Check, 
  ExternalLink,
  MapPin,
  Calendar,
  Briefcase,
  Droplet,
  FileCheck,
  Printer,
  QrCode,
  FilePlus,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  Lock,
  Key,
  X,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  Layers,
  Landmark,
  Users2,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ASURANSI_OPTIONS = [
  'BPJS Kesehatan PBI (Bantuan Iuran Pemerintah / Gratis)',
  'BPJS Kesehatan Mandiri (Kelas 1 / 2 / 3)',
  'BPJS Ketenagakerjaan (PPU / BPU / JKK / JKM / JHT)',
  'Asuransi Swasta / Korporat (Prudential, Allianz, Sinarmas, dll)',
  'Tidak Memiliki Asuransi Sama Sekali'
];

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'biodata' | 'surat' | 'bansos' | 'pengaduan' | 'kinerja'

  // Social Security Form
  const [insuranceForm, setInsuranceForm] = useState({
    kategori_asuransi: '',
    nomor_asuransi: '',
    bukti_bansos_url: '',
    catatan_bansos_mandiri: ''
  });
  const [savingInsurance, setSavingInsurance] = useState(false);
  const [copiedNik, setCopiedNik] = useState(false);
  const [showPrintSummaryModal, setShowPrintSummaryModal] = useState(false);

  // Personal PIN Modal for Family Members
  const [pinModal, setPinModal] = useState({
    open: false,
    nik: '',
    nama: '',
    hubungan: '',
    pin: '',
    confirmPin: '',
    loading: false,
    error: ''
  });

  const openPinModal = (fam) => {
    setPinModal({
      open: true,
      nik: fam.nik,
      nama: fam.nama,
      hubungan: fam.status_hubungan_keluarga || 'Anggota',
      pin: '',
      confirmPin: '',
      loading: false,
      error: ''
    });
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!pinModal.pin || !/^\d{6}$/.test(pinModal.pin)) {
      setPinModal(prev => ({ ...prev, error: 'PIN harus berupa tepat 6 digit angka numerik.' }));
      return;
    }
    if (pinModal.pin !== pinModal.confirmPin) {
      setPinModal(prev => ({ ...prev, error: 'Konfirmasi PIN tidak cocok.' }));
      return;
    }
    try {
      setPinModal(prev => ({ ...prev, loading: true, error: '' }));
      const res = await api.post('/auth/set-personal-pin', {
        nik: pinModal.nik,
        pin: pinModal.pin
      });
      setSuccessMsg(res.message || 'PIN Mandiri berhasil disimpan!');
      setPinModal({ open: false, nik: '', nama: '', hubungan: '', pin: '', confirmPin: '', loading: false, error: '' });
      fetchProfile();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setPinModal(prev => ({ ...prev, loading: false, error: err.message || 'Gagal menyimpan PIN' }));
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/users/profile-history');
      if (res.data) {
        setProfileData(res.data);
        const w = res.data.warga;
        if (w) {
          setInsuranceForm({
            kategori_asuransi: w.kategori_asuransi || ASURANSI_OPTIONS[0],
            nomor_asuransi: w.nomor_asuransi || '',
            bukti_bansos_url: w.bukti_bansos_url || '',
            catatan_bansos_mandiri: w.catatan_bansos_mandiri || ''
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat profil dan riwayat layanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveInsurance = async (e) => {
    e.preventDefault();
    try {
      setSavingInsurance(true);
      setError('');
      const res = await api.patch('/warga/mandiri-asuransi-bansos', {
        nik: profileData?.warga?.nik || user?.active_nik || user?.username,
        ...insuranceForm
      });
      setSuccessMsg(res.message || 'Data jaminan kesehatan berhasil disimpan!');
      fetchProfile();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui data jaminan kesehatan');
    } finally {
      setSavingInsurance(false);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNik(true);
      setTimeout(() => setCopiedNik(false), 2000);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin': return 'Administrator Sistem SPBE';
      case 'walikota': return 'Pimpinan Kota';
      case 'camat': return 'Pimpinan Kecamatan';
      case 'admin_kelurahan':
      case 'admin': return 'Admin Kelurahan';
      case 'lurah': return 'Lurah Kebonjati';
      case 'ketua_rw': return 'Ketua RW';
      case 'ketua_rt': return 'Ketua RT';
      case 'kader_posyandu': return 'Kader Posyandu';
      default: return 'Warga Masyarakat';
    }
  };

  const warga = profileData?.warga;
  const isOfficer = ['lurah', 'admin_kelurahan', 'admin', 'superadmin', 'ketua_rw', 'ketua_rt', 'kader_posyandu'].includes(user?.role) || (profileData?.rekapKinerja !== null && profileData?.rekapKinerja !== undefined);
  const isKelurahanAdmin = ['admin_kelurahan', 'lurah', 'superadmin', 'admin'].includes(user?.role);
  const demografi = profileData?.demografiKelurahan;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-xs text-on-surface-variant font-medium">Memuat profil dan riwayat layanan terpadu...</p>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN BENTO GRID EKSEKUTIF KELURAHAN (ADMIN KELURAHAN / LURAH)
  // =========================================================================
  if (isKelurahanAdmin && demografi) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-14">
        {/* EXECUTIVE BANNER BENTO: PROFIL KELURAHAN & APARATUR */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-amber-300 flex-shrink-0">
                <Landmark size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Pusat Pemerintahan SPBE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Smart Governance Terpadu
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mt-1.5 tracking-tight">
                  {demografi.kantor?.nama_kelurahan || 'Kelurahan Kebonjati'}
                </h1>
                <p className="text-xs text-indigo-200/90 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{demografi.kantor?.kecamatan || 'Kecamatan Cikole'}</span>
                  <span>&bull;</span>
                  <span>{demografi.kantor?.kota || 'Kota Sukabumi'}</span>
                  <span>&bull;</span>
                  <span>Provinsi {demografi.kantor?.provinsi || 'Jawa Barat'}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs space-y-1">
                <div className="text-[10px] text-indigo-200 uppercase font-semibold">Kepala Kelurahan / Lurah</div>
                <div className="font-bold text-white text-sm">{demografi.kantor?.nama_lurah}</div>
                <div className="text-[10px] text-indigo-300 font-mono">NIP: {demografi.kantor?.nip_lurah}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-medium"
            >
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              {successMsg}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium"
            >
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BENTO GRID MACRO METRICS & DEMOGRAPHY */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* BENTO 1: TOTAL POPULASI & DAYA DUKUNG (2 COLS) */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                    <Users2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Daya Dukung Demografi</h3>
                    <p className="text-[10px] text-slate-500">Agregasi Data Kependudukan Terverifikasi</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  SIAK & Dukcapil Sinkron
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Total Jiwa Penduduk</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight mt-1 block">
                    {demografi.total_warga.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Warga ber-KTP & Domisili Terdata</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Kepala Keluarga (KK)</span>
                  <span className="text-3xl font-black text-indigo-700 tracking-tight mt-1 block">
                    {demografi.total_kk.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Rata-rata {demografi.total_kk > 0 ? (demografi.total_warga / demografi.total_kk).toFixed(1) : 0} jiwa/KK
                  </span>
                </div>
              </div>

              {/* GENDER DISTRIBUTION BAR */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-sky-700 flex items-center gap-1">
                    Laki-Laki: {demografi.pria} ({demografi.total_warga > 0 ? Math.round((demografi.pria / demografi.total_warga) * 100) : 0}%)
                  </span>
                  <span className="text-rose-600 flex items-center gap-1">
                    Perempuan: {demografi.wanita} ({demografi.total_warga > 0 ? Math.round((demografi.wanita / demografi.total_warga) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${demografi.total_warga > 0 ? (demografi.pria / demografi.total_warga) * 100 : 50}%` }}
                    className="bg-sky-500 h-full transition-all"
                  />
                  <div
                    style={{ width: `${demografi.total_warga > 0 ? (demografi.wanita / demografi.total_warga) * 100 : 50}%` }}
                    className="bg-rose-400 h-full transition-all"
                  />
                </div>
              </div>
            </div>

            {/* DEPENDENCY RATIO INSIGHT */}
            <div className="mt-5 p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm flex-shrink-0">
                <Activity size={18} />
              </div>
              <div className="text-xs">
                <span className="font-bold text-indigo-950 block">
                  Angka Rasio Ketergantungan: {demografi.dependency_ratio}%
                </span>
                <p className="text-[11px] text-indigo-800/80 leading-relaxed mt-0.5">
                  Setiap 100 penduduk usia produktif menopang ~{demografi.dependency_ratio} penduduk non-produktif (Balita & Lansia).
                  Menunjukkan kondisi <strong>Bonus Demografi Prima</strong> untuk percepatan pertumbuhan wilayah.
                </p>
              </div>
            </div>
          </div>

          {/* BENTO 2: PIRAMIDA USIA & GENERASI (1 COL) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Piramida Usia</h3>
                    <p className="text-[10px] text-slate-500">Struktur Generasi Penduduk</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Balita (0 - 5 th)</span>
                    <span className="font-bold text-sky-700">{demografi.usia_balita} jiwa</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full"
                      style={{ width: `${demografi.total_warga > 0 ? (demografi.usia_balita / demografi.total_warga) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Usia Sekolah (6 - 18 th)</span>
                    <span className="font-bold text-indigo-700">{demografi.usia_sekolah} jiwa</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${demografi.total_warga > 0 ? (demografi.usia_sekolah / demografi.total_warga) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Usia Produktif (19 - 59 th)</span>
                    <span className="font-bold text-emerald-700">{demografi.usia_produktif} jiwa</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${demografi.total_warga > 0 ? (demografi.usia_produktif / demografi.total_warga) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Lansia (60+ th)</span>
                    <span className="font-bold text-amber-700">{demografi.usia_lansia} jiwa</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${demografi.total_warga > 0 ? (demografi.usia_lansia / demografi.total_warga) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
              Data terintegrasi otomatis dengan Posyandu & Layanan Lansia.
            </div>
          </div>

          {/* BENTO 3: JARING PENGAMAN SOSIAL & DESIL DTKS (1 COL) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Gift size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Desil & DTKS</h3>
                    <p className="text-[10px] text-slate-500">Peta Kesejahteraan Sosial</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mt-4 text-xs">
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-rose-950 block">Desil 1 (Sangat Miskin)</span>
                    <span className="text-[10px] text-rose-700">Intervensi Prioritas Ekstrem</span>
                  </div>
                  <span className="text-base font-black text-rose-700 font-mono">
                    {demografi.desil?.desil_1 || 0} KK
                  </span>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-950 block">Desil 2 (Miskin)</span>
                    <span className="text-[10px] text-amber-700">Calon Penerima PKH/BPNT</span>
                  </div>
                  <span className="text-base font-black text-amber-700 font-mono">
                    {demografi.desil?.desil_2 || 0} KK
                  </span>
                </div>

                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-950 block">Desil 3 - 4 (Rentan)</span>
                    <span className="text-[10px] text-blue-700">Perlindungan Subsidi Sosial</span>
                  </div>
                  <span className="text-base font-black text-blue-700 font-mono">
                    {demografi.desil?.desil_3_4 || 0} KK
                  </span>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-950 block">Non-Desil (Mampu)</span>
                    <span className="text-[10px] text-emerald-700">Mandiri Sejahtera</span>
                  </div>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {demografi.desil?.non_desil || 0} KK
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Realisasi Bantuan:</span>
              <span className="font-bold text-emerald-700 font-mono">
                {demografi.bansos?.total_disalurkan || 0} Tersalurkan
              </span>
            </div>
          </div>

          {/* BENTO 4: KEPATUHAN PBB & KEUANGAN LINGKUNGAN (2 COLS) */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Coins size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Kepatuhan PBB & Potensi Pajak</h3>
                    <p className="text-[10px] text-slate-500">Rekonsiliasi DHKP & Verifikasi Lapangan RT</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Bapenda Terintegrasi
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Total NOP Terdata</span>
                  <span className="text-xl font-bold text-slate-900 mt-1 block">
                    {demografi.pbb?.total_nop || 0}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[11px] text-emerald-700 block font-medium">Lunas Terverifikasi</span>
                  <span className="text-xl font-bold text-emerald-800 mt-1 block">
                    {demografi.pbb?.total_lunas || 0}
                  </span>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                  <span className="text-[11px] text-rose-700 block font-medium">Tertunggak</span>
                  <span className="text-xl font-bold text-rose-800 mt-1 block">
                    {demografi.pbb?.total_tertunggak || 0}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Total Potensi Ketetapan NJOP:</span>
                  <span className="text-base font-bold text-slate-900">
                    Rp {Number(demografi.pbb?.total_pokok || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Tingkat Kepatuhan:</span>
                  <span className="text-base font-bold text-emerald-600">
                    {demografi.pbb?.total_nop > 0
                      ? Math.round((demografi.pbb.total_lunas / demografi.pbb.total_nop) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-400 italic">
              * Data PBB divalidasi langsung oleh Ketua RT masing-masing wilayah untuk optimalisasi PAD Kota Sukabumi.
            </div>
          </div>

          {/* BENTO 5: SEBARAN WILAYAH KERJA RT / RW (1 COL) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Sebaran Wilayah</h3>
                    <p className="text-[10px] text-slate-500">Daya Tampung RW & RT</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-1">
                {demografi.sebaran_wilayah && demografi.sebaran_wilayah.length > 0 ? (
                  demografi.sebaran_wilayah.map((w, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">RW {w.rw} / RT {w.rt}</span>
                      <div className="text-right text-[11px]">
                        <span className="font-bold text-slate-900">{w.jumlah_warga}</span> Jiwa &bull; <span className="font-semibold text-slate-600">{w.jumlah_kk}</span> KK
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-slate-400 py-6">
                    Data wilayah sedang disinkronkan.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
              Peta batas yurisdiksi terkoordinasi dengan pengurus lingkungan RT/RW.
            </div>
          </div>

          {/* BENTO 6: KINERJA PELAYANAN PUBLIK & SLA SPBE (1 COL) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Kinerja Pelayanan SPBE</h3>
                    <p className="text-[10px] text-slate-500">SLA & Kecepatan Layanan</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Kepatuhan Standar Waktu SLA</span>
                  <span className="text-2xl font-black text-indigo-700 mt-1 block">
                    {profileData?.rekapKinerja?.kepatuhan_sla_persen || 98.5}%
                  </span>
                  <span className="text-[10px] text-slate-500">Rata-rata respon &lt; 2 jam kerja</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Surat Terverifikasi</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {profileData?.rekapKinerja?.total_surat_diproses || 0} Berkas
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Sanggahan Bansos Diputus</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {profileData?.rekapKinerja?.total_audit_sanggahan || 0} Putusan
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Standar Pelayanan Publik Ombudsman Terpenuhi
            </div>
          </div>

        </div>

        {/* KREDENSIAL JABATAN & HAK AKSES SPBE */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={18} className="text-indigo-600" /> Kredensial Jabatan & Hak Akses SPBE
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
              Aparatur Kelurahan Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Jabatan Resmi</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-sky-600" />
                {getRoleBadge(user?.role)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1">ID Akun Kedinasan</span>
              <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                {user?.username || '-'}
                <button
                  onClick={() => copyToClipboard(user?.username)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                  title="Salin ID"
                >
                  {copiedNik ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Wilayah Penugasan</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <MapPin size={13} className="text-red-500" />
                Seluruh Wilayah Kelurahan Kebonjati
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Instansi / Unit Kerja</span>
              <span className="font-semibold text-slate-900">
                Kelurahan Kebonjati, Kec. Cikole, Kota Sukabumi
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Email Kedinasan</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Mail size={13} className="text-sky-600" />
                {demografi.kantor?.email || 'kelurahan.kebonjati@sukabumikota.go.id'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Kontak Kantor Pelayanan</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Phone size={13} className="text-emerald-600" />
                {demografi.kantor?.telepon || '(0266) 221-123'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-14">
      {/* HEADER CARD PROFIL */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100/50 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white flex-shrink-0">
              {warga?.nama ? warga.nama.charAt(0).toUpperCase() : (user?.nama?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-on-surface">
                  {warga?.nama || user?.nama || user?.username}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                  <ShieldCheck size={13} /> {getRoleBadge(user?.role)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1 font-mono font-medium">
                  {warga?.nik ? 'NIK: ' + warga.nik : 'ID Akun: ' + (user?.username || '-')}
                  <button
                    onClick={() => copyToClipboard(warga?.nik || user?.username)}
                    className="p-1 text-sky-700 hover:text-sky-900 rounded"
                    title="Salin Identitas"
                  >
                    {copiedNik ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </span>
                {warga?.no_kk && (
                  <span>&bull; No. KK: <strong className="font-mono text-on-surface">{warga.no_kk}</strong></span>
                )}
                <span>
                  &bull; Wilayah: <strong>RT {warga?.rt || user?.rt || '001'} / RW {warga?.rw || user?.rw || '001'}</strong>
                </span>
                <span>&bull; Kelurahan Kebonjati</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
            {warga && (
              <button
                onClick={() => setShowPrintSummaryModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-xs font-semibold shadow-sm transition-colors"
                title="Cetak Rekapitulasi Riwayat Layanan Warga"
              >
                <Printer size={15} /> Cetak Riwayat Layanan
              </button>
            )}
            <div className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-right">
              <span className="text-[10px] uppercase font-bold text-sky-800 block">Status Akun Digital</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 justify-end mt-0.5">
                <CheckCircle2 size={13} /> Terverifikasi SPBE
              </span>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-medium"
            >
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              {successMsg}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium"
            >
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHECKLIST KELENGKAPAN PROFIL WARGA (SIMPLE & INFORMATIF) */}
        {warga && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-transparent border border-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/15">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-700">
                    <CheckCircle2 size={16} />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">Kelengkapan Data Profil Mandiri</h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Checklist 4 pilar data kependudukan untuk kemudahan pengajuan surat, verifikasi bansos, dan layanan RT
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
                  {Math.round(
                    ((Boolean(warga?.nik) ? 1 : 0) +
                     (Boolean(warga?.no_kk) ? 1 : 0) +
                     (Boolean(warga?.no_hp || warga?.telepon || user?.no_hp) ? 1 : 0) +
                     (Boolean(warga?.kategori_asuransi && warga.kategori_asuransi !== 'Tidak Memiliki Asuransi Sama Sekali') ? 1 : 0)) / 4 * 100
                  )}% Lengkap
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3.5">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
                <div className={`p-1.5 rounded-lg ${warga?.nik ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {warga?.nik ? <Check size={14} /> : <AlertCircle size={14} />}
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">KTP / NIK Warga</span>
                  <span className="text-[10px] text-slate-500">{warga?.nik ? '16 Digit Valid' : 'Belum Ada NIK'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
                <div className={`p-1.5 rounded-lg ${warga?.no_kk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {warga?.no_kk ? <Check size={14} /> : <AlertCircle size={14} />}
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Kartu Keluarga (KK)</span>
                  <span className="text-[10px] text-slate-500">{warga?.no_kk ? 'Tersinkronisasi' : 'Belum Ada No KK'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
                <div className={`p-1.5 rounded-lg ${(warga?.no_hp || warga?.telepon || user?.no_hp) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {(warga?.no_hp || warga?.telepon || user?.no_hp) ? <Check size={14} /> : <Clock size={14} />}
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Nomor WhatsApp</span>
                  <span className="text-[10px] text-slate-500">{(warga?.no_hp || warga?.telepon || user?.no_hp) ? 'Notifikasi Aktif' : 'Disarankan Isi'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
                <div className={`p-1.5 rounded-lg ${(warga?.kategori_asuransi && warga.kategori_asuransi !== 'Tidak Memiliki Asuransi Sama Sekali') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {(warga?.kategori_asuransi && warga.kategori_asuransi !== 'Tidak Memiliki Asuransi Sama Sekali') ? <Check size={14} /> : <Clock size={14} />}
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">BPJS / Jaminan</span>
                  <span className="text-[10px] text-slate-500">{(warga?.kategori_asuransi && warga.kategori_asuransi !== 'Tidak Memiliki Asuransi Sama Sekali') ? 'Terproteksi' : 'Bisa Diisi Mandiri'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BENTO QUICK NAVIGATION HUB (HANYA UNTUK PEJABAT / APARATUR) */}
        {isOfficer && (
          <div className="mt-6 pt-4 border-t border-outline-variant/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-on-surface">
                  Pusat Kendali Profil 360° (Bento Super App)
                </span>
              </div>
              {activeTab !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors"
                >
                  Tampilkan Semua Bento
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* Bento Selector 1: Biodata / Kredensial */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'biodata' ? 'all' : 'biodata')}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  activeTab === 'biodata'
                    ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white border-sky-500 shadow-md shadow-sky-600/20 scale-[1.02]'
                    : 'bg-surface-container-low/70 hover:bg-surface-container border-outline-variant/60 text-on-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl ${activeTab === 'biodata' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'}`}>
                    <User size={16} />
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${activeTab === 'biodata' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    SIAK
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[11px] font-bold block line-clamp-1">
                    {warga ? 'Identitas & KK' : 'Kredensial Dinas'}
                  </span>
                  <span className={`text-[10px] block ${activeTab === 'biodata' ? 'text-sky-100' : 'text-on-surface-variant'}`}>
                    {warga?.nik ? '16 Digit Valid' : 'Akses Terverifikasi'}
                  </span>
                </div>
              </button>

              {/* Bento Selector 2: Surat */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'surat' ? 'all' : 'surat')}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  activeTab === 'surat'
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-surface-container-low/70 hover:bg-surface-container border-outline-variant/60 text-on-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl ${activeTab === 'surat' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                    <FileText size={16} />
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${activeTab === 'surat' ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                    {profileData?.riwayatSurat?.length || 0}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[11px] font-bold block">Riwayat Surat</span>
                  <span className={`text-[10px] block ${activeTab === 'surat' ? 'text-indigo-100' : 'text-on-surface-variant'}`}>
                    Pengajuan Kependudukan
                  </span>
                </div>
              </button>

              {/* Bento Selector 3: Bansos */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'bansos' ? 'all' : 'bansos')}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  activeTab === 'bansos'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-500 shadow-md shadow-emerald-600/20 scale-[1.02]'
                    : 'bg-surface-container-low/70 hover:bg-surface-container border-outline-variant/60 text-on-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl ${activeTab === 'bansos' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <Gift size={16} />
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${activeTab === 'bansos' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    {profileData?.riwayatBansos?.length || 0}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[11px] font-bold block">Bansos & Bantuan</span>
                  <span className={`text-[10px] block ${activeTab === 'bansos' ? 'text-emerald-100' : 'text-on-surface-variant'}`}>
                    Jaring Perlindungan
                  </span>
                </div>
              </button>

              {/* Bento Selector 4: Pengaduan */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'pengaduan' ? 'all' : 'pengaduan')}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  activeTab === 'pengaduan'
                    ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white border-amber-500 shadow-md shadow-amber-600/20 scale-[1.02]'
                    : 'bg-surface-container-low/70 hover:bg-surface-container border-outline-variant/60 text-on-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl ${activeTab === 'pengaduan' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                    <MessageSquareWarning size={16} />
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${activeTab === 'pengaduan' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800'}`}>
                    {profileData?.riwayatPengaduan?.length || 0}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[11px] font-bold block">Laporan Aduan</span>
                  <span className={`text-[10px] block ${activeTab === 'pengaduan' ? 'text-amber-100' : 'text-on-surface-variant'}`}>
                    Aspirasi Wilayah
                  </span>
                </div>
              </button>

              {/* Bento Selector 5: Kinerja */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'kinerja' ? 'all' : 'kinerja')}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  activeTab === 'kinerja'
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-800 text-white border-purple-500 shadow-md shadow-purple-600/20 scale-[1.02]'
                    : 'bg-surface-container-low/70 hover:bg-surface-container border-outline-variant/60 text-on-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl ${activeTab === 'kinerja' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'}`}>
                    <Award size={16} />
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${activeTab === 'kinerja' ? 'bg-white/25 text-white' : 'bg-purple-100 text-purple-800'}`}>
                    {profileData?.rekapKinerja?.kepatuhan_sla_persen || 100}%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[11px] font-bold block">Kinerja Petugas</span>
                  <span className={`text-[10px] block ${activeTab === 'kinerja' ? 'text-purple-100' : 'text-on-surface-variant'}`}>
                    Kepatuhan SLA Pelayanan
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BENTO SECTION 1: BIODATA / IDENTITAS & KREDENSIAL */}
      {(activeTab === 'all' || activeTab === 'biodata') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {warga ? (
            <>
              {/* Data Pribadi Kependudukan */}
              <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <User size={18} className="text-sky-600" /> Data Kependudukan Terdaftar
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    SIAK & Dukcapil Sinkron
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Tempat, Tanggal Lahir</span>
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <Calendar size={13} className="text-sky-600" />
                      {warga?.tempat_lahir || '-'}, {warga?.tanggal_lahir ? new Date(warga.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Jenis Kelamin</span>
                    <span className="font-semibold text-on-surface">
                      {warga?.jenis_kelamin === 'L' ? 'Laki-Laki' : (warga?.jenis_kelamin === 'P' ? 'Perempuan' : '-')}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Agama</span>
                    <span className="font-semibold text-on-surface">{warga?.agama || '-'}</span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Golongan Darah</span>
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <Droplet size={13} className="text-rose-500" /> {warga?.golongan_darah || 'Tidak Tahu'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Pekerjaan</span>
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <Briefcase size={13} className="text-sky-600" /> {warga?.pekerjaan || '-'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Status Perkawinan</span>
                    <span className="font-semibold text-on-surface">{warga?.status_perkawinan || '-'}</span>
                  </div>

                  <div className="sm:col-span-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Alamat Lengkap Domisili</span>
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <MapPin size={14} className="text-red-500 flex-shrink-0" />
                      {warga?.alamat || 'Kelurahan Kebonjati'}, RT {warga?.rt || '001'} / RW {warga?.rw || '001'}, Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi
                    </span>
                  </div>
                </div>

                {/* ANGGOTA KELUARGA DALAM 1 KK */}
                {profileData?.familyMembers && profileData.familyMembers.length > 0 && (
                  <div className="pt-4 border-t border-outline-variant space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-on-surface flex items-center gap-2">
                        <Users size={16} className="text-sky-600" /> Anggota Keluarga Terdaftar (No. KK: {warga?.no_kk || '-'})
                      </h4>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        Total {profileData.familyMembers.length} Jiwa Terdaftar
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {profileData.familyMembers.map((fam) => (
                        <div
                          key={fam.nik}
                          className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-sky-300 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-on-surface text-sm">{fam.nama}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800">
                                {fam.status_hubungan_keluarga || 'Anggota'}
                              </span>
                              {fam.nik === warga?.nik && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-on-surface-variant font-mono">
                              NIK: {fam.nik} &bull; {fam.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                              {fam.pekerjaan ? ` • ${fam.pekerjaan}` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                            <button
                              type="button"
                              onClick={() => openPinModal(fam)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-outline-variant"
                              title={`Atur PIN Mandiri Login untuk ${fam.nama}`}
                            >
                              <Key size={13} className="text-sky-700" />
                              <span>{fam.has_pin_mandiri ? 'Ubah PIN' : 'Buat PIN'}</span>
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/dokumen?for_nik=${fam.nik}&action=new`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
                              title={`Ajukan Surat atas nama ${fam.nama}`}
                            >
                              <FilePlus size={14} /> Ajukan Surat
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Jaminan Sosial Mandiri (BPJS / Asuransi & Bukti Bansos) */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <HeartPulse size={18} className="text-rose-500" /> Jaminan Kesehatan & Bansos
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  Perbarui status kepesertaan BPJS atau asuransi Anda untuk sinkronisasi data perlindungan sosial kelurahan.
                </p>

                <form onSubmit={handleSaveInsurance} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-on-surface block mb-1">
                      Kategori Jaminan Kesehatan / Asuransi:
                    </label>
                    <select
                      value={insuranceForm.kategori_asuransi}
                      onChange={(e) => setInsuranceForm({ ...insuranceForm, kategori_asuransi: e.target.value })}
                      className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      {ASURANSI_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-on-surface block mb-1">
                      Nomor Kartu BPJS / Polis Asuransi:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 0001234567890"
                      value={insuranceForm.nomor_asuransi}
                      onChange={(e) => setInsuranceForm({ ...insuranceForm, nomor_asuransi: e.target.value })}
                      className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-on-surface block mb-1">
                      Catatan Kelayakan Mandiri / Kondisi Ekonomi:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Catatan kondisi sosial ekonomi untuk pertimbangan bansos..."
                      value={insuranceForm.catatan_bansos_mandiri}
                      onChange={(e) => setInsuranceForm({ ...insuranceForm, catatan_bansos_mandiri: e.target.value })}
                      className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingInsurance}
                    className="w-full py-2.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {savingInsurance ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>Simpan Data Jaminan Sosial</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Tampilan Pejabat / Aparatur Tanpa Data Warga */
            <>
              <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <Building2 size={18} className="text-sky-600" /> Kredensial Jabatan & Hak Akses SPBE
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-semibold border border-sky-200">
                    Aparatur Pelayan Publik
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Jabatan Resmi</span>
                    <span className="font-bold text-on-surface flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-sky-600" />
                      {getRoleBadge(user?.role)}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">NIP / ID Kedinasan</span>
                    <span className="font-mono font-bold text-on-surface">
                      {user?.username || '-'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Wilayah Penugasan</span>
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <MapPin size={13} className="text-red-500" />
                      {user?.rt && user?.rw ? `RT ${user.rt} / RW ${user.rw}` : 'Seluruh Wilayah Kelurahan Kebonjati'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Instansi / Unit Kerja</span>
                    <span className="font-semibold text-on-surface">
                      Kelurahan Kebonjati, Kec. Cikole, Kota Sukabumi
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Email Kedinasan</span>
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <Mail size={13} className="text-sky-600" />
                      {user?.email || 'admin.spbe@kebonjati.sukabumi.go.id'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                    <span className="text-on-surface-variant block mb-1">Kontak Resmi</span>
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <Phone size={13} className="text-emerald-600" />
                      {user?.phone || '(0266) 221-123'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant space-y-2">
                  <h4 className="text-xs font-bold text-on-surface">Otoritas & Hak Akses Sistem:</h4>
                  <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
                    <li>Verifikasi dan validasi permohonan surat keterangan warga berjenjang.</li>
                    <li>Persetujuan dan audit kelayakan bantuan sosial serta transparansi DTKS.</li>
                    <li>Monitoring laporan pengaduan masyarakat dan tanggap darurat lingkungan.</li>
                    <li>Penerbitan dokumen digital ber-QR Code dengan verifikasi keabsahan SPBE.</li>
                  </ul>
                </div>
              </div>

              {/* Ringkasan Kinerja Aparatur */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Award size={18} className="text-amber-500" /> Ikhtisar Kinerja Pelayanan
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  Pantau performa layanan dan pemenuhan target standar pelayanan minimal (SPM).
                </p>

                {profileData?.rekapKinerja && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                      <span className="text-sky-800 block text-[11px] font-semibold">Surat Diproses</span>
                      <span className="text-xl font-bold text-sky-900 mt-1 block">
                        {profileData.rekapKinerja.total_surat_diproses}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-emerald-800 block text-[11px] font-semibold">Bansos Disalurkan</span>
                      <span className="text-xl font-bold text-emerald-900 mt-1 block">
                        {profileData.rekapKinerja.total_bansos_diproses}
                      </span>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-amber-800 block text-[11px] font-semibold">Audit Sanggahan</span>
                      <span className="text-xl font-bold text-amber-900 mt-1 block">
                        {profileData.rekapKinerja.total_audit_sanggahan}
                      </span>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <span className="text-purple-800 block text-[11px] font-semibold">Kepatuhan SLA</span>
                      <span className="text-xl font-bold text-purple-900 mt-1 block">
                        {profileData.rekapKinerja.kepatuhan_sla_persen}%
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setActiveTab('kinerja')}
                  className="w-full py-2.5 bg-surface-container-high text-on-surface rounded-xl font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-highest transition-colors text-xs"
                >
                  <span>Buka Tab Kinerja Lengkap</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* PINTASAN MENU TERKAIT KHUSUS WARGA */}
      {!isOfficer && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Sparkles size={18} className="text-sky-600" /> Layanan Mandiri Terkait Profil Anda
            </h3>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Akses cepat tanpa repot
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/dashboard/kk')}
              className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-left transition-colors space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-sky-100 text-sky-800 group-hover:scale-105 transition-transform">
                  <Users size={16} />
                </span>
                <ArrowRight size={14} className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="font-bold text-xs text-on-surface pt-1">Kartu Keluarga Digital</h4>
              <p className="text-[10px] text-on-surface-variant">Ringkasan anggota keluarga & salin NIK</p>
            </button>

            <button
              onClick={() => navigate('/dashboard/dokumen')}
              className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-left transition-colors space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-indigo-100 text-indigo-800 group-hover:scale-105 transition-transform">
                  <FileText size={16} />
                </span>
                <ArrowRight size={14} className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="font-bold text-xs text-on-surface pt-1">Pengajuan Surat Mandiri</h4>
              <p className="text-[10px] text-on-surface-variant">Buat & pantau surat pengantar/keterangan RT</p>
            </button>

            <button
              onClick={() => navigate('/dashboard/bansos')}
              className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-left transition-colors space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:scale-105 transition-transform">
                  <Gift size={16} />
                </span>
                <ArrowRight size={14} className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="font-bold text-xs text-on-surface pt-1">Informasi Bantuan Sosial</h4>
              <p className="text-[10px] text-on-surface-variant">Cek kepesertaan bansos & tiket QR pengambilan</p>
            </button>

            <button
              onClick={() => navigate('/dashboard/kontrakan')}
              className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-left transition-colors space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-teal-100 text-teal-800 group-hover:scale-105 transition-transform">
                  <Key size={16} />
                </span>
                <ArrowRight size={14} className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="font-bold text-xs text-on-surface pt-1">Rumah Sewa & Kontrakan</h4>
              <p className="text-[10px] text-on-surface-variant">Kelola unit sewa & lapor tamu/penyewa 1x24 jam</p>
            </button>
          </div>
        </div>
      )}

      {/* BENTO SECTION 2: RIWAYAT SURAT (KHUSUS APARATUR / PETUGAS) */}
      {isOfficer && (activeTab === 'all' || activeTab === 'surat') && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <FileText size={18} className="text-sky-600" /> Riwayat Permohonan Surat Kependudukan
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Dokumen pengajuan atas nama Anda maupun anggota keluarga dalam satu Kartu Keluarga (KK).
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/dokumen?action=new')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <FilePlus size={14} /> Buat Permohonan Baru
            </button>
          </div>

          {(!profileData?.riwayatSurat || profileData.riwayatSurat.length === 0) ? (
            <div className="text-center py-12 text-xs text-on-surface-variant">
              <FileText size={36} className="mx-auto mb-2 text-outline" />
              <p>Belum ada permohonan surat kependudukan yang diajukan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-outline-variant/60 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold">
                  <tr>
                    <th className="p-3">Nomor & Jenis Surat</th>
                    <th className="p-3">Subjek / Pemohon</th>
                    <th className="p-3">Keperluan</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Tahap</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {profileData.riwayatSurat.map((surat) => (
                    <tr key={surat.id} className="hover:bg-surface-container-lowest/60">
                      <td className="p-3">
                        <span className="font-bold text-on-surface block">{surat.jenis_surat}</span>
                        <span className="font-mono text-[11px] text-on-surface-variant">
                          {surat.nomor_surat || `REQ-${surat.id}`}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-on-surface">
                          {surat.nama_subjek || surat.nama_pemohon || surat.nik_pemohon}
                        </div>
                        {surat.hubungan_keluarga && surat.hubungan_keluarga !== 'Diri Sendiri' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800">
                            {surat.hubungan_keluarga}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-on-surface-variant max-w-xs truncate">
                        {surat.keperluan || '-'}
                      </td>
                      <td className="p-3 text-on-surface-variant whitespace-nowrap">
                        {new Date(surat.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-100 text-sky-800">
                          {surat.approval_step || 'RT'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          surat.status === 'APPROVED' || surat.status === 'READY_PICKUP'
                            ? 'bg-emerald-100 text-emerald-800'
                            : (surat.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')
                        }`}>
                          {surat.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {surat.file_hasil ? (
                          <a
                            href={surat.file_hasil}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                          >
                            <ExternalLink size={13} /> Unduh
                          </a>
                        ) : (
                          <span className="text-on-surface-variant text-[11px]">Proses</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BENTO SECTION 3 & 4 (DUAL BENTO GRID FOR SERVICES - KHUSUS APARATUR / PETUGAS) */}
      {isOfficer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BENTO SECTION 3: RIWAYAT BANSOS */}
          {(activeTab === 'all' || activeTab === 'bansos') && (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Gift size={18} className="text-emerald-600" /> Riwayat Kepesertaan Bantuan Sosial
                </h3>
                <span className="text-xs text-on-surface-variant font-medium">
                  Total {profileData?.riwayatBansos?.length || 0} Catatan
                </span>
              </div>

              {(!profileData?.riwayatBansos || profileData.riwayatBansos.length === 0) ? (
                <div className="text-center py-12 text-xs text-on-surface-variant">
                  <Gift size={36} className="mx-auto mb-2 text-outline" />
                  <p>Belum ada catatan penerimaan atau usulan bantuan sosial terdaftar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileData.riwayatBansos.map((b) => (
                    <div key={b.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-[11px] text-primary font-bold">{b.nomor_pengajuan || `BS-${b.id}`}</span>
                          <h4 className="font-bold text-sm text-on-surface">{b.jenis_bansos}</h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === 'DISBURSED' || b.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : (b.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <p className="text-on-surface-variant">{b.alasan_pengajuan || 'Bantuan Perlindungan Sosial'}</p>

                      <div className="pt-2 border-t border-outline-variant/60 flex justify-between items-center text-[11px]">
                        <span className="font-bold text-sky-800">
                          Rp {Number(b.nominal_bantuan || 0).toLocaleString('id-ID')}
                        </span>
                        <span className="text-on-surface-variant">
                          {new Date(b.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      {b.foto_penyerahan_url && (
                        <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center gap-2 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 size={14} /> Bukti serah terima geotagged tersimpan
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BENTO SECTION 4: RIWAYAT PENGADUAN */}
          {(activeTab === 'all' || activeTab === 'pengaduan') && (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <MessageSquareWarning size={18} className="text-amber-600" /> Riwayat Laporan Pengaduan Lingkungan
                </h3>
                <span className="text-xs text-on-surface-variant font-medium">
                  Total {profileData?.riwayatPengaduan?.length || 0} Aduan
                </span>
              </div>

              {(!profileData?.riwayatPengaduan || profileData.riwayatPengaduan.length === 0) ? (
                <div className="text-center py-12 text-xs text-on-surface-variant">
                  <MessageSquareWarning size={36} className="mx-auto mb-2 text-outline" />
                  <p>Belum ada laporan pengaduan lingkungan yang diajukan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileData.riwayatPengaduan.map((aduan) => (
                    <div key={aduan.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low text-xs space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800">
                          {aduan.kategori || 'Fasilitas Umum'}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {new Date(aduan.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface">{aduan.judul}</h4>
                      <p className="text-on-surface-variant">{aduan.deskripsi}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BENTO SECTION 5: REKAPITULASI KINERJA PETUGAS */}
      {(activeTab === 'all' || activeTab === 'kinerja') && isOfficer && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Award size={18} className="text-sky-600" /> Indikator Kinerja Aparatur & Pelayanan
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Rekapitulasi berkas kedinasan dan kepatuhan waktu tanggap (SLA) dalam melayani warga.
            </p>
          </div>

          {profileData?.rekapKinerja && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
                <span className="text-sky-800 block font-semibold">Surat Diverifikasi</span>
                <span className="text-2xl font-extrabold text-sky-900 mt-1 block">
                  {profileData.rekapKinerja.total_surat_diproses}
                </span>
                <span className="text-[10px] text-sky-700">Berkas Pelayanan</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block font-semibold">Bansos Diproses</span>
                <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">
                  {profileData.rekapKinerja.total_bansos_diproses}
                </span>
                <span className="text-[10px] text-emerald-700">Penyaluran / Usulan</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-amber-800 block font-semibold">Audit Sanggahan</span>
                <span className="text-2xl font-extrabold text-amber-900 mt-1 block">
                  {profileData.rekapKinerja.total_audit_sanggahan}
                </span>
                <span className="text-[10px] text-amber-700">Temuan Lapangan RT/RW</span>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-purple-800 block font-semibold">Kepatuhan SLA Respons</span>
                <span className="text-2xl font-extrabold text-purple-900 mt-1 block">
                  {profileData.rekapKinerja.kepatuhan_sla_persen}%
                </span>
                <span className="text-[10px] text-purple-700">&le; 24 Jam Kerja</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL ATUR PIN MANDIRI ANGGOTA KELUARGA                               */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {pinModal.open && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                    <Key size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Atur PIN Mandiri Login</h3>
                    <p className="text-[11px] text-on-surface-variant font-mono">
                      {pinModal.nama} ({pinModal.hubungan})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPinModal({ ...pinModal, open: false })}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {pinModal.error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0 text-rose-600" />
                  <span>{pinModal.error}</span>
                </div>
              )}

              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                PIN ini dapat digunakan oleh <strong>{pinModal.nama}</strong> untuk login langsung ke aplikasi menggunakan NIK pribadinya tanpa perlu mengetahui kata sandi akun keluarga.
              </p>

              <form onSubmit={handleSavePin} className="space-y-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">
                    PIN Baru (6 Digit Angka):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="Contoh: 123456"
                    value={pinModal.pin}
                    onChange={(e) => setPinModal({ ...pinModal, pin: e.target.value.replace(/\D/g, '').slice(0, 6), error: '' })}
                    required
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-mono text-center text-sm tracking-widest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">
                    Ulangi PIN Konfirmasi:
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="Ulangi 6 digit PIN"
                    value={pinModal.confirmPin}
                    onChange={(e) => setPinModal({ ...pinModal, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6), error: '' })}
                    required
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-mono text-center text-sm tracking-widest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setPinModal({ ...pinModal, open: false })}
                    className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={pinModal.loading || pinModal.pin.length !== 6}
                    className="px-5 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {pinModal.loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Simpan PIN</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* MODAL CETAK REKAPITULASI RIWAYAT LAYANAN WARGA                        */}
      {/* ===================================================================== */}
      {showPrintSummaryModal && profileData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-8 shadow-2xl my-8 border border-slate-300 print:shadow-none print:border-none print:m-0 print:p-4 text-xs"
          >
            {/* KOP RESMI */}
            <div className="text-center border-b-2 border-double border-slate-900 pb-4 mb-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                PEMERINTAH KOTA SUKABUMI
              </h3>
              <h2 className="text-lg font-black uppercase tracking-wide">
                KECAMATAN CIKOLE &bull; KELURAHAN KEBONJATI
              </h2>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Jl. Kebonjati No. 120, Kota Sukabumi, Jawa Barat 43111 &bull; Telp: (0266) 221-123
              </p>
              <p className="text-[10px] text-sky-800 font-semibold mt-0.5">
                Pusat Integrasi Layanan Administrasi Kependudukan SPBE: bumiwarga.online
              </p>
            </div>

            {/* JUDUL DOKUMEN */}
            <div className="text-center mb-5">
              <h4 className="text-base font-extrabold underline uppercase tracking-wider text-slate-900">
                REKAPITULASI BUKU CATATAN LAYANAN & PERLINDUNGAN WARGA
              </h4>
              <p className="text-xs font-mono font-semibold text-slate-700 mt-1">
                Nomor Register: REG-SPBE/KBJ/{warga?.rt || '001'}/{warga?.nik || user?.username}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Penerbitan Data: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* BAGIAN I: DATA POKOK KEPENDUDUKAN */}
            <div className="mb-4">
              <h5 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase tracking-wide">
                I. Data Pokok Kependudukan
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div><span className="text-slate-500">Nama Lengkap:</span> <strong className="text-slate-900">{warga?.nama || user?.nama || '-'}</strong></div>
                <div><span className="text-slate-500">NIK:</span> <strong className="font-mono text-slate-900">{warga?.nik || user?.username}</strong></div>
                <div><span className="text-slate-500">No. Kartu Keluarga:</span> <span className="font-mono text-slate-800">{warga?.no_kk || '-'}</span></div>
                <div><span className="text-slate-500">Tempat, Tgl Lahir:</span> <span className="text-slate-800">{warga?.tempat_lahir || '-'}, {warga?.tanggal_lahir ? new Date(warga.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</span></div>
                <div><span className="text-slate-500">Jenis Kelamin:</span> <span className="text-slate-800">{warga?.jenis_kelamin === 'L' ? 'Laki-laki' : (warga?.jenis_kelamin === 'P' ? 'Perempuan' : (warga?.jenis_kelamin || '-'))}</span></div>
                <div><span className="text-slate-500">Wilayah Domisili:</span> <span className="text-slate-800">RT {warga?.rt || '001'} / RW {warga?.rw || '001'}, Kelurahan Kebonjati</span></div>
                <div><span className="text-slate-500">Agama / Status Kawin:</span> <span className="text-slate-800">{warga?.agama || '-'} &bull; {warga?.status_kawin || '-'}</span></div>
                <div><span className="text-slate-500">Pekerjaan:</span> <span className="text-slate-800">{warga?.pekerjaan || '-'}</span></div>
              </div>
            </div>

            {/* BAGIAN II: JAMINAN SOSIAL & KESEHATAN */}
            <div className="mb-4">
              <h5 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase tracking-wide">
                II. Status Jaminan Sosial & Kesehatan
              </h5>
              <div className="bg-sky-50/70 p-3 rounded-lg border border-sky-200 space-y-1">
                <div className="grid grid-cols-3">
                  <span className="text-sky-900 font-medium">Kategori Kepesertaan Asuransi:</span>
                  <span className="col-span-2 font-bold text-sky-950">{warga?.kategori_asuransi || 'Belum Tercatat / Mandiri'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-sky-900 font-medium">Nomor Kartu Jaminan (BPJS):</span>
                  <span className="col-span-2 font-mono font-bold text-sky-950">{warga?.nomor_asuransi || '-'}</span>
                </div>
                {warga?.catatan_bansos_mandiri && (
                  <div className="grid grid-cols-3">
                    <span className="text-sky-900 font-medium">Catatan Kelayakan Mandiri:</span>
                    <span className="col-span-2 text-sky-900 italic">&ldquo;{warga.catatan_bansos_mandiri}&rdquo;</span>
                  </div>
                )}
              </div>
            </div>

            {/* BAGIAN III: RIWAYAT PELAYANAN SURAT */}
            <div className="mb-4">
              <h5 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase tracking-wide">
                III. Riwayat Pelayanan Surat Keterangan ({profileData.riwayatSurat?.length || 0} Pengajuan)
              </h5>
              {profileData.riwayatSurat && profileData.riwayatSurat.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      <tr>
                        <th className="p-2">Tgl Pengajuan</th>
                        <th className="p-2">Jenis Surat</th>
                        <th className="p-2">Subjek Pemohon</th>
                        <th className="p-2">Keperluan</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {profileData.riwayatSurat.map((s) => (
                        <tr key={s.id}>
                          <td className="p-2 whitespace-nowrap font-mono">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                          <td className="p-2 font-medium text-slate-900">{s.jenis_surat}</td>
                          <td className="p-2 font-medium text-slate-900">{s.nama_subjek || s.nama_pemohon || '-'}</td>
                          <td className="p-2 text-slate-700">{s.keperluan || '-'}</td>
                          <td className="p-2 text-center whitespace-nowrap">
                            <span className="font-bold text-emerald-800">{s.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic text-[11px]">Belum ada riwayat permohonan surat kedinasan.</p>
              )}
            </div>

            {/* BAGIAN IV: RIWAYAT BANTUAN SOSIAL */}
            <div className="mb-5">
              <h5 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase tracking-wide">
                IV. Catatan Program Bantuan Sosial ({profileData.riwayatBansos?.length || 0} Terdaftar)
              </h5>
              {profileData.riwayatBansos && profileData.riwayatBansos.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      <tr>
                        <th className="p-2">Program Bantuan</th>
                        <th className="p-2">Nomor Usulan</th>
                        <th className="p-2 text-right">Nominal</th>
                        <th className="p-2 text-center">Status Distribusi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {profileData.riwayatBansos.map((b) => (
                        <tr key={b.id}>
                          <td className="p-2 font-medium text-slate-900">{b.jenis_bansos}</td>
                          <td className="p-2 font-mono text-slate-700">{b.nomor_pengajuan || `BS-${b.id}`}</td>
                          <td className="p-2 text-right font-mono font-medium">Rp {Number(b.nominal_bantuan || 0).toLocaleString('id-ID')}</td>
                          <td className="p-2 text-center whitespace-nowrap font-bold text-sky-800">{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic text-[11px]">Tidak tercatat dalam daftar penerima bantuan sosial aktif (Warga Mandiri).</p>
              )}
            </div>

            {/* TANDA TANGAN & PENGESAHAN */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-center text-xs">
              <div>
                <p className="text-slate-600 font-medium">Warga Pemohon</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">( Tanda Tangan )</span>
                </div>
                <p className="font-bold text-slate-900 underline">{warga?.nama || user?.nama || 'Warga'}</p>
              </div>

              <div>
                <p className="text-slate-600 font-medium">Mengetahui Pengurus Wilayah</p>
                <p className="text-[10px] text-slate-500">Ketua RT {warga?.rt || '001'} / RW {warga?.rw || '001'}</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">( Tanda Tangan )</span>
                </div>
                <p className="font-bold text-slate-900 underline">Pengurus Lingkungan</p>
              </div>

              <div>
                <p className="text-slate-600 font-medium">Pengesahan Digital SPBE</p>
                <p className="text-[10px] text-slate-500">Kelurahan Kebonjati</p>
                <div className="h-16 flex items-center justify-center">
                  <div className="p-1 border border-slate-300 rounded bg-slate-50">
                    <QrCode size={36} className="text-slate-800" />
                  </div>
                </div>
                <p className="font-bold text-slate-900 underline">H. Rahmat Hidayat, S.IP, M.Si</p>
                <p className="text-[10px] font-mono text-slate-600">Lurah Kebonjati</p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Bumi Warga - Jabar Pintar Digital &bull; Dokumen Kependudukan Terpadu</span>
              <span>ID Validasi: VAL-BW-{warga?.nik || '3273'}-{Date.now().toString(36).toUpperCase()}</span>
            </div>

            {/* BUTTONS (HIDDEN IN PRINT) */}
            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setShowPrintSummaryModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors text-xs flex items-center gap-2 shadow-sm"
              >
                <Printer size={15} /> Cetak Riwayat Layanan / PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
