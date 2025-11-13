const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Setup Proxy for Development
 * Proxy API requests từ frontend (port 3000) đến backend (port 5050)
 * Giúp tránh CORS issues trong development
 */
module.exports = function (app) {
  const backendUrl =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    'http://localhost:5050';

  app.use(
    '/api',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      // Timeout settings
      timeout: 60000, // 60 seconds - tăng timeout để tránh 504
      proxyTimeout: 60000, // 60 seconds
      // Khi mount tại '/api', Express sẽ match '/api/*' và strip '/api' prefix
      // Frontend request: /api/auth/login
      // Express match: /api -> strip -> req.path = /auth/login
      // Proxy forward: /auth/login (thiếu /api)
      // Backend expect: /api/auth/login
      // Cần thêm lại '/api' prefix bằng pathRewrite
      // pathRewrite chạy trên req.path (đã strip /api), nên cần match từ đầu
      pathRewrite: {
        '^/': '/api/', // Thêm /api/ prefix vào đầu path
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests trong development
        if (process.env.NODE_ENV === 'development') {
          const targetPath = `${backendUrl}${req.url}`;
          console.log(`[Proxy] ${req.method} ${req.url} -> ${targetPath}`);
          console.log(
            `[Proxy] Original URL: ${req.originalUrl}, Path: ${req.path}`
          );
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log response trong development
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Proxy Response] ${req.method} ${req.url} -> Status: ${proxyRes.statusCode}`
          );
        }
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err.message);
        console.error('[Proxy Error] Request URL:', req.url);
        console.error('[Proxy Error] Original URL:', req.originalUrl);
        res.status(500).json({
          error: 'Proxy error',
          message: err.message,
        });
      },
    })
  );
};
