import { createContext, useContext, useEffect, useReducer } from "react";
import createMIATheme from "../styles/theme";
import {
  getSystemThemePreference,
  listenToSystemTheme,
  updateBrowserTheme,
} from "../utils/browserTheme";

// Theme state structure
const initialState = {
  isDarkMode: false,
  primaryColor: "#1976d2",
  customizations: {
    borderRadius: 8,
    fontFamily: "Roboto",
    compactMode: false,
  },
};

// Theme actions
const THEME_ACTIONS = {
  TOGGLE_DARK_MODE: "TOGGLE_DARK_MODE",
  SET_DARK_MODE: "SET_DARK_MODE",
  SET_PRIMARY_COLOR: "SET_PRIMARY_COLOR",
  UPDATE_CUSTOMIZATIONS: "UPDATE_CUSTOMIZATIONS",
  RESET_THEME: "RESET_THEME",
};

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.TOGGLE_DARK_MODE:
      return { ...state, isDarkMode: !state.isDarkMode };

    case THEME_ACTIONS.SET_DARK_MODE:
      return { ...state, isDarkMode: action.payload };

    case THEME_ACTIONS.SET_PRIMARY_COLOR:
      return { ...state, primaryColor: action.payload };

    case THEME_ACTIONS.UPDATE_CUSTOMIZATIONS:
      return {
        ...state,
        customizations: { ...state.customizations, ...action.payload },
      };

    case THEME_ACTIONS.RESET_THEME:
      return initialState;

    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("mia-theme");
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        dispatch({
          type: THEME_ACTIONS.SET_DARK_MODE,
          payload: parsed.isDarkMode,
        });
        if (parsed.primaryColor) {
          dispatch({
            type: THEME_ACTIONS.SET_PRIMARY_COLOR,
            payload: parsed.primaryColor,
          });
        }
        if (parsed.customizations) {
          dispatch({
            type: THEME_ACTIONS.UPDATE_CUSTOMIZATIONS,
            payload: parsed.customizations,
          });
        }
      } catch (error) {
        console.warn("Failed to load theme from localStorage:", error);
      }
    } else {
      // If no saved theme, check system preference
      const systemPrefersDark = getSystemThemePreference();
      if (systemPrefersDark) {
        dispatch({
          type: THEME_ACTIONS.SET_DARK_MODE,
          payload: true,
        });
      }
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const cleanup = listenToSystemTheme((systemIsDark) => {
      // Only update if user hasn't set a manual preference
      const hasManualPreference = localStorage.getItem("mia-theme");
      if (!hasManualPreference) {
        dispatch({
          type: THEME_ACTIONS.SET_DARK_MODE,
          payload: systemIsDark,
        });
      }
    });

    return cleanup;
  }, []);

  // Save theme to localStorage and update browser theme when it changes
  useEffect(() => {
    localStorage.setItem("mia-theme", JSON.stringify(state));

    // Update CSS custom properties
    document.documentElement.setAttribute(
      "data-theme",
      state.isDarkMode ? "dark" : "light",
    );
    document.documentElement.style.setProperty(
      "--primary-color",
      state.primaryColor,
    );

    // Update browser native theme (status bar, PWA theme, etc.)
    updateBrowserTheme(state.isDarkMode, state.primaryColor);
  }, [state]);

  const toggleDarkMode = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_DARK_MODE });
  };

  const setDarkMode = (isDark) => {
    dispatch({ type: THEME_ACTIONS.SET_DARK_MODE, payload: isDark });
  };

  const setPrimaryColor = (color) => {
    dispatch({ type: THEME_ACTIONS.SET_PRIMARY_COLOR, payload: color });
  };

  const updateCustomizations = (customizations) => {
    dispatch({
      type: THEME_ACTIONS.UPDATE_CUSTOMIZATIONS,
      payload: customizations,
    });
  };

  const resetTheme = () => {
    dispatch({ type: THEME_ACTIONS.RESET_THEME });
  };

  // Create MUI theme based on current state
  const muiTheme =
    typeof createMIATheme === "function"
      ? createMIATheme(state.isDarkMode)
      : createMIATheme;

  const contextValue = {
    ...state,
    toggleDarkMode,
    setDarkMode,
    setPrimaryColor,
    updateCustomizations,
    resetTheme,
    muiTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};

export default ThemeContext;
