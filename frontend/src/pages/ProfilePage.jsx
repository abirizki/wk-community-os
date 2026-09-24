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
  X
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
  const [activeTab, setActiveTab] = useState('biodata'); // 'biodata' | 'surat' | 'bansos' | 'pengaduan' | 'kinerja'

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-xs text-on-surface-variant font-medium">Memuat profil dan riwayat layanan terpadu...</p>
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

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-outline-variant mt-6 -mb-6 -mx-6 px-6 overflow-x-auto gap-2 bg-surface-container-low/30 scrollbar-none">
          <button
            onClick={() => setActiveTab('biodata')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'biodata'
                ? 'border-primary text-primary bg-surface-container-lowest font-bold rounded-t-lg'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <User size={15} />
            <span>{warga ? 'Identitas & BPJS/Asuransi' : 'Kredensial & Profil Kedinasan'}</span>
          </button>

          <button
            onClick={() => setActiveTab('surat')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'surat'
                ? 'border-primary text-primary bg-surface-container-lowest font-bold rounded-t-lg'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <FileText size={15} />
            <span>Riwayat Surat ({profileData?.riwayatSurat?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('bansos')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'bansos'
                ? 'border-primary text-primary bg-surface-container-lowest font-bold rounded-t-lg'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Gift size={15} />
            <span>Bansos & Bantuan ({profileData?.riwayatBansos?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('pengaduan')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'pengaduan'
                ? 'border-primary text-primary bg-surface-container-lowest font-bold rounded-t-lg'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <MessageSquareWarning size={15} />
            <span>Laporan Aduan ({profileData?.riwayatPengaduan?.length || 0})</span>
          </button>

          {isOfficer && (
            <button
              onClick={() => setActiveTab('kinerja')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'kinerja'
                  ? 'border-primary text-primary bg-surface-container-lowest font-bold rounded-t-lg'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Award size={15} />
              <span>Rekapitulasi Kinerja Petugas</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: BIODATA / KREDENSIAL */}
      {activeTab === 'biodata' && (
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

                          <div className="flex items-center gap-2 self-end sm:self-auto">
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

      {/* TAB 2: RIWAYAT SURAT */}
      {activeTab === 'surat' && (
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

      {/* TAB 3: RIWAYAT BANSOS */}
      {activeTab === 'bansos' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Gift size={18} className="text-sky-600" /> Riwayat Kepesertaan Bantuan Sosial
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* TAB 4: RIWAYAT PENGADUAN */}
      {activeTab === 'pengaduan' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <MessageSquareWarning size={18} className="text-sky-600" /> Riwayat Laporan Pengaduan Lingkungan
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
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-100 text-sky-800">
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

      {/* TAB 5: REKAPITULASI KINERJA PETUGAS */}
      {activeTab === 'kinerja' && isOfficer && (
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
