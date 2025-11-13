// backend/src/routes/router.js
// Main router file - Tổng hợp tất cả routes của MIA Logistics Manager

const express = require('express');
const router = express.Router();

// Import all route modules
const carriersRoutes = require('./carriersRoutes');
const transfersRoutes = require('./transfersRoutes');
const locationsRoutes = require('./locationsRoutes');
const transportRequestsRoutes = require('./transportRequestsRoutes');
const settingsRoutes = require('./settingsRoutes');
const telegramRoutes = require('./telegramRoutes');
const googleSheetsRoutes = require('./googleSheetsRoutes');
const inboundDomesticRoutes = require('./inboundDomesticRoutes');
const inboundInternationalRoutes = require('./inboundInternationalRoutes');
const authRoutes = require('./authRoutes');
const rolesRoutes = require('./rolesRoutes');
const employeesRoutes = require('./employeesRoutes');
const rolePermissionsRoutes = require('./rolePermissionsRoutes');
const adminRoutes = require('./adminRoutes');
const googleSheetsAuthRoutes = require('./googleSheetsAuthRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Register all routes
router.use('/carriers', carriersRoutes);
router.use('/transfers', transfersRoutes);
router.use('/locations', locationsRoutes);
router.use('/transport-requests', transportRequestsRoutes);
router.use('/settings', settingsRoutes);
router.use('/telegram', telegramRoutes);
router.use('/sheets', googleSheetsRoutes);
router.use('/inbound/domestic', inboundDomesticRoutes);
router.use('/inbound/international', inboundInternationalRoutes);
router.use('/auth', authRoutes);
router.use('/roles', rolesRoutes);
router.use('/employees', employeesRoutes);
router.use('/role-permissions', rolePermissionsRoutes);
router.use('/admin', adminRoutes);
router.use('/google-sheets-auth', googleSheetsAuthRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'MIA Logistics Manager API is running',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    service: 'MIA Logistics Manager API',
    environment: process.env.NODE_ENV || 'development',
    routes: {
      total: 17,
      endpoints: '55+',
      modules: [
        'auth',
        'admin',
        'carriers',
        'transfers',
        'locations',
        'transport-requests',
        'employees',
        'roles',
        'role-permissions',
        'settings',
        'telegram',
        'sheets',
        'inbound/domestic',
        'inbound/international',
        'google-sheets-auth',
        'dashboard',
      ],
    },
  });
});

module.exports = router;
