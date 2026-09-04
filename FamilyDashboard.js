/**
 * @class FamilyDashboard
 * @description Defines the widgets for the main Family (KK) dashboard.
 */
class FamilyDashboard {
  /**
   * Returns an array of widget definitions for the Family dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'family.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'family_total',
        title: 'Total KK',
        type: 'summary_card',
        dataSource: 'FamilyStatistics.getSummary',
        dataKey: 'totalFamilies',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'family_active',
        title: 'KK Aktif',
        type: 'summary_card',
        dataSource: 'FamilyStatistics.getSummary',
        dataKey: 'activeFamilies',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'family_inactive',
        title: 'KK Tidak Aktif',
        type: 'summary_card',
        dataSource: 'FamilyStatistics.getSummary',
        dataKey: 'inactiveFamilies',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'family_registration_trend',
        title: 'Pendaftaran KK Baru (12 Bulan Terakhir)',
        type: 'line_chart',
        dataSource: 'FamilyStatistics.getRegistrationTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'family_status_distribution',
        title: 'Distribusi Status KK',
        type: 'pie_chart',
        dataSource: 'FamilyStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'family_size_distribution',
        title: 'Distribusi Ukuran Keluarga',
        type: 'bar_chart',
        dataSource: 'FamilyStatistics.getFamilySizeDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables & Lists
      {
        id: 'family_recent_activity',
        title: 'KK Baru Terdaftar',
        type: 'table',
        dataSource: 'FamilyService.searchFamilies',
        options: { limit: 5, sortBy: 'createdAt', order: 'desc' },
        columns: ['KKNumber', 'headOfFamilyCitizenId', 'rt', 'rw', 'createdAt'],
        permission: 'family.profile.read.all',
      },
      {
        id: 'family_quick_actions',
        title: 'Aksi Cepat',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'create_family',
            label: 'Daftarkan KK Baru',
            route: '/families/new',
            permission: 'family.profile.create',
          },
          {
            id: 'search_families',
            label: 'Cari Data KK',
            route: '/families/search',
            permission: 'family.profile.read.all',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerFamilyDashboard() {
  WK.dashboard('family_main', FamilyDashboard.getWidgets());
}