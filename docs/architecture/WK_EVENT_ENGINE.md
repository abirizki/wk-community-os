**WK COMMUNITY OS ENTERPRISE EDITION**

**CETAK BIRU EVENT ENGINE**

---

## 1. Halaman Muka

| | |
| :--- | :--- |
| **Kode Dokumen** | `DOC-019` |
| **Nama Dokumen** | Cetak Biru Event Engine |
| **Versi** | 1.0.0 |
| **Status** | `DRAFT` |
| **Penulis** | Enterprise Solution Architect, Event Driven System Architect |
| **Peninjau** | Chief Software Architect, Lead DevOps Engineer |
| **Persetujuan** | Steering Committee |
| **Pembaruan Terakhir**| 29 Juli 2026 |

---

## 2. Executive Summary

Dokumen ini adalah cetak biru resmi untuk **Event Engine**, komponen arsitektur inti yang berfungsi sebagai sistem saraf pusat dari platform WK Community OS. Dalam arsitektur modern, sistem tidak lagi hanya merespons permintaan langsung, tetapi juga bereaksi terhadap peristiwa (*events*) yang terjadi di dalamnya. Event Engine adalah orkestrator utama yang menangkap, mengelola, dan mendistribusikan setiap peristiwa bisnis yang signifikan.

Tujuan utamanya adalah untuk menciptakan arsitektur yang sangat *decoupled* (tidak saling bergantung secara erat), skabel, dan dapat diaudit. Setiap kali ada perubahan data—seperti warga baru terdaftar, surat disetujui, atau aduan dibuat—sebuah *event* akan dipublikasikan. *Event* ini kemudian akan "didengarkan" dan diproses oleh komponen lain seperti *Rule Engine*, *Notification Engine*, *Community Score Engine*, dan *Audit Trail*. Dengan demikian, Event Engine memastikan bahwa setiap aksi memiliki reaksi yang terkoordinasi dan terotomatisasi di seluruh ekosistem.

## 3. Event Philosophy

Filosofi di balik Event Engine adalah **"Everything that happens becomes an Event"** (Segala sesuatu yang terjadi menjadi sebuah Peristiwa).

Ini berarti setiap perubahan keadaan (*state change*) yang signifikan dalam sistem harus direpresentasikan sebagai sebuah *event* yang tidak dapat diubah (*immutable*). Sebuah *event* adalah catatan fakta tentang sesuatu yang telah terjadi. Contoh: `Citizen.Created`, `Letter.Approved`, `PBB.Paid`.

**Prinsip Kunci:**
- **Immutable:** Sebuah *event* adalah rekaman masa lalu dan tidak boleh diubah.
- **Asynchronous:** Modul yang mempublikasikan *event* tidak perlu menunggu modul lain selesai memprosesnya. Ini meningkatkan responsivitas dan skalabilitas sistem.
- **Single Source of Truth for Actions:** Log dari semua *event* menjadi catatan audit yang sempurna tentang semua aktivitas yang terjadi di dalam sistem.
- **Decoupling:** Modul A tidak perlu tahu tentang Modul B. Modul A hanya perlu mempublikasikan *event*, dan Modul B (jika tertarik) akan berlangganan dan bereaksi terhadap *event* tersebut.

## 4. Event Driven Architecture

Arsitektur ini memungkinkan komunikasi asinkron dan pemrosesan paralel, di mana *Event Engine* bertindak sebagai *broker* atau perantara utama.

