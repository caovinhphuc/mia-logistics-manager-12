const { GoogleAuth } = require("google-auth-library");
const { google } = require("googleapis");
const path = require("path");

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId =
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
      process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
      "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";
    this.keyFile =
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
      path.join(__dirname, "../../mia-logistics-469406-eec521c603c0.json");
  }

  async initialize() {
    if (this.sheets) return;
    this.auth = new GoogleAuth({
      keyFile: this.keyFile,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });
    this.sheets = google.sheets({ version: "v4", auth: this.auth });
  }

  async listSheetTitles() {
    await this.initialize();
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      includeGridData: false,
    });
    const titles = (res.data.sheets || [])
      .map((s) => (s.properties ? s.properties.title : null))
      .filter(Boolean);
    return titles;
  }

  async readSheet(sheetName, range = "A:Z") {
    await this.initialize();
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!${range}`,
    });
    return res.data.values || [];
  }

  async getCarriers() {
    try {
      // Try candidates to support legacy/new sheet titles
      const candidates = [process.env.CARRIERS_SHEET_NAME || "Carriers", "CarriersSheet"];

      let data = [];
      let usedSheet = null;
      for (const name of candidates) {
        try {
          const values = await this.readSheet(name);
          if (values && values.length > 0) {
            data = values;
            usedSheet = name;
            break;
          }
        } catch (e) {
          // try next candidate
        }
      }

      if (!data.length) {
        // Try discovering by title that contains 'carrier'
        try {
          const titles = await this.listSheetTitles();
          const guess = titles.find((t) => String(t).toLowerCase().includes("carrier"));
          if (guess) {
            data = await this.readSheet(guess);
          }
        } catch (_) {
          // ignore
        }
      }
      if (!data.length) return [];
      const headers = data[0];
      const carriers = data.slice(1).map((row) => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i] ?? "";
        });
        // Normalize some common fields
        return {
          // Primary key: prefer 'carrierId' column
          carrierId: obj.carrierId || obj.id || obj.ID || `CAR-${Date.now()}`,
          name: obj.name || obj.Name || "",
          contactPerson: obj.contactPerson || obj.Contact || obj.contact || "",
          phone: obj.phone || obj.Phone || "",
          email: obj.email || obj.Email || "",
          serviceAreas: obj.serviceAreas || obj.ServiceAreas || "",
          pricingMethod: obj.pricingMethod || obj.PricingMethod || "",
          baseRate: obj.baseRate || obj.BaseRate || "",
          perKmRate: obj.perKmRate || obj.PerKmRate || "",
          perM3Rate: obj.perM3Rate || obj.PerM3Rate || "",
          isActive: String(obj.isActive || obj.Active || obj.active || "").toLowerCase() === "true",
          avatarUrl: obj.avatarUrl || obj.AvatarUrl || "",
          // keep original columns as well
          ...obj,
        };
      });
      return carriers;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error reading carriers from Google Sheets:", err);
      return [];
    }
  }

  async getInboundInternational() {
    try {
      // Sheet name confirmed: InboundInternational
      const data = await this.readSheet("InboundInternational");
      if (!data.length) return [];
      const headers = data[0];
      const rows = data.slice(1);
      const items = rows.map((row) => {
        const obj = {};
        headers.forEach((h, i) => (obj[h] = row[i] ?? ""));
        // Ensure required fields exist with correct types
        return {
          id: obj.id || obj.ID || `${Date.now()}-${Math.random()}`,
          date: obj.date || obj.Date || "",
          pi: obj.pi || obj.PI || "",
          supplier: obj.supplier || obj.Supplier || "",
          origin: obj.origin || obj.Origin || "",
          destination: obj.destination || obj.Destination || "",
          product: obj.product || obj.Product || "",
          category: obj.category || obj.Category || "",
          quantity: Number(obj.quantity || obj.Quantity || 0) || 0,
          container: Number(obj.container || obj.Container || 0) || 0,
          status: obj.status || obj.Status || "pending",
          carrier: obj.carrier || obj.Carrier || "",
          purpose: obj.purpose || obj.Purpose || "offline",
          receiveTime: obj.receiveTime || obj.ReceiveTime || "",
          poNumbers: obj.poNumbers || obj.PoNumbers || "",
          packagingTypes: obj.packagingTypes || obj.PackagingTypes || "",
          packagingQuantities: obj.packagingQuantities || obj.PackagingQuantities || "",
          packagingDescriptions: obj.packagingDescriptions || obj.PackagingDescriptions || "",
          timeline_created_description: obj.timeline_created_description || "",
          timeline_cargoReady_est: obj.timeline_cargoReady_est || "",
          timeline_cargoReady_act: obj.timeline_cargoReady_act || "",
          timeline_cargoReady_status: obj.timeline_cargoReady_status || "",
          timeline_cargoReady_description: obj.timeline_cargoReady_description || "",
          timeline_etd_est: obj.timeline_etd_est || "",
          timeline_etd_act: obj.timeline_etd_act || "",
          timeline_etd_status: obj.timeline_etd_status || "",
          timeline_etd_description: obj.timeline_etd_description || "",
          timeline_eta_est: obj.timeline_eta_est || "",
          timeline_eta_act: obj.timeline_eta_act || "",
          timeline_eta_status: obj.timeline_eta_status || "",
          timeline_eta_description: obj.timeline_eta_description || "",
          timeline_depart_est: obj.timeline_depart_est || "",
          timeline_depart_act: obj.timeline_depart_act || "",
          timeline_depart_status: obj.timeline_depart_status || "",
          timeline_depart_description: obj.timeline_depart_description || "",
          timeline_arrivalPort_est: obj.timeline_arrivalPort_est || "",
          timeline_arrivalPort_act: obj.timeline_arrivalPort_act || "",
          timeline_arrivalPort_status: obj.timeline_arrivalPort_status || "",
          timeline_arrivalPort_description: obj.timeline_arrivalPort_description || "",
          timeline_receive_est: obj.timeline_receive_est || "",
          timeline_receive_act: obj.timeline_receive_act || "",
          timeline_receive_status: obj.timeline_receive_status || "",
          timeline_receive_description: obj.timeline_receive_description || "",
          doc_checkBill_est: obj.doc_checkBill_est || "",
          doc_checkBill_act: obj.doc_checkBill_act || "",
          doc_checkBill_status: obj.doc_checkBill_status || "",
          doc_checkBill_description: obj.doc_checkBill_description || "",
          doc_checkCO_est: obj.doc_checkCO_est || "",
          doc_checkCO_act: obj.doc_checkCO_act || "",
          doc_checkCO_status: obj.doc_checkCO_status || "",
          doc_checkCO_description: obj.doc_checkCO_description || "",
          doc_sendDocs_est: obj.doc_sendDocs_est || "",
          doc_sendDocs_act: obj.doc_sendDocs_act || "",
          doc_sendDocs_status: obj.doc_sendDocs_status || "",
          doc_sendDocs_description: obj.doc_sendDocs_description || "",
          doc_customs_est: obj.doc_customs_est || "",
          doc_customs_act: obj.doc_customs_act || "",
          doc_customs_status: obj.doc_customs_status || "",
          doc_customs_description: obj.doc_customs_description || "",
          doc_tax_est: obj.doc_tax_est || "",
          doc_tax_act: obj.doc_tax_act || "",
          doc_tax_status: obj.doc_tax_status || "",
          doc_tax_description: obj.doc_tax_description || "",
          notes: obj.notes || "",
          createdAt: obj.createdAt || "",
          updatedAt: obj.updatedAt || "",
        };
      });
      return items;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error reading inbound international from Google Sheets:", err);
      return [];
    }
  }

  // Inbound Domestic - simpler columns; sheet name confirmed: InboundDomestic
  async getInboundDomestic() {
    try {
      const data = await this.readSheet("InboundDomestic");
      if (!data.length) return [];
      const headers = data[0];
      const rows = data.slice(1);
      const items = rows.map((row) => {
        const obj = {};
        headers.forEach((h, i) => (obj[h] = row[i] ?? ""));
        return {
          id: obj.id || obj.ID || `DOM-${Date.now()}-${Math.random()}`,
          date: obj.date || obj.Date || "",
          supplier: obj.supplier || obj.Supplier || "",
          origin: obj.origin || obj.Origin || "",
          destination: obj.destination || obj.Destination || "",
          product: obj.product || obj.Product || "",
          quantity: Number(obj.quantity || obj.Quantity || 0) || 0,
          status: obj.status || obj.Status || "pending",
          category: obj.category || obj.Category || "",
          carrier: obj.carrier || obj.Carrier || "",
          purpose: obj.purpose || obj.Purpose || "offline",
          receiveTime: obj.receiveTime || obj.ReceiveTime || "",
          estimatedArrival: obj.estimatedArrival || obj.timeline_receive_est || "",
          actualArrival: obj.actualArrival || obj.timeline_receive_act || "",
          notes: obj.notes || obj.Notes || "",
          // Optional packaging (flat -> kept as strings; backend doesn't need to split)
          packagingTypes: obj.packagingTypes || obj.PackagingTypes || "",
          packagingQuantities: obj.packagingQuantities || obj.PackagingQuantities || "",
          packagingDescriptions: obj.packagingDescriptions || obj.PackagingDescriptions || "",
        };
      });
      return items;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error reading inbound domestic from Google Sheets:", err);
      return [];
    }
  }

  // Get sheets client (for use with googleSheetsHelpers)
  async _getSheetsClientInternal() {
    await this.initialize();
    return this.sheets;
  }

  // Resolve and cache a proper spreadsheet ID (accept folder ID and create/find a sheet inside)
  async _resolveSpreadsheetIdInternal() {
    // Re-read from environment in case it was updated
    const spreadsheetId =
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
      process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
      this.spreadsheetId;

    if (!spreadsheetId) return;
    try {
      // Ensure we have auth initialized
      await this.initialize();
      const drive = google.drive({
        version: "v3",
        auth: this.auth,
      });
      const info = await drive.files.get({
        fileId: spreadsheetId,
        fields: "id, mimeType, name",
      });
      if (info.data.mimeType === "application/vnd.google-apps.spreadsheet") {
        return; // already a spreadsheet id
      }
      if (info.data.mimeType === "application/vnd.google-apps.folder") {
        const list = await drive.files.list({
          q: `'${spreadsheetId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
          fields: "files(id, name)",
          pageSize: 1,
        });
        if (list.data.files && list.data.files.length > 0) {
          return; // Found spreadsheet in folder
        }
        // create a new spreadsheet inside folder
        const created = await drive.files.create({
          requestBody: {
            name: "mia-logistics",
            mimeType: "application/vnd.google-apps.spreadsheet",
            parents: [spreadsheetId],
          },
          fields: "id",
        });
        return; // Created new spreadsheet
      }
    } catch (e) {
      console.error("resolveSpreadsheetId error:", e);
    }
  }
}

// Create service instance
const serviceInstance = new GoogleSheetsService();

// Export helper functions for use in routes
function exportedGetSheetsClient() {
  return serviceInstance._getSheetsClientInternal();
}

async function exportedResolveSpreadsheetId() {
  return await serviceInstance._resolveSpreadsheetIdInternal();
}

// Export as an object with both instance methods and helper functions
module.exports = Object.assign(serviceInstance, {
  getSheetsClient: exportedGetSheetsClient,
  resolveSpreadsheetId: exportedResolveSpreadsheetId,
});
