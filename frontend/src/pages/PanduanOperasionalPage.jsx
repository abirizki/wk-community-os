import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FileCheck2,
  Gift,
  HeartPulse,
  MessageSquareWarning,
  ShieldCheck,
  Building2,
  Users,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Printer,
  Sparkles,
  WifiOff,
  QrCode,
  Lock,
  Landmark,
  Download,
  FileText
} from 'lucide-react';

const SOP_DATA = [
  {
    id: 'sop-surat',
    category: 'surat',
    targetRoles: ['warga', 'rt_rw', 'kelurahan'],
    title: 'SOP Pelayanan Surat Digital & TTE QR Code',
    badge: 'Administrasi Kependudukan',
    sla: 'Maksimal 24 Jam Kerja',
    description: 'Prosedur baku pengajuan, verifikasi berjenjang RT/RW, dan pengesahan Tanda Tangan Elektronik (TTE) resmi oleh Lurah.',
    steps: [
      {
        step: 1,
        actor: 'Warga',
        action: 'Mengajukan permohonan surat melalui menu Layanan Surat, melengkapi data pemohon, keperluan, serta bukti pendukung.'
      },
      {
        step: 2,
        actor: 'Ketua RT',
        action: 'Memeriksa kebenaran data domisili dan keabsahan KK di wilayah RT. Memberikan persetujuan pengantar (SLA: Maks. 4 jam).'
      },
      {
        step: 3,
        actor: 'Ketua RW',
        action: 'Meninjau pengantar RT dan memberikan rekomendasi tingkat RW (SLA: Maks. 4 jam).'
      },
      {
        step: 4,
        actor: 'Lurah / Kasi Pelayanan',
        action: 'Melakukan verifikasi akhir, penomoran resmi otomatis, dan membubuhkan Tanda Tangan Elektronik (TTE) ber-QR Code kriptografis (SLA: Maks. 16 jam).'
      },
      {
        step: 5,
        actor: 'Sistem & Warga',
        action: 'Dokumen PDF resmi diterbitkan. WhatsApp Gateway mengirim notifikasi otomatis berisi tautan unduh dokumen langsung ke ponsel warga.'
      }
    ],
    tips: 'QR Code pada dokumen dapat diverifikasi secara publik oleh instansi luar (Bank, BPJS, Kepolisian) tanpa perlu login ke sistem.'
  },
  {
    id: 'sop-bansos',
    category: 'bansos',
    targetRoles: ['rt_rw', 'kelurahan', 'warga'],
    title: 'SOP Penyaluran Bansos Berbasis Peringkat Desil 1–10',
    badge: 'Jaminan Sosial Presisi',
    sla: 'Sesuai Jadwal Penyaluran',
    description: 'Tata cara seleksi berbasis Proxy Means Testing (PMT) kementerian, penetapan kuota anti-duplikasi, dan transparansi tanda terima.',
    steps: [
      {
        step: 1,
        actor: 'Sistem Algoritma DTSEN',
        action: 'Mengkalkulasi peringkat desil keluarga (1 s/d 10) berdasarkan indikator daya listrik, kondisi hunian, aset, dan tanggungan.'
      },
      {
        step: 2,
        actor: 'Ketua RT & RW',
        action: 'Mengusulkan warga Desil 1 (Kemiskinan Ekstrem) dan Desil 2 yang belum ter-cover bantuan reguler melalui menu Bantuan Sosial.'
      },
      {
        step: 3,
        actor: 'Admin Kelurahan',
        action: 'Memverifikasi ketersediaan kuota RW dan menetapkan daftar penerima manfaat definitif.'
      },
      {
        step: 4,
        actor: 'Petugas Penyalur',
        action: 'Melakukan verifikasi fisik di lapangan, menyerahkan bantuan, dan mengklik "Serahkan Bantuan" di aplikasi.'
      },
      {
        step: 5,
        actor: 'WhatsApp Gateway',
        action: 'Mengirimkan tanda terima resmi digital ke nomor HP warga penerima sebagai bukti sah cegah pemotongan/pungli.'
      }
    ],
    tips: 'Keluarga yang memiliki kendaraan roda empat (mobil) secara otomatis terkunci pada Desil 7–10 dan tidak berhak menerima bansos tunai.'
  },
  {
    id: 'sop-posyandu',
    category: 'posyandu',
    targetRoles: ['posyandu', 'rt_rw', 'warga'],
    title: 'SOP Posyandu Digital Balita, Skrining Lansia & Mode Luring (Offline)',
    badge: 'Kesehatan Masyarakat',
    sla: 'Hari Buka Posyandu Bulanan',
    description: 'Prosedur pencatatan KMS digital, deteksi stunting dini balita, rekam medis skrining lansia, dan keandalan mode luring saat sinyal padam.',
    steps: [
      {
        step: 1,
        actor: 'Kader Posyandu',
        action: 'Menimbang balita (BB), mengukur panjang/tinggi badan (TB), dan lingkar kepala (LK) pada hari buka posyandu.'
      },
      {
        step: 2,
        actor: 'Sistem KMS Digital',
        action: 'Secara otomatis menghitung status antropometri balita. Notifikasi khusus muncul jika balita terdeteksi "Berisiko Stunting".'
      },
      {
        step: 3,
        actor: 'Pemeriksaan Lansia',
        action: 'Kader melakukan skrining tekanan darah (tensi), gula darah sewaktu (GDS), kolesterol, asam urat, dan kalkulasi Indeks Massa Tubuh (IMT).'
      },
      {
        step: 4,
        actor: 'Operasional Mode Luring',
        action: 'Jika lokasi tidak memiliki koneksi internet, kader tetap dapat menginput data. Data tersimpan di memori lokal IndexedDB gawai.'
      },
      {
        step: 5,
        actor: 'Auto Background Sync',
        action: 'Begitu kader tiba di area berinternet, sistem PWA otomatis mengirimkan antrean offline ke server tanpa kehilangan data.'
      }
    ],
    tips: 'Pastikan aplikasi telah diinstall melalui menu "Install Bumi Warga" agar service worker aktif sempurna saat jaringan offline.'
  },
  {
    id: 'sop-pengaduan',
    category: 'pengaduan',
    targetRoles: ['warga', 'rt_rw', 'kelurahan'],
    title: 'SOP Pengelolaan & Eskalasi Pengaduan Lingkungan Warga',
    badge: 'Ketertiban & Ketenteraman',
    sla: 'Maks. 2 Jam (Darurat) / 48 Jam (Reguler)',
    description: 'Mekanisme penerimaan aduan warga, penugasan petugas lapangan, penanganan evidensi foto, dan penyelesaian masalah lingkungan.',
    steps: [
      {
        step: 1,
        actor: 'Warga',
        action: 'Melaporkan masalah lingkungan (sampah liar, jalan rusak, lampu PJU mati, ketertiban) disertai foto bukti dan titik lokasi.'
      },
      {
        step: 2,
        actor: 'Pengurus RT / RW',
        action: 'Meninjau laporan, memberikan tanggapan awal, dan menugaskan satgas lingkungan atau meneruskan ke seksi Trantib Kelurahan.'
      },
      {
        step: 3,
        actor: 'Petugas Lapangan',
        action: 'Melakukan tindakan perbaikan di lokasi fisik dan mendokumentasikan hasil penanganan.'
      },
      {
        step: 4,
        actor: 'Kelurahan / RW',
        action: 'Mengunggah foto bukti penanganan dan memperbarui status laporan menjadi "SELESAI".'
      },
      {
        step: 5,
        actor: 'Warga Pelapor',
        action: 'Menerima pembaruan progres langsung via dashboard dan notifikasi WhatsApp resmi.'
      }
    ],
    tips: 'Aduan darurat (pohon tumbang, banjir, longsor) mendapat prioritas respons pertama dalam waktu kurang dari 15 menit.'
  },
  {
    id: 'sop-interoperabilitas',
    category: 'integrasi',
    targetRoles: ['kelurahan', 'eksekutif'],
    title: 'SOP Interoperabilitas Dukcapil Kemendagri & Sapawarga JDS',
    badge: 'Integrasi Ekosistem Pemerintah',
    sla: 'Real-Time Web Service',
    description: 'Standar verifikasi identitas kependudukan, pengujian biometrik wajah, dan penyaluran agregat data ke portal Satu Data Jawa Barat.',
    steps: [
      {
        step: 1,
        actor: 'Dukcapil NIK Matching',
        action: 'Sistem mencocokkan NIK, Nama, dan Tanggal Lahir ke Web Service Kemendagri melalui jalur aman VPN IPsec.'
      },
      {
        step: 2,
        actor: 'Biometrik Wajah AI',
        action: 'Verifikasi citra wajah warga dengan batas kemiripan (threshold) minimal 80% sebelum penerbitan dokumen strategis.'
      },
      {
        step: 3,
        actor: 'Death Registry Check',
        action: 'Pengecekan otomatis status hidup warga untuk mencegah pemalsuan identitas atau penyaluran bansos ke warga yang telah wafat.'
      },
      {
        step: 4,
        actor: 'Satu Data Jabar (SDI)',
        action: 'Sistem mengemas agregat 33 Kelurahan ke format JSON Satu Data Indonesia (Perpres 39/2019) dan mendistribusikan via Partner API Sapawarga.'
      }
    ],
    tips: 'Sistem menerapkan prinsip Zero Data Hoarding: citra biometrik wajah diproses di memori dan langsung dimusnahkan tanpa disimpan di database.'
  },
  {
    id: 'sop-keamanan',
    category: 'keamanan',
    targetRoles: ['kelurahan', 'eksekutif', 'rt_rw'],
    title: 'SOP Keamanan Siber & Kepatuhan UU PDP No. 27/2022',
    badge: 'Keamanan Siber & Regulasi',
    sla: 'Pengawasan Kontinu 24/7',
    description: 'Prosedur penegakan privasi data pribadi, audit trail anti-tampering kriptografis SHA-256, dan mitigasi insiden keamanan informasi.',
    steps: [
      {
        step: 1,
        actor: 'Perlindungan NIK & KK',
        action: 'Penyembunyian digit sensitif NIK pada layar publik (masking: 327201******0001) untuk melindungi privasi warga.'
      },
      {
        step: 2,
        actor: 'Audit Trail SHA-256',
        action: 'Setiap akses data kependudukan dicatat ke dalam log transaksi yang diikat dengan hash chaining kriptografis anti-manipulasi.'
      },
      {
        step: 3,
        actor: 'Perlindungan Jaringan',
        action: 'Penerapan Nginx reverse proxy dengan TLS 1.3, Rate Limiting per IP (anti-bruteforce), dan header keamanan HSTS.'
      },
      {
        step: 4,
        actor: 'Tanggap Insiden CSIRT',
        action: 'Bila terdeteksi anomali login atau percobaan penetrasi, akun terkait dibekukan otomatis dan peringatan dikirim ke Diskominfo CSIRT.'
      }
    ],
    tips: 'Dilarang membagikan kredensial login atau mengekspor data mentah kependudukan ke luar media penyimpanan resmi kedinasan.'
  },
  {
    id: 'sop-multitenancy',
    category: 'multitenancy',
    targetRoles: ['eksekutif', 'kelurahan'],
    title: 'SOP Manajemen Wilayah & Multi-Tenancy Kota Sukabumi',
    badge: 'Tata Kelola Pemerintahan',
    sla: 'Pemantauan Berkala',
    description: 'Prosedur navigasi hirarkis 7 Kecamatan dan 33 Kelurahan, isolasi row-level data, dan pemanfaatan Executive Command Center Walikota.',
    steps: [
      {
        step: 1,
        actor: 'Walikota / Superadmin',
        action: 'Memantau makro KPI seluruh kota (total penduduk, kemiskinan ekstrem, stunting, SLA pelayanan surat) melalui Executive Command Center.'
      },
      {
        step: 2,
        actor: 'Camat',
        action: 'Memfilter dan mengevaluasi komparasi kinerja seluruh kelurahan di wilayah kecamatannya.'
      },
      {
        step: 3,
        actor: 'Lurah & Kasi Pelayanan',
        action: 'Mengelola operasional kelurahan masing-masing dalam batas isolasi tenant row-level yang terproteksi.'
      },
      {
        step: 4,
        actor: 'Simulasi Tenant',
        action: 'Pimpinan kota dapat beralih perspektif ke kelurahan tertentu untuk melakukan uji petik dan evaluasi lapangan secara mendalam.'
      }
    ],
    tips: 'Struktur kode wilayah mengacu secara baku pada Kepmendagri wilayah administratif Kota Sukabumi (Kode: 32.72.xx.xxxx).'
  }
];

