import React, { createContext, useContext, useEffect, useReducer } from "react";
import { logService } from "../services/api/logService";
import { sessionService } from "../services/auth/sessionService";
import { googleAuthService } from "../services/google/googleAuthService";

// Auth state structure
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  permissions: [],
  sessionId: null,
};

// Auth actions
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_PERMISSIONS: "SET_PERMISSIONS",
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
        permissions: action.payload.permissions || [],
        sessionId: action.payload.sessionId,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        permissions: [],
        sessionId: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.SET_PERMISSIONS:
      return { ...state, permissions: action.payload };

    default:
      return state;
  }
};

// Role-based permissions
const ROLE_PERMISSIONS = {
  admin: [
    "read:all",
    "write:all",
    "delete:all",
    "manage:users",
    "manage:settings",
    "view:reports",
    "manage:transport",
    "manage:warehouse",
    "manage:staff",
    "manage:partners",
  ],
  manager: [
    "read:all",
    "write:transport",
    "write:warehouse",
    "write:staff",
    "view:reports",
    "manage:transport",
    "manage:warehouse",
    "manage:staff",
  ],
  operator: [
    "read:transport",
    "read:warehouse",
    "read:partners",
    "write:transport",
    "write:warehouse",
  ],
  driver: ["read:transport", "write:transport:own"],
  warehouse_staff: ["read:warehouse", "write:warehouse", "read:transport"],
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Auto logout on session timeout
  useEffect(() => {
    let timeoutId;

    if (state.isAuthenticated && state.sessionId) {
      const timeout =
        parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600000; // 1 hour
      timeoutId = setTimeout(() => {
        logout("Session timeout");
      }, timeout);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [state.isAuthenticated, state.sessionId]);

  const initializeAuth = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      // Check for existing session
      const session = sessionService.getSession();
      if (session && sessionService.isValidSession(session)) {
        const user = await googleAuthService.getCurrentUser();
        if (user) {
          const permissions = getPermissionsByRole(user.role);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, permissions, sessionId: session.id },
          });

          // Log successful session restore
          logService.log("auth", "Session restored", { userId: user.id });
          return;
        }
      }

      // Clear invalid session
      sessionService.clearSession();
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    } catch (error) {
      console.error("Auth initialization error:", error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      let user;

      if (credentials.googleToken) {
        // Google OAuth login
        user = await googleAuthService.loginWithGoogle(credentials.googleToken);
      } else {
        // Regular login
        user = await googleAuthService.login(
          credentials.email,
          credentials.password,
        );
      }

      // Create session
      const session = sessionService.createSession(user);
      const permissions = getPermissionsByRole(user.role);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, permissions, sessionId: session.id },
      });

      // Log successful login
      logService.log("auth", "Login successful", {
        userId: user.id,
        method: credentials.googleToken ? "google" : "email",
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.message || "Đăng nhập thất bại";
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });

      // Log failed login
      logService.log("auth", "Login failed", {
        error: errorMessage,
        email: credentials.email,
      });

      return { success: false, error: errorMessage };
    }
  };

  const logout = async (reason = "User logout") => {
    try {
      const userId = state.user?.id;

      // Clear session
      sessionService.clearSession();

      // Google logout if needed
      if (googleAuthService.isGoogleUser()) {
        await googleAuthService.logout();
      }

      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      // Log logout
      logService.log("auth", "Logout", { userId, reason });
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout anyway
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });

    // Update session
    const session = sessionService.getSession();
    if (session) {
      sessionService.updateSession({ ...session.user, ...userData });
    }
  };

  const getPermissionsByRole = (role) => {
    return ROLE_PERMISSIONS[role] || [];
  };

  const hasPermission = (permission) => {
    return (
      state.permissions.includes(permission) ||
      state.permissions.includes("read:all")
    );
  };

  const hasRole = (role) => {
    return state.user?.role === role || state.user?.role === "admin";
  };

  const hasAnyRole = (roles) => {
    return roles.some((role) => hasRole(role));
  };

  const refreshPermissions = () => {
    if (state.user?.role) {
      const permissions = getPermissionsByRole(state.user.role);
      dispatch({ type: AUTH_ACTIONS.SET_PERMISSIONS, payload: permissions });
    }
  };

  const contextValue = {
    // State
    ...state,

    // Actions
    login,
    logout,
    updateUser,

    // Permission helpers
    hasPermission,
    hasRole,
    hasAnyRole,
    refreshPermissions,

    // Utilities
    clearError: () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR }),
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Higher-order component for role-based access control
export const withAuth = (WrappedComponent, requiredRoles = []) => {
  return (props) => {
    const { isAuthenticated, hasAnyRole, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div>Unauthorized</div>;
    }

    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return <div>Access Denied</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default AuthContext;
