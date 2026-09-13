@echo off
del /f /q .git\index
git reset
git add .
git commit -m "feat: Fitur Pencatatan Keuangan Kas RT-RW dan Tahap 6 PWA Offline Sync"
git push origin main
