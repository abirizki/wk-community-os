/**
 * @class <<dashboardName>>
 * @description Defines and registers dashboard widgets for the <<packageName>> module.
 * @author <<author>>
 * @version 1.0.0
 * @date <<currentDate>>
 */
class <<dashboardName>> {
  /**
   * Returns an array of widget definitions for the <<packageName>> module.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      // [TODO: Define scorecard, chart, and table widgets here]
      // Example:
      // { id: '<<packageLowercase>>_total_count', title: 'Total <<packageName>>s', type: 'scorecard', dataSource: '<<statisticsName>>.getTotalCount' }
    ];
  }
}

// Register the dashboard widgets with the framework's Dashboard Dispatcher
WK.dashboard('<<packageLowercase>>', <<dashboardName>>.getWidgets());