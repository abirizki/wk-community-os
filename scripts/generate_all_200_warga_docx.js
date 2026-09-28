/**
 * scripts/generate_all_200_warga_docx.js
 * Menghasilkan Dokumen Word Resmi (.docx) Lengkap Berisi SEMUA 200 Warga & 21 Aparatur
 * Lengkap dengan NIK, No KK, Nama, Hubungan Keluarga, Password, PIN Lahir & 6-Digit, serta Skenario
 */

const fs = require('fs');
const path = require('path');
const docx = require('docx');

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  HeadingLevel
} = docx;

console.log('Memulai penyusunan dokumen DOCX 200 warga lengkap...');

const datasetPath = path.join(__dirname, '../database/seed_dataset.json');
if (!fs.existsSync(datasetPath)) {
  console.error('File seed_dataset.json tidak ditemukan!');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

// Skema Warna Formal
const COLOR_PRIMARY = '0369A1'; // Sky-700
const COLOR_HEADER_BG = '0284C7'; // Sky-600
const COLOR_SECTION_BG = 'E0F2FE'; // Sky-100
const COLOR_ZEBRA_BG = 'F8FAFC'; // Slate-50
const COLOR_DARK = '0F172A'; // Slate-900

function createHeaderCell(text, widthPercent) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: COLOR_HEADER_BG },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text, bold: true, color: 'FFFFFF', size: 16, font: 'Arial' })
        ]
      })
    ]
  });
}

function createDataCell(text, widthPercent, isCenter = false, isMono = false, bg = 'FFFFFF', isBold = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: bg },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: isCenter ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({ 
            text: String(text || '-'), 
            size: 15, 
            font: isMono ? 'Consolas' : 'Arial',
            color: '1E293B',
            bold: isBold
          })
        ]
      })
    ]
  });
}

// 1. TABEL APARATUR (21 AKUN)
const aparaturRows = [
  new TableRow({
    children: [
      createHeaderCell('No', 5),
      createHeaderCell('Peran / Jabatan', 25),
      createHeaderCell('Nama Pejabat / Petugas', 26),
      createHeaderCell('Wilayah Tugas', 18),
      createHeaderCell('Username Login', 14),
      createHeaderCell('Password Standar', 12)
    ]
  })
];

const aparaturList = data.users.filter(u => u.role !== 'warga');
aparaturList.forEach((u, idx) => {
  const bg = idx % 2 === 0 ? 'FFFFFF' : COLOR_ZEBRA_BG;
  let wilayah = 'Kota Sukabumi';
  if (u.kode_kelurahan === '32.72.03.1004') wilayah = 'Kel. Kebonjati';
  if (u.kode_kelurahan === '32.72.03.1001') wilayah = 'Kel. Cikole';
  if (u.rt) wilayah += ` (RT ${u.rt}/001)`;

  aparaturRows.push(new TableRow({
    children: [
      createDataCell(idx + 1, 5, true, false, bg),
      createDataCell(u.role.toUpperCase(), 25, false, false, bg, true),
      createDataCell(u.nama, 26, false, false, bg),
      createDataCell(wilayah, 18, false, false, bg),
      createDataCell(u.username, 14, false, true, bg),
      createDataCell('BumiWarga@2026', 12, true, true, bg)
    ]
  }));
});

