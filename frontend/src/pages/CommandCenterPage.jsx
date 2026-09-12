import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  MapPin,
  Clock,
  Filter,
  Eye,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function CommandCenterPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Data States
  const [commandData, setCommandData] = useState(null);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [activeTenant, setActiveTenant] = useState(null);

  // Filters
  const [selectedKecamatan, setSelectedKecamatan] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('stunting_desc'); // 'stunting_desc' | 'desil_desc' | 'maturity_asc' | 'sla_asc' | 'nama_asc'

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cmdRes, kecRes, tenantRes] = await Promise.allSettled([
        api.get('/wilayah/command-center'),
        api.get('/wilayah/kecamatan'),
        api.get('/wilayah/active-tenant')
      ]);

      if (cmdRes.status === 'fulfilled' && cmdRes.value?.data?.data) {
        setCommandData(cmdRes.value.data.data);
      }
      if (kecRes.status === 'fulfilled' && kecRes.value?.data?.data) {
        setKecamatanList(kecRes.value.data.data);
      }
      if (tenantRes.status === 'fulfilled' && tenantRes.value?.data?.active_tenant) {
        setActiveTenant(tenantRes.value.data.active_tenant);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat Command Center');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwitchTenant = async (kodeKelurahan) => {
    try {
      const res = await api.post('/wilayah/switch-tenant', { kode_kelurahan: kodeKelurahan });
      setActiveTenant(res.data.active_tenant);
      alert(res.data.message);
    } catch (err) {
      alert('Gagal beralih tenant: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResetTenant = async () => {
    try {
      await api.post('/wilayah/switch-tenant', { kode_kelurahan: null });
      setActiveTenant(null);
      alert('Tampilan kembali ke perspektif makro Kota Sukabumi.');
    } catch (err) {
      alert('Gagal mereset tenant: ' + err.message);
    }
  };

  // Filter & Sort Heatmap
  const filteredKelurahan = (commandData?.heatmap || [])
    .filter(k => {
      const matchKec = selectedKecamatan ? k.kode_kecamatan === selectedKecamatan : true;
      const matchQuery = k.nama_kelurahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.nama_kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (k.nama_lurah && k.nama_lurah.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchKec && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'stunting_desc') return b.metrics.kasus_stunting - a.metrics.kasus_stunting;
      if (sortBy === 'desil_desc') return b.metrics.kemiskinan_ekstrem_desil_1_2 - a.metrics.kemiskinan_ekstrem_desil_1_2;
      if (sortBy === 'maturity_asc') return a.metrics.indeks_kematangan_data - b.metrics.indeks_kematangan_data;
      if (sortBy === 'sla_asc') return a.metrics.sla_proses_surat_jam - b.metrics.sla_proses_surat_jam;
      return a.nama_kelurahan.localeCompare(b.nama_kelurahan);
    });

  const isExecutiveUser = ['superadmin', 'walikota', 'camat'].includes(user?.role);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner Command Center */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-primary/80 text-white p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold tracking-wide rounded-full bg-white/20 text-white uppercase backdrop-blur-xs flex items-center gap-1.5">
                <Landmark size={14} />
                <span>Sprint 9 Multi-Tenancy Sukabumi</span>
              </span>
              <span className="text-xs text-white/80">Kode Wilayah 32.72</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Executive Command Center Walikota Sukabumi
            </h1>
            <p className="text-xs md:text-sm text-white/80 mt-1 max-w-2xl">
              Pusat kendali komparasi spasial 33 Kelurahan di 7 Kecamatan se-Kota Sukabumi: Pengawasan stunting balita, kemiskinan ekstrem, kecepatan surat (SLA), dan kesiapan data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTenant && (
              <button
                onClick={handleResetTenant}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw size={14} />
                <span>Reset ke Makro Kota</span>
              </button>
            )}

            <button
              onClick={() => { setRefreshing(true); fetchData(); }}
              disabled={refreshing || loading}
              className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition flex items-center gap-2 text-xs font-bold text-white shadow-xs backdrop-blur-xs"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Segarkan Heatmap</span>
            </button>
          </div>
        </div>

        {/* Active Tenant Context Banner */}
        {activeTenant && (
          <div className="mt-4 p-3 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Perspektif Tenant Aktif:</span>
              <span className="font-extrabold text-amber-300">
                Kelurahan {activeTenant.nama_kelurahan} (Kec. {activeTenant.nama_kecamatan})
              </span>
              <span className="font-mono text-white/70">[{activeTenant.kode_kelurahan}]</span>
            </div>
            <span className="text-[11px] text-white/70">Row-level scoping aktif</span>
          </div>
        )}

        {/* Macro City KPIs */}
        {commandData?.kota && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-white/70">Total Penduduk</span>
              <div className="text-xl md:text-2xl font-black mt-1">
                {commandData.kota.kpi_agregat.total_penduduk.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-white/60">33 Kelurahan</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-white/70">Total Kepala Keluarga</span>
              <div className="text-xl md:text-2xl font-black mt-1">
                {commandData.kota.kpi_agregat.total_kk.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-white/60">KK Terdata</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-white/70">Kasus Stunting Kota</span>
              <div className="text-xl md:text-2xl font-black text-rose-300 mt-1">
                {commandData.kota.kpi_agregat.total_kasus_stunting}
              </div>
              <span className="text-[10px] text-rose-200">Balita Gizi Kurang</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-white/70">Kemiskinan Ekstrem</span>
              <div className="text-xl md:text-2xl font-black text-amber-300 mt-1">
                {commandData.kota.kpi_agregat.total_keluarga_desil_1_2}
              </div>
              <span className="text-[10px] text-amber-200">Keluarga Desil 1–2</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-white/70">Rata-rata SLA Surat</span>
              <div className="text-xl md:text-2xl font-black text-emerald-300 mt-1">
                {commandData.kota.kpi_agregat.rata_rata_sla_jam} Jam
              </div>
              <span className="text-[10px] text-emerald-200">Verifikasi & Pengesahan</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-white/70">Kematangan Data</span>
              <div className="text-xl md:text-2xl font-black text-blue-300 mt-1">
                {commandData.kota.kpi_agregat.rata_rata_kematangan_data}%
              </div>
              <span className="text-[10px] text-blue-200">Data Maturity Index</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-surface rounded-2xl p-4 border border-outline-variant/60 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Kecamatan Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedKecamatan('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedKecamatan === ''
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Semua (33 Kelurahan)
          </button>
          {kecamatanList.map(kec => (
            <button
              key={kec.kode_kecamatan}
              onClick={() => setSelectedKecamatan(kec.kode_kecamatan)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedKecamatan === kec.kode_kecamatan
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {kec.nama_kecamatan}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Cari kelurahan/lurah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-surface-container-low border border-outline-variant focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-xl bg-surface-container-low border border-outline-variant focus:outline-none focus:border-primary shrink-0"
          >
            <option value="stunting_desc">Urutkan: Stunting Tertinggi</option>
            <option value="desil_desc">Urutkan: Desil 1-2 Terbanyak</option>
            <option value="maturity_asc">Urutkan: Kematangan Data Terendah</option>
            <option value="sla_asc">Urutkan: SLA Surat Tercepat</option>
            <option value="nama_asc">Urutkan: Nama Kelurahan A-Z</option>
          </select>
        </div>
      </div>

      {/* Heatmap & Comparison Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-outline-variant/60 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-on-surface">Matriks Komparasi 33 Kelurahan Kota Sukabumi</h3>
            <p className="text-xs text-on-surface-variant">
              Menampilkan {filteredKelurahan.length} kelurahan {selectedKecamatan ? `di Kecamatan terpilih` : 'se-Kota Sukabumi'}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
            Multi-Tenant Scoped
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant/60">
              <tr>
                <th className="py-3.5 px-4">Kelurahan & Kode</th>
                <th className="py-3.5 px-4">Kecamatan</th>
                <th className="py-3.5 px-4 text-center">Penduduk & KK</th>
                <th className="py-3.5 px-4 text-center">Stunting Balita</th>
                <th className="py-3.5 px-4 text-center">Desil 1–2</th>
                <th className="py-3.5 px-4 text-center">SLA Layanan Surat</th>
                <th className="py-3.5 px-4 text-center">Kematangan Data</th>
                <th className="py-3.5 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-on-surface">
              {filteredKelurahan.map((kel) => (
                <tr key={kel.kode_kelurahan} className={`hover:bg-surface-container-lowest transition ${
                  activeTenant?.kode_kelurahan === kel.kode_kelurahan ? 'bg-primary/5' : ''
                }`}>
                  <td className="py-3.5 px-4">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{kel.nama_kelurahan}</span>
                      {kel.is_pilot_hub && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Pilot Hub
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-on-surface-variant font-mono">
                      {kel.kode_kelurahan} • {kel.nama_lurah || '-'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold px-2 py-0.5 rounded bg-surface-container-high">
                      {kel.nama_kecamatan}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="font-bold">{kel.metrics.total_warga.toLocaleString('id-ID')} jiwa</div>
                    <div className="text-[11px] text-on-surface-variant">{kel.metrics.total_kk} KK ({kel.jumlah_rw} RW/{kel.jumlah_rt} RT)</div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 font-black px-2.5 py-0.5 rounded-full ${
                      kel.metrics.stunting_color === 'rose'
                        ? 'bg-rose-100 text-rose-800'
                        : kel.metrics.stunting_color === 'amber'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {kel.metrics.kasus_stunting} kasus
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-amber-700">
                    {kel.metrics.kemiskinan_ekstrem_desil_1_2} KK
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      kel.metrics.sla_color === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : kel.metrics.sla_color === 'blue'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {kel.metrics.sla_proses_surat_jam} jam
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="font-black text-primary">{kel.metrics.indeks_kematangan_data}%</div>
                    <div className="w-16 bg-surface-container-high h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${kel.metrics.indeks_kematangan_data}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {isExecutiveUser && (
                      <button
                        onClick={() => handleSwitchTenant(kel.kode_kelurahan)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 mx-auto shadow-2xs ${
                          activeTenant?.kode_kelurahan === kel.kode_kelurahan
                            ? 'bg-emerald-600 text-white'
                            : 'bg-surface-container-low hover:bg-primary hover:text-on-primary text-on-surface'
                        }`}
                      >
                        <Eye size={13} />
                        <span>{activeTenant?.kode_kelurahan === kel.kode_kelurahan ? 'Sedang Aktif' : 'Simulasi'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

