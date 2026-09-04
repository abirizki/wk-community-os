/**
 * Responsible for loading and rendering generator templates.
 */
class TemplateManager {
  constructor() {
    this.templates = {};
  }

  loadTemplate(name) {
    return this.templates[name] || '';
  }

  renderTemplate(name, variables) {
    let template = this.loadTemplate(name);
    const data = variables || {};
    Object.keys(data).forEach(function(key) {
      template = template.replace(new RegExp('\\{' + key + '\\}', 'g'), data[key]);
    });
    return template;
  }

  replaceVariable(template, key, value) {
    return template.replace(new RegExp('\\{' + key + '\\}', 'g'), value);
  }

  saveOutput(name, content) {
    return {
      name: name,
      content: content
    };
  }
}
