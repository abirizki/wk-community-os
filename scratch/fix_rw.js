const fs = require('fs');

const p = 'frontend/src/pages/dashboard/DashboardKetuaRW.jsx';
let c = fs.readFileSync(p, 'utf8');

// I will just use split and join to avoid regex issues.
const badString = '{user?.photo_url ? <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover rounded-xl" /> : {user?.photo_url ? <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover rounded-xl" /> : <ShieldCheck className="w-5 h-5 text-emerald-300" />}}';

const goodString = `{user?.photo_url ? (
                <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-xl flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-[8px] font-bold text-white uppercase text-center leading-tight">Ganti<br/>Foto</span>
              </div>`;

c = c.split(badString).join(goodString);
fs.writeFileSync(p, c);
console.log('Fixed RW successfully using split/join');
