import { alpha, createTheme } from "@mui/material/styles";
import { createBreakpoints } from "@mui/system";

// Enhanced Vietnamese color palette inspired by Vietnamese culture and logistics
const vietnameseColors = {
  // Primary Vietnamese colors
  red: "#DA020E", // Vietnamese flag red
  gold: "#FFCD00", // Vietnamese flag gold
  green: "#228B22", // Vietnamese nature green
  blue: "#0066CC", // Vietnamese sky blue
  brown: "#8B4513", // Vietnamese earth brown

  // Extended palette for logistics
  navy: "#1e3a8a", // Deep blue for professional look
  teal: "#0d9488", // Teal for success states
  orange: "#ea580c", // Orange for warnings
  purple: "#7c3aed", // Purple for special features
  pink: "#ec4899", // Pink for highlights
  indigo: "#4338ca", // Indigo for secondary actions

  // Neutral grays
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};

// Enhanced logistics color palette
const logisticsColors = {
  transport: {
    main: "#2196f3",
    light: "#64b5f6",
    dark: "#1976d2",
    contrast: "#ffffff",
  },
  warehouse: {
    main: "#4caf50",
    light: "#81c784",
    dark: "#388e3c",
    contrast: "#ffffff",
  },
  staff: {
    main: "#ff9800",
    light: "#ffb74d",
    dark: "#f57c00",
    contrast: "#ffffff",
  },
  partner: {
    main: "#9c27b0",
    light: "#ba68c8",
    dark: "#7b1fa2",
    contrast: "#ffffff",
  },
  urgent: {
    main: vietnameseColors.red,
    light: "#ff5983",
    dark: "#a7001a",
    contrast: "#ffffff",
  },
  completed: {
    main: vietnameseColors.green,
    light: "#81c784",
    dark: "#2e7d32",
    contrast: "#ffffff",
  },
  pending: {
    main: "#ffc107",
    light: "#ffecb3",
    dark: "#ff8f00",
    contrast: "#000000",
  },
  cancelled: {
    main: "#757575",
    light: "#a4a4a4",
    dark: "#424242",
    contrast: "#ffffff",
  },
};

// Enhanced status colors with semantic meaning
const statusColors = {
  online: "#4caf50",
  offline: "#f44336",
  busy: "#ff9800",
  away: "#9e9e9e",
  maintenance: "#ff5722",
  new: "#2196f3",
  updated: "#4caf50",
  deprecated: "#ff9800",
  error: "#f44336",
  warning: "#ff9800",
  info: "#2196f3",
  success: "#4caf50",
};

// Enhanced typography configuration
const typographyConfig = {
  fontFamily: [
    "Roboto",
    "Inter",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
  ].join(","),

  // Enhanced heading styles
  h1: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "2rem",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontSize: "1.75rem",
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: "1.25rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.6,
  },

  // Enhanced body text
  body1: {
    fontSize: "1rem",
    lineHeight: 1.6,
    letterSpacing: "0.01em",
  },
  body2: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
    letterSpacing: "0.01em",
  },

  // Enhanced button text
  button: {
    textTransform: "none",
    fontWeight: 500,
    letterSpacing: "0.02em",
  },

  // Enhanced caption
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.5,
    letterSpacing: "0.02em",
  },

  // Enhanced overline
  overline: {
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    lineHeight: 2.5,
    textTransform: "uppercase",
  },

  // Custom typography variants
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },
};

// Enhanced breakpoints for responsive design
const breakpoints = createBreakpoints({
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
    xxl: 2560, // Ultra-wide screens
  },
});

// Enhanced spacing configuration
const spacingConfig = (factor) => `${0.25 * factor}rem`; // 4px base unit

// Enhanced shape configuration
const shapeConfig = {
  borderRadius: 8,
  borderRadiusSm: 4,
  borderRadiusMd: 8,
  borderRadiusLg: 12,
  borderRadiusXl: 16,
  borderRadiusRound: "50%",
};