```ascii
 +----------------+
 |  Citizen Module, |
 |  Letter Module,  |
 |  PBB Module, etc.|
 +----------------+
         | (1. Publish Event)
         v
 +----------------+
 |  Event Engine  | (Validates & Creates Event Object)
 +----------------+
         | (2. Push to Queue)
         v
 +----------------+
 |   Event Queue  | (FIFO, Persistent)
 +----------------+
         | (3. Subscribers Pull Events)
         |
+---------+---------+---------+---------+---------+---------+---------+
|         |         |         |         |         |         |         |
v         v         v         v         v         v         v         v
+--------++--------++--------++--------++--------++--------++--------++
| Rule   || Notif. || Comm.  || Dash-  || Audit  || Knowl. || AI     ||
| Engine || Engine || Score  || board  || Trail  || Graph  || Engine ||
|        ||        || Engine ||        ||        || (Future)|| (Future)||
+--------++--------++--------++--------++--------++--------++--------++
```

## 5. Event Lifecycle

Setiap *event* memiliki siklus hidup yang terkelola untuk memastikan pemrosesan yang andal.

```ascii
  (*)
   |
   v
[1. Created] --> [2. Queued] --> [3. Validated] --> [4. Processed] --> [5. Completed]
    |                 |               | (Invalid)        | (Failed)         |
    |                 |               v                  v                  |
    |                 |        [Dead Letter] <---- [Retry Queue]            |
    |                 |            Queue                                  |
    |                 |                                                     |
    |                 +-----------------------------------------------------+
    |
    +----------------------------------------------------------------------> [6. Archived]
```

1.  **Created:** *Event* dibuat oleh sebuah modul bisnis.
2.  **Queued:** *Event* dimasukkan ke dalam antrean utama.
3.  **Validated:** Sebelum diproses, struktur dan payload *event* divalidasi. Jika tidak valid, langsung masuk ke *Dead Letter Queue* (DLQ).
4.  **Processed:** *Subscriber* mengambil *event* dari antrean dan mulai memprosesnya.
5.  **Completed:** *Subscriber* berhasil memproses *event*.
6.  **Archived:** Setelah selesai diproses oleh semua *subscriber* dan melewati periode retensi, *event* dipindahkan ke penyimpanan arsip.

## 6. Event Categories

| Kategori | Deskripsi |
| :--- | :--- |
| **Citizen** | Semua peristiwa terkait data warga (create, update, move). |
| **Family** | Peristiwa terkait Kartu Keluarga (create, split, merge). |
| **Education** | Peristiwa terkait status pendidikan anak (register, graduate, dropout). |
| **Health** | Peristiwa terkait data kesehatan (checkup, immunization). |
| **Posyandu** | Peristiwa spesifik dari modul Posyandu (visit, stunting detected). |
| **PBB** | Peristiwa terkait pembayaran Pajak Bumi dan Bangunan (paid, overdue). |
| **Letter** | Peristiwa dalam alur kerja surat (created, approved, rejected, printed). |
| **Complaint** | Peristiwa dalam alur kerja aduan (created, assigned, resolved, closed). |
| **Forum** | Peristiwa interaksi di forum (topic_created, comment_posted). |
| **Aspiration** | Peristiwa dalam alur kerja aspirasi (created, voted, discussed, accepted). |
| **Dashboard** | Peristiwa terkait pembaruan atau refresh data dasbor. |
| **Community Score**| Peristiwa terkait perubahan skor (score_updated, index_decreased). |
| **Security** | Peristiwa terkait keamanan (login_failed, permission_changed). |
| **System** | Peristiwa tingkat sistem (backup_started, service_down). |
| **Audit** | Peristiwa yang secara spesifik dibuat untuk tujuan audit. |
| **Notification**| Peristiwa terkait status pengiriman notifikasi (sent, failed, read). |

## 7. Event Types

