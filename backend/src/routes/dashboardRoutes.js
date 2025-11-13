const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService');
const { getAllRecords } = require('../utils/googleSheetsHelpers');

/**
 * Dashboard Routes
 * Cung cấp dữ liệu tổng quan cho Dashboard
 */

// Sheet names
const CARRIERS_SHEET = 'Carriers';
const TRANSFERS_SHEET = 'Transfers';
const TRANSPORT_REQUESTS_SHEET = 'TransportRequests';
const LOCATIONS_SHEET = 'Locations';
const INBOUND_DOMESTIC_SHEET = 'InboundDomestic';
const INBOUND_INTERNATIONAL_SHEET = 'InboundInternational';

/**
 * GET /api/dashboard/stats
 * Lấy thống kê tổng quan cho Dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    // Lấy dữ liệu từ các sheets song song
    const [
      carriers,
      transfers,
      transportRequests,
      inboundDomestic,
      inboundInternational,
    ] = await Promise.allSettled([
      googleSheetsService.getCarriers().catch(() => []),
      getAllRecords(TRANSFERS_SHEET).catch(() => []),
      getAllRecords(TRANSPORT_REQUESTS_SHEET).catch(() => []),
      getAllRecords(INBOUND_DOMESTIC_SHEET).catch(() => []),
      getAllRecords(INBOUND_INTERNATIONAL_SHEET).catch(() => []),
    ]);

    const carriersData = carriers.status === 'fulfilled' ? carriers.value : [];
    const transfersData =
      transfers.status === 'fulfilled' ? transfers.value : [];
    const requestsData =
      transportRequests.status === 'fulfilled' ? transportRequests.value : [];
    const domesticData =
      inboundDomestic.status === 'fulfilled' ? inboundDomestic.value : [];
    const internationalData =
      inboundInternational.status === 'fulfilled'
        ? inboundInternational.value
        : [];

    // Tính toán statistics
    const totalTransports = transfersData.length;
    const activeTransports = transfersData.filter(
      (t) =>
        t.state?.toLowerCase() === 'active' ||
        t.transportStatus?.toLowerCase() === 'in_progress' ||
        t.status?.toLowerCase() === 'active'
    ).length;
    const completedTransports = transfersData.filter(
      (t) =>
        t.state?.toLowerCase() === 'completed' ||
        t.transportStatus?.toLowerCase() === 'completed' ||
        t.status?.toLowerCase() === 'completed'
    ).length;

    // Tính tổng số items trong kho (domestic + international)
    const totalWarehouseItems = domesticData.length + internationalData.length;

    // Tính số carriers active
    const activeCarriers = carriersData.filter(
      (c) =>
        c.isActive === true ||
        c.isActive === 'true' ||
        c.isActive === 'TRUE' ||
        String(c.isActive).toLowerCase() === 'true'
    ).length;

    // Tính số requests pending
    const pendingRequests = requestsData.filter(
      (r) =>
        r.status?.toLowerCase() === 'pending' ||
        r.state?.toLowerCase() === 'pending'
    ).length;

    // Tính phần trăm thay đổi (mock - có thể tính từ dữ liệu lịch sử)
    const transportChange = totalTransports > 0 ? '+12%' : '0%';
    const activeChange = activeTransports > 0 ? '+5%' : '0%';
    const completedChange = completedTransports > 0 ? '+8%' : '0%';
    const warehouseChange = totalWarehouseItems > 0 ? '+3%' : '0%';

    const stats = {
      totalTransports: {
        value: totalTransports,
        change: transportChange,
        label: 'Tổng vận chuyển',
      },
      activeTransports: {
        value: activeTransports,
        change: activeChange,
        label: 'Vận chuyển đang hoạt động',
      },
      completedTransports: {
        value: completedTransports,
        change: completedChange,
        label: 'Vận chuyển đã hoàn thành',
      },
      warehouseItems: {
        value: totalWarehouseItems,
        change: warehouseChange,
        label: 'Tổng số hàng trong kho',
      },
      activeCarriers: {
        value: activeCarriers,
        change: '+0%',
        label: 'Nhà vận chuyển đang hoạt động',
      },
      pendingRequests: {
        value: pendingRequests,
        change: '+0%',
        label: 'Đề nghị chờ xử lý',
      },
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ GET /api/dashboard/stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dashboard stats',
    });
  }
});

/**
 * GET /api/dashboard/activities
 * Lấy danh sách hoạt động gần đây
 */