// Enhanced shadows configuration
const shadowsConfig = [
  "none",
  "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
  "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
  "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)",
  "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)",
  "0 25px 50px rgba(0,0,0,0.25)",
  "0 30px 60px rgba(0,0,0,0.30)",
  "0 35px 70px rgba(0,0,0,0.35)",
  "0 40px 80px rgba(0,0,0,0.40)",
  "0 45px 90px rgba(0,0,0,0.45)",
  "0 50px 100px rgba(0,0,0,0.50)",
  "0 55px 110px rgba(0,0,0,0.55)",
  "0 60px 120px rgba(0,0,0,0.60)",
  "0 65px 130px rgba(0,0,0,0.65)",
  "0 70px 140px rgba(0,0,0,0.70)",
  "0 75px 150px rgba(0,0,0,0.75)",
  "0 80px 160px rgba(0,0,0,0.80)",
  "0 85px 170px rgba(0,0,0,0.85)",
  "0 90px 180px rgba(0,0,0,0.90)",
  "0 95px 190px rgba(0,0,0,0.95)",
  "0 100px 200px rgba(0,0,0,1.00)",
  "0 105px 210px rgba(0,0,0,1.00)",
  "0 110px 220px rgba(0,0,0,1.00)",
  "0 115px 230px rgba(0,0,0,1.00)",
];

// Enhanced dark theme shadows
const darkShadowsConfig = [
  "none",
  "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)",
  "0 3px 6px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.5)",
  "0 10px 20px rgba(0,0,0,0.5), 0 6px 6px rgba(0,0,0,0.5)",
  "0 14px 28px rgba(0,0,0,0.6), 0 10px 10px rgba(0,0,0,0.5)",
  "0 19px 38px rgba(0,0,0,0.7), 0 15px 12px rgba(0,0,0,0.5)",
  "0 25px 50px rgba(0,0,0,0.6)",
  "0 30px 60px rgba(0,0,0,0.7)",
  "0 35px 70px rgba(0,0,0,0.8)",
  "0 40px 80px rgba(0,0,0,0.9)",
  "0 45px 90px rgba(0,0,0,1.0)",
  "0 50px 100px rgba(0,0,0,1.0)",
  "0 55px 110px rgba(0,0,0,1.0)",
  "0 60px 120px rgba(0,0,0,1.0)",
  "0 65px 130px rgba(0,0,0,1.0)",
  "0 70px 140px rgba(0,0,0,1.0)",
  "0 75px 150px rgba(0,0,0,1.0)",
  "0 80px 160px rgba(0,0,0,1.0)",
  "0 85px 170px rgba(0,0,0,1.0)",
  "0 90px 180px rgba(0,0,0,1.0)",
  "0 95px 190px rgba(0,0,0,1.0)",
  "0 100px 200px rgba(0,0,0,1.0)",
  "0 105px 210px rgba(0,0,0,1.0)",
  "0 110px 220px rgba(0,0,0,1.0)",
  "0 115px 230px rgba(0,0,0,1.0)",
];