| Tipe Event | Deskripsi |
| :--- | :--- |
| **Create** | Sebuah entitas baru dibuat. |
| **Update** | Sebuah entitas yang ada diperbarui. |
| **Delete** | Sebuah entitas dihapus atau dinonaktifkan. |
| **Approve** | Sebuah item dalam alur kerja disetujui. |
| **Reject** | Sebuah item dalam alur kerja ditolak. |
| **Verify** | Sebuah data telah diverifikasi kebenarannya. |
| **Register** | Seseorang atau sesuatu didaftarkan ke sebuah layanan/program. |
| **Move** | Sebuah entitas dipindahkan (misalnya, warga pindah RT). |
| **Transfer** | Kepemilikan atau tanggung jawab ditransfer. |
| **Login** | Pengguna berhasil masuk ke sistem. |
| **Logout** | Pengguna keluar dari sistem. |
| **Reminder** | Pemicu pengingat berdasarkan waktu. |
| **Alert** | Peringatan penting yang membutuhkan perhatian. |
| **Emergency** | Peringatan darurat. |
| **Synchronization**| Peristiwa yang memicu sinkronisasi data antar sistem. |

## 8. Event Payload Standard

Setiap *event* yang dipublikasikan HARUS mengikuti struktur JSON standar ini.

| Field | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `eventId` | String (UUID) | ID unik untuk setiap *event*. |
| `eventType` | String | Nama *event* sesuai standar (e.g., `Citizen.Created`). |
| `module` | String | Modul yang mempublikasikan *event* (e.g., `"citizen"`). |
| `referenceId` | String | ID dari entitas utama yang terkait dengan *event* (e.g., NIK warga, ID surat). |
| `user` | Object | Informasi pengguna yang memicu *event* (e.g., `{id: 'email', role: 'RT'}`). |
| `timestamp` | ISO 8601 | Waktu saat *event* dibuat. |
| `priority` | Enum | Prioritas pemrosesan (`HIGH`, `MEDIUM`, `LOW`). |
| `status` | Enum | Status siklus hidup *event* (`CREATED`, `QUEUED`, etc.). |
| `payload` | Object | Data utama dari *event*. Bisa berisi data sebelum (`before`) dan sesudah (`after`) perubahan. |
| `source` | String | Sumber pemicu *event* (e.g., "UI", "Scheduler", "API"). |
| `destination` | Array | (Opsional) Menentukan *subscriber* spesifik yang dituju. Jika kosong, di-broadcast. |
| `correlationId`| String (UUID) | ID yang sama untuk serangkaian *event* dalam satu transaksi bisnis. |
| `traceId` | String (UUID) | ID unik untuk melacak seluruh jejak permintaan dari awal hingga akhir. |

## 9. Event Naming Standard

Semua nama *event* (`eventType`) harus mengikuti format: **`Module.Subject.Action`**

| Contoh | Deskripsi |
| :--- | :--- |
| `Citizen.Created` | Seorang warga baru telah dibuat. |
| `Citizen.Data.Updated` | Data seorang warga telah diperbarui. |
| `Citizen.Address.Moved` | Seorang warga telah pindah alamat. |
| `Family.Member.Added` | Anggota baru ditambahkan ke sebuah KK. |
| `Letter.Status.Approved` | Sebuah surat telah disetujui. |
| `PBB.Payment.Verified` | Pembayaran PBB telah diverifikasi. |
| `Complaint.Created` | Sebuah aduan baru telah dibuat. |
| `Complaint.Status.Resolved`| Sebuah aduan telah diselesaikan. |
| `Education.Student.Registered`| Seorang anak telah terdaftar di sekolah. |
| `Posyandu.Visit.Recorded` | Kunjungan Posyandu telah dicatat. |
| `Community.Score.Updated` | Community Score sebuah wilayah telah diperbarui. |
| `Notification.Status.Sent` | Sebuah notifikasi telah berhasil dikirim. |
| `Security.Login.Failed` | Terjadi kegagalan login. |

## 10. Event Queue

