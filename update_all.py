import re

def update_dashboard_rt():
    path = 'frontend/src/pages/dashboard/DashboardKetuaRT.jsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove unused imports from design-system
    content = re.sub(
        r'import\s*\{\s*DashboardShell,\s*RoleHeader,\s*AIBriefCard,\s*KPIGrid,\s*KPICard,\s*ActionCenter,\s*StatusBadge,\s*SLABadge\s*\}\s*from\s*[\'"]\.\.\/\.\.\/components\/design-system[\'"];',
        'import { StatusBadge, SLABadge } from "../../components/design-system";',
        content
    )

    # 2. Replace return (<DashboardShell ... > down to {/* 0. Persona Mode Switcher
    shell_start_pattern = r'return\s*\(\s*<DashboardShell.*?(?=\{\/\*\s*0\.\s*Persona Mode Switcher)'
    replacement_start = """return (
    <div className="space-y-6 pb-16">
      {/* Pesan Sukses Aksi */}
      <AnimatePresence>
        {actionSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium">{actionSuccessToast}</p>
            </div>
            <button onClick={() => setActionSuccessToast('')} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      """
    content = re.sub(shell_start_pattern, replacement_start, content, flags=re.DOTALL)

    # 3. Change Link in Persona Switcher banner from /dashboard/warga to /dashboard/dokumen
    content = content.replace(
        '<Link\n            to="/dashboard/warga"\n            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10',
        '<Link\n            to="/dashboard/dokumen"\n            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10'
    )
    content = content.replace(
        '<Link to="/dashboard/warga"',
        '<Link to="/dashboard/dokumen"'
    )

    # 4. Replace Bento item 3 (Buku Warga & KK) with Layanan Surat Mandiri
    bento_warga_pattern = r'\{\/\*\s*3\.\s*Buku Warga & KK\s*\*\/.*?<\/Link>'
    bento_surat_replacement = """{/* 3. Layanan Surat Mandiri RT */}
          <Link
            to="/dashboard/dokumen"
            className="p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 shadow-sm transition-all text-left group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800 font-mono">
                Mandiri
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Layanan Surat Mandiri</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Pengajuan surat KK sendiri</p>
            </div>
          </Link>"""
    content = re.sub(bento_warga_pattern, bento_surat_replacement, content, flags=re.DOTALL)

    # 5. Remove sub-tabs in RT dashboard
    subtabs_pattern = r'\{\/\*\s*Sub-Tabs Navigasi Meja Kerja RT\s*\*\/.*?\{\/\*\s*={10,}\s*\*\/|\{\/\*\s*Sub-Tabs Navigasi Meja Kerja RT\s*\*\/.*?(?=\{\/\*\s*TAB 1:)'
    content = re.sub(subtabs_pattern, '', content, flags=re.DOTALL)

    # 6. Replace closing </DashboardShell> with </div>
    content = re.sub(r'<\/DashboardShell>\s*\);\s*\}', '</div>\n  );\n}', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("DashboardKetuaRT.jsx updated successfully")

def update_dashboard_rw():
    path = 'frontend/src/pages/dashboard/DashboardKetuaRW.jsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Link in Persona banner
    content = content.replace(
        '<Link\n            to="/dashboard/warga"\n            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10',
        '<Link\n            to="/dashboard/dokumen"\n            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10'
    )
    content = content.replace(
        '<Link to="/dashboard/warga"',
        '<Link to="/dashboard/dokumen"'
    )

    # Bento shortcut 3
    bento_rw_pattern = r'\{\/\*\s*3\.\s*(?:Buku Warga & KK RW|Buku Warga Lintas-RT|Layanan Surat Mandiri RW)\s*\*\/.*?<\/Link>'
    bento_rw_replacement = """{/* 3. Layanan Surat Mandiri RW */}
          <Link
            to="/dashboard/dokumen"
            className="p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 shadow-sm transition-all text-left group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800 font-mono">
                Mandiri
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Layanan Surat Mandiri</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Pengajuan surat KK sendiri</p>
            </div>
          </Link>"""
    content = re.sub(bento_rw_pattern, bento_rw_replacement, content, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("DashboardKetuaRW.jsx updated successfully")

def update_dashboard_layout():
    path = 'frontend/src/layouts/DashboardLayout.jsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # RT & RW sidebar items: replace Buku Warga & KK with Pengajuan Surat Mandiri
    content = content.replace(
        "{ name: 'Buku Warga & KK RW', path: '/dashboard/warga', icon: <Users size={19} /> },",
        "{ name: 'Pengajuan Surat Mandiri', path: '/dashboard/dokumen', icon: <FileCheck size={19} /> },"
    )
    content = content.replace(
        "{ name: 'Buku Warga & KK RT', path: '/dashboard/warga', icon: <Users size={19} /> },",
        "{ name: 'Pengajuan Surat Mandiri', path: '/dashboard/dokumen', icon: <FileCheck size={19} /> },"
    )

    # Clean mobile bottom nav for isRT and isRW
    rt_bottom_pattern = r'if\s*\(\s*isRT\s*\)\s*\{.*?return\s*\[\s*\{ name: \'Beranda\'.*?\n\s*\];\s*\}'
    rt_bottom_clean = """if (isRT) {
      return [
        { name: 'Beranda', path: '/dashboard', icon: <Home size={18} /> },
        { name: 'Surat', path: '/dashboard/dokumen', icon: <FileCheck size={18} /> },
        { name: 'Bansos', path: '/dashboard/bansos', icon: <Gift size={18} /> },
        { name: 'Kas RT', path: '/dashboard/keuangan', icon: <Wallet size={18} /> },
        { name: 'SOP', path: '/dashboard/panduan', icon: <BookOpen size={18} /> },
      ];
    }"""
    content = re.sub(rt_bottom_pattern, rt_bottom_clean, content, flags=re.DOTALL)

    rw_bottom_pattern = r'if\s*\(\s*isRW\s*\)\s*\{.*?return\s*\[\s*\{ name: \'Beranda\'.*?\n\s*\];\s*\}'
    rw_bottom_clean = """if (isRW) {
      return [
        { name: 'Beranda', path: '/dashboard', icon: <Home size={18} /> },
        { name: 'Surat', path: '/dashboard/dokumen', icon: <FileCheck size={18} /> },
        { name: 'Bansos', path: '/dashboard/bansos', icon: <Gift size={18} /> },
        { name: 'Kas RW', path: '/dashboard/keuangan', icon: <Wallet size={18} /> },
        { name: 'SOP', path: '/dashboard/panduan', icon: <BookOpen size={18} /> },
      ];
    }"""
    content = re.sub(rw_bottom_pattern, rw_bottom_clean, content, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("DashboardLayout.jsx updated successfully")

def update_dokumen_page():
    path = 'frontend/src/pages/DokumenPage.jsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add myDocs state
    if 'const [myDocs, setMyDocs] = useState([]);' not in content:
        content = content.replace(
            'const [data, setData] = useState([]);',
            'const [data, setData] = useState([]);\n  const [myDocs, setMyDocs] = useState([]);'
        )

    # 2. Support mode=mandiri initial tab
    if 'initialMode' not in content:
        content = content.replace(
            "const [activeTab, setActiveTab] = useState(isOfficer ? 'pending_approval' : 'all');",
            "const initialMode = searchParams.get('mode');\n  const [activeTab, setActiveTab] = useState(\n    initialMode === 'mandiri' ? 'my_docs' : (isOfficer ? 'pending_approval' : 'all')\n  );"
        )

    # 3. Update fetchDokumen to fetch both officer and personal docs
    old_fetch = """const fetchDokumen = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = isOfficer ? await api.get('/dokumen') : await api.get('/dokumen/me');
      setData(res.data || []);
      await loadFamilyMembers();"""
    new_fetch = """const fetchDokumen = async () => {
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
      await loadFamilyMembers();"""
    content = content.replace(old_fetch, new_fetch)

    # 4. Update displayedData
    content = content.replace(
        "const displayedData = data.filter((doc) => {",
        "const displayedData = (activeTab === 'my_docs' ? myDocs : data).filter((doc) => {"
    )

    # 5. Header button: always render for all users
    button_pattern = r'\{!isOfficer\s*&&\s*\(\s*<button\s*onClick=\{[^}]*setShowModal\(true\)[^}]*\}.*?<\/button>\s*\)\}'
    button_replacement = """<button
            onClick={() => {
              setSubjekPemohon('self');
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>Ajukan Surat Baru (Mandiri)</span>
          </button>"""
    content = re.sub(button_pattern, button_replacement, content, flags=re.DOTALL)

    # 6. Add tab for officers: Surat Mandiri Saya & KK
    officer_tab_all = """<button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <FileText size={16} />
            <span>Semua Dokumen ({data.length})</span>
          </button>"""
    officer_tab_with_my = """<button
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
          </button>"""
    if 'Surat Mandiri Saya & KK' not in content:
        content = content.replace(officer_tab_all, officer_tab_with_my)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("DokumenPage.jsx updated successfully")

def update_warga_list():
    path = 'frontend/src/pages/WargaList.jsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Masking for NIK and KK
    old_row = """<td className="p-4">
                      <div className="font-mono font-medium text-on-surface">{warga.nik}</div>
                      <div className="text-xs text-on-surface-variant font-mono">KK: {warga.no_kk}</div>
                    </td>"""
    new_row = """<td className="p-4">
                      <div className="font-mono font-medium text-on-surface">
                        {['superadmin', 'admin_kelurahan'].includes(user?.role) ? warga.nik : (warga.nik ? `${warga.nik.slice(0, 6)}******${warga.nik.slice(-4)}` : '-')}
                      </div>
                      <div className="text-xs text-on-surface-variant font-mono" title="Disensor demi perlindungan data pribadi (UU PDP No. 27/2022)">
                        KK: {warga.no_kk ? `${warga.no_kk.slice(0, 6)}******${warga.no_kk.slice(-4)}` : '-'}
                      </div>
                    </td>"""
    content = content.replace(old_row, new_row)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("WargaList.jsx updated successfully")

def update_sw_cache():
    for path in ['public/sw.js', 'frontend/public/sw.js']:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                c = f.read()
            c = re.sub(r"const\s+CACHE_VERSION\s*=\s*'bumi-warga-v\d+';", "const CACHE_VERSION = 'bumi-warga-v10';", c)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(c)
            print(f"{path} cache bumped to v10")
        except Exception as e:
            print(f"Error updating {path}: {e}")

if __name__ == '__main__':
    update_dashboard_rt()
    update_dashboard_rw()
    update_dashboard_layout()
    update_dokumen_page()
    update_warga_list()
    update_sw_cache()

