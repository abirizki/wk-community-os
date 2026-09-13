@echo off
del /f /q .git\index
git reset
git add .
git commit -m "fix(backend): Tutup kurung kurawal getStats di bansos.repository.js untuk mengatasi 503 error"
git push origin main