- **FIFO (First-In, First-Out):** Antrean utama bersifat FIFO.
- **Priority Queues (Future):** Di masa depan, dapat diimplementasikan beberapa antrean berdasarkan prioritas (`critical_queue`, `high_queue`, `default_queue`).
- **Retry Queue:** Antrean khusus untuk *event* yang gagal diproses, dengan mekanisme *exponential backoff*.
- **Dead Letter Queue (DLQ):** "Tempat sampah" untuk *event* yang gagal permanen setelah beberapa kali percobaan ulang. Memerlukan monitoring oleh administrator.
- **Duplicate Prevention:** *Event Engine* akan memeriksa `eventId` untuk mencegah pemrosesan *event* yang sama lebih dari satu kali.
- **Event Timeout:** Setiap pemrosesan *event* memiliki batas waktu (e.g., 5 menit di Apps Script). Jika terlampaui, dianggap gagal dan masuk ke *Retry Queue*.

## 11. Event Routing

*Event Engine* memiliki *router* internal yang akan meneruskan *event* ke *subscriber* yang tepat.
- **Topic-based Routing:** *Subscriber* mendaftarkan diri untuk "topik" tertentu. Contoh: `NotificationEngine` berlangganan pada topik `*.Approved`, `*.Rejected`, `*.Reminder`. `CommunityScoreEngine` berlangganan pada topik `PBB.Paid`, `Posyandu.Visit.Recorded`, dll.
- **Content-based Routing:** (Future) *Routing* berdasarkan isi dari *payload event*. Contoh: `IF event.payload.aduan.kategori == 'EMERGENCY' THEN routeTo('EmergencyHandler')`.

## 12. Event Repository

- **Storage:** Untuk v1.0, log *event* akan disimpan di Google Spreadsheet terpisah atau Firestore (jika memungkinkan) untuk performa yang lebih baik.
- **Retention:** *Event* di repositori utama akan disimpan selama 30 hari.
- **Archive:** Setelah 30 hari, *event* akan dipindahkan ke Google Cloud Storage (sebagai file JSON/CSV) untuk penyimpanan jangka panjang (hingga 7 tahun) demi kepentingan audit.
- **History & Search:** Antarmuka admin akan disediakan untuk mencari dan melihat riwayat *event* berdasarkan `eventId`, `referenceId`, `eventType`, atau `timestamp`.
- **Replay Event:** Administrator dapat memicu pemrosesan ulang (*replay*) sebuah *event* dari DLQ atau arsip untuk tujuan perbaikan data atau *debugging*.

## 13. Business Rules

| Event | Aksi yang Dipicu |
| :--- | :--- |
| `Citizen.Created` | 1. `RuleEngine`: Cek apakah perlu didaftarkan ke Posyandu.<br>2. `CommunityScore`: Update statistik demografi.<br>3. `Audit`: Catat pembuatan warga baru. |
| `Letter.Approved` (oleh RW) | 1. `NotificationEngine`: Kirim notifikasi ke Kelurahan.<br>2. `Dashboard`: Update status surat di dasbor layanan. |
| `PBB.Paid` | 1. `CommunityScore`: Update Governance Score & Economy Score.<br>2. `Dashboard`: Update persentase kepatuhan PBB.<br>3. `KPIEngine`: Hitung ulang KPI Realisasi Pendapatan. |
| `Complaint.Resolved` | 1. `NotificationEngine`: Kirim notifikasi ke pelapor untuk konfirmasi.<br>2. `Dashboard`: Pindahkan aduan dari "Dalam Pengerjaan" ke "Menunggu Konfirmasi". |
| `Posyandu.Visit.Recorded` | 1. `RuleEngine`: Cek risiko stunting/gizi buruk.<br>2. `CommunityScore`: Update Health Score.<br>3. `Dashboard`: Update grafik tumbuh kembang anak. |
| `Aspiration.Voted` | 1. `Dashboard`: Update jumlah suara pada dasbor aspirasi. |
| `Security.Login.Failed` (3x) | 1. `RuleEngine`: Kunci akun sementara.<br>2. `NotificationEngine`: Kirim notifikasi keamanan ke pemilik akun. |

*(...dan puluhan aturan lainnya yang menghubungkan event dengan aksi di berbagai engine)*

## 14. Dashboard