// FUNGSI MEMBUAT TABEL 20 WARGA PER RT
function buildRtTable(wargaListInRt) {
  const rows = [
    new TableRow({
      children: [
        createHeaderCell('No', 4),
        createHeaderCell('No. Kartu Keluarga', 16),
        createHeaderCell('Nama Lengkap', 22),
        createHeaderCell('Hubungan', 12),
        createHeaderCell('NIK (Username)', 17),
        createHeaderCell('PIN Lahir', 11),
        createHeaderCell('Skenario Bisnis & Jaminan', 18)
      ]
    })
  ];

  wargaListInRt.forEach((w, idx) => {
    const bg = idx % 2 === 0 ? 'FFFFFF' : COLOR_ZEBRA_BG;
    const tglLahir = w.tanggal_lahir.replace(/-/g, '');
    const pinLahir = `${tglLahir.slice(6, 8)}${tglLahir.slice(4, 6)}${tglLahir.slice(0, 4)}`;

    let skenarioTag = 'Warga Umum';
    if (w.kis && w.kis.startsWith('KIS')) skenarioTag = 'Desil 1 (PKH & KIS PBI)';
    else if (w.nama.startsWith('Balita')) skenarioTag = 'Desil 2 (Balita Stunting)';
    else if (w.kip) skenarioTag = 'Desil 3 (Beasiswa KIP)';
    else if (w.status_hubungan_keluarga === 'Orang Tua') skenarioTag = 'Desil 4 (Posyandu Lansia)';
    else if (w.bpjs_ketenagakerjaan) skenarioTag = 'Desil 7 (UMKM & BPJS TK)';

    rows.push(new TableRow({
      children: [
        createDataCell(idx + 1, 4, true, false, bg),
        createDataCell(w.no_kk, 16, true, true, bg),
        createDataCell(w.nama, 22, false, false, bg, w.status_hubungan_keluarga === 'Kepala Keluarga'),
        createDataCell(w.status_hubungan_keluarga, 12, false, false, bg),
        createDataCell(w.nik, 17, true, true, bg),
        createDataCell(pinLahir, 11, true, true, bg),
        createDataCell(skenarioTag, 18, false, false, bg)
      ]
    }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows
  });
}

// BENTUK DOKUMEN WORD RESMI
const docChildren = [];

// JUDUL DOKUMEN
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: 'BUKU INDUK KREDENSIAL PENGGUNA RESMI', bold: true, size: 28, color: COLOR_DARK }),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: 'SUPER APPS BUMI WARGA — JABAR PINTAR DIGITAL', bold: true, size: 22, color: COLOR_PRIMARY }),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ 
        text: 'Daftar Lengkap 200 Warga (50 KK) di 10 RT & 21 Aparatur Pemerintah (Kelurahan Kebonjati & Kelurahan Cikole)', 
        size: 16, 
        color: '64748B', 
        italics: true 
      }),
    ]
  }),
  new Paragraph({ text: '' }),
  
  // PANDUAN AKSES CEPAT
  new Paragraph({
    children: [
      new TextRun({ text: 'Petunjuk Akses Login Pengguna:', bold: true, size: 18, color: COLOR_PRIMARY })
    ]
  }),
  new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text: 'Metode 1 (Username NIK & Sandi): ', bold: true }),
      new TextRun({ text: 'Gunakan NIK 16-digit sebagai username dan password standar ' }),
      new TextRun({ text: 'BumiWarga@2026', bold: true, font: 'Consolas' }),
      new TextRun({ text: '.' })
    ]
  }),
  new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text: 'Metode 2 (PIN Tanggal Lahir): ', bold: true }),
      new TextRun({ text: 'Gunakan NIK 16-digit sebagai username dan 8 digit tanggal lahir ' }),
      new TextRun({ text: 'DDMMYYYY', bold: true, font: 'Consolas' }),
      new TextRun({ text: ' (contoh: 02031985 untuk kelahiran 2 Maret 1985).' })
    ]
  }),
  new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text: 'Metode 3 (PIN Mandiri 6-Digit): ', bold: true }),
      new TextRun({ text: 'Semua warga memiliki PIN alternatif default ' }),
      new TextRun({ text: '123456', bold: true, font: 'Consolas' }),
      new TextRun({ text: '.' })
    ]
  }),
  new Paragraph({ text: '' }),

  // BAGIAN 1: APARATUR
  new Paragraph({
    children: [
      new TextRun({ text: 'BAGIAN I: KREDENSIAL APARATUR PEMERINTAH, KELURAHAN & RT/RW (21 AKUN)', bold: true, size: 20, color: COLOR_PRIMARY })
    ]
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: aparaturRows
  }),
  new Paragraph({ text: '' })
);

