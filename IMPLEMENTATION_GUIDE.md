# 🚀 Panduan Implementasi UI/UX 3D - Bumi Warga
## Mobile-First Design dengan Soft Sky Blue Identity

---

## 📋 CHECKLIST IMPLEMENTASI

### ✅ Yang Sudah Selesai:
- [x] Update `tailwind.config.js` dengan extended tokens (3D shadows, spacing, gradients)
- [x] Buat `frontend/src/components/ui/UI3D.jsx` - Component library siap pakai
- [x] Update `frontend/src/index.css` dengan utility classes 3D
- [x] Buat `frontend/src/pages/UIShowcase.jsx` - Preview semua komponen
- [x] Buat `ICON_DESIGN_PROMPTS.md` - Prompts untuk generate icon

### 🔄 Yang Perlu Dilakukan:
- [ ] Update komponen existing dengan design baru
- [ ] Generate & optimize icons (Bumi Warga, Kanaya AI, Login illustration)
- [ ] Test responsive di berbagai device
- [ ] Accessibility audit (contrast, keyboard navigation)
- [ ] Performance optimization

---

## 🎨 CARA MENGGUNAKAN KOMPONEN BARU

### 1. Import UI3D Components

```jsx
import { 
  StatCard3D, 
  Button3D, 
  Header3D, 
  GlassCard, 
  Badge3D 
} from '../components/ui/UI3D';
```

### 2. Gunakan Header3D (Ganti Header Lama)

**❌ BEFORE:**
```jsx
<header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-50/90 via-white to-sky-50/40 text-slate-900 p-6 sm:p-8 rounded-3xl shadow-xs relative overflow-hidden border border-sky-100">
  <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />
  <div className="relative z-10 space-y-2 max-w-2xl">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 shadow-xs">
      <Sparkles size={14} className="text-sky-600" />
      <span>Pusat Komando & Keputusan Berbasis Evidens</span>
    </div>
    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
      Dashboard Pimpinan Kebonjati
    </h1>
    {/* ... rest of header content */}
  </div>
</header>
```

**✅ AFTER:**
```jsx
<Header3D
  badge="Pusat Komando & Keputusan Berbasis Evidens"
  badgeIcon={<Sparkles size={14} />}
  title="Dashboard Pimpinan Kebonjati"
  subtitle="Analitik presisi, deteksi dini risiko kesehatan siklus hidup, dan penyeimbangan jaring pengaman sosial berbasis bukti nyata."
  location={
    <>
      <MapPin size={14} className="text-sky-600" />
      <span>{scopeLabel}</span>
    </>
  }
  actions={
    <>
      <Button3D 
        variant="secondary" 
        icon={<RefreshCw size={14} />}
        onClick={fetchOfficerData}
        disabled={loadingOfficer}
      >
        Segarkan Analitik
      </Button3D>
      <Button3D 
        variant="primary" 
        icon={<FileCheck size={14} />}
        onClick={() => navigate('/dashboard/dokumen')}
      >
        Buka Layanan Surat ({docVelocity.total_dalam_proses || 0})
      </Button3D>
    </>
  }
/>
```

### 3. Gunakan StatCard3D (Ganti Stat Card Lama)

**❌ BEFORE:**
```jsx
<div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-3">
  <div className="flex items-center justify-between text-on-surface-variant">
    <span className="text-xs font-bold uppercase tracking-wider">Demografi Penduduk</span>
    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
      <Users size={18} />
    </div>
  </div>
  <div>
    <div className="text-3xl font-extrabold text-on-surface tracking-tight">
      {demography.total_warga_aktif || 0}
    </div>
    <p className="text-xs text-on-surface-variant mt-0.5">Warga Terdaftar Aktif</p>
  </div>
  {/* ... metrics */}
</div>
```

