/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 33_DashboardService.gs
 * Version : 1.0.0
 * Phase   : Service
 * =============================================================================
 */

var DashboardService = {};

/**
 * Mengambil data ringkasan untuk dashboard.
 * @returns {Object}
 */
DashboardService.getSummary = function () {

    var summary = DashboardRepository.summary();

    // Menambahkan data yang membutuhkan panggilan ke repository lain
    summary.onlineUser = SessionRepository.online();

    return Response.success(summary);
};

/**
 * Mengambil data untuk chart dashboard.
 * @returns {Object}
 */
DashboardService.getCharts = function () {

    var charts = DashboardRepository.chart();

    return Response.success(charts);
};

/**
 * Health check untuk dashboard.
 * @returns {Object}
 */
DashboardService.getHealth = function () {

    var health = DashboardRepository.health();

    // Menambahkan data yang membutuhkan panggilan ke repository lain
    health.online = SessionRepository.online();

    return Response.success(health);
};

/**
 * Boot service.
 * @returns {Boolean}
 */
DashboardService.boot = function () {

    AppLogger.info(
        "DashboardService Loaded"
    );

    return true;
};