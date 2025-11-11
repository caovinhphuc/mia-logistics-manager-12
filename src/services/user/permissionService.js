// Permission Service - Quản lý quyền hạn từ Google Sheets
import { googleSheetsService } from '../google/googleSheetsService';

export class Permission {
  constructor(data = {}) {
    this.id = data.id || '';
    this.roleId = data.role_id || '';
    this.permissionCode = data.permission_code || '';
    this.permissionName = data.permission_name || '';
    this.module = data.module || '';
    this.action = data.action || '';
    this.isActive = data.is_active === 'true' || false;
    this.createdAt = data.created_at || new Date().toISOString();
  }

  toGoogleSheets() {
    return {
      id: this.id,
      role_id: this.roleId,
      permission_code: this.permissionCode,
      permission_name: this.permissionName,
      module: this.module,
      action: this.action,
      is_active: this.isActive.toString(),
      created_at: this.createdAt
    };
  }
}

export class PermissionService {
  constructor() {
    this.sheetName = 'RolePermissions';
    this.spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID || '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';
  }

  async initialize() {
    try {
      console.log('🔄 Khởi tạo PermissionService...');
      await googleSheetsService.initializeAPI();
      googleSheetsService.spreadsheetId = this.spreadsheetId;
      console.log('✅ PermissionService đã khởi tạo');
    } catch (error) {
      console.error('❌ Lỗi khởi tạo PermissionService:', error);
      throw error;
    }
  }

  async getPermissions() {
    try {
      await this.initialize();

      console.log('🔄 Lấy dữ liệu permissions từ Google Sheets...');
      const data = await googleSheetsService.getData(this.sheetName);

      if (!data || data.length <= 1) {
        throw new Error('Không có dữ liệu từ Google Sheets');
      }

      const headers = data[0];
      const permissions = data.slice(1).map((row, index) => {
        const permissionData = {};
        headers.forEach((header, colIndex) => {
          permissionData[header] = row[colIndex] || '';
        });
        return new Permission(permissionData);
      });

      console.log(`📊 Lấy danh sách permissions từ Google Sheets: ${permissions.length} quyền`);
      return permissions;
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách permissions:', error);
      console.log('⚠️ Sử dụng mock data...');
      return this.getMockPermissions();
    }
  }

  async getPermissionsByRole(roleId) {
    try {
      const permissions = await this.getPermissions();
      return permissions.filter(permission => permission.roleId === roleId && permission.isActive);
    } catch (error) {
      console.error('❌ Lỗi lấy permissions theo role:', error);
      throw error;
    }
  }

  // Mock data cho testing
  getMockPermissions() {
    return [
      new Permission({
        id: '1',
        role_id: '1',
        permission_code: 'read:all',
        permission_name: 'Read All',
        module: 'all',
        action: 'read',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '2',
        role_id: '1',
        permission_code: 'write:all',
        permission_name: 'Write All',
        module: 'all',
        action: 'write',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '3',
        role_id: '1',
        permission_code: 'delete:all',
        permission_name: 'Delete All',
        module: 'all',
        action: 'delete',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '4',
        role_id: '1',
        permission_code: 'manage:users',
        permission_name: 'Manage Users',
        module: 'users',
        action: 'manage',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '5',
        role_id: '1',
        permission_code: 'manage:settings',
        permission_name: 'Manage Settings',
        module: 'settings',
        action: 'manage',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '6',
        role_id: '2',
        permission_code: 'read:all',
        permission_name: 'Read All',
        module: 'all',
        action: 'read',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '7',
        role_id: '2',
        permission_code: 'write:transport',
        permission_name: 'Write Transport',
        module: 'transport',
        action: 'write',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '8',
        role_id: '2',
        permission_code: 'write:warehouse',
        permission_name: 'Write Warehouse',
        module: 'warehouse',
        action: 'write',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '9',
        role_id: '2',
        permission_code: 'write:staff',
        permission_name: 'Write Staff',
        module: 'staff',
        action: 'write',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '10',
        role_id: '2',
        permission_code: 'view:reports',
        permission_name: 'View Reports',
        module: 'reports',
        action: 'read',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '11',
        role_id: '3',
        permission_code: 'read:transport',
        permission_name: 'Read Transport',
        module: 'transport',
        action: 'read',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '12',
        role_id: '3',
        permission_code: 'read:warehouse',
        permission_name: 'Read Warehouse',
        module: 'warehouse',
        action: 'read',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '13',
        role_id: '3',
        permission_code: 'read:partners',
        permission_name: 'Read Partners',
        module: 'partners',
        action: 'read',
        is_active: 'true',
        created_at: new Date().toISOString()
      }),
      new Permission({
        id: '14',
        role_id: '3',
        permission_code: 'write:transport:own',
        permission_name: 'Write Own Transport',
        module: 'transport',
        action: 'write',
        is_active: 'true',
        created_at: new Date().toISOString()
      })
    ];
  }