**✅ AFTER:**
```jsx
<StatCard3D
  icon={<Users size={20} />}
  iconBgColor="from-blue-100 to-blue-50"
  iconColor="text-blue-700"
  borderAccent="border-l-blue-500"
  label="Demografi Penduduk"
  value={demography.total_warga_aktif || 0}
  subtitle="Warga Terdaftar Aktif"
  metrics={[
    { label: 'Laki-laki', value: demography.total_laki || 0, color: 'text-slate-900' },
    { label: 'Perempuan', value: demography.total_perempuan || 0, color: 'text-slate-900' },
    { label: 'Kartu Keluarga', value: demography.total_kk || 0, color: 'text-slate-900' },
    { label: 'Status Tetap', value: demography.status_tetap || 0, color: 'text-emerald-600' }
  ]}
/>
```

### 4. Gunakan Button3D (Ganti Button Lama)

**❌ BEFORE:**
```jsx
<button className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-all shadow-xs">
  <FileCheck size={14} className="text-white" />
  <span>Buka Layanan Surat</span>
</button>
```

**✅ AFTER:**
```jsx
<Button3D 
  variant="primary" 
  size="md"
  icon={<FileCheck size={16} />}
  onClick={() => navigate('/dashboard/dokumen')}
>
  Buka Layanan Surat
</Button3D>
```

### 5. Gunakan GlassCard untuk AI Insights

**❌ BEFORE:**
```jsx
<motion.div className="p-5 rounded-2xl border transition-all relative flex flex-col justify-between shadow-sm bg-rose-50/70 border-rose-200 text-rose-950">
  <div>
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
      <AlertTriangle size={12} />
      CRITICAL
    </span>
    <h3 className="font-bold text-base leading-snug mb-1.5">{insight.title}</h3>
    <p className="text-xs leading-relaxed opacity-85">{insight.summary}</p>
  </div>
  <button onClick={() => openEvidenceModal(insight)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold">
    <Eye size={13} />
    <span>Rasional Bukti & Aksi</span>
  </button>
</motion.div>
```

**✅ AFTER:**
```jsx
<GlassCard
  severity="critical"
  badge={
    <>
      <AlertTriangle size={12} />
      <span>CRITICAL ALERT</span>
    </>
  }
  title={insight.title}
  content={<p>{insight.summary}</p>}
  action={
    <Button3D 
      variant="secondary" 
      size="sm"
      icon={<Eye size={14} />}
      onClick={() => openEvidenceModal(insight)}
    >
      Rasional Bukti & Aksi
    </Button3D>
  }
/>
```

---

## 📱 MOBILE-FIRST RESPONSIVE PATTERNS

### Pattern 1: Stat Cards Grid

```jsx
{/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard3D {...} />
  <StatCard3D {...} />
  <StatCard3D {...} />
  <StatCard3D {...} />
</div>
```

### Pattern 2: Responsive Button Group

```jsx
{/* Stack on mobile, horizontal on desktop */}
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
  <Button3D variant="secondary" className="w-full sm:w-auto">
    Action 1
  </Button3D>
  <Button3D variant="primary" className="w-full sm:w-auto">
    Action 2
  </Button3D>
</div>
```

### Pattern 3: Responsive Padding

```jsx
{/* Use semantic spacing tokens */}
<div className="p-4 sm:p-5 lg:p-6">
  {/* Or use custom tokens */}
  <div className="p-card-padding-sm sm:p-card-padding-md">
    Content
  </div>
</div>
```

### Pattern 4: Responsive Typography

```jsx
{/* Automatically scales on mobile */}
<h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black">
  Responsive Heading
</h1>

{/* Or use predefined tokens */}
<h1 className="text-headline-lg-mobile lg:text-headline-lg">
  Semantic Heading
</h1>
```

---

## 🎨 COLOR VARIANT PATTERNS

### Stat Cards dengan Color Coding

