import React from 'react';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react';

export default function DataTable({ data, columns, renderRow }) {
  if (!data || data.length === 0) return null;

  // Fallback to PBB-specific rendering for backward compatibility if no custom columns/renderer provided
  const isLegacy = !columns || !renderRow;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full overflow-x-auto bg-surface-container-lowest border border-outline-variant rounded-lg shadow-card">
      <table className="w-full text-left text-body-md text-on-surface whitespace-nowrap">
        <thead className="bg-surface-container-low border-b border-outline-variant text-label-sm font-semibold text-on-surface-variant">
          <tr>
            {isLegacy ? (
              <>
                <th className="px-5 py-3.5">Tahun</th>
                <th className="px-5 py-3.5">NOP</th>
                <th className="px-5 py-3.5">Nominal (Rp)</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </>
            ) : (
              columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>{col.label}</th>
              ))
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-surface-container transition-colors">
              {isLegacy ? (
                <>
                  <td className="px-5 py-4 font-medium">{row.year}</td>
                  <td className="px-5 py-4 font-mono text-label-sm">{row.nop}</td>
                  <td className="px-5 py-4">{formatCurrency(row.amount)}</td>
                  <td className="px-5 py-4 text-center">
                    {row.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-tertiary-fixed text-tertiary border border-tertiary/20">
                        <ShieldCheck size={14} />
                        Lunas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-error-container text-on-error-container border border-error/20">
                        <AlertCircle size={14} />
                        Belum Bayar
                      </span>
                    )}
                  </td>
                </>
              ) : (
                renderRow(row, index)
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

