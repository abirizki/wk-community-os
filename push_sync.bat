@echo off
del /f /q .git\index
git reset
git add .
git commit -m "fix(backend): Perbaiki penutupan fungsi getBansosStats dan hapus duplikasi blok di bansos.service.js"
git push origin main
