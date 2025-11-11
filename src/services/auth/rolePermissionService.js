// Role Permission Service - Quản lý roles và permissions
class RolePermissionService {
  constructor() {
    this.roles = {
      admin: {
        id: 1,
        code: 'admin',
        name: 'Administrator',
        description: 'Full system access',
        level: 100,
        permissions: [
          'read:all', 'write:all', 'delete:all', 'manage:users',
          'manage:settings', 'view:reports', 'manage:transport',
          'manage:warehouse', 'manage:staff', 'manage:partners',
          'manage:notifications', 'manage:system', 'audit:all'
        ]
      },
      manager: {
        id: 2,
        code: 'manager',
        name: 'Manager',
        description: 'Management level access',
        level: 80,
        permissions: [
          'read:all', 'write:transport', 'write:warehouse', 'write:staff',
          'view:reports', 'manage:transport', 'manage:warehouse', 'manage:staff',
          'manage:notifications', 'audit:transport', 'audit:warehouse'
        ]
      },
      supervisor: {
        id: 3,
        code: 'supervisor',
        name: 'Supervisor',
        description: 'Supervisory level access',
        level: 60,
        permissions: [
          'read:transport', 'read:warehouse', 'read:staff', 'read:partners',
          'write:transport', 'write:warehouse', 'view:reports',
          'manage:notifications', 'audit:transport'
        ]
      },
      operator: {
        id: 4,
        code: 'operator',
        name: 'Operator',
        description: 'Operational level access',
        level: 40,
        permissions: [
          'read:transport', 'read:warehouse', 'read:partners',
          'write:transport', 'write:warehouse', 'view:notifications'
        ]
      },
      driver: {
        id: 5,
        code: 'driver',
        name: 'Driver',
        description: 'Driver level access',
        level: 20,
        permissions: [
          'read:transport:own', 'write:transport:own', 'view:notifications'
        ]
      },
      warehouse_staff: {
        id: 6,
        code: 'warehouse_staff',
        name: 'Warehouse Staff',
        description: 'Warehouse staff access',
        level: 20,
        permissions: [
          'read:warehouse', 'write:warehouse', 'read:transport',
          'view:notifications'
        ]
      },
      viewer: {
        id: 7,
        code: 'viewer',
        name: 'Viewer',
        description: 'Read-only access',
        level: 10,
        permissions: [
          'read:transport', 'read:warehouse', 'view:notifications'
        ]
      }
    };

    this.permissions = {
      // Read permissions
      'read:all': { name: 'Read All', description: 'Read access to all resources' },
      'read:transport': { name: 'Read Transport', description: 'Read transport data' },
      'read:warehouse': { name: 'Read Warehouse', description: 'Read warehouse data' },
      'read:staff': { name: 'Read Staff', description: 'Read staff data' },
      'read:partners': { name: 'Read Partners', description: 'Read partners data' },
      'read:transport:own': { name: 'Read Own Transport', description: 'Read own transport data' },

      // Write permissions
      'write:all': { name: 'Write All', description: 'Write access to all resources' },
      'write:transport': { name: 'Write Transport', description: 'Write transport data' },
      'write:warehouse': { name: 'Write Warehouse', description: 'Write warehouse data' },
      'write:staff': { name: 'Write Staff', description: 'Write staff data' },
      'write:transport:own': { name: 'Write Own Transport', description: 'Write own transport data' },

      // Delete permissions
      'delete:all': { name: 'Delete All', description: 'Delete access to all resources' },

      // Management permissions
      'manage:users': { name: 'Manage Users', description: 'Manage user accounts' },
      'manage:settings': { name: 'Manage Settings', description: 'Manage system settings' },
      'manage:transport': { name: 'Manage Transport', description: 'Manage transport operations' },
      'manage:warehouse': { name: 'Manage Warehouse', description: 'Manage warehouse operations' },
      'manage:staff': { name: 'Manage Staff', description: 'Manage staff operations' },
      'manage:partners': { name: 'Manage Partners', description: 'Manage partner operations' },
      'manage:notifications': { name: 'Manage Notifications', description: 'Manage notifications' },
      'manage:system': { name: 'Manage System', description: 'Manage system operations' },

      // View permissions
      'view:reports': { name: 'View Reports', description: 'View system reports' },
      'view:notifications': { name: 'View Notifications', description: 'View notifications' },

      // Audit permissions
      'audit:all': { name: 'Audit All', description: 'Audit all operations' },
      'audit:transport': { name: 'Audit Transport', description: 'Audit transport operations' },
      'audit:warehouse': { name: 'Audit Warehouse', description: 'Audit warehouse operations' }
    };
  }

  // Lấy tất cả roles
  getAllRoles() {
    return Object.values(this.roles);
  }

  // Lấy role theo code
  getRoleByCode(roleCode) {
    return this.roles[roleCode] || null;
  }

  // Lấy role theo ID
  getRoleById(roleId) {
    return Object.values(this.roles).find(role => role.id === roleId) || null;
  }

