/**
 * @class <<controllerName>>
 * @description Handles API requests for the <<packageName>> module.
 * @author <<author>>
 * @version 1.0.0
 * @date <<currentDate>>
 */
class <<controllerName>> {
  /**
   * @param {<<serviceName>>} <<serviceInstanceName>>
   */
  constructor(<<serviceInstanceName>>) {
    /** @private */
    this.<<serviceInstanceName>> = <<serviceInstanceName>>;
  }

  /**
   * [GET] Endpoint to retrieve a <<packageName>> entity by its ID.
   * @param {object} request - The request object, expecting { params: { id } }.
   * @returns {object} Standard API response.
   */
  getById(request) {
    try {
      WK.security().checkPermission('<<permissionPrefix>>.view');
      const id = request.params.id;
      if (!id) {
        throw new Error('ID is required.');
      }

      const data = this.<<serviceInstanceName>>.getById(id);
      if (!data) {
        return { success: false, message: 'Entity not found.' };
      }

      return { success: true, data: data };
    } catch (error) {
      WK.logger().error(`Error in <<controllerName>>.getById: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  // [TODO: Add other controller methods for create, update, delete, list]
}