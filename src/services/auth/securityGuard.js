// Security Guard - Bảo vệ routes và components
import { rolePermissionService } from './rolePermissionService';

class SecurityGuard {
  constructor() {
    this.routes = new Map();
    this.components = new Map();
    this.middlewares = [];
  }

  // Đăng ký route protection
  registerRoute(route, config) {
    this.routes.set(route, {
      requiredRoles: config.requiredRoles || [],
      requiredPermissions: config.requiredPermissions || [],
      middleware: config.middleware || [],
      redirectTo: config.redirectTo || '/unauthorized',
      ...config
    });
  }

  // Đăng ký component protection
  registerComponent(componentName, config) {
    this.components.set(componentName, {
      requiredRoles: config.requiredRoles || [],
      requiredPermissions: config.requiredPermissions || [],
      middleware: config.middleware || [],
      fallbackComponent: config.fallbackComponent || null,
      ...config
    });
  }

  // Kiểm tra quyền truy cập route
  canAccessRoute(user, route) {
    const routeConfig = this.routes.get(route);
    if (!routeConfig) return { allowed: true };

    // Kiểm tra roles
    if (routeConfig.requiredRoles.length > 0) {
      const hasRequiredRole = rolePermissionService.hasAnyRole(
        user.role,
        routeConfig.requiredRoles
      );
      if (!hasRequiredRole) {
        return {
          allowed: false,
          reason: 'Insufficient role',
          redirectTo: routeConfig.redirectTo
        };
      }
    }

    // Kiểm tra permissions
    if (routeConfig.requiredPermissions.length > 0) {
      const hasRequiredPermissions = rolePermissionService.hasAllPermissions(
        user.role,
        routeConfig.requiredPermissions
      );
      if (!hasRequiredPermissions) {
        return {
          allowed: false,
          reason: 'Insufficient permissions',
          redirectTo: routeConfig.redirectTo
        };
      }
    }

    // Chạy middleware
    for (const middleware of routeConfig.middleware) {
      const result = middleware(user, route);
      if (!result.allowed) {
        return result;
      }
    }

    return { allowed: true };
  }

  // Kiểm tra quyền truy cập component
  canAccessComponent(user, componentName) {
    const componentConfig = this.components.get(componentName);
    if (!componentConfig) return { allowed: true };

    // Kiểm tra roles
    if (componentConfig.requiredRoles.length > 0) {
      const hasRequiredRole = rolePermissionService.hasAnyRole(
        user.role,
        componentConfig.requiredRoles
      );
      if (!hasRequiredRole) {
        return {
          allowed: false,
          reason: 'Insufficient role',
          fallbackComponent: componentConfig.fallbackComponent
        };
      }
    }

    // Kiểm tra permissions
    if (componentConfig.requiredPermissions.length > 0) {
      const hasRequiredPermissions = rolePermissionService.hasAllPermissions(
        user.role,
        componentConfig.requiredPermissions
      );
      if (!hasRequiredPermissions) {
        return {
          allowed: false,
          reason: 'Insufficient permissions',
          fallbackComponent: componentConfig.fallbackComponent
        };
      }
    }

    // Chạy middleware
    for (const middleware of componentConfig.middleware) {
      const result = middleware(user, componentName);
      if (!result.allowed) {
        return result;
      }
    }

    return { allowed: true };
  }

  // Kiểm tra quyền thực hiện action
  canPerformAction(user, action, resource = null) {
    const actionPermissions = this.getActionPermissions(action);

    if (!actionPermissions) {
      return { allowed: true };
    }

    // Kiểm tra permissions
    const hasPermission = rolePermissionService.hasPermission(
      user.role,
      actionPermissions.permission
    );

    if (!hasPermission) {
      return {
        allowed: false,
        reason: 'Insufficient permissions',
        requiredPermission: actionPermissions.permission
      };
    }

    // Kiểm tra resource ownership nếu cần
    if (actionPermissions.requireOwnership && resource) {
      const isOwner = this.checkResourceOwnership(user, resource);
      if (!isOwner) {
        return {
          allowed: false,
          reason: 'Not resource owner',
          requiredOwnership: true
        };
      }
    }

    return { allowed: true };
  }