// Enhanced component styles
const getComponentStyles = (isDarkMode) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: shapeConfig.borderRadius,
        textTransform: "none",
        fontWeight: 500,
        padding: "8px 16px",
        boxShadow: "none",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: isDarkMode
            ? "0 4px 8px rgba(0,0,0,0.3)"
            : "0 2px 4px rgba(0,0,0,0.12)",
          transform: "translateY(-1px)",
        },
        "&:active": {
          transform: "translateY(0)",
        },
        "&:disabled": {
          opacity: 0.6,
          cursor: "not-allowed",
        },
      },
      containedPrimary: {
        background: `linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)`,
        "&:hover": {
          background: `linear-gradient(45deg, #1565c0 30%, #1976d2 90%)`,
        },
      },
      containedSecondary: {
        background: `linear-gradient(45deg, ${vietnameseColors.gold} 30%, #fff350 90%)`,
        color: "#000000",
        "&:hover": {
          background: `linear-gradient(45deg, #c9b037 30%, ${vietnameseColors.gold} 90%)`,
        },
      },
      outlined: {
        borderWidth: "2px",
        "&:hover": {
          borderWidth: "2px",
        },
      },
      text: {
        "&:hover": {
          backgroundColor: alpha(isDarkMode ? "#ffffff" : "#000000", 0.04),
        },
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: shapeConfig.borderRadiusLg,
        boxShadow: isDarkMode
          ? "0 4px 8px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.1)",
        border: isDarkMode ? "1px solid #333" : "none",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: isDarkMode
            ? "0 8px 16px rgba(0,0,0,0.4)"
            : "0 4px 12px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)",
        },
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: shapeConfig.borderRadius,
      },
      elevation1: {
        boxShadow: isDarkMode
          ? "0 2px 4px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.12)",
      },
      elevation2: {
        boxShadow: isDarkMode
          ? "0 4px 8px rgba(0,0,0,0.3)"
          : "0 2px 6px rgba(0,0,0,0.15)",
      },
      elevation3: {
        boxShadow: isDarkMode
          ? "0 6px 12px rgba(0,0,0,0.4)"
          : "0 3px 9px rgba(0,0,0,0.18)",
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
        boxShadow: isDarkMode
          ? "0 8px 16px rgba(0,0,0,0.4)"
          : "0 4px 12px rgba(0,0,0,0.15)",
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: isDarkMode
          ? "0 2px 4px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.12)",
        backdropFilter: "blur(10px)",
        backgroundColor: alpha(isDarkMode ? "#121212" : "#ffffff", 0.95),
      },
    },
  },

  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: shapeConfig.borderRadius,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDarkMode ? "#555" : "#999",
            },
          },
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: "2px",
            },
          },
        },
        "& .MuiInputLabel-root": {
          transition: "all 0.2s ease-in-out",
        },
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: shapeConfig.borderRadiusXl,
        fontWeight: 500,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
        },
      },
    },
  },

  MuiDataGrid: {
    styleOverrides: {
      root: {
        border: "none",
        borderRadius: shapeConfig.borderRadius,
        "& .MuiDataGrid-cell": {
          borderColor: isDarkMode ? "#333" : "#e0e0e0",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
          borderColor: isDarkMode ? "#333" : "#e0e0e0",
        },
        "& .MuiDataGrid-row": {
          "&:hover": {
            backgroundColor: alpha(isDarkMode ? "#ffffff" : "#000000", 0.04),
          },
        },
      },
    },
  },

  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 48,
        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 500,
        fontSize: "0.875rem",
        minHeight: 48,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: alpha(isDarkMode ? "#ffffff" : "#000000", 0.04),
        },
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: shapeConfig.borderRadiusLg,
        boxShadow: isDarkMode
          ? "0 20px 40px rgba(0,0,0,0.5)"
          : "0 10px 20px rgba(0,0,0,0.2)",
      },
    },
  },

  MuiSnackbar: {
    styleOverrides: {
      root: {
        "& .MuiSnackbarContent-root": {
          borderRadius: shapeConfig.borderRadius,
        },
      },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: shapeConfig.borderRadius,
        "& .MuiAlert-icon": {
          fontSize: "1.25rem",
        },
      },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: isDarkMode ? "#333" : "#333",
        color: "#ffffff",
        fontSize: "0.75rem",
        borderRadius: shapeConfig.borderRadius,
        boxShadow: isDarkMode
          ? "0 4px 8px rgba(0,0,0,0.3)"
          : "0 2px 4px rgba(0,0,0,0.12)",
      },
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: shapeConfig.borderRadius,
        boxShadow: isDarkMode
          ? "0 8px 16px rgba(0,0,0,0.4)"
          : "0 4px 12px rgba(0,0,0,0.15)",
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: shapeConfig.borderRadiusSm,
        margin: "2px 8px",
        "&:hover": {
          backgroundColor: alpha(isDarkMode ? "#ffffff" : "#000000", 0.08),
        },
      },
    },
  },

  MuiSwitch: {
    styleOverrides: {
      root: {
        "& .MuiSwitch-track": {
          borderRadius: 12,
        },
        "& .MuiSwitch-thumb": {
          borderRadius: "50%",
        },
      },
    },
  },

  MuiCheckbox: {
    styleOverrides: {
      root: {
        "&.Mui-checked": {
          color: "#1976d2",
        },
      },
    },
  },

  MuiRadio: {
    styleOverrides: {
      root: {
        "&.Mui-checked": {
          color: "#1976d2",
        },
      },
    },
  },

  MuiSlider: {
    styleOverrides: {
      root: {
        "& .MuiSlider-thumb": {
          "&:hover": {
            boxShadow: `0 0 0 8px ${alpha("#1976d2", 0.16)}`,
          },
        },
      },
    },
  },

  MuiProgressBar: {
    styleOverrides: {
      root: {
        borderRadius: shapeConfig.borderRadius,
        height: 8,
      },
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: shapeConfig.borderRadius,
        height: 8,
      },
    },
  },

  MuiCircularProgress: {
    styleOverrides: {
      root: {
        "& .MuiCircularProgress-circle": {
          strokeLinecap: "round",
        },
      },
    },
  },

  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: isDarkMode ? "#333" : "#f0f0f0",
      },
    },
  },

  MuiBackdrop: {
    styleOverrides: {
      root: {
        backgroundColor: alpha(isDarkMode ? "#000000" : "#000000", 0.5),
        backdropFilter: "blur(4px)",
      },
    },
  },
});

