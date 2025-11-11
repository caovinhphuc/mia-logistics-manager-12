/**
 * MIA Logistics Manager - Excel Service
 * Excel operations using ExcelJS (secure alternative to xlsx)
 */

import * as ExcelJS from 'exceljs';

class ExcelService {
  constructor() {
    this.workbook = null;
    this.worksheet = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Excel service
   */
  initialize() {
    try {
      this.workbook = new ExcelJS.Workbook();
      this.isInitialized = true;
      console.log('✅ Excel Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Excel Service:', error);
      throw error;
    }
  }

  /**
   * Create a new workbook
   */
  createWorkbook() {
    if (!this.isInitialized) {
      this.initialize();
    }

    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'MIA Logistics Manager';
    this.workbook.lastModifiedBy = 'MIA Logistics Manager';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();

    return this.workbook;
  }

  /**
   * Add a worksheet to the workbook
   */
  addWorksheet(name, options = {}) {
    if (!this.workbook) {
      this.createWorkbook();
    }

    this.worksheet = this.workbook.addWorksheet(name, {
      properties: {
        tabColor: { argb: 'FF1976d2' }, // Primary blue
        ...options
      }
    });

    return this.worksheet;
  }

  /**
   * Set headers for the worksheet
   */
  setHeaders(headers, style = {}) {
    if (!this.worksheet) {
      throw new Error('No worksheet available. Please add a worksheet first.');
    }

    // Default header style
    const defaultStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976d2' } },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: { horizontal: 'center', vertical: 'middle' },
      ...style
    };

    // Add headers to row 1
    this.worksheet.addRow(headers);

    // Apply styling to header row
    const headerRow = this.worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      cell.style = defaultStyle;
    });

    // Freeze the header row
    this.worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    return this.worksheet;
  }

  /**
   * Add data rows to the worksheet
   */
  addData(data, style = {}) {
    if (!this.worksheet) {
      throw new Error('No worksheet available. Please add a worksheet first.');
    }

    // Default data style
    const defaultStyle = {
      border: {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      },
      alignment: { vertical: 'middle' },
      ...style
    };

    // Add data rows
    data.forEach((row, index) => {
      const dataRow = this.worksheet.addRow(row);

      // Apply alternating row colors
      if (index % 2 === 0) {
        dataRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        });
      }

      // Apply styling
      dataRow.eachCell((cell) => {
        cell.style = { ...cell.style, ...defaultStyle };
      });
    });

    return this.worksheet;
  }

  /**
   * Auto-fit column widths
   */
  autoFitColumns() {
    if (!this.worksheet) {
      throw new Error('No worksheet available.');
    }

    this.worksheet.columns.forEach((column) => {
      let maxLength = 0;

      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });

      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    return this.worksheet;
  }

  /**
   * Add filters to the worksheet
   */
  addFilters() {
    if (!this.worksheet) {
      throw new Error('No worksheet available.');
    }

    this.worksheet.autoFilter = 'A1:Z1';
    return this.worksheet;
  }

  /**
   * Export workbook as Excel file
   */
  async exportToFile(filename = 'export.xlsx') {
    if (!this.workbook) {
      throw new Error('No workbook available.');
    }

    try {
      const buffer = await this.workbook.xlsx.writeBuffer();

      // Create download link
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✅ Excel file exported: ${filename}`);
      return buffer;
    } catch (error) {
      console.error('❌ Failed to export Excel file:', error);
      throw error;
    }
  }

  /**
   * Load Excel file from file input
   */
  async loadFromFile(file) {
    if (!file) {
      throw new Error('No file provided.');
    }

    try {
      this.workbook = new ExcelJS.Workbook();
      await this.workbook.xlsx.load(file);

      console.log('✅ Excel file loaded successfully');
      return this.workbook;
    } catch (error) {
      console.error('❌ Failed to load Excel file:', error);
      throw error;
    }
  }

  /**
   * Get data from loaded worksheet
   */
  getWorksheetData(worksheetName = null) {
    if (!this.workbook) {
      throw new Error('No workbook loaded.');
    }

    const worksheet = worksheetName ?
      this.workbook.getWorksheet(worksheetName) :
      this.workbook.worksheets[0];

    if (!worksheet) {
      throw new Error(`Worksheet '${worksheetName || 'first'}' not found.`);
    }

    const data = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData = [];
      row.eachCell((cell, colNumber) => {
        rowData.push(cell.value);
      });
      data.push(rowData);
    });

    return data;
  }

  /**
   * Get headers from loaded worksheet
   */
  getHeaders(worksheetName = null) {
    if (!this.workbook) {
      throw new Error('No workbook loaded.');
    }

    const worksheet = worksheetName ?
      this.workbook.getWorksheet(worksheetName) :
      this.workbook.worksheets[0];

    if (!worksheet) {
      throw new Error(`Worksheet '${worksheetName || 'first'}' not found.`);
    }

    const headers = [];
    const headerRow = worksheet.getRow(1);

    headerRow.eachCell((cell) => {
      headers.push(cell.value);
    });

    return headers;
  }

  /**
   * Create sample logistics data
   */
  createSampleData() {
    const headers = [
      'Carrier ID',
      'Carrier Name',
      'Contact Person',
      'Email',
      'Phone',
      'Service Areas',
      'Vehicle Types',
      'Base Rate (VND)',
      'Per Km Rate (VND)',
      'Status',
      'Created Date'
    ];

    const sampleData = [
      ['C001', 'MIA Express', 'Nguyen Van A', 'contact@miaexpress.com', '0901234567', 'Hanoi, Ho Chi Minh', 'Truck, Van', '500000', '5000', 'Active', '2024-01-15'],
      ['C002', 'Fast Logistics', 'Tran Thi B', 'info@fastlogistics.com', '0907654321', 'Da Nang, Hue', 'Truck', '450000', '4500', 'Active', '2024-01-16'],
      ['C003', 'Quick Delivery', 'Le Van C', 'support@quickdelivery.com', '0909876543', 'Can Tho, An Giang', 'Van, Motorcycle', '400000', '4000', 'Inactive', '2024-01-17'],
      ['C004', 'Reliable Transport', 'Pham Thi D', 'hello@reliable.com', '0905432109', 'Hai Phong, Quang Ninh', 'Truck, Container', '600000', '6000', 'Active', '2024-01-18'],
      ['C005', 'Speed Cargo', 'Hoang Van E', 'contact@speedcargo.com', '0903210987', 'Binh Duong, Dong Nai', 'Truck, Van', '480000', '4800', 'Active', '2024-01-19']
    ];

    return { headers, sampleData };
  }

  /**
   * Generate logistics report
   */
  async generateLogisticsReport(data, filename = 'logistics_report.xlsx') {
    try {
      // Create new workbook
      this.createWorkbook();

      // Add main worksheet
      const worksheet = this.addWorksheet('Carriers Report');

      // Set headers
      this.setHeaders(data.headers);

      // Add data
      this.addData(data.rows);

      // Auto-fit columns
      this.autoFitColumns();

      // Add filters
      this.addFilters();

      // Export file
      await this.exportToFile(filename);

      console.log('✅ Logistics report generated successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to generate logistics report:', error);
      throw error;
    }
  }

  /**
   * Reset service
   */
  reset() {
    this.workbook = null;
    this.worksheet = null;
    this.isInitialized = false;
  }
}

// Create singleton instance
const excelService = new ExcelService();

export default excelService;
