/**
 * src/utils/export.util.js
 * Universal Export Engine for Bumi Warga (WK Community OS).
 * Supports RFC 4180 CSV (with UTF-8 BOM) and Microsoft Excel XML Spreadsheet.
 * Zero-dependency, fast, lightweight, and standards-compliant.
 */

/**
 * Escapes a cell value for CSV formatting.
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC 4180 CSV string with UTF-8 BOM for seamless Microsoft Excel opening.
 * @param {Array<string>} headers - Column titles
 * @param {Array<Array<any>>} rows - Row data matching headers
 * @returns {string} - CSV formatted string with UTF-8 BOM
 */
function generateCsv(headers, rows) {
  const bom = '\uFEFF';
  const headerLine = headers.map(escapeCsvValue).join(',');
  const rowLines = rows.map(row => row.map(escapeCsvValue).join(','));
  return bom + [headerLine, ...rowLines].join('\r\n');
}

/**
 * Escapes XML special characters.
 */
function escapeXml(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates Microsoft Excel XML Spreadsheet (SpreadsheetML).
 * Supported natively by all versions of Microsoft Excel, LibreOffice, and Google Sheets.
 * Allows custom header background, font styles, borders, and number formats.
 * 
 * @param {string} title - Workbook Title
 * @param {Array<{ name: string, headers: Array<string>, rows: Array<Array<{ value: any, type?: 'String'|'Number'|'Currency' }>> }>} sheets
 * @returns {string} XML Spreadsheet content
 */
function generateExcelXml(title, sheets) {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${escapeXml(title)}</Title>
  <Author>Bumi Warga - Jabar Pintar Digital</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1e293b"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <!-- Header Style: Sky Blue with White Text -->
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0369a1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0369a1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0369a1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0369a1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#ffffff" ss:Bold="1"/>
   <Interior ss:Color="#0284c7" ss:Pattern="Solid"/>
  </Style>
  <!-- Data Cell Style with Border -->
  <Style ss:ID="DataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
   </Borders>
  </Style>
  <!-- Currency Style (Indonesian Rupiah) -->
  <Style ss:ID="CurrencyCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
   </Borders>
   <NumberFormat ss:Format="&quot;Rp&quot;\ #,##0"/>
  </Style>
  <!-- Center Aligned Cell Style -->
  <Style ss:ID="CenterCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
   </Borders>
  </Style>
 </Styles>
`;

  let sheetsXml = '';
  for (const sheet of sheets) {
    sheetsXml += ` <Worksheet ss:Name="${escapeXml(sheet.name.slice(0, 31))}">\n  <Table>\n`;

    // Header Row
    sheetsXml += '   <Row ss:Height="24">\n';
    for (const h of sheet.headers) {
      sheetsXml += `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
    }
    sheetsXml += '   </Row>\n';

    // Data Rows
    for (const row of sheet.rows) {
      sheetsXml += '   <Row ss:Height="20">\n';
      for (const item of row) {
        const val = typeof item === 'object' && item !== null && 'value' in item ? item.value : item;
        const type = typeof item === 'object' && item !== null && item.type ? item.type : (typeof val === 'number' ? 'Number' : 'String');

        if (type === 'Currency' || (typeof item === 'object' && item?.style === 'Currency')) {
          sheetsXml += `    <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${Number(val) || 0}</Data></Cell>\n`;
        } else if (type === 'Number') {
          sheetsXml += `    <Cell ss:StyleID="DataCell"><Data ss:Type="Number">${Number(val) || 0}</Data></Cell>\n`;
        } else if (typeof item === 'object' && item?.align === 'center') {
          sheetsXml += `    <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>\n`;
        } else {
          sheetsXml += `    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>\n`;
        }
      }
      sheetsXml += '   </Row>\n';
    }

    sheetsXml += '  </Table>\n </Worksheet>\n';
  }

  return xmlHeader + sheetsXml + '</Workbook>';
}

/**
 * Mask PII (NIK / KK) for public transparency compliance with UU PDP No. 27/2022
 */
function maskPii(val) {
  if (!val || typeof val !== 'string') return val;
  const clean = val.trim();
  if (clean.length === 16) {
    return `${clean.slice(0, 6)}******${clean.slice(12)}`;
  }
  return clean;
}

module.exports = {
  generateCsv,
  generateExcelXml,
  maskPii
};

