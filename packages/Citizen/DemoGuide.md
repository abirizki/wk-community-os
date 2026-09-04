# SKTM End-to-End - Live Demo Guide

This guide provides a step-by-step script for demonstrating the complete SKTM request flow to stakeholders at Kelurahan Kebonjati.

---

### Preparation

1.  **Prepare User Accounts:** Ensure you have four separate user accounts with the following roles, and be prepared to log in and out as each:
    *   `Budi` (Role: `CITIZEN`, Address: RT 001/RW 001)
    *   `Pak RT` (Role: `RT`, Address: RT 001/RW 001)
    *   `Pak RW` (Role: `RW`, Address: RW 001)
    *   `Admin Kelurahan` (Role: `KELURAHAN`)
2.  **Prepare Attachments:** Have two sample image files ready on your computer to act as "Scan KTP" and "Scan KK".
3.  **Open Dashboards:** Have browser tabs open for the Analytics dashboard to show near-real-time updates.

---

### Demo Script

**Part 1: Citizen Request**

1.  **Action:** Log in as **Budi (Citizen)**.
2.  **Narrative:** "Kita akan mulai dari perspektif warga. Budi, seorang warga, perlu membuat SKTM untuk sekolah anaknya. Dia login ke portal WargaKita."
3.  **Action:** Navigate to the Letter Service menu and select "Buat Surat Keterangan Tidak Mampu".
4.  **Narrative:** "Data diri Budi sudah terisi otomatis dari data kependudukan. Dia hanya perlu mengisi untuk apa surat ini dibuat."
5.  **Action:** Fill in the "Keperluan" field with "Pendaftaran sekolah". Upload the two sample images as KTP and KK. Click "Ajukan Permohonan".
6.  **Narrative:** "Setelah diajukan, Budi langsung mendapatkan nomor pelacakan dan notifikasi di inbox-nya bahwa pengajuan sedang diproses dan menunggu persetujuan RT."

**Part 2: RT Approval**

1.  **Action:** Log out from Budi. Log in as **Pak RT**.
2.  **Narrative:** "Sekarang kita beralih ke Ketua RT. Pak RT menerima notifikasi di dashboard-nya bahwa ada permintaan surat baru."
3.  **Action:** Click the notification. Review the details submitted by Budi.
4.  **Narrative:** "Pak RT bisa memeriksa semua data dan lampiran. Karena datanya sudah benar, beliau akan langsung menyetujuinya."
5.  **Action:** Click "Setujui".

**Part 3: RW Approval**

1.  **Action:** Log out from Pak RT. Log in as **Pak RW**.
2.  **Narrative:** "Setelah disetujui RT, permintaan otomatis diteruskan ke Ketua RW. Pak RW juga menerima notifikasi serupa."
3.  **Action:** Click the notification, review the request, and click "Setujui".

**Part 4: Kelurahan Finalization**

1.  **Action:** Log out from Pak RW. Log in as **Admin Kelurahan**.
2.  **Narrative:** "Terakhir, permintaan sampai di meja staf Kelurahan untuk finalisasi dan penerbitan."
3.  **Action:** Find the request in the incoming letters queue. Click "Setujui & Terbitkan".
4.  **Narrative:** "Saat tombol ini ditekan, sistem secara otomatis melakukan tiga hal: membuat nomor surat resmi, membuat dokumen PDF lengkap dengan QR code, dan menyimpan dokumen tersebut. Proses selesai."

**Part 5: Citizen Receives Document**

1.  **Action:** Log out from Admin Kelurahan. Log in again as **Budi (Citizen)**.
2.  **Narrative:** "Budi kini menerima notifikasi bahwa suratnya sudah selesai."
3.  **Action:** Navigate to the letter history. Click "Unduh PDF" on the completed SKTM request. Open the downloaded PDF.
4.  **Narrative:** "Ini adalah dokumen resmi yang dihasilkan sistem, lengkap dengan nomor surat dan QR code untuk verifikasi."
5.  **Action:** (Optional) Scan the QR code with a phone to show the live verification page.

**Part 6: Analytics & Reporting**

1.  **Action:** Switch to the browser tab showing the Analytics Dashboard (logged in as Admin Kelurahan).
2.  **Narrative:** "Setiap proses ini tercatat. Jika kita refresh dashboard analitik, kita bisa lihat metrik seperti 'Jumlah Surat Diterbitkan' akan bertambah. Data ini yang akan digunakan untuk laporan pimpinan."

---

**End of Demo.**