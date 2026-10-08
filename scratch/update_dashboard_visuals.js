const fs = require('fs');

function updateDashboardLinks(path) {
  if (!fs.existsSync(path)) return;
  let c = fs.readFileSync(path, 'utf8');

  // Fix Loket Dampingan and Surat Mandiri links
  // Looking for `<Link to="/dashboard/dokumen"...> Loket Dampingan`
  // We'll just do a global replace for the link paths to ensure they are distinct
  
  // 1. Loket Dampingan (Offline)
  c = c.replace(
    /to="\/dashboard\/dokumen"([\s\S]*?)Loket Dampingan/g,
    'to="/dashboard/dokumen?mode=dampingan"$1Loket Dampingan'
  );
  
  // 2. Layanan Surat Mandiri
  // Currently points to /dashboard/dokumen. Let's change to ?mode=mandiri
  c = c.replace(
    /to="\/dashboard\/dokumen"([\s\S]*?)Layanan Surat Mandiri/g,
    'to="/dashboard/dokumen?mode=mandiri"$1Layanan Surat Mandiri'
  );

  fs.writeFileSync(path, c);
  console.log('Fixed links in ' + path);
}

function updateVisualizations(path) {
  if (!fs.existsSync(path)) return;
  let c = fs.readFileSync(path, 'utf8');
  
  // Insert new charts for Demografi & Desil
  const chartsSection = `
      {/* SECTION VISUALISASI KANAYA DATA ANALYTICS */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-blue-600" size={18} />
            Analitik Warga & Kerentanan (Kanaya Insights)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Data ter-update: Hari Ini</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 text-center">Demografi Warga (Usia)</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{name: 'Anak', value: 45}, {name: 'Dewasa', value: 120}, {name: 'Lansia', value: 20}]} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-slate-500 font-medium">Mayoritas warga di usia produktif (Dewasa).</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 text-center">Penerima Bansos vs Non-Bansos</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'Warga', Penerima: 35, Non_Penerima: 150}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="Penerima" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="Non_Penerima" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-slate-500 font-medium">18% KK adalah penerima Bansos aktif.</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 text-center">Kerentanan Ekonomi (DESIL)</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'Desil 1 (Sangat Miskin)', value: 12}, {name: 'Desil 2 (Miskin)', value: 23}, {name: 'Desil 3 (Rentan)', value: 45}]} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-slate-500 font-medium">Prioritas intervensi pada 12 KK di Desil 1.</p>
          </div>
        </div>
      </div>
  `;

  if (!c.includes('Demografi Warga (Usia)')) {
    c = c.replace(
      /\{\/\* SECTION VISUALISASI DATA INTERAKTIF/,
      chartsSection + '\n      {/* SECTION VISUALISASI DATA INTERAKTIF'
    );
    fs.writeFileSync(path, c);
    console.log('Added Visualizations to ' + path);
  }
}

const rtPath = 'frontend/src/pages/dashboard/DashboardKetuaRT.jsx';
const rwPath = 'frontend/src/pages/dashboard/DashboardKetuaRW.jsx';

updateDashboardLinks(rtPath);
updateDashboardLinks(rwPath);
updateVisualizations(rtPath);
updateVisualizations(rwPath);
