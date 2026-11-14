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
  ChevronDown,
  Upload,
  Image,
  FileUp,
  ExternalLink,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Home,
  Search,
  PenLine,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadReport } from '../utils/exportHelper';

export const JENIS_SURAT_CONFIG = {
  'Surat Keterangan Domisili': {
    label: 'Surat Keterangan Domisili',
    deskripsi: 'Menerangkan domisili tempat tinggal sah pemohon/anggota keluarga di lingkungan RT/RW Kelurahan Kebonjati.',
    syarat: [
      'e-KTP Asli Pemohon / Subjek Surat (Tersimpan di Akun Digital)',
      'Kartu Keluarga (KK) Resmi Kelurahan Kebonjati',
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
      'KTP & Kartu Keluarga (KK) Digital',
      'Foto Lampiran Tempat / Aktivitas Kegiatan Usaha',
      'Verifikasi lokasi usaha aktif oleh Ketua RT/RW setempat'
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
      'KTP & Kartu Keluarga (KK) Digital Resmi',
      'Foto Kondisi Rumah Tempat Tinggal Tampak Depan',
      'Verifikasi Data Terpadu Kesejahteraan Sosial (DTKS / P3KE)',
      'Verifikasi kesesuaian data lapangan langsung oleh Pengurus RT/RW'
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
      'KTP & Kartu Keluarga (KK) Digital',
      'Akta Kelahiran / Ijazah Terakhir',
      'Pas Foto 4x6 Latar Merah',
      'Verifikasi Berkas & Catatan Warga oleh Pengurus RT/RW'
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
      { name: 'tempat_kematian', label: 'Tempat Meninggal Dunia', type: 'text', placeholder: 'Contoh: Rumah Kediaman / RSUD R. Syamsudin Sukabumi', required: true },
      { name: 'penyebab_kematian', label: 'Penyebab Meninggal', type: 'select', options: ['Sakit Biasa', 'Usia Lanjut', 'Kecelakaan', 'Sakit Menular', 'Lainnya'], required: true }
    ]
  },
  'Surat Keterangan Kelahiran': {
    label: 'Surat Keterangan Kelahiran',
    deskripsi: 'Pengantar pencatatan kelahiran anak untuk penerbitan Akta Kelahiran dan penambahan anggota Kartu Keluarga.',
    syarat: [
      'KTP Ayah & KTP Ibu Digital',
      'Kartu Keluarga (KK) & Buku Nikah Orang Tua',
      'Surat Keterangan Lahir dari Bidan / Rumah Sakit'
    ],
    fields: [
      { name: 'nama_anak', label: 'Nama Lengkap Bayi / Anak', type: 'text', placeholder: 'Nama anak yang baru lahir', required: true },
      { name: 'jenis_kelamin_anak', label: 'Jenis Kelamin Anak', type: 'select', options: ['Laki-Laki', 'Perempuan'], required: true },
      { name: 'tanggal_lahir_anak', label: 'Tanggal Lahir Bayi', type: 'date', required: true },
      { name: 'tempat_lahir_anak', label: 'Tempat Lahir', type: 'text', placeholder: 'Contoh: RSUD R. Syamsudin / Puskesmas / Rumah', required: true },
      { name: 'anak_ke', label: 'Kelahiran Anak Ke-', type: 'number', placeholder: 'Contoh: 1, 2, 3...', required: true }
    ]
  },
  'Surat Keterangan Belum Menikah': {
    label: 'Surat Keterangan Belum Menikah',
    deskripsi: 'Menerangkan bahwa pemohon/anggota keluarga berstatus lajang dan belum pernah melangsungkan perkawinan sah.',
    syarat: [
      'KTP & Kartu Keluarga (KK) Digital',
      'Surat Pernyataan Belum Pernah Menikah Bermaterai',
      'Verifikasi Status Perkawinan Digital oleh RT/RW'
    ],
    fields: [
      { name: 'keperluan_belum_nikah', label: 'Keperluan Pengajuan', type: 'select', options: ['Melamar Pekerjaan / Ikatan Dinas', 'Pengajuan Fasilitas KPR Bank', 'Persyaratan Beasiswa Pendidikan', 'Pendaftaran Seleksi CPNS / Kedinasan', 'Lainnya'], required: true }
    ]
  },
  'Surat Pengantar Nikah (N1-N4)': {
    label: 'Surat Pengantar Nikah (N1-N4)',
    deskripsi: 'Formulir pengantar resmi kelurahan untuk pendaftaran akad pernikahan di Kantor Urusan Agama (KUA).',
    syarat: [
      'KTP & KK Calon Mempelai Digital',
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
  'Surat Pengantar Warga Pendatang (Domisili Non-Permanen)': {
    label: 'Surat Pengantar Warga Pendatang (Domisili Non-Permanen)',
    deskripsi: 'Surat pengantar RT/RW bagi warga luar daerah / non-permanen (penghuni kos, kontrakan, atau tinggal sementara) untuk penerbitan Surat Keterangan Tinggal Sementara dari Kelurahan.',
    syarat: [
      'e-KTP Asal Pemohon (Luar Daerah / Luar Kelurahan)',
      'Surat Pernyataan / Keterangan dari Pemilik Kos / Kontrakan',
      'Tanda Bukti Lapor Diri Pengurus RT 1x24 Jam'
    ],
    fields: [
      { name: 'alamat_ktp_asal', label: 'Alamat KTP Asal (Kabupaten / Kota)', type: 'text', placeholder: 'Contoh: Kec. Cililin, Kab. Bandung Barat', required: true },
      { name: 'lokasi_tinggal_rt', label: 'Alamat Tempat Tinggal di RT', type: 'text', placeholder: 'Contoh: Kos Melati No. 04 / Kontrakan Bpk. Mulyadi Pintu 2', required: true },
      { name: 'nama_pemilik_hunian', label: 'Nama Pemilik Kos / Kontrakan / Penjamin', type: 'text', placeholder: 'Nama pemilik kos/kontrakan tempat tinggal', required: true },
      { name: 'status_pekerjaan_tinggal', label: 'Tujuan & Status Tinggal di Wilayah Ini', type: 'select', options: ['Pekerja Kontrak / Karyawan Swasta', 'Mahasiswa / Pelajar', 'Wiraswasta / Usaha Kuliner', 'Tinggal Sementara Mengikuti Keluarga'], required: true },
      { name: 'rencana_lama_tinggal', label: 'Rencana Lama Tinggal', type: 'select', options: ['< 3 Bulan', '3 - 6 Bulan', '6 - 12 Bulan (1 Tahun)', '> 1 Tahun'], required: true }
    ]
  },
  'Surat Keterangan Pindah Domisili': {
    label: 'Surat Keterangan Pindah Domisili',
    deskripsi: 'Pengantar penerbitan SKPWNI untuk kepindahan domisili warga antar-RT, RW, Kelurahan, atau Luar Kota.',
    syarat: [
      'KTP Asli & Kartu Keluarga (KK) Digital Asli',
      'Verifikasi Domisili Asal oleh Pengurus RT/RW',
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
  const isCitizen = !isOfficer || user?.role === 'warga';

  const [data, setData] = useState([]);
  const [myDocs, setMyDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportRegister = async (format = 'xlsx') => {
    try {
      setIsExporting(true);
      const params = {};
      if (isRT) { params.rt = user.rt; params.rw = user.rw; }
      else if (isRW) { params.rw = user.rw; }
      await downloadReport('/dokumen/export/register-surat', params, `Register_Surat_${format.toUpperCase()}.${format}`);
    } catch (err) {
      setError('Gagal mengunduh register surat: ' + (err.message || 'Error'));
    } finally {
      setIsExporting(false);
    }
  };

  // Tab State
  const initialMode = searchParams.get('mode');
  const [activeTab, setActiveTab] = useState(
    initialMode === 'mandiri' ? 'my_docs' : (isOfficer ? 'pending_approval' : 'all')
  );

  // Request Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefillInfo, setPrefillInfo] = useState(null);
  const [familyMembers, setFamilyMembers] = useState(user?.family_members || []);
  const [loadingFamily, setLoadingFamily] = useState(false);

  // Sinkronisasi data anggota keluarga jika user state terisi belakangan
  useEffect(() => {
    if (user?.family_members && Array.isArray(user.family_members) && user.family_members.length > 0) {
      setFamilyMembers(prev => prev.length === 0 ? user.family_members : prev);
    }
  }, [user]);

  // Subjek Pemohon: 'self' atau NIK anggota keluarga dalam 1 KK
  const [subjekPemohon, setSubjekPemohon] = useState('self');

  // Mode Pengajuan Layanan RT/RW: 'WARGA_RT' (dampingan lansia/gaptek) | 'WARGA_PENDATANG' (warga pendatang) | 'MANDIRI' (pribadi)
  const isDampinganUrl = searchParams.get('mode') === 'dampingan';
  const [pelayananMode, setPelayananMode] = useState(
    isDampinganUrl ? (searchParams.get('nik') ? 'WARGA_PENDATANG' : 'WARGA_RT') : (isOfficer ? 'WARGA_RT' : 'MANDIRI')
  );
  const [rtWargaList, setRtWargaList] = useState([]);
  const [loadingRtWarga, setLoadingRtWarga] = useState(false);
  const [selectedWargaRt, setSelectedWargaRt] = useState(null);
  const [searchWargaText, setSearchWargaText] = useState('');
  const [pendatangCustom, setPendatangCustom] = useState({
    nama: searchParams.get('nama') || '',
    nik: searchParams.get('nik') || '',
    no_hp: '',
    alamat_asal: '',
    lokasi_tinggal: ''
  });
  const [directRtApproval, setDirectRtApproval] = useState(true);
  const [emergencyBypass, setEmergencyBypass] = useState(true);
  const [formData, setFormData] = useState({
    jenis_dokumen: 'Surat Keterangan Domisili',
    keperluan: ''
  });
  const [dataTambahan, setDataTambahan] = useState({});
  const [syaratChecked, setSyaratChecked] = useState({});

  // Lampiran Berkas Digital Resmi State
  const [lampiranKtp, setLampiranKtp] = useState('');
  const [lampiranKk, setLampiranKk] = useState('');
  const [lampiranBerkas, setLampiranBerkas] = useState('');
  const [namaLampiranBerkas, setNamaLampiranBerkas] = useState('');
  const [previewZoomImage, setPreviewZoomImage] = useState(null);

  // Action (Approval/Rejection/Revision) Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionType, setActionType] = useState('APPROVE'); // 'APPROVE' | 'REVISION' | 'REJECT'
  const [actionNotes, setActionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Detail / Inspection Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailDoc, setDetailDoc] = useState(null);

  const canActOnDetail = useMemo(() => {
    if (!detailDoc || !isOfficer) return false;
    return Boolean(
      (
        (isRT && detailDoc.approval_step === 'RT') ||
        (isRW && detailDoc.approval_step === 'RW') ||
        (isKelurahan && detailDoc.approval_step === 'KELURAHAN')
      ) && detailDoc.status !== 'REJECTED' && detailDoc.status !== 'APPROVED'
    );
  }, [detailDoc, isOfficer, isRT, isRW, isKelurahan]);

  // Print Preview Modal State & Customization (Logo, Nomor Surat, Identitas)
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDoc, setPrintDoc] = useState(null);
  const [customLogo, setCustomLogo] = useState(() => {
    try {
      return localStorage.getItem('bw_kop_logo') || '';
    } catch (e) {
      return '';
    }
  });
  const [showEditLetterPanel, setShowEditLetterPanel] = useState(false);
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const [editedLetterData, setEditedLetterData] = useState({
    nomor_surat: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    alamat_kantor: '',
    kontak_kantor: '',
    judul_surat: '',
    nama_pejabat: '',
    nip_pejabat: '',
    titimangsa: ''
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran berkas logo maksimal 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setCustomLogo(base64);
      try {
        localStorage.setItem('bw_kop_logo', base64);
      } catch (err) {
        console.warn('Gagal menyimpan logo ke localStorage:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setCustomLogo('');
    try {
      localStorage.removeItem('bw_kop_logo');
    } catch (err) {}
  };

  // File Upload Reader Helper
  const handleFileChange = (e, setter, nameSetter = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran berkas maksimal 5MB');
      return;
    }
    if (nameSetter) nameSetter(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Fungsi khusus pemuatan anggota keluarga 1 KK dengan fallback bertingkat
  const loadFamilyMembers = async () => {
    try {
      setLoadingFamily(true);
      // 1. Coba endpoint khusus /api/dokumen/family-members
      const famRes = await api.get('/dokumen/family-members').catch(() => null);
      if (famRes) {
        const membersList = Array.isArray(famRes) ? famRes : (Array.isArray(famRes?.data) ? famRes.data : null);
        if (membersList && membersList.length > 0) {
          setFamilyMembers(membersList);
          return;
        }
      }
      
      // 2. Coba endpoint /api/dokumen/prefill-data
      const prefillRes = await api.get('/dokumen/prefill-data').catch(() => null);
      if (prefillRes && prefillRes.data) {
        setPrefillInfo(prefillRes.data);
        if (prefillRes.data.familyMembers && Array.isArray(prefillRes.data.familyMembers) && prefillRes.data.familyMembers.length > 0) {
          setFamilyMembers(prefillRes.data.familyMembers);
          return;
        }
      }

      // 3. Coba endpoint /api/kk/me
      const kkRes = await api.get('/kk/me').catch(() => null);
      if (kkRes && kkRes.data) {
        const anggota = kkRes.data.anggota || kkRes.data.data?.anggota;
        if (Array.isArray(anggota) && anggota.length > 0) {
          setFamilyMembers(anggota);
          return;
        }
      }
    } catch (e) {
      console.warn('Gagal memuat anggota keluarga:', e);
    } finally {
      setLoadingFamily(false);
    }
  };

  const fetchDokumen = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (isOfficer) {
        const [officerRes, myRes] = await Promise.allSettled([
          api.get('/dokumen'),
          api.get('/dokumen/me')
        ]);
        if (officerRes.status === 'fulfilled') {
          setData(officerRes.value?.data || []);
        }
        if (myRes.status === 'fulfilled') {
          setMyDocs(myRes.value?.data || []);
        }
      } else {
        const res = await api.get('/dokumen/me');
        setData(res.data || []);
        setMyDocs(res.data || []);
      }
      await loadFamilyMembers();
    } catch (err) {
      setError(err.message || 'Gagal mengambil data permohonan surat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumen();
  }, []);

  useEffect(() => {
    if (showModal && familyMembers.length === 0) {
      loadFamilyMembers();
    }
  }, [showModal]);

  // Handle URL query parameters (?mode=dampingan / ?for_nik=... / ?action=new)
  useEffect(() => {
    const action = searchParams.get('action');
    const forNik = searchParams.get('for_nik');
    const mode = searchParams.get('mode');
    const namaParam = searchParams.get('nama');
    const nikParam = searchParams.get('nik');

    if (action === 'new' || mode === 'dampingan') {
      setShowModal(true);
      if (mode === 'dampingan') {
        if (nikParam || namaParam) {
          setPelayananMode('WARGA_PENDATANG');
          setPendatangCustom(prev => ({
            ...prev,
            nama: namaParam || prev.nama,
            nik: nikParam || prev.nik
          }));
          setFormData(prev => ({
            ...prev,
            jenis_dokumen: 'Surat Pengantar Warga Pendatang (Domisili Non-Permanen)',
            keperluan: 'Permohonan Surat Keterangan Domisili Sementara / Lapor Warga Pendatang ke Kelurahan'
          }));
        } else {
          setPelayananMode('WARGA_RT');
        }
      }
      if (forNik) {
        setSubjekPemohon(forNik);
      }
    }
  }, [searchParams]);

  // Live Server-Side Search Warga untuk Loket Dampingan RT / RW (Debounced & Ringan)
  useEffect(() => {
    if (!showModal || !isOfficer) return;
    const query = searchWargaText.trim();
    if (query.length < 2) {
      setRtWargaList([]);
      setLoadingRtWarga(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoadingRtWarga(true);
      const params = new URLSearchParams();
      params.set('search', query);
      params.set('limit', '8');
      if (isRT && user?.rt) {
        params.set('rt', user.rt);
        params.set('rw', user.rw || '001');
      } else if (isRW && user?.rw) {
        params.set('rw', user.rw);
      }
      api.get(`/warga?${params.toString()}`)
        .then(res => {
          const items = res?.items || (Array.isArray(res?.data) ? res.data : []);
          setRtWargaList(items);
        })
        .catch(err => console.warn('Search warga error:', err.message))
        .finally(() => setLoadingRtWarga(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchWargaText, showModal, isOfficer, isRT, isRW, user?.rt, user?.rw]);

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

      let targetNik = activeNik;
      let targetNama = user?.nama;
      let isAssisted = false;

      if (isOfficer && pelayananMode === 'WARGA_RT') {
        if (!selectedWargaRt?.nik) {
          setError('Silakan cari dan pilih warga RT yang sedang didampingi.');
          setIsSubmitting(false);
          return;
        }
        targetNik = selectedWargaRt.nik;
        targetNama = selectedWargaRt.nama;
        isAssisted = true;
      } else if (isOfficer && pelayananMode === 'WARGA_PENDATANG') {
        if (!pendatangCustom.nama || !pendatangCustom.nik) {
          setError('Nama dan NIK KTP asal warga pendatang wajib diisi.');
          setIsSubmitting(false);
          return;
        }
        targetNik = pendatangCustom.nik;
        targetNama = pendatangCustom.nama;
        isAssisted = true;
      } else {
        targetNik = subjekPemohon === 'self' 
          ? (prefillInfo?.profile?.nik || user?.active_nik || user?.username)
          : subjekPemohon;
      }

      await api.post('/dokumen', {
        ...formData,
        nik_pemohon: targetNik,
        nama_pemohon: targetNama,
        nama_subjek: targetNama,
        is_assisted: isAssisted,
        direct_rt_approval: isRT && directRtApproval,
        is_emergency_bypass: isRW && emergencyBypass,
        direct_rw_approval: isRW,
        data_tambahan: {
          ...dataTambahan,
          alamat_ktp_asal: pendatangCustom.alamat_asal || dataTambahan.alamat_ktp_asal,
          lokasi_tinggal_rt: pendatangCustom.lokasi_tinggal || dataTambahan.lokasi_tinggal_rt,
          no_hp_pemohon: pendatangCustom.no_hp || ''
        },
        syarat_berkas: syaratChecked,
        lampiran_ktp: lampiranKtp || prefillInfo?.profile?.foto_ktp_url || null,
        lampiran_kk: lampiranKk || prefillInfo?.profile?.foto_kk_url || null,
        lampiran_berkas: lampiranBerkas || null,
        is_auto_filled_by_ai: Boolean(prefillInfo?.eligible)
      });

      setSuccessMsg(
        subjekPemohon === 'self'
          ? 'Permohonan surat berhasil diajukan dengan kelengkapan berkas digital dan masuk ke antrean verifikasi RT!'
          : `Permohonan surat untuk anggota keluarga an. ${selectedSubjectInfo.nama} (${selectedSubjectInfo.hubungan}) berhasil diajukan!`
      );

      setFormData({
        jenis_dokumen: 'Surat Keterangan Domisili',
        keperluan: ''
      });
      setDataTambahan({});
      setSyaratChecked({});
      setLampiranBerkas('');
      setNamaLampiranBerkas('');
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

  // Open Approval / Rejection / Revision Modal
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
      const endpoint = actionType === 'APPROVE' 
        ? `/dokumen/${selectedDoc.id}/approve` 
        : (actionType === 'REVISION' ? `/dokumen/${selectedDoc.id}/revise` : `/dokumen/${selectedDoc.id}/reject`);
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

  // Buka form perbaikan untuk warga jika surat berstatus REVISION
  const handleStartRevision = (doc) => {
    setShowDetailModal(false);
    setFormData({
      jenis_dokumen: doc.jenis_dokumen || doc.jenis_surat || 'Surat Keterangan Domisili',
      keperluan: doc.keperluan || ''
    });
    if (doc.data_tambahan) {
      try {
        const extra = typeof doc.data_tambahan === 'string' ? JSON.parse(doc.data_tambahan) : doc.data_tambahan;
        setDataTambahan(extra || {});
      } catch (e) {
        setDataTambahan({});
      }
    }
    if (doc.syarat_berkas) {
      try {
        const reqs = typeof doc.syarat_berkas === 'string' ? JSON.parse(doc.syarat_berkas) : doc.syarat_berkas;
        setSyaratChecked(reqs || {});
      } catch (e) {
        setSyaratChecked({});
      }
    }
    if (doc.lampiran_ktp) setLampiranKtp(doc.lampiran_ktp);
    if (doc.lampiran_kk) setLampiranKk(doc.lampiran_kk);
    if (doc.lampiran_berkas) setLampiranBerkas(doc.lampiran_berkas);
    if (doc.diajukan_oleh_nik && doc.diajukan_oleh_nik !== doc.nik_pemohon) {
      setSubjekPemohon(doc.nik_pemohon);
    } else {
      setSubjekPemohon('self');
    }
    setShowModal(true);
  };

  // Open Print Modal with Initialized Official Defaults
  const handlePrint = (doc) => {
    const kelurahanName = doc.kelurahan || user?.kelurahan || 'Kebonjati';
    const kecamatanName = doc.kecamatan || user?.kecamatan || 'Cikole';
    const kotaName = doc.kota || user?.kota || 'Kota Sukabumi';
    const provinsiName = doc.provinsi || user?.provinsi || 'Jawa Barat';

    let defaultAlamat = `Jl. Surya Kencana No. 42, ${kelurahanName}, Kec. ${kecamatanName}, ${kotaName}, ${provinsiName} 43111`;
    let defaultKontak = `Telepon: (0266) 221234 • Pos-el: kelurahan.${kelurahanName.toLowerCase().replace(/\s+/g, '')}@sukabumikota.go.id • Kode Pos: 43111`;
    let defaultLurah = 'Drs. H. Hendra Gunawan, M.Si';
    let defaultNip = '19740512 199903 1 004';

    if (kelurahanName.toLowerCase().includes('cikole')) {
      defaultAlamat = `Jl. R.E. Martadinata No. 58, Cikole, Kec. Cikole, Kota Sukabumi, Jawa Barat 43113`;
      defaultKontak = `Telepon: (0266) 222345 • Pos-el: kelurahan.cikole@sukabumikota.go.id • Kode Pos: 43113`;
      defaultLurah = 'Ir. H. Dian Ardiansyah';
      defaultNip = '19760814 200212 1 003';
    }

    const docTitle = (doc.jenis_dokumen || doc.jenis_surat || 'SURAT KETERANGAN').toUpperCase();
    const docTitleLower = docTitle.toLowerCase();
    let kodeKlasifikasi = '470';
    if (docTitleLower.includes('usaha') || docTitleLower.includes('sku')) kodeKlasifikasi = '503';
    else if (docTitleLower.includes('tidak mampu') || docTitleLower.includes('sktm')) kodeKlasifikasi = '463';
    else if (docTitleLower.includes('kematian') || docTitleLower.includes('meninggal')) kodeKlasifikasi = '472.12';
    else if (docTitleLower.includes('kelahiran') || docTitleLower.includes('lahir')) kodeKlasifikasi = '472.11';
    else if (docTitleLower.includes('skck') || docTitleLower.includes('kelakuan baik')) kodeKlasifikasi = '331';
    else if (docTitleLower.includes('belum menikah') || docTitleLower.includes('kawin')) kodeKlasifikasi = '474.2';
    else if (docTitleLower.includes('penghasilan')) kodeKlasifikasi = '560';

    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const currentMonthRoman = romanMonths[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    const singkatanKel = kelurahanName.toLowerCase().includes('cikole') ? 'Kel.Ckl' : 'Kel.Kbjt';
    const fallbackNomorSurat = `${kodeKlasifikasi}/${String(doc.id).padStart(3, '0')}-${singkatanKel}/${currentMonthRoman}/${currentYear}`;

    setEditedLetterData({
      nomor_surat: doc.nomor_surat || fallbackNomorSurat,
      kota: kotaName,
      kecamatan: kecamatanName,
      kelurahan: kelurahanName,
      alamat_kantor: defaultAlamat,
      kontak_kantor: defaultKontak,
      judul_surat: docTitle,
      nama_pejabat: defaultLurah,
      nip_pejabat: defaultNip,
      titimangsa: `${kotaName}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
    });

    setShowEditLetterPanel(false);
    setShowLogoPicker(false);
    setPrintDoc(doc);
    setShowPrintModal(true);
  };

  // Filter list based on tab
  const displayedData = (activeTab === 'my_docs' ? myDocs : data).filter((doc) => {
    if (activeTab === 'pending_approval') {
      if (isRT) return doc.approval_step === 'RT' && doc.status !== 'REJECTED';
      if (isRW) return doc.approval_step === 'RW' && doc.status !== 'REJECTED';
      if (isKelurahan) return doc.approval_step === 'KELURAHAN' && doc.status !== 'REJECTED';
    }
    if (activeTab === 'ready_to_issue') {
      return doc.status === 'APPROVED';
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

    if (doc.status === 'REVISION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle size={13} /> Perlu Perbaikan
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

        <div className="flex items-center gap-2 flex-wrap">
          {isOfficer && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExportRegister('xlsx')}
                disabled={isExporting}
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-2.5 rounded-xl font-semibold hover:bg-emerald-100 transition-all text-xs cursor-pointer disabled:opacity-50"
                title="Unduh Buku Register Surat dalam format Microsoft Excel"
              >
                <FileSpreadsheet size={16} className="text-emerald-600" />
                <span>{isExporting ? 'Mengunduh...' : 'Ekspor Excel'}</span>
              </button>
              <button
                onClick={() => handleExportRegister('csv')}
                disabled={isExporting}
                className="flex items-center gap-1.5 bg-surface-container text-on-surface border border-outline-variant px-3 py-2.5 rounded-xl font-semibold hover:bg-surface-container-high transition-all text-xs cursor-pointer disabled:opacity-50"
                title="Unduh format CSV"
              >
                <Download size={14} />
                <span>CSV</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setSubjekPemohon('self');
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95 cursor-pointer text-xs sm:text-sm"
          >
            <Plus size={18} />
            <span>Ajukan Surat Baru (Mandiri)</span>
          </button>
        </div>
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
        <div className="flex border-b border-outline-variant bg-surface-container-lowest rounded-t-xl overflow-hidden p-1.5 gap-1.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setActiveTab('pending_approval')}
            className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pending_approval'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <Clock size={16} />
            <span>
              Menunggu Tindakan ({
                data.filter((d) => {
                  if (isRT) return d.approval_step === 'RT' && d.status !== 'REJECTED';
                  if (isRW) return d.approval_step === 'RW' && d.status !== 'REJECTED';
                  if (isKelurahan) return d.approval_step === 'KELURAHAN' && d.status !== 'REJECTED';
                  return false;
                }).length
              })
            </span>
          </button>

          {isKelurahan && (
            <button
              onClick={() => setActiveTab('ready_to_issue')}
              className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ready_to_issue'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <Printer size={16} />
              <span>
                Siap Terbit / Cetak PATEN ({
                  data.filter((d) => d.status === 'APPROVED').length
                })
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('my_docs')}
            className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'my_docs'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <User size={16} />
            <span>Surat Mandiri ({myDocs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
                                onClick={() => openActionModal(doc, 'REVISION')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 cursor-pointer"
                                title="Kembalikan berkas ke warga untuk perbaikan"
                              >
                                <RotateCcw size={13} /> Revisi
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
              {/* SELEKSI MODE PELAYANAN UNTUK PENGURUS RT / RW */}
              {isOfficer && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Mode Pengajuan Surat (Akses Pengurus RT/RW):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPelayananMode('WARGA_RT')}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left transition flex items-center gap-2 cursor-pointer ${
                        pelayananMode === 'WARGA_RT'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Users size={16} />
                      <div>
                        <span className="block leading-tight">{isRW ? 'Dampingan Warga RW' : 'Dampingan Warga RT'}</span>
                        <span className={`text-[10px] font-normal block mt-0.5 ${pelayananMode === 'WARGA_RT' ? 'text-sky-100' : 'text-slate-400'}`}>Lansia / Gaptek / Offline</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPelayananMode('WARGA_PENDATANG');
                        setFormData(prev => ({
                          ...prev,
                          jenis_dokumen: 'Surat Pengantar Warga Pendatang (Domisili Non-Permanen)',
                          keperluan: 'Permohonan Surat Keterangan Domisili Sementara / Lapor Warga Pendatang ke Kelurahan'
                        }));
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left transition flex items-center gap-2 cursor-pointer ${
                        pelayananMode === 'WARGA_PENDATANG'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Home size={16} />
                      <div>
                        <span className="block leading-tight">Warga Pendatang</span>
                        <span className={`text-[10px] font-normal block mt-0.5 ${pelayananMode === 'WARGA_PENDATANG' ? 'text-emerald-100' : 'text-slate-400'}`}>Kos / Kontrakan / KTP Luar</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPelayananMode('MANDIRI')}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left transition flex items-center gap-2 cursor-pointer ${
                        pelayananMode === 'MANDIRI'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <User size={16} />
                      <div>
                        <span className="block leading-tight">{isRW ? 'Mandiri Pribadi RW' : 'Mandiri Pribadi RT'}</span>
                        <span className={`text-[10px] font-normal block mt-0.5 ${pelayananMode === 'MANDIRI' ? 'text-indigo-100' : 'text-slate-400'}`}>{isRW ? 'Keluarga RW Sendiri' : 'Keluarga RT Sendiri'}</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* PANEL 1: JIKA MODE DAMPINGAN WARGA RT / RW (LANSIA / GAPTEK) */}
              {isOfficer && pelayananMode === 'WARGA_RT' && (
                <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <Users size={15} className="text-sky-700" />
                      <span>Cari & Pilih Warga {isRT ? `RT ${user?.rt}` : `RW ${user?.rw}`} yang Sedang Didampingi: *</span>
                    </label>
                    {loadingRtWarga && (
                      <span className="text-[10px] text-sky-700 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" /> Mencari data warga...
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder={`Ketik nama atau NIK warga ${isRT ? `RT ${user?.rt}` : `RW ${user?.rw}`} (min. 2 karakter)...`}
                      value={searchWargaText}
                      onChange={(e) => setSearchWargaText(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-sky-300 text-xs outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Autocomplete List Warga RT / RW */}
                  {searchWargaText.trim().length >= 2 && (
                    <div className="max-h-48 overflow-y-auto bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                      {rtWargaList.length > 0 ? (
                        rtWargaList.map(w => (
                          <button
                            key={w.nik}
                            type="button"
                            onClick={() => {
                              setSelectedWargaRt(w);
                              setSearchWargaText('');
                            }}
                            className="w-full p-2.5 text-left text-xs hover:bg-sky-50 flex items-center justify-between cursor-pointer"
                          >
                            <div>
                              <span className="font-bold text-slate-800 block">{w.nama}</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                NIK: {w.nik} &bull; RT {w.rt || '001'} / RW {w.rw || '001'} &bull; No. KK: {w.no_kk || '-'}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                              Pilih Warga
                            </span>
                          </button>
                        ))
                      ) : !loadingRtWarga ? (
                        <div className="p-3 bg-amber-50 text-center space-y-1.5 text-xs">
                          <p className="font-semibold text-amber-900">Warga tidak ditemukan di database lingkungan.</p>
                          <p className="text-[11px] text-amber-700">Warga baru pindah atau belum ber-KTP Kebonjati?</p>
                          <button
                            type="button"
                            onClick={() => {
                              setPelayananMode('WARGA_PENDATANG');
                              setPendatangCustom(prev => ({ ...prev, nama: searchWargaText }));
                              setFormData(prev => ({
                                ...prev,
                                jenis_dokumen: 'Surat Pengantar Warga Pendatang (Domisili Non-Permanen)',
                                keperluan: 'Permohonan Surat Keterangan Domisili Sementara / Lapor Warga Pendatang ke Kelurahan'
                              }));
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                          >
                            <Home size={13} />
                            <span>Beralih ke Input Warga Pendatang Baru</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Preview Warga RT / RW Terpilih */}
                  {selectedWargaRt ? (
                    <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Warga yang Didampingi (Pemohon Sah):</span>
                        <h4 className="font-extrabold text-sm text-slate-900">{selectedWargaRt.nama}</h4>
                        <p className="text-[11px] font-mono text-slate-500">
                          NIK: {selectedWargaRt.nik} &bull; RT {selectedWargaRt.rt || '001'} / RW {selectedWargaRt.rw || '001'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedWargaRt(null)}
                        className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Ganti Warga
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-sky-800 italic">
                      * Ketik nama atau NIK warga di atas (min. 2 karakter) untuk memilih warga yang sedang didampingi.
                    </p>
                  )}

                  {/* Otorisasi Langsung RT */}
                  {isRT && (
                    <div className="pt-2 border-t border-sky-200/80">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={directRtApproval}
                          onChange={(e) => setDirectRtApproval(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                        />
                        <span>Langsung Sahkan & TTE Surat Pengantar RT (Verifikasi Tatap Muka Selesai)</span>
                      </label>
                      <p className="text-[10px] text-slate-500 ml-6">
                        Surat tidak akan mengantre di meja Anda lagi dan langsung diteruskan ke Ketua RW / Kelurahan.
                      </p>
                    </div>
                  )}

                  {/* Otorisasi Bypass Darurat RW */}
                  {isRW && (
                    <div className="pt-2 border-t border-sky-200/80">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-900">
                        <input
                          type="checkbox"
                          checked={emergencyBypass}
                          onChange={(e) => setEmergencyBypass(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <span>Bypass Diskresi Darurat RW (RT Berhalangan / Kebutuhan Sangat Mendesak)</span>
                      </label>
                      <p className="text-[10px] text-slate-500 ml-6">
                        Surat langsung disahkan atas nama RT & RW dan langsung diteruskan ke tingkat Kelurahan Kebonjati.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 2: JIKA MODE WARGA PENDATANG */}
              {isOfficer && pelayananMode === 'WARGA_PENDATANG' && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Home size={15} className="text-emerald-700" />
                      <span>Data Identitas Warga Pendatang (Non-Permanen): *</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Pendatang *</label>
                      <input
                        type="text"
                        placeholder="Nama sesuai e-KTP asal"
                        value={pendatangCustom.nama}
                        onChange={(e) => setPendatangCustom(prev => ({ ...prev, nama: e.target.value }))}
                        className="w-full p-2 bg-white rounded-xl border border-emerald-300 outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">NIK Asal (16 Digit) *</label>
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="Contoh: 3204123456780001"
                        value={pendatangCustom.nik}
                        onChange={(e) => setPendatangCustom(prev => ({ ...prev, nik: e.target.value }))}
                        className="w-full p-2 bg-white rounded-xl border border-emerald-300 outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Kota / Kabupaten Asal KTP *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kab. Bandung Barat"
                        value={pendatangCustom.alamat_asal}
                        onChange={(e) => setPendatangCustom(prev => ({ ...prev, alamat_asal: e.target.value }))}
                        className="w-full p-2 bg-white rounded-xl border border-emerald-300 outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Tempat Tinggal di RT {user?.rt} (Kos / Kontrakan) *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kontrakan Bpk. Mulyadi Pintu 2"
                        value={pendatangCustom.lokasi_tinggal}
                        onChange={(e) => setPendatangCustom(prev => ({ ...prev, lokasi_tinggal: e.target.value }))}
                        className="w-full p-2 bg-white rounded-xl border border-emerald-300 outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  {isRT && (
                    <div className="pt-2 border-t border-emerald-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={directRtApproval}
                          onChange={(e) => setDirectRtApproval(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Langsung Sahkan & TTE Surat Pengantar Domisili RT</span>
                      </label>
                    </div>
                  )}

                  {isRW && (
                    <div className="pt-2 border-t border-emerald-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-950">
                        <input
                          type="checkbox"
                          checked={emergencyBypass}
                          onChange={(e) => setEmergencyBypass(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Bypass Diskresi Darurat RW (Sahkan RT & RW Langsung ke Kelurahan)</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 3: JIKA MODE MANDIRI ATAU USER WARGA BIASA */}
              {(!isOfficer || pelayananMode === 'MANDIRI') && (
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <Users size={15} className="text-primary" />
                    <span>Surat Ini Ditujukan Atas Nama Siapa? *</span>
                  </label>
                  {loadingFamily && (
                    <span className="text-[10px] text-primary flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> Memuat anggota KK...
                    </span>
                  )}
                </div>

                {/* Dropdown Terpadu Subjek Pemohon */}
                <div className="relative">
                  <select
                    value={subjekPemohon}
                    onChange={(e) => setSubjekPemohon(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-primary/40 bg-surface-container-lowest text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    <option value="self">
                      👤 Diri Sendiri — {prefillInfo?.profile?.nama || user?.nama || 'Pemohon'} ({prefillInfo?.profile?.nik || user?.active_nik || user?.username})
                    </option>

                    {familyMembers.length > 0 ? (
                      <optgroup label="👨‍👩‍👧‍👦 Anggota Keluarga (1 Kartu Keluarga)">
                        {familyMembers
                          .filter(fam => fam.nik !== (prefillInfo?.profile?.nik || user?.active_nik || user?.username))
                          .map((fam) => (
                            <option key={fam.nik} value={fam.nik}>
                              {fam.nama} — {fam.status_hubungan_keluarga || fam.hubungan_keluarga || 'Anggota'} (NIK: {fam.nik})
                            </option>
                          ))}
                      </optgroup>
                    ) : (
                      <option disabled value="">
                        (Sedang memuat atau tidak ada anggota lain dalam KK)
                      </option>
                    )}
                  </select>
                </div>

                {/* Quick Toggle Pill Buttons jika ada anggota keluarga */}
                {familyMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSubjekPemohon('self')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        subjekPemohon === 'self'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <User size={13} />
                      <span>Diri Sendiri</span>
                    </button>
                    {familyMembers
                      .filter(fam => fam.nik !== (prefillInfo?.profile?.nik || user?.active_nik || user?.username))
                      .map((fam) => (
                        <button
                          key={fam.nik}
                          type="button"
                          onClick={() => setSubjekPemohon(fam.nik)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                            subjekPemohon === fam.nik
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <span>{fam.nama.split(' ')[0]}</span>
                          <span className="text-[10px] opacity-80">({fam.status_hubungan_keluarga || fam.hubungan_keluarga || 'Anggota'})</span>
                        </button>
                      ))}
                  </div>
                )}

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

                {/* Smart Contextual Recommendation Badges */}
                {formData.jenis_dokumen.includes('Kelahiran') && (
                  <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-blue-600 shrink-0" />
                    <span><strong>Saran:</strong> Pilih nama Bayi / Anak jika telah tercantum dalam KK, atau ajukan atas nama Orang Tua pemohon.</span>
                  </div>
                )}
                {formData.jenis_dokumen.includes('Kematian') && (
                  <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-600 shrink-0" />
                    <span><strong>Saran:</strong> Pilih nama anggota keluarga yang telah berpulang dari daftar anggota keluarga di atas.</span>
                  </div>
                )}
                {formData.jenis_dokumen.includes('Nikah') && (
                  <div className="p-2 rounded-lg bg-pink-50/80 border border-pink-200 text-pink-900 text-[11px] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-pink-600 shrink-0" />
                    <span><strong>Saran:</strong> Pilih anggota keluarga yang akan melangsungkan pernikahan sebagai subjek surat pengantar.</span>
                  </div>
                )}
                {formData.jenis_dokumen.includes('Tidak Mampu') && (
                  <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-600 shrink-0" />
                    <span><strong>Saran:</strong> SKTM untuk Beasiswa/KIP sekolah dapat diajukan atas nama Anak yang bersangkutan.</span>
                  </div>
                )}
              </div>
              )}

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

              {/* 5. UPLOAD LAMPIRAN BERKAS & DOKUMEN DIGITAL (KK, KTP, BERKAS PENDUKUNG) */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <FileUp size={16} className="text-primary" />
                    <span>Upload Lampiran Berkas Digital Resmi</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} /> Auto-Sync KK Digital
                  </span>
                </div>
                
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  RT dan RW akan memverifikasi berkas digital di sistem <strong>tanpa memerlukan surat rekomendasi fisik</strong>. Berkas KTP dan KK yang diunggah otomatis tersimpan di data profil warga sebagai arsip KK Digital resmi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* UPLOAD KTP DIGITAL */}
                  <div className="p-3 rounded-xl border border-outline-variant/70 bg-surface-container-lowest space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <Image size={14} className="text-blue-600" />
                        <span>e-KTP Pemohon / Subjek</span>
                      </span>
                      {(lampiranKtp || prefillInfo?.profile?.foto_ktp_url) && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Tersimpan
                        </span>
                      )}
                    </div>

                    {(lampiranKtp || prefillInfo?.profile?.foto_ktp_url) ? (
                      <div className="space-y-1.5">
                        <div className="relative rounded-lg overflow-hidden border border-emerald-200 bg-emerald-50/50 p-2 flex items-center gap-2">
                          <img 
                            src={lampiranKtp || prefillInfo?.profile?.foto_ktp_url} 
                            alt="e-KTP" 
                            className="w-12 h-9 object-cover rounded cursor-pointer border border-emerald-300 hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewZoomImage(lampiranKtp || prefillInfo?.profile?.foto_ktp_url)}
                          />
                          <div className="text-[11px] flex-1 min-w-0">
                            <span className="font-semibold text-emerald-900 block truncate">KTP Digital Terverifikasi</span>
                            <span className="text-[10px] text-emerald-700">Klik gambar untuk pratinjau</span>
                          </div>
                        </div>
                        <label className="text-[10px] text-primary hover:underline cursor-pointer block text-center font-medium">
                          Ganti / Unggah KTP Baru
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, setLampiranKtp)} 
                          />
                        </label>
                      </div>
                    ) : (
                      <div>
                        <label className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                          <Upload size={20} className="text-on-surface-variant group-hover:text-primary transition-colors mb-1" />
                          <span className="text-[11px] font-semibold text-on-surface">Pilih Foto e-KTP</span>
                          <span className="text-[10px] text-on-surface-variant">Format JPG/PNG/PDF (Maks 5MB)</span>
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, setLampiranKtp)} 
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* UPLOAD KK DIGITAL */}
                  <div className="p-3 rounded-xl border border-outline-variant/70 bg-surface-container-lowest space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <FileText size={14} className="text-indigo-600" />
                        <span>Kartu Keluarga (KK)</span>
                      </span>
                      {(lampiranKk || prefillInfo?.profile?.foto_kk_url) && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Tersimpan
                        </span>
                      )}
                    </div>

                    {(lampiranKk || prefillInfo?.profile?.foto_kk_url) ? (
                      <div className="space-y-1.5">
                        <div className="relative rounded-lg overflow-hidden border border-emerald-200 bg-emerald-50/50 p-2 flex items-center gap-2">
                          <img 
                            src={lampiranKk || prefillInfo?.profile?.foto_kk_url} 
                            alt="Kartu Keluarga" 
                            className="w-12 h-9 object-cover rounded cursor-pointer border border-emerald-300 hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewZoomImage(lampiranKk || prefillInfo?.profile?.foto_kk_url)}
                          />
                          <div className="text-[11px] flex-1 min-w-0">
                            <span className="font-semibold text-emerald-900 block truncate">KK Digital Resmi</span>
                            <span className="text-[10px] text-emerald-700">Klik gambar untuk pratinjau</span>
                          </div>
                        </div>
                        <label className="text-[10px] text-primary hover:underline cursor-pointer block text-center font-medium">
                          Ganti / Unggah KK Baru
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, setLampiranKk)} 
                          />
                        </label>
                      </div>
                    ) : (
                      <div>
                        <label className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                          <Upload size={20} className="text-on-surface-variant group-hover:text-primary transition-colors mb-1" />
                          <span className="text-[11px] font-semibold text-on-surface">Pilih Foto Kartu Keluarga</span>
                          <span className="text-[10px] text-on-surface-variant">Format JPG/PNG/PDF (Maks 5MB)</span>
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, setLampiranKk)} 
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* UPLOAD BERKAS PENDUKUNG KHUSUS (SESUAI JENIS SURAT) */}
                  <div className="sm:col-span-2 p-3 rounded-xl border border-outline-variant/70 bg-surface-container-lowest space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <Upload size={14} className="text-amber-600" />
                        <span>Lampiran Berkas Pendukung Khusus (Opsional / Sesuai Jenis Surat)</span>
                      </span>
                      {lampiranBerkas && (
                        <button
                          type="button"
                          onClick={() => { setLampiranBerkas(''); setNamaLampiranBerkas(''); }}
                          className="text-[10px] text-rose-600 hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-on-surface-variant">
                      Contoh: Foto tempat usaha (SKU), Surat keterangan kematian/lahir dari RS, Foto rumah tampak depan (SKTM), dll.
                    </p>

                    {lampiranBerkas ? (
                      <div className="flex items-center gap-3 p-2 bg-amber-50/70 border border-amber-200 rounded-lg">
                        <img 
                          src={lampiranBerkas} 
                          alt="Berkas Pendukung" 
                          className="w-12 h-10 object-cover rounded border border-amber-300 cursor-pointer hover:opacity-80"
                          onClick={() => setPreviewZoomImage(lampiranBerkas)}
                        />
                        <div className="text-[11px] flex-1 truncate">
                          <span className="font-semibold text-amber-900 block truncate">{namaLampiranBerkas || 'Berkas Pendukung Terlampir'}</span>
                          <span className="text-[10px] text-amber-700">Tersedia untuk diverifikasi oleh RT/RW</span>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-outline-variant hover:border-amber-500 rounded-xl p-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors text-center group">
                        <Upload size={16} className="text-on-surface-variant group-hover:text-amber-600 transition-colors" />
                        <span className="text-[11px] font-medium text-on-surface group-hover:text-amber-700">Unggah Berkas Pendukung Tambahan</span>
                        <input 
                          type="file" 
                          accept="image/*,.pdf" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, setLampiranBerkas, setNamaLampiranBerkas)} 
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. KEPERLUAN SURAT */}
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

              {/* Lampiran Berkas Persyaratan & Dokumen Digital */}
              <div className="p-3 bg-surface-container-low rounded-xl space-y-2">
                <span className="font-bold text-on-surface block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileUp size={14} className="text-primary" />
                    <span>Lampiran Dokumen Digital Warga:</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verifikasi Digital SOP RT/RW
                  </span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {/* KTP DIGITAL */}
                  <div className="p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/60 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-on-surface block mb-1">e-KTP Digital</span>
                    {detailDoc.lampiran_ktp ? (
                      <div className="relative group w-full">
                        <img 
                          src={detailDoc.lampiran_ktp} 
                          alt="e-KTP" 
                          className="w-full h-16 object-cover rounded cursor-pointer border border-outline-variant group-hover:opacity-80 transition-opacity"
                          onClick={() => setPreviewZoomImage(detailDoc.lampiran_ktp)}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewZoomImage(detailDoc.lampiran_ktp)}
                          className="mt-1 text-[10px] text-primary flex items-center justify-center gap-0.5 w-full font-medium"
                        >
                          <Eye size={10} /> Perbesar
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-full flex flex-col items-center justify-center bg-surface-container rounded text-[10px] text-on-surface-variant">
                        <User size={18} className="opacity-40 mb-0.5" />
                        <span>Data Terdaftar</span>
                      </div>
                    )}
                  </div>

                  {/* KK DIGITAL */}
                  <div className="p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/60 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-on-surface block mb-1">KK Digital Resmi</span>
                    {detailDoc.lampiran_kk ? (
                      <div className="relative group w-full">
                        <img 
                          src={detailDoc.lampiran_kk} 
                          alt="Kartu Keluarga" 
                          className="w-full h-16 object-cover rounded cursor-pointer border border-outline-variant group-hover:opacity-80 transition-opacity"
                          onClick={() => setPreviewZoomImage(detailDoc.lampiran_kk)}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewZoomImage(detailDoc.lampiran_kk)}
                          className="mt-1 text-[10px] text-primary flex items-center justify-center gap-0.5 w-full font-medium"
                        >
                          <Eye size={10} /> Perbesar
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-full flex flex-col items-center justify-center bg-surface-container rounded text-[10px] text-on-surface-variant">
                        <FileText size={18} className="opacity-40 mb-0.5" />
                        <span>Data Terdaftar</span>
                      </div>
                    )}
                  </div>

                  {/* BERKAS PENDUKUNG */}
                  <div className="col-span-2 sm:col-span-1 p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/60 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-on-surface block mb-1">Berkas Pendukung</span>
                    {detailDoc.lampiran_berkas ? (
                      <div className="relative group w-full">
                        <img 
                          src={detailDoc.lampiran_berkas} 
                          alt="Berkas Pendukung" 
                          className="w-full h-16 object-cover rounded cursor-pointer border border-outline-variant group-hover:opacity-80 transition-opacity"
                          onClick={() => setPreviewZoomImage(detailDoc.lampiran_berkas)}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewZoomImage(detailDoc.lampiran_berkas)}
                          className="mt-1 text-[10px] text-amber-700 flex items-center justify-center gap-0.5 w-full font-medium"
                        >
                          <Eye size={10} /> Perbesar
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-full flex flex-col items-center justify-center bg-surface-container rounded text-[10px] text-on-surface-variant">
                        <Info size={16} className="opacity-40 mb-0.5" />
                        <span>Tidak Dilampirkan</span>
                      </div>
                    )}
                  </div>
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

              {/* Catatan Verifikasi / Revisi */}
              {detailDoc.catatan_petugas && (
                <div className={`p-3 rounded-xl border text-xs ${
                  detailDoc.status === 'REVISION' 
                    ? 'bg-amber-50 border-amber-300 text-amber-900' 
                    : (detailDoc.status === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900')
                }`}>
                  <span className="font-bold block flex items-center gap-1.5">
                    <Info size={14} />
                    <span>Catatan Petugas Pemeriksa:</span>
                  </span>
                  <p className="mt-1 font-medium">{detailDoc.catatan_petugas}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
              <div>
                {/* Quick action buttons jika petugas yang memeriksa */}
                {canActOnDetail && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setShowDetailModal(false); openActionModal(detailDoc, 'APPROVE'); }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={13} /> {isKelurahan ? 'Sahkan' : 'Setujui'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowDetailModal(false); openActionModal(detailDoc, 'REVISION'); }}
                      className="px-2.5 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg font-semibold hover:bg-amber-100 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={13} /> Minta Revisi
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowDetailModal(false); openActionModal(detailDoc, 'REJECT'); }}
                      className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-semibold hover:bg-rose-100 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <X size={13} /> Tolak
                    </button>
                  </div>
                )}

                {/* Tombol khusus warga jika permohonan butuh perbaikan / revisi */}
                {isCitizen && detailDoc?.status === 'REVISION' && (
                  <button
                    type="button"
                    onClick={() => handleStartRevision(detailDoc)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <RotateCcw size={13} /> Perbaiki Permohonan Ini
                  </button>
                )}
                {/* Tombol cetak salinan resmi jika dokumen telah disetujui */}
                {detailDoc?.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      handlePrint(detailDoc);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer size={15} /> Cetak / Unduh Salinan Resmi
                  </button>
                )}
              </div>

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
      {/* MODAL 2: VERIFIKASI / PENGESAHAN / REVISI / PENOLAKAN OLEH PETUGAS        */}
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
                {actionType === 'APPROVE' && <CheckCircle2 className="text-emerald-600" size={20} />}
                {actionType === 'REVISION' && <RotateCcw className="text-amber-600" size={20} />}
                {actionType === 'REJECT' && <XCircle className="text-rose-600" size={20} />}
                
                {actionType === 'APPROVE' 
                  ? (isKelurahan ? 'Pengesahan Surat Resmi' : 'Persetujuan Surat')
                  : (actionType === 'REVISION' ? 'Kembalikan untuk Perbaikan / Revisi' : 'Tolak Permohonan Surat')}
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
                  {actionType === 'APPROVE' 
                    ? 'Catatan Petugas (Opsional)' 
                    : (actionType === 'REVISION' ? 'Instruksi / Catatan Perbaikan untuk Warga *' : 'Alasan Penolakan (Wajib) *')}
                </label>
                <textarea
                  rows="3"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  required={actionType === 'REJECT' || actionType === 'REVISION'}
                  placeholder={
                    actionType === 'APPROVE' 
                      ? 'Berkas lengkap dan sesuai kriteria SOP...' 
                      : (actionType === 'REVISION' 
                          ? 'Contoh: Mohon unggah ulang foto KK yang lebih jelas / lampirkan foto tempat usaha...' 
                          : 'Sebutkan kekurangan berkas/alasan penolakan...')
                  }
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
                    actionType === 'APPROVE' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : (actionType === 'REVISION' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700')
                  }`}
                >
                  {submittingAction ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    actionType === 'APPROVE' 
                      ? 'Konfirmasi Persetujuan' 
                      : (actionType === 'REVISION' ? 'Kirim Catatan Perbaikan' : 'Tolak Permohonan')
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PREVIEW CETAK SURAT RESMI (KOP RESMI PEMERINTAH DAERAH SPBE)       */}
      {/* Sesuai Tata Naskah Dinas Permendagri No. 83/2022 & UU ITE TTE Tersertifikasi */}
      {/* Dilengkapi Penyesuaian Logo Kota & Edit Identitas/Nomor Surat Opsional      */}
      {/* ========================================================================= */}
      {showPrintModal && printDoc && (() => {
        const kelurahanName = printDoc.kelurahan || user?.kelurahan || 'Kebonjati';
        const kecamatanName = printDoc.kecamatan || user?.kecamatan || 'Cikole';
        const kotaName = printDoc.kota || user?.kota || 'Kota Sukabumi';
        const provinsiName = printDoc.provinsi || user?.provinsi || 'Jawa Barat';

        // Profil Wilayah Kerja & Pejabat Definitif Sesuai Kelurahan
        let kantorAlamat = `Jl. Surya Kencana No. 42, ${kelurahanName}, Kec. ${kecamatanName}, ${kotaName}, ${provinsiName} 43111`;
        let kontakKantor = `Telepon: (0266) 221234 • Pos-el: kelurahan.${kelurahanName.toLowerCase().replace(/\s+/g, '')}@sukabumikota.go.id • Kode Pos: 43111`;
        let namaLurah = 'Drs. H. Hendra Gunawan, M.Si';
        let nipLurah = '19740512 199903 1 004';

        if (kelurahanName.toLowerCase().includes('cikole')) {
          kantorAlamat = `Jl. R.E. Martadinata No. 58, Cikole, Kec. Cikole, Kota Sukabumi, Jawa Barat 43113`;
          kontakKantor = `Telepon: (0266) 222345 • Pos-el: kelurahan.cikole@sukabumikota.go.id • Kode Pos: 43113`;
          namaLurah = 'Ir. H. Dian Ardiansyah';
          nipLurah = '19760814 200212 1 003';
        }

        // Parsing data tambahan (misal untuk SKU/SKTM/Lainnya)
        let extraInfo = {};
        if (printDoc.data_tambahan) {
          try {
            extraInfo = typeof printDoc.data_tambahan === 'string' ? JSON.parse(printDoc.data_tambahan) : printDoc.data_tambahan;
          } catch (e) {
            extraInfo = {};
          }
        }

        const tglSurat = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const tglLahir = printDoc.tanggal_lahir ? new Date(printDoc.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        const docTitle = (printDoc.jenis_dokumen || printDoc.jenis_surat || 'SURAT KETERANGAN').toUpperCase();
        const docTitleLower = docTitle.toLowerCase();

        // Hitung kode klasifikasi dinamis jika belum tercantum di nomor surat
        let kodeKlasifikasi = '470';
        if (docTitleLower.includes('usaha') || docTitleLower.includes('sku')) kodeKlasifikasi = '503';
        else if (docTitleLower.includes('tidak mampu') || docTitleLower.includes('sktm')) kodeKlasifikasi = '463';
        else if (docTitleLower.includes('kematian') || docTitleLower.includes('meninggal')) kodeKlasifikasi = '472.12';
        else if (docTitleLower.includes('kelahiran') || docTitleLower.includes('lahir')) kodeKlasifikasi = '472.11';
        else if (docTitleLower.includes('skck') || docTitleLower.includes('kelakuan baik')) kodeKlasifikasi = '331';
        else if (docTitleLower.includes('belum menikah') || docTitleLower.includes('kawin')) kodeKlasifikasi = '474.2';
        else if (docTitleLower.includes('penghasilan')) kodeKlasifikasi = '560';

        const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        const currentMonthRoman = romanMonths[new Date().getMonth()];
        const currentYear = new Date().getFullYear();
        const singkatanKel = kelurahanName.toLowerCase().includes('cikole') ? 'Kel.Ckl' : 'Kel.Kbjt';
        const fallbackNomorSurat = `${kodeKlasifikasi}/${String(printDoc.id).padStart(3, '0')}-${singkatanKel}/${currentMonthRoman}/${currentYear}`;

        // Field nilai yang ditampilkan (mengutamakan hasil editan admin jika ada, dengan fallback otomatis)
        const displayedNomorSurat = editedLetterData.nomor_surat || printDoc.nomor_surat || fallbackNomorSurat;
        const displayedKota = editedLetterData.kota || kotaName;
        const displayedKecamatan = editedLetterData.kecamatan || kecamatanName;
        const displayedKelurahan = editedLetterData.kelurahan || kelurahanName;
        const displayedAlamatKantor = editedLetterData.alamat_kantor || kantorAlamat;
        const displayedKontakKantor = editedLetterData.kontak_kantor || kontakKantor;
        const displayedJudulSurat = editedLetterData.judul_surat || docTitle;
        const displayedNamaLurah = editedLetterData.nama_pejabat || namaLurah;
        const displayedNipLurah = editedLetterData.nip_pejabat || nipLurah;
        const displayedTitimangsa = editedLetterData.titimangsa || `${displayedKota}, ${tglSurat}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
            {/* Embedded Print CSS to isolate printable document */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #official-print-document, #official-print-document * {
                  visibility: visible !important;
                }
                #official-print-document {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 15mm 20mm !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: white !important;
                }
                .no-print-zone {
                  display: none !important;
                }
              }
            ` }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl my-6 border border-slate-300 font-sans relative max-h-[94vh] overflow-y-auto"
            >
              {/* TOP TOOLBAR (KONTROL ADMIN: LOGO & EDIT IDENTITAS) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200 no-print-zone">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary" size={20} />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Pratinjau Naskah Dinas Resmi SPBE</h3>
                    <p className="text-[11px] text-slate-500">Permendagri No. 83/2022 • Tersedia opsi penyesuaian Logo & Nomor Surat</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Tombol Pilih / Upload Logo Daerah */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogoPicker(!showLogoPicker);
                      setShowEditLetterPanel(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      showLogoPicker 
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                    }`}
                    title="Atur Logo Pemda di Kop Surat"
                  >
                    <Image size={14} className="text-amber-700" />
                    <span>Logo Pemda {customLogo ? '✓' : ''}</span>
                  </button>

                  {/* Tombol Edit Nomor Surat & Identitas (Opsional) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditLetterPanel(!showEditLetterPanel);
                      setShowLogoPicker(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      showEditLetterPanel 
                        ? 'bg-primary/15 text-primary border-primary/30 shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                    }`}
                    title="Sesuaikan Nomor Surat & Identitas Kop Surat (Opsional)"
                  >
                    <PenLine size={14} />
                    <span>Edit No. Surat & Kop (Opsional)</span>
                  </button>

                  {/* Tombol Tutup */}
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Tutup Modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* PANEL 1: PENGATURAN LOGO PEMDA (EXPANDABLE) */}
              {showLogoPicker && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl mb-4 space-y-3 text-xs no-print-zone shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Image size={15} className="text-amber-700" /> Atur Lambang / Logo Daerah di Kop Surat
                    </span>
                    {customLogo && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="text-rose-700 hover:text-rose-900 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} /> Reset ke Logo Default
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    {/* Preset 1: Default Lambang Emas SPBE */}
                    <button
                      type="button"
                      onClick={() => { setCustomLogo('default'); try { localStorage.setItem('bw_kop_logo', 'default'); } catch(e){} }}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        !customLogo || customLogo === 'default'
                          ? 'bg-amber-100 border-amber-400 font-bold text-amber-900 ring-2 ring-amber-400/30'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center bg-amber-50 flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-amber-800">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333A2.333 2.333 0 0017.167 8H6.833A2.333 2.333 0 004.5 10.333V21h15z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px]">Logo Nasional</div>
                        <div className="text-[9px] text-slate-500 font-normal">Garuda / SPBE Emas</div>
                      </div>
                    </button>

                    {/* Preset 2: Kota Sukabumi */}
                    <button
                      type="button"
                      onClick={() => { setCustomLogo('sukabumi'); try { localStorage.setItem('bw_kop_logo', 'sukabumi'); } catch(e){} }}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        customLogo === 'sukabumi'
                          ? 'bg-emerald-100 border-emerald-500 font-bold text-emerald-950 ring-2 ring-emerald-500/30'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border border-emerald-800 flex items-center justify-center bg-white flex-shrink-0">
                        <svg viewBox="0 0 36 36" className="w-6 h-6">
                          <path fill="#2E7D32" d="M18 2 L32 8 L32 24 C32 30 18 35 18 35 C18 35 4 30 4 24 L4 8 Z" />
                          <path fill="#FFD54F" d="M18 6 L28 11 L28 22 C28 26 18 31 18 31 C18 31 8 26 8 22 L8 11 Z" />
                          <path fill="#1565C0" d="M18 10 L25 20 L11 20 Z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px]">Kota Sukabumi</div>
                        <div className="text-[9px] text-slate-500 font-normal">Perisai Hijau Resmi</div>
                      </div>
                    </button>

                    {/* Preset 3: Provinsi Jawa Barat */}
                    <button
                      type="button"
                      onClick={() => { setCustomLogo('jabar'); try { localStorage.setItem('bw_kop_logo', 'jabar'); } catch(e){} }}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        customLogo === 'jabar'
                          ? 'bg-emerald-100 border-emerald-500 font-bold text-emerald-950 ring-2 ring-emerald-500/30'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border border-emerald-700 flex items-center justify-center bg-white flex-shrink-0">
                        <svg viewBox="0 0 36 36" className="w-6 h-6">
                          <path fill="#1B5E20" d="M18 2 L33 9 L30 25 C30 30 18 35 18 35 C18 35 6 30 6 25 L3 9 Z" />
                          <path fill="#FFF" d="M18 7 L26 18 L10 18 Z" />
                          <circle cx="18" cy="22" r="3" fill="#FBC02D" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px]">Jawa Barat</div>
                        <div className="text-[9px] text-slate-500 font-normal">Kujang & Padi Kapas</div>
                      </div>
                    </button>

                    {/* Preset 4: Upload Custom Image File */}
                    <label className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      customLogo && !['default', 'sukabumi', 'jabar'].includes(customLogo)
                        ? 'bg-blue-100 border-blue-500 font-bold text-blue-950 ring-2 ring-blue-500/30'
                        : 'bg-white border-dashed border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="file" 
                        accept="image/png,image/jpeg,image/svg+xml" 
                        onChange={handleLogoUpload}
                        className="hidden" 
                      />
                      <div className="w-8 h-8 rounded-full border border-blue-400 flex items-center justify-center bg-blue-50 flex-shrink-0">
                        <Upload size={16} className="text-blue-700" />
                      </div>
                      <div>
                        <div className="text-[11px] truncate max-w-[110px]">
                          {customLogo && !['default', 'sukabumi', 'jabar'].includes(customLogo) ? 'Logo Kustom Aktif' : 'Unggah File'}
                        </div>
                        <div className="text-[9px] text-slate-500 font-normal">PNG / SVG (Maks 2MB)</div>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* PANEL 2: EDIT IDENTITAS & NOMOR SURAT (EXPANDABLE) */}
              {showEditLetterPanel && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-slate-50 border border-slate-300 rounded-xl mb-4 space-y-3 text-xs no-print-zone shadow-sm"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <PenLine size={15} className="text-primary" /> Penyesuaian Nomor Surat & Identitas Naskah Dinas (Opsional)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const defAlamat = `Jl. Surya Kencana No. 42, ${kelurahanName}, Kec. ${kecamatanName}, ${kotaName}, ${provinsiName} 43111`;
                        const defKontak = `Telepon: (0266) 221234 • Pos-el: kelurahan.${kelurahanName.toLowerCase().replace(/\s+/g, '')}@sukabumikota.go.id • Kode Pos: 43111`;
                        setEditedLetterData({
                          nomor_surat: printDoc.nomor_surat || fallbackNomorSurat,
                          kota: kotaName,
                          kecamatan: kecamatanName,
                          kelurahan: kelurahanName,
                          alamat_kantor: defAlamat,
                          kontak_kantor: defKontak,
                          judul_surat: docTitle,
                          nama_pejabat: namaLurah,
                          nip_pejabat: nipLurah,
                          titimangsa: `${kotaName}, ${tglSurat}`
                        });
                      }}
                      className="text-slate-600 hover:text-slate-900 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Reset ke Nilai Baku
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Nomor Surat Resmi */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Nomor Surat Resmi *
                      </label>
                      <input
                        type="text"
                        value={displayedNomorSurat}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, nomor_surat: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white text-slate-900 focus:ring-1 focus:ring-primary"
                        placeholder="Contoh: 503/018-Kel.Kbjt/XI/2026"
                      />
                      <span className="text-[10px] text-slate-500">Format klasifikasi Permendagri No. 83/2022</span>
                    </div>

                    {/* 2. Judul Dokumen */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Judul / Perihal Surat
                      </label>
                      <input
                        type="text"
                        value={displayedJudulSurat}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, judul_surat: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-900 focus:ring-1 focus:ring-primary"
                        placeholder="Contoh: SURAT KETERANGAN USAHA (SKU)"
                      />
                    </div>

                    {/* 3. Titimangsa / Tanggal Surat */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Titimangsa (Tempat & Tanggal)
                      </label>
                      <input
                        type="text"
                        value={displayedTitimangsa}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, titimangsa: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-primary"
                        placeholder="Contoh: Sukabumi, 14 November 2026"
                      />
                    </div>

                    {/* 4. Pemerintah Daerah */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Pemerintah Kota / Kabupaten
                      </label>
                      <input
                        type="text"
                        value={displayedKota}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, kota: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-primary"
                        placeholder="Contoh: Kota Sukabumi"
                      />
                    </div>

                    {/* 5. Kecamatan */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Kecamatan
                      </label>
                      <input
                        type="text"
                        value={displayedKecamatan}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, kecamatan: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-primary"
                        placeholder="Contoh: Cikole"
                      />
                    </div>

                    {/* 6. Kelurahan */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Kelurahan
                      </label>
                      <input
                        type="text"
                        value={displayedKelurahan}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, kelurahan: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-primary font-bold"
                        placeholder="Contoh: Kebonjati"
                      />
                    </div>

                    {/* 7. Alamat Kantor */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Alamat Kantor Kelurahan
                      </label>
                      <input
                        type="text"
                        value={displayedAlamatKantor}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, alamat_kantor: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-primary"
                        placeholder="Alamat kantor lengkap..."
                      />
                    </div>

                    {/* 8. Kontak / Pos-el */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Telepon & Pos-el Kantor
                      </label>
                      <input
                        type="text"
                        value={displayedKontakKantor}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, kontak_kantor: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-primary"
                        placeholder="Telepon & email..."
                      />
                    </div>

                    {/* 9. Nama Pejabat Penandatangan */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Nama Pejabat (Lurah)
                      </label>
                      <input
                        type="text"
                        value={displayedNamaLurah}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, nama_pejabat: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-primary font-semibold"
                        placeholder="Nama Lurah & gelar..."
                      />
                    </div>

                    {/* 10. NIP Pejabat */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        NIP Pejabat
                      </label>
                      <input
                        type="text"
                        value={displayedNipLurah}
                        onChange={(e) => setEditedLetterData(prev => ({ ...prev, nip_pejabat: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:ring-1 focus:ring-primary"
                        placeholder="NIP: 1974..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DOCUMENT SHEET PRINTABLE CONTAINER */}
              <div id="official-print-document" className="bg-white text-slate-900">
                {/* 1. KOP SURAT RESMI PEMERINTAH DAERAH */}
                <div className="flex items-center gap-4 pb-2 border-b-[3px] border-slate-950 mb-0.5">
                  {/* Lambang Daerah / Logo Pemda Resmi */}
                  <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                    {customLogo && customLogo.startsWith('data:image') ? (
                      <img 
                        src={customLogo} 
                        alt="Logo Daerah" 
                        className="max-h-20 max-w-20 object-contain drop-shadow-xs" 
                      />
                    ) : customLogo === 'sukabumi' || (!customLogo && displayedKota.toLowerCase().includes('sukabumi')) ? (
                      <div className="w-18 h-18 rounded-full border-2 border-emerald-800 p-0.5 flex items-center justify-center bg-white shadow-xs">
                        <svg viewBox="0 0 36 36" className="w-16 h-16 drop-shadow-sm">
                          <path fill="#2E7D32" d="M18 2 L32 8 L32 24 C32 30 18 35 18 35 C18 35 4 30 4 24 L4 8 Z" />
                          <path fill="#FFD54F" d="M18 6 L28 11 L28 22 C28 26 18 31 18 31 C18 31 8 26 8 22 L8 11 Z" />
                          <path fill="#1565C0" d="M18 10 L25 20 L11 20 Z" />
                          <circle cx="18" cy="18" r="2.5" fill="#FFD54F" />
                        </svg>
                      </div>
                    ) : customLogo === 'jabar' ? (
                      <div className="w-18 h-18 rounded-full border-2 border-emerald-700 p-0.5 flex items-center justify-center bg-white shadow-xs">
                        <svg viewBox="0 0 36 36" className="w-16 h-16 drop-shadow-sm">
                          <path fill="#1B5E20" d="M18 2 L33 9 L30 25 C30 30 18 35 18 35 C18 35 6 30 6 25 L3 9 Z" />
                          <path fill="#FFF" d="M18 7 L26 18 L10 18 Z" />
                          <circle cx="18" cy="22" r="3" fill="#FBC02D" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-slate-900 p-1 flex items-center justify-center bg-amber-50/50">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-11 h-11 text-amber-800">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333A2.333 2.333 0 0017.167 8H6.833A2.333 2.333 0 004.5 10.333V21h15z" />
                          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Header Teks Instansi Pemerintah Daerah */}
                  <div className="flex-1 text-center pr-6">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-800 leading-tight">
                      PEMERINTAH {displayedKota.toUpperCase()}
                    </h3>
                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 leading-tight">
                      KECAMATAN {displayedKecamatan.toUpperCase()}
                    </h2>
                    <h1 className="text-lg sm:text-2xl font-black uppercase tracking-widest text-slate-950 font-serif leading-tight">
                      KELURAHAN {displayedKelurahan.toUpperCase()}
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-600 mt-1 leading-tight font-sans">
                      {displayedAlamatKantor}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 leading-tight font-sans">
                      {displayedKontakKantor}
                    </p>
                  </div>
                </div>
                {/* Garis Ganda Naskah Dinas Resmi (Double Border) */}
                <div className="border-b border-slate-950 mb-6" />

                {/* 2. JUDUL DAN NOMOR SURAT RESMI */}
                <div className="text-center mb-6">
                  <h4 className="text-sm sm:text-base font-bold underline uppercase tracking-wider font-serif">
                    {displayedJudulSurat}
                  </h4>
                  <p className="text-xs font-mono font-semibold text-slate-800 mt-1">
                    Nomor: {displayedNomorSurat}
                  </p>
                </div>

                {/* 3. BATANG TUBUH SURAT (ISI NASKAH DINAS) */}
                <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-slate-850">
                  <p>
                    Yang bertanda tangan di bawah ini, Kepala Kelurahan {displayedKelurahan}, Kecamatan {displayedKecamatan}, {displayedKota}, menerangkan dengan sebenarnya bahwa:
                  </p>

                  {/* Tabel Data Identitas Pemohon / Subjek */}
                  <div className="pl-4 sm:pl-8 space-y-1.5 font-sans bg-slate-50/60 p-3 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-600 font-medium">Nama Lengkap</span>
                      <span className="col-span-8 font-bold text-slate-950">: {printDoc.nama_pemohon}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-600 font-medium">Nomor Induk Kependudukan (NIK)</span>
                      <span className="col-span-8 font-mono font-bold text-slate-950">: {printDoc.nik_pemohon}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-600 font-medium">Nomor Kartu Keluarga (KK)</span>
                      <span className="col-span-8 font-mono text-slate-800">: {printDoc.no_kk || '-'}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-600 font-medium">Tempat, Tanggal Lahir</span>
                      <span className="col-span-8 text-slate-800">: {printDoc.tempat_lahir || 'Sukabumi'}, {tglLahir}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-600 font-medium">Jenis Kelamin</span>
                      <span className="col-span-8 text-slate-800">: {printDoc.jenis_kelamin === 'L' ? 'Laki-laki' : (printDoc.jenis_kelamin === 'P' ? 'Perempuan' : (printDoc.jenis_kelamin || '-'))}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-600 font-medium">Agama</span>
                      <span className="col-span-8 text-slate-800">: {printDoc.agama || 'Islam'}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-600 font-medium">Pekerjaan</span>
                      <span className="col-span-8 text-slate-800">: {printDoc.pekerjaan || 'Wiraswasta / Karyawan'}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-600 font-medium">Alamat KTP / Domisili</span>
                      <span className="col-span-8 text-slate-800">: RT {printDoc.rt || '001'} / RW {printDoc.rw || '001'}, Kelurahan {displayedKelurahan}, Kec. {displayedKecamatan}, {displayedKota}</span>
                    </div>
                    {printDoc.hubungan_keluarga && printDoc.hubungan_keluarga !== 'Kepala Keluarga' && (
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 text-slate-600 font-medium">Status Hubungan Keluarga</span>
                        <span className="col-span-8 text-slate-800">: {printDoc.hubungan_keluarga}</span>
                      </div>
                    )}
                  </div>

                  {/* Keterangan Substantif Sesuai Jenis Permohonan */}
                  <div className="pt-2 text-justify space-y-2">
                    {displayedJudulSurat.toLowerCase().includes('usaha') || displayedJudulSurat.toLowerCase().includes('sku') ? (
                      <>
                        <p>
                          Orang tersebut di atas adalah benar-benar warga yang bertempat tinggal di wilayah kami dan berdasarkan pengamatan, verifikasi lapangan berjenjang oleh Pengurus RT/RW setempat, yang bersangkutan benar memiliki dan mengelola kegiatan usaha aktif sebagai berikut:
                        </p>
                        <div className="pl-4 sm:pl-8 py-1 space-y-1 font-sans">
                          <div><strong>Nama Usaha:</strong> {extraInfo.nama_usaha || extraInfo.namaUsaha || 'Usaha Perdagangan / Jasa'}</div>
                          <div><strong>Bidang Usaha:</strong> {extraInfo.bidang_usaha || extraInfo.bidangUsaha || 'Perdagangan Eceran / Jasa Komunitas'}</div>
                          <div><strong>Lokasi Usaha:</strong> {extraInfo.lokasi_usaha || extraInfo.alamatUsaha || `RT ${printDoc.rt || '001'} / RW ${printDoc.rw || '001'}, Kelurahan ${displayedKelurahan}`}</div>
                        </div>
                        <p>
                          Surat Keterangan Usaha (SKU) ini diberikan atas permohonan yang bersangkutan untuk pemenuhan kelengkapan administrasi: <strong>{printDoc.keperluan}</strong>.
                        </p>
                      </>
                    ) : displayedJudulSurat.toLowerCase().includes('tidak mampu') || displayedJudulSurat.toLowerCase().includes('sktm') ? (
                      <>
                        <p>
                          Menerangkan bahwa keluarga yang bersangkutan benar bertempat tinggal di wilayah kerja kami dan terdaftar sebagai keluarga prasejahtera / berpenghasilan rendah berdasarkan pangkalan data kesejahteraan sosial daerah.
                        </p>
                        <p>
                          Surat Keterangan Tidak Mampu (SKTM) ini diterbitkan untuk pemenuhan persyaratan: <strong>{printDoc.keperluan}</strong>.
                        </p>
                      </>
                    ) : displayedJudulSurat.toLowerCase().includes('kematian') || displayedJudulSurat.toLowerCase().includes('meninggal') ? (
                      <>
                        <p>
                          Menerangkan dengan sebenarnya bahwa warga yang bersangkutan benar telah meninggal dunia di wilayah kami dan telah dicatatkan dalam pelaporan kematian rukun warga setempat untuk keperluan: <strong>{printDoc.keperluan}</strong>.
                        </p>
                      </>
                    ) : displayedJudulSurat.toLowerCase().includes('skck') || displayedJudulSurat.toLowerCase().includes('kelakuan baik') ? (
                      <>
                        <p>
                          Menerangkan bahwa yang bersangkutan selama berdomisili di lingkungan kami senantiasa berkelakuan baik, mematuhi tata tertib kemasyarakatan, serta tidak sedang tersangkut perkara pidana atau organisasi terlarang. Surat keterangan ini diterbitkan untuk pengurusan: <strong>{printDoc.keperluan}</strong>.
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          Menerangkan dengan sebenarnya bahwa orang tersebut di atas adalah benar bertempat tinggal dan berdomisili menetap di wilayah kerja Kelurahan {displayedKelurahan}, Kecamatan {displayedKecamatan}, {displayedKota}.
                        </p>
                        <p>
                          Surat keterangan ini diberikan atas permohonan yang bersangkutan setelah melalui verifikasi data dan pengantar berjenjang oleh Pengurus RT dan RW setempat untuk keperluan: <strong>{printDoc.keperluan}</strong>.
                        </p>
                      </>
                    )}

                    <p className="pt-2">
                      Demikian surat keterangan ini dibuat dengan sebenarnya dengan penuh rasa tanggung jawab agar dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.
                    </p>
                  </div>
                </div>

                {/* 4. TANDA TANGAN ELEKTRONIK (TTE LURAH SAH) & QR CODE SPBE */}
                <div className="mt-8 pt-4 flex flex-col sm:flex-row justify-between items-end gap-6 border-t border-slate-200">
                  {/* Sisi Kiri: QR Code Otentikasi Digital */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 border-2 border-slate-400 rounded-xl bg-slate-50 flex-shrink-0 shadow-sm">
                      <QrCode size={56} className="text-slate-900" />
                    </div>
                    <div className="text-[10px] text-slate-600 space-y-0.5">
                      <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600 inline" /> Dokumen Sah Ber-TTE
                      </p>
                      <p>Sistem Pemerintahan Berbasis Elektronik (SPBE)</p>
                      <p className="font-mono text-[9px] text-slate-500 truncate max-w-[200px]" title={printDoc.qr_code_hash}>
                        Hash: {printDoc.qr_code_hash ? `${printDoc.qr_code_hash.substring(0, 18)}...` : `BW-${printDoc.id}-${Date.now().toString(36)}`}
                      </p>
                      <p className="text-[9px] text-slate-400 italic">Pindai QR untuk verifikasi keaslian naskah</p>
                    </div>
                  </div>

                  {/* Sisi Kanan: Pejabat Penandatangan (Lurah) */}
                  <div className="text-right text-xs min-w-[220px]">
                    <p>{displayedTitimangsa}</p>
                    <p className="font-bold uppercase tracking-wide mt-0.5">
                      LURAH {displayedKelurahan.toUpperCase()}
                    </p>
                    
                    {/* Kotak Segel TTE Digital */}
                    <div className="my-2 py-1 px-3 border border-emerald-300 bg-emerald-50/80 rounded-md inline-block text-left shadow-xs">
                      <div className="text-[9px] font-bold text-emerald-800 flex items-center gap-1">
                        <span>&#10003; DITANDATANGANI SECARA ELEKTRONIK</span>
                      </div>
                      <div className="text-[8px] text-emerald-700 font-mono">
                        Sertifikat BSrE • BSSN Republik Indonesia
                      </div>
                    </div>

                    <p className="font-bold underline text-sm text-slate-950 mt-1">{displayedNamaLurah}</p>
                    <p className="text-[10px] text-slate-600 font-mono">NIP. {displayedNipLurah}</p>
                  </div>
                </div>

                {/* 5. CATATAN LEGALISASI & PENATAUSAHAAN LOKET PATEN KELURAHAN */}
                <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="font-semibold text-slate-700">Pelayanan Administrasi Terpadu Kelurahan (PATEN):</span> Diterbitkan & dicatat dalam Register Surat Keluar oleh Petugas: <strong>{user?.nama || 'Petugas PATEN Kelurahan'}</strong> ({user?.role === 'admin_kelurahan' ? 'Admin Kelurahan' : (user?.role || 'Operator')})
                  </div>
                  <div className="font-mono text-[9px] text-slate-400">
                    ID Reg: {printDoc.nomor_registrasi || `REG-${printDoc.id}`} • SPBE {displayedKota}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (HIDDEN WHEN PRINTING) */}
              <div className="flex justify-between items-center gap-3 pt-6 mt-6 border-slate-200 border-t no-print-zone">
                <div className="text-xs text-slate-500 hidden sm:block">
                  Tips: Pilih opsi <em>"Save as PDF"</em> pada dialog printer untuk menyimpan berkas surat digital resmi.
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors text-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors text-xs flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                  >
                    <Printer size={16} /> Cetak Salinan Resmi (Print / PDF)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 4: ZOOM PRATINJAU GAMBAR BERKAS DOKUMEN DIGITAL (KTP / KK / BERKAS) */}
      {/* ========================================================================= */}
      {previewZoomImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl p-2 border border-white/20">
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X size={20} />
            </button>
            <img 
              src={previewZoomImage} 
              alt="Pratinjau Dokumen Digital" 
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl mx-auto" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
