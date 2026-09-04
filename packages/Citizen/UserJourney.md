# SKTM Service - User Journey

This document outlines the end-to-end user journey for requesting a Surat Keterangan Tidak Mampu (SKTM) through the WK Community OS platform.

---

### Personas

1.  **Budi (Citizen):** A resident of RT 001/RW 001 who needs an SKTM for his child's school registration.
2.  **Pak RT (Ketua RT):** The head of RT 001, responsible for initial verification of citizen requests.
3.  **Pak RW (Ketua RW):** The head of RW 001, responsible for second-level verification.
4.  **Admin Kelurahan (Staf Kelurahan):** A staff member at the Kelurahan office responsible for final approval and document issuance.

---

### 1. Citizen's Journey (Budi)

1.  **Login:** Budi logs into the WK Community OS citizen portal using his credentials.
2.  **Navigate to Dashboard:** Budi is presented with his personal dashboard, showing recent notifications and a "Quick Actions" menu.
3.  **Initiate Request:** Budi clicks on "Layanan Surat" (Letter Service) and selects "Surat Keterangan Tidak Mampu (SKTM)" from the list.
4.  **Fill Form:** A form appears, pre-filled with Budi's data from the Citizen and Household registry (Name, NIK, Address). He only needs to fill in the purpose (`keperluan`) for the letter, e.g., "Untuk pendaftaran sekolah anak".
5.  **Upload Attachments:** The form requires Budi to upload scans of his KTP and Kartu Keluarga. He uploads the required files.
6.  **Submit Request:** Budi reviews the data and clicks "Ajukan Permohonan" (Submit Request).
7.  **Receive Confirmation:** The system displays a success message with a public tracking number (e.g., `LTR-20260803-XYZ`). Budi also receives an "Inbox" notification confirming his request has been submitted and is awaiting RT approval.

---

### 2. RT's Journey (Pak RT)

1.  **Receive Notification:** Pak RT receives a notification on his RT Dashboard: "Permintaan SKTM dari Budi menunggu persetujuan Anda."
2.  **Review Request:** He clicks the notification, which takes him to the letter approval page. He can see all of Budi's data, the purpose of the letter, and the attached KTP and KK.
3.  **Verify Data:** Pak RT verifies that Budi is indeed his resident and the data is correct.
4.  **Approve:** He clicks "Setujui" (Approve) and adds an optional note, "Data valid."
5.  **Status Update:** The system automatically forwards the request to the next level (RW). Pak RT sees the letter's status change to "Menunggu Persetujuan RW" (Awaiting RW Approval) in his dashboard.

---

### 3. RW's Journey (Pak RW)

1.  **Receive Notification:** Pak RW receives a notification on his RW Dashboard: "Permintaan SKTM dari Budi (RT 001) telah disetujui RT dan menunggu persetujuan Anda."
2.  **Review Request:** He clicks the notification and reviews the request details, including the approval note from Pak RT.
3.  **Approve:** Confident in the RT's verification, Pak RW clicks "Setujui" (Approve).
4.  **Status Update:** The system forwards the request to the Kelurahan. The letter's status changes to "Menunggu Finalisasi Kelurahan" (Awaiting Kelurahan Finalization).

---

### 4. Kelurahan Staff's Journey (Admin Kelurahan)

1.  **Receive Notification:** The Admin Kelurahan sees the request in their "Surat Masuk" (Incoming Letters) queue on the Kelurahan Dashboard.
2.  **Final Review:** The admin clicks on the request and performs a final review of all data and approval history.
3.  **Finalize & Generate:** The admin clicks "Setujui & Terbitkan" (Approve & Issue). This triggers several automated actions:
    *   The `LetterService` generates an official letter number (e.g., `470/123/SKTM/VIII/2026`).
    *   The `PDFService` generates a PDF of the SKTM using a standard template, populating it with Budi's data and the new letter number.
    *   The `QRCodeService` generates a unique QR code for verification and embeds it into the PDF.
    *   The final PDF is stored in the system's document storage.
4.  **Status Update:** The letter's status is now "Selesai" (Completed).

---

### 5. Closing the Loop (Budi)

1.  **Receive Final Notification:** Budi receives a new notification: "Surat Keterangan Tidak Mampu Anda telah selesai diproses dan siap diunduh."
2.  **Download Document:** Budi clicks the notification, which takes him to his letter history page. He sees the completed SKTM request and a "Unduh PDF" (Download PDF) button.
3.  **Verification:** The downloaded PDF contains the official letter with a QR code. When scanned, the QR code leads to a public verification page on the WK OS portal, confirming the letter's authenticity.

---

### 6. System's Background Journey

*   **EventBus:** Throughout the process, events like `Letter.Submitted`, `Workflow.StateChanged`, and `Letter.Completed` are published.
*   **Audit Trail:** Every action (submit, approve, generate) is logged in the audit trail for accountability.
*   **Analytics:** After the letter is completed, the `Analytics` package's scheduled job will process this event, updating metrics like "Total SKTM Issued this Month" and "Average Letter Processing Time".
*   **Dashboard Refresh:** The updated analytics data is pushed to the cache, and all relevant dashboards (RT, RW, Kelurahan) will display the new statistics on their next refresh.