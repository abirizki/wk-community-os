/**
 * @file CitizenDashboard.js
 * @description UI Widget configurations for the Citizen (Demographics) module.
 */

class CitizenDashboard {
  static getWidgets() {
    const security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
    
    // Protect dashboard access
    if (security) {
      security.checkPermission('citizen.statistics.view');
    }

    return [
      {
        id: 'citizen_summary',
        type: 'summary_card',
        title: 'Populasi Warga',
        dataSource: 'CitizenStatistics.getSummary',
        refreshInterval: 300, // 5 minutes
        layout: { w: 12, h: 2, x: 0, y: 0 }
      },
      {
        id: 'citizen_gender_distribution',
        type: 'pie_chart',
        title: 'Distribusi Gender',
        dataSource: 'CitizenStatistics.getGenderDistribution',
        mapping: { label: 'gender', value: 'count' },
        layout: { w: 4, h: 4, x: 0, y: 2 }
      },
      {
        id: 'citizen_residency_distribution',
        type: 'donut_chart',
        title: 'Distribusi Status Kependudukan',
        dataSource: 'CitizenStatistics.getResidencyDistribution',
        mapping: { label: 'status', value: 'count' },
        layout: { w: 4, h: 4, x: 4, y: 2 }
      },
      {
        id: 'citizen_age_demographics',
        type: 'bar_chart',
        title: 'Demografi Usia',
        dataSource: 'CitizenStatistics.getAgeDemographics',
        mapping: { label: 'category', value: 'count' },
        layout: { w: 4, h: 4, x: 8, y: 2 }
      },
      {
        id: 'citizen_recent_registrations',
        type: 'table',
        title: 'Warga Terdaftar Baru',
        dataSource: 'CitizenStatistics.getRecentRegistrations',
        columns: [
          { key: 'fullName', label: 'Nama Lengkap' },
          { key: 'id', label: 'NIK' }, // MASKED by toDisplay()
          { key: 'createdAt', label: 'Tanggal Daftar' }
        ],
        layout: { w: 8, h: 4, x: 0, y: 6 }
      },
      {
        id: 'citizen_quick_actions',
        type: 'quick_actions',
        title: 'Aksi Cepat',
        actions: [
          { label: 'Daftar Warga Baru', command: 'citizen.create', icon: 'plus-user' },
          { label: 'Pindah Domisili', command: 'citizen.updateStatus', icon: 'move' }
        ],
        layout: { w: 4, h: 4, x: 8, y: 6 }
      }
    ];
  }
}

module.exports = { CitizenDashboard };

