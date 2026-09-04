/**
 * @class PDFGenerator
 * @description Generates reports in PDF format.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class PDFGenerator {
  constructor() {}

  /**
   * Generates a PDF report from a template and data.
   * @param {object} template - The report template, containing an HTML structure.
   * @param {object} data - The data to populate the template with.
   * @returns {Blob} The generated PDF blob.
   */
  generate(template, data) {
    const htmlTemplate = HtmlService.createTemplate(template.htmlContent);
    htmlTemplate.data = data;
    const htmlOutput = htmlTemplate.evaluate();

    const pdfBlob = htmlOutput.getAs('application/pdf');
    pdfBlob.setName(`${template.fileName}_${new Date().toISOString().split('T')[0]}.pdf`);

    return pdfBlob;
  }
}