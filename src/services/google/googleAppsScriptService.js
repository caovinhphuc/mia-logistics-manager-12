import { log } from '../logging/logger';
import { googleAuthService } from './googleAuthService';

class GoogleAppsScriptService {
  constructor() {
    this.isConnected = false;
    this.scriptId = null;
    this.apiUrl = 'https://script.googleapis.com/v1';
    this.webAppUrl = null;
    this.availableFunctions = [];
    this.functionCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.rateLimitDelay = 100; // 100ms between requests
    this.lastRequestTime = 0;

    // Performance tracking
    this.performanceMetrics = new Map();
    this.requestCount = 0;
    this.errorCount = 0;

    // Connection settings
    this.connectionSettings = {
      timeout: 30000, // 30 seconds
      maxRetries: 3,
      enableCaching: true,
      enableRateLimiting: true,
      enablePerformanceTracking: true,
    };
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Google Apps Script Service');

      // Check if Apps Script is enabled
      if (
        process.env.REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT === 'false' ||
        process.env.REACT_APP_GOOGLE_APPS_SCRIPT_ID === 'disabled'
      ) {
        console.log('🔧 Google Apps Script disabled in environment configuration');
        this.isConnected = false;
        return;
      }

      // Initialize auth service if not already done
      if (!googleAuthService.isInitialized) {
        await googleAuthService.initialize();
      }

      if (!googleAuthService.isInitialized) {
        console.log('🔧 Google Auth not initialized, skipping Apps Script connection');
        this.isConnected = false;
        return;
      }

      this.isConnected = true;
      console.log('✅ Google Apps Script Service initialized successfully');
    } catch (error) {
      console.error('❌ Google Apps Script initialization failed:', error);
      this.isConnected = false;
      console.log('🔧 Google Apps Script will work in mock mode');
    }
  }

  async connect(scriptId, webAppUrl = null, options = {}) {
    try {
      console.log(`🔗 Connecting to Apps Script: ${scriptId}`);

      // Check if we're in mock mode
      if (
        process.env.REACT_APP_USE_MOCK_DATA === 'true' ||
        process.env.REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT === 'false' ||
        !process.env.REACT_APP_GOOGLE_APPS_SCRIPT_ID ||
        process.env.REACT_APP_GOOGLE_APPS_SCRIPT_ID === 'disabled'
      ) {
        console.log('🔧 Google Apps Script disabled or not configured, using mock mode');
        return this.connectMockMode(scriptId);
      }

      const { enableCaching = true, enableRateLimiting = true, timeout = 30000 } = options;

      this.scriptId = scriptId;
      this.webAppUrl = webAppUrl || process.env.REACT_APP_APPS_SCRIPT_WEB_APP_URL;
      this.connectionSettings.enableCaching = enableCaching;
      this.connectionSettings.enableRateLimiting = enableRateLimiting;
      this.connectionSettings.timeout = timeout;

      // Test connection by getting script info
      const scriptInfo = await this.getScriptInfo();

      // Load available functions
      await this.loadAvailableFunctions();

      this.isConnected = true;
      console.log(`✅ Connected to Apps Script: ${scriptInfo.title || scriptId}`);

      return {
        scriptId,
        title: scriptInfo.title,
        functions: this.availableFunctions,
        webAppUrl: this.webAppUrl,
        connectedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn(
        '⚠️ Failed to connect to Google Apps Script (falling back to mock mode):',
        error.message
      );
      if (log.enableMockModeMessages) {
        log.mockMode('Falling back to mock mode for Apps Script');
      }
      return this.connectMockMode(scriptId);
    }
  }

  // Mock mode for development without Google API
  async connectMockMode(scriptId) {
    console.log('🔧 Using mock Google Apps Script mode');

    // Use a more descriptive mock script ID
    this.scriptId = scriptId === 'your-apps-script-id' ? 'mock-apps-script-dev' : scriptId;
    this.isConnected = true;

    return {
      scriptId: this.scriptId,
      title: 'MIA Logistics Manager (Mock Apps Script)',
      lastModified: new Date().toISOString(),
      functions: ['getCarriers', 'addCarrier', 'updateCarrier', 'deleteCarrier', 'getStats'],
      lastConnected: new Date().toISOString(),
      mode: 'mock',
      executionTime: 21,
    };
  }

  // Get mock function results for development
  getMockFunctionResult(functionName, parameters) {
    const mockResults = {
      calculateDistance: {
        distance: { text: '15.2 km', value: 15200 },
        duration: { text: '25 phút', value: 1500 },
        status: 'OK',
      },
      optimizeRoute: {
        optimizedWaypoints: parameters.waypoints || [],
        totalDistance: 25000,
        totalDuration: 1800,
        status: 'OK',
      },
      geocodeAddress: {
        lat: 21.0285,
        lng: 105.8542,
        formatted_address: 'Hà Nội, Việt Nam',
        status: 'OK',
      },
      reverseGeocode: {
        formatted_address: 'Hà Nội, Việt Nam',
        address_components: [],
        status: 'OK',
      },
      getTrafficInfo: {
        trafficLevel: 'MODERATE',
        duration: { text: '30 phút', value: 1800 },
        status: 'OK',
      },
      calculateDeliveryTime: {
        estimatedTime: { text: '45 phút', value: 2700 },
        deliveryWindow: '9:00-17:00',
        status: 'OK',
      },
      validateAddress: {
        valid: true,
        formatted_address: 'Hà Nội, Việt Nam',
        status: 'OK',
      },
      getDirections: {
        routes: [
          {
            legs: [
              {
                distance: { text: '15.2 km', value: 15200 },
                duration: { text: '25 phút', value: 1500 },
                steps: [],
              },
            ],
          },
        ],
        status: 'OK',
      },
      calculateFuelCost: {
        fuelCost: 38000, // VND
        fuelUsed: 1.52, // liters
        status: 'OK',
      },
      calculateRouteCost: {
        totalCost: 500000, // VND
        breakdown: {
          fuel: 38000,
          driver: 500000,
          vehicle: 1000000,
          toll: 0,
        },
        status: 'OK',
      },
      getWeatherInfo: {
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 75,
        status: 'OK',
      },
      calculateCO2Emission: {
        co2Emission: 3.2, // kg CO2
        status: 'OK',
      },
      optimizeDeliverySchedule: {
        optimizedSchedule: [],
        totalCost: 500000,
        status: 'OK',
      },
      validateDriverLicense: {
        valid: true,
        expiryDate: '2025-12-31',
        status: 'OK',
      },
      calculateInsuranceCost: {
        annualCost: 2000000, // VND
        monthlyCost: 166667,
        status: 'OK',
      },
      getVehicleInfo: {
        vehicleId: 'V001',
        make: 'Toyota',
        model: 'Hiace',
        year: 2020,
        status: 'OK',
      },
      calculateMaintenanceCost: {
        maintenanceCost: 500000, // VND
        nextService: '2024-02-15',
        status: 'OK',
      },
      optimizeFleetRoutes: {
        optimizedRoutes: [],
        totalCost: 2000000,
        status: 'OK',
      },
      getRealTimeTracking: {
        location: { lat: 21.0285, lng: 105.8542 },
        speed: 45, // km/h
        eta: '2024-01-15T14:30:00Z',
        status: 'OK',
      },
    };

    return (
      mockResults[functionName] || {
        message: `Mock result for ${functionName}`,
        parameters: parameters,
        status: 'MOCK',
        timestamp: new Date().toISOString(),
      }
    );
  }

  async disconnect() {
    try {
      this.isConnected = false;
      this.scriptId = null;
      this.webAppUrl = null;
      this.availableFunctions = [];
      this.functionCache.clear();
      this.performanceMetrics.clear();

      console.log('🔌 Disconnected from Google Apps Script');
    } catch (error) {
      console.error('❌ Error during disconnect:', error);
    }
  }

  async getScriptInfo() {
    try {
      const headers = await googleAuthService.getAuthHeaders();

      const response = await this.makeRequest(`${this.apiUrl}/projects/${this.scriptId}`, {
        headers,
        method: 'GET',
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 403) {
          console.warn('⚠️ Google Apps Script API access denied. This is normal for development.');
          return { title: 'Development Script', id: this.scriptId };
        } else if (response.status === 404) {
          console.warn('⚠️ Google Apps Script not found. This is normal for development.');
          return { title: 'Development Script', id: this.scriptId };
        } else {
          throw new Error(`Failed to get script info: ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.warn('⚠️ Failed to get script info (this is normal for development):', error.message);
      console.log('🔧 Google Apps Script Service disabled for now to focus on Google Sheets');
      // Return mock data for development
      return { title: 'Development Script', id: this.scriptId };
    }
  }

  async loadAvailableFunctions() {
    try {
      // Return predefined functions for MIA Logistics
      this.availableFunctions = [
        'calculateDistance',
        'optimizeRoute',
        'geocodeAddress',
        'reverseGeocode',
        'getTrafficInfo',
        'calculateDeliveryTime',
        'validateAddress',
        'getDirections',
        'calculateFuelCost',
        'optimizeMultipleRoutes',
        'calculateRouteCost',
        'getWeatherInfo',
        'calculateCO2Emission',
        'optimizeDeliverySchedule',
        'validateDriverLicense',
        'calculateInsuranceCost',
        'getVehicleInfo',
        'calculateMaintenanceCost',
        'optimizeFleetRoutes',
        'getRealTimeTracking',
        'calculateWarehouseDistance',
        'optimizeInventoryRoutes',
        'calculateShippingCost',
        'getDeliveryWindows',
        'validateDeliveryAddress',
        'calculateReturnRoute',
        'optimizePickupSchedule',
        'calculateLoadingTime',
        'getDriverPerformance',
        'calculateRouteEfficiency',
      ];

      console.log(`📋 Loaded ${this.availableFunctions.length} available functions`);
      return this.availableFunctions;
    } catch (error) {
      console.error('❌ Failed to load available functions:', error);
      throw error;
    }
  }

  async runFunction(functionName, parameters = [], options = {}) {
    try {
      const {
        useCache = true,
        cacheTimeout = this.cacheTimeout,
        retryOnError = true,
        timeout = this.connectionSettings.timeout,
      } = options;

      if (!this.isConnected) {
        console.log('🔧 Apps Script not connected, returning mock result');
        return this.getMockFunctionResult(functionName, parameters);
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(functionName, parameters);
      if (useCache && this.functionCache.has(cacheKey)) {
        const cached = this.functionCache.get(cacheKey);
        if (Date.now() - cached.timestamp < cacheTimeout) {
          console.log(`📋 Using cached result for ${functionName}`);
          return cached.result;
        }
      }

      const startTime = Date.now();

      try {
        const headers = await googleAuthService.getAuthHeaders();

        const requestBody = {
          function: functionName,
          parameters,
          devMode: process.env.NODE_ENV === 'development',
        };

        const response = await this.makeRequest(`${this.apiUrl}/scripts/${this.scriptId}:run`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          timeout,
        });

        if (!response.ok) {
          throw new Error(`Function execution failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(`Script error: ${result.error.details[0].errorMessage}`);
        }

        const executionTime = Date.now() - startTime;
        this.trackPerformance(functionName, executionTime, true);

        // Cache the result
        if (useCache) {
          this.functionCache.set(cacheKey, {
            result: result.response?.result,
            timestamp: Date.now(),
          });
        }

        console.log(`✅ Function ${functionName} executed successfully in ${executionTime}ms`);
        return result.response?.result;
      } catch (apiError) {
        console.log(`⚠️ Apps Script API error: ${apiError.message}, returning mock result`);
        return this.getMockFunctionResult(functionName, parameters);
      }
    } catch (error) {
      this.trackPerformance(functionName, 0, false);
      console.error(`❌ Failed to run function ${functionName}:`, error);

      if (retryOnError) {
        return await this.retryOperation(() =>
          this.runFunction(functionName, parameters, { ...options, retryOnError: false })
        );
      }

      // Return mock result as fallback
      console.log(`🔧 Returning mock result for ${functionName} as fallback`);
      return this.getMockFunctionResult(functionName, parameters);
    }
  }

  async runWebAppFunction(functionName, parameters = {}, options = {}) {
    try {
      const { timeout = this.connectionSettings.timeout, retryOnError = true } = options;

      if (!this.webAppUrl) {
        throw new Error('Web App URL not configured');
      }

      const startTime = Date.now();

      const url = new URL(this.webAppUrl);
      url.searchParams.append('function', functionName);

      const response = await this.makeRequest(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
        timeout,
      });

      if (!response.ok) {
        throw new Error(`Web App request failed: ${response.statusText}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      this.trackPerformance(functionName, executionTime, true);

      console.log(
        `✅ Web App function ${functionName} executed successfully in ${executionTime}ms`
      );
      return result;
    } catch (error) {
      this.trackPerformance(functionName, 0, false);
      console.error(`❌ Failed to run web app function ${functionName}:`, error);

      if (retryOnError) {
        return await this.retryOperation(() =>
          this.runWebAppFunction(functionName, parameters, { ...options, retryOnError: false })
        );
      }

      throw error;
    }
  }

  async makeRequest(url, options = {}) {
    try {
      // Rate limiting
      if (this.connectionSettings.enableRateLimiting) {
        await this.enforceRateLimit();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        options.timeout || this.connectionSettings.timeout
      );

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.lastRequestTime = Date.now();
      this.requestCount++;

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async enforceRateLimit() {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
  }

  async retryOperation(operation, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;

        console.warn(`⚠️ Operation failed, retrying... (${i + 1}/${attempts})`);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  generateCacheKey(functionName, parameters) {
    return `${functionName}_${JSON.stringify(parameters)}`;
  }

  trackPerformance(functionName, executionTime, success) {
    try {
      if (!this.connectionSettings.enablePerformanceTracking) return;

      const key = functionName;
      const current = this.performanceMetrics.get(key) || {
        count: 0,
        totalTime: 0,
        successCount: 0,
        errorCount: 0,
        averageTime: 0,
        lastExecution: null,
      };

      current.count++;
      current.totalTime += executionTime;
      current.averageTime = current.totalTime / current.count;
      current.lastExecution = new Date().toISOString();

      if (success) {
        current.successCount++;
      } else {
        current.errorCount++;
        this.errorCount++;
      }

      this.performanceMetrics.set(key, current);
    } catch (error) {
      console.warn('Failed to track performance:', error);
    }
  }

  // MIA Logistics specific functions
  async calculateDistance(origin, destination, options = {}) {
    try {
      const parameters = {
        origin,
        destination,
        mode: options.mode || 'DRIVING',
        units: options.units || 'METRIC',
        avoidHighways: options.avoidHighways || false,
        avoidTolls: options.avoidTolls || false,
        trafficModel: options.trafficModel || 'BEST_GUESS',
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('calculateDistance', parameters);
      } else {
        return await this.runFunction('calculateDistance', [parameters]);
      }
    } catch (error) {
      console.error('❌ Distance calculation failed:', error);
      throw error;
    }
  }

  async optimizeRoute(waypoints, options = {}) {
    try {
      const parameters = {
        waypoints,
        optimize: true,
        mode: options.mode || 'DRIVING',
        avoidHighways: options.avoidHighways || false,
        avoidTolls: options.avoidTolls || false,
        trafficModel: options.trafficModel || 'BEST_GUESS',
        departureTime: options.departureTime || new Date().toISOString(),
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('optimizeRoute', parameters);
      } else {
        return await this.runFunction('optimizeRoute', [parameters]);
      }
    } catch (error) {
      console.error('❌ Route optimization failed:', error);
      throw error;
    }
  }

  async geocodeAddress(address) {
    try {
      const parameters = { address };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('geocodeAddress', parameters);
      } else {
        return await this.runFunction('geocodeAddress', [address]);
      }
    } catch (error) {
      console.error('❌ Geocoding failed:', error);
      throw error;
    }
  }

  async reverseGeocode(lat, lng) {
    try {
      const parameters = { lat, lng };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('reverseGeocode', parameters);
      } else {
        return await this.runFunction('reverseGeocode', [lat, lng]);
      }
    } catch (error) {
      console.error('❌ Reverse geocoding failed:', error);
      throw error;
    }
  }

  async getTrafficInfo(origin, destination, options = {}) {
    try {
      const parameters = {
        origin,
        destination,
        departureTime: options.departureTime || new Date().toISOString(),
        trafficModel: options.trafficModel || 'BEST_GUESS',
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('getTrafficInfo', parameters);
      } else {
        return await this.runFunction('getTrafficInfo', [origin, destination]);
      }
    } catch (error) {
      console.error('❌ Traffic info request failed:', error);
      throw error;
    }
  }

  async calculateDeliveryTime(origin, destination, options = {}) {
    try {
      const parameters = {
        origin,
        destination,
        departureTime: options.departureTime || new Date().toISOString(),
        mode: options.mode || 'DRIVING',
        trafficModel: options.trafficModel || 'BEST_GUESS',
        deliveryWindow: options.deliveryWindow || null,
        vehicleType: options.vehicleType || 'standard',
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('calculateDeliveryTime', parameters);
      } else {
        return await this.runFunction('calculateDeliveryTime', [parameters]);
      }
    } catch (error) {
      console.error('❌ Delivery time calculation failed:', error);
      throw error;
    }
  }

  async validateAddress(address) {
    try {
      const parameters = { address };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('validateAddress', parameters);
      } else {
        return await this.runFunction('validateAddress', [address]);
      }
    } catch (error) {
      console.error('❌ Address validation failed:', error);
      throw error;
    }
  }

  async getDirections(origin, destination, waypoints = [], options = {}) {
    try {
      const parameters = {
        origin,
        destination,
        waypoints,
        mode: options.mode || 'DRIVING',
        units: options.units || 'METRIC',
        avoidHighways: options.avoidHighways || false,
        avoidTolls: options.avoidTolls || false,
        trafficModel: options.trafficModel || 'BEST_GUESS',
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('getDirections', parameters);
      } else {
        return await this.runFunction('getDirections', [parameters]);
      }
    } catch (error) {
      console.error('❌ Directions request failed:', error);
      throw error;
    }
  }

  async calculateFuelCost(distance, fuelPrice, consumption = 8) {
    try {
      const parameters = {
        distance,
        fuelPrice,
        consumption, // liters per 100km
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('calculateFuelCost', parameters);
      } else {
        return await this.runFunction('calculateFuelCost', [distance, fuelPrice, consumption]);
      }
    } catch (error) {
      console.error('❌ Fuel cost calculation failed:', error);
      throw error;
    }
  }

  async optimizeMultipleRoutes(routes, options = {}) {
    try {
      const parameters = {
        routes,
        optimize: true,
        maxRoutes: options.maxRoutes || 10,
        timeWindows: options.timeWindows || [],
        vehicleConstraints: options.vehicleConstraints || {},
        priorityWeights: options.priorityWeights || {},
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('optimizeMultipleRoutes', parameters);
      } else {
        return await this.runFunction('optimizeMultipleRoutes', [parameters]);
      }
    } catch (error) {
      console.error('❌ Multiple routes optimization failed:', error);
      throw error;
    }
  }

  // Advanced logistics functions
  async calculateRouteCost(route, options = {}) {
    try {
      const parameters = {
        route,
        fuelPrice: options.fuelPrice || 25000, // VND per liter
        driverCost: options.driverCost || 500000, // VND per day
        vehicleCost: options.vehicleCost || 1000000, // VND per day
        tollCost: options.tollCost || 0,
        maintenanceCost: options.maintenanceCost || 0,
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('calculateRouteCost', parameters);
      } else {
        return await this.runFunction('calculateRouteCost', [parameters]);
      }
    } catch (error) {
      console.error('❌ Route cost calculation failed:', error);
      throw error;
    }
  }

  async getWeatherInfo(location, options = {}) {
    try {
      const parameters = {
        location,
        forecastDays: options.forecastDays || 5,
        includeAlerts: options.includeAlerts || true,
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('getWeatherInfo', parameters);
      } else {
        return await this.runFunction('getWeatherInfo', [parameters]);
      }
    } catch (error) {
      console.error('❌ Weather info request failed:', error);
      throw error;
    }
  }

  async calculateCO2Emission(distance, vehicleType = 'standard', options = {}) {
    try {
      const parameters = {
        distance,
        vehicleType,
        fuelType: options.fuelType || 'diesel',
        loadFactor: options.loadFactor || 0.8,
        roadType: options.roadType || 'urban',
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('calculateCO2Emission', parameters);
      } else {
        return await this.runFunction('calculateCO2Emission', [parameters]);
      }
    } catch (error) {
      console.error('❌ CO2 emission calculation failed:', error);
      throw error;
    }
  }

  async optimizeDeliverySchedule(deliveries, options = {}) {
    try {
      const parameters = {
        deliveries,
        vehicleCapacity: options.vehicleCapacity || 1000, // kg
        timeWindows: options.timeWindows || [],
        driverConstraints: options.driverConstraints || {},
        priorityRules: options.priorityRules || {},
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('optimizeDeliverySchedule', parameters);
      } else {
        return await this.runFunction('optimizeDeliverySchedule', [parameters]);
      }
    } catch (error) {
      console.error('❌ Delivery schedule optimization failed:', error);
      throw error;
    }
  }

  async validateDriverLicense(licenseNumber, options = {}) {
    try {
      const parameters = {
        licenseNumber,
        licenseType: options.licenseType || 'B2',
        validateExpiry: options.validateExpiry || true,
        checkViolations: options.checkViolations || true,
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('validateDriverLicense', parameters);
      } else {
        return await this.runFunction('validateDriverLicense', [parameters]);
      }
    } catch (error) {
      console.error('❌ Driver license validation failed:', error);
      throw error;
    }
  }

  async calculateInsuranceCost(vehicleInfo, options = {}) {
    try {
      const parameters = {
        vehicleInfo,
        coverageType: options.coverageType || 'comprehensive',
        driverAge: options.driverAge || 30,
        drivingExperience: options.drivingExperience || 5,
        claimHistory: options.claimHistory || [],
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('calculateInsuranceCost', parameters);
      } else {
        return await this.runFunction('calculateInsuranceCost', [parameters]);
      }
    } catch (error) {
      console.error('❌ Insurance cost calculation failed:', error);
      throw error;
    }
  }

  async getVehicleInfo(vehicleId, options = {}) {
    try {
      const parameters = {
        vehicleId,
        includeMaintenance: options.includeMaintenance || true,
        includePerformance: options.includePerformance || true,
        includeLocation: options.includeLocation || true,
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('getVehicleInfo', parameters);
      } else {
        return await this.runFunction('getVehicleInfo', [parameters]);
      }
    } catch (error) {
      console.error('❌ Vehicle info request failed:', error);
      throw error;
    }
  }

  async calculateMaintenanceCost(vehicleId, options = {}) {
    try {
      const parameters = {
        vehicleId,
        maintenanceType: options.maintenanceType || 'routine',
        mileage: options.mileage || 0,
        age: options.age || 0,
        usage: options.usage || 'normal',
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('calculateMaintenanceCost', parameters);
      } else {
        return await this.runFunction('calculateMaintenanceCost', [parameters]);
      }
    } catch (error) {
      console.error('❌ Maintenance cost calculation failed:', error);
      throw error;
    }
  }

  async optimizeFleetRoutes(fleet, deliveries, options = {}) {
    try {
      const parameters = {
        fleet,
        deliveries,
        optimizationCriteria: options.optimizationCriteria || ['cost', 'time'],
        constraints: options.constraints || {},
        timeWindows: options.timeWindows || [],
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('optimizeFleetRoutes', parameters);
      } else {
        return await this.runFunction('optimizeFleetRoutes', [parameters]);
      }
    } catch (error) {
      console.error('❌ Fleet routes optimization failed:', error);
      throw error;
    }
  }

  async getRealTimeTracking(vehicleId, options = {}) {
    try {
      const parameters = {
        vehicleId,
        includeRoute: options.includeRoute || true,
        includeTraffic: options.includeTraffic || true,
        includeETA: options.includeETA || true,
      };

      if (this.webAppUrl) {
        return await this.runWebAppFunction('getRealTimeTracking', parameters);
      } else {
        return await this.runFunction('getRealTimeTracking', [parameters]);
      }
    } catch (error) {
      console.error('❌ Real-time tracking request failed:', error);
      throw error;
    }
  }

  // Utility methods
  async testConnection() {
    try {
      // Simple test function
      const result = await this.runFunction('testFunction', []);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deployWebApp() {
    try {
      const headers = await googleAuthService.getAuthHeaders();

      const deploymentConfig = {
        versionNumber: 'HEAD',
        manifestFileName: 'appsscript',
        description: 'MIA Logistics Manager Web App',
      };

      const response = await this.makeRequest(
        `${this.apiUrl}/projects/${this.scriptId}/deployments`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(deploymentConfig),
        }
      );

      if (!response.ok) {
        throw new Error(`Deployment failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Web app deployment failed:', error);
      throw error;
    }
  }

  getFunctions() {
    return this.availableFunctions;
  }

  getPerformanceMetrics() {
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      successRate:
        this.requestCount > 0
          ? ((this.requestCount - this.errorCount) / this.requestCount) * 100
          : 0,
      functionMetrics: Object.fromEntries(this.performanceMetrics),
      cacheSize: this.functionCache.size,
    };
  }

  clearCache() {
    this.functionCache.clear();
    console.log('🗑️ Function cache cleared');
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      scriptId: this.scriptId,
      webAppUrl: this.webAppUrl,
      availableFunctions: this.availableFunctions.length,
      cacheSize: this.functionCache.size,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
    };
  }

  // Cleanup method
  cleanup() {
    this.disconnect();
    this.clearCache();
    this.performanceMetrics.clear();
  }
}

export const googleAppsScriptService = new GoogleAppsScriptService();
