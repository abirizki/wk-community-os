import React, { useState } from 'react';
import { 
  QrCode, 
  Search, 
  Upload, 
  Camera, 
  Users, 
  HeartHandshake, 
  FileText, 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Activity
} from 'lucide-react';

export default function ScannerPage() {
  const [activeMode, setActiveMode] = useState('loket'); // 'loket' | 'bansos' | 'posyandu'
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const MODES = [
    { id: 'loket', label: 'Loket Pelayanan', desc: 'Verifikasi surat, identitas 360, & pengajuan', icon: FileText, color: 'emerald' },
    { id: 'bansos', label: 'Penyaluran Bansos', desc: 'Validasi penerima PKH, BLT, & tiket QR', icon: HeartHandshake, color: 'amber' },
    { id: 'posyandu', label: 'Layanan Posyandu', desc: 'Catat balita, lansia, & status gizi', icon: Activity, color: 'blue' }
  ];

  const handleLookup = async (codeToLookup) => {
    const targetCode = codeToLookup || manualInput;
    if (!targetCode || !targetCode.trim()) {
      setError('Masukkan NIK, Nomor KK, Nomor Surat, atau pindai QR Code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/scanner/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: targetCode.trim(), mode: activeMode })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setScanResult(json);
      } else {
        setError(json.message || 'Data warga atau dokumen tidak ditemukan.');
        setScanResult(null);
      }
    } catch (err) {
      console.error('Scanner lookup error:', err);
      setError('Gagal memproses data pemindai. Pastikan server terhubung.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoNik) => {
    setManualInput(demoNik);
    handleLookup(demoNik);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
            <QrCode className="w-3.5 h-3.5" /> Universal Smart Citizen Pass Scanner
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Pemindai Terpadu & Digital Citizen Pass</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pindai QR Code Kartu Keluarga, KTP-el, atau Tiket Surat untuk verifikasi identitas 360 warga secara instan.
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
          <span className="text-xs font-medium text-slate-500">Uji Coba:</span>
          <button
            onClick={() => handleQuickDemo('3272030103810001')}
            className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg border border-slate-200 transition-colors shadow-xs"
          >
            Budi (Warga)
          </button>
          <button
            onClick={() => handleQuickDemo('3272030101700001')}
            className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg border border-slate-200 transition-colors shadow-xs"
          >
            RW 01 Sanusi
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-800'}`}>{m.label}</div>
                <div className={`text-xs mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scanner Input Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-600" /> Masukkan Identitas / Pindai QR Code
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="Ketik 16 Digit NIK, Nomor KK, Nomor Registrasi Surat, atau tempel QR Payload..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
            />
          </div>

          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Periksa Data
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 360 Citizen & Family Results */}
      {scanResult && scanResult.warga && (
        <div className="space-y-6">
          {/* Main Citizen Card */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-emerald-500/20">
                  {scanResult.warga.nama ? scanResult.warga.nama.charAt(0) : 'W'}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Dukcapil Cikole
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{scanResult.warga.nama}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                    <span>NIK: {scanResult.warga.nik}</span>
                    <span>&bull;</span>
                    <span>No KK: {scanResult.warga.no_kk || '-'}</span>
                    <span>&bull;</span>
                    <span className="capitalize">{scanResult.warga.status_hubungan_keluarga || 'Kepala Keluarga'}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Warga Aktif
                </span>
                <div className="text-xs text-slate-400 mt-1">RT {scanResult.warga.rt || '001'} / RW {scanResult.warga.rw || '001'} Kebonjati</div>
              </div>
            </div>

            {/* Grid 4 Information Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <div className="text-xs text-slate-400 font-medium">Tempat / Tanggal Lahir</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {scanResult.warga.tempat_lahir || 'Sukabumi'}, {scanResult.warga.tanggal_lahir || '-'}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <div className="text-xs text-slate-400 font-medium">Pekerjaan & Agama</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {scanResult.warga.pekerjaan || 'Wiraswasta'} &bull; {scanResult.warga.agama || 'Islam'}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <div className="text-xs text-slate-400 font-medium">BPJS Kesehatan</div>
                <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {scanResult.warga.bpjs_kesehatan_status || 'AKTIF'}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <div className="text-xs text-slate-400 font-medium">Kontak & Telepon</div>
                <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1 font-mono text-xs">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {scanResult.warga.no_telepon || '0812-3456-7890'}
                </div>
              </div>
            </div>

            {/* Quick Action Chips */}
            {Array.isArray(scanResult.quick_actions) && scanResult.quick_actions.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Aksi Cepat Layanan</h4>
                <div className="flex flex-wrap gap-2.5">
                  {scanResult.quick_actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => alert(`Aksi ${act.label} dipicu untuk NIK ${scanResult.warga.nik}`)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-semibold border border-slate-200 hover:border-emerald-300 transition-all shadow-xs"
                    >
                      <span>{act.icon || '⚡'}</span>
                      <span>{act.label}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Family Members Table (1 KK) */}
          {Array.isArray(scanResult.family_members) && scanResult.family_members.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Anggota Keluarga dalam 1 Kartu Keluarga ({scanResult.family_members.length} Jiwa)
                </h3>
                <span className="text-xs font-mono text-slate-500">No KK: {scanResult.warga.no_kk}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Nama Lengkap</th>
                      <th className="py-2.5 px-4 font-mono">NIK</th>
                      <th className="py-2.5 px-4">Hubungan</th>
                      <th className="py-2.5 px-4">Jenis Kelamin</th>
                      <th className="py-2.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {scanResult.family_members.map((fam) => (
                      <tr key={fam.id || fam.nik} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          {fam.nama}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{fam.nik}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {fam.status_hubungan_keluarga || fam.hubungan_keluarga || 'Anggota'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{fam.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleLookup(fam.nik)}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                          >
                            Pilih Profil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