| Dashboard | Widget Utama |
| :--- | :--- |
| **Dashboard Event** | - Grafik volume *event* per jam/hari.<br>- Tabel *event* terbaru secara *real-time*. |
| **Dashboard Queue** | - Jumlah *event* saat ini di Antrean Utama, Antrean Retry, dan DLQ. |
| **Dashboard Monitoring** | - Rata-rata waktu pemrosesan *event*.<br>- Tingkat kegagalan pemrosesan (%). |
| **Dashboard Performance**| - Throughput sistem (event per detik/menit).<br>- Perbandingan performa antar jenis *event*. |
| **Dashboard Failure** | - Daftar *event* di DLQ beserta alasan kegagalannya. |
| **Dashboard History** | - Antarmuka untuk mencari dan melihat detail *event* yang telah diarsip. |

## 15. Event Monitoring

- **Realtime Monitor:** Sebuah halaman admin yang menampilkan aliran *event* yang masuk dan status antrean secara langsung.
- **Alerting:** Administrator akan menerima notifikasi `CRITICAL` jika:
    - Jumlah *event* di DLQ > 10.
    - Rata-rata waktu antrean > 5 menit.
    - Tingkat kegagalan > 5%.
- **Event Statistics:** Laporan harian/mingguan mengenai total *event* yang diproses, gagal, dan rata-rata waktu pemrosesan.

## 16. Security

- **Permission:** Hanya *backend service* yang terotentikasi yang dapat mempublikasikan *event*.
- **Audit:** Semua *event* yang dipublikasikan dan diproses tercatat, menyediakan jejak audit yang lengkap.
- **Event Signature (Future):** Setiap *event* dapat ditandatangani secara digital untuk memastikan integritas dan keasliannya.
- **Tamper Detection:** Mekanisme untuk mendeteksi jika ada upaya untuk mengubah *event* yang sudah tersimpan.
- **Privacy:** *Payload event* tidak boleh berisi PII (Personally Identifiable Information) dalam bentuk teks biasa jika tidak benar-benar diperlukan. Gunakan ID referensi.
- **Retention Policy:** Kebijakan retensi yang jelas untuk data *event* di berbagai media penyimpanan.

## 17. Integration

| Komponen | Cara Integrasi |
| :--- | :--- |
| **Rule Engine** | Berlangganan pada *event* bisnis (e.g., `Citizen.Updated`) untuk mengevaluasi aturan. |
| **Notification Engine**| Berlangganan pada *event* yang memerlukan pemberitahuan (e.g., `Letter.Approved`). |
| **Community Score** | Berlangganan pada *event* yang memengaruhi metrik (e.g., `PBB.Paid`, `Posyandu.Visit.Recorded`). |
| **Dashboard** | Berlangganan pada *event* pembaruan data untuk me-refresh *cache* atau tampilan secara *real-time*. |
| **Knowledge Graph** | Sebuah proses ETL akan berlangganan pada semua *event* untuk memperbarui *Knowledge Graph* secara mendekati *real-time*. |
| **AI Engine** | Berlangganan pada aliran *event* untuk melatih model atau mendeteksi anomali. |
| **GIS** | Berlangganan pada *event* yang memiliki data lokasi (e.g., `Complaint.Created`) untuk memperbarui peta. |

## 18. KPI

| ID | KPI | Deskripsi |
| :--- | :--- | :--- |
| EVT-KPI-01 | **Total Events Processed** | Jumlah total *event* yang berhasil diproses per hari/jam. |
| EVT-KPI-02 | **Failed Event Rate** | Persentase *event* yang masuk ke DLQ. |
| EVT-KPI-03 | **Retry Event Rate** | Persentase *event* yang memerlukan percobaan ulang. |
| EVT-KPI-04 | **Average Processing Time**| Rata-rata waktu dari *event* di-queue hingga *completed*. |
| EVT-KPI-05 | **Average Queue Length** | Rata-rata jumlah *event* yang menunggu di antrean. |
| EVT-KPI-06 | **System Throughput** | Jumlah maksimum *event* yang dapat diproses per menit. |

