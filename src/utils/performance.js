// Performance Optimization Configuration
export const PERFORMANCE_CONFIG = {
  // Image optimization
  IMAGE_OPTIMIZATION: {
    ENABLED: true,
    QUALITY: 80,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
    FORMATS: ["webp", "jpeg", "png"],
  },

  // Code splitting
  CODE_SPLITTING: {
    ENABLED: true,
    CHUNK_SIZE_LIMIT: 244000, // 244KB
    MAX_CHUNKS: 10,
  },

  // Caching
  CACHING: {
    STATIC_ASSETS: "1y",
    HTML_FILES: "0",
    API_RESPONSES: "5m",
  },

  // Lazy loading
  LAZY_LOADING: {
    ENABLED: true,
    THRESHOLD: 0.1,
    ROOT_MARGIN: "50px",
  },

  // Preloading
  PRELOADING: {
    ENABLED: true,
    CRITICAL_ROUTES: ["/dashboard", "/transport", "/warehouse"],
  },
};

// Performance optimization utilities
export const optimizeImage = (src, options = {}) => {
  const {
    quality = PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.QUALITY,
    width = PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.MAX_WIDTH,
    height = PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.MAX_HEIGHT,
  } = options;

  // If using a CDN or image optimization service
  if (src.includes("googleapis.com") || src.includes("gstatic.com")) {
    return `${src}?w=${width}&h=${height}&q=${quality}`;
  }

  return src;
};

// Lazy loading hook
export const useLazyLoading = (ref, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold:
          options.threshold || PERFORMANCE_CONFIG.LAZY_LOADING.THRESHOLD,
        rootMargin:
          options.rootMargin || PERFORMANCE_CONFIG.LAZY_LOADING.ROOT_MARGIN,
      },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();

      // Track performance metric
      if (window.gtag) {
        window.gtag("event", "performance", {
          event_category: "Performance",
          event_label: name,
          value: Math.round(end - start),
        });
      }

      return result;
    } catch (error) {
      const end = performance.now();

      // Track error performance
      if (window.gtag) {
        window.gtag("event", "performance_error", {
          event_category: "Performance",
          event_label: name,
          value: Math.round(end - start),
        });
      }

      throw error;
    }
  };
};
