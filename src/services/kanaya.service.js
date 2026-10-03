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
    
    // Injeksi konteks warga dari sesi
    let wargaInfo = null;
    let aparaturList = [];
    const activeNik = user?.active_nik || user?.username;

    if (activeNik) {
      try {
        wargaInfo = await wargaRepository.findByNik(activeNik);
      } catch (e) {}
    }

    try {
      aparaturList = await aparaturRepository.list({ kelurahan: 'Kebonjati' });
    } catch (e) {}

    const lurah = aparaturList.find(a => a.jabatan && a.jabatan.toLowerCase().includes('lurah'));
    const babinsa = aparaturList.find(a => a.kategori === 'KEAMANAN' && a.jabatan.toLowerCase().includes('babinsa'));
    const bhabin = aparaturList.find(a => a.kategori === 'KEAMANAN' && a.jabatan.toLowerCase().includes('bhabin'));
    const ketuaRw = aparaturList.find(a => a.kategori === 'RW');
    const ketuaRt = aparaturList.find(a => a.kategori === 'RT');
    const posyandu = aparaturList.find(a => a.kategori === 'POSYANDU');

    let reply = '';
    const actionChips = [];

    // 1. Pertanyaan seputar Struktur Aparatur, Lurah, Babinsa, Bhabinkamtibmas, RT/RW
    if (
      rawMsg.includes('lurah') || 
      rawMsg.includes('struktur') || 
      rawMsg.includes('pejabat') || 
      rawMsg.includes('babinsa') || 
      rawMsg.includes('bhabin') || 
      rawMsg.includes('rt') || 
      rawMsg.includes('rw')
    ) {
      reply = `Sampurasun! Wilujeng sumping di Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi.\n\nBerikut struktur aparatur dan kontak resmi wilayah kami:\n` +
        `• **Lurah Kebonjati**: ${lurah ? lurah.nama_pejabat : 'Drs. H. Maman Suryaman, M.Si'}\n` +
        `• **Babinsa TNI AD**: ${babinsa ? babinsa.nama_pejabat : 'Serma Dedi Supriadi'} (${babinsa ? babinsa.no_wa : '081322110099'})\n` +
        `• **Bhabinkamtibmas Polri**: ${bhabin ? bhabin.nama_pejabat : 'Aipda Agus Maulana'} (${bhabin ? bhabin.no_wa : '081299001122'})\n` +
        `• **Ketua RW 001**: ${ketuaRw ? ketuaRw.nama_pejabat : 'H. Ahmad Sanusi'} (${ketuaRw ? ketuaRw.no_wa : '081233445566'})\n` +
        `• **Ketua RT 001**: ${ketuaRt ? ketuaRt.nama_pejabat : 'Dadang Ruhiyat'} (${ketuaRt ? ketuaRt.no_wa : '081344556677'})\n` +
        `• **Kader Posyandu Melati**: ${posyandu ? posyandu.nama_pejabat : 'Ny. Hj. Yayah Rokayah'}\n\n` +
        `Aya anu tiasa Kanaya bantos deui perkawis pelayanan administrasi atanapi bantuan sosial?`;

      if (babinsa && babinsa.no_wa) {
        actionChips.push({
          label: `Hubungi Babinsa (${babinsa.nama_pejabat})`,
          type: 'whatsapp',
          url: `https://wa.me/${babinsa.no_wa.replace(/^0/, '62')}?text=${encodeURIComponent('Sampurasun Bpk Babinsa Kebonjati, saya warga ingin konsultasi kamtibmas.')}`
        });
      }
      if (bhabin && bhabin.no_wa) {
        actionChips.push({
          label: `Hubungi Bhabinkamtibmas`,
          type: 'whatsapp',
          url: `https://wa.me/${bhabin.no_wa.replace(/^0/, '62')}?text=${encodeURIComponent('Sampurasun Bpk Bhabinkamtibmas Kebonjati, saya warga ingin melapor situasi lingkungan.')}`
        });
      }
      actionChips.push({
        label: 'Lihat Direktori Aparatur',
        type: 'navigate',
        url: '/dashboard/aparatur'
      });

      return { reply, action_chips: actionChips };
    }

    // 2. Pertanyaan seputar Pengajuan Surat / Dokumen / Domisili / SKU / SKTM
    if (
      rawMsg.includes('surat') || 
      rawMsg.includes('domisili') || 
      rawMsg.includes('sku') || 
      rawMsg.includes('sktm') || 
      rawMsg.includes('pengantar')
    ) {
      reply = `Untuk pengajuan surat di Kelurahan Kebonjati, alur pelayanan kini sepenuhnya **paperless & digital**:\n\n` +
        `1. Warga mengajukan surat secara online (bisa untuk diri sendiri atau anggota keluarga dalam 1 KK).\n` +
        `2. Ketua RT memverifikasi rekomendasi secara digital melalui aplikasi.\n` +
        `3. Ketua RW memvalidasi berkas secara digital.\n` +
        `4. Kelurahan Kebonjati mengesahkan dan menerbitkan Nomor Surat Resmi dengan **Tanda Tangan Elektronik (TTE) QR Code** tersertifikasi BSrE.\n` +
        `5. Warga langsung dapat mengunduh atau mencetak dokumen sah tanpa perlu antre di kantor kelurahan!`;

      actionChips.push({
        label: 'Ajukan Surat Mandiri',
        type: 'navigate',
        url: '/dashboard/dokumen?action=new'
      });
      actionChips.push({
        label: 'Scanner QR Terpadu',
        type: 'navigate',
        url: '/dashboard/scanner'
      });

      return { reply, action_chips: actionChips };
    }

    // Default Response Ramah Pasundan
    reply = `Sampurasun! Kanaya siap ngabantos wargi sadayana di Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi. ` +
      `Wargi tiasa naroskeun perkawis kontak aparat kelurahan (Lurah, Babinsa, Bhabinkamtibmas, RT/RW), alur pengajuan surat online, bantuan sosial, atanapi jadwal Posyandu. Aya naon anu tiasa dibantos dinten ieu?`;

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
