/**
 * Framework exception definitions.
 */
class FrameworkException extends Error {
  constructor(message) {
    super(message);
    this.name = 'FrameworkException';
  }
}
