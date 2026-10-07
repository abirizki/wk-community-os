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
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Print Preview Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDoc, setPrintDoc] = useState(null);

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

  // Open Print Modal
  const handlePrint = (doc) => {
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

        <button
            onClick={() => {
              setSubjekPemohon('self');
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>Ajukan Surat Baru (Mandiri)</span>
          </button>
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
            onClick={() => setActiveTab('my_docs')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'my_docs'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <User size={16} />
            <span>Surat Mandiri Saya & KK ({myDocs.length})</span>
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
            <span>Semua Dokumen Wilayah ({data.length})</span>
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
              {/* 1. SELEKSI SUBJEK PEMOHON (DIRI SENDIRI VS ANGGOTA KELUARGA 1 KK) */}
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
      {/* MODAL 3: PREVIEW CETAK SURAT RESMI (KOP RESMI KELURAHAN KEBONJATI SUKABUMI) */}
      {/* ========================================================================= */}
      {showPrintModal && printDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl my-8 border border-slate-300"
          >
            {/* Kop Surat Kelurahan Kebonjati, Cikole, Kota Sukabumi */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Pemerintah Kota Sukabumi</h3>
              <h2 className="text-lg font-extrabold uppercase tracking-wide">Kecamatan Cikole &bull; Kelurahan Kebonjati</h2>
              <p className="text-xs text-slate-600 mt-1">
                Jl. Surya Kencana No. 42, Kebonjati, Kec. Cikole, Kota Sukabumi, Jawa Barat 43111
              </p>
            </div>

            {/* Nomor & Judul Surat */}
            <div className="text-center mb-6">
              <h4 className="text-base font-bold underline uppercase tracking-wider">
                {printDoc.jenis_dokumen || printDoc.jenis_surat}
              </h4>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Nomor: {printDoc.nomor_surat || printDoc.nomor_registrasi || `470/${printDoc.id}/Ktr.Kbjt-Ckl/${new Date().getFullYear()}`}
              </p>
            </div>

            {/* Isi Surat */}
            <div className="space-y-3 text-sm leading-relaxed text-slate-800">
              <p>
                Yang bertanda tangan di bawah ini, Kepala Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi, menerangkan dengan sebenarnya bahwa:
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
                  <span className="col-span-2">: RT {printDoc.rt || '001'} / RW {printDoc.rw || '001'}, Kelurahan Kebonjati, Kec. Cikole</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Keperluan</span>
                  <span className="col-span-2 font-medium">: {printDoc.keperluan}</span>
                </div>
              </div>
              <p className="pt-2">
                Surat keterangan ini diberikan atas permohonan yang bersangkutan setelah melalui verifikasi data dan berkas digital berjenjang oleh Pengurus RT dan RW setempat.
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
                <p>Sukabumi, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                <p className="font-bold mt-1">Lurah Kebonjati</p>
                <div className="h-12 flex items-center justify-end">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    [SIGNED DIGITALLY]
                  </span>
                </div>
                <p className="font-bold underline text-sm">Drs. H. Maman Suryaman, M.Si</p>
                <p className="text-[10px] text-slate-500">NIP. 19740512 199903 1 004</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 mt-6 border-slate-200 border-t">
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
