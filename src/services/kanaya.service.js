/**
 * src/services/kanaya.service.js
 * Kanaya AI Context-Aware Reasoning Engine V2
 * Bumi Warga - Jabar Pintar Digital
 * Elevated Reasoning: PBB, Regional Facilities, Decision Support, & Aparatur
 */

const aparaturRepository = require('../repositories/aparatur.repository');
const wargaRepository = require('../repositories/warga.repository');
const dokumenRepository = require('../repositories/dokumen.repository');
const pbbRepository = require('../repositories/pbb.repository');
const fasilitasRepository = require('../repositories/fasilitas.repository');

class KanayaService {
  async processQuery({ message, user }) {
    const rawMsg = (message || '').trim().toLowerCase();
    
    // Injeksi konteks warga & hak akses dari sesi
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

    const isAparatur = ['superadmin', 'admin_kelurahan', 'admin', 'lurah', 'ketua_rw', 'ketua_rt'].includes(user?.role);
    const lurah = aparaturList.find(a => a.jabatan && a.jabatan.toLowerCase().includes('lurah'));
    const babinsa = aparaturList.find(a => a.kategori === 'KEAMANAN' && a.jabatan.toLowerCase().includes('babinsa'));
    const bhabin = aparaturList.find(a => a.kategori === 'KEAMANAN' && a.jabatan.toLowerCase().includes('bhabin'));
    const ketuaRw = aparaturList.find(a => a.kategori === 'RW');
    const ketuaRt = aparaturList.find(a => a.kategori === 'RT');
    const posyandu = aparaturList.find(a => a.kategori === 'POSYANDU');

    let reply = '';
    const actionChips = [];

    // Helper format rupiah
    const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n) || 0);

    // =========================================================================
    // 1. PENALARAN PBB (PAJAK BUMI DAN BANGUNAN)
    // =========================================================================
    if (
      rawMsg.includes('pbb') || 
      rawMsg.includes('pajak') || 
      rawMsg.includes('sppt') || 
      rawMsg.includes('dhkp') || 
      rawMsg.includes('tagihan tanah') || 
      rawMsg.includes('bayar pbb')
    ) {
      // Jika user adalah RT / RW yang bertanya tentang realisasi wilayah
      if (isAparatur && (rawMsg.includes('realisasi') || rawMsg.includes('wilayah') || rawMsg.includes('rt') || rawMsg.includes('rw') || rawMsg.includes('kepatuhan'))) {
        try {
          const stats = await pbbRepository.getStats({ rw: user?.rw || '001', rt: user?.rt || null }, 2026);
          const s = stats.summary;
          reply = `Sampurasun Bpk/Ibu Pengurus! Berikut ringkasan realisasi PBB-P2 Wilayah Kelurahan Kebonjati Tahun 2026:\n\n` +
            `• **Target Ketetapan**: ${formatIDR(s.total_target_nominal)} (${s.total_objek_pajak} objek)\n` +
            `• **Realisasi Penerimaan**: ${formatIDR(s.total_lunas_nominal)} (**${s.persentase_realisasi}%**)\n` +
            `• **Objek Lunas**: ${s.total_lunas_count} NOP\n` +
            `• **Piutang Belum Lunas**: ${formatIDR(s.total_terutang_nominal)} (${s.total_terutang_count} wajib pajak)\n\n` +
            `💡 **Saran Kanaya**: Pengurus dapat mengirimkan pengingat santun melalui WhatsApp langsung dari menu Monitoring PBB Wilayah tanpa mempermalukan warga demi akselerasi PAD Kota Sukabumi.`;

          actionChips.push({
            label: 'Monitoring PBB Wilayah',
            type: 'navigate',
            url: '/dashboard/pbb'
          });
          return { reply, action_chips: actionChips };
        } catch (e) {}
      }

      // Pertanyaan tagihan PBB pribadi / warga
      try {
        const myPbb = activeNik ? await pbbRepository.findByNik(activeNik) : [];
        if (myPbb.length > 0) {
          const latest = myPbb[0];
          const isLunas = latest.status_pembayaran === 'PAID';
          reply = `Sampurasun ${wargaInfo ? wargaInfo.nama : 'Bpk/Ibu'}!\n\nBerikut data ketetapan PBB-P2 Anda:\n` +
            `• **Nomor Objek Pajak (NOP)**: \`${latest.nop}\`\n` +
            `• **Tahun Pajak**: ${latest.tahun}\n` +
            `• **Alamat Objek**: ${latest.alamat_objek_pajak || 'Kebonjati'}\n` +
            `• **Nominal Pokok**: ${formatIDR(latest.nominal)}\n` +
            `• **Status**: ${isLunas ? '✅ **SUDAH LUNAS**' : '⏳ **BELUM BAYAR (MENUNGGAK)**'}\n` +
            `• **Jatuh Tempo**: ${new Date(latest.tanggal_jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n` +
            (isLunas 
              ? `Hatur nuhun atas kepatuhan pajak Anda! Dokumen E-SPPT digital resmi dan bukti setor dapat langsung diunduh.`
              : `Pembayaran dapat dilakukan praktis via aplikasi Bumi Warga (QRIS Dinamis / Virtual Account BJB), Indomaret/Alfamart, atau loket kelurahan.`);

          actionChips.push({
            label: 'Buka E-SPPT Digital',
            type: 'navigate',
            url: '/dashboard/pbb'
          });
          return { reply, action_chips: actionChips };
        } else {
          reply = `Sampurasun! Saat ini belum ditemukan data tagihan PBB yang terhubung dengan NIK Anda untuk tahun 2026. Anda dapat memantau E-SPPT digital atau berkonsultasi dengan operator di loket Kelurahan Kebonjati.`;
          actionChips.push({
            label: 'Layanan PBB Terpadu',
            type: 'navigate',
            url: '/dashboard/pbb'
          });
          return { reply, action_chips: actionChips };
        }
      } catch (err) {}
    }

    // =========================================================================
    // 2. PENALARAN FASILITAS KESEHATAN, PUSKESMAS, DOKTER & BIDAN
    // =========================================================================
    if (
      rawMsg.includes('puskesmas') || 
      rawMsg.includes('bidan') || 
      rawMsg.includes('dokter') || 
      rawMsg.includes('faskes') || 
      rawMsg.includes('klinik') || 
      rawMsg.includes('obat') || 
      rawMsg.includes('apotek') || 
      rawMsg.includes('darurat medis')
    ) {
      try {
        const faskesList = await fasilitasRepository.getKesehatanInventory({ rw: user?.rw || '001' });
        const puskesmas = faskesList.find(f => f.jenis_faskes === 'Puskesmas');
        const bidan = faskesList.find(f => f.jenis_faskes.includes('Bidan'));
        const apotek = faskesList.find(f => f.jenis_faskes === 'Apotek');

        reply = `Berikut rujukan fasilitas pelayanan kesehatan resmi terdekat di wilayah Kelurahan Kebonjati:\n\n` +
          `1. **${puskesmas ? puskesmas.nama_faskes : 'Puskesmas Kebonjati (Induk)'}**\n` +
          `   • Alamat: ${puskesmas ? puskesmas.alamat : 'Jl. Surya Kencana No. 55'}\n` +
          `   • Layanan: Siaga IGD 24 Jam, Rawat Inap (${puskesmas ? puskesmas.kapasitas_tempat_tidur : 10} bed), Dokter Umum & KIA\n` +
          `   • Kontak: ${puskesmas ? puskesmas.no_kontak : '0266-224488'}\n\n` +
          `2. **${bidan ? bidan.nama_faskes : 'Praktik Bidan Mandiri Hj. Siti Hasanah, S.Tr.Keb'}**\n` +
          `   • Layanan: Persalinan 24 Jam, Imunisasi Balita, KB Mandiri\n` +
          `   • Alamat: ${bidan ? bidan.alamat : 'Gang Melati I No. 8 RT 001/RW 001'}\n` +
          `   • Kontak: ${bidan ? bidan.no_kontak : '081234889900'}\n\n` +
          `3. **${apotek ? apotek.nama_faskes : 'Apotek Kimia Farma Kebonjati'}** (Buka 24 Jam)\n` +
          `   • Alamat: ${apotek ? apotek.alamat : 'Jl. Surya Kencana No. 70'}\n\n` +
          `🚨 Dalam kondisi kegawatdaruratan, silakan hubungi **Emergency Call 112 Kota Sukabumi** atau ambulans puskesmas.`;

        if (bidan && bidan.no_kontak) {
          actionChips.push({
            label: 'Hubungi Bidan Siaga',
            type: 'whatsapp',
            url: `https://wa.me/${bidan.no_kontak.replace(/^0/, '62')}?text=${encodeURIComponent('Sampurasun Ibu Bidan, saya warga Kebonjati ingin konsultasi kesehatan.')}`
          });
        }
        actionChips.push({
          label: 'Peta Fasilitas & Daya Dukung',
          type: 'navigate',
          url: '/dashboard/daya-dukung'
        });

        return { reply, action_chips: actionChips };
      } catch (err) {}
    }

    // =========================================================================
    // 3. PENALARAN TEMPAT IBADAH & TITIK EVAKUASI BENCANA
    // =========================================================================
    if (
      rawMsg.includes('masjid') || 
      rawMsg.includes('mushola') || 
      rawMsg.includes('gereja') || 
      rawMsg.includes('ibadah') || 
      rawMsg.includes('dkm') || 
      rawMsg.includes('evakuasi') || 
      rawMsg.includes('bencana') || 
      rawMsg.includes('gempa')
    ) {
      try {
        const ibadahList = await fasilitasRepository.getKeagamaanInventory({ rw: user?.rw || '001' });
        const masjid = ibadahList.find(i => i.jenis_tempat_ibadah === 'Masjid');
        const evakuasi = ibadahList.filter(i => i.titik_evakuasi_bencana === 1);

        reply = `Berikut informasi tempat ibadah dan titik evakuasi darurat di wilayah Kelurahan Kebonjati:\n\n` +
          `🕌 **${masjid ? masjid.nama_tempat_ibadah : "Masjid Jami' Al-Ikhlas"}**\n` +
          `• Alamat: ${masjid ? masjid.alamat : 'Jl. Kebonjati No. 45'}\n` +
          `• Kapasitas: ${masjid ? masjid.daya_tampung_jamaah : 350} Jamaah (Status: ${masjid ? masjid.status_tanah : 'Wakaf'})\n` +
          `• Pengurus DKM: ${masjid ? masjid.nama_pengurus_dkm : 'H. Ahmad Syukri'} (${masjid ? masjid.no_kontak_pengurus : '081298765432'})\n\n` +
          `🛡️ **Titik Evakuasi Bencana Terverifikasi**:\n` +
          evakuasi.map(e => `• **${e.nama_tempat_ibadah}** (${e.alamat}) - Kapasitas ${e.daya_tampung_jamaah} jiwa`).join('\n') +
          `\n\nTitik evakuasi dilengkapi akses logistik terbuka dan titik kumpul aman dari reruntuhan.`;

        actionChips.push({
          label: 'Direktori Tempat Ibadah & Evakuasi',
          type: 'navigate',
          url: '/dashboard/daya-dukung'
        });

        return { reply, action_chips: actionChips };
      } catch (err) {}
    }

    // =========================================================================
    // 4. PENALARAN PENDIDIKAN & ZONASI PPDB
    // =========================================================================
    if (
      rawMsg.includes('sekolah') || 
      rawMsg.includes('sd') || 
      rawMsg.includes('smp') || 
      rawMsg.includes('sma') || 
      rawMsg.includes('ppdb') || 
      rawMsg.includes('zonasi') || 
      rawMsg.includes('kursi baru')
    ) {
      try {
        const eduList = await fasilitasRepository.getPendidikanInventory({ rw: user?.rw || '001' });
        reply = `Berikut data fasilitas pendidikan dan kuota kursi zonasi PPDB terdekat di Kelurahan Kebonjati:\n\n` +
          eduList.slice(0, 4).map(s => 
            `• **${s.nama_sekolah}** (${s.jenjang} - ${s.status_sekolah})\n` +
            `  Akreditasi: **${s.akreditasi}** | Kuota Kursi Baru: **${s.daya_tampung_kursi_baru} murid** | Total Murid: ${s.total_kapasitas_murid}`
          ).join('\n\n') +
          `\n\n📊 Untuk informasi rasio anak usia sekolah vs daya tampung kursi zonasi, silakan cek dashboard analitik daya dukung.`;

        actionChips.push({
          label: 'Analisis Zonasi PPDB',
          type: 'navigate',
          url: '/dashboard/daya-dukung'
        });
        return { reply, action_chips: actionChips };
      } catch (err) {}
    }

    // =========================================================================
    // 5. PENALARAN APARATUR, LURAH, BABINSA, BHABINKAMTIBMAS, RT/RW
    // =========================================================================
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
        `Aya anu tiasa Kanaya bantos deui perkawis pelayanan administrasi, PBB, atanapi bantuan sosial?`;

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

    // =========================================================================
    // 6. PENALARAN SURAT & DOKUMEN DIGITAL (TTE / QR BSrE)
    // =========================================================================
    if (
      rawMsg.includes('surat') || 
      rawMsg.includes('domisili') || 
      rawMsg.includes('sku') || 
      rawMsg.includes('sktm') || 
      rawMsg.includes('pengantar')
    ) {
      reply = `Untuk pengajuan surat di Kelurahan Kebonjati, alur pelayanan kini sepenuhnya **paperless & digital**:\n\n` +
        `1. Warga mengajukan surat secara online (bisa untuk diri sendiri atau anggota keluarga dalam 1 KK).\n` +
        `2. Ketua RT memverifikasi rekomendasi secara digital melalui aplikasi (cukup verifikasi data inputan tanpa perlu scan surat fisik lagi).\n` +
        `3. Ketua RW memvalidasi berkas secara digital.\n` +
        `4. Kelurahan Kebonjati mengesahkan dan menerbitkan Nomor Surat Resmi dengan **Tanda Tangan Elektronik (TTE) QR Code** tersertifikasi BSrE.\n` +
        `5. Warga langsung dapat mengunduh atau mencetak dokumen sah dari rumah tanpa antre!`;

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

    // Default Response Ramah Pasundan & Super App Guide
    reply = `Sampurasun! Kanaya siap ngabantos wargi sadayana di Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi.\n\n` +
      `Wargi tiasa naroskeun perkawis:\n` +
      `• **PBB & E-SPPT Digital** (cek tagihan, jatuh tempo, cara bayar QRIS)\n` +
      `• **Fasilitas Wilayah** (Puskesmas, Bidan siaga 24 jam, sekolah PPDB, masjid titik evakuasi)\n` +
      `• **Kontak Aparatur** (Lurah, Babinsa TNI AD, Bhabinkamtibmas Polri, Ketua RT/RW)\n` +
      `• **Layanan Surat Online** (Domisili, SKU, SKTM dengan TTE QR resmi)\n\n` +
      `Aya naon anu tiasa dibantos dinten ieu?`;

    actionChips.push({
      label: 'Cek Tagihan PBB',
      type: 'navigate',
      url: '/dashboard/pbb'
    });
    actionChips.push({
      label: 'Fasilitas & Daya Dukung',
      type: 'navigate',
      url: '/dashboard/daya-dukung'
    });
    actionChips.push({
      label: 'Direktori Aparatur',
      type: 'navigate',
      url: '/dashboard/aparatur'
    });

    return { reply, action_chips: actionChips };
  }
}

module.exports = new KanayaService();