export default function PanduanOperasionalPage() {
  const [activePersona, setActivePersona] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState('sop-surat');

  const filteredSops = useMemo(() => {
    return SOP_DATA.filter((sop) => {
      // Persona filter
      const matchesPersona =
        activePersona === 'all' ||
        sop.targetRoles.includes(activePersona);

      // Search filter
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        sop.title.toLowerCase().includes(q) ||
        sop.description.toLowerCase().includes(q) ||
        sop.badge.toLowerCase().includes(q) ||
        sop.steps.some((s) => s.action.toLowerCase().includes(q) || s.actor.toLowerCase().includes(q));

      return matchesPersona && matchesSearch;
    });
  }, [activePersona, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none rounded-r-3xl transform skew-x-12 translate-x-10" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-emerald-200 text-xs font-semibold mb-3 border border-white/10">
            <Landmark size={14} />
            Pemerintah Kota Sukabumi · Standar Operasional Prosedur (SOP) Digital
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Buku Panduan Operasional Pelayanan Publik
          </h1>
          <p className="text-sm text-emerald-100/90 mt-2 max-w-2xl leading-relaxed">
            Pedoman tata laksana digital resmi bagi Aparatur Pemerintah Daerah, Pengurus RT/RW, Kader Posyandu, dan Warga dalam ekosistem platform <strong>Bumi Warga</strong>.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-50 transition shadow-sm"
            >
              <Printer size={15} /> Cetak / Ekspor SOP
            </button>
            <a
              href="/downloads/DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.docx"
              download="DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.docx"
              className="inline-flex items-center gap-2 bg-emerald-500/20 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-500/30 transition border border-emerald-300/40 shadow-sm"
            >
              <FileText size={15} /> Unduh Tabel Kredensial (.DOCX)
            </a>
            <a
              href="/dashboard/command-center"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/20 transition border border-white/20"
            >
              <Building2 size={15} /> Buka Command Center
            </a>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Cari SOP, kata kunci (misal: surat, bansos, offline, stunting, TTE, desil, keamanan)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Persona Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-on-surface-variant mr-1 flex-shrink-0">
            Peran Pengguna:
          </span>
          {[
            { key: 'all', label: 'Semua SOP' },
            { key: 'warga', label: 'Warga' },
            { key: 'rt_rw', label: 'Ketua RT / RW' },
            { key: 'posyandu', label: 'Kader Posyandu' },
            { key: 'kelurahan', label: 'Petugas Kelurahan / Lurah' },
            { key: 'eksekutif', label: 'Camat & Walikota' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActivePersona(tab.key)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                activePersona === tab.key
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SOP List Accordions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
          <span>Menampilkan <strong>{filteredSops.length}</strong> Standar Operasional Prosedur</span>
          <span className="text-[11px] italic">Klik pada kartu untuk membuka detail langkah teknis</span>
        </div>

        {filteredSops.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-outline-variant">
            <BookOpen size={36} className="mx-auto text-on-surface-variant opacity-40 mb-2" />
            <p className="text-sm font-semibold text-on-surface">Tidak ada SOP yang cocok dengan pencarian</p>
            <p className="text-xs text-on-surface-variant mt-1">Coba gunakan kata kunci lain atau pilih tab 'Semua SOP'</p>
          </div>
        ) : (
          filteredSops.map((sop) => {
            const isExpanded = expandedId === sop.id;
            return (
              <motion.div
                key={sop.id}
                layout
                className={`bg-surface-container-lowest rounded-2xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-primary/40 shadow-elevated ring-1 ring-primary/10' : 'border-outline-variant hover:border-primary/20'
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : sop.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-surface-container/30 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {sop.badge}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        SLA: <strong>{sop.sla}</strong>
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-on-surface">
                      {sop.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {sop.description}
                    </p>
                  </div>

                  <div className="p-1 rounded-lg bg-surface-container text-on-surface-variant flex-shrink-0 mt-1">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {/* Accordion Detail Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-outline-variant bg-surface-container/10 px-5 py-5 space-y-4"
                    >
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                        Tahapan Operasional Baku:
                      </h4>

                      <div className="space-y-3">
                        {sop.steps.map((st) => (
                          <div key={st.step} className="flex items-start gap-3 text-xs">
                            <div className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center flex-shrink-0 text-[11px] shadow-sm">
                              {st.step}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <span className="font-bold text-primary mr-1.5">[{st.actor}]:</span>
                              <span className="text-on-surface">{st.action}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {sop.tips && (
                        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                          <Sparkles size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong>Catatan Penting:</strong> {sop.tips}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Emergency & Helpdesk Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
            <Lock size={16} className="text-primary" />
            <span>Kepatuhan Regulasi & CSIRT Keamanan Siber</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Platform Bumi Warga diaudit sesuai Permendagri No. 102/2019 dan UU PDP No. 27/2022. Laporan celah keamanan dapat dikirimkan ke Tim CSIRT Diskominfo Kota Sukabumi:
          </p>
          <div className="pt-1 text-xs font-mono text-primary font-bold">
            csirt@sukabumikota.go.id
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
            <Building2 size={16} className="text-primary" />
            <span>Pusat Bantuan & Helpdesk Operasional Pemda</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Untuk kendala teknis aktivasi akun, permohonan pembaruan master wilayah, atau konsultasi bansos, hubungi Helpdesk Resmi:
          </p>
          <div className="pt-1 text-xs font-mono text-primary font-bold">
            helpdesk@bumiwarga.sukabumi.go.id · Ext. 402 (Bagian Tapem)
          </div>
        </div>
      </div>
    </div>
  );
}

