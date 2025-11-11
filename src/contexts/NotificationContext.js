import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { toast } from "react-hot-toast";

// Notification state structure
const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    enableSound: true,
    enableDesktop: true,
    enableEmail: false,
    enablePush: true,
    autoMarkRead: true,
    showTime: 5000,
    maxNotifications: 100,
    soundVolume: 0.5,
    vibrationPattern: [200, 100, 200],
  },
  loading: false,
  error: null,
  isOnline: navigator.onLine,
};

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  TRANSPORT: "transport",
  WAREHOUSE: "warehouse",
  STAFF: "staff",
  PARTNER: "partner",
  SYSTEM: "system",
  SECURITY: "security",
  MAINTENANCE: "maintenance",
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
  CRITICAL: "critical",
};

// Notification categories
export const NOTIFICATION_CATEGORIES = {
  GENERAL: "general",
  TRANSPORT: "transport",
  WAREHOUSE: "warehouse",
  STAFF: "staff",
  PARTNERS: "partners",
  SYSTEM: "system",
  SECURITY: "security",
  REPORTS: "reports",
};

// Notification actions
const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  MARK_READ: "MARK_READ",
  MARK_ALL_READ: "MARK_ALL_READ",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  CLEAR_ALL: "CLEAR_ALL",
  CLEAR_CATEGORY: "CLEAR_CATEGORY",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  LOAD_NOTIFICATIONS: "LOAD_NOTIFICATIONS",
  SET_ONLINE_STATUS: "SET_ONLINE_STATUS",
  ARCHIVE_NOTIFICATION: "ARCHIVE_NOTIFICATION",
  PIN_NOTIFICATION: "PIN_NOTIFICATION",
  UNPIN_NOTIFICATION: "UNPIN_NOTIFICATION",
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotification = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        isPinned: false,
        isArchived: false,
        category: NOTIFICATION_CATEGORIES.GENERAL,
        ...action.payload,
      };

      // Limit notifications count
      const notifications = [newNotification, ...state.notifications];
      const limitedNotifications = notifications.slice(
        0,
        state.settings.maxNotifications,
      );

      return {
        ...state,
        notifications: limitedNotifications,
        unreadCount: state.unreadCount + 1,
        error: null,
      };

    case NOTIFICATION_ACTIONS.MARK_READ:
      const targetNotification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification,
        ),
        unreadCount:
          targetNotification && !targetNotification.isRead
            ? state.unreadCount - 1
            : state.unreadCount,
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const removedNotification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload,
        ),
        unreadCount:
          removedNotification && !removedNotification.isRead
            ? state.unreadCount - 1
            : state.unreadCount,
      };

    case NOTIFICATION_ACTIONS.ARCHIVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? {
                ...notification,
                isArchived: true,
                archivedAt: new Date().toISOString(),
              }
            : notification,
        ),
      };

    case NOTIFICATION_ACTIONS.PIN_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? {
                ...notification,
                isPinned: true,
                pinnedAt: new Date().toISOString(),
              }
            : notification,
        ),
      };

    case NOTIFICATION_ACTIONS.UNPIN_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? { ...notification, isPinned: false, pinnedAt: null }
            : notification,
        ),
      };

    case NOTIFICATION_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    case NOTIFICATION_ACTIONS.CLEAR_CATEGORY:
      const categoryNotifications = state.notifications.filter(
        (n) => n.category === action.payload && !n.isRead,
      );
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.category !== action.payload,
        ),
        unreadCount: state.unreadCount - categoryNotifications.length,
      };

    case NOTIFICATION_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case NOTIFICATION_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case NOTIFICATION_ACTIONS.LOAD_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.isRead).length,
        loading: false,
      };

    case NOTIFICATION_ACTIONS.SET_ONLINE_STATUS:
      return { ...state, isOnline: action.payload };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Load notifications from localStorage on mount
  useEffect(() => {
    loadNotifications();
    loadSettings();
    requestNotificationPermission();
    setupOnlineStatusListener();

    // Clean up old notifications
    cleanupOldNotifications();
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (state.notifications.length > 0) {
      localStorage.setItem(
        "mia-notifications",
        JSON.stringify(state.notifications),
      );
    }
  }, [state.notifications]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      "mia-notification-settings",
      JSON.stringify(state.settings),
    );
  }, [state.settings]);

  // Auto-mark as read based on settings
  useEffect(() => {
    if (state.settings.autoMarkRead && state.notifications.length > 0) {
      const timer = setTimeout(() => {
        const unreadNotifications = state.notifications.filter(
          (n) => !n.isRead,
        );
        if (unreadNotifications.length > 0) {
          const oldestUnread =
            unreadNotifications[unreadNotifications.length - 1];
          if (Date.now() - new Date(oldestUnread.timestamp).getTime() > 30000) {
            // 30 seconds
            markAsRead(oldestUnread.id);
          }
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [state.notifications, state.settings.autoMarkRead]);

  const loadNotifications = () => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
      const saved = localStorage.getItem("mia-notifications");
      if (saved) {
        const notifications = JSON.parse(saved);
        // Only keep notifications from last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentNotifications = notifications.filter(
          (n) => new Date(n.timestamp) > thirtyDaysAgo,
        );
        dispatch({
          type: NOTIFICATION_ACTIONS.LOAD_NOTIFICATIONS,
          payload: recentNotifications,
        });
      }
    } catch (error) {
      console.warn("Failed to load notifications:", error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error.message,
      });
    }
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("mia-notification-settings");
      if (saved) {
        const settings = JSON.parse(saved);
        dispatch({
          type: NOTIFICATION_ACTIONS.UPDATE_SETTINGS,
          payload: settings,
        });
      }
    } catch (error) {
      console.warn("Failed to load notification settings:", error);
    }
  };

  const setupOnlineStatusListener = () => {
    const handleOnline = () =>
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ONLINE_STATUS, payload: true });
    const handleOffline = () =>
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ONLINE_STATUS,
        payload: false,
      });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  };

  const cleanupOldNotifications = () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldNotifications = state.notifications.filter(
      (n) => new Date(n.timestamp) < sevenDaysAgo && !n.isPinned,
    );

    if (oldNotifications.length > 0) {
      oldNotifications.forEach((notification) => {
        dispatch({
          type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
          payload: notification.id,
        });
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.warn("Failed to request notification permission:", error);
      }
    }
  };

  const addNotification = useCallback(
    (notification) => {
      const {
        type = NOTIFICATION_TYPES.INFO,
        priority = NOTIFICATION_PRIORITIES.NORMAL,
        category = NOTIFICATION_CATEGORIES.GENERAL,
        title,
        message,
        actions = [],
        autoHide = true,
        data = {},
        persistent = false,
        group = null,
      } = notification;

      dispatch({
        type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
        payload: {
          type,
          priority,
          category,
          title,
          message,
          actions,
          autoHide,
          data,
          persistent,
          group,
        },
      });

      // Show toast notification
      showToast(type, message, title);

      // Show desktop notification if enabled and online
      if (state.settings.enableDesktop && state.isOnline) {
        showDesktopNotification(title, message, type, priority);
      }

      // Play sound if enabled
      if (state.settings.enableSound) {
        playNotificationSound(type, priority);
      }

      // Vibrate if supported and enabled
      if (state.settings.enablePush && "vibrate" in navigator) {
        vibrateDevice(priority);
      }
    },
    [state.settings, state.isOnline],
  );

  const showToast = (type, message, title) => {
    const options = {
      duration: state.settings.showTime,
      position: "top-right",
      style: {
        background: getToastBackground(type),
        color: getToastColor(type),
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
      },
    };

    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        toast.success(title || message, options);
        break;
      case NOTIFICATION_TYPES.ERROR:
        toast.error(title || message, options);
        break;
      case NOTIFICATION_TYPES.WARNING:
        toast(title || message, { ...options, icon: "⚠️" });
        break;
      default:
        toast(title || message, options);
    }
  };

  const showDesktopNotification = (title, message, type, priority) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const options = {
        body: message,
        icon: getNotificationIcon(type),
        badge: "/favicon.ico",
        tag: "mia-logistics",
        requireInteraction:
          priority === NOTIFICATION_PRIORITIES.CRITICAL ||
          priority === NOTIFICATION_PRIORITIES.URGENT,
        silent: !state.settings.enableSound,
        data: {
          type,
          priority,
          timestamp: Date.now(),
        },
      };

      const notification = new Notification(title, options);

      // Auto-close after 10 seconds unless persistent
      setTimeout(() => {
        notification.close();
      }, 10000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const playNotificationSound = (type, priority) => {
    try {
      const audio = new Audio();

      // Different sounds for different types/priorities
      if (priority === NOTIFICATION_PRIORITIES.CRITICAL) {
        audio.src = "/sounds/critical.mp3";
      } else if (priority === NOTIFICATION_PRIORITIES.URGENT) {
        audio.src = "/sounds/urgent.mp3";
      } else if (type === NOTIFICATION_TYPES.ERROR) {
        audio.src = "/sounds/error.mp3";
      } else if (type === NOTIFICATION_TYPES.SUCCESS) {
        audio.src = "/sounds/success.mp3";
      } else if (type === NOTIFICATION_TYPES.WARNING) {
        audio.src = "/sounds/warning.mp3";
      } else {
        audio.src = "/sounds/notification.mp3";
      }

      audio.volume = state.settings.soundVolume;
      audio.play().catch(() => {
        // Ignore audio play errors (user hasn't interacted with page yet)
      });
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  };

  const vibrateDevice = (priority) => {
    try {
      if (priority === NOTIFICATION_PRIORITIES.CRITICAL) {
        navigator.vibrate([300, 100, 300, 100, 300]);
      } else if (priority === NOTIFICATION_PRIORITIES.URGENT) {
        navigator.vibrate(state.settings.vibrationPattern);
      } else {
        navigator.vibrate(200);
      }
    } catch (error) {
      console.warn("Could not vibrate device:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      [NOTIFICATION_TYPES.SUCCESS]: "/icons/success.png",
      [NOTIFICATION_TYPES.ERROR]: "/icons/error.png",
      [NOTIFICATION_TYPES.WARNING]: "/icons/warning.png",
      [NOTIFICATION_TYPES.TRANSPORT]: "/icons/transport.png",
      [NOTIFICATION_TYPES.WAREHOUSE]: "/icons/warehouse.png",
      [NOTIFICATION_TYPES.STAFF]: "/icons/staff.png",
      [NOTIFICATION_TYPES.PARTNER]: "/icons/partner.png",
      [NOTIFICATION_TYPES.SECURITY]: "/icons/security.png",
      [NOTIFICATION_TYPES.MAINTENANCE]: "/icons/maintenance.png",
    };
    return iconMap[type] || "/icons/info.png";
  };

  const getToastBackground = (type) => {
    const backgroundMap = {
      [NOTIFICATION_TYPES.SUCCESS]: "#4caf50",
      [NOTIFICATION_TYPES.ERROR]: "#f44336",
      [NOTIFICATION_TYPES.WARNING]: "#ff9800",
      [NOTIFICATION_TYPES.INFO]: "#2196f3",
      [NOTIFICATION_TYPES.TRANSPORT]: "#9c27b0",
      [NOTIFICATION_TYPES.WAREHOUSE]: "#ff5722",
      [NOTIFICATION_TYPES.STAFF]: "#607d8b",
      [NOTIFICATION_TYPES.PARTNER]: "#795548",
    };
    return backgroundMap[type] || "#2196f3";
  };

  const getToastColor = (type) => {
    return "#ffffff";
  };

  const markAsRead = (notificationId) => {
    dispatch({ type: NOTIFICATION_ACTIONS.MARK_READ, payload: notificationId });
  };

  const markAllAsRead = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_READ });
  };

  const removeNotification = (notificationId) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: notificationId,
    });
  };

  const archiveNotification = (notificationId) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.ARCHIVE_NOTIFICATION,
      payload: notificationId,
    });
  };

  const pinNotification = (notificationId) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.PIN_NOTIFICATION,
      payload: notificationId,
    });
  };

  const unpinNotification = (notificationId) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.UNPIN_NOTIFICATION,
      payload: notificationId,
    });
  };

  const clearAll = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ALL });
  };

  const clearCategory = (category) => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_CATEGORY, payload: category });
  };

  const updateSettings = (newSettings) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.UPDATE_SETTINGS,
      payload: newSettings,
    });
  };

  const clearError = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
  };

  // Convenience methods for different notification types
  const showSuccess = useCallback(
    (message, title = "Thành công", options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title,
        message,
        ...options,
      });
    },
    [addNotification],
  );

  const showError = useCallback(
    (message, title = "Lỗi", options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title,
        message,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        persistent: true,
        ...options,
      });
    },
    [addNotification],
  );

  const showWarning = useCallback(
    (message, title = "Cảnh báo", options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.WARNING,
        title,
        message,
        ...options,
      });
    },
    [addNotification],
  );

  const showInfo = useCallback(
    (message, title = "Thông tin", options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title,
        message,
        ...options,
      });
    },
    [addNotification],
  );

  const showTransportUpdate = useCallback(
    (message, data = {}, options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.TRANSPORT,
        category: NOTIFICATION_CATEGORIES.TRANSPORT,
        title: "Cập nhật vận chuyển",
        message,
        data,
        ...options,
      });
    },
    [addNotification],
  );

  const showWarehouseUpdate = useCallback(
    (message, data = {}, options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.WAREHOUSE,
        category: NOTIFICATION_CATEGORIES.WAREHOUSE,
        title: "Cập nhật kho",
        message,
        data,
        ...options,
      });
    },
    [addNotification],
  );

  const showStaffUpdate = useCallback(
    (message, data = {}, options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.STAFF,
        category: NOTIFICATION_CATEGORIES.STAFF,
        title: "Cập nhật nhân viên",
        message,
        data,
        ...options,
      });
    },
    [addNotification],
  );

  const showPartnerUpdate = useCallback(
    (message, data = {}, options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.PARTNER,
        category: NOTIFICATION_CATEGORIES.PARTNERS,
        title: "Cập nhật đối tác",
        message,
        data,
        ...options,
      });
    },
    [addNotification],
  );

  const showSecurityAlert = useCallback(
    (message, data = {}, options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.SECURITY,
        category: NOTIFICATION_CATEGORIES.SECURITY,
        title: "Cảnh báo bảo mật",
        message,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        persistent: true,
        data,
        ...options,
      });
    },
    [addNotification],
  );

  const showSystemUpdate = useCallback(
    (message, data = {}, options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.SYSTEM,
        category: NOTIFICATION_CATEGORIES.SYSTEM,
        title: "Cập nhật hệ thống",
        message,
        data,
        ...options,
      });
    },
    [addNotification],
  );

  const showMaintenanceAlert = useCallback(
    (message, data = {}, options = {}) => {
      addNotification({
        type: NOTIFICATION_TYPES.MAINTENANCE,
        category: NOTIFICATION_CATEGORIES.SYSTEM,
        title: "Bảo trì hệ thống",
        message,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        data,
        ...options,
      });
    },
    [addNotification],
  );

  // Get notifications by category
  const getNotificationsByCategory = (category) => {
    return state.notifications.filter((n) => n.category === category);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return state.notifications.filter((n) => !n.isRead);
  };

  // Get pinned notifications
  const getPinnedNotifications = () => {
    return state.notifications.filter((n) => n.isPinned);
  };

  // Get notifications by priority
  const getNotificationsByPriority = (priority) => {
    return state.notifications.filter((n) => n.priority === priority);
  };

  const contextValue = {
    // State
    ...state,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    archiveNotification,
    pinNotification,
    unpinNotification,
    clearAll,
    clearCategory,
    updateSettings,
    clearError,

    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showTransportUpdate,
    showWarehouseUpdate,
    showStaffUpdate,
    showPartnerUpdate,
    showSecurityAlert,
    showSystemUpdate,
    showMaintenanceAlert,

    // Query methods
    getNotificationsByCategory,
    getUnreadNotifications,
    getPinnedNotifications,
    getNotificationsByPriority,

    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES,
    NOTIFICATION_CATEGORIES,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

export default NotificationContext;