router.get('/activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    // Lấy dữ liệu từ các sheets
    const [transfers, requests, inboundDomestic, inboundInternational] =
      await Promise.allSettled([
        getAllRecords(TRANSFERS_SHEET).catch(() => []),
        getAllRecords(TRANSPORT_REQUESTS_SHEET).catch(() => []),
        getAllRecords(INBOUND_DOMESTIC_SHEET).catch(() => []),
        getAllRecords(INBOUND_INTERNATIONAL_SHEET).catch(() => []),
      ]);

    const transfersData =
      transfers.status === 'fulfilled' ? transfers.value : [];
    const requestsData = requests.status === 'fulfilled' ? requests.value : [];
    const domesticData =
      inboundDomestic.status === 'fulfilled' ? inboundDomestic.value : [];
    const internationalData =
      inboundInternational.status === 'fulfilled'
        ? inboundInternational.value
        : [];

    // Tạo activities từ các nguồn dữ liệu
    const activities = [];

    // Activities từ transfers
    transfersData.slice(0, 5).forEach((transfer) => {
      activities.push({
        id: `transfer-${transfer.transfer_id || transfer.id || Date.now()}`,
        type: 'transport',
        title: `Vận chuyển ${transfer.orderCode || transfer.transfer_id || 'N/A'} đã ${
          transfer.state === 'completed' ? 'hoàn thành' : 'cập nhật'
        }`,
        time: transfer.date || transfer.updatedAt || new Date().toISOString(),
        status: transfer.state === 'completed' ? 'completed' : 'info',
        data: transfer,
      });
    });

    // Activities từ requests
    requestsData.slice(0, 3).forEach((request) => {
      activities.push({
        id: `request-${request.id || request.requestId || Date.now()}`,
        type: 'request',
        title: `Đề nghị vận chuyển ${request.id || request.requestId || 'N/A'} ${
          request.status === 'approved' ? 'đã được phê duyệt' : 'đang chờ xử lý'
        }`,
        time: request.createdAt || request.date || new Date().toISOString(),
        status: request.status === 'approved' ? 'success' : 'pending',
        data: request,
      });
    });

    // Activities từ warehouse (inbound)
    [...domesticData.slice(0, 2), ...internationalData.slice(0, 2)].forEach(
      (item) => {
        activities.push({
          id: `warehouse-${item.id || Date.now()}`,
          type: 'warehouse',
          title: `Nhập kho ${item.quantity || 0} ${item.product || 'hàng hóa'}`,
          time: item.date || item.receiveTime || new Date().toISOString(),
          status: 'success',
          data: item,
        });
      }
    );

    // Sắp xếp theo thời gian (mới nhất trước)
    activities.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA;
    });

    // Pagination
    const paginatedActivities = activities.slice(offset, offset + limit);

    res.json({
      success: true,
      data: paginatedActivities,
      total: activities.length,
      limit,
      offset,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ GET /api/dashboard/activities error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch activities',
    });
  }
});

/**
 * GET /api/dashboard/transport-summary
 * Lấy tóm tắt vận chuyển
 */