// Enhanced theme creation function
const createMIATheme = (isDarkMode = false) => {
  const baseTheme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",

      // Primary colors
      primary: {
        main: "#1976d2",
        light: "#42a5f5",
        dark: "#1565c0",
        contrastText: "#ffffff",
      },

      // Secondary colors
      secondary: {
        main: vietnameseColors.gold,
        light: "#fff350",
        dark: "#c9b037",
        contrastText: "#000000",
      },

      // Status colors
      error: {
        main: vietnameseColors.red,
        light: "#ff5983",
        dark: "#a7001a",
        contrastText: "#ffffff",
      },
      warning: {
        main: "#ff9800",
        light: "#ffb74d",
        dark: "#f57c00",
        contrastText: "#ffffff",
      },
      info: {
        main: vietnameseColors.blue,
        light: "#4fc3f7",
        dark: "#0277bd",
        contrastText: "#ffffff",
      },
      success: {
        main: vietnameseColors.green,
        light: "#81c784",
        dark: "#388e3c",
        contrastText: "#ffffff",
      },

      // Background colors
      background: {
        default: isDarkMode ? "#121212" : "#f5f5f5",
        paper: isDarkMode ? "#1e1e1e" : "#ffffff",
      },

      // Text colors
      text: {
        primary: isDarkMode ? "#ffffff" : "#212121",
        secondary: isDarkMode ? "#aaaaaa" : "#757575",
      },

      // Divider color
      divider: isDarkMode ? "#333333" : "#e0e0e0",

      // Custom logistics colors
      logistics: logisticsColors,

      // Custom status colors
      status: statusColors,

      // Custom Vietnamese colors
      vietnamese: vietnameseColors,
    },

    // Enhanced typography
    typography: typographyConfig,

    // Enhanced shape configuration
    shape: shapeConfig,

    // Enhanced spacing
    spacing: spacingConfig,

    // Enhanced breakpoints
    breakpoints: breakpoints,

    // Enhanced shadows
    shadows: isDarkMode ? darkShadowsConfig : shadowsConfig,

    // Enhanced components
    components: getComponentStyles(isDarkMode),
  });

  // Add custom theme extensions
  baseTheme.custom = {
    // Custom breakpoints
    breakpoints: {
      xs: "0px",
      sm: "600px",
      md: "960px",
      lg: "1280px",
      xl: "1920px",
      xxl: "2560px",
    },

    // Custom spacing scale
    spacing: {
      xs: "0.25rem", // 4px
      sm: "0.5rem", // 8px
      md: "1rem", // 16px
      lg: "1.5rem", // 24px
      xl: "2rem", // 32px
      xxl: "3rem", // 48px
    },

    // Custom border radius scale
    borderRadius: {
      xs: "2px",
      sm: "4px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      round: "50%",
    },

    // Custom shadows scale
    shadows: {
      sm: isDarkMode
        ? "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)"
        : "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
      md: isDarkMode
        ? "0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)"
        : "0 2px 6px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.12)",
      lg: isDarkMode
        ? "0 8px 16px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3)"
        : "0 4px 12px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.12)",
      xl: isDarkMode
        ? "0 16px 32px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4)"
        : "0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.12)",
    },

    // Custom transitions
    transitions: {
      fast: "0.15s ease-in-out",
      normal: "0.25s ease-in-out",
      slow: "0.35s ease-in-out",
    },

    // Custom z-index scale
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
      toast: 1080,
    },
  };

  return baseTheme;
};

// Enhanced theme utility functions
export const getThemeColor = (theme, colorPath) => {
  const paths = colorPath.split(".");
  let color = theme.palette;

  for (const path of paths) {
    color = color[path];
    if (!color) return undefined;
  }

  return color;
};

export const getThemeSpacing = (theme, factor) => {
  return theme.spacing(factor);
};

export const getThemeBreakpoint = (theme, breakpoint) => {
  return theme.breakpoints.values[breakpoint];
};

export const getThemeShadow = (theme, elevation) => {
  return theme.shadows[elevation];
};

export const getThemeBorderRadius = (theme, size = "md") => {
  return theme.custom.borderRadius[size];
};

export const getThemeTransition = (theme, speed = "normal") => {
  return theme.custom.transitions[speed];
};

export const getThemeZIndex = (theme, level) => {
  return theme.custom.zIndex[level];
};

// Enhanced theme variants
export const createLightTheme = () => createMIATheme(false);
export const createDarkTheme = () => createMIATheme(true);

// Enhanced theme context helpers
export const getThemeMode = (theme) => theme.palette.mode;
export const isDarkMode = (theme) => theme.palette.mode === "dark";
export const isLightMode = (theme) => theme.palette.mode === "light";

