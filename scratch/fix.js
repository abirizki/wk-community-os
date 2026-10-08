const fs = require('fs');

let rt = fs.readFileSync('frontend/src/pages/dashboard/DashboardKetuaRT.jsx', 'utf8');
rt = rt.replace('{user?.photo_url ? <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover rounded-xl" /> : {user?.photo_url ? <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover rounded-xl" /> : <ShieldCheck className="w-5 h-5 text-emerald-300" />}}', '{user?.photo_url ? <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover rounded-xl" /> : <ShieldCheck className="w-5 h-5 text-emerald-300" />}\n            <div className="absolute inset-0 bg-black/40 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">\n              <span className="text-[8px] font-bold text-white uppercase text-center leading-tight">Ganti<br/>Foto</span>\n            </div>');
rt = rt.replace('className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0"', 'className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 relative group"');
fs.writeFileSync('frontend/src/pages/dashboard/DashboardKetuaRT.jsx', rt);

let rw = fs.readFileSync('frontend/src/pages/dashboard/DashboardKetuaRW.jsx', 'utf8');
rw = rw.replace('className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0"', 'className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 relative group"');
rw = rw.replace('opacity-0 hover:opacity-100', 'opacity-0 group-hover:opacity-100');
fs.writeFileSync('frontend/src/pages/dashboard/DashboardKetuaRW.jsx', rw);
console.log("Fixes applied!");
