/**
 * Minimal logger for framework events.
 */
class Logger {
  info(message) {
    console.info(message);
  }

  warning(message) {
    console.warn(message);
  }

  error(message) {
    console.error(message);
  }

  debug(message) {
    console.log(message);
  }
}
