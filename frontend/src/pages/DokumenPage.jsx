import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Printer, 
  Building2, 
  Sparkles, 
  QrCode, 
  Check, 
  X,
  Users,
  User,
  Info,
  ShieldCheck,
  CheckSquare,
  Square,
  Eye,
  FilePlus,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const JENIS_SURAT_CONFIG = {
  'Surat Keterangan Domisili': {
    label: 'Surat Keterangan Domisili',
    deskripsi: 'Menerangkan domisili tempat tinggal sah pemohon/anggota keluarga di lingkungan RT/RW Kelurahan Kebonjati.',
    syarat: [
      'e-KTP Asli Pemohon / Subjek Surat',
      'Kartu Keluarga (KK) Kelurahan Kebonjati',
      'Kesesuaian alamat domisili faktual di lingkungan RT/RW setempat'
    ],
    fields: [
      { name: 'status_tempat_tinggal', label: 'Status Kepemilikan Tempat Tinggal', type: 'select', options: ['Milik Sendiri', 'Sewa / Kontrak', 'Tinggal Bersama Orang Tua / Saudara', 'Menumpang'], required: true },
      { name: 'lama_tinggal', label: 'Lama Menetap di Alamat Ini', type: 'text', placeholder: 'Contoh: 3 Tahun / Sejak Lahir', required: true }
    ]
  },
  'Surat Keterangan Usaha (SKU)': {
    label: 'Surat Keterangan Usaha (SKU)',
    deskripsi: 'Keterangan resmi legalitas operasional usaha mikro/kecil warga di wilayah kelurahan untuk perbankan / KUR.',
    syarat: [
      'KTP & Kartu Keluarga (KK)',
      'Foto Tempat / Aktivitas Kegiatan Usaha',
      'Usaha berlokasi dan beroperasi di wilayah RT/RW setempat'
    ],
    fields: [
      { name: 'nama_usaha', label: 'Nama Usaha / Merk Dagang', type: 'text', placeholder: 'Contoh: Toko Berkah Mandiri / Warung Nasi Bu Siti', required: true },
      { name: 'bidang_usaha', label: 'Bidang / Sektor Usaha', type: 'select', options: ['Kuliner & Makanan Minuman', 'Perdagangan & Kelontong', 'Jasa & Servis', 'Pertanian & Peternakan', 'Fashion & Konveksi', 'Lainnya'], required: true },
      { name: 'alamat_usaha', label: 'Alamat Lokasi Tempat Usaha', type: 'text', placeholder: 'Contoh: Jl. Kebonjati No. 45 RT 001', required: true },
      { name: 'tahun_berdiri', label: 'Tahun Mulai Usaha', type: 'number', placeholder: 'Contoh: 2021', required: true },
      { name: 'omzet_bulanan', label: 'Estimasi Omzet / Perputaran Per Bulan', type: 'select', options: ['< Rp 5.000.000', 'Rp 5.000.000 - Rp 15.000.000', 'Rp 15.000.000 - Rp 50.000.000', '> Rp 50.000.000'], required: true }
    ]
  },
  'Surat Keterangan Tidak Mampu (SKTM)': {
    label: 'Surat Keterangan Tidak Mampu (SKTM)',
    deskripsi: 'Keterangan keadaan sosial ekonomi keluarga untuk beasiswa anak (KIP), keringanan faskes, atau bantuan hukum.',
    syarat: [
      'KTP & Kartu Keluarga (KK)',
      'Surat Rekomendasi Faktual Pengurus RT/RW',
      'Foto Tempat Tinggal Tampak Depan',
      'Verifikasi Data Terpadu Kesejahteraan Sosial (DTKS / P3KE)'
    ],
    fields: [
      { name: 'tujuan_sktm', label: 'Tujuan Penggunaan SKTM', type: 'select', options: ['Beasiswa / KIP Kuliah / Sekolah Anak', 'Keringanan Biaya Rumah Sakit / Faskes', 'Pendaftaran BPJS PBI Gratis', 'Bantuan Hukum / Pengadilan', 'Lainnya'], required: true },
      { name: 'penghasilan_keluarga', label: 'Estimasi Penghasilan Total Keluarga / Bulan', type: 'select', options: ['< Rp 1.000.000', 'Rp 1.000.000 - Rp 2.000.000', 'Rp 2.000.000 - Rp 3.000.000'], required: true },
      { name: 'jumlah_tanggungan', label: 'Jumlah Jiwa Tanggungan dalam 1 KK', type: 'number', placeholder: 'Contoh: 4', required: true }
    ]
  },
  'Surat Pengantar SKCK': {
    label: 'Surat Pengantar SKCK',
    deskripsi: 'Pengantar permohonan Surat Keterangan Catatan Kepolisian ke Polsek / Polres setempat.',
    syarat: [
      'KTP & Kartu Keluarga (KK)',
      'Akta Kelahiran / Ijazah Terakhir',
      'Pas Foto 4x6 Latar Merah',
      'Pengantar Verifikasi RT/RW'
    ],
    fields: [
      { name: 'keperluan_skck', label: 'Keperluan Pembuatan SKCK', type: 'select', options: ['Melamar Pekerjaan Swasta / BUMN', 'Pendaftaran Seleksi CPNS / PPPK / TNI / POLRI', 'Melanjutkan Pendidikan / Universitas', 'Pencalonan Pengurus Lembaga / Organisasi', 'Pengurusan Visa / Luar Negeri', 'Lainnya'], required: true }
    ]
  },
  'Surat Keterangan Kematian': {
    label: 'Surat Keterangan Kematian',
    deskripsi: 'Keterangan resmi meninggal dunia warga untuk pengurusan Akta Kematian, perbankan, dan hak waris.',
    syarat: [
      'KK & KTP Pelapor (Ahli Waris / Keluarga 1 KK)',
      'KTP Asli Almarhum/Almarhumah',
      'Surat Keterangan Medis Kematian dari RS / Puskesmas (bila ada)'
    ],
    fields: [
      { name: 'nama_almarhum', label: 'Nama Lengkap Almarhum/Almarhumah', type: 'text', placeholder: 'Nama sesuai KTP', required: true },
      { name: 'nik_almarhum', label: 'NIK Almarhum/Almarhumah', type: 'text', placeholder: '16 digit NIK almarhum', required: true },
      { name: 'tanggal_kematian', label: 'Hari & Tanggal Meninggal', type: 'date', required: true },
      { name: 'tempat_kematian', label: 'Tempat Meninggal Dunia', type: 'text', placeholder: 'Contoh: Rumah Kediaman / RS Hasan Sadikin', required: true },
      { name: 'penyebab_kematian', label: 'Penyebab Meninggal', type: 'select', options: ['Sakit Biasa', 'Usia Lanjut', 'Kecelakaan', 'Sakit Menular', 'Lainnya'], required: true }
    ]
  },
  'Surat Keterangan Kelahiran': {
    label: 'Surat Keterangan Kelahiran',
    deskripsi: 'Pengantar pencatatan kelahiran anak untuk penerbitan Akta Kelahiran dan penambahan anggota Kartu Keluarga.',
    syarat: [
      'KTP Ayah & KTP Ibu',
      'Kartu Keluarga (KK) & Buku Nikah Orang Tua',
      'Surat Keterangan Lahir dari Bidan / Rumah Sakit'
    ],
    fields: [
      { name: 'nama_anak', label: 'Nama Lengkap Bayi / Anak', type: 'text', placeholder: 'Nama anak yang baru lahir', required: true },
      { name: 'jenis_kelamin_anak', label: 'Jenis Kelamin Anak', type: 'select', options: ['Laki-Laki', 'Perempuan'], required: true },
      { name: 'tanggal_lahir_anak', label: 'Tanggal Lahir Bayi', type: 'date', required: true },
      { name: 'tempat_lahir_anak', label: 'Tempat Lahir', type: 'text', placeholder: 'Contoh: RS Hermina / Puskesmas / Rumah', required: true },
      { name: 'anak_ke', label: 'Kelahiran Anak Ke-', type: 'number', placeholder: 'Contoh: 1, 2, 3...', required: true }
    ]
  },
  'Surat Keterangan Belum Menikah': {
    label: 'Surat Keterangan Belum Menikah',
    deskripsi: 'Menerangkan bahwa pemohon/anggota keluarga berstatus lajang dan belum pernah melangsungkan perkawinan sah.',
    syarat: [
      'KTP & Kartu Keluarga (KK)',
      'Surat Pernyataan Belum Pernah Menikah Bermaterai',
      'Pengantar RT/RW'
    ],
    fields: [
      { name: 'keperluan_belum_nikah', label: 'Keperluan Pengajuan', type: 'select', options: ['Melamar Pekerjaan / Ikatan Dinas', 'Pengajuan Fasilitas KPR Bank', 'Persyaratan Beasiswa Pendidikan', 'Pendaftaran Seleksi CPNS / Kedinasan', 'Lainnya'], required: true }
    ]
  },
  'Surat Pengantar Nikah (N1-N4)': {
    label: 'Surat Pengantar Nikah (N1-N4)',
    deskripsi: 'Formulir pengantar resmi kelurahan untuk pendaftaran akad pernikahan di Kantor Urusan Agama (KUA).',
    syarat: [
      'KTP & KK Calon Mempelai',
      'Akta Kelahiran & Ijazah Terakhir',
      'Pas Foto 2x3 dan 4x6 Latar Biru',
      'Salinan KTP Orang Tua & KTP Calon Pasangan'
    ],
    fields: [
      { name: 'nama_calon_pasangan', label: 'Nama Lengkap Calon Suami / Istri', type: 'text', placeholder: 'Nama lengkap calon pasangan', required: true },
      { name: 'nik_calon_pasangan', label: 'NIK Calon Pasangan', type: 'text', placeholder: '16 digit NIK calon pasangan', required: true },
      { name: 'alamat_calon_pasangan', label: 'Alamat Domisili Calon Pasangan', type: 'text', placeholder: 'Alamat asal calon pasangan', required: true },
      { name: 'rencana_tanggal_nikah', label: 'Rencana Tanggal Akad Nikah', type: 'date', required: true }
    ]
  },
  'Surat Keterangan Pindah Domisili': {
    label: 'Surat Keterangan Pindah Domisili',
    deskripsi: 'Pengantar penerbitan SKPWNI untuk kepindahan domisili warga antar-RT, RW, Kelurahan, atau Luar Kota.',
    syarat: [
      'KTP Asli & Kartu Keluarga (KK) Asli',
      'Surat Pengantar RT/RW Wilayah Asal',
      'Kesesuaian daftar anggota keluarga yang ikut pindah'
    ],
    fields: [
      { name: 'alamat_tujuan', label: 'Alamat Lengkap Tujuan Pindah', type: 'text', placeholder: 'Nama jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten', required: true },
      { name: 'alasan_pindah', label: 'Alasan Kepindahan', type: 'select', options: ['Pekerjaan / Mutasi Dinas', 'Pendidikan', 'Perumahan / Rumah Sendiri', 'Mengikuti Suami / Istri / Keluarga', 'Lainnya'], required: true },
      { name: 'anggota_ikut_pindah', label: 'Anggota Keluarga yang Ikut Pindah', type: 'select', options: ['Hanya Pemohon Sendiri', 'Kepala Keluarga & Seluruh Anggota', 'Sebagian Anggota Keluarga'], required: true }
    ]
  }
};

