const fs = require('fs');
const path = require('path');

// 1. Remove Statcard Kanaya from Dashboard RT and RW, and make Analitik a top level element
function fixDashboardRTRW() {
    ['DashboardKetuaRT.jsx', 'DashboardKetuaRW.jsx'].forEach(file => {
        let filePath = path.join('frontend/src/pages/dashboard', file);
        if (!fs.existsSync(filePath)) return;
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove the Kanaya AI Statcard
        // The Statcard is usually inside a block that starts with {/* 1. Kanaya AI Summary / Ringkasan Analitik */}
        // or has a specific div. We can regex replace the whole block if possible, or just remove the visible parts.
        // Let's replace the whole Kanaya AI block
        const kanayaRegex = /\{\/\* 1\. Kanaya AI Summary \/ Ringkasan Analitik \*\/\}[\s\S]*?(?=\{\/\* 2\. Super Apps Bento Quick Launcher)/;
        if (kanayaRegex.test(content)) {
            content = content.replace(kanayaRegex, '');
        }

        // Add the top level Analitik button since we removed it inside the Kanaya AI Summary
        const bentoRegex = /\{\/\* 2\. Super Apps Bento Quick Launcher \(\d+ Flutter-Style Grid Shortcuts\) \*\/\}/;
        if (bentoRegex.test(content) && !content.includes('Strategi & Analitik Kebijakan AI')) {
            const analitikBtn = `
      {/* Menu Analitik Kebijakan (Top Level) */}
      <div className="mb-6 flex gap-4">
        <Link to="/dashboard/analitik" className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between group hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Strategi & Analitik Kebijakan AI</h3>
              <p className="text-xs text-blue-100 mt-0.5">Pantau data faktual, demografi, & rekomendasi Kanaya</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-blue-700 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      `;
            content = content.replace(bentoRegex, analitikBtn + '\n      {/* 2. Super Apps Bento Quick Launcher */}');
        }

        // Restore PBB and Fasilitas if they are hidden
        // PBB is actually a Bento Link to /dashboard/pbb. It seems it is present in the bento grid. 
        // Let's ensure the Kanaya avatar is updated where referenced.
        content = content.replace(/"\/kanaya-avatar\.png"/g, '"/assets/kanaya-avatar.jpg"');
        
        fs.writeFileSync(filePath, content);
    });
}

// 2. Update Kanaya Avatar in LoginPage and KanayaAIAssistant
function updateKanayaAvatar() {
    const loginPath = 'frontend/src/pages/auth/LoginPage.jsx';
    if (fs.existsSync(loginPath)) {
        let content = fs.readFileSync(loginPath, 'utf8');
        // Replace avatar logic
        // Usually there's an img tag or Kanaya mention
        content = content.replace(/src="\/kanaya-avatar\.png"/g, 'src="/assets/kanaya-avatar.jpg"');
        content = content.replace(/<Bot size=\{48\} className="text-emerald-500" \/>/g, '<img src="/assets/kanaya-avatar.jpg" alt="Kanaya" className="w-12 h-12 rounded-full shadow-md object-cover border-2 border-white" />');
        // Also if there's any placeholder, change it.
        fs.writeFileSync(loginPath, content);
    }

    const kanayaAssistantPath = 'frontend/src/components/ai/KanayaAIAssistant.jsx';
    if (fs.existsSync(kanayaAssistantPath)) {
        let content = fs.readFileSync(kanayaAssistantPath, 'utf8');
        content = content.replace(/src="\/kanaya-avatar\.png"/g, 'src="/assets/kanaya-avatar.jpg"');
        fs.writeFileSync(kanayaAssistantPath, content);
    }
}

// 3. Kas Masuk needs Nomor KK and Nama Warga
function fixKeuanganPage() {
    const filePath = 'frontend/src/pages/KeuanganPage.jsx';
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure we have identitas_pembayar mapping to Nama and Nomor KK
    // Check if newTransaksi form has nomor_kk
    if (!content.includes('nomor_kk:')) {
        content = content.replace(/identitas_pembayar: ''/, "identitas_pembayar: '', nomor_kk: ''");
        // Add Input for Nomor KK
        const inputKK = `
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor KK Pembayar</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                placeholder="16 Digit Nomor KK"
                value={newTransaksi.nomor_kk}
                onChange={(e) => setNewTransaksi({ ...newTransaksi, nomor_kk: e.target.value })}
                required={newTransaksi.jenis === 'MASUK'}
              />
            </div>
        `;
        content = content.replace(/<div>\s*<label className="block text-xs font-bold text-slate-700 mb-1">Nama Pembayar.*?<\/div>/s, (match) => {
            return inputKK + '\n' + match;
        });

        // Add to payload
        content = content.replace(/identitas_pembayar: newTransaksi.identitas_pembayar/g, "identitas_pembayar: `${newTransaksi.identitas_pembayar} - KK: ${newTransaksi.nomor_kk}`");
    }

    fs.writeFileSync(filePath, content);
}

fixDashboardRTRW();
updateKanayaAvatar();
fixKeuanganPage();
console.log("Fixes applied successfully.");
