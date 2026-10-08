const fs = require('fs');

function fixDashboard(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix Verifikasi Surat -> handleTabChange + scroll
  content = content.replace(
    /const handleTabChange = \(newTab\) => setSearchParams\(\{ tab: newTab \}\);/,
    `const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
    setTimeout(() => {
      const el = document.getElementById(newTab === 'surat' ? 'antrean-verifikasi-rt' : newTab === 'rentan' ? 'radar-rentan-rt' : 'fasilitas-rt');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };`
  );

  // Add IDs to sections if not exist
  content = content.replace(
    /id="antrean-verifikasi-rt"/g,
    'id="antrean-verifikasi-rt"'
  );

  // Fix Loket Dampingan
  content = content.replace(
    /to="\/dashboard\/surat\?mode=dampingan"/g,
    'to="/dashboard/dokumen"'
  );

  // Add id to rentan tab
  content = content.replace(
    /activeTab === 'rentan' && \(\s*<div/g,
    "activeTab === 'rentan' && (\n        <div id=\"radar-rentan-rt\""
  );
  
  content = content.replace(
    /activeTab === 'fasilitas' && \(\s*<div/g,
    "activeTab === 'fasilitas' && (\n        <div id=\"fasilitas-rt\""
  );

  // Fix Analitik link if not /dashboard/analitik
  content = content.replace(
    /to="\/dashboard\/analitik"/g,
    'to="/dashboard/analitik"'
  );

  fs.writeFileSync(filePath, content);
  console.log('Fixed ' + filePath);
}

fixDashboard('frontend/src/pages/dashboard/DashboardKetuaRT.jsx');
fixDashboard('frontend/src/pages/dashboard/DashboardKetuaRW.jsx');