## 19. Sequence Diagram (ASCII)

**Skenario: Event `Letter.Approved`**

```ascii
 :LetterService  :EventEngine      :EventQueue       :NotificationEngine  :DashboardService
      |                |                 |                    |                    |
      | approve()      |                 |                    |                    |
      | ...            |                 |                    |                    |
      | publish()      |                 |                    |                    |
      |--------------->|                 |                    |                    |
      |                | create(event)   |                    |                    |
      |                | push(event)     |                    |                    |
      |                |---------------->|                 |                    |
      |                |                 | (Event is Queued)  |                    |
      | (Returns OK)   |                 |                    |                    |
      |<---------------|                 |                    |                    |
      |                |                 |                    |                    |
      | (Later, via Scheduler)           |                    |                    |
      |                |                 |                    |                    |
      |                |                 | <---pull()---------|                    |
      |                |                 |                    | process(event)     |
      |                |                 |                    |------------------->| (Sends Notif)
      |                |                 |                    |                    |
      |                |                 | <---pull()------------------------------|
      |                |                 |                                          | process(event)
      |                |                 |                                          |-------------> (Updates Cache)
      |                |                 |                                          |
```

## 20. Activity Diagram (ASCII)

**Skenario: Logika Pemrosesan Event oleh Subscriber**

```ascii
      (*)
       |
       v
[Subscriber pulls Event from Queue]
       |
       v
[Acknowledge Event (to prevent re-pulling by others)]
       |
       v
<Process>
[Execute Business Logic based on Event Payload]
       |
       +-----> [Processing Failed?] --(Yes)--> [Publish to Retry Queue] --> (X)
       |
       v (No)
[Mark Event as Completed]
       |
       v
      (X)
```

## 21. CRUD Matrix

| Entitas | Admin | Sistem | Modul Bisnis |
| :--- | :---: | :---: | :---: |
| **Event** | R | C R U | C |
| **Event History** | R | C R | |
| **Event Config** | C R U D | R | |

## 22. Permission Matrix

| Aksi | Admin | Developer | Sistem |
| :--- | :---: | :---: | :---: |
| **event.publish** | ✓ (Manual) | | ✓ |
| **event.view.all** | ✓ | ✓ (Read-only) | ✓ |
| **event.replay** | ✓ | | |
| **event.manage.dlq** | ✓ | | ✓ |
| **event.view.dashboard**| ✓ | ✓ | |

## 23. Testing Scenario

