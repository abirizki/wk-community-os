/**
 * Tracks lifecycle state of the framework.
 */
class Lifecycle {
  constructor() {
    this.state = 'booting';
  }

  markReady() {
    this.state = 'ready';
    return this.state;
  }

  markShutdown() {
    this.state = 'shutdown';
    return this.state;
  }

  current() {
    return this.state;
  }
}
