const fs = require('fs');

function addAISummary(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  const aiSummaryBlock = `
      {/* AI Summary / Kanaya Insight */}
      <div className="mb-6 p-5 rounded-[1.5rem] bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100/50 shadow-sm relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute left-0 bottom-0 w-24 h-24 bg-sky-200/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-blue-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-extrabold text-blue-900">Ringkasan Pintar Kanaya AI</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold uppercase tracking-wider">Update Hari Ini</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-800/80 leading-relaxed font-medium">
              {loadingBrief ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Menganalisa data wilayah...
                </span>
              ) : (
                aiBrief?.summary || 'Terdapat beberapa permohonan surat yang perlu segera diverifikasi. Data iuran warga menunjukkan 85% telah melunasi kewajiban bulan ini. Lansia sebatang kara dan anak yatim memerlukan perhatian khusus melalui program Bansos terdekat.'
              )}
            </p>
          </div>
          <button className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold shadow-sm border border-blue-100 transition-colors shrink-0 flex items-center gap-2">
            Lihat Analitik Lengkap
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
`;

  if (!content.includes('Ringkasan Pintar Kanaya AI')) {
    content = content.replace(
      /\{\/\* 2\. Super Apps Bento Quick Launcher/,
      aiSummaryBlock + '\n      {/* 2. Super Apps Bento Quick Launcher'
    );
    fs.writeFileSync(filePath, content);
    console.log('Added AI summary to ' + filePath);
  }
}

addAISummary('frontend/src/pages/dashboard/DashboardKetuaRT.jsx');
addAISummary('frontend/src/pages/dashboard/DashboardKetuaRW.jsx');

