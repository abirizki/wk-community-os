import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Loader2, Users, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  UserPlus, 
  FileUp, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WargaList() {
  const { user } = useAuth();
  
  const canAssisted = user && ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'].includes(user.role);
  const canBulkImport = user && ['admin_kelurahan', 'superadmin', 'admin'].includes(user.role);

  const [wargaList, setWargaList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchWarga();
  }, []);
  // Search & Pagination
  const [search, setSearch] = useState('');
  const [filterRT, setFilterRT] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals
  const [showAssistedModal, setShowAssistedModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Assisted Form State
  const [submittingAssisted, setSubmittingAssisted] = useState(false);
  const [assistedForm, setAssistedForm] = useState({
    nik: '',
    no_kk: '',
    nama: '',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '',
    agama: 'Islam',
    status_perkawinan: 'Belum Kawin',
    status_hubungan_keluarga: 'Anak',
    pekerjaan: 'Belum Bekerja',
    pendidikan_terakhir: 'SMA/SMK',
    golongan_darah: 'Tidak Tahu',
    alamat: 'Jl. Kebonjati',
    rt: user?.rt || '001',
    rw: user?.rw || '001',
    no_telepon: ''
  });

  // Bulk Import State
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fetchWarga = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/warga');
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
        search: search.trim()
      });
      if (filterRT) params.append('rt', filterRT);

      const response = await api.get(`/warga?${params.toString()}`);
      if (response.success) {
        setWargaList(response.data);
        setWargaList(response.items || []);
        setTotalCount(response.total || 0);
      } else {
        setError('Gagal memuat data warga');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat data warga');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-on-surface-variant font-medium">Memuat data warga...</span>
      </div>
    );
  }
  useEffect(() => {
    fetchWarga();
  }, [page, filterRT]);

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-4 rounded-lg flex items-center gap-3">
        <AlertCircle size={24} />
        <p className="font-medium">{error}</p>
      </div>
    );
  }
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchWarga();
  };

  // Submit Asistensi RT
  const handleSubmitAssisted = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAssisted(true);
      setError('');
      const res = await api.post('/warga/assisted', assistedForm);
      setSuccessMsg(res.message || 'Warga berhasil didaftarkan melalui Asistensi RT!');
      setShowAssistedModal(false);
      setAssistedForm({
        nik: '',
        no_kk: '',
        nama: '',
        jenis_kelamin: 'L',
        tempat_lahir: 'Bandung',
        tanggal_lahir: '',
        agama: 'Islam',
        status_perkawinan: 'Belum Kawin',
        status_hubungan_keluarga: 'Anak',
        pekerjaan: 'Belum Bekerja',
        pendidikan_terakhir: 'SMA/SMK',
        golongan_darah: 'Tidak Tahu',
        alamat: 'Jl. Kebonjati',
        rt: user?.rt || '001',
        rw: user?.rw || '001',
        no_telepon: ''
      });
      fetchWarga();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan warga asistensi');
    } finally {
      setSubmittingAssisted(false);
    }
  };

  // CSV File Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text) => {
    try {
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim() !== '');
      if (lines.length < 2) {
        setError('File CSV kosong atau tidak memiliki baris data.');
        return;
      }

      // Deteksi delimiter (, atau ;)
      const headerLine = lines[0];
      const delimiter = headerLine.includes(';') ? ';' : ',';
      const headers = headerLine.split(delimiter).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));
        if (values.length < headers.length) continue;

        const row = {};
        headers.forEach((h, index) => {
          row[h] = values[index] || '';
        });
        rows.push(row);
      }

      setParsedRows(rows);
    } catch (err) {
      setError('Format CSV tidak valid: ' + err.message);
    }
  };

  // Eksekusi Bulk Import
  const handleExecuteBulkImport = async () => {
    if (parsedRows.length === 0) return;
    try {
      setImporting(true);
      setError('');
      const res = await api.post('/warga/bulk-import', { records: parsedRows });
      setImportResult(res.summary);
      setSuccessMsg(res.message);
      fetchWarga();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal melakukan import massal');
    } finally {
      setImporting(false);
    }
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const template = 'nik,no_kk,nama,jenis_kelamin,tempat_lahir,tanggal_lahir,agama,status_perkawinan,status_hubungan_keluarga,pekerjaan,pendidikan_terakhir,alamat,rt,rw,no_telepon\n3273010101900015,3273010101900001,Asep Gunawan,L,Bandung,1992-06-14,Islam,Kawin,Kepala Keluarga,Wiraswasta,S1,Jl. Kebonjati No. 15,001,001,081234567899\n3273014101920016,3273010101900001,Neni Suryani,P,Bandung,1994-08-20,Islam,Kawin,Istri,Guru,S1,Jl. Kebonjati No. 15,001,001,081234567888';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_sensus_warga_kebonjati.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
    <div className="max-w-max-width mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface flex items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface flex items-center gap-3">
            <Users className="text-primary" size={32} />
            Data Warga
            Data Kependudukan Warga
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Daftar seluruh warga yang terdaftar di sistem.
            Basis data demografi terpadu Kelurahan Kebonjati, Kec. Andir, Kota Bandung.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canBulkImport && (
            <button
              onClick={() => {
                setShowBulkModal(true);
                setImportResult(null);
                setParsedRows([]);
                setFileName('');
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-high text-on-surface rounded-xl font-semibold hover:bg-surface-container-highest transition-colors text-sm border border-outline-variant"
            >
              <FileUp size={16} /> Import Massal (CSV)
            </button>
          )}

          {canAssisted && (
            <button
              onClick={() => setShowAssistedModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold shadow-sm hover:bg-primary/90 transition-colors text-sm"
            >
              <UserPlus size={16} /> Pendaftaran Asistensi RT
            </button>
          )}
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden">
      {/* ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-3 text-sm font-medium"
          >
            <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
            {successMsg}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-3 text-sm font-medium"
          >
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan Nama, NIK, atau No KK..."
            className="w-full pl-9 pr-20 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90"
          >
            Cari
          </button>
        </form>

        {user?.role !== 'ketua_rt' && (
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-on-surface-variant" />
            <select
              value={filterRT}
              onChange={(e) => {
                setFilterRT(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Semua RT</option>
              <option value="001">RT 001</option>
              <option value="002">RT 002</option>
              <option value="003">RT 003</option>
            </select>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 text-label-sm font-semibold text-on-surface">NIK</th>
                <th className="p-4 text-label-sm font-semibold text-on-surface">No KK</th>
                <th className="p-4 text-label-sm font-semibold text-on-surface">Nama Lengkap</th>
                <th className="p-4 text-label-sm font-semibold text-on-surface">L/P</th>
                <th className="p-4 text-label-sm font-semibold text-on-surface">Alamat</th>
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface font-semibold">
              <tr>
                <th className="p-4">Identitas Warga (NIK / KK)</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4 text-center">JK</th>
                <th className="p-4">Hub. Keluarga</th>
                <th className="p-4">Pekerjaan / Pendidikan</th>
                <th className="p-4">Alamat Domisili</th>
              </tr>
            </thead>
            <tbody>
              {wargaList.length > 0 ? (
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat data warga...
                  </td>
                </tr>
              ) : wargaList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    Tidak ada data warga ditemukan.
                  </td>
                </tr>
              ) : (
                wargaList.map((warga) => (
                  <tr key={warga.nik} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-body-sm font-medium text-on-surface">{warga.nik}</td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{warga.no_kk}</td>
                    <td className="p-4 text-body-sm font-semibold text-on-surface">{warga.nama}</td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{warga.jenis_kelamin}</td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{warga.alamat}, RT {warga.rt}/RW {warga.rw}</td>
                  <tr key={warga.nik} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-medium text-on-surface">{warga.nik}</div>
                      <div className="text-xs text-on-surface-variant font-mono">KK: {warga.no_kk}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-on-surface">{warga.nama}</div>
                      <div className="text-xs text-on-surface-variant">
                        {warga.tempat_lahir}, {warga.tanggal_lahir ? new Date(warga.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        warga.jenis_kelamin === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {warga.jenis_kelamin}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-xs px-2 py-1 bg-surface-container-high rounded-md text-on-surface">
                        {warga.status_hubungan_keluarga || 'Anggota'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant">
                      <div className="font-medium text-on-surface">{warga.pekerjaan || '-'}</div>
                      <div>{warga.pendidikan_terakhir || '-'}</div>
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant">
                      <div>{warga.alamat}</div>
                      <div className="font-semibold text-on-surface">RT {warga.rt} / RW {warga.rw}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-on-surface-variant">
                    Tidak ada data warga.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
          <div>
            Menampilkan {wargaList.length} dari {totalCount} total warga terdaftar
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1.5 rounded border border-outline-variant font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold">Halaman {page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1.5 rounded border border-outline-variant font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL ASISTENSI RT/RW                                                 */}
      {/* ===================================================================== */}
      {showAssistedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <UserPlus className="text-primary" size={20} />
                  Pendaftaran Warga Terbantu (Asistensi RT)
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Input data warga yang terkendala akses internet atau tidak memiliki smartphone.
                </p>
              </div>
              <button
                onClick={() => setShowAssistedModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs flex items-start gap-2 mb-4">
              <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Akun portal digital warga akan <strong>dibuatkan secara otomatis</strong> dengan username berupa NIK dan password default <code>password123</code>.
              </span>
            </div>

            <form onSubmit={handleSubmitAssisted} className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nomor Induk Kependudukan (NIK)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={assistedForm.nik}
                    onChange={(e) => setAssistedForm({ ...assistedForm, nik: e.target.value })}
                    required
                    placeholder="16 digit angka"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nomor Kartu Keluarga (No KK)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={assistedForm.no_kk}
                    onChange={(e) => setAssistedForm({ ...assistedForm, no_kk: e.target.value })}
                    required
                    placeholder="16 digit angka"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Sesuai KTP</label>
                <input
                  type="text"
                  value={assistedForm.nama}
                  onChange={(e) => setAssistedForm({ ...assistedForm, nama: e.target.value })}
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={assistedForm.jenis_kelamin}
                    onChange={(e) => setAssistedForm({ ...assistedForm, jenis_kelamin: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={assistedForm.tempat_lahir}
                    onChange={(e) => setAssistedForm({ ...assistedForm, tempat_lahir: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={assistedForm.tanggal_lahir}
                    onChange={(e) => setAssistedForm({ ...assistedForm, tanggal_lahir: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Hubungan Dalam Keluarga</label>
                  <select
                    value={assistedForm.status_hubungan_keluarga}
                    onChange={(e) => setAssistedForm({ ...assistedForm, status_hubungan_keluarga: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Suami">Suami</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Famili Lain">Famili Lain</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Perkawinan</label>
                  <select
                    value={assistedForm.status_perkawinan}
                    onChange={(e) => setAssistedForm({ ...assistedForm, status_perkawinan: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={assistedForm.pekerjaan}
                    onChange={(e) => setAssistedForm({ ...assistedForm, pekerjaan: e.target.value })}
                    placeholder="Wiraswasta / Karyawan..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Pendidikan Terakhir</label>
                  <select
                    value={assistedForm.pendidikan_terakhir}
                    onChange={(e) => setAssistedForm({ ...assistedForm, pendidikan_terakhir: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="SD/Sederajat">SD/Sederajat</option>
                    <option value="SMP/Sederajat">SMP/Sederajat</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D3">Diploma (D3)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2)</option>
                    <option value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  value={assistedForm.alamat}
                  onChange={(e) => setAssistedForm({ ...assistedForm, alamat: e.target.value })}
                  placeholder="Jl. Kebonjati No. ..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">RT</label>
                  <input
                    type="text"
                    disabled={user?.role === 'ketua_rt'}
                    value={assistedForm.rt}
                    onChange={(e) => setAssistedForm({ ...assistedForm, rt: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-surface-container-high"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">RW</label>
                  <input
                    type="text"
                    disabled={user?.role === 'ketua_rt' || user?.role === 'ketua_rw'}
                    value={assistedForm.rw}
                    onChange={(e) => setAssistedForm({ ...assistedForm, rw: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-surface-container-high"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={assistedForm.no_telepon}
                    onChange={(e) => setAssistedForm({ ...assistedForm, no_telepon: e.target.value })}
                    placeholder="08..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowAssistedModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAssisted}
                  className="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {submittingAssisted ? <Loader2 size={16} className="animate-spin" /> : 'Daftarkan Warga'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL BULK IMPORT CSV                                                 */}
      {/* ===================================================================== */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-600" size={20} />
                  Import Massal Sensus Kependudukan (CSV / Excel)
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Unggah file CSV data sensus untuk mendaftarkan ratusan warga sekaligus secara instan.
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            {/* Template Download Guide */}
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between mb-4">
              <div className="text-xs">
                <span className="font-semibold block text-on-surface">Format Template CSV Standar</span>
                <span className="text-on-surface-variant">Gunakan template resmi untuk mencegah kegagalan kolom.</span>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                <Download size={14} /> Download Template
              </button>
            </div>

            {/* File Upload Drop Area */}
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:border-primary transition-colors bg-surface-container-low/30 mb-4">
              <FileUp className="mx-auto text-on-surface-variant mb-2" size={32} />
              <p className="text-sm font-semibold text-on-surface">Pilih file CSV data sensus warga</p>
              <p className="text-xs text-on-surface-variant mt-1">Mendukung file .csv (koma atau titik-koma)</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-3 block mx-auto text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary/90 cursor-pointer"
              />
              {fileName && (
                <p className="text-xs font-semibold text-emerald-600 mt-2">
                  File terpilih: {fileName} ({parsedRows.length} baris data terbaca)
                </p>
              )}
            </div>

            {/* Preview First 3 Rows */}
            {parsedRows.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Pratinjau Data Terbaca ({parsedRows.length} Total Data)
                </div>
                <div className="max-h-36 overflow-x-auto overflow-y-auto border border-outline-variant rounded-lg text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="p-2">NIK</th>
                        <th className="p-2">No KK</th>
                        <th className="p-2">Nama</th>
                        <th className="p-2">Hubungan</th>
                        <th className="p-2">RT/RW</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {parsedRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-mono">{row.nik}</td>
                          <td className="p-2 font-mono">{row.no_kk}</td>
                          <td className="p-2 font-semibold">{row.nama}</td>
                          <td className="p-2">{row.status_hubungan_keluarga || 'Anggota'}</td>
                          <td className="p-2">{row.rt || '001'} / {row.rw || '001'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 5 && (
                  <p className="text-[11px] text-on-surface-variant italic">
                    ...dan {parsedRows.length - 5} baris lainnya siap diimpor ke sistem.
                  </p>
                )}
              </div>
            )}

            {/* Import Result Summary */}
            {importResult && (
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant text-xs space-y-1 mb-4">
                <div className="font-bold text-on-surface">Ringkasan Eksekusi Import:</div>
                <div className="text-emerald-600 font-semibold">Berhasil diimpor: {importResult.imported} warga</div>
                <div className="text-amber-600">Dilewati / Duplikat: {importResult.skipped} baris</div>
                {importResult.errors?.length > 0 && (
                  <div className="text-rose-600 text-[11px] mt-1 max-h-20 overflow-y-auto">
                    {importResult.errors.map((err, i) => (
                      <div key={i}>&bull; {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors text-sm"
              >
                Tutup
              </button>
              {parsedRows.length > 0 && !importResult && (
                <button
                  type="button"
                  onClick={handleExecuteBulkImport}
                  disabled={importing}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm flex items-center gap-2"
                >
                  {importing ? <Loader2 size={16} className="animate-spin" /> : `Mulai Import (${parsedRows.length} Warga)`}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

