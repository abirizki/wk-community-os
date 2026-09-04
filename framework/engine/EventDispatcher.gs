/**
 * Event dispatcher for framework lifecycle hooks.
 */
class EventDispatcher {
  constructor(framework) {
    this.framework = framework;
  }

  dispatch(eventName, payload) {
    return { event: eventName, payload: payload || {} };
  }
}