  // Lấy permissions cần thiết cho action
  getActionPermissions(action) {
    const actionMap = {
      'create:user': { permission: 'manage:users' },
      'read:user': { permission: 'read:all' },
      'update:user': { permission: 'manage:users' },
      'delete:user': { permission: 'manage:users' },

      'create:transport': { permission: 'write:transport' },
      'read:transport': { permission: 'read:transport' },
      'update:transport': { permission: 'write:transport' },
      'delete:transport': { permission: 'write:transport' },

      'create:warehouse': { permission: 'write:warehouse' },
      'read:warehouse': { permission: 'read:warehouse' },
      'update:warehouse': { permission: 'write:warehouse' },
      'delete:warehouse': { permission: 'write:warehouse' },

      'create:staff': { permission: 'write:staff' },
      'read:staff': { permission: 'read:staff' },
      'update:staff': { permission: 'write:staff' },
      'delete:staff': { permission: 'write:staff' },

      'create:partner': { permission: 'write:partners' },
      'read:partner': { permission: 'read:partners' },
      'update:partner': { permission: 'write:partners' },
      'delete:partner': { permission: 'write:partners' },

      'view:reports': { permission: 'view:reports' },
      'manage:settings': { permission: 'manage:settings' },
      'audit:all': { permission: 'audit:all' }
    };

    return actionMap[action] || null;
  }

  // Kiểm tra quyền sở hữu resource
  checkResourceOwnership(user, resource) {
    if (!resource || !resource.createdBy) return true;

    return resource.createdBy === user.id || user.role === 'admin';
  }

  // Middleware: Kiểm tra session timeout
  sessionTimeoutMiddleware(user, context) {
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    const lastActivity = user.lastActivity || Date.now();

    if (Date.now() - lastActivity > sessionTimeout) {
      return {
        allowed: false,
        reason: 'Session timeout',
        redirectTo: '/login?reason=timeout'
      };
    }

    return { allowed: true };
  }

  // Middleware: Kiểm tra IP whitelist
  ipWhitelistMiddleware(user, context) {
    const allowedIPs = process.env.REACT_APP_ALLOWED_IPS?.split(',') || [];
    const userIP = user.lastIP;

    if (allowedIPs.length > 0 && !allowedIPs.includes(userIP)) {
      return {
        allowed: false,
        reason: 'IP not allowed',
        redirectTo: '/unauthorized?reason=ip'
      };
    }

    return { allowed: true };
  }

  // Middleware: Kiểm tra device whitelist
  deviceWhitelistMiddleware(user, context) {
    const allowedDevices = user.allowedDevices || [];
    const currentDevice = user.currentDevice;

    if (allowedDevices.length > 0 && !allowedDevices.includes(currentDevice)) {
      return {
        allowed: false,
        reason: 'Device not allowed',
        redirectTo: '/unauthorized?reason=device'
      };
    }

    return { allowed: true };
  }

  // Middleware: Kiểm tra time-based access
  timeBasedAccessMiddleware(user, context) {
    const now = new Date();
    const currentHour = now.getHours();
    const userAccessHours = user.accessHours || { start: 0, end: 23 };

    if (currentHour < userAccessHours.start || currentHour > userAccessHours.end) {
      return {
        allowed: false,
        reason: 'Access outside allowed hours',
        redirectTo: '/unauthorized?reason=time'
      };
    }

    return { allowed: true };
  }

  // Middleware: Kiểm tra location-based access
  locationBasedAccessMiddleware(user, context) {
    const allowedLocations = user.allowedLocations || [];
    const currentLocation = user.currentLocation;

    if (allowedLocations.length > 0 && !allowedLocations.includes(currentLocation)) {
      return {
        allowed: false,
        reason: 'Location not allowed',
        redirectTo: '/unauthorized?reason=location'
      };
    }

    return { allowed: true };
  }

  // Đăng ký middleware
  registerMiddleware(name, middleware) {
    this.middlewares.push({ name, middleware });
  }

  // Lấy tất cả middleware
  getAllMiddlewares() {
    return this.middlewares;
  }

  // Kiểm tra quyền bulk
  canPerformBulkActions(user, actions) {
    const results = {};

    for (const action of actions) {
      results[action] = this.canPerformAction(user, action);
    }

    return results;
  }

  // Lấy danh sách actions user có thể thực hiện
  getAvailableActions(user) {
    const allActions = [
      'create:user', 'read:user', 'update:user', 'delete:user',
      'create:transport', 'read:transport', 'update:transport', 'delete:transport',
      'create:warehouse', 'read:warehouse', 'update:warehouse', 'delete:warehouse',
      'create:staff', 'read:staff', 'update:staff', 'delete:staff',
      'create:partner', 'read:partner', 'update:partner', 'delete:partner',
      'view:reports', 'manage:settings', 'audit:all'
    ];

    return allActions.filter(action => {
      const result = this.canPerformAction(user, action);
      return result.allowed;
    });
  }

  // Lấy thống kê security
  getSecurityStatistics() {
    return {
      totalRoutes: this.routes.size,
      totalComponents: this.components.size,
      totalMiddlewares: this.middlewares.length,
      routes: Array.from(this.routes.keys()),
      components: Array.from(this.components.keys()),
      middlewares: this.middlewares.map(m => m.name)
    };
  }

  // Reset tất cả guards
  reset() {
    this.routes.clear();
    this.components.clear();
    this.middlewares = [];
  }
}

export const securityGuard = new SecurityGuard();
export default securityGuard;