```jsx
{/* Blue - Demographics */}
<StatCard3D
  iconBgColor="from-blue-100 to-blue-50"
  iconColor="text-blue-700"
  borderAccent="border-l-blue-500"
  {...}
/>

{/* Emerald - Health (Positive) */}
<StatCard3D
  iconBgColor="from-emerald-100 to-emerald-50"
  iconColor="text-emerald-700"
  borderAccent="border-l-emerald-500"
  {...}
/>

{/* Rose - Health (Alert) */}
<StatCard3D
  iconBgColor="from-rose-100 to-rose-50"
  iconColor="text-rose-700"
  borderAccent="border-l-rose-500"
  {...}
/>

{/* Indigo - Services */}
<StatCard3D
  iconBgColor="from-indigo-100 to-indigo-50"
  iconColor="text-indigo-700"
  borderAccent="border-l-indigo-500"
  {...}
/>

{/* Amber - Financial */}
<StatCard3D
  iconBgColor="from-amber-100 to-amber-50"
  iconColor="text-amber-700"
  borderAccent="border-l-amber-500"
  {...}
/>
```

---

## 🛠️ UTILITY CLASSES BARU

### CSS Classes yang Bisa Langsung Dipakai:

```jsx
{/* Card dengan 3D effect */}
<div className="card-3d">
  Content with 3D shadow and hover effect
</div>

{/* Button Primary 3D */}
<button className="btn-3d-primary">
  <Icon size={16} />
  <span>Button Text</span>
</button>

{/* Button Secondary 3D */}
<button className="btn-3d-secondary">
  Secondary Action
</button>

{/* Glass Card Effect */}
<div className="glass-card">
  Frosted glass morphism effect
</div>

{/* Badge with Shadow */}
<span className="badge-3d bg-sky-50 text-sky-800 border-sky-200">
  Status Badge
</span>

{/* Icon Container 3D */}
<div className="icon-container-3d bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 border-blue-200/50">
  <Icon size={20} />
</div>

{/* Text with Shadow for Legibility */}
<h1 className="text-shadow-soft">
  Heading with subtle white shadow
</h1>

{/* Gradient Text */}
<span className="text-gradient-sky">
  Gradient Sky Blue Text
</span>

{/* Divider with Gradient */}
<div className="divider-sky" />

{/* Responsive Padding Helpers */}
<div className="responsive-padding">Auto-responsive padding</div>
<div className="responsive-padding-lg">Larger responsive padding</div>

{/* Focus Ring for Accessibility */}
<button className="focus-ring-sky">
  Accessible button with focus indicator
</button>
```

---

## 🎯 CONTOH IMPLEMENTASI PENUH

### Example: Update DashboardHome.jsx Header Section