const JENIS_SURAT_OPTIONS = Object.keys(JENIS_SURAT_CONFIG);

export default function DokumenPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isRT = user && user.role === 'ketua_rt';
  const isRW = user && ['ketua_rw', 'admin_rw'].includes(user.role);
  const isKelurahan = user && ['admin_kelurahan', 'superadmin', 'admin', 'lurah'].includes(user.role);
  const isOfficer = isRT || isRW || isKelurahan;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState(isOfficer ? 'pending_approval' : 'all');

  // Request Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefillInfo, setPrefillInfo] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);

  // Subjek Pemohon: 'self' atau NIK anggota keluarga dalam 1 KK
  const [subjekPemohon, setSubjekPemohon] = useState('self');
  const [formData, setFormData] = useState({
    jenis_dokumen: 'Surat Keterangan Domisili',
    keperluan: ''
  });
  const [dataTambahan, setDataTambahan] = useState({});
  const [syaratChecked, setSyaratChecked] = useState({});

  // Action (Approval/Rejection) Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');
  const [actionNotes, setActionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Detail / Inspection Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailDoc, setDetailDoc] = useState(null);

  // Print Preview Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDoc, setPrintDoc] = useState(null);

  const fetchDokumen = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = isOfficer ? await api.get('/dokumen') : await api.get('/dokumen/me');
      setData(res.data || []);

      // Ambil status prefill AI & data anggota keluarga dalam 1 KK
      api.get('/dokumen/prefill-data')
        .then(res => {
          if (res.data) {
            setPrefillInfo(res.data);
            if (res.data.familyMembers && Array.isArray(res.data.familyMembers)) {
              setFamilyMembers(res.data.familyMembers);
            }
          }
        })
        .catch(() => {});
    } catch (err) {
      setError(err.message || 'Gagal mengambil data permohonan surat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumen();
  }, []);

  // Handle URL query parameters (?for_nik=...&action=new)
  useEffect(() => {
    const action = searchParams.get('action');
    const forNik = searchParams.get('for_nik');
    if (action === 'new') {
      setShowModal(true);
      if (forNik) {
        setSubjekPemohon(forNik);
      }
    }
  }, [searchParams]);

  // Selected subject information
  const selectedSubjectInfo = useMemo(() => {
    if (subjekPemohon === 'self') {
      return {
        nama: prefillInfo?.profile?.nama || user?.nama || user?.username,
        nik: prefillInfo?.profile?.nik || user?.active_nik || user?.username,
        hubungan: 'Diri Sendiri (Pemohon)',
        rt: prefillInfo?.profile?.rt || user?.rt || '001',
        rw: prefillInfo?.profile?.rw || user?.rw || '001',
        isSelf: true
      };
    }
    const fam = familyMembers.find(f => f.nik === subjekPemohon);
    if (fam) {
      return {
        nama: fam.nama,
        nik: fam.nik,
        hubungan: fam.status_hubungan_keluarga || 'Anggota Keluarga',
        rt: fam.rt || prefillInfo?.profile?.rt || user?.rt || '001',
        rw: fam.rw || prefillInfo?.profile?.rw || user?.rw || '001',
        isSelf: false
      };
    }
    return {
      nama: user?.nama || 'Warga',
      nik: subjekPemohon,
      hubungan: 'Anggota Keluarga',
      rt: user?.rt || '001',
      rw: user?.rw || '001',
      isSelf: false
    };
  }, [subjekPemohon, prefillInfo, user, familyMembers]);

  // Config untuk jenis surat yang dipilih
  const currentSuratConfig = useMemo(() => {
    return JENIS_SURAT_CONFIG[formData.jenis_dokumen] || JENIS_SURAT_CONFIG['Surat Keterangan Domisili'];
  }, [formData.jenis_dokumen]);

  // Reset dynamic fields when jenis surat changes
  const handleJenisSuratChange = (e) => {
    const newJenis = e.target.value;
    setFormData(prev => ({ ...prev, jenis_dokumen: newJenis }));
    setDataTambahan({});
    setSyaratChecked({});
  };

  const handleDynamicFieldChange = (name, value) => {
    setDataTambahan(prev => ({ ...prev, [name]: value }));
  };

  const toggleSyarat = (idx) => {
    setSyaratChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.keperluan || formData.keperluan.trim().length < 5) {
      setError('Mohon sebutkan keperluan surat dengan jelas (minimal 5 karakter)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const targetNik = subjekPemohon === 'self' 
        ? (prefillInfo?.profile?.nik || user?.active_nik || user?.username)
        : subjekPemohon;

      await api.post('/dokumen', {
        ...formData,
        nik_pemohon: targetNik,
        data_tambahan: dataTambahan,
        syarat_berkas: syaratChecked,
        is_auto_filled_by_ai: Boolean(prefillInfo?.eligible)
      });

      setSuccessMsg(
        subjekPemohon === 'self'
          ? 'Permohonan surat berhasil diajukan dan masuk ke antrean verifikasi RT!'
          : `Permohonan surat untuk anggota keluarga an. ${selectedSubjectInfo.nama} (${selectedSubjectInfo.hubungan}) berhasil diajukan!`
      );

      setFormData({
        jenis_dokumen: 'Surat Keterangan Domisili',
        keperluan: ''
      });
      setDataTambahan({});
      setSyaratChecked({});
      setSubjekPemohon('self');
      setShowModal(false);
      
      // Clean query params if any
      if (searchParams.get('action') || searchParams.get('for_nik')) {
        setSearchParams({});
      }

      await fetchDokumen();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal mengajukan permohonan surat');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Approval / Rejection Modal
  const openActionModal = (doc, type) => {
    setSelectedDoc(doc);
    setActionType(type);
    setActionNotes('');
    setShowActionModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      setSubmittingAction(true);
      setError(null);
      const endpoint = actionType === 'APPROVE' ? `/dokumen/${selectedDoc.id}/approve` : `/dokumen/${selectedDoc.id}/reject`;
      const res = await api.patch(endpoint, { catatan: actionNotes });
      setSuccessMsg(res.message || 'Pembaruan status dokumen berhasil disimpan!');
      setShowActionModal(false);
      await fetchDokumen();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal memproses aksi verifikasi dokumen');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Detail Modal
  const handleOpenDetail = (doc) => {
    setDetailDoc(doc);
    setShowDetailModal(true);
  };

  // Open Print Modal
  const handlePrint = (doc) => {
    setPrintDoc(doc);
    setShowPrintModal(true);
  };

  // Filter list based on tab
  const displayedData = data.filter((doc) => {
    if (activeTab === 'pending_approval') {
      if (isRT) return doc.approval_step === 'RT' && doc.status !== 'REJECTED';
      if (isRW) return doc.approval_step === 'RW' && doc.status !== 'REJECTED';
      if (isKelurahan) return doc.approval_step === 'KELURAHAN' && doc.status !== 'REJECTED';
    }
    return true;
  });

  const renderStatusBadge = (doc) => {
    if (doc.status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={13} /> Ditolak
        </span>
      );
    }

    if (doc.status === 'APPROVED') {
      return (
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Disahkan Kelurahan
          </span>
          {doc.trigger_executed === 1 && (
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <Sparkles size={10} /> Data Diperbarui
            </span>
          )}
        </div>
      );
    }

    let currentStepText = 'Verifikasi RT';
    let stepColor = 'bg-amber-50 text-amber-700 border-amber-200';
    if (doc.approval_step === 'RW') {
      currentStepText = 'Verifikasi RW';
      stepColor = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (doc.approval_step === 'KELURAHAN') {
      currentStepText = 'Pengesahan Kelurahan';
      stepColor = 'bg-purple-50 text-purple-700 border-purple-200';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${stepColor}`}>
        <Clock size={13} /> {currentStepText}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <FileText className="text-primary" />
            <span>Pelayanan Dokumen & Surat Warga</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pengajuan dan penerbitan surat pengantar berjenjang (RT &bull; RW &bull; Kelurahan) dengan tanda tangan digital tersertifikasi.
          </p>
        </div>

        {!isOfficer && (
          <button
            onClick={() => {
              setSubjekPemohon('self');
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>Ajukan Surat Baru</span>
          </button>
        )}
      </div>

      {/* ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-between shadow-sm text-sm"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center justify-between shadow-sm text-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-800 cursor-pointer">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS (OFFICERS ONLY) */}
      {isOfficer && (
        <div className="flex border-b border-outline-variant bg-surface-container-lowest rounded-t-xl overflow-hidden p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('pending_approval')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pending_approval'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <Clock size={16} />
            <span>
              Menunggu Tindakan Anda ({
                data.filter((d) => {
                  if (isRT) return d.approval_step === 'RT' && d.status !== 'REJECTED';
                  if (isRW) return d.approval_step === 'RW' && d.status !== 'REJECTED';
                  if (isKelurahan) return d.approval_step === 'KELURAHAN' && d.status !== 'REJECTED';
                  return false;
                }).length
              })
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <FileText size={16} />
            <span>Semua Dokumen ({data.length})</span>
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface font-semibold">
              <tr>
                <th className="p-4">No. Registrasi & Tanggal</th>
                <th className="p-4">Identitas Pemohon / Subjek</th>
                <th className="p-4">Jenis Surat</th>
                <th className="p-4">Keperluan</th>
                <th className="p-4 text-center">Status / Progress</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat antrean dokumen...
                  </td>
                </tr>
              ) : displayedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    Tidak ada pengajuan permohonan surat.
                  </td>
                </tr>
              ) : (
                displayedData.map((doc) => {
                  const canAct = (
                    (isRT && doc.approval_step === 'RT') ||
                    (isRW && doc.approval_step === 'RW') ||
                    (isKelurahan && doc.approval_step === 'KELURAHAN')
                  ) && doc.status !== 'REJECTED';

                  const isForFamily = doc.diajukan_oleh_nik && doc.diajukan_oleh_nik !== doc.nik_pemohon;

                  return (
                    <tr key={doc.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-on-surface text-xs">{doc.nomor_registrasi || `REG-${doc.id}`}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-on-surface">{doc.nama_pemohon || 'Warga'}</span>
                          {doc.hubungan_keluarga && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              {doc.hubungan_keluarga}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-on-surface-variant font-mono">NIK: {doc.nik_pemohon}</div>
                        {isForFamily && (
                          <div className="text-[10px] text-sky-800 font-medium mt-0.5">
                            Diajukan oleh: <span className="font-mono">{doc.diajukan_oleh_nik}</span> (KK)
                          </div>
                        )}
                        <div className="text-[11px] text-on-surface-variant">RT {doc.rt || '001'} / RW {doc.rw || '001'}</div>
                      </td>
                      <td className="p-4 font-medium text-primary text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{doc.jenis_dokumen || doc.jenis_surat}</span>
                          {doc.is_auto_filled_by_ai ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200" title="Diisi otomatis via AI Auto-Fill">
                              <Sparkles size={10} className="text-blue-500" /> AI
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant max-w-xs truncate" title={doc.keperluan}>
                        {doc.keperluan}
                      </td>
                      <td className="p-4 text-center">
                        {renderStatusBadge(doc)}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Tinjau Detail */}
                          <button
                            onClick={() => handleOpenDetail(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant transition-colors cursor-pointer"
                            title="Tinjau detail data & syarat berkas"
                          >
                            <Eye size={13} /> Detail
                          </button>

                          {doc.status === 'APPROVED' && (
                            <button
                              onClick={() => handlePrint(doc)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 cursor-pointer"
                            >
                              <Printer size={14} /> Cetak
                            </button>
                          )}

                          {canAct && (
                            <>
                              <button
                                onClick={() => openActionModal(doc, 'APPROVE')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                              >
                                <Check size={14} /> {isKelurahan ? 'Sahkan' : 'Setujui'}
                              </button>
                              <button
                                onClick={() => openActionModal(doc, 'REJECT')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200 cursor-pointer"
                              >
                                <X size={14} /> Tolak
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AJUKAN SURAT BARU (DENGAN DUKUNGAN ANGGOTA KK & SYARAT SPESIFIK) */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 border border-outline-variant shadow-xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant">
              <div>
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <FilePlus className="text-primary" size={22} />
                  <span>Permohonan Surat Layanan Warga</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Bisa diajukan untuk diri sendiri atau atas nama anggota keluarga dalam 1 Kartu Keluarga (KK).
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  if (searchParams.get('action') || searchParams.get('for_nik')) {
                    setSearchParams({});
                  }
                }} 
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* AI Auto-Fill Alert Banner */}
            {prefillInfo?.eligible && (
              <div className="mb-4 p-3.5 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-emerald-600" /> AI Smart Auto-Fill Aktif (Profil {prefillInfo.score}% Lengkap)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    Terverifikasi
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  Data demografi, domisili RT/RW, dan No. KK akan otomatis terisi untuk mempercepat verifikasi petugas.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* 1. SELEKSI SUBJEK PEMOHON (DIRI SENDIRI VS ANGGOTA KELUARGA 1 KK) */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/70 space-y-2.5">
                <label className="block text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Users size={15} className="text-primary" />
                  <span>Surat Ini Ditujukan Untuk Siapa? *</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubjekPemohon('self')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      subjekPemohon === 'self'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <User size={18} className="shrink-0" />
                    <div>
                      <div className="text-xs">Diri Sendiri</div>
                      <div className="text-[11px] font-normal text-on-surface-variant font-mono">
                        {prefillInfo?.profile?.nama || user?.nama || 'Saya'}
                      </div>
                    </div>
                  </button>

                  {familyMembers.length > 0 && (
                    <div className="relative">
                      <select
                        value={subjekPemohon === 'self' ? '' : subjekPemohon}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSubjekPemohon(e.target.value);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          subjekPemohon !== 'self'
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                            : 'border-outline-variant bg-surface-container-lowest text-on-surface'
                        }`}
                      >
                        <option value="">Pilih Anggota Keluarga (1 KK)...</option>
                        {familyMembers.map((fam) => (
                          <option key={fam.nik} value={fam.nik}>
                            {fam.nama} ({fam.status_hubungan_keluarga || 'Anggota'} - NIK: {fam.nik})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Subjek Terpilih Preview */}
                <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-on-surface-variant text-[11px]">Subjek Pemohon Terpilih:</span>
                    <p className="font-bold text-on-surface">{selectedSubjectInfo.nama}</p>
                    <p className="text-[11px] font-mono text-on-surface-variant">
                      NIK: {selectedSubjectInfo.nik} &bull; Wilayah: RT {selectedSubjectInfo.rt} / RW {selectedSubjectInfo.rw}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {selectedSubjectInfo.hubungan}
                  </span>
                </div>
              </div>

              {/* 2. JENIS SURAT & DESKRIPSI */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Jenis Surat Yang Dibutuhkan *
                </label>
                <select
                  name="jenis_dokumen"
                  value={formData.jenis_dokumen}
                  onChange={handleJenisSuratChange}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:outline-none text-xs font-semibold text-on-surface"
                  required
                >
                  {JENIS_SURAT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <p className="text-[11px] text-on-surface-variant mt-1.5">
                  {currentSuratConfig.deskripsi}
                </p>
              </div>

              {/* 3. PENELUSURAN SYARAT SURAT AJUAN DARI WARGA */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <span>Penelusuran Kelengkapan Syarat Berkas</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    SOP Kelurahan
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Mohon pastikan Anda telah menyiapkan dokumen persyaratan berikut sebelum mengajukan:
                </p>

                <div className="space-y-1.5 pt-1">
                  {currentSuratConfig.syarat.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => toggleSyarat(idx)}
                      className={`p-2 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                        syaratChecked[idx] 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium' 
                          : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      {syaratChecked[idx] ? (
                        <CheckSquare size={16} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Square size={16} className="text-on-surface-variant/40 shrink-0" />
                      )}
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. FORMULIR ISIAN SPESIFIK SESUAI JENIS SURAT */}
              {currentSuratConfig.fields && currentSuratConfig.fields.length > 0 && (
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant space-y-3">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <Building2 size={15} className="text-primary" />
                    <span>Data Pendukung Khusus: {formData.jenis_dokumen}</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentSuratConfig.fields.map((fld) => (
                      <div key={fld.name} className={fld.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <label className="block text-[11px] font-semibold text-on-surface mb-1">
                          {fld.label} {fld.required && <span className="text-rose-500">*</span>}
                        </label>
                        {fld.type === 'select' ? (
                          <select
                            required={fld.required}
                            value={dataTambahan[fld.name] || ''}
                            onChange={(e) => handleDynamicFieldChange(fld.name, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                          >
                            <option value="">Pilih opsi...</option>
                            {fld.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={fld.type}
                            required={fld.required}
                            placeholder={fld.placeholder || ''}
                            value={dataTambahan[fld.name] || ''}
                            onChange={(e) => handleDynamicFieldChange(fld.name, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. KEPERLUAN SURAT */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Tujuan & Keperluan Surat Secara Rinci *
                </label>
                <textarea
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Contoh: Persyaratan pembukaan rekening bank / pendaftaran sekolah anak / beasiswa / kelengkapan berkas KUA..."
                  className="w-full p-3 text-xs border border-outline-variant rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:outline-none text-on-surface"
                  required
                />
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Jelaskan secara rinci agar petugas RT/RW dan Kelurahan dapat segera menerbitkan pengesahan resmi.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm text-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
                  <span>Kirim Permohonan Surat</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL PERMOHONAN & PENELUSURAN SYARAT                              */}
      {/* ========================================================================= */}
      {showDetailModal && detailDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 border border-outline-variant shadow-xl my-8 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  <span>Detail Berkas Permohonan Surat</span>
                </h3>
                <p className="text-xs font-mono text-on-surface-variant mt-0.5">
                  {detailDoc.nomor_registrasi || `REG-${detailDoc.id}`}
                </p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-surface-container-low rounded-xl">
                <div>
                  <span className="text-on-surface-variant block">Jenis Surat:</span>
                  <strong className="text-primary">{detailDoc.jenis_dokumen || detailDoc.jenis_surat}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Status:</span>
                  <div className="mt-0.5">{renderStatusBadge(detailDoc)}</div>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Nama Pemohon:</span>
                  <strong className="text-on-surface">{detailDoc.nama_pemohon}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block">NIK:</span>
                  <span className="font-mono">{detailDoc.nik_pemohon}</span>
                </div>
                {detailDoc.hubungan_keluarga && (
                  <div>
                    <span className="text-on-surface-variant block">Hubungan Keluarga:</span>
                    <span className="font-bold text-purple-800">{detailDoc.hubungan_keluarga}</span>
                  </div>
                )}
                {detailDoc.diajukan_oleh_nik && (
                  <div>
                    <span className="text-on-surface-variant block">Diajukan Oleh (KK):</span>
                    <span className="font-mono">{detailDoc.diajukan_oleh_nik}</span>
                  </div>
                )}
                <div className="col-span-2 pt-1 border-t border-outline-variant/60">
                  <span className="text-on-surface-variant block">Keperluan:</span>
                  <p className="text-on-surface mt-0.5 font-medium">{detailDoc.keperluan}</p>
                </div>
              </div>

              {/* Data Pendukung Khusus */}
              {detailDoc.data_tambahan && (
                <div className="p-3 bg-surface-container-low rounded-xl space-y-2">
                  <span className="font-bold text-on-surface block">Data Pendukung Khusus:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {(() => {
                      let parsed = {};
                      try {
                        parsed = typeof detailDoc.data_tambahan === 'string' ? JSON.parse(detailDoc.data_tambahan) : detailDoc.data_tambahan;
                      } catch (e) {}
                      return Object.entries(parsed).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-on-surface-variant capitalize">{k.replace(/_/g, ' ')}:</span>
                          <p className="font-bold text-on-surface">{String(v)}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Catatan Verifikasi */}
              {detailDoc.catatan_admin && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                  <span className="font-bold block">Catatan Petugas:</span>
                  <p className="mt-0.5">{detailDoc.catatan_admin}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VERIFIKASI / PENGESAHAN / PENOLAKAN OLEH PETUGAS                 */}
      {/* ========================================================================= */}
      {showActionModal && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                {actionType === 'APPROVE' ? (
                  <CheckCircle2 className="text-emerald-600" size={20} />
                ) : (
                  <XCircle className="text-rose-600" size={20} />
                )}
                {actionType === 'APPROVE' ? (isKelurahan ? 'Pengesahan Surat Resmi' : 'Persetujuan Surat') : 'Tolak Permohonan Surat'}
              </h2>
              <button onClick={() => setShowActionModal(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant text-xs space-y-1 mb-4">
              <div className="font-semibold text-on-surface">{selectedDoc.nama_pemohon || selectedDoc.nik_pemohon}</div>
              <div className="text-on-surface-variant font-mono">No. Reg: {selectedDoc.nomor_registrasi || `REG-${selectedDoc.id}`}</div>
              <div className="font-medium text-primary">{selectedDoc.jenis_dokumen || selectedDoc.jenis_surat}</div>
              <div className="text-on-surface-variant">Keperluan: {selectedDoc.keperluan}</div>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold mb-1 text-xs text-on-surface">
                  {actionType === 'APPROVE' ? 'Catatan Petugas (Opsional)' : 'Alasan Penolakan (Wajib)'}
                </label>
                <textarea
                  rows="3"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  required={actionType === 'REJECT'}
                  placeholder={actionType === 'APPROVE' ? 'Berkas lengkap dan sesuai kriteria...' : 'Sebutkan kekurangan berkas/alasan penolakan...'}
                  className="w-full p-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-xs bg-surface-container-low text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`px-5 py-2 rounded-xl font-semibold text-white transition-colors flex items-center gap-2 shadow-sm text-xs cursor-pointer disabled:opacity-50 ${
                    actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submittingAction ? <Loader2 size={16} className="animate-spin" /> : (actionType === 'APPROVE' ? 'Konfirmasi Persetujuan' : 'Tolak Permohonan')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PREVIEW CETAK SURAT RESMI                                        */}
      {/* ========================================================================= */}
      {showPrintModal && printDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl my-8 border border-slate-300"
          >
            {/* Kop Surat Kelurahan Kebonjati */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Pemerintah Kota Bandung</h3>
              <h2 className="text-lg font-extrabold uppercase tracking-wide">Kecamatan Andir &bull; Kelurahan Kebonjati</h2>
              <p className="text-xs text-slate-600 mt-1">
                Jl. Kebonjati No. 120, Kec. Andir, Kota Bandung, Jawa Barat 40181
              </p>
            </div>

            {/* Nomor & Judul Surat */}
            <div className="text-center mb-6">
              <h4 className="text-base font-bold underline uppercase tracking-wider">
                {printDoc.jenis_dokumen || printDoc.jenis_surat}
              </h4>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Nomor: {printDoc.nomor_registrasi || `500/REG-${printDoc.id}/KBJ/${new Date().getFullYear()}`}
              </p>
            </div>

            {/* Isi Surat */}
            <div className="space-y-3 text-sm leading-relaxed text-slate-800">
              <p>
                Yang bertanda tangan di bawah ini, Kepala Kelurahan Kebonjati, Kecamatan Andir, Kota Bandung, menerangkan dengan sebenarnya bahwa:
              </p>
              <div className="pl-6 space-y-1.5 font-sans">
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Nama Lengkap</span>
                  <span className="col-span-2 font-bold">: {printDoc.nama_pemohon}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">NIK</span>
                  <span className="col-span-2 font-mono">: {printDoc.nik_pemohon}</span>
                </div>
                {printDoc.hubungan_keluarga && printDoc.hubungan_keluarga !== 'Kepala Keluarga' && (
                  <div className="grid grid-cols-3">
                    <span className="text-slate-600">Status Hubungan</span>
                    <span className="col-span-2 font-medium">: {printDoc.hubungan_keluarga}</span>
                  </div>
                )}
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Alamat Domisili</span>
                  <span className="col-span-2">: RT {printDoc.rt || '001'} / RW {printDoc.rw || '001'}, Kelurahan Kebonjati</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Keperluan</span>
                  <span className="col-span-2 font-medium">: {printDoc.keperluan}</span>
                </div>
              </div>
              <p className="pt-2">
                Surat keterangan ini diberikan atas permohonan yang bersangkutan setelah melalui verifikasi berjenjang oleh Pengurus RT dan RW setempat.
              </p>
            </div>

            {/* Tanda Tangan & QR Code */}
            <div className="mt-8 pt-4 flex justify-between items-end border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
                  <QrCode size={48} className="text-slate-800" />
                </div>
                <div className="text-[11px] text-slate-500">
                  <p className="font-bold text-slate-700">Tersertifikasi Digital</p>
                  <p>Bumi Warga - Jabar Pintar Digital</p>
                  <p className="font-mono text-[10px]">ID: {printDoc.id}-{Date.now().toString(36)}</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <p>Bandung, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                <p className="font-bold mt-1">Lurah Kebonjati</p>
                <div className="h-12 flex items-center justify-end">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    [SIGNED DIGITALLY]
                  </span>
                </div>
                <p className="font-bold underline text-sm">H. Dedi Mulyadi, S.Sos., M.Si</p>
                <p className="text-[10px] text-slate-500">NIP. 19780412 200501 1 008</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-sm cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer size={16} /> Cetak Sekarang
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