  // Lấy permissions của role
  getRolePermissions(roleCode) {
    const role = this.getRoleByCode(roleCode);
    return role ? role.permissions : [];
  }

  // Kiểm tra user có permission không
  hasPermission(userRole, permission) {
    const rolePermissions = this.getRolePermissions(userRole);
    return rolePermissions.includes(permission) || rolePermissions.includes('read:all');
  }

  // Kiểm tra user có role không
  hasRole(userRole, requiredRole) {
    if (!userRole || !requiredRole) return false;

    // Admin có tất cả quyền
    if (userRole === 'admin') return true;

    // Kiểm tra role trực tiếp
    if (userRole === requiredRole) return true;

    // Kiểm tra role level
    const userRoleData = this.getRoleByCode(userRole);
    const requiredRoleData = this.getRoleByCode(requiredRole);

    if (!userRoleData || !requiredRoleData) return false;

    return userRoleData.level >= requiredRoleData.level;
  }

  // Kiểm tra user có bất kỳ role nào trong danh sách
  hasAnyRole(userRole, requiredRoles) {
    if (!userRole || !Array.isArray(requiredRoles)) return false;

    return requiredRoles.some(role => this.hasRole(userRole, role));
  }

  // Kiểm tra user có tất cả permissions trong danh sách
  hasAllPermissions(userRole, requiredPermissions) {
    if (!userRole || !Array.isArray(requiredPermissions)) return false;

    return requiredPermissions.every(permission => this.hasPermission(userRole, permission));
  }

  // Lấy permissions có thể assign cho role
  getAssignablePermissions(roleCode) {
    const role = this.getRoleByCode(roleCode);
    if (!role) return [];

    // Admin có thể assign tất cả permissions
    if (roleCode === 'admin') {
      return Object.keys(this.permissions);
    }

    // Các role khác chỉ có thể assign permissions có level thấp hơn hoặc bằng
    return Object.keys(this.permissions).filter(permission => {
      // Logic để xác định permission có thể assign
      return true; // Simplified for now
    });
  }

  // Tạo role mới
  createRole(roleData) {
    const { code, name, description, level, permissions } = roleData;

    if (this.roles[code]) {
      throw new Error('Role already exists');
    }

    const newRole = {
      id: Object.keys(this.roles).length + 1,
      code,
      name,
      description,
      level: level || 10,
      permissions: permissions || []
    };

    this.roles[code] = newRole;
    return newRole;
  }

  // Cập nhật role
  updateRole(roleCode, roleData) {
    const role = this.getRoleByCode(roleCode);
    if (!role) {
      throw new Error('Role not found');
    }

    const updatedRole = {
      ...role,
      ...roleData
    };

    this.roles[roleCode] = updatedRole;
    return updatedRole;
  }

  // Xóa role
  deleteRole(roleCode) {
    if (roleCode === 'admin') {
      throw new Error('Cannot delete admin role');
    }

    if (!this.roles[roleCode]) {
      throw new Error('Role not found');
    }

    delete this.roles[roleCode];
    return true;
  }

  // Lấy tất cả permissions
  getAllPermissions() {
    return this.permissions;
  }

  // Lấy permission theo code
  getPermissionByCode(permissionCode) {
    return this.permissions[permissionCode] || null;
  }

  // Tạo permission mới
  createPermission(permissionData) {
    const { code, name, description } = permissionData;

    if (this.permissions[code]) {
      throw new Error('Permission already exists');
    }

    const newPermission = {
      name,
      description
    };

    this.permissions[code] = newPermission;
    return newPermission;
  }

  // Kiểm tra role hierarchy
  canManageRole(managerRole, targetRole) {
    const managerRoleData = this.getRoleByCode(managerRole);
    const targetRoleData = this.getRoleByCode(targetRole);

    if (!managerRoleData || !targetRoleData) return false;

    // Chỉ có thể manage roles có level thấp hơn
    return managerRoleData.level > targetRoleData.level;
  }

  // Lấy roles có thể manage bởi role hiện tại
  getManageableRoles(roleCode) {
    const role = this.getRoleByCode(roleCode);
    if (!role) return [];

    return Object.values(this.roles).filter(r => r.level < role.level);
  }

  // Validate role permissions
  validateRolePermissions(roleCode, permissions) {
    const role = this.getRoleByCode(roleCode);
    if (!role) return false;

    // Kiểm tra tất cả permissions có tồn tại không
    const validPermissions = permissions.every(permission =>
      this.permissions.hasOwnProperty(permission)
    );

    return validPermissions;
  }

  // Get role statistics
  getRoleStatistics() {
    const roles = Object.values(this.roles);
    return {
      totalRoles: roles.length,
      totalPermissions: Object.keys(this.permissions).length,
      rolesByLevel: roles.reduce((acc, role) => {
        acc[role.level] = (acc[role.level] || 0) + 1;
        return acc;
      }, {}),
      averagePermissions: roles.reduce((acc, role) => acc + role.permissions.length, 0) / roles.length
    };
  }
}

export const rolePermissionService = new RolePermissionService();
export default rolePermissionService;
