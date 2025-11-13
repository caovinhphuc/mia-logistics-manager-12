/**
 * Test để hiểu cách http-proxy-middleware hoạt động
 */
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');

const app = express();
const backendUrl = 'http://localhost:5050';

// Test 1: Mount tại /api với pathRewrite
app.use(
  '/api',
  createProxyMiddleware({
    target: backendUrl,
    pathRewrite: {
      '^/api': '/api', // Thêm lại /api
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('Request path:', req.path);
      console.log('Request url:', req.url);
      console.log('ProxyReq path:', proxyReq.path);
    },
  })
);

console.log('Proxy setup:');
console.log('- Mount tại: /api');
console.log('- pathRewrite: ^/api -> /api');
console.log('- Test request: /api/auth/login');
console.log('- Expected forward: /api/auth/login');
