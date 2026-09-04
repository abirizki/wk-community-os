/**
 * Dashboard dispatcher placeholder for framework events.
 */
class DashboardDispatcher {
  constructor(framework) {
    this.framework = framework;
  }

  dispatch(viewName, payload) {
    return { dashboard: viewName, payload: payload || {} };
  }
}