1.  **TS-EVT-01:** Publikasi event `Citizen.Created` berhasil masuk ke antrean.
2.  **TS-EVT-02:** Subscriber `AuditTrail` berhasil memproses event `Citizen.Created`.
3.  **TS-EVT-03:** Subscriber `CommunityScore` berhasil memproses event `Citizen.Created`.
4.  **TS-EVT-04:** Publikasi event `Letter.Approved` memicu `NotificationEngine`.
5.  **TS-EVT-05:** Publikasi event `PBB.Paid` memicu `CommunityScoreEngine`.
6.  **TS-EVT-06:** Publikasi event dengan `eventType` yang tidak dikenal. Verifikasi event masuk ke DLQ.
7.  **TS-EVT-07:** Publikasi event dengan payload yang tidak valid. Verifikasi event masuk ke DLQ.
8.  **TS-EVT-08:** Subscriber gagal memproses event. Verifikasi event masuk ke Retry Queue.
9.  **TS-EVT-09:** Setelah 3x retry, event dari Retry Queue masuk ke DLQ.
10. **TS-EVT-10:** Mempublikasikan event yang sama (same `eventId`) dua kali. Verifikasi hanya diproses sekali.
11. **TS-EVT-11:** Antrean berisi 100 event. Verifikasi semua diproses secara FIFO.
12. **TS-EVT-12:** Antrean berisi event `LOW` dan `CRITICAL`. Verifikasi `CRITICAL` diproses lebih dulu (jika ada priority queue).
13. **TS-EVT-13:** Admin berhasil me-replay event dari DLQ.
14. **TS-EVT-14:** Dasbor menampilkan jumlah event di antrean secara akurat.
15. **TS-EVT-15:** Dasbor menampilkan rata-rata waktu pemrosesan.
16. **TS-EVT-16:** KPI Throughput menampilkan nilai yang wajar di bawah beban.
17. **TS-EVT-17:** Event yang lebih tua dari 30 hari berhasil diarsip.
18. **TS-EVT-18:** Admin dapat mencari event di arsip berdasarkan `referenceId`.
19. **TS-EVT-19:** Pengguna tanpa hak akses tidak dapat melihat dasbor monitoring event.
20. **TS-EVT-20:** Event `Security.Login.Failed` tercatat di log audit.
21. **TS-EVT-21:** Event `Complaint.Created` dengan data lokasi memicu integrasi ke GIS.
22. **TS-EVT-22:** Event `Posyandu.Visit.Recorded` memicu Rule Engine untuk cek stunting.
23. **TS-EVT-23:** Event `Aspiration.Voted` memicu pembaruan pada dasbor aspirasi.
24. **TS-EVT-24:** Event `Family.Split` menghasilkan beberapa event turunan (e.g., `Family.Created`, `Citizen.Moved`).
25. **TS-EVT-25:** `correlationId` tetap sama untuk semua event dalam satu transaksi bisnis.
26. **TS-EVT-26:** `traceId` unik untuk setiap alur permintaan dari awal hingga akhir.
27. **TS-EVT-27:** Event dengan `destination` spesifik hanya diproses oleh subscriber yang dituju.
28. **TS-EVT-28:** Event tanpa `destination` di-broadcast ke semua subscriber yang relevan.
29. **TS-EVT-29:** Pemrosesan event yang melebihi timeout dianggap gagal.
30. **TS-EVT-30:** Event `System.Backup.Completed` memicu notifikasi ke Admin.
31. **TS-EVT-31:** Event `Education.Student.DroppedOut` memicu Rule Engine dan Community Score.
32. **TS-EVT-32:** Event `UMKM.Created` memicu pembaruan pada Economy Score.
33. **TS-EVT-33:** Event `Infrastructure.Condition.Updated` memicu pembaruan pada Infrastructure Score.
34. **TS-EVT-34:** Event `Environment.Report.Created` memicu pembaruan pada Environment Score.
35. **TS-EVT-35:** Event `Social.Case.Identified` memicu pembaruan pada Social Score.
36. **TS-EVT-36:** Event `Meeting.Scheduled` memicu Notification Engine.
37. **TS-EVT-37:** Event `Announcement.Published` memicu Notification Engine.
38. **TS-EVT-38:** Event `Emergency.Alert.Sent` memiliki prioritas tertinggi di antrean.
39. **TS-EVT-39:** Event `User.Permission.Changed` tercatat di log audit keamanan.
40. **TS-EVT-40:** Event `Data.Synchronized` berhasil memicu sinkronisasi data ke sistem eksternal (future).

## 24. Acceptance Criteria

