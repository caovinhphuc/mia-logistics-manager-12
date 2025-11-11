// Role Service - Quản lý vai trò từ Google Sheets
import { googleSheetsService } from '../google/googleSheetsService';

export class Role {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.code = data.code || '';
    this.description = data.description || '';
    this.level = parseInt(data.level) || 1;
    this.isActive = data.is_active === 'true' || false;
    this.createdAt = data.created_at || new Date().toISOString();
    this.updatedAt = data.updated_at || new Date().toISOString();
  }

  toGoogleSheets() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      level: this.level.toString(),
      is_active: this.isActive.toString(),
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

export class RoleService {
  constructor() {
    this.sheetName = 'Roles';
    this.spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID || '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';
  }

  async initialize() {
    try {
      console.log('🔄 Khởi tạo RoleService...');
      await googleSheetsService.initializeAPI();
      googleSheetsService.spreadsheetId = this.spreadsheetId;
      console.log('✅ RoleService đã khởi tạo');
    } catch (error) {
      console.error('❌ Lỗi khởi tạo RoleService:', error);
      throw error;
    }
  }

  async getRoles() {
    try {
      await this.initialize();

      console.log('🔄 Lấy dữ liệu roles từ Google Sheets...');
      const data = await googleSheetsService.getData(this.sheetName);

      if (!data || data.length <= 1) {
        throw new Error('Không có dữ liệu từ Google Sheets');
      }

      const headers = data[0];
      const roles = data.slice(1).map((row, index) => {
        const roleData = {};
        headers.forEach((header, colIndex) => {
          roleData[header] = row[colIndex] || '';
        });
        return new Role(roleData);
      });

      console.log(`📊 Lấy danh sách roles từ Google Sheets: ${roles.length} vai trò`);
      return roles;
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách roles:', error);
      console.log('⚠️ Sử dụng mock data...');
      return this.getMockRoles();
    }
  }

  async getRoleById(roleId) {
    try {
      const roles = await this.getRoles();
      return roles.find(role => role.id === roleId);
    } catch (error) {
      console.error('❌ Lỗi lấy role theo ID:', error);
      throw error;
    }
  }

  async getRoleByCode(code) {
    try {
      const roles = await this.getRoles();
      return roles.find(role => role.code === code);
    } catch (error) {
      console.error('❌ Lỗi lấy role theo code:', error);
      throw error;
    }
  }

  // Mock data cho testing
  getMockRoles() {
    return [
      new Role({
        id: '1',
        name: 'Administrator',
        code: 'admin',
        description: 'Full system access',
        level: '1',
        is_active: 'true',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }),
      new Role({
        id: '2',
        name: 'Manager',
        code: 'manager',
        description: 'Management level access',
        level: '2',
        is_active: 'true',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }),
      new Role({
        id: '3',
        name: 'Employee',
        code: 'employee',
        description: 'Basic employee access',
        level: '3',
        is_active: 'true',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    ];
  }

  async createRole(roleData) {
    try {
      await this.initialize();

      // Generate new ID
      const roles = await this.getRoles();
      const newId = (Math.max(...roles.map(r => parseInt(r.id) || 0)) + 1).toString();

      const role = new Role({
        ...roleData,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const roleRow = role.toGoogleSheets();
      const values = Object.values(roleRow);

      await googleSheetsService.appendData(this.sheetName, [values]);

      console.log(`✅ Đã tạo role mới: ${role.name}`);
      return role;
    } catch (error) {
      console.error('❌ Lỗi tạo role:', error);
      throw error;
    }
  }

  async updateRole(roleId, updates) {
    try {
      await this.initialize();

      const roles = await this.getRoles();
      const roleIndex = roles.findIndex(role => role.id === roleId);

      if (roleIndex === -1) {
        throw new Error('Không tìm thấy role');
      }

      const updatedRole = new Role({
        ...roles[roleIndex],
        ...updates,
        updated_at: new Date().toISOString()
      });

      const roleRow = updatedRole.toGoogleSheets();
      const values = Object.values(roleRow);

      // Update row in Google Sheets (row index = roleIndex + 2 because of header)
      await googleSheetsService.updateValues(this.sheetName, `A${roleIndex + 2}:H${roleIndex + 2}`, [values]);

      console.log(`✅ Đã cập nhật role: ${updatedRole.name}`);
      return updatedRole;
    } catch (error) {
      console.error('❌ Lỗi cập nhật role:', error);
      throw error;
    }
  }

  async deleteRole(roleId) {
    try {
      await this.initialize();

      const roles = await this.getRoles();
      const roleIndex = roles.findIndex(role => role.id === roleId);

      if (roleIndex === -1) {
        throw new Error('Không tìm thấy role');
      }

      // Delete row in Google Sheets (row index = roleIndex + 2 because of header)
      await googleSheetsService.deleteData(this.sheetName, `A${roleIndex + 2}:H${roleIndex + 2}`);

      console.log(`✅ Đã xóa role: ${roleId}`);
      return true;
    } catch (error) {
      console.error('❌ Lỗi xóa role:', error);
      throw error;
    }
  }

  async getActiveRoles() {
    try {
      const roles = await this.getRoles();
      return roles.filter(role => role.isActive);
    } catch (error) {
      console.error('❌ Lỗi lấy active roles:', error);
      throw error;
    }
  }

  async getRolesByLevel(level) {
    try {
      const roles = await this.getRoles();
      return roles.filter(role => role.level === level);
    } catch (error) {
      console.error('❌ Lỗi lấy roles theo level:', error);
      throw error;
    }
  }

  async getRoleStats() {
    try {
      const roles = await this.getRoles();
      const activeRoles = roles.filter(role => role.isActive);

      return {
        total: roles.length,
        active: activeRoles.length,
        inactive: roles.length - activeRoles.length,
        byLevel: roles.reduce((acc, role) => {
          acc[role.level] = (acc[role.level] || 0) + 1;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê roles:', error);
      throw error;
    }
  }
}

export const roleService = new RoleService();
