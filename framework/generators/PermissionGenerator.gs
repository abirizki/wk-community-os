/**
 * Generates a permission skeleton.
 */
class PermissionGenerator extends BaseGenerator {
  constructor() {
    super('permission', 'permission');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Permission skeleton for ' + input.name + ' */\nclass ' + input.name + 'Permission {\n  constructor() {}\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
