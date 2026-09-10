import { useState, useEffect } from 'react';
import { api } from '../utils/api';
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
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
        search: search.trim()
      });
      if (filterRT) params.append('rt', filterRT);

      const response = await api.get(`/warga?${params.toString()}`);
      if (response.success) {
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

  useEffect(() => {
    fetchWarga();
  }, [page, filterRT]);

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
    <div className="max-w-max-width mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface flex items-center gap-3">
            <Users className="text-primary" size={32} />
            Data Kependudukan Warga
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
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
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm shadow-sm"
            >
              <UserPlus size={16} /> Input Warga (Asistensi RT)
            </button>
          )}
        </div>
      </header>

      {/* ALERTS */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-error" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-on-error-container/70 hover:text-on-error-container">
              <X size={18} />
            </button>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-700" />
              <p className="text-sm font-semibold">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & SEARCH */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Cari berdasarkan NIK atau Nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <Filter size={16} /> Filter RT:
          </div>
          <select
            value={filterRT}
            onChange={(e) => {
              setFilterRT(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-medium"
          >
            <option value="">Semua RT (RW 001)</option>
            <option value="001">RT 001</option>
            <option value="002">RT 002</option>
            <option value="003">RT 003</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs uppercase font-bold text-on-surface-variant tracking-wider">
                <th className="p-4">Identitas Warga (NIK / KK)</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4 text-center">JK</th>
                <th className="p-4">Hub. Keluarga</th>
                <th className="p-4">Pekerjaan / Pendidikan</th>
                <th className="p-4">Alamat Domisili</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat data kependudukan...
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

      {/* MODAL 1: ASISTENSI RT INPUT WARGA */}
      {showAssistedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant w-full max-w-2xl p-6 my-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Asistensi RT: Input Data Warga</h3>
                  <p className="text-xs text-on-surface-variant">Bantu input warga yang memiliki halangan koneksi atau gawai.</p>
                </div>
              </div>
              <button onClick={() => setShowAssistedModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAssisted} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Nomor Induk Kependudukan (NIK) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={assistedForm.nik}
                    onChange={(e) => setAssistedForm({ ...assistedForm, nik: e.target.value })}
                    placeholder="16 digit NIK"
                    className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Nomor Kartu Keluarga (No KK) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={assistedForm.no_kk}
                    onChange={(e) => setAssistedForm({ ...assistedForm, no_kk: e.target.value })}
                    placeholder="16 digit No KK"
                    className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Nama Lengkap Sesuai KTP *</label>
                <input
                  type="text"
                  required
                  value={assistedForm.nama}
                  onChange={(e) => setAssistedForm({ ...assistedForm, nama: e.target.value })}
                  placeholder="Nama warga"
                  className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Jenis Kelamin *</label>
                  <select
                    value={assistedForm.jenis_kelamin}
                    onChange={(e) => setAssistedForm({ ...assistedForm, jenis_kelamin: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={assistedForm.tempat_lahir}
                    onChange={(e) => setAssistedForm({ ...assistedForm, tempat_lahir: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={assistedForm.tanggal_lahir}
                    onChange={(e) => setAssistedForm({ ...assistedForm, tanggal_lahir: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Status Hub. Keluarga *</label>
                  <select
                    value={assistedForm.status_hubungan_keluarga}
                    onChange={(e) => setAssistedForm({ ...assistedForm, status_hubungan_keluarga: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg"
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
                  <label className="block text-xs font-bold text-on-surface mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={assistedForm.pekerjaan}
                    onChange={(e) => setAssistedForm({ ...assistedForm, pekerjaan: e.target.value })}
                    placeholder="Contoh: Wiraswasta, Guru"
                    className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Pendidikan Terakhir</label>
                  <select
                    value={assistedForm.pendidikan_terakhir}
                    onChange={(e) => setAssistedForm({ ...assistedForm, pendidikan_terakhir: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg"
                  >
                    <option value="SD">SD/Sederajat</option>
                    <option value="SMP">SMP/Sederajat</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D3">Diploma (D3)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2/S3">Pascasarjana (S2/S3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface mb-1">Alamat Domisili *</label>
                  <input
                    type="text"
                    required
                    value={assistedForm.alamat}
                    onChange={(e) => setAssistedForm({ ...assistedForm, alamat: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">RT / RW</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={assistedForm.rt}
                      onChange={(e) => setAssistedForm({ ...assistedForm, rt: e.target.value })}
                      className="w-1/2 px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg text-center"
                    />
                    <input
                      type="text"
                      maxLength={3}
                      value={assistedForm.rw}
                      onChange={(e) => setAssistedForm({ ...assistedForm, rw: e.target.value })}
                      className="w-1/2 px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowAssistedModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAssisted}
                  className="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {submittingAssisted ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Data Warga'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: BULK IMPORT CSV */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant w-full max-w-2xl p-6 my-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Import Massal Sensus Warga (CSV)</h3>
                  <p className="text-xs text-on-surface-variant">Kelurahan Kebonjati - Upload data warga kolektif secara aman.</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>

            {/* Template Download Guide */}
            <div className="my-4 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-primary flex-shrink-0" />
                <div className="text-xs text-on-surface">
                  <span className="font-semibold">Perlu format file?</span> Unduh template CSV resmi untuk memastikan struktur kolom sesuai.
                </div>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-semibold text-xs rounded-lg hover:bg-primary/20 transition-colors flex-shrink-0"
              >
                <Download size={14} /> Unduh Template CSV
              </button>
            </div>

            {/* File Drop / Select Area */}
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center bg-surface-container-low/50 mb-4">
              <FileUp size={36} className="mx-auto text-outline mb-2" />
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

            {/* Preview First 5 Rows */}
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
