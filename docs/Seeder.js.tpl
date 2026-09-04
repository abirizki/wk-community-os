/**
 * @class <<seederName>>
 * @description Seeds initial or demo data for the <<packageName>> module.
 * @author <<author>>
 * @version 1.0.0
 * @date <<currentDate>>
 */
class <<seederName>> {
  /**
   * @param {<<serviceName>>} <<serviceInstanceName>>
   */
  constructor(<<serviceInstanceName>>) {
    /** @private */
    this.<<serviceInstanceName>> = <<serviceInstanceName>>;
  }

  /**
   * Runs the seeder to populate the database.
   */
  run() {
    WK.security().checkPermission('<<permissionPrefix>>.seed');
    WK.logger().info('Running <<packageName>> module seeder...');

    // [TODO: Add logic to create demo data]
    // Example:
    // if (this.<<serviceInstanceName>>.findAll().length === 0) {
    //   this.<<serviceInstanceName>>.create({
    //     name: 'Demo <<packageName>> Entity',
    //     // ... other properties
    //   });
    //   WK.logger().info('Seeded one demo <<packageName>> entity.');
    // }

    WK.logger().info('<<packageName>> module seeder completed.');
  }
}