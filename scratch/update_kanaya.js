const fs = require('fs');

function updateKanaya(path) {
  if (!fs.existsSync(path)) return;
  let c = fs.readFileSync(path, 'utf8');
  
  // Fix button link
  c = c.replace(
    '<button className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold shadow-sm border border-blue-100 transition-colors shrink-0 flex items-center gap-2">',
    '<Link to="/dashboard/analitik" className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold shadow-sm border border-blue-100 transition-colors shrink-0 flex items-center gap-2">'
  );
  c = c.replace(
    /Lihat Analitik Lengkap\n\s*<ArrowRight className="w-3.5 h-3.5" \/>\n\s*<\/button>/,
    'Lihat Analitik Lengkap\n            <ArrowRight className="w-3.5 h-3.5" />\n          </Link>'
  );
  
  // Update Copywriting
  const oldText = "'Terdapat beberapa permohonan surat yang perlu segera diverifikasi. Data iuran warga menunjukkan 85% telah melunasi kewajiban bulan ini. Lansia sebatang kara dan anak yatim memerlukan perhatian khusus melalui program Bansos terdekat.'";
  const newText = '`Halo, ${user?.name || "Bapak/Ibu"}. Terdapat ${pendingDocs.length} permohonan surat yang menunggu verifikasi. Tingkat partisipasi iuran kas mencapai ${iuranSummary.persentase} dari total ${iuranSummary.total_kk} KK. Kami juga mendeteksi ${kelompokRentanList.length} warga rentan (yatim & lansia) yang perlu diprioritaskan pada penyaluran Bansos berikutnya.`';
  
  c = c.replace(oldText, newText);

  // Add user name/jabatan and photo to Hero section
  const heroOld = '<h2 className="text-sm sm:text-base font-bold text-white mt-0.5">\n              Meja Kerja Otoritas Ketua RT\n            </h2>';
  const heroNew = `<h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Meja Kerja Otoritas Ketua RT
            </h2>
            <p className="text-[10px] text-emerald-200 mt-0.5">{user?.name || 'Admin RT'} - {user?.role || 'Ketua RT'}</p>`;
  c = c.replace(heroOld, heroNew);
  
  // Same for RW
  const heroOldRW = '<h2 className="text-sm sm:text-base font-bold text-white mt-0.5">\n              Meja Kerja Otoritas Ketua RW\n            </h2>';
  const heroNewRW = `<h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Meja Kerja Otoritas Ketua RW
            </h2>
            <p className="text-[10px] text-emerald-200 mt-0.5">{user?.name || 'Admin RW'} - {user?.role || 'Ketua RW'}</p>`;
  c = c.replace(heroOldRW, heroNewRW);
  
  // Avatar
  const avatarOld = '<ShieldCheck className="w-5 h-5 text-emerald-300" />';
  const avatarNew = `{user?.photo_url ? <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover rounded-xl" /> : <ShieldCheck className="w-5 h-5 text-emerald-300" />}`;
  c = c.replace(avatarOld, avatarNew);
  
  fs.writeFileSync(path, c);
  console.log('Updated ' + path);
}

updateKanaya('frontend/src/pages/dashboard/DashboardKetuaRT.jsx');
updateKanaya('frontend/src/pages/dashboard/DashboardKetuaRW.jsx');