```jsx
// Di file: frontend/src/pages/DashboardHome.jsx

import { Header3D, Button3D, StatCard3D, GlassCard } from '../components/ui/UI3D';

// ... dalam komponen ...

return (
  <div className="max-w-max-width mx-auto space-y-6 sm:space-y-8 pb-16">
    {/* HEADER dengan Header3D Component */}
    <Header3D
      badge="Pusat Komando & Keputusan Berbasis Evidens"
      badgeIcon={<Sparkles size={14} className="text-sky-600" />}
      title="Dashboard Pimpinan Kebonjati"
      subtitle="Analitik presisi, deteksi dini risiko kesehatan siklus hidup, dan penyeimbangan jaring pengaman sosial berbasis bukti nyata."
      location={
        <>
          <MapPin size={14} className="text-sky-600" />
          <span>{scopeLabel}</span>
        </>
      }
      actions={
        <>
          <Button3D
            variant="secondary"
            icon={<RefreshCw size={14} className={loadingOfficer ? 'animate-spin' : ''} />}
            onClick={fetchOfficerData}
            disabled={loadingOfficer}
          >
            Segarkan Analitik
          </Button3D>
          <Button3D
            variant="primary"
            icon={<FileCheck size={14} />}
            onClick={() => navigate('/dashboard/dokumen')}
          >
            Buka Layanan Surat ({docVelocity.total_dalam_proses || 0})
          </Button3D>
        </>
      }
    />

    {/* KPI SECTION dengan StatCard3D */}
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard3D
        icon={<Users size={20} />}
        iconBgColor="from-blue-100 to-blue-50"
        iconColor="text-blue-700"
        borderAccent="border-l-blue-500"
        label="Demografi Penduduk"
        value={demography.total_warga_aktif || 0}
        subtitle="Warga Terdaftar Aktif"
        metrics={[
          { label: 'Laki-laki', value: demography.total_laki || 0 },
          { label: 'Perempuan', value: demography.total_perempuan || 0 },
          { label: 'Kartu Keluarga', value: demography.total_kk || 0 },
          { label: 'Tetap', value: demography.status_tetap || 0, color: 'text-emerald-600' }
        ]}
      />
      
      {/* ... more stat cards */}
    </section>

    {/* AI INSIGHTS dengan GlassCard */}
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-on-surface">
            Rekomendasi Strategis & Peringatan AI
          </h2>
          <p className="text-xs text-on-surface-variant">
            Inferensi deterministik dari rekam medis Posyandu, bansos, dan sensus demografi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <GlassCard
            key={insight.id}
            severity={insight.severity === 'CRITICAL' ? 'critical' : insight.severity === 'WARNING' ? 'warning' : 'info'}
            badge={
              <>
                {insight.severity === 'CRITICAL' && <AlertTriangle size={12} />}
                <span>{insight.badge_label}</span>
              </>
            }
            title={insight.title}
            content={<p>{insight.summary}</p>}
            action={
              <Button3D
                variant="secondary"
                size="sm"
                icon={<Eye size={13} />}
                onClick={() => openEvidenceModal(insight)}
              >
                Rasional Bukti & Aksi
                <ChevronRight size={13} />
              </Button3D>
            }
          />
        ))}
      </div>
    </section>
  </div>
);
```

---

## 🚀 TESTING CHECKLIST

### Responsive Testing:
- [ ] Mobile (320px - 480px): iPhone SE, Android small
- [ ] Mobile Large (481px - 768px): iPhone 12, Android standard
- [ ] Tablet (769px - 1024px): iPad, Android tablet
- [ ] Desktop (1025px+): Laptop, desktop monitors

### Browser Testing:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Samsung Internet (Android)

### Accessibility Testing:
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader compatibility
- [ ] Color contrast ratios (WCAG AA minimum)
- [ ] Focus indicators visible
- [ ] Touch targets min 44x44px

### Performance Testing:
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] No layout shifts (CLS < 0.1)

---

## 📦 FILE STRUCTURE SUMMARY

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── UI3D.jsx          ← NEW: 3D component library
│   │       └── DataTable.jsx     
│   ├── pages/
│   │   ├── DashboardHome.jsx     ← UPDATE: Use new components
│   │   └── UIShowcase.jsx        ← NEW: Preview page
│   ├── index.css                 ← UPDATED: 3D utility classes
│   └── ...
├── tailwind.config.js            ← UPDATED: Extended tokens
└── public/
    ├── icon-bumi-warga.png       ← TODO: Generate from prompts
    ├── login-illustration.png    ← TODO: Generate from prompts
    └── kanaya-avatar.png         ← TODO: Generate from prompts
```

---

## 🎨 NEXT STEPS

1. **Generate Icons** menggunakan `ICON_DESIGN_PROMPTS.md`
2. **Update DashboardHome.jsx** dengan komponen baru
3. **Update DashboardLayout.jsx** sidebar dengan icons baru
4. **Test di berbagai device** untuk responsiveness
5. **Accessibility audit** dengan Lighthouse/axe
6. **Performance optimization** compress images, lazy load

---

## 📞 SUPPORT

Jika ada masalah:
1. Check showcase page: `/ui-showcase` (tambahkan route)
2. Inspect dengan DevTools untuk debugging spacing/colors
3. Test dengan different screen sizes
4. Verify Tailwind classes terapply dengan benar

**Happy Coding! 🚀**
