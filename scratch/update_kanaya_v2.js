const fs = require('fs');

function updateKanaya(path) {
  if (!fs.existsSync(path)) return;
  let c = fs.readFileSync(path, 'utf8');
  
  // 1. Fix button link
  c = c.replace(
    '<button className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold shadow-sm border border-blue-100 transition-colors shrink-0 flex items-center gap-2">',
    '<Link to="/dashboard/analitik" className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold shadow-sm border border-blue-100 transition-colors shrink-0 flex items-center gap-2">'
  );
  c = c.replace(
    /Lihat Analitik Lengkap\n\s*<ArrowRight className="w-3.5 h-3.5" \/>\n\s*<\/button>/g,
    'Lihat Analitik Lengkap\n            <ArrowRight className="w-3.5 h-3.5" />\n          </Link>'
  );
  
  // 2. Update Copywriting
  const oldText = "{loadingBrief ? (\n                <span className=\"flex items-center gap-2\">\n                  <RefreshCw className=\"w-3 h-3 animate-spin\" /> Menganalisa data wilayah...\n                </span>\n              ) : (\n                aiBrief?.summary || 'Terdapat beberapa permohonan surat yang perlu segera diverifikasi. Data iuran warga menunjukkan 85% telah melunasi kewajiban bulan ini. Lansia sebatang kara dan anak yatim memerlukan perhatian khusus melalui program Bansos terdekat.'\n              )}";
  
  const newText = `{loadingBrief ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Menganalisa data wilayah...
                </span>
              ) : (
                aiBrief?.summary || \`Halo \${user?.name || 'Bapak/Ibu'}. Saat ini terdapat \${pendingDocs.length} permohonan surat yang menunggu verifikasi (SLA aktif). Tingkat partisipasi iuran kas mencapai \${iuranSummary.persentase} dari total \${iuranSummary.total_kk} KK (naik 5% dari bulan lalu). Kami juga mendeteksi \${kelompokRentanList.length} warga rentan (yatim & lansia) yang perlu diprioritaskan pada verifikasi penerima Bansos berikutnya agar penyaluran tepat sasaran.\`
              )}`;
              
  c = c.replace(oldText, newText);

  // 3. Add user name/jabatan and photo to Hero section for RT
  const heroOldRT = `<h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Meja Kerja Otoritas Ketua RT
            </h2>`;
  const heroNewRT = `<h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Meja Kerja Otoritas Ketua RT
            </h2>
            <p className="text-[10px] text-emerald-200 mt-0.5 font-medium">{user?.name || 'Bapak/Ibu RT'} - {user?.jabatan || 'Ketua RT ' + rtNomor}</p>`;
  if (!c.includes('{user?.name || \'Bapak/Ibu RT\'}')) {
      c = c.replace(heroOldRT, heroNewRT);
  }
  
  // 3. Add user name/jabatan and photo to Hero section for RW
  const heroOldRW = `<h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Meja Kerja Otoritas Ketua RW
            </h2>`;
  const heroNewRW = `<h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Meja Kerja Otoritas Ketua RW
            </h2>
            <p className="text-[10px] text-emerald-200 mt-0.5 font-medium">{user?.name || 'Bapak/Ibu RW'} - {user?.jabatan || 'Ketua RW ' + rwNomor}</p>`;
  if (!c.includes('{user?.name || \'Bapak/Ibu RW\'}')) {
      c = c.replace(heroOldRW, heroNewRW);
  }
  
  // 4. Avatar
  const avatarOld = '<ShieldCheck className="w-5 h-5 text-emerald-300" />';
  const avatarNew = `{user?.photo_url ? <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover rounded-xl" /> : <ShieldCheck className="w-5 h-5 text-emerald-300" />}`;
  c = c.replace(avatarOld, avatarNew);
  
  fs.writeFileSync(path, c);
  console.log('Updated ' + path);
}

updateKanaya('frontend/src/pages/dashboard/DashboardKetuaRT.jsx');
updateKanaya('frontend/src/pages/dashboard/DashboardKetuaRW.jsx');
