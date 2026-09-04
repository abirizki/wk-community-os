/**
 * Generates a module skeleton for a named package.
 */
class ModuleGenerator extends BaseGenerator {
  constructor() {
    super('module', 'module');
  }

  generate(input) {
    this.validate(input);
    const targetName = input.name;
    const files = [
      { path: 'packages/' + targetName + '/README.md', content: '# ' + targetName + '\n' },
      { path: 'packages/' + targetName + '/module.json', content: '{"name":"' + targetName + '"}' },
      { path: 'packages/' + targetName + '/' + targetName + 'Controller.gs', content: '/** Controller for ' + targetName + ' */' },
      { path: 'packages/' + targetName + '/' + targetName + 'Service.gs', content: '/** Service for ' + targetName + ' */' },
      { path: 'packages/' + targetName + '/' + targetName + 'Repository.gs', content: '/** Repository for ' + targetName + ' */' },
      { path: 'packages/' + targetName + '/' + targetName + 'Dashboard.gs', content: '/** Dashboard for ' + targetName + ' */' },
      { path: 'packages/' + targetName + '/' + targetName + 'Permission.gs', content: '/** Permission for ' + targetName + ' */' },
      { path: 'packages/' + targetName + '/' + targetName + 'Validator.gs', content: '/** Validator for ' + targetName + ' */' },
      { path: 'packages/' + targetName + '/' + targetName + 'Rule.gs', content: '/** Rule for ' + targetName + ' */' },
      { path: 'packages/' + targetName + '/' + targetName + 'Migration.gs', content: '/** Migration for ' + targetName + ' */' },
      { path: 'packages/' + targetName + '/' + targetName + 'Seeder.gs', content: '/** Seeder for ' + targetName + ' */' },
      { path: 'packages/' + targetName + '/' + targetName + 'Test.gs', content: '/** Test for ' + targetName + ' */' }
    ];

    this.outputs = files;
    return this.outputs;
  }
}
