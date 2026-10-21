/**
 * src/services/kanaya.sop.js
 * Grounded SOP Knowledge Registry for Kanaya AI
 * Bumi Warga - Jabar Pintar Digital (Kelurahan Kebonjati, Kota Sukabumi)
 * Single Source of Truth for SOPs & Public Service Knowledge
 */

const BUMI_WARGA_SOP_REGISTRY = [
  {
    id: 'sku',
    title: 'Surat Keterangan Usaha (SKU)',
    category: 'Layanan Dokumen',
    source_name: 'SOP Pelayanan Administrasi Kelurahan Kebonjati',
    version: '2026.1',
    effective_date: '2026-01-01',
    keywords: ['sku', 'usaha', 'umkm', 'modal', 'bank', 'dagang', 'surat usaha', 'kredit', 'toko'],
    roles: ['warga', 'ketua_rt', 'ketua_rw', 'admin_kelurahan', 'lurah'],
    body: `Untuk membuat Surat Keterangan Usaha (SKU), berikut langkah mudahnya:
1. Buka menu **Pengajuan Surat** > pilih **Surat Keterangan Usaha (SKU)**.
2. Lengkapi formulir: Nama Usaha, Jenis Usaha/Dagang, Alamat Usaha, dan Lama Berdiri.
3. Unggah foto tempat atau produk usaha Anda.
4. Kirim pengajuan. Sistem akan otomatis meneruskan ke Ketua RT & RW untuk verifikasi digital.
5. Setelah disahkan oleh Lurah Kebonjati, surat resmi ber-TTE QR Code sah BSrE dapat langsung diunduh dan dicetak mandiri.`,
    quickLink: '/dashboard/dokumen?action=new'
  },
  {
    id: 'sktm',
    title: 'Surat Keterangan Tidak Mampu (SKTM)',
    category: 'Bansos & Layanan',
    source_name: 'Pedoman Verifikasi Desil Kesejahteraan DTSEN',
    version: '2026.1',
    effective_date: '2026-01-01',
    keywords: ['sktm', 'tidak mampu', 'miskin', 'beasiswa', 'kip', 'pip', 'keringanan', 'rumah sakit', 'pbi'],
    roles: ['warga', 'ketua_rt', 'ketua_rw', 'admin_kelurahan', 'lurah'],
    body: `Pengajuan SKTM di Bumi Warga telah terintegrasi dengan data Desil Kesejahteraan DTSEN:
1. Buka menu **Pengajuan Surat** > pilih **Surat Keterangan Tidak Mampu (SKTM)**.
2. Pilih keperluan surat: **Pendidikan (KIP / Beasiswa)** atau **Kesehatan (Rujukan RS / BPJS PBI-JK)**.
3. Sistem otomatis memvalidasi tingkat desil keluarga Anda (Desil 1-3 menjadi prioritas otomatis).
4. Lampirkan foto kondisi rumah jika diminta verifikasi lapangan.
5. Ketua RT akan melakukan konfirmasi ground check sebelum pengesahan oleh pihak Kelurahan.`,
    quickLink: '/dashboard/dokumen?action=new'
  },
  {
    id: 'bansos',
    title: 'Perbedaan Bansos APBN vs Bansos Muskel',
    category: 'Bantuan Sosial',
    source_name: 'Petunjuk Teknis Bansos Kemensos RI & Dinsos Kota Sukabumi',
    version: '2026.2',
    effective_date: '2026-02-15',
    keywords: ['bansos', 'pkh', 'bpnt', 'blt', 'muskel', 'bantuan', 'dtks', 'desil', 'pbi-jk'],
    roles: ['warga', 'ketua_rt', 'ketua_rw', 'kader_posyandu', 'admin_kelurahan', 'lurah'],
    body: `Berikut perbedaan jenis Bantuan Sosial agar tidak keliru:
• **Bansos APBN (Pusat)**: Seperti PKH, BPNT, dan PBI-JK yang bersumber dari DTKS Kemensos RI dengan kuota nasional.
• **Bansos Muskel (Kelurahan)**: Bantuan darurat dari kelurahan untuk warga rentan yang belum tercover di tingkat pusat.
• Di menu **Informasi Bantuan Sosial**, Anda dapat mengecek status bansos keluarga serta tiket QR pengambilan.`,
    quickLink: '/dashboard/bansos'
  },
  {
    id: 'sanggah_desil',
    title: 'Sanggah Desil & Anomali 11 Indikator DTSEN',
    category: 'Kesejahteraan',
    source_name: 'Regulasi Pemutakhiran Data Kemiskinan Terpadu',
    version: '2026.1',
    effective_date: '2026-01-01',
    keywords: ['sanggah', 'desil', 'dtsen', 'anomali', 'tidak layak', '11 indikator', 'salah sasaran'],
    roles: ['warga', 'ketua_rt', 'ketua_rw', 'admin_kelurahan'],
    body: `Jika data Desil Kartu Keluarga Anda tidak sesuai kondisi ekonomi riil:
1. Buka menu **Data Desil & Cek Bansos**.
2. Klik tombol **Ajukan Sanggah / Usulan Koreksi**.
3. Isi 11 Indikator Faktual: Daya Listrik, Sumber Air, Status Kepemilikan Rumah, Bahan Bakar Memasak, Aset Kendaraan, dan Anggota Rentan.
4. Unggah foto bukti kondisi rumah Anda.
5. Berkas akan diverifikasi oleh RT/RW dalam musyawarah terdekat sebelum dimutakhirkan di tingkat kota.`,
    quickLink: '/dashboard/desil'
  },
  {
    id: 'posyandu',
    title: 'Posyandu KIA Balita & Posbindu Lansia',
    category: 'Kesehatan Keluarga',
    source_name: 'Buku Pedoman Kader Posyandu Terpadu Kemenkes RI',
    version: '2026.1',
    effective_date: '2026-01-01',
    keywords: ['posyandu', 'balita', 'kms', 'kia', 'stunting', 'imunisasi', 'lansia', 'timbang', 'gizi'],
    roles: ['warga', 'kader_posyandu', 'ketua_rt', 'ketua_rw'],
    body: `Layanan Kesehatan Posyandu di Bumi Warga mencakup:
• **Buku KIA Digital (KMS Balita)**: Pantau perkembangan berat badan, tinggi badan, deteksi risiko stunting, dan jadwal imunisasi bulanan.
• **Posbindu Lansia**: Rekam medis tensi darah, gula darah, dan pemeriksaan kebugaran lansia.
• Seluruh anggota KK yang berusia balita atau lansia otomatis terdata di modul kesehatan keluarga.`,
    quickLink: '/dashboard/posyandu'
  },
  {
    id: 'nikah',
    title: 'Surat Pengantar Nikah (Model N1 - N4)',
    category: 'Kependudukan',
    source_name: 'SOP Pelayanan Administrasi Kependudukan',
    version: '2026.1',
    effective_date: '2026-01-01',
    keywords: ['nikah', 'kawin', 'n1', 'n2', 'n4', 'kua', 'pengantar nikah', 'pernikahan'],
    roles: ['warga', 'ketua_rt', 'ketua_rw', 'admin_kelurahan'],
    body: `Untuk pengurusan Surat Pengantar Nikah (N1-N4) ke KUA atau Disdukcapil:
1. Siapkan foto KTP calon pengantin, KTP orang tua/wali, dan Kartu Keluarga.
2. Pilih **Surat Pengantar Nikah** pada menu Pengajuan Surat.
3. Lengkapi identitas calon pasangan serta rencana tanggal dan lokasi akad.
4. RT dan RW akan menerbitkan rekomendasi pengantar resmi secara digital.`,
    quickLink: '/dashboard/dokumen?action=new'
  },
  {
    id: 'iuran',
    title: 'Iuran RT QRIS & Transparansi Kas',
    category: 'Keuangan Lingkungan',
    source_name: 'Tata Kelola Kas RT/RW Mandiri Kelurahan Kebonjati',
    version: '2026.1',
    effective_date: '2026-01-01',
    keywords: ['iuran', 'kas', 'qris', 'bayar iuran', 'sampah', 'keamanan', 'pbb', 'laporan keuangan'],
    roles: ['warga', 'ketua_rt', 'ketua_rw'],
    body: `Transparansi Kas dan Iuran di Bumi Warga:
• Setiap KK dapat membayar iuran bulanan (keamanan dan kebersihan) melalui **QRIS Standar** atau tunai ke Bendahara RT.
• Status bayar otomatis terupdate menjadi **Lunas** secara real-time.
• Warga dapat memantau catatan Kas Masuk dan Keluar RT secara terbuka pada menu Transparansi Kas.`,
    quickLink: '/dashboard/keuangan'
  },
  {
    id: 'kk_digital',
    title: 'Kartu Keluarga Digital & Anggota Keluarga Lainnya',
    category: 'Kependudukan',
    source_name: 'Permendagri No. 109 Tahun 2019 tentang Formulir dan Buku Kependudukan',
    version: '2026.1',
    effective_date: '2026-01-01',
    keywords: ['kartu keluarga', 'kk', 'bpjs', 'kip', 'kis', 'nik', 'blanko', 'famili lain', 'orang tua', 'mertua', 'cucu'],
    roles: ['warga', 'ketua_rt', 'ketua_rw', 'admin_kelurahan', 'lurah'],
    body: `Kartu Keluarga Digital di Bumi Warga:
• Format otentik standar Kemendagri dilengkapi lambang Garuda Pancasila dan TTE QR-Code sah BSrE.
• Mencakup seluruh hubungan keluarga: Kepala Keluarga, Istri/Suami, Anak, Orang Tua, Mertua, Menantu, Cucu, hingga Famili Lain.
• Terhubung jaminan sosial per jiwa: BPJS Kesehatan/KIS, BPJS Ketenagakerjaan, serta beasiswa KIP anak sekolah.
• Dilengkapi fitur verifikasi QR Code publik untuk memastikan keaslian data kependudukan.`,
    quickLink: '/dashboard/kk'
  }
];

function searchSop(query) {
  if (!query) return null;
  const q = query.toLowerCase();
  
  // Exact or keyword match
  return BUMI_WARGA_SOP_REGISTRY.find(sop => 
    sop.keywords.some(k => q.includes(k)) || 
    q.includes(sop.title.toLowerCase()) ||
    q.includes(sop.id)
  ) || null;
}

module.exports = {
  BUMI_WARGA_SOP_REGISTRY,
  searchSop
};
