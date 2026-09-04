import { useAuth } from '../context/AuthContext';
import { FileText, HeartPulse, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-headline-lg-mobile lg:text-headline-lg font-bold text-on-surface">
          Selamat Datang, {user?.nik ? `Warga ${user.nik.slice(0,4)}...` : 'Warga'}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Pusat kendali layanan administrasi dan kependudukan Anda.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* PBB Card */}
        <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant shadow-card flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-label-md font-bold text-on-surface">Status PBB</h3>
              <p className="text-[11px] text-on-surface-variant">Tahun Pajak 2026</p>
            </div>
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-tertiary-fixed text-tertiary border border-tertiary/20">
              <ShieldCheck size={14} />
              Lunas
            </span>
          </div>
          <button className="mt-4 pt-4 border-t border-outline-variant text-label-sm font-semibold text-primary flex items-center justify-between group">
            Lihat Riwayat SPPT
            <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Posyandu Card */}
        <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant shadow-card flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <HeartPulse size={20} />
            </div>
            <div>
              <h3 className="text-label-md font-bold text-on-surface">Jadwal Posyandu</h3>
              <p className="text-[11px] text-on-surface-variant">Bulan Ini</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-body-lg font-bold text-on-surface">12 Oktober 2026</p>
            <p className="text-label-sm text-on-surface-variant">08:00 - 11:00 WIB di Balai Warga</p>
          </div>
          <button className="mt-4 pt-4 border-t border-outline-variant text-label-sm font-semibold text-primary flex items-center justify-between group">
            Lihat Rekam Medis
            <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