1.  Event Engine mampu menerima dan memvalidasi event dari semua modul bisnis.
2.  Setiap event yang valid berhasil dimasukkan ke dalam antrean FIFO.
3.  Struktur payload event mengikuti standar yang telah ditetapkan.
4.  Konvensi penamaan event (`Module.Subject.Action`) diterapkan secara konsisten.
5.  Mekanisme antrean (Queue) berbasis Google Sheets/CacheService berfungsi.
6.  Mekanisme Retry untuk event yang gagal berfungsi dengan jeda waktu eksponensial.
7.  Dead Letter Queue (DLQ) berhasil menampung event yang gagal permanen.
8.  Mekanisme pencegahan pemrosesan event duplikat berfungsi.
9.  Event yang kedaluwarsa di dalam antrean berhasil dihapus.
10. Event Routing berbasis topik berhasil meneruskan event ke subscriber yang benar.
11. Event Repository berhasil menyimpan log event selama periode retensi.
12. Mekanisme pengarsipan event ke Cloud Storage berjalan sesuai jadwal.
13. Administrator dapat mencari dan melihat riwayat event.
14. Administrator dapat memicu pemrosesan ulang (replay) event dari DLQ.
15. Dasbor monitoring menampilkan statistik antrean (Utama, Retry, DLQ) secara akurat.
16. Dasbor monitoring menampilkan KPI kinerja (throughput, failure rate, processing time).
17. Sistem alerting untuk administrator (misalnya, jika DLQ penuh) berfungsi.
18. Matriks perizinan untuk akses ke dasbor dan fungsi admin diterapkan.
19. Jejak audit (Audit Trail) untuk semua aktivitas event tercatat.
20. Event `Citizen.Created` berhasil diproses oleh minimal 2 subscriber (e.g., Audit, Score).
21. Event `Letter.Approved` berhasil memicu `NotificationEngine`.
22. Event `PBB.Paid` berhasil memicu `CommunityScoreEngine`.
23. Event `Complaint.Resolved` berhasil memicu `NotificationEngine`.
24. Event `Posyandu.Visit.Recorded` berhasil memicu `RuleEngine`.
25. Event `Community.Score.Updated` berhasil memicu `NotificationEngine` dan `DashboardService`.
26. `correlationId` dan `traceId` terisi dengan benar untuk pelacakan.
27. Performa engine mampu memproses minimal 100 event per menit tanpa error.
28. Dokumentasi API untuk `EventEngine.publish()` tersedia dan jelas untuk pengembang modul.
29. Semua skenario pengujian kritis (prioritas 1) berhasil dilewati.
30. Pelatihan mengenai arsitektur event-driven telah diberikan kepada tim pengembang.
31. Event `Family.Created` berhasil diproses.
32. Event `Education.Registered` berhasil diproses.
33. Event `Health.Checked` berhasil diproses.
34. Event `Aspiration.Created` berhasil diproses.
35. Event `Forum.Posted` berhasil diproses.
36. Event `Security.Login` berhasil diaudit.
37. Event `System.Backup` berhasil memicu notifikasi.
38. Event `Dashboard.Refreshed` berhasil dicatat.
39. Event `Notification.Sent` berhasil dicatat dalam riwayat.
40. Seluruh arsitektur yang digambarkan dalam dokumen ini telah diimplementasikan pada v1.0.

## 25. Future Roadmap

| Versi | Fokus | Fitur Utama |
| :--- | :--- | :--- |
| **v1.5** | **Performance & Scalability** | - Migrasi antrean dari Spreadsheet/Cache ke layanan yang lebih robust seperti Google Pub/Sub (via Cloud Function).<br>- Implementasi arsitektur *Event Streaming* (gaya Kafka) untuk analisis *real-time*. |
| **v2.0** | **Interoperabilitas** | - Implementasi *Cloud Events* standard untuk interoperabilitas dengan sistem cloud lain.<br>- Pengembangan *Distributed Event Bus* untuk komunikasi antar-layanan mikro (jika arsitektur berevolusi). |
| **v2.5** | **AI & Digital Twin** | - Aliran *event* menjadi input utama untuk memperbarui status *Digital Twin* secara *real-time*.<br>- *Event* digunakan untuk melatih model *Machine Learning* secara online/inkremental. |
| **v3.0** | **Autonomous Systems** | - Implementasi *AI Agent* yang dapat mempublikasikan dan berlangganan *event*.<br>- Pengembangan sistem Multi-Agen di mana *agent-agent* berkolaborasi dengan bertukar *event*. |