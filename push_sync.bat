@echo off
del /f /q .git\index
git reset
git add .
git commit -m "docs: Tambahkan laporan audit menyeluruh platform Bumi Warga (AUDIT_MENYELURUH_BUMI_WARGA.md)"
git commit -m "docs: Tambahkan master prompt system infografis visual 6 user module Bumi Warga"
git push origin main
