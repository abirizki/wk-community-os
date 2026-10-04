/**
 * src/services/kanaya.service.js
 * Kanaya AI Context-Aware Reasoning Engine (Sprint 3)
 * Bumi Warga - Jabar Pintar Digital
 */

const aparaturRepository = require('../repositories/aparatur.repository');
const wargaRepository = require('../repositories/warga.repository');
const dokumenRepository = require('../repositories/dokumen.repository');

class KanayaService {
  async processQuery({ message, user }) {
    const rawMsg = (message || '').trim().toLowerCase();
    
    // Injeksi konteks warga dari sesi aktif
    let wargaInfo = null;
    let aparaturList = [];
    const activeNik = user?.active_nik || user?.username;

    if (activeNik) {
      try {
        wargaInfo = await wargaRepository.findByNik(activeNik);
      } catch (e) {}
    }

    const kelurahanName = wargaInfo?.kelurahan || user?.kelurahan || 'Kebonjati';

    try {
      aparaturList = await aparaturRepository.list({ kelurahan: kelurahanName });
      if (!aparaturList || aparaturList.length === 0) {
        aparaturList = await aparaturRepository.list({ kelurahan: null });
      }
    } catch (e) {
      aparaturList = [];
    }

    const lurah = aparaturList.find(a => a.jabatan && a.jabatan.toLowerCase().includes('lurah'));
    const babinsa = aparaturList.find(a => a.kategori === 'KEAMANAN' && a.jabatan.toLowerCase().includes('babinsa'));
    const bhabin = aparaturList.find(a => (a.kategori === 'KEAMANAN' || (a.jabatan && a.jabatan.toLowerCase().includes('bhabin'))));
    
    const userRw = wargaInfo?.rw || user?.rw;
    const userRt = wargaInfo?.rt || user?.rt;
    const ketuaRw = (userRw ? aparaturList.find(a => a.kategori === 'RW' && (a.wilayah_rw == userRw || a.wilayah_rw == String(userRw).padStart(3, '0'))) : null) || aparaturList.find(a => a.kategori === 'RW');
    const ketuaRt = (userRt ? aparaturList.find(a => a.kategori === 'RT' && (a.wilayah_rt == userRt || a.wilayah_rt == String(userRt).padStart(3, '0'))) : null) || aparaturList.find(a => a.kategori === 'RT');
    const posyandu = aparaturList.find(a => a.kategori === 'POSYANDU');

    let reply = '';
    const actionChips = [];

    // 1. Khusus Pertanyaan Babinsa / TNI AD
    if (rawMsg.includes('babinsa') || rawMsg.includes('tni')) {
      const babinsaNama = babinsa ? babinsa.nama_pejabat : 'Serma Dedi Supriadi';
      const babinsaKontak = babinsa ? (babinsa.no_wa || babinsa.no_telp || '0813-2211-0099') : '0813-2211-0099';
      const babinsaPangkat = babinsa?.pangkat_golongan || 'Sersan Mayor (Koramil 0701/Cikole)';
      const babinsaAlamat = babinsa?.alamat_kantor || 'Pos Koramil 0701 Cikole / Kelurahan Kebonjati';
      const babinsaJam = babinsa?.jam_layanan || 'Siaga 24 Jam';

      reply = `Sampurasun${wargaInfo?.nama ? ` Bpk/Ibu ${wargaInfo.nama}` : ''}! Berdasarkan wilayah binaan Kelurahan ${kelurahanName}, Kota Sukabumi:\n\n` +
        `🎖️ **Babinsa Pembina Kelurahan (TNI AD)**:\n` +
        `• **Nama Pejabat**: **${babinsaNama}**\n` +
        `• **Pangkat / Satuan**: ${babinsaPangkat}\n` +
        `• **Nomor Telepon / WhatsApp**: **${babinsaKontak}**\n` +
        `• **Jam Layanan**: ${babinsaJam}\n` +
        `• **Pos Siaga**: ${babinsaAlamat}\n\n` +
        (bhabin ? `👮 **Mitra Sinergi Kamtibmas (Bhabinkamtibmas Polri)**:\n• **${bhabin.nama_pejabat}** (${bhabin.no_wa || bhabin.no_telp || '0812-9900-1122'})\n\n` : '') +
        `Aya perkawis kaamanan lingkungan atanapi konsultasi kamtibmas anu tiasa dibantos?`;

      if (babinsaKontak) {
        const waNum = babinsaKontak.replace(/[^0-9]/g, '').replace(/^0/, '62');
        actionChips.push({
          label: `Hubungi Babinsa (${babinsaNama})`,
          type: 'whatsapp',
          url: `https://wa.me/${waNum}?text=${encodeURIComponent('Sampurasun Bpk Babinsa, saya warga ingin konsultasi situasi kamtibmas.')}`
        });
      }
      if (bhabin && (bhabin.no_wa || bhabin.no_telp)) {
        const bhabinNum = (bhabin.no_wa || bhabin.no_telp).replace(/[^0-9]/g, '').replace(/^0/, '62');
        actionChips.push({
          label: `Hubungi Bhabinkamtibmas`,
          type: 'whatsapp',
          url: `https://wa.me/${bhabinNum}?text=${encodeURIComponent('Sampurasun Bpk Bhabinkamtibmas, saya warga ingin melapor situasi kamtibmas.')}`
        });
      }
      actionChips.push({
        label: 'Direktori Aparatur Lengkap',
        type: 'navigate',
        url: '/dashboard/aparatur'
      });

      return { reply, action_chips: actionChips };
    }

    // 2. Khusus Pertanyaan Bhabinkamtibmas / Polsek / Polisi
    if (rawMsg.includes('bhabin') || rawMsg.includes('polsek') || rawMsg.includes('polri') || rawMsg.includes('polisi') || rawMsg.includes('kamtibmas')) {
      const bhabinNama = bhabin ? bhabin.nama_pejabat : 'Aipda Agus Maulana';
      const bhabinKontak = bhabin ? (bhabin.no_wa || bhabin.no_telp || '0812-9900-1122') : '0812-9900-1122';
      const bhabinPangkat = bhabin?.pangkat_golongan || 'Ajun Inspektur Polisi Dua (Polsek Cikole)';

      reply = `Sampurasun${wargaInfo?.nama ? ` Bpk/Ibu ${wargaInfo.nama}` : ''}! Berdasarkan wilayah hukum Kelurahan ${kelurahanName}, Kota Sukabumi:\n\n` +
        `👮 **Bhabinkamtibmas Polri (Mitra Kamtibmas)**:\n` +
        `• **Nama Pejabat**: **${bhabinNama}**\n` +
        `• **Pangkat / Satuan**: ${bhabinPangkat}\n` +
        `• **Nomor Telepon / WhatsApp**: **${bhabinKontak}**\n` +
        `• **Jam Layanan**: ${bhabin?.jam_layanan || 'Siaga 24 Jam'}\n` +
        `• **Pos Siaga**: ${bhabin?.alamat_kantor || 'Pos Bhabinkamtibmas / Polsek Cikole'}\n\n` +
        (babinsa ? `🎖️ **Mitra Tiga Pilar (Babinsa TNI AD)**:\n• **${babinsa.nama_pejabat}** (${babinsa.no_wa || babinsa.no_telp || '0813-2211-0099'})\n\n` : '') +
        `Aya perkawis kamtibmas atanapi laporan situasi anu tiasa Kanaya bantos?`;

      if (bhabinKontak) {
        const waNum = bhabinKontak.replace(/[^0-9]/g, '').replace(/^0/, '62');
        actionChips.push({
          label: `Hubungi Bhabinkamtibmas`,
          type: 'whatsapp',
          url: `https://wa.me/${waNum}?text=${encodeURIComponent('Sampurasun Bpk Bhabinkamtibmas, saya warga ingin melapor situasi kamtibmas.')}`
        });
      }
      if (babinsa && (babinsa.no_wa || babinsa.no_telp)) {
        const babinsaNum = (babinsa.no_wa || babinsa.no_telp).replace(/[^0-9]/g, '').replace(/^0/, '62');
        actionChips.push({
          label: `Hubungi Babinsa`,
          type: 'whatsapp',
          url: `https://wa.me/${babinsaNum}?text=${encodeURIComponent('Sampurasun Bpk Babinsa, saya warga ingin konsultasi situasi kamtibmas.')}`
        });
      }
      actionChips.push({
        label: 'Direktori Aparatur Lengkap',
        type: 'navigate',
        url: '/dashboard/aparatur'
      });

      return { reply, action_chips: actionChips };
    }

    // 3. Kontak Darurat / Kebakaran / Ambulans / 112
    if (rawMsg.includes('darurat') || rawMsg.includes('ambulance') || rawMsg.includes('ambulans') || rawMsg.includes('damkar') || rawMsg.includes('kebakaran') || rawMsg.includes('112')) {
      reply = `🚨 **Kontak Darurat & Layanan Cepat Wilayah Sukabumi**:\n\n` +
        `• **Call Center Darurat Bebas Pulsa**: **112** (Siaga 24 Jam)\n` +
        `• **Polsek Cikole (Polres Sukabumi Kota)**: (0266) 221110 / 110\n` +
        `• **Damkar & Penyelamatan Kota Sukabumi**: (0266) 222113\n` +
        `• **Ambulans / PMI Kota Sukabumi**: (0266) 225118 / 119\n` +
        `• **Babinsa TNI AD**: ${babinsa ? babinsa.nama_pejabat : 'Serma Dedi Supriadi'} (${babinsa ? (babinsa.no_wa || babinsa.no_telp) : '0813-2211-0099'})\n` +
        `• **Bhabinkamtibmas Polri**: ${bhabin ? bhabin.nama_pejabat : 'Aipda Agus Maulana'} (${bhabin ? (bhabin.no_wa || bhabin.no_telp) : '0812-9900-1122'})\n\n` +
        `Segera hubungi nomor di atas jika terjadi keadaan darurat, musibah, atau situasi medis mendesak!`;

      actionChips.push({
        label: 'Hubungi Babinsa (Darurat)',
        type: 'whatsapp',
        url: `https://wa.me/${(babinsa ? (babinsa.no_wa || '081322110099') : '081322110099').replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent('DARURAT: Mohon bantuan Babinsa di lingkungan kami.')}`
      });
      actionChips.push({
        label: 'Hubungi Bhabinkamtibmas (Darurat)',
        type: 'whatsapp',
        url: `https://wa.me/${(bhabin ? (bhabin.no_wa || '081299001122') : '081299001122').replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent('DARURAT: Mohon bantuan Bhabinkamtibmas di lingkungan kami.')}`
      });

      return { reply, action_chips: actionChips };
    }

    // 4. Struktur Aparatur / Pejabat / Lurah / RT / RW Umum
    if (
      rawMsg.includes('lurah') || 
      rawMsg.includes('struktur') || 
      rawMsg.includes('pejabat') || 
      rawMsg.includes('aparatur') ||
      rawMsg.includes('rt') || 
      rawMsg.includes('rw')
    ) {
      reply = `Sampurasun! Wilujeng sumping di Kelurahan ${kelurahanName}, Kecamatan Cikole, Kota Sukabumi.\n\nBerikut struktur aparatur dan kontak resmi wilayah kami:\n` +
        `• **Lurah ${kelurahanName}**: ${lurah ? lurah.nama_pejabat : 'Drs. H. Maman Suryaman, M.Si'}\n` +
        `• **Babinsa TNI AD**: ${babinsa ? babinsa.nama_pejabat : 'Serma Dedi Supriadi'} (${babinsa ? (babinsa.no_wa || babinsa.no_telp) : '081322110099'})\n` +
        `• **Bhabinkamtibmas Polri**: ${bhabin ? bhabin.nama_pejabat : 'Aipda Agus Maulana'} (${bhabin ? (bhabin.no_wa || bhabin.no_telp) : '081299001122'})\n` +
        `• **Ketua RW ${userRw || '001'}**: ${ketuaRw ? ketuaRw.nama_pejabat : 'H. Ahmad Sanusi'} (${ketuaRw ? (ketuaRw.no_wa || ketuaRw.no_telp) : '081233445566'})\n` +
        `• **Ketua RT ${userRt || '001'}**: ${ketuaRt ? ketuaRt.nama_pejabat : 'Dadang Ruhiyat'} (${ketuaRt ? (ketuaRt.no_wa || ketuaRt.no_telp) : '081344556677'})\n` +
        (posyandu ? `• **Kader Posyandu**: ${posyandu.nama_pejabat} (${posyandu.nama_posyandu || 'Posyandu Melati'})\n\n` : '\n') +
        `Aya anu tiasa Kanaya bantos deui perkawis pelayanan administrasi atanapi bantuan sosial?`;

      if (babinsa && (babinsa.no_wa || babinsa.no_telp)) {
        actionChips.push({
          label: `Hubungi Babinsa (${babinsa.nama_pejabat})`,
          type: 'whatsapp',
          url: `https://wa.me/${(babinsa.no_wa || babinsa.no_telp).replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent('Sampurasun Bpk Babinsa, saya warga ingin konsultasi.')}`
        });
      }
      if (bhabin && (bhabin.no_wa || bhabin.no_telp)) {
        actionChips.push({
          label: `Hubungi Bhabinkamtibmas`,
          type: 'whatsapp',
          url: `https://wa.me/${(bhabin.no_wa || bhabin.no_telp).replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent('Sampurasun Bpk Bhabinkamtibmas, saya warga ingin konsultasi.')}`
        });
      }
      actionChips.push({
        label: 'Lihat Direktori Aparatur',
        type: 'navigate',
        url: '/dashboard/aparatur'
      });

      return { reply, action_chips: actionChips };
    }

    // 5. Pertanyaan seputar Pengajuan Surat / Dokumen / Domisili / SKU / SKTM
    if (
      rawMsg.includes('surat') || 
      rawMsg.includes('domisili') || 
      rawMsg.includes('sku') || 
      rawMsg.includes('sktm') || 
      rawMsg.includes('pengantar')
    ) {
      reply = `Untuk pengajuan surat di Kelurahan ${kelurahanName}, alur pelayanan kini sepenuhnya **paperless & digital**:\n\n` +
        `1. Warga mengajukan surat secara online (bisa untuk diri sendiri atau anggota keluarga dalam 1 KK).\n` +
        `2. Ketua RT memverifikasi rekomendasi secara digital melalui aplikasi.\n` +
        `3. Ketua RW memvalidasi berkas secara digital.\n` +
        `4. Kelurahan ${kelurahanName} mengesahkan dan menerbitkan Nomor Surat Resmi dengan **Tanda Tangan Elektronik (TTE) QR Code** sah SPBE.\n` +
        `5. Warga langsung dapat mengunduh atau mencetak dokumen sah tanpa perlu antre di kantor kelurahan!`;

      actionChips.push({
        label: 'Ajukan Surat Mandiri',
        type: 'navigate',
        url: '/dashboard/dokumen?action=new'
      });
      actionChips.push({
        label: 'Lihat Riwayat Dokumen',
        type: 'navigate',
        url: '/dashboard/dokumen'
      });

      return { reply, action_chips: actionChips };
    }

    // 6. Default Response Ramah Pasundan
    reply = `Sampurasun! Kanaya siap ngabantos wargi sadayana di Kelurahan ${kelurahanName}, Kecamatan Cikole, Kota Sukabumi.\n\n` +
      `Wargi tiasa naroskeun perkawis kontak aparat kelurahan (Lurah, Babinsa, Bhabinkamtibmas, RT/RW), alur pengajuan surat online, bantuan sosial, jadwal Posyandu, atanapi kontak darurat. Aya naon anu tiasa dibantos dinten ieu?`;

    actionChips.push({
      label: 'Direktori Aparatur & Keamanan',
      type: 'navigate',
      url: '/dashboard/aparatur'
    });
    actionChips.push({
      label: 'Layanan Surat Digital',
      type: 'navigate',
      url: '/dashboard/dokumen'
    });

    return { reply, action_chips: actionChips };
  }
}

module.exports = new KanayaService();
