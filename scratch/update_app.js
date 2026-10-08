const fs = require('fs');
let appJsx = fs.readFileSync('frontend/src/App.jsx', 'utf8');
if (!appJsx.includes('AnalyticsDashboardPage')) {
  appJsx = appJsx.replace(
    "import VerifySuratPage from './pages/VerifySuratPage';",
    "import VerifySuratPage from './pages/VerifySuratPage';\nimport AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';"
  );
  appJsx = appJsx.replace(
    "<Route path=\"dokumen\" element={<DokumenPage />} />",
    "<Route path=\"dokumen\" element={<DokumenPage />} />\n            <Route path=\"analitik\" element={<AnalyticsDashboardPage />} />"
  );
  fs.writeFileSync('frontend/src/App.jsx', appJsx);
  console.log('App.jsx updated with AnalyticsDashboardPage');
} else {
  console.log('AnalyticsDashboardPage already in App.jsx');
}

