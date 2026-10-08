const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/KeuanganPage.jsx', 'utf8');

if (!c.includes('identitas_pembayar')) {
  // Add identitas_pembayar to form state
  c = c.replace(
    "kategori: 'IURAN_WARGA',",
    "kategori: 'IURAN_WARGA',\n    identitas_pembayar: '',"
  );

  // Add input field in form
  const inputField = `
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama / No KK Pembayar (Wajib untuk Kas Masuk)</label>
              <input
                type="text"
                value={form.identitas_pembayar || ''}
                onChange={(e) => setForm({ ...form, identitas_pembayar: e.target.value })}
                placeholder="Contoh: Budi (KK: 32710...)"
                required={form.tipe === 'MASUK'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
`;
  c = c.replace(
    /<div className="space-y-1">\s*<label className="text-xs font-bold text-slate-700">Keterangan<\/label>/,
    inputField + '\n            <div className="space-y-1">\n              <label className="text-xs font-bold text-slate-700">Keterangan</label>'
  );

  // Add column to table
  c = c.replace(
    /<th className="text-left p-3 font-bold text-slate-500">Keterangan<\/th>/,
    '<th className="text-left p-3 font-bold text-slate-500">Pembayar/Donatur</th>\n                  <th className="text-left p-3 font-bold text-slate-500">Keterangan</th>'
  );

  // Add row data
  c = c.replace(
    /<td className="p-3 text-slate-600">\{trx\.keterangan\}<\/td>/,
    '<td className="p-3 text-slate-800 font-medium">{trx.identitas_pembayar || \'-\'}</td>\n                    <td className="p-3 text-slate-600">{trx.keterangan}</td>'
  );

  fs.writeFileSync('frontend/src/pages/KeuanganPage.jsx', c);
  console.log('Fixed KeuanganPage');
} else {
  console.log('KeuanganPage already has identitas_pembayar');
}
