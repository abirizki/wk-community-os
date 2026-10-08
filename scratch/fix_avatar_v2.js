const fs = require('fs');

function fixAvatar(path) {
  let c = fs.readFileSync(path, 'utf8');
  
  const regex = /<div className=\"w-10 h-10 rounded-xl bg-emerald-500\/20 border border-emerald-400\/30 flex items-center justify-center shrink-0\">[\s\S]*?<\/div>\n\s*<div>\n\s*<div className=\"flex items-center gap-2\">/m;
  
  const correctBlock = `<div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <div className="relative w-full h-full group cursor-pointer">
              {user?.photo_url ? (
                <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-bold text-white uppercase text-center leading-tight">Ganti<br/>Foto</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">`;
          
  if (c.includes('Ganti<br/>Foto')) return;
  c = c.replace(regex, correctBlock);
  fs.writeFileSync(path, c);
  console.log('Fixed avatar in ' + path);
}

fixAvatar('frontend/src/pages/dashboard/DashboardKetuaRT.jsx');
fixAvatar('frontend/src/pages/dashboard/DashboardKetuaRW.jsx');
