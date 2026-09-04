/**
 * @class MedicineDashboard
 * @description Defines the widgets for the Medicine master data dashboard.
 */
class MedicineDashboard {
  /**
   * Returns an array of widget definitions for the Medicine dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'medicine.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'medicine_total',
        title: 'Total Medicines',
        type: 'summary_card',
        dataSource: 'MedicineStatistics.getSummary',
        dataKey: 'totalMedicines',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'medicine_active',
        title: 'Active',
        type: 'summary_card',
        dataSource: 'MedicineStatistics.getSummary',
        dataKey: 'activeMedicines',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'medicine_inactive',
        title: 'Inactive',
        type: 'summary_card',
        dataSource: 'MedicineStatistics.getSummary',
        dataKey: 'inactiveMedicines',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'medicine_creation_trend',
        title: 'New Medicines Added (Last 12 Months)',
        type: 'line_chart',
        dataSource: 'MedicineStatistics.getCreatedTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'medicine_status_distribution',
        title: 'Status Distribution',
        type: 'pie_chart',
        dataSource: 'MedicineStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'medicine_type_distribution',
        title: 'Type Distribution',
        type: 'donut_chart',
        dataSource: 'MedicineStatistics.getTypeDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'medicine_dosage_form_distribution',
        title: 'Dosage Form Distribution',
        type: 'bar_chart',
        dataSource: 'MedicineStatistics.getDosageFormDistribution',
        size: '4x2',
        permission: permission,
      },

      // Tables & Lists
      {
        id: 'medicine_recent_additions',
        title: 'Recently Added Medicines',
        type: 'table',
        dataSource: 'MedicineService.listMedicines',
        options: { limit: 10, sortBy: 'createdAt', order: 'desc' },
        columns: ['code', 'name', 'strength', 'dosageForm', 'status'],
        size: '4x3',
        permission: permission,
      },
      {
        id: 'medicine_quick_actions',
        title: 'Quick Actions',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'create_medicine',
            label: 'Add New Medicine',
            route: '/medicines/new',
            permission: 'medicine.master.create',
          },
          {
            id: 'search_medicines',
            label: 'Search Medicine Catalog',
            route: '/medicines/search',
            permission: 'medicine.master.search',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 * This makes the dashboard available to users with the appropriate permissions.
 */
function registerMedicineDashboard() {
  WK.dashboard('medicine_main', MedicineDashboard.getWidgets());
}