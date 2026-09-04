/**
 * @class CitizenDashboard
 * @description Defines the widgets for the main Citizen dashboard.
 */
class CitizenDashboard {
  /**
   * Returns an array of widget definitions for the Citizen dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'citizen.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'citizen_total',
        title: 'Total Warga',
        type: 'summary_card',
        dataSource: 'CitizenStatistics.getSummary',
        dataKey: 'totalCitizens',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'citizen_active',
        title: 'Warga Aktif',
        type: 'summary_card',
        dataSource: 'CitizenStatistics.getSummary',
        dataKey: 'activeCitizens',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'citizen_inactive',
        title: 'Warga Pindah',
        type: 'summary_card',
        dataSource: 'CitizenStatistics.getSummary',
        dataKey: 'inactiveCitizens',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'citizen_deceased',
        title: 'Warga Meninggal',
        type: 'summary_card',
        dataSource: 'CitizenStatistics.getSummary',
        dataKey: 'deceasedCitizens',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'citizen_registration_trend',
        title: 'Pendaftaran Warga Baru (12 Bulan Terakhir)',
        type: 'line_chart',
        dataSource: 'CitizenStatistics.getRegistrationTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'citizen_age_distribution',
        title: 'Distribusi Usia',
        type: 'bar_chart',
        dataSource: 'CitizenStatistics.getAgeDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'citizen_gender_distribution',
        title: 'Distribusi Gender',
        type: 'pie_chart',
        dataSource: 'CitizenStatistics.getGenderDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'citizen_education_distribution',
        title: 'Distribusi Pendidikan',
        type: 'donut_chart',
        dataSource: 'CitizenStatistics.getEducationDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'citizen_occupation_distribution',
        title: 'Distribusi Pekerjaan',
        type: 'horizontal_bar_chart',
        dataSource: 'CitizenStatistics.getOccupationDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables & Lists
      {
        id: 'citizen_recent_activity',
        title: 'Warga Baru Terdaftar',
        type: 'table',
        dataSource: 'CitizenService.listCitizens',
        options: { limit: 10, sortBy: 'createdAt', order: 'desc' },
        columns: ['fullName', 'NIK', 'rt', 'rw', 'createdAt'],
        permission: 'citizen.profile.read.all', // More specific permission
      },
      {
        id: 'citizen_quick_actions',
        title: 'Aksi Cepat',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'create_citizen',
            label: 'Daftarkan Warga Baru',
            route: '/citizens/new',
            permission: 'citizen.profile.create',
          },
          {
            id: 'search_citizens',
            label: 'Cari Data Warga',
            route: '/citizens/search',
            permission: 'citizen.profile.read.all',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerCitizenDashboard() {
  WK.dashboard('citizen_main', CitizenDashboard.getWidgets());
}