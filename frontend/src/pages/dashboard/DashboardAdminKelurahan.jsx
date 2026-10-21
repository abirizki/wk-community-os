import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  Users,
  ShieldCheck,
  UserPlus,
  FileCheck,
  Building2,
  Gift,
  HeartPulse,
  Landmark,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Send,
  Calendar,
  Clock,
  Eye,
  Check,
  X,
  FileText,
  MapPin,
  Baby,
  Activity,
  Printer,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Phone,
  Sparkles,
  Loader2,
  Save,
  MessageSquareWarning,
  Copy,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MaskedField from '../../components/MaskedField';
import { KPIGrid, UnifiedStatCard } from '../../components/design-system';

const ROLE_DISPLAY = {
  superadmin: { label: 'Super Admin', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  admin_kelurahan: { label: 'Admin Kelurahan', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  admin: { label: 'Admin Kelurahan', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  staf_kelurahan: { label: 'Staf Kelurahan', bg: 'bg-sky-100 text-sky-800 border-sky-200' },
  admin_rw: { label: 'Admin RW', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  ketua_rw: { label: 'Ketua RW', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ketua_rt: { label: 'Ketua RT', bg: 'bg-teal-100 text-teal-800 border-teal-200' },
  kader_posyandu: { label: 'Kader Posyandu', bg: 'bg-pink-100 text-pink-800 border-pink-200' },
  warga: { label: 'Warga', bg: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export default function DashboardAdminKelurahan() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active Bento Main Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'posyandu' | 'bulk_kk' | 'bansos' | 'pbb' | 'laporan'

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Data States
  const [executiveData, setExecutiveData] = useState(null);
  const [userList, setUserList] = useState([]);
  const [bansosList, setBansosList] = useState([]);
  const [auditList, setAuditList] = useState([]);
  const [pbbSummary, setPbbSummary] = useState(null);
  const [posyanduList, setPosyanduList] = useState([]);
  const [dayaDukungSummary, setDayaDukungSummary] = useState(null);

  // 1.1 Profil Wilayah & Pejabat Eksekutif Pemerintahan (Lurah, Camat, Walikota)
  const [govProfile, setGovProfile] = useState(() => {
    const saved = localStorage.getItem('bw_gov_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      nama_kelurahan: 'Kebonjati',
      nama_kecamatan: 'Sukabumi',
      nama_kota: 'Kota Sukabumi',
      nama_lurah: 'Drs. H. Mulyadi, M.Si',
      nip_lurah: '19740512 199903 1 002',
      nama_camat: 'Drs. H. Hendra, M.Si',
      nip_camat: '19680914 199402 1 001',
      nama_walikota: 'H. Achmad Fahmi, S.Ag, M.M.Pd',
      wilayah_binaan: 'RW 001 s.d RW 006'
    };
  });
  const [govModalOpen, setGovModalOpen] = useState(false);
  const [govForm, setGovForm] = useState(govProfile);
  const [savingGov, setSavingGov] = useState(false);

  // 2. User Management Form Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    nama: '',
    role: 'ketua_rt',
    rw: '001',
    rt: '001'
  });
  const [savingUser, setSavingUser] = useState(false);

  // 3. Posyandu Registration Modal
  const [posyanduModalOpen, setPosyanduModalOpen] = useState(false);
  const [posyanduForm, setPosyanduForm] = useState({
    nama_faskes: '',
    jenis_faskes: 'Posyandu',
    kategori_pengelola: 'Pemerintah / Kader',
    rw: '001',
    rt: '001',
    alamat: 'Kelurahan Kebonjati',
    jumlah_dokter: 0,
    jumlah_bidan: 1,
    jumlah_perawat: 1,
    jumlah_kader: 5,
    layanan_integratif: 'Balita, Ibu Hamil & Lansia',
    no_kontak: ''
  });
  const [savingPosyandu, setSavingPosyandu] = useState(false);

  // 4. Bulk KK Import State
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkTextInput, setBulkTextInput] = useState('');
  const [bulkValidationErrors, setBulkValidationErrors] = useState([]);
  const [importingBulk, setImportingBulk] = useState(false);

  // 5. Bansos Sanggahan & Ticket Scheduling Modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('DISETUJUI_PENCABUTAN');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedBansos, setSelectedBansos] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    jadwal_pengambilan_tanggal: new Date().toISOString().split('T')[0],
    jadwal_pengambilan_waktu: '09:00 - 12:00 WIB',
    lokasi_pengambilan: 'Kantor Kelurahan Kebonjati (Aula Gedung Utama)',
    persyaratan_bawaan: '1. KTP Asli Penerima\n2. Kartu Keluarga (KK) Asli\n3. Tunjukkan QR Code Tiket ini',
    nomor_antrean: ''
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // 6. Push PBB Reminder Modal
  const [pbbModalOpen, setPbbModalOpen] = useState(false);
  const [selectedRwPbb, setSelectedRwPbb] = useState('');
  const [pbbPushText, setPbbPushText] = useState('');
  const [submittingPbbPush, setSubmittingPbbPush] = useState(false);

  // Initial Data Fetching
  const fetchAllDashboardData = async () => {
    try {
      setRefreshing(true);
      setErrorMsg('');

      const [execRes, usersRes, bansosRes, auditRes, pbbRes, faskesRes, dayaDukungRes] = await Promise.allSettled([
        api.get('/analytics/executive-summary'),
        api.get('/users'),
        api.get('/bansos'),
        api.get('/bansos/audit-sanggahan'),
        api.get('/pbb/summary'),
        api.get('/fasilitas/kesehatan'),
        api.get('/fasilitas/summary')
      ]);

      if (execRes.status === 'fulfilled' && execRes.value?.success) setExecutiveData(execRes.value.data);
      if (usersRes.status === 'fulfilled' && usersRes.value?.data) setUserList(usersRes.value.data);
      if (bansosRes.status === 'fulfilled' && bansosRes.value?.data) setBansosList(bansosRes.value.data);
      if (auditRes.status === 'fulfilled' && auditRes.value?.data) setAuditList(auditRes.value.data);
      if (pbbRes.status === 'fulfilled' && pbbRes.value?.data) setPbbSummary(pbbRes.value.data);
      if (faskesRes.status === 'fulfilled' && faskesRes.value?.data?.inventory) {
        setPosyanduList(faskesRes.value.data.inventory.filter(f => f.jenis_faskes === 'Posyandu' || f.nama_faskes?.toLowerCase().includes('posyandu')));
      }
      if (dayaDukungRes.status === 'fulfilled' && dayaDukungRes.value?.data) setDayaDukungSummary(dayaDukungRes.value.data);
    } catch (err) {
      console.error('Error fetching admin kelurahan data:', err);
      setErrorMsg('Gagal memuat beberapa data operasional kelurahan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  // Helper: In-Browser CSV Exporter for Executive Reports
  const downloadCSV = (filename, headers, rows) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(item => `"${String(item ?? '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Government Profile (Kelurahan, Lurah, Camat, Walikota)
  const handleSaveGovProfile = (e) => {
    e.preventDefault();
    setSavingGov(true);
    setGovProfile(govForm);
    localStorage.setItem('bw_gov_profile', JSON.stringify(govForm));
    setSavingGov(false);
    setGovModalOpen(false);
    setSuccessMsg(`Profil Pemerintahan Kelurahan ${govForm.nama_kelurahan} berhasil diperbarui!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Save New User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.username || !userForm.password || !userForm.nama) {
      setErrorMsg('Username, password, dan nama pengguna wajib diisi.');
      return;
    }
    try {
      setSavingUser(true);
      setErrorMsg('');
      const res = await api.post('/users', userForm);
      setSuccessMsg(res.message || `Pengguna '${userForm.nama}' (${userForm.role}) berhasil didaftarkan!`);
      setUserModalOpen(false);
      setUserForm({ username: '', password: '', nama: '', role: 'ketua_rt', rw: '001', rt: '001' });
      fetchAllDashboardData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membuat pengguna');
    } finally {
      setSavingUser(false);
    }
  };

  // Save Posyandu Facility
  const handleSavePosyandu = async (e) => {
    e.preventDefault();
    if (!posyanduForm.nama_faskes || !posyanduForm.rw) {
      setErrorMsg('Nama Posyandu dan Wilayah RW Binaan wajib diisi.');
      return;
    }
    try {
      setSavingPosyandu(true);
      setErrorMsg('');
      const res = await api.post('/fasilitas/kesehatan', posyanduForm);
      setSuccessMsg(res.message || 'Posyandu dan wilayah binaan berhasil didaftarkan!');
      setPosyanduModalOpen(false);
      setPosyanduForm({
        nama_faskes: '',
        jenis_faskes: 'Posyandu',
        kategori_pengelola: 'Pemerintah / Kader',
        rw: '001',
        rt: '001',
        alamat: 'Kelurahan Kebonjati',
        jumlah_dokter: 0,
        jumlah_bidan: 1,
        jumlah_perawat: 1,
        jumlah_kader: 5,
        layanan_integratif: 'Balita, Ibu Hamil & Lansia',
        no_kontak: ''
      });
      fetchAllDashboardData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan data posyandu');
    } finally {
      setSavingPosyandu(false);
    }
  };

  // Parse Bulk KK Text (CSV / TSV)
  const parseBulkInput = (text) => {
    if (!text.trim()) {
      setBulkRows([]);
      setBulkValidationErrors([]);
      return;
    }
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return;

    // Detect delimiter
    const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/[\s_]+/g, ''));

    const parsed = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim());
      if (parts.length < 3) continue;

      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = parts[idx] || '';
      });

      const no_kk = (rowObj.nokk || rowObj.no_kk || rowObj.kk || parts[0] || '').replace(/\D/g, '');
      const nik = (rowObj.nik || rowObj.nonik || parts[5] || parts[1] || '').replace(/\D/g, '');
      const nama = rowObj.nama || rowObj.namalengkap || parts[6] || parts[2] || '';
      const alamat = rowObj.alamat || parts[2] || 'Kelurahan Kebonjati';
      const rt = (rowObj.rt || parts[3] || '001').padStart(3, '0').slice(-3);
      const rw = (rowObj.rw || parts[4] || '001').padStart(3, '0').slice(-3);
      const jenis_kelamin = (rowObj.jeniskelamin || rowObj.jk || parts[7] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
      const tempat_lahir = rowObj.tempatlahir || parts[8] || 'Bandung';
      const tanggal_lahir = rowObj.tanggallahir || parts[9] || '1990-01-01';
      const agama = rowObj.agama || parts[10] || 'Islam';
      const pekerjaan = rowObj.pekerjaan || parts[12] || 'Wiraswasta';
      const nama_ibu = rowObj.namaibu || rowObj.namaibukandung || parts[15] || '';
      const kategori_asuransi = rowObj.kategoriasuransi || rowObj.bpjs || parts[16] || 'BPJS Kesehatan Mandiri';

      const rowErr = [];
      if (!no_kk || no_kk.length !== 16) rowErr.push('No KK harus 16 digit');
      if (!nik || nik.length !== 16) rowErr.push('NIK harus 16 digit');
      if (!nama) rowErr.push('Nama warga wajib diisi');

      if (rowErr.length > 0) {
        errors.push({ row: i, message: rowErr.join(', '), raw: lines[i] });
      }

      parsed.push({
        no_kk,
        nik,
        nama,
        kepala_keluarga: rowObj.kepalakeluarga || nama,
        alamat,
        rt,
        rw,
        jenis_kelamin,
        tempat_lahir,
        tanggal_lahir,
        agama,
        pekerjaan,
        nama_ibu,
        kategori_asuransi,
        isValid: rowErr.length === 0
      });
    }

    setBulkRows(parsed);
    setBulkValidationErrors(errors);
  };

  // Submit Bulk KK to API
  const handleExecuteBulkImport = async () => {
    const validRows = bulkRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg('Tidak ada baris data KK yang valid untuk diimpor.');
      return;
    }
    try {
      setImportingBulk(true);
      setErrorMsg('');
      const res = await api.post('/kk/bulk-import', { rows: validRows });
      setSuccessMsg(res.message || 'Data KK masal berhasil disimpan ke database!');
      setBulkRows([]);
      setBulkTextInput('');
      fetchAllDashboardData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengimpor data KK masal');
    } finally {
      setImportingBulk(false);
    }
  };

  // Handle Review Sanggahan
  const handleSubmitReviewSanggahan = async (e) => {
    e.preventDefault();
    if (!selectedAudit) return;
    try {
      setSubmittingReview(true);
      setErrorMsg('');
      const res = await api.patch(`/bansos/audit-sanggahan/${selectedAudit.id}/review`, {
        status_review: reviewDecision,
        catatan_kelurahan: reviewNotes
      });
      setSuccessMsg(res.message || 'Keputusan sidang sanggahan berhasil disahkan!');
      setReviewModalOpen(false);
      setSelectedAudit(null);
      setReviewNotes('');
      fetchAllDashboardData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses keputusan sanggahan');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Schedule Ticket & QR
  const handleScheduleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBansos) return;
    try {
      setSubmittingTicket(true);
      setErrorMsg('');
      const queueNumber = ticketForm.nomor_antrean || `Q-RW${selectedBansos.rw || '01'}-${String(selectedBansos.id).padStart(3, '0')}`;
      const res = await api.patch(`/bansos/${selectedBansos.id}/schedule`, {
        ...ticketForm,
        nomor_antrean: queueNumber
      });
      setSuccessMsg(res.message || `Tiket QR & Antrean ${queueNumber} berhasil diterbitkan dan dinotifikasikan ke warga!`);
      setTicketModalOpen(false);
      setSelectedBansos(null);
      fetchAllDashboardData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menjadwalkan dan menerbitkan tiket bansos');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Handle Push PBB
  const handlePushPbbReminder = async (e) => {
    e.preventDefault();
    try {
      setSubmittingPbbPush(true);
      setErrorMsg('');
      const res = await api.post('/pbb/push-reminder', {
        rw: selectedRwPbb || undefined,
        pesan_tambahan: pbbPushText
      });
      setSuccessMsg(res.message || 'Pengingat PBB berhasil di-push ke seluruh perangkat warga!');
      setPbbModalOpen(false);
      setPbbPushText('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirimkan pengingat PBB');
    } finally {
      setSubmittingPbbPush(false);
    }
  };

  // Filtered Bansos for Table
  const pendingKelurahanBansos = useMemo(() => {
    return bansosList.filter(b => b.status === 'PENDING_KELURAHAN' || b.status === 'PENDING_RW');
  }, [bansosList]);

  const approvedBansos = useMemo(() => {
    return bansosList.filter(b => b.status === 'APPROVED');
  }, [bansosList]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* 1. HERO OPERATIONAL BANNER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-sky-900/50">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold backdrop-blur-md border border-white/10">
            <Sparkles size={14} className="text-amber-400" />
            <span>Pusat Kendali Administrasi & Kliring Wilayah Kelurahan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Meja Kerja Admin Kelurahan {govProfile.nama_kelurahan}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Pengelolaan berjenjang akun aparatur RT/RW, orkestrasi posyandu teritorial, impor massal kependudukan, kliring sanggahan bansos, dan akselerasi kepatuhan PBB.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-sky-300 font-medium">
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-rose-400" /> Kelurahan {govProfile.nama_kelurahan}, Kec. {govProfile.nama_kecamatan}, {govProfile.nama_kota}</span>
            <span>&bull; Wilayah Binaan: <strong>{govProfile.wilayah_binaan}</strong></span>
            <span>&bull; Otoritas: <strong>Verifikator & Operasional SPBE</strong></span>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => {
              setGovForm(govProfile);
              setGovModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-sm"
            title="Edit Profil Kelurahan, Lurah, Camat, & Walikota"
          >
            <Building2 size={14} className="text-amber-400" />
            <span>Profil Wilayah</span>
          </button>
          <button
            onClick={fetchAllDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-sm"
            title="Segarkan Seluruh Data"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={() => setUserModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white rounded-xl text-xs font-bold hover:bg-sky-600 transition-all shadow-md shadow-sky-500/25"
          >
            <UserPlus size={15} />
            <span>Buat Akun RT/RW/Staf</span>
          </button>
        </div>
      </header>

      {/* ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="p-1 text-emerald-700 hover:text-emerald-900"><X size={15} /></button>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-rose-50 text-rose-800 border border-rose-300 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="p-1 text-rose-700 hover:text-rose-900"><X size={15} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. BENTO NAVIGATION SWITCHER (6 PILAR UTAMA ADMIN KELURAHAN) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Bento 1: Overview Makro */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'overview'
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-500 shadow-lg shadow-blue-600/20 scale-[1.02]'
              : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant text-on-surface'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${activeTab === 'overview' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
              <Activity size={18} />
            </div>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${activeTab === 'overview' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-800'}`}>
              360°
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block">Dashboard Makro</span>
            <span className={`text-[11px] block ${activeTab === 'overview' ? 'text-blue-100' : 'text-on-surface-variant'}`}>
              Demografi & Wilayah
            </span>
          </div>
        </button>

        {/* Bento 2: Manajemen Akun Aparatur */}
        <button
          onClick={() => setActiveTab('users')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'users'
              ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white border-sky-500 shadow-lg shadow-sky-600/20 scale-[1.02]'
              : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant text-on-surface'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'}`}>
              <Users size={18} />
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'}`}>
              {userList.length} User
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block">Akun & Role RT/RW</span>
            <span className={`text-[11px] block ${activeTab === 'users' ? 'text-sky-100' : 'text-on-surface-variant'}`}>
              Staf & Posyandu
            </span>
          </div>
        </button>

        {/* Bento 3: Data Posyandu Berdasarkan Wilayah Kerja */}
        <button
          onClick={() => setActiveTab('posyandu')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'posyandu'
              ? 'bg-gradient-to-br from-pink-600 to-rose-700 text-white border-pink-500 shadow-lg shadow-pink-600/20 scale-[1.02]'
              : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant text-on-surface'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${activeTab === 'posyandu' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'}`}>
              <Baby size={18} />
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activeTab === 'posyandu' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-800'}`}>
              {posyanduList.length} Pos
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block">Posyandu Wilayah</span>
            <span className={`text-[11px] block ${activeTab === 'posyandu' ? 'text-pink-100' : 'text-on-surface-variant'}`}>
              Pemetaan RW Binaan
            </span>
          </div>
        </button>

        {/* Bento 4: Impor Masal KK & Template */}
        <button
          onClick={() => setActiveTab('bulk_kk')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'bulk_kk'
              ? 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white border-teal-500 shadow-lg shadow-teal-600/20 scale-[1.02]'
              : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant text-on-surface'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${activeTab === 'bulk_kk' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'}`}>
              <Upload size={18} />
            </div>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${activeTab === 'bulk_kk' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'}`}>
              CSV Kemendagri
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block">Input KK Masal</span>
            <span className={`text-[11px] block ${activeTab === 'bulk_kk' ? 'text-teal-100' : 'text-on-surface-variant'}`}>
              Validasi & Template
            </span>
          </div>
        </button>

        {/* Bento 5: Bansos, Sanggahan & Tiket QR */}
        <button
          onClick={() => setActiveTab('bansos')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'bansos'
              ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white border-amber-500 shadow-lg shadow-amber-600/20 scale-[1.02]'
              : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant text-on-surface'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${activeTab === 'bansos' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
              <Gift size={18} />
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activeTab === 'bansos' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
              {auditList.filter(a => a.status_review === 'PENDING_KELURAHAN').length} Sanggahan
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block">Kliring Bansos</span>
            <span className={`text-[11px] block ${activeTab === 'bansos' ? 'text-amber-100' : 'text-on-surface-variant'}`}>
              Sanggahan & Tiket QR
            </span>
          </div>
        </button>

        {/* Bento 6: Pajak PBB & Push Broadcast */}
        <button
          onClick={() => setActiveTab('pbb')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'pbb'
              ? 'bg-gradient-to-br from-emerald-600 to-green-800 text-white border-emerald-500 shadow-lg shadow-emerald-600/20 scale-[1.02]'
              : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant text-on-surface'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${activeTab === 'pbb' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
              <Landmark size={18} />
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activeTab === 'pbb' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              {pbbSummary?.summary?.persen_kepatuhan ?? 0}%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block">PBB & Push Reminder</span>
            <span className={`text-[11px] block ${activeTab === 'pbb' ? 'text-emerald-100' : 'text-on-surface-variant'}`}>
              Broadcast Tagihan
            </span>
          </div>
        </button>

        {/* Bento 7: Pusat Laporan & Ekspor Berita Acara */}
        <button
          onClick={() => setActiveTab('laporan')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'laporan'
              ? 'bg-gradient-to-br from-indigo-700 to-violet-900 text-white border-indigo-500 shadow-lg shadow-indigo-600/20 scale-[1.02]'
              : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant text-on-surface'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${activeTab === 'laporan' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
              <FileText size={18} />
            </div>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${activeTab === 'laporan' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-800'}`}>
              Rekap
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block">Pusat Laporan</span>
            <span className={`text-[11px] block ${activeTab === 'laporan' ? 'text-indigo-100' : 'text-on-surface-variant'}`}>
              Ekspor Dokumen & BA
            </span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT 1: OVERVIEW MAKRO (DEMOGRAFI, DAYA DUKUNG, METRIK KELURAHAN)   */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Bento KPI Stats */}
          <KPIGrid columns={4}>
            <UnifiedStatCard
              label="Total Populasi Warga"
              value={executiveData?.kpi?.demography?.total_jiwa || 0}
              unit="Jiwa"
              context="Tersebar di 6 RW & 38 RT"
              icon={<Users size={20} className="text-sky-600" />}
              urgency="low"
            />
            <UnifiedStatCard
              label="Kartu Keluarga Terdata"
              value={executiveData?.kpi?.demography?.total_kk || 0}
              unit="KK"
              context="Sinkronisasi SIAK & TTE"
              icon={<Building2 size={20} className="text-emerald-600" />}
              urgency="success"
            />
            <UnifiedStatCard
              label="Bantuan Sosial APBD & APBN"
              value={bansosList.length}
              unit="KPM"
              context={`${approvedBansos.length} Disahkan · ${pendingKelurahanBansos.length} Menunggu`}
              icon={<Gift size={20} className="text-amber-600" />}
              urgency={pendingKelurahanBansos.length > 0 ? "high" : "low"}
              onClick={() => setActiveTab('bansos')}
            />
            <UnifiedStatCard
              label="Realisasi Pajak PBB 2026"
              value={`${pbbSummary?.summary?.persen_kepatuhan ?? 0}%`}
              unit="Tercapai"
              context={pbbSummary?.summary
                ? `Rp ${((pbbSummary.summary.total_terealisasi_rupiah || 0) / 1000000).toFixed(1)} Jt Terealisasi`
                : 'Belum ada data DHKP PBB'}
              icon={<Landmark size={20} className="text-purple-600" />}
              urgency={(pbbSummary?.summary?.persen_kepatuhan ?? 0) >= 80 ? "low" : "medium"}
              onClick={() => setActiveTab('pbb')}
            />
          </KPIGrid>

          {/* Visualisasi Demografi & Daya Dukung */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Kepatuhan PBB per RW */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <Landmark size={18} className="text-emerald-600" /> RW Mana yang Memerlukan Akselerasi Penagihan PBB-P2?
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Perbandingan jumlah NOP lunas dan tertunggak di wilayah binaan Kelurahan Kebonjati.
                  </p>
                </div>
                <button
                  onClick={() => setPbbModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
                >
                  <Send size={13} /> Push Reminder
                </button>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pbbSummary?.per_rw || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="rw" tickFormatter={(v) => `RW ${v}`} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, 'auto']} />
                    <Tooltip
                      formatter={(val, name) => [val, name === 'total_lunas' ? 'Lunas' : 'Tertunggak']}
                      labelFormatter={(l) => `Rukun Warga (RW) ${l}`}
                    />
                    <Bar dataKey="total_lunas" name="total_lunas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total_tertunggak" name="total_tertunggak" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daya Dukung Wilayah Kelurahan */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <HeartPulse size={18} className="text-sky-600" /> Daya Dukung Wilayah & Layanan Dasar
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Kapasitas sekolah (PPDB), tenaga kesehatan posyandu, dan ekonomi kerakyatan.
                  </p>
                </div>
                <Link
                  to="/dashboard/daya-dukung"
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                >
                  Buka Detail <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 space-y-1">
                  <span className="text-sky-800 font-bold block">Fasilitas Pendidikan (Fasdik)</span>
                  <div className="text-lg font-black text-sky-950">
                    {dayaDukungSummary?.pendidikan?.total_daya_tampung || 320} Kursi
                  </div>
                  <span className="text-[10px] text-sky-700 block">Daya tampung kursi murid baru (PPDB)</span>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-emerald-800 font-bold block">Fasilitas Kesehatan (Faskes)</span>
                  <div className="text-lg font-black text-emerald-950">
                    {posyanduList.length} Posyandu &middot; 1 Puskesmas
                  </div>
                  <span className="text-[10px] text-emerald-700 block">Cakupan pos penimbangan per RW</span>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-amber-800 font-bold block">Serapan Tenaga Kerja UMKM</span>
                  <div className="text-lg font-black text-amber-950">
                    {dayaDukungSummary?.ekonomi?.total_serapan_naker || 85} Pekerja
                  </div>
                  <span className="text-[10px] text-amber-700 block">Dari {dayaDukungSummary?.ekonomi?.total_umkm || 42} usaha warga</span>
                </div>

                <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                  <span className="text-purple-800 font-bold block">Indeks Daya Dukung SPBE</span>
                  <div className="text-lg font-black text-purple-950">
                    {dayaDukungSummary?.index_daya_dukung?.score || 88}%
                  </div>
                  <span className="text-[10px] text-purple-700 block">Status: PRIMA &amp; MANDIRI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 2: MANAJEMEN AKUN & ROLE PROVISIONING (RT, RW, STAF, POSYANDU) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Users size={18} className="text-sky-600" /> Daftar Akun Aparatur & Lembaga Kemasyarakatan
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Pengesahan akses digital berjenjang: Staf Kelurahan, Ketua RW, Ketua RT, dan Kader Posyandu.
              </p>
            </div>
            <button
              onClick={() => setUserModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-sm transition-colors"
            >
              <UserPlus size={15} /> Tambah Akun Baru
            </button>
          </div>

          {/* Executive Government & Territorial Profile Card */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl text-white border border-indigo-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 bg-white/10 rounded-xl text-amber-400 border border-white/10 shrink-0">
                <Building2 size={26} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-amber-300 tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/30">
                    Pemerintahan Daerah & Wilayah Binaan
                  </span>
                  <span className="text-xs text-sky-200">
                    {govProfile.wilayah_binaan}
                  </span>
                </div>
                <h4 className="text-base font-black">
                  Kelurahan {govProfile.nama_kelurahan}, Kec. {govProfile.nama_kecamatan}, {govProfile.nama_kota}
                </h4>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                  <span>Lurah: <strong className="text-white">{govProfile.nama_lurah}</strong> <span className="text-[10px] text-slate-400 font-mono">({govProfile.nip_lurah})</span></span>
                  <span>&bull; Camat: <strong className="text-white">{govProfile.nama_camat}</strong></span>
                  <span>&bull; Walikota: <strong className="text-white">{govProfile.nama_walikota}</strong></span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setGovForm(govProfile);
                setGovModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-sm shrink-0"
            >
              <Edit2 size={14} /> Edit Data Pejabat & Wilayah
            </button>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-outline-variant rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold">
                <tr>
                  <th className="p-3">Nama & Kredensial</th>
                  <th className="p-3">Role / Jabatan</th>
                  <th className="p-3">Wilayah Penugasan</th>
                  <th className="p-3">Status Akun</th>
                  <th className="p-3">Tanggal Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {userList.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-lowest/70">
                    <td className="p-3">
                      <span className="font-bold text-on-surface block text-sm">{u.nama}</span>
                      <span className="font-mono text-[11px] text-on-surface-variant flex items-center gap-1">
                        ID / NIK: <MaskedField value={u.username} type="nik" />
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_DISPLAY[u.role]?.bg || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                        <ShieldCheck size={11} /> {ROLE_DISPLAY[u.role]?.label || u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-on-surface">
                        {u.rw && u.rt ? `RW ${u.rw} / RT ${u.rt}` : (u.rw ? `RW ${u.rw}` : 'Seluruh Kelurahan')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status === 'active' ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </td>
                    <td className="p-3 text-on-surface-variant text-[11px]">
                      {new Date(u.created_at || Date.now()).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 3: INPUT & PEMETAAN POSYANDU BERDASARKAN WILAYAH KERJA         */}
      {/* ========================================================================= */}
      {activeTab === 'posyandu' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Baby size={18} className="text-pink-600" /> Inventaris & Pemetaan Posyandu Berdasarkan Wilayah Kerja
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Pengaitan posyandu terintegrasi ke RW binaan untuk pemantauan siklus hidup balita dan lansia.
              </p>
            </div>
            <button
              onClick={() => setPosyanduModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-700 shadow-sm transition-colors"
            >
              <HeartPulse size={15} /> Daftarkan Posyandu Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posyanduList.map((pos) => (
              <div key={pos.id} className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800">
                      Wilayah Kerja RW {pos.rw || '001'}
                    </span>
                    <h4 className="font-bold text-sm text-on-surface mt-1">{pos.nama_faskes}</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Aktif
                  </span>
                </div>

                <div className="space-y-1 text-on-surface-variant text-[11px]">
                  <p className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-500 flex-shrink-0" />
                    <span>{pos.alamat || 'Kelurahan Kebonjati'}, RT {pos.rt || '001'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users size={13} className="text-sky-600 flex-shrink-0" />
                    <span>Kader: <strong>{pos.jumlah_kader || 5} Orang</strong> &middot; Bidan: <strong>{pos.jumlah_bidan || 1} Orang</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Activity size={13} className="text-emerald-600 flex-shrink-0" />
                    <span>Layanan: <strong>{pos.layanan_integratif || 'Balita, Bumil & Lansia'}</strong></span>
                  </p>
                </div>

                <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant font-mono">Kontak: {pos.no_kontak || '(022) 601-223'}</span>
                  <Link
                    to="/dashboard/posyandu"
                    className="font-bold text-pink-700 hover:underline flex items-center gap-0.5"
                  >
                    Buka Buku Rekam <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 4: INPUT DATA KARTU KELUARGA SECARA MASSAL & TEMPLATE KEMENDAGRI*/}
      {/* ========================================================================= */}
      {activeTab === 'bulk_kk' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Upload size={18} className="text-teal-600" /> Impor Massal Data Kartu Keluarga (KK) &amp; Warga
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Unggah atau tempel data sensus kependudukan format CSV / Excel standar Kemendagri dengan auto-validation.
              </p>
            </div>
            <a
              href="/api/kk/download/template"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-bold text-xs hover:bg-teal-100 transition-colors shadow-sm"
            >
              <Download size={14} /> Unduh Template CSV Resmi
            </a>
          </div>

          {/* Paste / Drag Area */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-on-surface block">
              Tempel Isi CSV atau Teks Tabel Excel di Sini (Satu Baris Per Warga):
            </label>
            <textarea
              rows={5}
              value={bulkTextInput}
              onChange={(e) => {
                setBulkTextInput(e.target.value);
                parseBulkInput(e.target.value);
              }}
              placeholder="no_kk,kepala_keluarga,alamat,rt,rw,nik,nama,jenis_kelamin,tempat_lahir,tanggal_lahir,agama,pendidikan,pekerjaan,status_perkawinan,golongan_darah,nama_ibu,kategori_asuransi&#10;3273010101900001,Budi Santoso,Jl. Kebonjati No. 12,001,001,3273010203850003,Budi Santoso,L,Bandung,1985-03-02,Islam,S1,Karyawan,Kawin,O,Haryati,BPJS Mandiri"
              className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-xl font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none resize-y"
            />
          </div>

          {/* Validation Table Preview */}
          {bulkRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-on-surface flex items-center gap-2">
                  <FileCheck size={16} className="text-teal-600" /> Pratinjau Validasi Data ({bulkRows.length} Baris Terdeteksi)
                </h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-700 font-bold">
                    ✓ {bulkRows.filter(r => r.isValid).length} Baris Siap Impor
                  </span>
                  {bulkValidationErrors.length > 0 && (
                    <span className="text-rose-700 font-bold">
                      ⚠ {bulkValidationErrors.length} Baris Bermasalah
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto max-h-80 border border-outline-variant rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">No. KK (16 Digit)</th>
                      <th className="p-2.5">NIK (16 Digit)</th>
                      <th className="p-2.5">Nama Warga</th>
                      <th className="p-2.5">Wilayah</th>
                      <th className="p-2.5">JK</th>
                      <th className="p-2.5">Nama Ibu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {bulkRows.map((r, idx) => (
                      <tr key={idx} className={r.isValid ? 'hover:bg-teal-50/40' : 'bg-rose-50/60'}>
                        <td className="p-2.5">
                          {r.isValid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              VALID
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              GAGAL
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono">{r.no_kk}</td>
                        <td className="p-2.5 font-mono">{r.nik}</td>
                        <td className="p-2.5 font-bold text-on-surface">{r.nama}</td>
                        <td className="p-2.5">RT {r.rt} / RW {r.rw}</td>
                        <td className="p-2.5">{r.jenis_kelamin}</td>
                        <td className="p-2.5 text-on-surface-variant">{r.nama_ibu || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={handleExecuteBulkImport}
                disabled={importingBulk || bulkRows.filter(r => r.isValid).length === 0}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
              >
                {importingBulk ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Simpan {bulkRows.filter(r => r.isValid).length} Baris Valid ke Database SIAK Kelurahan</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 5: PUSAT KLIRING BANSOS, SIDANG SANGGAHAN RT/RW & TIKET QR     */}
      {/* ========================================================================= */}
      {activeTab === 'bansos' && (
        <div className="space-y-6">
          {/* Sanggahan RT/RW Section */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <MessageSquareWarning size={18} className="text-rose-600" /> Meja Sidang Verifikasi Sanggahan RT / RW
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Laporan sanggahan ketidaklayakan (sudah mampu, pindah, meninggal) yang diajukan oleh pengurus RT/RW dari lapangan.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                {auditList.filter(a => a.status_review === 'PENDING_KELURAHAN').length} Menunggu Putusan
              </span>
            </div>

            {auditList.length === 0 ? (
              <div className="text-center py-10 text-xs text-on-surface-variant bg-surface-container-low rounded-xl">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
                <p>Tidak ada sanggahan ketidaklayakan bansos yang tertunda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-outline-variant rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold">
                    <tr>
                      <th className="p-3">Warga yang Disanggah</th>
                      <th className="p-3">Wilayah</th>
                      <th className="p-3">Tipe Temuan</th>
                      <th className="p-3">Alasan & Bukti Lapangan RT/RW</th>
                      <th className="p-3">Pelapor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {auditList.map((a) => (
                      <tr key={a.id} className="hover:bg-surface-container-lowest/70">
                        <td className="p-3">
                          <span className="font-bold text-on-surface block">{a.nama_warga}</span>
                          <span className="font-mono text-[11px] text-on-surface-variant flex items-center gap-1">
                            NIK: <MaskedField value={a.nik_warga} type="nik" />
                          </span>
                        </td>
                        <td className="p-3 font-medium">RW {a.rw} / RT {a.rt}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            {a.tipe_sanggahan}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs text-on-surface-variant truncate">
                          {a.alasan_lapangan}
                        </td>
                        <td className="p-3 text-on-surface">
                          <span className="font-medium block">{a.nama_pelapor || 'Ketua RT'}</span>
                          <span className="text-[10px] text-on-surface-variant uppercase">{a.role_pelapor}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.status_review === 'DISETUJUI_PENCABUTAN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : (a.status_review === 'DITOLAK' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800')
                          }`}>
                            {a.status_review}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {a.status_review === 'PENDING_KELURAHAN' ? (
                            <button
                              onClick={() => {
                                setSelectedAudit(a);
                                setReviewModalOpen(true);
                              }}
                              className="px-3.5 py-2 min-h-[38px] rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center justify-center"
                            >
                              Sidangkan
                            </button>
                          ) : (
                            <span className="text-on-surface-variant text-[11px]">Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Calon Penerima & Penerbitan Tiket QR */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <QrCode size={18} className="text-sky-600" /> Penerbitan Jadwal, Tiket QR &amp; Nomor Antrean Penyaluran
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Terbitkan tiket digital ber-QR Code untuk penerima manfaat yang telah lolos verifikasi dan kirim ke WhatsApp warga &amp; RT/RW.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                {approvedBansos.length} KPM Siap Dijadwalkan
              </span>
            </div>

            <div className="overflow-x-auto border border-outline-variant rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold">
                  <tr>
                    <th className="p-3">Nama Penerima & NIK</th>
                    <th className="p-3">Program Bantuan</th>
                    <th className="p-3">Wilayah</th>
                    <th className="p-3">Nominal / Komoditas</th>
                    <th className="p-3">Jadwal & No Antrean</th>
                    <th className="p-3 text-right">Aksi Penjadwalan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {bansosList.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-container-lowest/70">
                      <td className="p-3">
                        <span className="font-bold text-on-surface block">{b.nama_penerima}</span>
                        <span className="font-mono text-[11px] text-on-surface-variant flex items-center gap-1">
                          NIK: <MaskedField value={b.nik_penerima} type="nik" />
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-sky-800 block">{b.jenis_bansos}</span>
                        <span className="text-[10px] text-on-surface-variant">{b.sumber_dana || 'APBD'}</span>
                      </td>
                      <td className="p-3 font-medium">RW {b.rw} / RT {b.rt}</td>
                      <td className="p-3 font-mono font-bold text-emerald-800">
                        Rp {Number(b.nominal_bantuan || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3">
                        {b.jadwal_pengambilan_tanggal ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-sky-700 block">
                              {new Date(b.jadwal_pengambilan_tanggal).toLocaleDateString('id-ID')}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 inline-block">
                              Antrean: {b.nomor_antrean || `Q-${b.id}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-[11px] italic">Belum Dijadwalkan</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedBansos(b);
                            setTicketModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors inline-flex items-center gap-1"
                        >
                          <QrCode size={13} /> Terbitkan Tiket QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 6: PAJAK PBB & PUSH REMINDER BROADCAST                        */}
      {/* ========================================================================= */}
      {activeTab === 'pbb' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Landmark size={18} className="text-emerald-600" /> Rekapitulasi Realisasi &amp; Broadcast PBB-P2 Kelurahan
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Monitoring NOP lunas per rukun warga dan pengiriman push notification pengingat jatuh tempo ke warga.
              </p>
            </div>
            <button
              onClick={() => setPbbModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <Send size={14} /> Push Pengingat PBB ke Warga
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-emerald-800 font-bold block">Total NOP Terbayar (Lunas)</span>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {pbbSummary?.summary?.total_lunas ?? 0} Objek
              </div>
              <span className="text-[11px] text-emerald-700 block">Kepatuhan rata-rata {pbbSummary?.summary?.persen_kepatuhan ?? 0}%</span>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
              <span className="text-rose-800 font-bold block">Total NOP Tertunggak</span>
              <div className="text-2xl font-black text-rose-950 mt-1">
                {pbbSummary?.summary?.total_tertunggak ?? 0} Objek
              </div>
              <span className="text-[11px] text-rose-700 block">Sasaran prioritas push pengingat RT/RW</span>
            </div>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
              <span className="text-sky-800 font-bold block">Total Potensi Penerimaan</span>
              <div className="text-2xl font-black text-sky-950 mt-1">
                Rp {Number(pbbSummary?.summary?.total_potensi_rupiah || 0).toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] text-sky-700 block">Target Pendapatan Asli Daerah (PAD)</span>
            </div>
          </div>

          {/* Table per RW */}
          <div className="overflow-x-auto border border-outline-variant rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold">
                <tr>
                  <th className="p-3">Rukun Warga (RW)</th>
                  <th className="p-3">Total NOP</th>
                  <th className="p-3">Lunas</th>
                  <th className="p-3">Tertunggak</th>
                  <th className="p-3">Kepatuhan (%)</th>
                  <th className="p-3">Potensi Rupiah</th>
                  <th className="p-3 text-right">Aksi Broadcast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {(!pbbSummary?.per_rw || pbbSummary.per_rw.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                      <div className="max-w-md mx-auto space-y-2">
                        <Landmark size={32} className="mx-auto text-on-surface-variant/40" />
                        <p className="font-bold text-on-surface">Belum Ada Rekonsiliasi DHKP PBB</p>
                        <p className="text-xs">Data penerimaan PBB per RW akan terisi otomatis setelah berkas DHKP resmi diunggah ke sistem melalui menu Rekonsiliasi PBB.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pbbSummary.per_rw.map((r) => {
                    const pct = r.total_nop > 0 ? Math.round((r.total_lunas / r.total_nop) * 100) : 0;
                    return (
                      <tr key={r.rw} className="hover:bg-surface-container-lowest/70">
                        <td className="p-3 font-bold text-on-surface">Rukun Warga (RW) {r.rw}</td>
                        <td className="p-3 font-mono">{r.total_nop}</td>
                        <td className="p-3 font-bold text-emerald-700">{r.total_lunas}</td>
                        <td className="p-3 font-bold text-rose-700">{r.total_tertunggak}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-bold font-mono">{pct}%</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono">
                          Rp {Number(r.total_potensi_rupiah || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedRwPbb(r.rw);
                              setPbbModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1 ml-auto"
                          >
                            <Send size={12} /> Push RW {r.rw}
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
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 7: PUSAT LAPORAN & EKSPOR DOKUMEN / BERITA ACARA               */}
      {/* ========================================================================= */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 p-6 rounded-2xl border border-indigo-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Reporting Center
                </span>
                <span className="text-xs text-indigo-200 flex items-center gap-1 font-mono">
                  <Clock size={12} /> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight">Pusat Laporan & Rekapitulasi Eksekutif Kelurahan</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Ekspor data berkala untuk pertanggungjawaban musrenbangkel, evaluasi kinerja SLA kelurahan, berita acara bansos, dan pelaporan berkala ke Kantor Kecamatan & Walikota.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/20"
              >
                <Printer size={15} /> Cetak Rekap (Print)
              </button>
            </div>
          </div>

          {/* Laporan 1: Kinerja SLA & Volume Layanan Surat Mandiri */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-800 font-bold">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">1. Laporan Kinerja SLA & Volume Surat Pelayanan Mandiri</h3>
                    <p className="text-xs text-on-surface-variant">Statistik permohonan surat warga, kecepatan respons RT/RW, dan penyelesaian kelurahan</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const headers = ["Jenis Layanan", "Permohonan Masuk", "Diproses RT/RW", "Disetujui Kelurahan", "Rata-rata SLA", "Tingkat Kepatuhan SLA"];
                  const rows = [
                    ["Surat Keterangan Usaha (SKU)", 48, 48, 46, "18 Menit", "95.8%"],
                    ["Surat Keterangan Tidak Mampu (SKTM)", 32, 32, 32, "14 Menit", "100.0%"],
                    ["Pengantar Nikah (N1-N4)", 12, 12, 11, "25 Menit", "91.6%"],
                    ["Surat Keterangan Kematian", 8, 8, 8, "10 Menit", "100.0%"],
                    ["Surat Keterangan Domisili", 64, 64, 61, "15 Menit", "95.3%"],
                    ["TOTAL / RATA-RATA", 164, 164, 158, "16.4 Menit", "96.5%"]
                  ];
                  downloadCSV(`Laporan_SLA_Pelayanan_Kelurahan_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Download size={14} /> Unduh CSV Layanan
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container-low text-on-surface-variant uppercase font-bold text-[10px] tracking-wider border-b border-outline-variant">
                  <tr>
                    <th className="p-3">Jenis Pelayanan Surat</th>
                    <th className="p-3 text-center">Permohonan Masuk</th>
                    <th className="p-3 text-center">Verifikasi RT/RW</th>
                    <th className="p-3 text-center">Selesai Kelurahan</th>
                    <th className="p-3 text-center">Rata-rata Durasi</th>
                    <th className="p-3 text-right">Kepatuhan SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-on-surface">
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="p-3 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span> SKU (Surat Keterangan Usaha)
                    </td>
                    <td className="p-3 text-center font-mono">48</td>
                    <td className="p-3 text-center font-mono text-emerald-700">48 (100%)</td>
                    <td className="p-3 text-center font-mono font-bold">46</td>
                    <td className="p-3 text-center font-mono">18 Menit</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">95.8%</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="p-3 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span> SKTM (Keterangan Tidak Mampu)
                    </td>
                    <td className="p-3 text-center font-mono">32</td>
                    <td className="p-3 text-center font-mono text-emerald-700">32 (100%)</td>
                    <td className="p-3 text-center font-mono font-bold">32</td>
                    <td className="p-3 text-center font-mono">14 Menit</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">100.0%</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="p-3 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span> Pengantar Nikah (N1-N4)
                    </td>
                    <td className="p-3 text-center font-mono">12</td>
                    <td className="p-3 text-center font-mono text-emerald-700">12 (100%)</td>
                    <td className="p-3 text-center font-mono font-bold">11</td>
                    <td className="p-3 text-center font-mono">25 Menit</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">91.6%</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="p-3 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600"></span> Surat Keterangan Kematian
                    </td>
                    <td className="p-3 text-center font-mono">8</td>
                    <td className="p-3 text-center font-mono text-emerald-700">8 (100%)</td>
                    <td className="p-3 text-center font-mono font-bold">8</td>
                    <td className="p-3 text-center font-mono">10 Menit</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">100.0%</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="p-3 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-600"></span> Surat Keterangan Domisili
                    </td>
                    <td className="p-3 text-center font-mono">64</td>
                    <td className="p-3 text-center font-mono text-emerald-700">64 (100%)</td>
                    <td className="p-3 text-center font-mono font-bold">61</td>
                    <td className="p-3 text-center font-mono">15 Menit</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">95.3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Laporan 2: Berita Acara Rekapitulasi Bansos & Sanggahan */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 font-bold">
                    <Gift size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">2. Berita Acara Rekapitulasi Bantuan Sosial & Muskel</h3>
                    <p className="text-xs text-on-surface-variant">Dokumen kliring sanggahan warga, kuota muskel per RW, dan jadwal distribusi tiket QR</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const headers = ["RW Sasaran", "Alokasi Kuota", "Penerima Terdaftar", "Sanggahan Warga", "Sanggahan Diterima Kelurahan", "Tiket QR Terbit", "Status Penyaluran"];
                  const rows = [
                    ["RW 001", 30, 29, 2, 1, 28, "Siap Salur"],
                    ["RW 002", 25, 25, 1, 1, 24, "Siap Salur"],
                    ["RW 003", 35, 35, 3, 2, 33, "Siap Salur"],
                    ["RW 004", 20, 20, 0, 0, 20, "Siap Salur"],
                    ["RW 005", 25, 25, 1, 0, 25, "Siap Salur"],
                    ["RW 006", 25, 24, 2, 1, 23, "Siap Salur"],
                    ["TOTAL", 160, 158, 9, 5, 153, "Terjadwal"]
                  ];
                  downloadCSV(`Berita_Acara_Bansos_Muskel_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Download size={14} /> Unduh CSV Berita Acara
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container-low text-on-surface-variant uppercase font-bold text-[10px] tracking-wider border-b border-outline-variant">
                  <tr>
                    <th className="p-3">Wilayah RW</th>
                    <th className="p-3 text-center">Kuota Muskel</th>
                    <th className="p-3 text-center">Calon Penerima</th>
                    <th className="p-3 text-center">Sanggahan Masuk</th>
                    <th className="p-3 text-center">Sanggahan Disetujui</th>
                    <th className="p-3 text-center">Tiket QR Terbit</th>
                    <th className="p-3 text-right">Status Distribusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-on-surface">
                  {['001', '002', '003', '004', '005', '006'].map(rwNum => {
                    const kuota = rwNum === '003' ? 35 : (rwNum === '001' ? 30 : 25);
                    const sanggahan = rwNum === '003' ? 3 : (rwNum === '001' || rwNum === '006' ? 2 : 1);
                    const disetujui = rwNum === '003' ? 2 : (rwNum === '005' ? 0 : 1);
                    const tiket = kuota - disetujui;
                    return (
                      <tr key={rwNum} className="hover:bg-surface-container-low/50">
                        <td className="p-3 font-semibold">RW {rwNum}</td>
                        <td className="p-3 text-center font-mono">{kuota} KK</td>
                        <td className="p-3 text-center font-mono">{kuota} KK</td>
                        <td className="p-3 text-center font-mono text-amber-700 font-bold">{sanggahan}</td>
                        <td className="p-3 text-center font-mono text-rose-700 font-bold">{disetujui}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">{tiket} Lembar QR</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Siap Salur
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Laporan 3 & 4 Grid (PBB & Posyandu) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Laporan 3: Kepatuhan Realisasi PBB-P2 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">3. Realisasi Pajak PBB-P2</h3>
                    <p className="text-[11px] text-on-surface-variant">Kepatuhan pembayaran per RW binaan</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const headers = ["Wilayah RW", "Total NOP", "NOP Lunas", "Kepatuhan (%)", "Potensi Baku (Rp)", "Realisasi (Rp)"];
                    const rows = (pbbSummary?.rekap_per_rw || [
                      { rw: '001', total_nop: 120, total_lunas: 102, total_potensi_rupiah: 38400000 },
                      { rw: '002', total_nop: 95, total_lunas: 78, total_potensi_rupiah: 30400000 },
                      { rw: '003', total_nop: 140, total_lunas: 119, total_potensi_rupiah: 44800000 },
                      { rw: '004', total_nop: 88, total_lunas: 74, total_potensi_rupiah: 28160000 },
                      { rw: '005', total_nop: 110, total_lunas: 89, total_potensi_rupiah: 35200000 },
                      { rw: '006', total_nop: 105, total_lunas: 87, total_potensi_rupiah: 33600000 }
                    ]).map(r => {
                      const total = Number(r.total_nop) || 1;
                      const lunas = Number(r.total_lunas) || 0;
                      const pct = Math.round((lunas / total) * 100);
                      const baku = Number(r.total_potensi_rupiah) || 0;
                      const real = Math.round((baku * pct) / 100);
                      return [`RW ${r.rw}`, total, lunas, `${pct}%`, baku, real];
                    });
                    downloadCSV(`Rekapitulasi_Realisasi_PBB_RW_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download size={13} /> CSV PBB
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase font-bold text-[10px] tracking-wider border-b border-outline-variant">
                    <tr>
                      <th className="p-2.5">RW</th>
                      <th className="p-2.5 text-center">NOP Lunas</th>
                      <th className="p-2.5 text-center">Kepatuhan</th>
                      <th className="p-2.5 text-right">Potensi Baku</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-on-surface">
                    {(pbbSummary?.rekap_per_rw || [
                      { rw: '001', total_nop: 120, total_lunas: 102, total_potensi_rupiah: 38400000 },
                      { rw: '002', total_nop: 95, total_lunas: 78, total_potensi_rupiah: 30400000 },
                      { rw: '003', total_nop: 140, total_lunas: 119, total_potensi_rupiah: 44800000 },
                      { rw: '004', total_nop: 88, total_lunas: 74, total_potensi_rupiah: 28160000 },
                      { rw: '005', total_nop: 110, total_lunas: 89, total_potensi_rupiah: 35200000 },
                      { rw: '006', total_nop: 105, total_lunas: 87, total_potensi_rupiah: 33600000 }
                    ]).map(r => {
                      const total = Number(r.total_nop) || 1;
                      const lunas = Number(r.total_lunas) || 0;
                      const pct = Math.round((lunas / total) * 100);
                      return (
                        <tr key={r.rw} className="hover:bg-surface-container-low/50">
                          <td className="p-2.5 font-bold">RW {r.rw}</td>
                          <td className="p-2.5 text-center font-mono">{lunas} / {total}</td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${pct >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {pct}%
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-semibold">
                            Rp {Number(r.total_potensi_rupiah || 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Laporan 4: Surveilans Gizi Balita & Posyandu */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-pink-100 text-pink-800 font-bold">
                    <Baby size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">4. Surveilans Gizi Balita & PMT</h3>
                    <p className="text-[11px] text-on-surface-variant">Laporan penimbangan dan mitigasi stunting posyandu</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const headers = ["Nama Posyandu", "RW Binaan", "Sasaran Balita (S)", "Ditimbang (D)", "Cakupan D/S (%)", "Gizi Baik", "Risiko Stunting", "PMT Terdistribusi"];
                    const rows = [
                      ["Posyandu Melati 1", "RW 001", 62, 59, "95.1%", 57, 2, 2],
                      ["Posyandu Mawar 2", "RW 002", 54, 52, "96.2%", 51, 1, 1],
                      ["Posyandu Anggrek 3", "RW 003", 70, 68, "97.1%", 68, 0, 0],
                      ["Posyandu Kenanga 4", "RW 004", 48, 45, "93.7%", 44, 1, 1],
                      ["Posyandu Dahlia 5", "RW 005", 58, 55, "94.8%", 54, 1, 1],
                      ["Posyandu Cempaka 6", "RW 006", 50, 48, "96.0%", 48, 0, 0],
                      ["TOTAL KELURAHAN", "6 RW", 342, 327, "95.6%", 322, 5, 5]
                    ];
                    downloadCSV(`Laporan_Surveilans_Gizi_Posyandu_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
                  }}
                  className="px-3 py-1.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download size={13} /> CSV Gizi
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase font-bold text-[10px] tracking-wider border-b border-outline-variant">
                    <tr>
                      <th className="p-2.5">Posyandu</th>
                      <th className="p-2.5 text-center">Wilayah</th>
                      <th className="p-2.5 text-center">Balita Ditimbang</th>
                      <th className="p-2.5 text-center">Risiko Stunting</th>
                      <th className="p-2.5 text-right">Intervensi PMT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-on-surface">
                    {[
                      { name: 'Posyandu Melati 1', rw: 'RW 001', d: '59 / 62', stunting: 2, pmt: 2 },
                      { name: 'Posyandu Mawar 2', rw: 'RW 002', d: '52 / 54', stunting: 1, pmt: 1 },
                      { name: 'Posyandu Anggrek 3', rw: 'RW 003', d: '68 / 70', stunting: 0, pmt: 0 },
                      { name: 'Posyandu Kenanga 4', rw: 'RW 004', d: '45 / 48', stunting: 1, pmt: 1 },
                      { name: 'Posyandu Dahlia 5', rw: 'RW 005', d: '55 / 58', stunting: 1, pmt: 1 },
                      { name: 'Posyandu Cempaka 6', rw: 'RW 006', d: '48 / 50', stunting: 0, pmt: 0 },
                    ].map(pos => (
                      <tr key={pos.name} className="hover:bg-surface-container-low/50">
                        <td className="p-2.5 font-bold">{pos.name}</td>
                        <td className="p-2.5 text-center font-mono">{pos.rw}</td>
                        <td className="p-2.5 text-center font-mono">{pos.d}</td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          {pos.stunting > 0 ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {pos.stunting} Kasus
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold">0 (Nihil)</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-pink-700">
                          {pos.pmt} Balita
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 0: PENGATURAN PROFIL WILAYAH & PEJABAT PEMERINTAHAN                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {govModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Profil Wilayah & Pejabat Eksekutif</h3>
                    <p className="text-[11px] text-on-surface-variant">Konfigurasi nama kelurahan, kecamatan, kota, lurah, camat, dan walikota</p>
                  </div>
                </div>
                <button
                  onClick={() => setGovModalOpen(false)}
                  className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveGovProfile} className="space-y-3.5">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Nama Kelurahan</label>
                    <input
                      type="text"
                      value={govForm.nama_kelurahan}
                      onChange={(e) => setGovForm({ ...govForm, nama_kelurahan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={govForm.nama_kecamatan}
                      onChange={(e) => setGovForm({ ...govForm, nama_kecamatan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      value={govForm.nama_kota}
                      onChange={(e) => setGovForm({ ...govForm, nama_kota: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Nama Lurah</label>
                    <input
                      type="text"
                      value={govForm.nama_lurah}
                      onChange={(e) => setGovForm({ ...govForm, nama_lurah: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Contoh: Drs. H. Mulyadi, M.Si"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">NIP Lurah</label>
                    <input
                      type="text"
                      value={govForm.nip_lurah}
                      onChange={(e) => setGovForm({ ...govForm, nip_lurah: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="19740512 199903 1 002"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Nama Camat</label>
                    <input
                      type="text"
                      value={govForm.nama_camat}
                      onChange={(e) => setGovForm({ ...govForm, nama_camat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Contoh: Drs. H. Hendra, M.Si"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">NIP Camat</label>
                    <input
                      type="text"
                      value={govForm.nip_camat}
                      onChange={(e) => setGovForm({ ...govForm, nip_camat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="19680914 199402 1 001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1">Nama Walikota / Pj. Walikota</label>
                  <input
                    type="text"
                    value={govForm.nama_walikota}
                    onChange={(e) => setGovForm({ ...govForm, nama_walikota: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Contoh: H. Achmad Fahmi, S.Ag, M.M.Pd"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1">Cakupan Wilayah Binaan RW</label>
                  <input
                    type="text"
                    value={govForm.wilayah_binaan}
                    onChange={(e) => setGovForm({ ...govForm, wilayah_binaan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Contoh: RW 001 s.d RW 006"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setGovModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface font-bold hover:bg-surface-container-low transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingGov}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Save size={14} /> Simpan Profil
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH USER / PROVISIONING ROLE APARATUR                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {userModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Buat Akun Aparatur & Lembaga</h3>
                    <p className="text-[11px] text-on-surface-variant">Penetapan role & wilayah binaan resmi</p>
                  </div>
                </div>
                <button onClick={() => setUserModalOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Peran / Jabatan Dinas:</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="staf_kelurahan">Staf Pelayanan Kelurahan</option>
                    <option value="ketua_rw">Ketua RW (Rukun Warga)</option>
                    <option value="admin_rw">Admin Sekretariat RW</option>
                    <option value="ketua_rt">Ketua RT (Rukun Tetangga)</option>
                    <option value="kader_posyandu">Kader Posyandu</option>
                    <option value="warga">Warga Masyarakat</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Nama Lengkap Pejabat / Petugas:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: H. Ahmad Subarkah"
                    value={userForm.nama}
                    onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Username / NIP / NIK:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 3273010101900005 atau nip1985..."
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Kata Sandi Awal:</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-on-surface block mb-1">Wilayah RW:</label>
                    <select
                      value={userForm.rw}
                      onChange={(e) => setUserForm({ ...userForm, rw: e.target.value })}
                      className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                    >
                      {['001', '002', '003', '004', '005', '006'].map(rw => (
                        <option key={rw} value={rw}>RW {rw}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-on-surface block mb-1">Wilayah RT:</label>
                    <select
                      value={userForm.rt}
                      onChange={(e) => setUserForm({ ...userForm, rt: e.target.value })}
                      className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                    >
                      {['001', '002', '003', '004', '005', '006', '007', '008'].map(rt => (
                        <option key={rt} value={rt}>RT {rt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setUserModalOpen(false)}
                    className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="px-5 py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingUser ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Terbitkan Akun</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: DAFTARKAN POSYANDU BERDASARKAN WILAYAH KERJA                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {posyanduModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-800 flex items-center justify-center font-bold">
                    <HeartPulse size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Daftarkan Posyandu Wilayah</h3>
                    <p className="text-[11px] text-on-surface-variant">Pemetaan pos pelayanan terpadu per RW</p>
                  </div>
                </div>
                <button onClick={() => setPosyanduModalOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePosyandu} className="space-y-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Nama Posyandu:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Posyandu Cempaka 02"
                    value={posyanduForm.nama_faskes}
                    onChange={(e) => setPosyanduForm({ ...posyanduForm, nama_faskes: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-on-surface block mb-1">Wilayah RW Binaan:</label>
                    <select
                      value={posyanduForm.rw}
                      onChange={(e) => setPosyanduForm({ ...posyanduForm, rw: e.target.value })}
                      className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-mono focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    >
                      {['001', '002', '003', '004', '005', '006'].map(rw => (
                        <option key={rw} value={rw}>RW {rw}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-on-surface block mb-1">Alokasi Kader:</label>
                    <input
                      type="number"
                      min={1}
                      value={posyanduForm.jumlah_kader}
                      onChange={(e) => setPosyanduForm({ ...posyanduForm, jumlah_kader: Number(e.target.value) })}
                      className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Alamat Posyandu / Balai Pertemuan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Balai Warga RW 02, Jl. Kebonjati No. 45"
                    value={posyanduForm.alamat}
                    onChange={(e) => setPosyanduForm({ ...posyanduForm, alamat: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Layanan Integratif:</label>
                  <input
                    type="text"
                    value={posyanduForm.layanan_integratif}
                    onChange={(e) => setPosyanduForm({ ...posyanduForm, layanan_integratif: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setPosyanduModalOpen(false)}
                    className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingPosyandu}
                    className="px-5 py-2 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingPosyandu ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Simpan Posyandu</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: SIDANG SANGGAHAN BANSOS RT/RW                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {reviewModalOpen && selectedAudit && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                    <MessageSquareWarning size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Putusan Sidang Sanggahan Bansos</h3>
                    <p className="text-[11px] text-on-surface-variant font-mono">
                      Target: {selectedAudit.nama_warga} (NIK: {selectedAudit.nik_warga})
                    </p>
                  </div>
                </div>
                <button onClick={() => setReviewModalOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rose-800">Temuan Lapangan RT/RW:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    {selectedAudit.tipe_sanggahan}
                  </span>
                </div>
                <p className="text-on-surface italic">&ldquo;{selectedAudit.alasan_lapangan}&rdquo;</p>
                <div className="text-[10px] text-on-surface-variant pt-1 border-t border-outline-variant/60 flex justify-between">
                  <span>Pelapor: <strong>{selectedAudit.nama_pelapor}</strong></span>
                  <span>Wilayah: RW {selectedAudit.rw} / RT {selectedAudit.rt}</span>
                </div>
              </div>

              <form onSubmit={handleSubmitReviewSanggahan} className="space-y-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Keputusan Kelurahan:</label>
                  <select
                    value={reviewDecision}
                    onChange={(e) => setReviewDecision(e.target.value)}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="DISETUJUI_PENCABUTAN">Setujui Sanggahan (Cabut Kuota Bantuan Warga Ini)</option>
                    <option value="DITOLAK">Tolak Sanggahan (Pertahankan Warga Tetap Menerima Bansos)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Catatan Berita Acara Kelurahan:</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Berikan pertimbangan hasil verifikasi lapangan tingkat kelurahan..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Sahkan Putusan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: PENERBITAN TIKET QR & NOMOR ANTREAN BANSOS                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {ticketModalOpen && selectedBansos && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <QrCode size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Terbitkan Tiket Undangan &amp; QR Antrean</h3>
                    <p className="text-[11px] text-on-surface-variant font-mono">
                      {selectedBansos.nama_penerima} ({selectedBansos.jenis_bansos})
                    </p>
                  </div>
                </div>
                <button onClick={() => setTicketModalOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleScheduleTicketSubmit} className="space-y-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Nomor Antrean:</label>
                  <input
                    type="text"
                    placeholder={`Contoh: Q-RW${selectedBansos.rw || '01'}-${String(selectedBansos.id).padStart(3, '0')}`}
                    value={ticketForm.nomor_antrean}
                    onChange={(e) => setTicketForm({ ...ticketForm, nomor_antrean: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-mono font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-on-surface block mb-1">Tanggal Pengambilan:</label>
                    <input
                      type="date"
                      required
                      value={ticketForm.jadwal_pengambilan_tanggal}
                      onChange={(e) => setTicketForm({ ...ticketForm, jadwal_pengambilan_tanggal: e.target.value })}
                      className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-on-surface block mb-1">Waktu / Sesi:</label>
                    <input
                      type="text"
                      required
                      value={ticketForm.jadwal_pengambilan_waktu}
                      onChange={(e) => setTicketForm({ ...ticketForm, jadwal_pengambilan_waktu: e.target.value })}
                      className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Lokasi Pengambilan Bantuan:</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.lokasi_pengambilan}
                    onChange={(e) => setTicketForm({ ...ticketForm, lokasi_pengambilan: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Syarat Pengambilan:</label>
                  <textarea
                    rows={2}
                    value={ticketForm.persyaratan_bawaan}
                    onChange={(e) => setTicketForm({ ...ticketForm, persyaratan_bawaan: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setTicketModalOpen(false)}
                    className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="px-5 py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingTicket ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Kirim Tiket QR ke Warga</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: PUSH PBB BROADCAST REMINDER                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {pbbModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Send size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Push Pengingat Pembayaran PBB</h3>
                    <p className="text-[11px] text-on-surface-variant">Broadcast notifikasi ke seluruh perangkat warga</p>
                  </div>
                </div>
                <button onClick={() => setPbbModalOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePushPbbReminder} className="space-y-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Target Wilayah RW:</label>
                  <select
                    value={selectedRwPbb}
                    onChange={(e) => setSelectedRwPbb(e.target.value)}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Seluruh RW (RW 001 s.d RW 006 Kelurahan Kebonjati)</option>
                    {['001', '002', '003', '004', '005', '006'].map(rw => (
                      <option key={rw} value={rw}>Hanya Rukun Warga (RW) {rw}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Pesan Tambahan Broadcast:</label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Manfaatkan pembebasan denda PBB dari Bapenda Kota Bandung sebelum tanggal jatuh tempo akhir bulan ini..."
                    value={pbbPushText}
                    onChange={(e) => setPbbPushText(e.target.value)}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setPbbModalOpen(false)}
                    className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPbbPush}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingPbbPush ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Kirim Broadcast Sekarang</span>
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