router.get('/transport-summary', async (req, res) => {
  try {
    const [transfers, requests, carriers] = await Promise.allSettled([
      getAllRecords(TRANSFERS_SHEET).catch(() => []),
      getAllRecords(TRANSPORT_REQUESTS_SHEET).catch(() => []),
      googleSheetsService.getCarriers().catch(() => []),
    ]);

    const transfersData =
      transfers.status === 'fulfilled' ? transfers.value : [];
    const requestsData = requests.status === 'fulfilled' ? requests.value : [];
    const carriersData = carriers.status === 'fulfilled' ? carriers.value : [];

    // Phân loại theo trạng thái
    const byStatus = {
      pending: transfersData.filter(
        (t) =>
          t.state?.toLowerCase() === 'pending' ||
          t.transportStatus?.toLowerCase() === 'pending'
      ).length,
      inProgress: transfersData.filter(
        (t) =>
          t.state?.toLowerCase() === 'in_progress' ||
          t.transportStatus?.toLowerCase() === 'in_progress' ||
          t.state?.toLowerCase() === 'active'
      ).length,
      completed: transfersData.filter(
        (t) =>
          t.state?.toLowerCase() === 'completed' ||
          t.transportStatus?.toLowerCase() === 'completed'
      ).length,
      cancelled: transfersData.filter(
        (t) =>
          t.state?.toLowerCase() === 'cancelled' ||
          t.transportStatus?.toLowerCase() === 'cancelled'
      ).length,
    };

    // Phân loại theo carrier
    const byCarrier = {};
    transfersData.forEach((transfer) => {
      const carrierName = transfer.carrier || transfer.carrierName || 'Unknown';
      byCarrier[carrierName] = (byCarrier[carrierName] || 0) + 1;
    });

    const summary = {
      total: transfersData.length,
      byStatus,
      byCarrier,
      pendingRequests: requestsData.filter(
        (r) => r.status?.toLowerCase() === 'pending'
      ).length,
      activeCarriers: carriersData.filter(
        (c) =>
          c.isActive === true ||
          c.isActive === 'true' ||
          String(c.isActive).toLowerCase() === 'true'
      ).length,
    };

    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ GET /api/dashboard/transport-summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transport summary',
    });
  }
});

/**
 * GET /api/dashboard/warehouse-summary
 * Lấy tóm tắt kho
 */
router.get('/warehouse-summary', async (req, res) => {
  try {
    const [domestic, international] = await Promise.allSettled([
      getAllRecords(INBOUND_DOMESTIC_SHEET).catch(() => []),
      getAllRecords(INBOUND_INTERNATIONAL_SHEET).catch(() => []),
    ]);

    const domesticData = domestic.status === 'fulfilled' ? domestic.value : [];
    const internationalData =
      international.status === 'fulfilled' ? international.value : [];

    // Tính tổng quantity
    const totalQuantity =
      domesticData.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0);
      }, 0) +
      internationalData.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0);
      }, 0);

    // Tính tổng giá trị (nếu có)
    const totalValue =
      domesticData.reduce((sum, item) => {
        return sum + (Number(item.value) || Number(item.totalValue) || 0);
      }, 0) +
      internationalData.reduce((sum, item) => {
        return sum + (Number(item.value) || Number(item.totalValue) || 0);
      }, 0);

    // Phân loại theo status
    const byStatus = {
      pending: [
        ...domesticData.filter((i) => i.status?.toLowerCase() === 'pending'),
        ...internationalData.filter(
          (i) => i.status?.toLowerCase() === 'pending'
        ),
      ].length,
      received: [
        ...domesticData.filter((i) => i.status?.toLowerCase() === 'received'),
        ...internationalData.filter(
          (i) => i.status?.toLowerCase() === 'received'
        ),
      ].length,
      inTransit: [
        ...domesticData.filter((i) => i.status?.toLowerCase() === 'in_transit'),
        ...internationalData.filter(
          (i) => i.status?.toLowerCase() === 'in_transit'
        ),
      ].length,
    };

    const summary = {
      totalItems: domesticData.length + internationalData.length,
      totalQuantity,
      totalValue,
      byStatus,
      domestic: {
        count: domesticData.length,
        quantity: domesticData.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        ),
      },
      international: {
        count: internationalData.length,
        quantity: internationalData.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        ),
      },
    };

    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ GET /api/dashboard/warehouse-summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch warehouse summary',
    });
  }
});

module.exports = router;