// BAGIAN 2: KELURAHAN KEBONJATI (5 RT x 20 WARGA = 100 WARGA)
docChildren.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'BAGIAN II: KREDENSIAL WARGA KELURAHAN KEBONJATI (100 WARGA · 25 KK · 5 RT)', bold: true, size: 22, color: COLOR_PRIMARY })
    ]
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Wilayah Kecamatan Cikole, Kota Sukabumi · RW 001 (RT 001 s/d RT 005)', italics: true, size: 16, color: '64748B' })
    ]
  }),
  new Paragraph({ text: '' })
);

for (let rt = 1; rt <= 5; rt++) {
  const rtStr = String(rt).padStart(3, '0');
  const wargaInRt = data.warga.filter(w => w.kelurahan === 'Kebonjati' && w.rt === rtStr);
  
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: `RUKUN TETANGGA ${rtStr} / RW 001 KELURAHAN KEBONJATI (20 WARGA · 5 KK)`, bold: true, size: 18, color: COLOR_DARK })
      ]
    }),
    buildRtTable(wargaInRt),
    new Paragraph({ text: '' })
  );
}

// BAGIAN 3: KELURAHAN CIKOLE (5 RT x 20 WARGA = 100 WARGA)
docChildren.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'BAGIAN III: KREDENSIAL WARGA KELURAHAN CIKOLE (100 WARGA · 25 KK · 5 RT)', bold: true, size: 22, color: COLOR_PRIMARY })
    ]
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Wilayah Kecamatan Cikole, Kota Sukabumi · RW 001 (RT 001 s/d RT 005)', italics: true, size: 16, color: '64748B' })
    ]
  }),
  new Paragraph({ text: '' })
);

for (let rt = 1; rt <= 5; rt++) {
  const rtStr = String(rt).padStart(3, '0');
  const wargaInRt = data.warga.filter(w => w.kelurahan === 'Cikole' && w.rt === rtStr);
  
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: `RUKUN TETANGGA ${rtStr} / RW 001 KELURAHAN CIKOLE (20 WARGA · 5 KK)`, bold: true, size: 18, color: COLOR_DARK })
      ]
    }),
    buildRtTable(wargaInRt),
    new Paragraph({ text: '' })
  );
}

