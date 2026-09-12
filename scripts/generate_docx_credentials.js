import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as docx from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

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
  PageNumber
} = docx;

// Data Akun Resmi Pemda Kota Sukabumi & Pilot Kebonjati
const ACCOUNTS = [
  // 1. Eksekutif Kota
  { no: 1, kategori: 'Pemerintah Kota', nama: 'Walikota Sukabumi', jabatan: 'Kepala Daerah Kota Sukabumi', role: 'walikota', wilayah: 'Kota Sukabumi (33 Kelurahan)', username: 'walikota.sukabumi', pass: 'Sukabumi@Juara2026', policy: 'Wajib Ganti Sandi' },
  { no: 2, kategori: 'Pemerintah Kota', nama: 'Super Admin Diskominfo', jabatan: 'Administrator Utama Sistem & Infrastruktur', role: 'superadmin', wilayah: 'Kota Sukabumi (33 Kelurahan)', username: 'superadmin', pass: 'Sukabumi@Diskominfo2026', policy: 'Wajib Ganti Sandi' },
  
  // 2. Tingkat Kecamatan
  { no: 3, kategori: 'Kecamatan', nama: 'Camat Cikole', jabatan: 'Camat Wilayah Cikole', role: 'camat', wilayah: 'Kec. Cikole (6 Kelurahan)', username: 'camat.cikole', pass: 'Cikole@Bisa2026', policy: 'Wajib Ganti Sandi' },
  { no: 4, kategori: 'Kecamatan', nama: 'Camat Gunungpuyuh', jabatan: 'Camat Wilayah Gunungpuyuh', role: 'camat', wilayah: 'Kec. Gunungpuyuh (4 Kelurahan)', username: 'camat.gunungpuyuh', pass: 'Gunungpuyuh@Bisa2026', policy: 'Wajib Ganti Sandi' },
  { no: 5, kategori: 'Kecamatan', nama: 'Camat Warudoyong', jabatan: 'Camat Wilayah Warudoyong', role: 'camat', wilayah: 'Kec. Warudoyong (5 Kelurahan)', username: 'camat.warudoyong', pass: 'Warudoyong@Bisa2026', policy: 'Wajib Ganti Sandi' },

  // 3. Tingkat Kelurahan Pilot (Kebonjati)
  { no: 6, kategori: 'Kelurahan', nama: 'Ahmad Sofyan, S.IP', jabatan: 'Lurah Kebonjati (Penandatangan TTE)', role: 'lurah', wilayah: 'Kelurahan Kebonjati', username: 'lurah.kebonjati', pass: 'Lurah@Kebonjati2026', policy: 'Wajib Ganti Sandi' },
  { no: 7, kategori: 'Kelurahan', nama: 'Admin Pelayanan Kelurahan', jabatan: 'Staf Pelayanan Administrasi Warga', role: 'admin_kelurahan', wilayah: 'Kelurahan Kebonjati', username: 'admin.kebonjati', pass: 'Kebonjati@Hebat2026', policy: 'Wajib Ganti Sandi' },

  // 4. Tingkat Rukun Warga (RW)
  { no: 8, kategori: 'Rukun Warga (RW)', nama: 'Ketua RW 001 Kebonjati', jabatan: 'Ketua Rukun Warga 001', role: 'ketua_rw', wilayah: 'Kelurahan Kebonjati (RW 001)', username: 'rw01_kebonjati', pass: 'Warga01@Kbj2026', policy: 'Wajib Ganti Sandi' },
  { no: 9, kategori: 'Rukun Warga (RW)', nama: 'Ketua RW 002 Kebonjati', jabatan: 'Ketua Rukun Warga 002', role: 'ketua_rw', wilayah: 'Kelurahan Kebonjati (RW 002)', username: 'rw02_kebonjati', pass: 'Warga02@Kbj2026', policy: 'Wajib Ganti Sandi' },

  // 5. Tingkat Rukun Tetangga (RT)
  { no: 10, kategori: 'Rukun Tetangga (RT)', nama: 'Ketua RT 001 RW 001', jabatan: 'Ketua Rukun Tetangga 001', role: 'ketua_rt', wilayah: 'Kebonjati (RT 001 / RW 001)', username: 'rt01_rw01_kbj', pass: 'Guyub01@Kbj2026', policy: 'Wajib Ganti Sandi' },
  { no: 11, kategori: 'Rukun Tetangga (RT)', nama: 'Ketua RT 002 RW 001', jabatan: 'Ketua Rukun Tetangga 002', role: 'ketua_rt', wilayah: 'Kebonjati (RT 002 / RW 001)', username: 'rt02_rw01_kbj', pass: 'Guyub02@Kbj2026', policy: 'Wajib Ganti Sandi' },
  { no: 12, kategori: 'Rukun Tetangga (RT)', nama: 'Ketua RT 001 RW 002', jabatan: 'Ketua Rukun Tetangga 001', role: 'ketua_rt', wilayah: 'Kebonjati (RT 001 / RW 002)', username: 'rt01_rw02_kbj', pass: 'Guyub01@Kbj2026', policy: 'Wajib Ganti Sandi' },

  // 6. Kader Posyandu
  { no: 13, kategori: 'Kader Posyandu', nama: 'Bdn. Imas Rohayati', jabatan: 'Koordinator Posyandu Melati RW 01', role: 'kader_posyandu', wilayah: 'Kebonjati (RW 001)', username: 'posyandu.melati_rw01', pass: 'Sehat01@Kbj2026', policy: 'Wajib Ganti Sandi' },

  // 7. Warga Mandiri
  { no: 14, kategori: 'Warga Masyarakat', nama: 'Budi Santoso', jabatan: 'Warga / Kepala Keluarga', role: 'warga', wilayah: 'Kebonjati (RT 001 / RW 001)', username: '3273010203850003', pass: 'Warga@0003#2026', policy: 'Wajib Ganti Sandi' },
  { no: 15, kategori: 'Warga Masyarakat', nama: 'Siti Rahayu', jabatan: 'Warga / Ibu Rumah Tangga', role: 'warga', wilayah: 'Kebonjati (RT 002 / RW 001)', username: '3273014504900004', pass: 'Warga@0004#2026', policy: 'Wajib Ganti Sandi' }
];

