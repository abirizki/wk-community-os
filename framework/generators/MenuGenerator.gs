/**
 * Generates a menu configuration skeleton.
 */
class MenuGenerator extends BaseGenerator {
  constructor() {
    super('menu', 'menu');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '{"name":"' + input.name + '","items":[]}'
    };
    this.outputs.push(output);
    return output;
  }
}