// BAGIAN 4: PANDUAN PENGUJIAN KANAYA AI ASSISTANT
docChildren.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'BAGIAN IV: PANDUAN PENGUJIAN ASISTEN CERDAS KANAYA AI', bold: true, size: 20, color: COLOR_PRIMARY })
    ]
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Asisten AI Kanaya telah mempelajari seluruh SOP, regulasi DTSEN, data demografi posyandu, dan basis data kependudukan. Lakukan login menggunakan akun percontohan di bawah untuk menguji kecerdasan respons AI:' })
    ]
  }),
  new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text: 'Uji Skenario Desil 1 (Kemiskinan Ekstrem): ', bold: true }),
      new TextRun({ text: 'Login NIK ' }),
      new TextRun({ text: '3272030103810001', bold: true, font: 'Consolas' }),
      new TextRun({ text: '. Buka Kanaya AI dan tanyakan: ' }),
      new TextRun({ text: '"Kanaya, keluarga saya masuk desil berapa dan apa hak bansos kami?"', italics: true }),
      new TextRun({ text: ' -> AI menjawab Desil 1, terdaftar di DTKS Kemensos, berhak atas PKH, BPNT Sembako, dan KIS PBI.' })
    ]
  }),
  new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text: 'Uji Skenario Balita Stunting: ', bold: true }),
      new TextRun({ text: 'Login NIK ' }),
      new TextRun({ text: '3272034506860006', bold: true, font: 'Consolas' }),
      new TextRun({ text: '. Tanyakan: ' }),
      new TextRun({ text: '"Bagaimana catatan gizi anak saya di Posyandu?"', italics: true }),
      new TextRun({ text: ' -> AI membaca data balita (10.2 kg), imunisasi campak rubella, vitamin A merah, dan hak bantuan PMT Protein Hewani.' })
    ]
  }),
  new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text: 'Uji Skenario Beasiswa Pelajar KIP: ', bold: true }),
      new TextRun({ text: 'Login NIK ' }),
      new TextRun({ text: '3272031505080011', bold: true, font: 'Consolas' }),
      new TextRun({ text: '. Tanyakan: ' }),
      new TextRun({ text: '"Apakah nomor KIP saya aktif untuk beasiswa sekolah?"', italics: true }),
      new TextRun({ text: ' -> AI memverifikasi nomor KIP aktif dan tata cara pencairan beasiswa PIP di bank penyalur (BRI/BNI).' })
    ]
  }),
  new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text: 'Uji Skenario Posyandu Lansia: ', bold: true }),
      new TextRun({ text: 'Login NIK ' }),
      new TextRun({ text: '3272030103840013', bold: true, font: 'Consolas' }),
      new TextRun({ text: '. Tanyakan: ' }),
      new TextRun({ text: '"Bagaimana hasil tensi dan kolesterol kakek saya di posyandu lansia?"', italics: true }),
      new TextRun({ text: ' -> AI menampilkan tensi 140/90 mmHg, kolesterol 215 mg/dL, serta saran pola makan sehat lansia.' })
    ]
  }),
  new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text: 'Uji Skenario Wirausaha UMKM & PBB: ', bold: true }),
      new TextRun({ text: 'Login NIK ' }),
      new TextRun({ text: '3272030103850017', bold: true, font: 'Consolas' }),
      new TextRun({ text: '. Tanyakan: ' }),
      new TextRun({ text: '"Bagaimana status izin SKU usaha saya dan bukti pembayaran PBB?"', italics: true }),
      new TextRun({ text: ' -> AI menyajikan nomor izin usaha SKU terverifikasi dan status lunas PBB online.' })
    ]
  })
);

// RAKIT DOKUMEN UTAMA
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Arial', size: 18, color: '1E293B' },
        paragraph: { spacing: { line: 260, before: 40, after: 40 } }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: 'Bumi Warga (Jabar Pintar Digital) · Buku Induk Kredensial 200 Warga', size: 14, color: '64748B' })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Halaman ', size: 14, color: '64748B' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 14, color: '64748B' }),
                new TextRun({ text: ' dari ', size: 14, color: '64748B' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: '64748B' }),
                new TextRun({ text: ' · Dokumen UAT & Kredensial Resmi', size: 14, color: '64748B' })
              ]
            })
          ]
        })
      },
      children: docChildren
    }
  ]
});

// SIMPAN DOKUMEN DOCX KE DUA TEMPAT (ROOT PROYEK & ARTIFACT DIRECTORY)
const rootDocxPath = path.join(__dirname, '../DAFTAR_LENGKAP_200_KREDENSIAL_WARGA_BUMI_WARGA.docx');
const artifactDocxPath = 'C:/Users/Rizki Firmansyah/.gemini/antigravity/brain/60fd72b6-de59-4137-aad8-999d88b3ea85/DAFTAR_LENGKAP_200_KREDENSIAL_WARGA_BUMI_WARGA.docx';

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(rootDocxPath, buffer);
  console.log(`✓ Dokumen Word Utama berhasil ditulis ke: ${rootDocxPath} (${(buffer.length / 1024).toFixed(1)} KB)`);

  try {
    fs.writeFileSync(artifactDocxPath, buffer);
    console.log(`✓ Dokumen Word Artefak berhasil ditulis ke: ${artifactDocxPath}`);
  } catch (err) {
    console.warn('Artefak write warning:', err.message);
  }
});