// Helper styles
const THEME_EMERALD = '1B4332';
const THEME_LIGHT_BG = 'F4FBF7';
const THEME_BORDER = 'CCCCCC';

function makeCell(text, isHeader = false, widthPercent = null, isCode = false) {
  const cellProps = {
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text,
            bold: isHeader,
            color: isHeader ? 'FFFFFF' : (isCode ? '1B4332' : '000000'),
            font: isCode ? 'Consolas' : 'Calibri',
            size: isHeader ? 19 : 18 // 9.5pt and 9pt
          })
        ]
      })
    ],
    shading: isHeader
      ? { fill: THEME_EMERALD }
      : { fill: 'FFFFFF' },
    margins: {
      top: 100,
      bottom: 100,
      left: 120,
      right: 120
    }
  };

  if (widthPercent) {
    cellProps.width = { size: widthPercent, type: WidthType.PERCENTAGE };
  }

  return new TableCell(cellProps);
}

async function buildDocx() {
  console.log('Membuat berkas Word (.docx) daftar kredensial resmi...');

  // Header Table
  const tableHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      makeCell('No', true, 5),
      makeCell('Kategori', true, 14),
      makeCell('Nama Pemegang / Jabatan', true, 22),
      makeCell('Peran (Role)', true, 13),
      makeCell('Wilayah Tugas', true, 16),
      makeCell('Username Resmi', true, 15, true),
      makeCell('Password Awal', true, 15, true)
    ]
  });

  const tableDataRows = ACCOUNTS.map((acc) => {
    return new TableRow({
      children: [
        makeCell(String(acc.no), false, 5),
        makeCell(acc.kategori, false, 14),
        makeCell(`${acc.nama}\n(${acc.jabatan})`, false, 22),
        makeCell(acc.role, false, 13, true),
        makeCell(acc.wilayah, false, 16),
        makeCell(acc.username, false, 15, true),
        makeCell(acc.pass, false, 15, true)
      ]
    });
  });

  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableHeaderRow, ...tableDataRows]
  });

  // Slip Distribusi Per-Orang
  const slipParagraphs = [];
  slipParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'BAGIAN II: SLIP DISTRIBUSI KREDENSIAL SIAP CETAK & TANDATANGAN',
          bold: true,
          size: 24,
          color: THEME_EMERALD
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: 'Petunjuk: Setiap kotak di bawah ini dapat digunting dan diserahkan langsung kepada penerima akun disertai tanda tangan bukti penyerahan.',
          italics: true,
          size: 19
        })
      ]
    })
  );

  // Buat Slip Box per akun
  for (const acc of ACCOUNTS) {
    const slipTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: THEME_LIGHT_BG },
              margins: { top: 120, bottom: 120, left: 180, right: 180 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'PEMERINTAH KOTA SUKABUMI · BUMI WARGA COMMUNITY OS', bold: true, size: 17, color: THEME_EMERALD }),
                    new TextRun({ text: `\nSLIP PENYERAHAN AKUN RESMI — ${acc.kategori.toUpperCase()}`, bold: true, size: 20, color: '081C15' }),
                    new TextRun({ text: `\nNama Petugas / Warga : ${acc.nama}`, size: 19, bold: true }),
                    new TextRun({ text: `\nJabatan / Tugas       : ${acc.jabatan}`, size: 18 }),
                    new TextRun({ text: `\nWilayah Operasional   : ${acc.wilayah}`, size: 18 }),
                    new TextRun({ text: `\n---------------------------------------------------------------------------------------------------------`, size: 16, color: '888888' }),
                    new TextRun({ text: `\nUsername Resmi       : `, size: 19 }),
                    new TextRun({ text: acc.username, bold: true, font: 'Consolas', size: 20, color: '0055AA' }),
                    new TextRun({ text: `\nKata Sandi Awal      : `, size: 19 }),
                    new TextRun({ text: acc.pass, bold: true, font: 'Consolas', size: 20, color: 'AA0022' }),
                    new TextRun({ text: `\nKebijakan Sistem     : Wajib ubah kata sandi saat pertama kali login (BSSN & UU PDP).`, italics: true, size: 17 }),
                    new TextRun({ text: `\nPortal Login Resmi   : https://bumiwarga.sukabumikota.go.id (atau http://localhost:3000)`, size: 17, color: '006622' }),
                    new TextRun({ text: `\n\n[Tanda Tangan Petugas Penyerah]                 [Tanda Tangan Penerima Akun]`, size: 18 }),
                    new TextRun({ text: `\n\n\n_________________________________                 _________________________________`, size: 18 }),
                    new TextRun({ text: `\n(Admin Kelurahan / Diskominfo)                     (${acc.nama})`, size: 17, italics: true })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });

    slipParagraphs.push(slipTable);
    slipParagraphs.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  }

  // Buat Dokumen Lengkap
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'DOKUMEN RAHASIA PEMDA KOTA SUKABUMI · BUMI WARGA COMMUNITY OS',
                    size: 15,
                    color: '777777',
                    italics: true
                  })
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
                  new TextRun({
                    text: 'Halaman ',
                    size: 16,
                    color: '777777'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '777777'
                  }),
                  new TextRun({
                    text: ' dari ',
                    size: 16,
                    color: '777777'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '777777'
                  })
                ]
              })
            ]
          })
        },
        children: [
          // Kop Dokumen
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: 'PEMERINTAH KOTA SUKABUMI',
                bold: true,
                size: 26,
                color: '081C15'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: 'DINAS KOMUNIKASI DAN INFORMATIKA · KELURAHAN KEBONJATI',
                bold: true,
                size: 22,
                color: THEME_EMERALD
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'DAFTAR KREDENSIAL RESMI & SLIP DISTRIBUSI PENGGUNA SISTEM BUMI WARGA',
                bold: true,
                size: 20,
                color: '081C15'
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: 'Sesuai dengan Peraturan Pelindungan Data Pribadi (UU PDP No. 27/2022) dan Standar Keamanan Informasi BSSN, daftar akun resmi dan kata sandi aktivasi awal bagi aparatur pemerintah, pengurus RW/RT, kader posyandu, dan warga ditetapkan sebagai berikut:',
                size: 19
              })
            ]
          }),

          // Bagian I: Tabel Utama
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'BAGIAN I: TABEL REKAPITULASI KREDENSIAL APARATUR & WARGA',
                bold: true,
                size: 22,
                color: THEME_EMERALD
              })
            ]
          }),
          mainTable,

          // Bagian II: Slip Siap Cetak
          ...slipParagraphs
        ]
      }
    ]
  });

  // Export buffer
  const buffer = await Packer.toBuffer(doc);

  // Target paths:
  // 1. docs/DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.docx
  // 2. public/downloads/DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.docx (Downloadable from web browser!)
  const docsTarget = path.join(root, 'docs', 'DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.docx');
  const publicDir = path.join(root, 'public', 'downloads');
  fs.mkdirSync(publicDir, { recursive: true });
  const publicTarget = path.join(publicDir, 'DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.docx');

  fs.writeFileSync(docsTarget, buffer);
  fs.writeFileSync(publicTarget, buffer);

  console.log(`✅ [PASS] File Word (.docx) berhasil disimpan di:`);
  console.log(`   - docs/DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.docx`);
  console.log(`   - public/downloads/DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.docx`);

  // Buat juga versi HTML Word (.doc) yang bisa dibuka langsung di semua versi MS Word
  const htmlDoc = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>Daftar Kredensial Resmi Bumi Warga</title>
    <style>
      body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #111; margin: 24px; }
      h1 { font-size: 16pt; color: #1b4332; text-align: center; margin-bottom: 4px; font-weight: bold; }
      h2 { font-size: 13pt; color: #2d6a4f; text-align: center; margin-top: 0; margin-bottom: 16px; }
      h3 { font-size: 12pt; color: #1b4332; border-bottom: 2px solid #1b4332; padding-bottom: 4px; margin-top: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px 10px; font-size: 9.5pt; }
      th { background-color: #1b4332; color: #ffffff; font-weight: bold; text-align: center; }
      tr:nth-child(even) { background-color: #f9fbf9; }
      .code { font-family: 'Consolas', monospace; font-weight: bold; color: #1b4332; }
      .pass { font-family: 'Consolas', monospace; font-weight: bold; color: #b91c1c; }
      .slip { border: 2px dashed #1b4332; background-color: #f4fbf7; padding: 14px 18px; margin-bottom: 18px; border-radius: 8px; page-break-inside: avoid; }
      .slip-title { font-weight: bold; font-size: 11pt; color: #1b4332; margin-bottom: 8px; }
      .signature-area { margin-top: 20px; display: flex; justify-content: space-between; }
    </style>
  </head>
  <body>
    <h1>PEMERINTAH KOTA SUKABUMI</h1>
    <h2>DINAS KOMUNIKASI DAN INFORMATIKA · KELURAHAN KEBONJATI<br>DAFTAR KREDENSIAL RESMI & SLIP DISTRIBUSI PENGGUNA "BUMI WARGA"</h2>
    <p>Dokumen ini memuat daftar username dan kata sandi aktivasi awal akun resmi Pemerintah Kota Sukabumi dan Kelurahan Kebonjati. Sesuai standar keamanan siber BSSN dan UU PDP No. 27/2022, pengguna wajib mengganti kata sandi pribadi saat pertama kali login.</p>
    
    <h3>BAGIAN I: TABEL REKAPITULASI KREDENSIAL</h3>
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Kategori</th>
          <th>Nama Pemegang / Jabatan</th>
          <th>Role</th>
          <th>Wilayah</th>
          <th>Username Resmi</th>
          <th>Password Default Awal</th>
        </tr>
      </thead>
      <tbody>
        ${ACCOUNTS.map(a => `
          <tr>
            <td align="center">${a.no}</td>
            <td><b>${a.kategori}</b></td>
            <td>${a.nama}<br><small style="color:#555;">${a.jabatan}</small></td>
            <td><code>${a.role}</code></td>
            <td>${a.wilayah}</td>
            <td class="code">${a.username}</td>
            <td class="pass">${a.pass}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <br>
    <h3>BAGIAN II: SLIP DISTRIBUSI KREDENSIAL SIAP CETAK & TANDATANGAN</h3>
    ${ACCOUNTS.map(a => `
      <div class="slip">
        <div class="slip-title">PEMERINTAH KOTA SUKABUMI · BUMI WARGA COMMUNITY OS<br>SLIP PENYERAHAN KREDENSIAL RESMI — ${a.kategori.toUpperCase()}</div>
        <table style="border:none; margin:0;">
          <tr style="background:none;"><td style="border:none; width:180px;">Nama Petugas / Warga</td><td style="border:none;">: <b>${a.nama}</b></td></tr>
          <tr style="background:none;"><td style="border:none;">Jabatan / Tugas</td><td style="border:none;">: ${a.jabatan}</td></tr>
          <tr style="background:none;"><td style="border:none;">Wilayah Operasional</td><td style="border:none;">: ${a.wilayah}</td></tr>
          <tr style="background:none;"><td style="border:none;">Username Resmi</td><td style="border:none;">: <span class="code" style="font-size:11pt;">${a.username}</span></td></tr>
          <tr style="background:none;"><td style="border:none;">Kata Sandi Awal</td><td style="border:none;">: <span class="pass" style="font-size:11pt;">${a.pass}</span></td></tr>
          <tr style="background:none;"><td style="border:none;">Alamat Login</td><td style="border:none;">: https://bumiwarga.sukabumikota.go.id (atau http://localhost:3000)</td></tr>
        </table>
        <p style="font-size:8.5pt; color:#444; margin-top:8px;"><i>*Perhatian: Harap segera ubah kata sandi ini dengan kata sandi pribadi Anda saat login pertama kali.</i></p>
        <table style="border:none; margin-top:16px;">
          <tr style="background:none;">
            <td style="border:none; width:50%; text-align:center;">
              Yang Menyerahkan Akun,<br><br><br><br>
              ________________________________<br>
              (Admin Kelurahan / Diskominfo)
            </td>
            <td style="border:none; width:50%; text-align:center;">
              Yang Menerima Akun,<br><br><br><br>
              ________________________________<br>
              (<b>${a.nama}</b>)
            </td>
          </tr>
        </table>
      </div>
    `).join('')}
  </body>
  </html>
  `;

  const htmlDocTarget = path.join(publicDir, 'DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.doc');
  fs.writeFileSync(htmlDocTarget, htmlDoc);
  console.log(`✅ [PASS] File Word Fallback (.doc) berhasil disimpan di: public/downloads/DAFTAR_KREDENSIAL_RESMI_BUMI_WARGA.doc`);
  console.log('\nSEMUA BERKAS WORD BERHASIL DIGENERATE LENGKAP!');
}

buildDocx();

