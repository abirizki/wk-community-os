import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { maskNIK, maskKK, maskPhone } from '../utils/privacy';

/**
 * MaskedField
 * Komponen interaktif pelindung data pribadi (UU PDP No. 27/2022)
 * Menampilkan data tersensor secara default, dengan tombol toggle Eye untuk membuka/menutup.
 */
export default function MaskedField({ 
  value, 
  type = 'nik', 
  className = '', 
  mono = true,
  allowReveal = true 
}) {
  const [revealed, setRevealed] = useState(false);

  if (!value) return <span className="text-on-surface-variant">-</span>;

  let displayValue = String(value);
  if (!revealed) {
    if (type === 'nik') displayValue = maskNIK(value, true);
    else if (type === 'kk') displayValue = maskKK(value, true);
    else if (type === 'phone') displayValue = maskPhone(value, true);
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${mono ? 'font-mono' : ''} ${className}`}>
      <span>{displayValue}</span>
      {allowReveal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setRevealed(!revealed);
          }}
          title={revealed ? 'Sembunyikan data pribadi' : 'Tampilkan data lengkap'}
          className="p-0.5 rounded text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      )}
    </span>
  );
}

