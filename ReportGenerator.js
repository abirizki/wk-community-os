/**
 * @class ReportGenerator
 * @description A strategy-pattern service that delegates report creation to a specific format generator.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReportGenerator {
  /**
   * @param {PDFGenerator} pdfGenerator
   * @param {ExcelGenerator} excelGenerator
   */
  constructor(pdfGenerator, excelGenerator) {
    /** @private */
    this.pdfGenerator = pdfGenerator;
    /** @private */
    this.excelGenerator = excelGenerator;
  }

  /**
   * Generates a report in the specified format.
   * @param {object} template - The report template object.
   * @param {object} data - The data to populate the report with.
   * @param {string} format - The target format ('PDF', 'Excel').
   * @returns {Blob} The generated report file.
   */
  generate(template, data, format) {
    switch (format.toUpperCase()) {
      case 'PDF':
        return this.pdfGenerator.generate(template, data);
      case 'EXCEL':
        return this.excelGenerator.generate(template, data);
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
  }
}