/**
 * 🎨 THEME UTILITY FOR BROWSER INTEGRATION
 * Manages native browser theming (status bar, PWA theme, etc.)
 * Integrates with React theme context
 */

/**
 * Update browser native theme elements
 * @param {boolean} isDark - Whether dark mode is active
 * @param {string} primaryColor - Primary theme color
 */
export const updateBrowserTheme = (
  isDark = false,
  primaryColor = "#1976d2",
) => {
  if (typeof window === "undefined") return;

  const darkColor = "#121212";
  const lightColor = primaryColor;
  const currentColor = isDark ? darkColor : lightColor;

  // Dispatch custom event for index.html listener
  window.dispatchEvent(
    new CustomEvent("themeChanged", {
      detail: {
        isDark,
        primaryColor: currentColor,
        backgroundColor: isDark ? "#121212" : "#ffffff",
      },
    }),
  );
};

/**
 * Get current system theme preference
 * @returns {boolean} True if system prefers dark mode
 */
export const getSystemThemePreference = () => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Listen for system theme changes
 * @param {Function} callback - Callback function when theme changes
 * @returns {Function} Cleanup function
 */
export const listenToSystemTheme = (callback) => {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = (e) => {
    callback(e.matches);
  };

  mediaQuery.addListener(handleChange);

  // Return cleanup function
  return () => {
    mediaQuery.removeListener(handleChange);
  };
};

/**
 * Update PWA display mode based on theme
 * @param {boolean} isDark - Whether dark mode is active
 */
export const updatePWATheme = (isDark) => {
  if (typeof window === "undefined") return;

  // Update manifest theme dynamically (if supported by browser)
  try {
    const link = document.querySelector('link[rel="manifest"]');
    if (link) {
      // Create dynamic manifest with updated theme
      const manifestUrl = link.href;
      fetch(manifestUrl)
        .then((response) => response.json())
        .then((manifest) => {
          const updatedManifest = {
            ...manifest,
            theme_color: isDark ? "#121212" : "#1976d2",
            background_color: isDark ? "#121212" : "#ffffff",
          };

          const blob = new Blob([JSON.stringify(updatedManifest)], {
            type: "application/json",
          });
          const newManifestUrl = URL.createObjectURL(blob);

          link.href = newManifestUrl;
        })
        .catch((error) => {
          console.warn("Failed to update PWA manifest:", error);
        });
    }
  } catch (error) {
    console.warn("PWA manifest update not supported:", error);
  }
};

/**
 * React hook for browser theme integration
 * @param {boolean} isDark - Current dark mode state
 * @param {string} primaryColor - Primary theme color
 */
export const useBrowserTheme = (isDark, primaryColor = "#1976d2") => {
  const { useEffect } = require("react");

  useEffect(() => {
    updateBrowserTheme(isDark, primaryColor);
    updatePWATheme(isDark);
  }, [isDark, primaryColor]);

  useEffect(() => {
    // Listen for system theme changes
    const cleanup = listenToSystemTheme((systemIsDark) => {
      // Only update if user hasn't set a preference
      const hasUserPreference = localStorage.getItem("mia-theme");
      if (!hasUserPreference) {
        updateBrowserTheme(systemIsDark, primaryColor);
      }
    });

    return cleanup;
  }, [primaryColor]);
};

/**
 * Initialize theme on app startup
 */
export const initializeAppTheme = () => {
  const savedTheme = localStorage.getItem("mia-theme");
  const systemPrefersDark = getSystemThemePreference();

  const shouldUseDark = savedTheme ? savedTheme === "dark" : systemPrefersDark;

  updateBrowserTheme(shouldUseDark);
  updatePWATheme(shouldUseDark);

  return shouldUseDark;
};
