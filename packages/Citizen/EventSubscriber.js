/**
 * @class EventSubscriber
 * @description A central registry for event subscriptions. It maps event types
 * to the services or functions that should be called when the event occurs.
 */
class EventSubscriber {
  constructor() {
    /** 
     * @private 
     * @type {Object.<string, Function[]>}
     */
    this.listeners = {};
    this._registerCoreListeners();
    WK.logger().info('EventSubscriber initialized.');
  }

  /**
   * Registers a listener function for a specific event type.
   * @param {string} eventType - The event to listen for (e.g., 'Citizen.Created'). Wildcards can be used (e.g., 'Citizen.*').
   * @param {Function} listener - The function to execute. It will receive the event object as an argument.
   */
  subscribe(eventType, listener) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(listener);
    WK.logger().debug(`New subscription for event type: ${eventType}`);
  }

  /**
   * Gets all listeners for a given event type, including wildcard matches.
   * @param {string} eventType - The specific event type that occurred.
   * @returns {Function[]} An array of listener functions.
   */
  getSubscribersFor(eventType) {
    const [module, subject, action] = eventType.split('.');
    const directListeners = this.listeners[eventType] || [];
    const moduleWildcardListeners = this.listeners[`${module}.*`] || [];
    const subjectWildcardListeners = this.listeners[`${module}.${subject}.*`] || [];
    const allWildcardListeners = this.listeners['*'] || [];

    // Combine and remove duplicates
    const allListeners = [...directListeners, ...subjectWildcardListeners, ...moduleWildcardListeners, ...allWildcardListeners];
    return [...new Set(allListeners)];
  }

  /**
   * Registers listeners for core system functionalities.
   * In a real application, this would be done by each module's service provider.
   * @private
   */
  _registerCoreListeners() {
    // Example of how other services would subscribe
    this.subscribe('Citizen.Created', (event) => {
      const ruleEngine = WK.service('core.ruleEngine'); // Assuming RuleEngine service
      ruleEngine.evaluate(event);
    });

    this.subscribe('Letter.Approved', (event) => {
      const notificationService = WK.service('core.notification');
      notificationService.send(event);
    });

    // The Audit service listens to all events
    this.subscribe('*', (event) => {
      const auditService = WK.service('core.audit');
      auditService.logEvent(event);
    });
  }
}