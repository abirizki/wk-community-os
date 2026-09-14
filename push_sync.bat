@echo off
del /f /q .git\index
git reset
git add .
git commit -m "docs: Tambahkan laporan audit menyeluruh platform Bumi Warga (AUDIT_MENYELURUH_BUMI_WARGA.md)"
git push origin main
