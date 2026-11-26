import React, { useState } from 'react';
import { 
  Home, Users, Baby, HeartPulse, FileCheck, Gift, 
  RefreshCw, Eye, ChevronRight, AlertTriangle, Sparkles,
  MapPin
} from 'lucide-react';
import { StatCard3D, Button3D, Header3D, GlassCard, Badge3D } from '../components/ui/UI3D';
import { motion } from 'framer-motion';

export default function UIShowcase() {
  const [activeTab, setActiveTab] = useState('components');

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface">
            Bumi Warga UI/UX Showcase
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
            Komponen 3D dengan Soft Sky Blue Identity - Mobile-First Design System
          </p>
          
          {/* Tab Navigation */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('components')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'components'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Components
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'colors'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Colors
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'typography'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Typography
            </button>
          </div>
        </div>

        {/* Components Tab */}
        {activeTab === 'components' && (
          <div className="space-y-12">
            {/* Section: Headers */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-on-surface">Header 3D</h2>
              <Header3D
                badge="Pusat Komando & Keputusan Berbasis Evidens"
                badgeIcon={<Sparkles size={14} />}
                title="Dashboard Pimpinan Kebonjati"
                subtitle="Analitik presisi, deteksi dini risiko kesehatan siklus hidup, dan penyeimbangan jaring pengaman sosial berbasis bukti nyata."
                location={
                  <>
                    <MapPin size={14} className="text-sky-600" />
                    <span>Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi</span>
                  </>
                }
                actions={
                  <>
                    <Button3D variant="secondary" icon={<RefreshCw size={16} />}>
                      Segarkan Data
                    </Button3D>
                    <Button3D variant="primary" icon={<FileCheck size={16} />}>
                      Buka Layanan
                    </Button3D>
                  </>
                }
              />
            </section>

            {/* Section: Stat Cards */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-on-surface">Stat Cards 3D</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard3D
                  icon={<Users size={20} />}
                  iconBgColor="from-blue-100 to-blue-50"
                  iconColor="text-blue-700"
                  borderAccent="border-l-blue-500"
                  label="Demografi Penduduk"
                  value="12,847"
                  subtitle="Warga Terdaftar Aktif"
                  metrics={[
                    { label: 'Laki-laki', value: '6,421', color: 'text-slate-900' },
                    { label: 'Perempuan', value: '6,426', color: 'text-slate-900' },
                    { label: 'Kartu Keluarga', value: '3,245', color: 'text-slate-900' },
                    { label: 'Status Tetap', value: '12,100', color: 'text-emerald-600' }
                  ]}
                />
                
                <StatCard3D
                  icon={<Baby size={20} />}
                  iconBgColor="from-emerald-100 to-emerald-50"
                  iconColor="text-emerald-700"
                  borderAccent="border-l-emerald-500"
                  label="Surveilans Balita (KMS)"
                  value="1,234"
                  subtitle="Balita Binaan Posyandu"
                  metrics={[
                    { label: 'Program', value: 'Zero Stunting', color: 'text-emerald-700' }
                  ]}
                />
                
                <StatCard3D
                  icon={<HeartPulse size={20} />}
                  iconBgColor="from-rose-100 to-rose-50"
                  iconColor="text-rose-700"
                  borderAccent="border-l-rose-500"
                  label="Kesehatan Geriatri"
                  value="2,156"
                  subtitle="Lansia Binaan (≥ 60 Thn)"
                  metrics={[
                    { label: 'Skrining', value: 'Posbindu', color: 'text-rose-700' }
                  ]}
                />
                
                <StatCard3D
                  icon={<FileCheck size={20} />}
                  iconBgColor="from-indigo-100 to-indigo-50"
                  iconColor="text-indigo-700"
                  borderAccent="border-l-indigo-500"
                  label="SLA Pelayanan Surat"
                  value="18"
                  subtitle={<>Jam <span className="text-xs">rata-rata</span></>}
                  metrics={[
                    { label: 'Disahkan', value: '1,847 Dok', color: 'text-slate-900' }
                  ]}
                />
              </div>
            </section>

            {/* Section: Glass Cards (AI Insights) */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-on-surface">Glass Cards - AI Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard
                  severity="critical"
                  badge={
                    <>
                      <AlertTriangle size={12} />
                      <span>CRITICAL ALERT</span>
                    </>
                  }
                  title="Peningkatan Kasus Stunting di RT 003/RW 001"
                  content={
                    <p>
                      Terdeteksi 8 balita dengan status gizi buruk dalam 2 bulan terakhir. 
                      Memerlukan intervensi segera PMT dan kunjungan tim kesehatan.
                    </p>
                  }
                  action={
                    <Button3D 
                      variant="secondary" 
                      size="sm"
                      icon={<Eye size={14} />}
                    >
                      Lihat Bukti Evidens
                    </Button3D>
                  }
                />
                
                <GlassCard
                  severity="warning"
                  badge={
                    <>
                      <AlertTriangle size={12} />
                      <span>WARNING</span>
                    </>
                  }
                  title="Gap Cakupan Bansos di RT 005"
                  content={
                    <p>
                      Terdapat 12 keluarga prasejahtera yang belum terdaftar DTKS. 
                      Rekomendasi: Survey ulang dan verifikasi ground check.
                    </p>
                  }
                  action={
                    <Button3D 
                      variant="secondary" 
                      size="sm"
                      icon={<ChevronRight size={14} />}
                    >
                      Tindak Lanjut
                    </Button3D>
                  }
                />
                
                <GlassCard
                  severity="info"
                  badge={
                    <>
                      <Sparkles size={12} />
                      <span>INSIGHT</span>
                    </>
                  }
                  title="Efisiensi Layanan Surat Meningkat 23%"
                  content={
                    <p>
                      Rata-rata waktu verifikasi turun dari 24 jam menjadi 18 jam. 
                      Sistem digital menunjukkan peningkatan signifikan.
                    </p>
                  }
                  action={
                    <Button3D 
                      variant="secondary" 
                      size="sm"
                      icon={<Eye size={14} />}
                    >
                      Lihat Analisis
                    </Button3D>
                  }
                />
              </div>
            </section>

            {/* Section: Buttons */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-on-surface">Buttons 3D</h2>
              <div className="flex flex-wrap items-center gap-4">
                <Button3D variant="primary" size="lg" icon={<Home size={18} />}>
                  Primary Large
                </Button3D>
                <Button3D variant="primary" size="md" icon={<FileCheck size={16} />}>
                  Primary Medium
                </Button3D>
                <Button3D variant="primary" size="sm" icon={<Gift size={14} />}>
                  Primary Small
                </Button3D>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <Button3D variant="secondary" size="md" icon={<RefreshCw size={16} />}>
                  Secondary Button
                </Button3D>
                <Button3D variant="ghost" size="md" icon={<Eye size={16} />}>
                  Ghost Button
                </Button3D>
                <Button3D variant="primary" size="md" disabled>
                  Disabled Button
                </Button3D>
              </div>
            </section>

            {/* Section: Badges */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-on-surface">Badges 3D</h2>
              <div className="flex flex-wrap items-center gap-3">
                <Badge3D variant="primary" size="lg">Primary Large</Badge3D>
                <Badge3D variant="success" size="md">Success</Badge3D>
                <Badge3D variant="warning" size="md">Warning</Badge3D>
                <Badge3D variant="danger" size="md">Danger</Badge3D>
                <Badge3D variant="default" size="sm">Small Badge</Badge3D>
              </div>
            </section>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-4">Color Palette</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Primary', color: 'bg-primary', hex: '#0284c7' },
                  { name: 'Primary Hover', color: 'bg-primary-hover', hex: '#0369a1' },
                  { name: 'Primary Container', color: 'bg-primary-container', hex: '#e0f2fe' },
                  { name: 'Surface', color: 'bg-surface', hex: '#f8fafc' },
                  { name: 'Elevation 1', color: 'bg-elevation-1', hex: '#ffffff' },
                  { name: 'Elevation 2', color: 'bg-elevation-2', hex: '#fafcfe' },
                  { name: 'Success', color: 'bg-status-success', hex: '#059669' },
                  { name: 'Warning', color: 'bg-status-warning', hex: '#d97706' },
                  { name: 'Danger', color: 'bg-status-danger', hex: '#dc2626' },
                  { name: 'Info', color: 'bg-status-info', hex: '#0284c7' }
                ].map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className={`${item.color} h-24 rounded-xl border-2 border-outline-variant shadow-sm`} />
                    <div className="text-sm">
                      <div className="font-bold text-on-surface">{item.name}</div>
                      <div className="text-xs text-on-surface-variant font-mono">{item.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="space-y-8">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-on-surface mb-4">Typography Scale</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-on-surface-variant mb-1">Display Large</div>
                  <div className="text-display-lg">Dashboard Pimpinan</div>
                </div>
                
                <div>
                  <div className="text-xs text-on-surface-variant mb-1">Headline Large</div>
                  <div className="text-headline-lg">Analitik Kesehatan Wilayah</div>
                </div>
                
                <div>
                  <div className="text-xs text-on-surface-variant mb-1">Headline Large Mobile</div>
                  <div className="text-headline-lg-mobile">Responsive Headline</div>
                </div>
                
                <div>
                  <div className="text-xs text-on-surface-variant mb-1">Headline Medium</div>
                  <div className="text-headline-md">Section Title</div>
                </div>
                
                <div>
                  <div className="text-xs text-on-surface-variant mb-1">Body Large</div>
                  <div className="text-body-lg">
                    Analitik presisi, deteksi dini risiko kesehatan siklus hidup, 
                    dan penyeimbangan jaring pengaman sosial berbasis bukti nyata.
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-on-surface-variant mb-1">Body Medium</div>
                  <div className="text-body-md">
                    Sistem informasi terintegrasi untuk pelayanan publik yang lebih baik.
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-on-surface-variant mb-1">Label Medium</div>
                  <div className="text-label-md">Button Label • Navigation Item</div>
                </div>
                
                <div>
                  <div className="text-xs text-on-surface-variant mb-1">Label Small</div>
                  <div className="text-label-sm">METADATA • CAPTION • BADGE</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