// Enhanced theme color helpers
export const getPrimaryColor = (theme) => theme.palette.primary.main;
export const getSecondaryColor = (theme) => theme.palette.secondary.main;
export const getSuccessColor = (theme) => theme.palette.success.main;
export const getWarningColor = (theme) => theme.palette.warning.main;
export const getErrorColor = (theme) => theme.palette.error.main;
export const getInfoColor = (theme) => theme.palette.info.main;

// Enhanced logistics color helpers
export const getTransportColor = (theme) =>
  theme.palette.logistics.transport.main;
export const getWarehouseColor = (theme) =>
  theme.palette.logistics.warehouse.main;
export const getStaffColor = (theme) => theme.palette.logistics.staff.main;
export const getPartnerColor = (theme) => theme.palette.logistics.partner.main;
export const getUrgentColor = (theme) => theme.palette.logistics.urgent.main;
export const getCompletedColor = (theme) =>
  theme.palette.logistics.completed.main;
export const getPendingColor = (theme) => theme.palette.logistics.pending.main;
export const getCancelledColor = (theme) =>
  theme.palette.logistics.cancelled.main;

// Enhanced status color helpers
export const getOnlineColor = (theme) => theme.palette.status.online;
export const getOfflineColor = (theme) => theme.palette.status.offline;
export const getBusyColor = (theme) => theme.palette.status.busy;
export const getAwayColor = (theme) => theme.palette.status.away;
export const getMaintenanceColor = (theme) => theme.palette.status.maintenance;

// Enhanced Vietnamese color helpers
export const getVietnameseRed = (theme) => theme.palette.vietnamese.red;
export const getVietnameseGold = (theme) => theme.palette.vietnamese.gold;
export const getVietnameseGreen = (theme) => theme.palette.vietnamese.green;
export const getVietnameseBlue = (theme) => theme.palette.vietnamese.blue;
export const getVietnameseBrown = (theme) => theme.palette.vietnamese.brown;

// Enhanced theme responsive helpers
export const getResponsiveValue = (theme, values) => {
  const breakpoints = ["xs", "sm", "md", "lg", "xl", "xxl"];
  const currentBreakpoint = theme.breakpoints.values;

  for (let i = breakpoints.length - 1; i >= 0; i--) {
    const breakpoint = breakpoints[i];
    if (
      values[breakpoint] &&
      window.innerWidth >= currentBreakpoint[breakpoint]
    ) {
      return values[breakpoint];
    }
  }

  return (
    values.xs || values.sm || values.md || values.lg || values.xl || values.xxl
  );
};

// Enhanced theme animation helpers
export const getThemeAnimation = (theme, animation) => {
  const animations = {
    fadeIn: "fadeIn 0.3s ease-in-out",
    fadeOut: "fadeOut 0.3s ease-in-out",
    slideInLeft: "slideInLeft 0.3s ease-in-out",
    slideInRight: "slideInRight 0.3s ease-in-out",
    slideInUp: "slideInUp 0.3s ease-in-out",
    slideInDown: "slideInDown 0.3s ease-in-out",
    scaleIn: "scaleIn 0.3s ease-in-out",
    pulse: "pulse 2s infinite",
    bounce: "bounce 1s infinite",
    spin: "spin 1s linear infinite",
  };

  return animations[animation] || animations.fadeIn;
};

// Enhanced theme utility mixins
export const createResponsiveStyle = (theme, styles) => {
  const breakpoints = ["xs", "sm", "md", "lg", "xl", "xxl"];
  const responsiveStyles = {};

  breakpoints.forEach((breakpoint) => {
    if (styles[breakpoint]) {
      if (breakpoint === "xs") {
        Object.assign(responsiveStyles, styles[breakpoint]);
      } else {
        responsiveStyles[theme.breakpoints.up(breakpoint)] = styles[breakpoint];
      }
    }
  });

  return responsiveStyles;
};

// Enhanced theme color utilities
export const createColorPalette = (baseColor) => ({
  50: alpha(baseColor, 0.05),
  100: alpha(baseColor, 0.1),
  200: alpha(baseColor, 0.2),
  300: alpha(baseColor, 0.3),
  400: alpha(baseColor, 0.4),
  500: baseColor,
  600: alpha(baseColor, 0.6),
  700: alpha(baseColor, 0.7),
  800: alpha(baseColor, 0.8),
  900: alpha(baseColor, 0.9),
});

// Enhanced theme export
export default createMIATheme;
