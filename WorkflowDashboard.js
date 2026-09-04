/**
 * @class WorkflowDashboard
 * @description Defines the widgets for the main Workflow dashboard.
 */
class WorkflowDashboard {
  /**
   * Returns an array of widget definitions for the Workflow dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'workflow.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'workflow_total',
        title: 'Total Alur Kerja',
        type: 'summary_card',
        dataSource: 'WorkflowStatistics.getSummary',
        dataKey: 'totalWorkflows',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'workflow_in_progress',
        title: 'Sedang Berjalan',
        type: 'summary_card',
        dataSource: 'WorkflowStatistics.getSummary',
        dataKey: 'inProgressWorkflows',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'workflow_completed',
        title: 'Selesai',
        type: 'summary_card',
        dataSource: 'WorkflowStatistics.getSummary',
        dataKey: 'completedWorkflows',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'workflow_failed',
        title: 'Gagal',
        type: 'summary_card',
        dataSource: 'WorkflowStatistics.getSummary',
        dataKey: 'failedWorkflows',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'workflow_started_trend',
        title: 'Alur Kerja Baru (12 Bulan Terakhir)',
        type: 'line_chart',
        dataSource: 'WorkflowStatistics.getStartedTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'workflow_definition_distribution',
        title: 'Distribusi Jenis Alur Kerja',
        type: 'pie_chart',
        dataSource: 'WorkflowStatistics.getDefinitionDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'workflow_current_state_distribution',
        title: 'Distribusi Status Saat Ini (Bottlenecks)',
        type: 'bar_chart',
        dataSource: 'WorkflowStatistics.getCurrentStateDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables & Lists
      {
        id: 'workflow_active_queue',
        title: 'Tugas Aktif',
        type: 'table',
        dataSource: 'WorkflowService.searchWorkflows',
        options: { query: { status: 'IN_PROGRESS' }, limit: 10, sortBy: 'updatedAt', order: 'asc' },
        columns: ['definitionId', 'contextType', 'contextId', 'currentState', 'assigneeId', 'updatedAt'],
        permission: 'workflow.instance.read.all',
      },
      {
        id: 'workflow_quick_actions',
        title: 'Aksi Cepat',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'manage_definitions',
            label: 'Kelola Definisi Alur Kerja',
            route: '/workflows/definitions',
            permission: 'workflow.definition.manage',
          },
          {
            id: 'search_workflows',
            label: 'Cari Alur Kerja',
            route: '/workflows/search',
            permission: 'workflow.instance.read.all',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 */
function registerWorkflowDashboard() {
  WK.dashboard('workflow_main', WorkflowDashboard.getWidgets());
}