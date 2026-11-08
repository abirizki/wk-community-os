import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Baby,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  HeartPulse,
  Layers3,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const numberFormat = new Intl.NumberFormat('id-ID');
const tabs = [
  { id: 'ringkasan', label: 'Ringkasan', icon: BarChart3 },
  { id: 'penduduk', label: 'Penduduk & layanan', icon: Users },
  { id: 'wilayah', label: 'Perbandingan wilayah', icon: MapPin },
  { id: 'strategi', label: 'Strategi & prioritas', icon: Activity },
];
const periods = [
  { id: '7d', label: '7 hari' },
  { id: '30d', label: '30 hari' },
  { id: 'q', label: '90 hari' },
  { id: 'ytd', label: 'Tahun berjalan' },
];

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? numberFormat.format(parsed) : '—';
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '—';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? `${numberFormat.format(parsed)}%` : '—';
}

function Panel({ children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white ${className}`}>{children}</section>;
}

function MetricCard({ label, value, detail, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    teal: 'bg-teal-50 text-teal-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={18} />
        </span>
      </div>
    </Panel>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">{eyebrow}</p>}
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center">
      <AlertCircle size={20} className="text-slate-400" />
      <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{message}</p>
    </div>
  );
}

function SourceStatus({ source, loading, label }) {
  if (loading) {
    return <p className="text-xs text-slate-500">Memuat {label.toLowerCase()}…</p>;
  }
  if (source?.error) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900" role="status">
        <AlertCircle size={15} className="mt-0.5 shrink-0" />
        <span>{label} tidak tersedia: {source.error}</span>
      </div>
    );
  }
  return null;
}

function SeverityTag({ severity }) {
  const normalized = String(severity || 'INFO').toUpperCase();
  const styles = normalized === 'CRITICAL'
    ? 'bg-rose-50 text-rose-800'
    : normalized === 'WARNING'
      ? 'bg-amber-50 text-amber-800'
      : 'bg-blue-50 text-blue-800';

  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>{normalized}</span>;
}

function formatScopeLabel(user, selectedRW, selectedRT, isRT, isRW) {
  const area = user?.kelurahan || 'Wilayah tugas';
  if (isRT) return `${area} · RW ${user?.rw || '—'} / RT ${user?.rt || '—'}`;
  if (isRW) return `${area} · RW ${user?.rw || '—'}${selectedRT !== 'all' ? ` / RT ${selectedRT}` : ''}`;
  const rwLabel = selectedRW === 'all' ? 'semua RW' : `RW ${selectedRW}`;
  return `${area} · ${rwLabel}${selectedRT !== 'all' ? ` / RT ${selectedRT}` : ''}`;
}

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [selectedRW, setSelectedRW] = useState(user?.rw || 'all');
  const [selectedRT, setSelectedRT] = useState(user?.role === 'ketua_rt' ? user.rt : 'all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionsMap, setActionsMap] = useState({});
  const [actionFilter, setActionFilter] = useState('all');
  const [updatingActionId, setUpdatingActionId] = useState(null);
  const [sources, setSources] = useState({
    summary: null,
    demographics: null,
    documents: null,
    desil: null,
  });

  const isRT = user?.role === 'ketua_rt';
  const isRW = ['ketua_rw', 'admin_rw'].includes(user?.role);
  const lockedRW = isRT || isRW;
  const effectiveRW = lockedRW ? (user?.rw || 'all') : selectedRW;
  const effectiveRT = isRT ? (user?.rt || 'all') : selectedRT;

  useEffect(() => {
    if (user?.rw && selectedRW === 'all' && lockedRW) setSelectedRW(user.rw);
    if (isRT && user?.rt) setSelectedRT(user.rt);
  }, [user?.rw, user?.rt, lockedRW, isRT, selectedRW]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      rw: effectiveRW,
      rt: effectiveRT,
      period: selectedPeriod,
    });

    setLoading(true);
    Promise.allSettled([
      api.get(`/analytics/executive-summary?${params}`),
      api.get(`/analytics/demografi?${params}`),
      api.get(`/analytics/dokumen?${params}`),
      api.get(`/desil/stats?${params}`),
      api.get(`/analytics/actions?${params}`),
    ]).then((results) => {
      if (!active) return;
      const keys = ['summary', 'demographics', 'documents', 'desil'];
      if (results[4] && results[4].status === 'fulfilled' && results[4].value?.data) {
        const map = {};
        (results[4].value.data || []).forEach(item => {
          if (item.insight_id) map[item.insight_id] = item;
        });
        setActionsMap(map);
      }
      const nextSources = {};

      results.forEach((result, index) => {
        const key = keys[index];
        if (result.status === 'fulfilled' && result.value?.success) {
          nextSources[key] = { data: result.value.data, error: null };
        } else {
          const error = result.status === 'rejected'
            ? result.reason?.message
            : result.value?.message;
          nextSources[key] = {
            data: null,
            error: error || 'Respons data tidak valid.',
          };
        }
      });

      setSources(nextSources);
      setLoading(false);
    }).catch((error) => {
      if (!active) return;
      setSources({
        summary: { data: null, error: error.message || 'Gagal memuat ringkasan.' },
        demographics: null,
        documents: null,
        desil: null,
      });
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [effectiveRW, effectiveRT, selectedPeriod, refreshVersion]);

  const summary = sources.summary?.data;
  const demographics = sources.demographics?.data;
  const documents = sources.documents?.data;
  const desil = sources.desil?.data;
  const kpi = summary?.kpi;
  const population = kpi?.demography;
  const docPipeline = documents?.pipeline;
  const vulnerableHouseholds = Number(desil?.desil_1 || 0) + Number(desil?.desil_2 || 0);

  const comparisonRows = useMemo(() => {
    const rowsByKey = new Map();
    const getRow = (rw, rt) => {
      const key = `${rw || '—'}-${rt || '—'}`;
      if (!rowsByKey.has(key)) {
        rowsByKey.set(key, {
          key,
          rw,
          rt,
          penduduk: 0,
          balita: 0,
          lansia: 0,
          desilRentan: 0,
          kasusGizi: 0,
          suratProses: 0,
          pengaduanTerbuka: 0,
          pbb: null,
        });
      }
      return rowsByKey.get(key);
    };

    demographics?.spatial_heatmap?.forEach((item) => {
      const row = getRow(item.rw, item.rt);
      row.penduduk = Number(item.total_warga || 0);
      row.balita = Number(item.balita || 0);
      row.lansia = Number(item.lansia || 0);
      row.desilRentan = Number(item.desil_rentan_kk || 0);
      row.pbb = item.pbb_kepatuhan_persen;
    });

    summary?.rt_risk_matrix?.forEach((item) => {
      const row = getRow(item.rw, item.rt);
      row.kasusGizi = Number(item.stunting?.kasus_rawan || 0);
      row.pengaduanTerbuka = Number(item.pengaduan?.belum_selesai || 0);
    });

    documents?.by_rt?.forEach((item) => {
      const row = getRow(item.rw, item.rt);
      row.suratProses = Number(item.dalam_proses || 0);
    });

    return [...rowsByKey.values()].sort((a, b) => (
      String(a.rw).localeCompare(String(b.rw)) || String(a.rt).localeCompare(String(b.rt))
    ));
  }, [demographics, documents, summary]);

  const ageRows = useMemo(() => {
    if (!population) return [];
    return [
      { kelompok: 'Balita 0–4', jumlah: Number(population.total_balita || 0) },
      { kelompok: 'Anak 5–17', jumlah: Number(population.total_anak || 0) },
      { kelompok: 'Produktif 18–59', jumlah: Number(population.total_produktif || 0) },
      { kelompok: 'Lansia 60+', jumlah: Number(population.total_lansia || 0) },
    ];
  }, [population]);

  const areaLabel = formatScopeLabel(user, effectiveRW, effectiveRT, isRT, isRW);
  const lastUpdated = summary?.timestamp ? new Date(summary.timestamp).toLocaleString('id-ID') : null;
  const hasSourceError = Object.values(sources).some((source) => source?.error);

  const renderTopFilters = () => (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-slate-500" htmlFor="analytics-rw">Cakupan</label>
        <select
          id="analytics-rw"
          value={effectiveRW}
          disabled={lockedRW}
          onChange={(event) => {
            setSelectedRW(event.target.value);
            setSelectedRT('all');
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 disabled:bg-slate-50"
        >
          <option value="all">Semua RW</option>
          {(demographics?.rw_options || []).map((rw) => <option key={rw} value={rw}>RW {rw}</option>)}
        </select>
        <label className="sr-only" htmlFor="analytics-rt">Filter RT</label>
        <select
          id="analytics-rt"
          value={effectiveRT}
          disabled={isRT}
          onChange={(event) => setSelectedRT(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 disabled:bg-slate-50"
        >
          <option value="all">Semua RT</option>
          {(demographics?.rt_options || []).map((rt) => <option key={rt} value={rt}>RT {rt}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-slate-500">Periode layanan</span>
        {periods.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => setSelectedPeriod(period.id)}
            aria-pressed={selectedPeriod === period.id}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              selectedPeriod === period.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {period.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRefreshVersion((version) => version + 1)}
          disabled={loading}
          className="ml-1 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Perbarui
        </button>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      {hasSourceError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status">
          Sebagian sumber data belum tersedia. Panel yang gagal dimuat ditandai, dan nilainya tidak diganti dengan angka nol.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Penduduk aktif"
          value={formatNumber(population?.total_warga_aktif)}
          detail={`${formatNumber(population?.total_laki)} laki-laki · ${formatNumber(population?.total_perempuan)} perempuan`}
          icon={Users}
          tone="blue"
        />
        <MetricCard
          label="Kepala keluarga"
          value={formatNumber(population?.total_kk)}
          detail={`${formatNumber(population?.status_tetap)} penduduk berstatus tetap`}
          icon={Layers3}
          tone="teal"
        />
        <MetricCard
          label="Surat dalam proses"
          value={formatNumber(docPipeline ? Number(docPipeline.pending_rt || 0) + Number(docPipeline.pending_rw || 0) + Number(docPipeline.pending_kelurahan || 0) : null)}
          detail={`${formatNumber(docPipeline?.total_pengajuan)} pengajuan pada ${selectedPeriod === 'ytd' ? 'tahun berjalan' : `periode ${periods.find(p => p.id === selectedPeriod)?.label || ''}`}`}
          icon={FileCheck2}
          tone="amber"
        />
        <MetricCard
          label="Keluarga Desil 1–2"
          value={desil ? formatNumber(vulnerableHouseholds) : '—'}
          detail={desil ? `${formatPercent(desil.total_kk > 0 ? Math.round((vulnerableHouseholds / Number(desil.total_kk)) * 100) : 0)} dari KK terdata` : 'Statistik desil belum tersedia'}
          icon={HeartPulse}
          tone="rose"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel className="p-4 sm:p-5">
          <SectionHeading
            eyebrow="Profil kependudukan"
            title="Struktur usia warga"
            description="Jumlah warga aktif per kelompok usia. Gunakan untuk membaca kebutuhan layanan lintas siklus hidup."
          />
          <SourceStatus source={sources.summary} loading={loading && !summary} label="Profil penduduk" />
          {ageRows.length ? (
            <div className="mt-5 h-64" role="img" aria-label="Grafik jumlah penduduk berdasarkan kelompok usia">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageRows} margin={{ top: 8, right: 12, left: -18, bottom: 8 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="kelompok" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip formatter={(value) => [formatNumber(value), 'Penduduk']} />
                  <Bar dataKey="jumlah" name="Penduduk" fill="#2563eb" radius={[5, 5, 0, 0]} maxBarSize={54} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-5"><EmptyState title="Profil penduduk belum tersedia" message="Periksa status sumber analitik atau pilih cakupan yang memiliki data." /></div>
          )}
        </Panel>

        <Panel className="p-4 sm:p-5">
          <SectionHeading
            eyebrow="Pemantauan layanan"
            title="Snapshot lintas sektor"
            description="Indikator operasional yang dapat membantu menentukan tindak lanjut awal."
          />
          <div className="mt-4 divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-teal-50 p-2 text-teal-700"><Baby size={17} /></span>
                <div><p className="text-sm font-medium text-slate-800">Balita terdata</p><p className="text-xs text-slate-500">Sasaran siklus hidup</p></div>
              </div>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(population?.total_balita)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-violet-50 p-2 text-violet-700"><HeartPulse size={17} /></span>
                <div><p className="text-sm font-medium text-slate-800">Lansia terdata</p><p className="text-xs text-slate-500">Usia 60 tahun ke atas</p></div>
              </div>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(population?.total_lansia)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-amber-50 p-2 text-amber-700"><ClipboardList size={17} /></span>
                <div><p className="text-sm font-medium text-slate-800">Verifikasi desil</p><p className="text-xs text-slate-500">Terdata / seluruh KK</p></div>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {desil ? `${formatNumber(desil.terdata_desil)} / ${formatNumber(desil.total_kk)}` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-50 p-2 text-blue-700"><CheckCircle2 size={17} /></span>
                <div><p className="text-sm font-medium text-slate-800">Surat diselesaikan</p><p className="text-xs text-slate-500">Dalam periode terpilih</p></div>
              </div>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(docPipeline?.step_selesai)}</span>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="p-4 sm:p-5">
        <SectionHeading
          eyebrow="Keputusan berbasis bukti"
          title="Prioritas yang memerlukan perhatian"
          description="Sinyal berasal dari aturan analitik yang dapat dijelaskan. Validasi data lapangan sebelum menetapkan bantuan atau intervensi."
          action={<button onClick={() => setActiveTab('strategi')} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">Lihat strategi <ChevronRight size={14} /></button>}
        />
        <SourceStatus source={sources.summary} loading={loading && !summary} label="Analisis strategi" />
        {summary?.ai_insights?.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {summary.ai_insights.slice(0, 4).map((insight) => (
              <article key={insight.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold leading-5 text-slate-900">{insight.title}</h3>
                  <SeverityTag severity={insight.severity} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{insight.summary}</p>
              </article>
            ))}
          </div>
        ) : !loading && !sources.summary?.error ? (
          <div className="mt-4"><EmptyState title="Belum ada prioritas berbasis bukti" message="Tidak ada rule yang terpicu pada cakupan ini, atau data belum cukup untuk menyusun sinyal." /></div>
        ) : null}
      </Panel>
    </div>
  );

  const renderPopulation = () => {
    const coverage = kpi?.daya_dukung?.kesehatan;
    const education = kpi?.daya_dukung?.pendidikan;
    const economy = kpi?.daya_dukung?.ekonomi;
    const maturity = kpi?.data_maturity;
    const educationInstitutions = education?.cohorts?.reduce(
      (total, cohort) => total + Number(cohort.institusi || 0),
      0
    );
    const newEducationSeats = education?.cohorts?.reduce(
      (total, cohort) => total + Number(cohort.kursi_baru || 0),
      0
    );
    const approvedBansos = summary?.rt_risk_matrix?.reduce(
      (total, item) => total + Number(item.bansos?.disahkan || 0),
      0
    );

    return (
      <div className="space-y-5">
        <Panel className="p-4 sm:p-5">
          <SectionHeading
            eyebrow="Penduduk dibanding kebutuhan layanan"
            title="Kohort warga dan kapasitas layanan"
            description="Baca jumlah kelompok sasaran bersama kapasitas layanan yang tersedia. Nilai kapasitas tidak tersedia ditampilkan sebagai kosong, bukan dianggap tidak ada layanan."
          />
          <SourceStatus source={sources.summary} loading={loading && !summary} label="Ringkasan lintas sektor" />
          {kpi ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Balita" value={formatNumber(population?.total_balita)} detail="Penduduk usia 0–4 tahun" icon={Baby} tone="teal" />
              <MetricCard label="Lansia" value={formatNumber(population?.total_lansia)} detail="Penduduk usia 60 tahun ke atas" icon={HeartPulse} tone="rose" />
              <MetricCard label="Posyandu" value={formatNumber(coverage?.dukungan_layanan?.total_posyandu)} detail="Fasilitas terdata pada cakupan ini" icon={Activity} tone="blue" />
              <MetricCard label="Fasilitas pendidikan" value={formatNumber(educationInstitutions)} detail={`Kapasitas kursi baru ${formatNumber(newEducationSeats)}`} icon={Layers3} tone="amber" />
            </div>
          ) : (
            <div className="mt-4"><EmptyState title="Data lintas sektor belum tersedia" message={sources.summary?.error || 'Coba segarkan data atau periksa koneksi layanan.'} /></div>
          )}
        </Panel>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-900">Kesehatan siklus hidup</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Jumlah sasaran dibanding dukungan fasilitas.</p>
            <div className="mt-4 space-y-3">
              <DataLine label="Baduta 0–23 bulan" value={formatNumber(coverage?.demografi_kesehatan?.baduta_1000hpk)} />
              <DataLine label="Ibu hamil risiko tinggi" value={formatNumber(coverage?.demografi_kesehatan?.ibu_hamil_risti)} />
              <DataLine label="Lansia berisiko tinggi" value={formatNumber(coverage?.demografi_kesehatan?.lansia_risti)} />
              <DataLine label="Tenaga kesehatan tercatat" value={formatNumber(coverage?.faskes_stats?.total_nakes?.jumlah)} />
            </div>
            <Link to="/dashboard/posyandu" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">Buka layanan kesehatan <ChevronRight size={14} /></Link>
          </Panel>

          <Panel className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-900">Perlindungan sosial & ekonomi</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Kebutuhan keluarga rentan dibanding ekosistem dukungan lokal.</p>
            <div className="mt-4 space-y-3">
              <DataLine label="KK Desil 1–2" value={desil ? formatNumber(vulnerableHouseholds) : '—'} />
              <DataLine label="Bansos disahkan (tercatat)" value={formatNumber(approvedBansos)} />
              <DataLine label="UMKM terverifikasi" value={formatNumber(economy?.total_umkm)} />
              <DataLine label="Penyerapan tenaga kerja lokal" value={formatNumber(economy?.total_serapan_naker)} />
            </div>
            <Link to="/dashboard/bansos" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">Buka meja bansos <ChevronRight size={14} /></Link>
          </Panel>

          <Panel className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-900">Mutu dan cakupan data</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Gunakan sebagai indikator kelayakan data untuk keputusan.</p>
            <div className="mt-4 space-y-3">
              <DataLine label="Skor kematangan data" value={maturity ? formatPercent(maturity.overall_maturity_score) : '—'} />
              <DataLine label="Cakupan nomor kontak" value={formatPercent(maturity?.coverage?.phone_percentage)} />
              <DataLine label="Cakupan akun warga" value={formatPercent(maturity?.coverage?.account_percentage)} />
              <DataLine label="SLA rata-rata surat" value={docPipeline?.rata_sla_jam == null ? '—' : `${formatNumber(docPipeline.rata_sla_jam)} jam`} />
            </div>
            <Link to="/dashboard/data-maturity" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">Tinjau kematangan data <ChevronRight size={14} /></Link>
          </Panel>
        </div>

        {hasSourceError && (
          <Panel className="p-4">
            <div className="space-y-2">
              <SourceStatus source={sources.demographics} loading={loading} label="Demografi" />
              <SourceStatus source={sources.documents} loading={loading} label="Layanan surat" />
              <SourceStatus source={sources.desil} loading={loading} label="Kesejahteraan" />
              <SourceStatus source={sources.summary} loading={loading} label="Kesehatan, ekonomi, aduan, dan kematangan data" />
            </div>
          </Panel>
        )}
      </div>
    );
  };

  const renderArea = () => (
    <div className="space-y-5">
      <Panel className="p-4 sm:p-5">
        <SectionHeading
          eyebrow="Pemerataan layanan per RT"
          title="Penduduk, kerentanan, dan beban layanan"
          description="Bandingkan jumlah penduduk dan sinyal layanan pada cakupan filter yang sama. Nilai adalah jumlah, bukan skor risiko; gunakan persentase/denominator saat mengambil keputusan."
        />
        <SourceStatus source={sources.demographics} loading={loading && !demographics} label="Matriks demografi" />
        {comparisonRows.length ? (
          <>
            <div className="mt-5 h-80" role="img" aria-label="Perbandingan jumlah warga, balita, lansia, keluarga rentan dan surat dalam proses per RT">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonRows} margin={{ top: 8, right: 16, left: -14, bottom: 32 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="rt" tickFormatter={(value, index) => `RW ${comparisonRows[index]?.rw} · ${value}`} interval={0} angle={-20} textAnchor="end" height={54} tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(value, items) => {
                      const row = items?.[0]?.payload;
                      return row ? `RW ${row.rw} · RT ${row.rt}` : `RT ${value}`;
                    }}
                    formatter={(value, name) => [formatNumber(value), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="penduduk" name="Penduduk" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="balita" name="Balita" fill="#0f766e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="lansia" name="Lansia" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="desilRentan" name="KK Desil 1–2" fill="#d97706" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="suratProses" name="Surat diproses" fill="#64748b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="border-y border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Wilayah</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Penduduk</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Balita</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Lansia</th>
                    <th className="px-3 py-2.5 text-right font-semibold">KK Desil 1–2</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Surat proses</th>
                    <th className="px-3 py-2.5 text-right font-semibold">PBB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonRows.map((row) => (
                    <tr key={row.key} className="text-slate-700">
                      <td className="px-3 py-3 font-medium text-slate-900">RW {row.rw} · RT {row.rt}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(row.penduduk)}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(row.balita)}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(row.lansia)}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(row.desilRentan)}</td>
                      <td className="px-3 py-3 text-right">{formatNumber(row.suratProses)}</td>
                      <td className="px-3 py-3 text-right">{row.pbb == null ? 'Tidak tersedia' : formatPercent(row.pbb)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-5"><EmptyState title="Belum ada data wilayah untuk dibandingkan" message={sources.demographics?.error || 'Periksa filter wilayah, pemetaan RW/RT, atau ketersediaan data warga.'} /></div>
        )}
      </Panel>

      <Panel className="p-4 sm:p-5">
        <SectionHeading
          eyebrow="Pemerataan sosial"
          title="Sebaran Desil keluarga"
          description="Distribusi desil berdasarkan nilai yang tersedia di basis data. Usulan dan status terverifikasi perlu dibaca bersama status verifikasinya."
        />
        <SourceStatus source={sources.desil} loading={loading && !desil} label="Sebaran desil" />
        {desil ? (
          <>
            <div className="mt-4 h-64" role="img" aria-label="Grafik sebaran sepuluh desil kesejahteraan keluarga">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Array.from({ length: 10 }, (_, index) => ({
                    desil: `D${index + 1}`,
                    jumlah: Number(desil[`desil_${index + 1}`] || 0),
                  }))}
                  margin={{ top: 8, right: 12, left: -18, bottom: 8 }}
                >
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="desil" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip formatter={(value) => [formatNumber(value), 'Keluarga']} />
                  <Bar dataKey="jumlah" name="Keluarga" fill="#b45309" radius={[4, 4, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
              <span>Terdata: <strong className="text-slate-900">{formatNumber(desil.terdata_desil)}</strong> / {formatNumber(desil.total_kk)} KK</span>
              <span>Terverifikasi: <strong className="text-slate-900">{formatNumber(desil.verified_kelurahan)}</strong></span>
              <span>Menunggu: <strong className="text-slate-900">{formatNumber(desil.pending_verifikasi)}</strong></span>
              <span>Belum terverifikasi: <strong className="text-slate-900">{formatNumber(desil.belum_terverifikasi)}</strong></span>
            </div>
          </>
        ) : (
          <div className="mt-4"><EmptyState title="Sebaran belum tersedia" message={sources.desil?.error || 'Data desil belum tersedia pada cakupan ini.'} /></div>
        )}
      </Panel>
    </div>
  );

  const buildDeepLink = (insight) => {
    const insightRw = insight.evidence?.wilayah?.match(/RW\s*(\d+)/i)?.[1] || (effectiveRW !== 'all' ? effectiveRW : '001');
    const insightRt = insight.evidence?.wilayah?.match(/RT\s*(\d+)/i)?.[1] || (effectiveRT !== 'all' ? effectiveRT : '001');
    
    if (insight.category === 'KESEHATAN_BALITA') {
      return `/dashboard/posyandu?category=balita&rw=${insightRw}&rt=${insightRt}&filter=gizi_kurang`;
    }
    if (insight.category === 'GERIATRI_LANSIA') {
      return `/dashboard/posyandu?category=lansia&rw=${insightRw}&rt=${insightRt}&filter=komorbid`;
    }
    if (insight.category === 'BANTUAN_SOSIAL') {
      return `/dashboard/bansos?rw=${insightRw}&rt=${insightRt}&tab=sktm`;
    }
    if (insight.category === 'LAYANAN_DOKUMEN') {
      return `/dashboard/dokumen?rw=${insightRw}&rt=${insightRt}&status=PROSES`;
    }
    return `/dashboard/warga?rw=${insightRw}&rt=${insightRt}`;
  };

  const handleUpdateActionStatus = async (insight, nextStatus) => {
    setUpdatingActionId(insight.id);
    const defaultNote = nextStatus === 'SELESAI' 
      ? 'Telah diverifikasi dan ditindaklanjuti di lapangan.' 
      : 'Sedang dalam penanganan dan koordinasi petugas.';
    const note = window.prompt(`Perbarui status menjadi [${nextStatus}]:\nMasukkan catatan verifikasi lapangan:`, defaultNote);
    if (note === null) {
      setUpdatingActionId(null);
      return;
    }

    const insightRw = insight.evidence?.wilayah?.match(/RW\s*(\d+)/i)?.[1] || (effectiveRW !== 'all' ? effectiveRW : '001');
    const insightRt = insight.evidence?.wilayah?.match(/RT\s*(\d+)/i)?.[1] || (effectiveRT !== 'all' ? effectiveRT : '001');

    try {
      const res = await api.patch(`/analytics/actions/${encodeURIComponent(insight.id)}`, {
        status: nextStatus,
        catatan_tindak_lanjut: note,
        category: insight.category,
        title: insight.title,
        wilayah_rw: insightRw,
        wilayah_rt: insightRt,
      });
      if (res?.success && res.data) {
        setActionsMap(prev => ({ ...prev, [insight.id]: res.data }));
      }
    } catch (e) {
      alert('Gagal memperbarui status: ' + (e.message || 'Error server'));
    } finally {
      setUpdatingActionId(null);
    }
  };

  const renderStrategies = () => {
    const insights = summary?.ai_insights || [];
    const fidelity = summary?.data_fidelity;

    const filteredInsights = insights.filter((insight) => {
      const status = actionsMap[insight.id]?.status || 'PENDING';
      if (actionFilter === 'all') return true;
      return status === actionFilter;
    });

    return (
      <div className="space-y-5">
        <Panel className="border-slate-800 bg-slate-950 p-5 text-white sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-300">Decision support · {areaLabel}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Strategi berbasis bukti & alur tindak lanjut</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Setiap rekomendasi dilengkapi bukti wilayah dan dapat ditandai status penanganannya untuk transparansi audit dan koordinasi lintas petugas.
              </p>
            </div>
            <div className="min-w-40 rounded-xl border border-white/15 p-3">
              <div className="flex items-center gap-2 text-slate-300"><ShieldCheck size={16} /><span className="text-xs">Kelayakan data</span></div>
              <p className="mt-2 text-xl font-semibold">{fidelity?.confidence_score == null ? '—' : formatPercent(fidelity.confidence_score)}</p>
              <p className="mt-1 text-[11px] text-slate-400">{fidelity?.level || 'Belum dinilai'}</p>
            </div>
          </div>
        </Panel>

        {/* Filter Bar Tindak Lanjut */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>Filter Status Tindak Lanjut:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `Semua (${insights.length})` },
              { id: 'PENDING', label: `Perlu Tindakan (${insights.filter(i => (actionsMap[i.id]?.status || 'PENDING') === 'PENDING').length})` },
              { id: 'IN_PROGRESS', label: `Dalam Proses (${insights.filter(i => actionsMap[i.id]?.status === 'IN_PROGRESS').length})` },
              { id: 'SELESAI', label: `Selesai (${insights.filter(i => actionsMap[i.id]?.status === 'SELESAI').length})` },
            ].map(filter => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActionFilter(filter.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  actionFilter === filter.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <SourceStatus source={sources.summary} loading={loading && !summary} label="Analisis strategi" />
        {filteredInsights.length ? (
          <div className="space-y-4">
            {filteredInsights.map((insight, index) => {
              const evidence = Object.entries(insight.evidence || {})
                .filter(([, value]) => ['string', 'number'].includes(typeof value) && value !== null)
                .slice(0, 4);
              const targetLink = buildDeepLink(insight);
              const actionRecord = actionsMap[insight.id];
              const currentStatus = actionRecord?.status || 'PENDING';

              return (
                <Panel key={insight.id || index} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        {insight.severity === 'CRITICAL' ? <AlertCircle size={17} /> : <Activity size={17} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityTag severity={insight.severity} />
                          {insight.badge_label && <span className="text-[11px] font-medium text-slate-500">{insight.badge_label}</span>}
                          <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-200/60">Rule-based DSS · Perlu Verifikasi</span>
                          {currentStatus === 'SELESAI' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={12} /> Selesai Ditindaklanjuti
                            </span>
                          ) : currentStatus === 'IN_PROGRESS' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                              Dalam Penanganan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              Perlu Verifikasi Lapangan
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-base font-semibold leading-6 text-slate-950">{insight.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-slate-600">{insight.summary}</p>
                        {evidence.length > 0 && (
                          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                            {evidence.map(([label, value]) => (
                              <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                                <dt className="text-[11px] capitalize text-slate-500">{label.replaceAll('_', ' ')}</dt>
                                <dd className="mt-0.5 text-xs font-semibold text-slate-800">{typeof value === 'number' ? formatNumber(value) : value}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                        {insight.human_in_the_loop_notice && (
                          <p className="mt-2 text-[11px] italic text-slate-500 bg-slate-50/70 p-2 rounded border border-slate-100">
                            ℹ {insight.human_in_the_loop_notice}
                          </p>
                        )}
                        {insight.action_directives?.length > 0 && (
                          <div className="mt-3 rounded-lg border-l-2 border-blue-500 bg-blue-50/60 px-3 py-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-800">Langkah tindak lanjut terarah</p>
                            <ul className="mt-1 list-inside list-disc space-y-1 text-xs leading-5 text-slate-700">
                              {insight.action_directives.slice(0, 2).map((action) => <li key={action}>{action}</li>)}
                            </ul>
                          </div>
                        )}
                        {actionRecord && (
                          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-700">
                            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                              <span>Log Audit: Status diperbarui oleh <strong>{actionRecord.updated_by_nama || 'Petugas'}</strong> ({actionRecord.updated_by_role || 'Admin'})</span>
                              <span>{actionRecord.updated_at ? new Date(actionRecord.updated_at).toLocaleString('id-ID') : ''}</span>
                            </div>
                            {actionRecord.catatan_tindak_lanjut && (
                              <p className="mt-1.5 italic text-slate-600">
                                "{actionRecord.catatan_tindak_lanjut}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {insight.impact_score != null && <span className="text-[11px] text-slate-500">Prioritas relatif {formatNumber(insight.impact_score)}</span>}
                      <div className="flex items-center gap-2">
                        {currentStatus !== 'SELESAI' ? (
                          <button
                            type="button"
                            disabled={updatingActionId === insight.id}
                            onClick={() => handleUpdateActionStatus(insight, currentStatus === 'PENDING' ? 'IN_PROGRESS' : 'SELESAI')}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                              currentStatus === 'PENDING'
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {updatingActionId === insight.id
                              ? 'Menyimpan...'
                              : currentStatus === 'PENDING'
                                ? 'Mulai Tindak Lanjut'
                                : 'Tandai Selesai'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingActionId === insight.id}
                            onClick={() => handleUpdateActionStatus(insight, 'IN_PROGRESS')}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Tinjau Ulang
                          </button>
                        )}
                        <Link
                          to={targetLink}
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                        >
                          Tindak Lanjuti <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        ) : !loading && !sources.summary?.error ? (
          <EmptyState
            title="Tidak ada data insight pada filter ini"
            message={actionFilter !== 'all' ? `Belum ada rekomendasi dengan status ${actionFilter}.` : "Data atau ambang keputusan belum cukup untuk memunculkan prioritas pada wilayah ini."}
          />
        ) : null}

        <Panel className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-900">Cara membaca prioritas</h3>
          <div className="mt-3 grid gap-3 text-xs leading-5 text-slate-600 md:grid-cols-3">
            <p><strong className="text-slate-800">Bukti:</strong> cek wilayah, jumlah kasus, denominator, dan waktu pembaruan sebelum bertindak.</p>
            <p><strong className="text-slate-800">Validasi:</strong> bedakan hasil pemeriksaan, usulan desil, status resmi, dan data yang belum terverifikasi.</p>
            <p><strong className="text-slate-800">Tindak lanjut:</strong> tetapkan penanggung jawab, tenggat, dan ukuran hasil; tinjau ulang pada periode berikutnya.</p>
          </div>
        </Panel>
      </div>
    );
  };

    const tabContent = activeTab === 'ringkasan'
    ? renderSummary()
    : activeTab === 'penduduk'
      ? renderPopulation()
      : activeTab === 'wilayah'
        ? renderArea()
        : renderStrategies();

  return (
    <main className="mx-auto max-w-[1440px] space-y-5 px-3 py-5 sm:px-6 lg:px-8">
      <header className="rounded-2xl bg-slate-950 px-5 py-6 text-white sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">Pusat analitik · decision support</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard Analitik Wilayah</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Hubungkan profil penduduk dengan pemerataan kesehatan, perlindungan sosial, dan kinerja layanan untuk menentukan prioritas kerja.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs text-slate-300 lg:items-end">
            <span className="inline-flex items-center gap-2"><MapPin size={14} />{areaLabel}</span>
            <span>{lastUpdated ? `Ringkasan diperbarui ${lastUpdated}` : 'Waktu pembaruan belum tersedia'}</span>
          </div>
        </div>
      </header>

      {renderTopFilters()}

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Bagian dashboard analitik">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition ${
              activeTab === id
                ? 'border-blue-600 text-blue-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {loading && !summary && !demographics && !documents && !desil ? (
        <Panel className="flex min-h-64 items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm text-slate-600"><RefreshCw size={17} className="animate-spin" />Memuat data wilayah…</div>
        </Panel>
      ) : tabContent}

      <footer className="flex flex-col gap-1 border-t border-slate-200 pt-4 text-[11px] leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Angka bersifat agregat dan mengikuti cakupan pengguna aktif.</span>
        <span>Pastikan definisi, denominator, dan status verifikasi sebelum keputusan final.</span>
      </footer>
    </main>
  );
}

function DataLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}
