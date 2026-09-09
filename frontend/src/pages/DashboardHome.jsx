import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, HeartPulse, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  HeartPulse, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  MessageSquareWarning, 
  Activity,
  Landmark,
  UserCheck,
  TrendingUp
  Activity, 
  Landmark, 
  UserCheck, 
  TrendingUp, 
  FileCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pbb: { unpaidCount: 0, totalNominal: 0, latestPaid: null, latestUnpaid: null },
    posyandu: { totalRecords: 0, latestChild: null, latestDate: null },
    pengaduan: { total: 0, pending: 0, processing: 0, resolved: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [pbbRes, posyanduRes, pengaduanRes] = await Promise.allSettled([
          api.get('/pbb/me'),
          api.get('/posyandu/me'),
          api.get('/pengaduan/me')
        ]);

        const pbbData = pbbRes.status === 'fulfilled' && pbbRes.value?.data ? pbbRes.value.data : [];
        const posyanduData = posyanduRes.status === 'fulfilled' && posyanduRes.value?.data ? posyanduRes.value.data : [];
        const pengaduanData = pengaduanRes.status === 'fulfilled' && pengaduanRes.value?.data ? pengaduanRes.value.data : [];

        // Aggregate PBB
        const unpaidPbb = pbbData.filter(p => p.status_pembayaran === 'UNPAID');
        const paidPbb = pbbData.filter(p => p.status_pembayaran === 'PAID');
        const totalNominalUnpaid = unpaidPbb.reduce((sum, item) => sum + Number(item.nominal || 0), 0);

        // Aggregate Posyandu
        const latestExam = posyanduData.length > 0 ? posyanduData[0] : null;

        // Aggregate Pengaduan
        const pendingCount = pengaduanData.filter(a => a.status === 'PENDING').length;
        const processingCount = pengaduanData.filter(a => a.status === 'PROCESSING').length;
        const resolvedCount = pengaduanData.filter(a => a.status === 'RESOLVED').length;

        setStats({
          pbb: {
            unpaidCount: unpaidPbb.length,
            totalNominal: totalNominalUnpaid,
            latestPaid: paidPbb[0] || null,
            latestUnpaid: unpaidPbb[0] || null
          },
          posyandu: {
            totalRecords: posyanduData.length,
            latestChild: latestExam ? latestExam.nama_anak : null,
            latestDate: latestExam ? latestExam.tanggal_pemeriksaan : null
          },
          pengaduan: {
            total: pengaduanData.length,
            pending: pendingCount,
            processing: processingCount,
            resolved: resolvedCount
          }
        });
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-headline-lg-mobile lg:text-headline-lg font-bold text-on-surface">
          Selamat Datang, {user?.nik ? `Warga ${user.nik.slice(0,4)}...` : 'Warga'}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Pusat kendali layanan administrasi dan kependudukan Anda.
        </p>
      </header>
    <div className="max-w-max-width mx-auto space-y-8">
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-md"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-sm mb-3">
            <Landmark size={14} className="text-blue-300" />
            <span>Kelurahan Kebonjati · Kecamatan Andir</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Selamat Datang, {user?.nama || (user?.nik ? `Warga (${user.nik.slice(0, 6)}...)` : 'Warga')}
          </h1>
          <p className="text-white/70 text-sm sm:text-base mt-2 leading-relaxed">
            Pusat terpadu pelayanan administrasi kependudukan, pemantauan kesehatan keluarga, dan transparansi pembayaran pajak daerah.
          <p className="text-white/80 text-sm sm:text-base mt-2 leading-relaxed">
            Pusat terpadu pelayanan administrasi kependudukan, pengajuan surat kelurahan resmi, pemantauan kesehatan balita, dan transparansi retribusi PBB.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/60">
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/70">
            <span className="flex items-center gap-1.5"><UserCheck size={14} className="text-emerald-400" /> Akun Terverifikasi</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-400" /> Perlindungan Data Anti-IDOR</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* PBB Card */}
        <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant shadow-card flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <FileText size={20} />
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100">
                <FileText size={22} />
              </div>
              {stats.pbb.unpaidCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle size={13} /> {stats.pbb.unpaidCount} Belum Lunas
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={13} /> Seluruhnya Lunas
                </span>
              )}
            </div>
            <div>
              <h3 className="text-label-md font-bold text-on-surface">Status PBB</h3>
              <p className="text-[11px] text-on-surface-variant">Tahun Pajak 2026</p>
            <h3 className="text-base font-bold text-on-surface">Pajak Bumi & Bangunan</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Kewajiban retribusi PBB-P2</p>

            <div className="mt-4 pt-3 border-t border-outline-variant">
              {stats.pbb.unpaidCount > 0 ? (
                <div>
                  <p className="text-xs text-on-surface-variant">Total Tagihan Berjalan:</p>
                  <p className="text-xl font-extrabold text-rose-600 mt-0.5">{formatRupiah(stats.pbb.totalNominal)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-on-surface-variant">Status Terakhir:</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-0.5">Tidak ada tunggakan pajak</p>
                </div>
              )}
              <h3 className="text-base font-bold text-on-surface">Pajak Bumi & Bangunan</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Kewajiban retribusi PBB-P2</p>
              <div className="mt-4 pt-3 border-t border-outline-variant">
                {stats.pbb.unpaidCount > 0 ? (
                  <div>
                    <p className="text-xs text-on-surface-variant">Total Tagihan Berjalan:</p>
                    <p className="text-xl font-extrabold text-rose-600 mt-0.5">{formatRupiah(stats.pbb.totalNominal)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-on-surface-variant">Status Terakhir:</p>
                    <p className="text-sm font-semibold text-emerald-600 mt-0.5">Tidak ada tunggakan pajak</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-tertiary-fixed text-tertiary border border-tertiary/20">
              <ShieldCheck size={14} />
              Lunas
            </span>
          </div>
          <button className="mt-4 pt-4 border-t border-outline-variant text-label-sm font-semibold text-primary flex items-center justify-between group">
            Lihat Riwayat SPPT
            <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

          <Link 
            to="/dashboard/pbb" 
            className="mt-6 pt-4 border-t border-outline-variant text-xs font-semibold text-primary flex items-center justify-between group hover:text-primary/80 transition-colors"
          >
            Buka Rincian Tagihan
            <ArrowRight size={15} className="transform transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Posyandu Card */}
        <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant shadow-card flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <HeartPulse size={20} />
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
                <HeartPulse size={22} />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                <Activity size={13} /> Posyandu Melati
              </span>
            </div>
            <div>
              <h3 className="text-label-md font-bold text-on-surface">Jadwal Posyandu</h3>
              <p className="text-[11px] text-on-surface-variant">Bulan Ini</p>
            <h3 className="text-base font-bold text-on-surface">Kesehatan Anak (Posyandu)</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Pemantauan gizi & tumbuh kembang balita</p>

            <div className="mt-4 pt-3 border-t border-outline-variant">
              {stats.posyandu.latestChild ? (
                <div>
                  <p className="text-xs text-on-surface-variant">Pemeriksaan Terakhir:</p>
                  <p className="text-sm font-bold text-on-surface mt-0.5">{stats.posyandu.latestChild}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {stats.posyandu.latestDate ? new Date(stats.posyandu.latestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-on-surface-variant">Data Pemeriksaan:</p>
                  <p className="text-sm font-semibold text-on-surface-variant mt-0.5">Belum ada rekam medis terdaftar</p>
                </div>
              )}
              <h3 className="text-base font-bold text-on-surface">Kesehatan Anak (Posyandu)</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Pemantauan gizi & tumbuh kembang balita</p>
              <div className="mt-4 pt-3 border-t border-outline-variant">
                {stats.posyandu.latestChild ? (
                  <div>
                    <p className="text-xs text-on-surface-variant">Pemeriksaan Terakhir:</p>
                    <p className="text-sm font-bold text-on-surface mt-0.5">{stats.posyandu.latestChild}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {stats.posyandu.latestDate ? new Date(stats.posyandu.latestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-on-surface-variant">Data Pemeriksaan:</p>
                    <p className="text-sm font-semibold text-on-surface-variant mt-0.5">Belum ada rekam medis terdaftar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-body-lg font-bold text-on-surface">12 Oktober 2026</p>
            <p className="text-label-sm text-on-surface-variant">08:00 - 11:00 WIB di Balai Warga</p>

          <Link 
            to="/dashboard/posyandu" 
            className="mt-6 pt-4 border-t border-outline-variant text-xs font-semibold text-primary flex items-center justify-between group hover:text-primary/80 transition-colors"
          >
            Lihat Rekam Balita
            <ArrowRight size={15} className="transform transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Pengaduan Warga Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <MessageSquareWarning size={22} />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <TrendingUp size={13} /> Aspirasi Warga
                <Clock size={13} /> Respon Cepat
              </span>
            </div>
            <h3 className="text-base font-bold text-on-surface">Layanan Pengaduan</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Kanal aspirasi & fasilitas publik</p>

            <div className="mt-4 pt-3 border-t border-outline-variant grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Menunggu</p>
                <p className="text-base font-bold text-slate-800">{stats.pengaduan.pending}</p>
            <div>
              <h3 className="text-base font-bold text-on-surface">Layanan Pengaduan</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Aspirasi & keluhan fasilitas lingkungan</p>
              <div className="mt-4 pt-3 border-t border-outline-variant">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-outline-variant/60">
                    <p className="text-lg font-bold text-on-surface">{stats.pengaduan.total}</p>
                    <p className="text-[10px] text-on-surface-variant">Total</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/60">
                    <p className="text-lg font-bold text-amber-700">{stats.pengaduan.processing + stats.pengaduan.pending}</p>
                    <p className="text-[10px] text-amber-800">Diproses</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/60">
                    <p className="text-lg font-bold text-emerald-700">{stats.pengaduan.resolved}</p>
                    <p className="text-[10px] text-emerald-800">Selesai</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Diproses</p>
                <p className="text-base font-bold text-blue-800">{stats.pengaduan.processing}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Selesai</p>
                <p className="text-base font-bold text-emerald-800">{stats.pengaduan.resolved}</p>
              </div>
            </div>
          </div>
          <button className="mt-4 pt-4 border-t border-outline-variant text-label-sm font-semibold text-primary flex items-center justify-between group">
            Lihat Rekam Medis
            <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
          </button>

          <Link 
            to="/dashboard/pengaduan" 
            className="mt-6 pt-4 border-t border-outline-variant text-xs font-semibold text-primary flex items-center justify-between group hover:text-primary/80 transition-colors"
          >
            Buat & Pantau Aduan
            Buat Pengaduan Baru
            <ArrowRight size={15} className="transform transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* Fast Action Guidance */}
      {/* Layanan Mandiri Quick Navigation */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div>
            <h3 className="text-base font-bold text-on-surface">Pusat Layanan Kilat Kelurahan</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Akses cepat kebutuhan berkas dan administrasi kewilayahan.</p>
          </div>
          <span className="text-xs font-medium text-on-surface-variant bg-slate-100 px-3 py-1 rounded-full w-fit">
            Jam Layanan: 08:00 - 15:30 WIB
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <Link to="/dashboard/warga" className="p-4 rounded-xl border border-outline-variant hover:border-primary/40 hover:bg-slate-50/50 transition-all group">
            <p className="text-xs font-bold text-primary group-hover:underline">Biodata Kependudukan</p>
            <p className="text-[11px] text-on-surface-variant mt-1">Cek kevalidan NIK, Nomor KK, dan data kependudukan keluarga.</p>
        <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          Akses Cepat Layanan Mandiri
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <Link to="/dashboard/dokumen" className="p-4 rounded-xl border border-outline-variant hover:border-primary/40 hover:bg-slate-50/50 transition-all group">
            <p className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1.5">
              <FileCheck size={15} /> Pengajuan Dokumen
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">Permohonan Surat Domisili, KTP, SKTM, & SKU tanpa antre.</p>
          </Link>

          <Link to="/dashboard/pbb" className="p-4 rounded-xl border border-outline-variant hover:border-primary/40 hover:bg-slate-50/50 transition-all group">
            <p className="text-xs font-bold text-primary group-hover:underline">Simulasi Pembayaran PBB</p>
            <p className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1.5">
              <FileText size={15} /> Bayar Retribusi PBB
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">Pelunasan mandiri dengan tanda bukti elektronik terekam otomatis.</p>
          </Link>

          <Link to="/dashboard/posyandu" className="p-4 rounded-xl border border-outline-variant hover:border-primary/40 hover:bg-slate-50/50 transition-all group">
            <p className="text-xs font-bold text-primary group-hover:underline">Pencatatan Posyandu</p>
            <p className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1.5">
              <HeartPulse size={15} /> Pencatatan Posyandu
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">Input berkala rekam medis balita untuk pencegahan stunting dini.</p>
          </Link>

          <Link to="/dashboard/pengaduan" className="p-4 rounded-xl border border-outline-variant hover:border-primary/40 hover:bg-slate-50/50 transition-all group">
            <p className="text-xs font-bold text-primary group-hover:underline">Lapor Fasilitas Rusak</p>
            <p className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1.5">
              <MessageSquareWarning size={15} /> Lapor Fasilitas Rusak
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">Aduan langsung diteruskan ke petugas RT/RW dan satgas kelurahan.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

