@echo off  
if exist .git\index del /f /q .git\index  
git reset  
git add frontend/src/pages/BansosPage.jsx frontend/src/pages/ProfilePage.jsx src/services/bansos.service.js src/routes/bansos.routes.js public/index.html public/assets/index-Bp2wQmdF.css public/assets/index-CxzY3Vdv.js
git commit -m "feat: Tahap 3 - Cetak Berita Acara Bansos dan Rekapitulasi Profil Warga"
git push origin main
del /f /q push_tahap3.bat