  async getPermissionsByModule(module) {
    try {
      const permissions = await this.getPermissions();
      return permissions.filter(permission => permission.module === module && permission.isActive);
    } catch (error) {
      console.error('❌ Lỗi lấy permissions theo module:', error);
      throw error;
    }
  }

  async getPermissionById(permissionId) {
    try {
      const permissions = await this.getPermissions();
      return permissions.find(permission => permission.id === permissionId);
    } catch (error) {
      console.error('❌ Lỗi lấy permission theo ID:', error);
      throw error;
    }
  }

  async createPermission(permissionData) {
    try {
      await this.initialize();

      // Generate new ID
      const permissions = await this.getPermissions();
      const newId = (Math.max(...permissions.map(p => parseInt(p.id) || 0)) + 1).toString();

      const permission = new Permission({
        ...permissionData,
        id: newId,
        created_at: new Date().toISOString()
      });

      const permissionRow = permission.toGoogleSheets();
      const values = Object.values(permissionRow);

      await googleSheetsService.appendData(this.sheetName, [values]);

      console.log(`✅ Đã tạo permission mới: ${permission.permissionName}`);
      return permission;
    } catch (error) {
      console.error('❌ Lỗi tạo permission:', error);
      throw error;
    }
  }

  async updatePermission(permissionId, updates) {
    try {
      await this.initialize();

      const permissions = await this.getPermissions();
      const permissionIndex = permissions.findIndex(permission => permission.id === permissionId);

      if (permissionIndex === -1) {
        throw new Error('Không tìm thấy permission');
      }

      const updatedPermission = new Permission({
        ...permissions[permissionIndex],
        ...updates
      });

      const permissionRow = updatedPermission.toGoogleSheets();
      const values = Object.values(permissionRow);

      // Update row in Google Sheets (row index = permissionIndex + 2 because of header)
      await googleSheetsService.updateValues(this.sheetName, `A${permissionIndex + 2}:H${permissionIndex + 2}`, [values]);

      console.log(`✅ Đã cập nhật permission: ${updatedPermission.permissionName}`);
      return updatedPermission;
    } catch (error) {
      console.error('❌ Lỗi cập nhật permission:', error);
      throw error;
    }
  }

  async deletePermission(permissionId) {
    try {
      await this.initialize();

      const permissions = await this.getPermissions();
      const permissionIndex = permissions.findIndex(permission => permission.id === permissionId);

      if (permissionIndex === -1) {
        throw new Error('Không tìm thấy permission');
      }

      // Delete row in Google Sheets (row index = permissionIndex + 2 because of header)
      await googleSheetsService.deleteData(this.sheetName, `A${permissionIndex + 2}:H${permissionIndex + 2}`);

      console.log(`✅ Đã xóa permission: ${permissionId}`);
      return true;
    } catch (error) {
      console.error('❌ Lỗi xóa permission:', error);
      throw error;
    }
  }

  async getActivePermissions() {
    try {
      const permissions = await this.getPermissions();
      return permissions.filter(permission => permission.isActive);
    } catch (error) {
      console.error('❌ Lỗi lấy active permissions:', error);
      throw error;
    }
  }

  async getPermissionsByAction(action) {
    try {
      const permissions = await this.getPermissions();
      return permissions.filter(permission => permission.action === action && permission.isActive);
    } catch (error) {
      console.error('❌ Lỗi lấy permissions theo action:', error);
      throw error;
    }
  }

  async hasPermission(roleId, permissionCode) {
    try {
      const permissions = await this.getPermissionsByRole(roleId);
      return permissions.some(permission => permission.permissionCode === permissionCode);
    } catch (error) {
      console.error('❌ Lỗi kiểm tra permission:', error);
      return false;
    }
  }

  async getPermissionStats() {
    try {
      const permissions = await this.getPermissions();
      const activePermissions = permissions.filter(permission => permission.isActive);

      return {
        total: permissions.length,
        active: activePermissions.length,
        inactive: permissions.length - activePermissions.length,
        byModule: permissions.reduce((acc, permission) => {
          acc[permission.module] = (acc[permission.module] || 0) + 1;
          return acc;
        }, {}),
        byAction: permissions.reduce((acc, permission) => {
          acc[permission.action] = (acc[permission.action] || 0) + 1;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê permissions:', error);
      throw error;
    }
  }
}

export const permissionService = new PermissionService();
