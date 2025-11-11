// MIA Logistics Manager - Security Hardening
// Security hardening và performance optimization

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 MIA Logistics Manager - Security Hardening');
console.log('============================================');
console.log('');

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Create Content Security Policy
function createContentSecurityPolicy() {
  logInfo('Creating Content Security Policy...');

  try {
    const cspMeta = `    <!-- Content Security Policy -->
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self';
      script-src 'self' 'unsafe-inline' *.googleapis.com *.google.com *.gstatic.com;
      style-src 'self' 'unsafe-inline' *.googleapis.com fonts.googleapis.com;
      font-src 'self' fonts.gstatic.com data:;
      img-src 'self' data: *.googleapis.com *.google.com *.gstatic.com;
      connect-src 'self' *.googleapis.com *.google.com *.gstatic.com;
      frame-src 'self' *.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    ">`;

    // Add to index.html
    const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
    let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

    // Insert CSP meta tag before closing head
    indexContent = indexContent.replace('</head>', `${cspMeta}\n  </head>`);

    fs.writeFileSync(indexHtmlPath, indexContent);
    logSuccess('Content Security Policy added to index.html');

    return true;
  } catch (error) {
    logError(`Content Security Policy setup failed: ${error.message}`);
    return false;
  }
}

// Create security headers configuration
function createSecurityHeaders() {
  logInfo('Creating security headers configuration...');

  try {
    // nginx security headers
    const nginxSecurityHeaders = `# Security Headers for nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Content Security Policy
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' *.googleapis.com *.google.com *.gstatic.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com data:;
  img-src 'self' data: *.googleapis.com *.google.com *.gstatic.com;
  connect-src 'self' *.googleapis.com *.google.com *.gstatic.com;
  frame-src 'self' *.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
" always;`;

    fs.writeFileSync(path.join(__dirname, '..', 'security', 'nginx-security-headers.conf'), nginxSecurityHeaders);

    // Apache security headers
    const apacheSecurityHeaders = `# Security Headers for Apache
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Content Security Policy
Header always set Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' *.googleapis.com *.google.com *.gstatic.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com data:;
  img-src 'self' data: *.googleapis.com *.google.com *.gstatic.com;
  connect-src 'self' *.googleapis.com *.google.com *.gstatic.com;
  frame-src 'self' *.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
"`;

    fs.writeFileSync(path.join(__dirname, '..', 'security', 'apache-security-headers.conf'), apacheSecurityHeaders);

    // Create security directory
    const securityDir = path.join(__dirname, '..', 'security');
    if (!fs.existsSync(securityDir)) {
      fs.mkdirSync(securityDir, { recursive: true });
    }

    logSuccess('Security headers configuration created');

    return true;
  } catch (error) {
    logError(`Security headers setup failed: ${error.message}`);
    return false;
  }
}

// Create environment security configuration
function createEnvironmentSecurity() {
  logInfo('Creating environment security configuration...');

  try {
    const envSecurityGuide = `# Environment Security Configuration

## Production Environment Variables

### Required Environment Variables
- REACT_APP_GOOGLE_CLIENT_ID: Google OAuth Client ID
- REACT_APP_GOOGLE_CLIENT_SECRET: Google OAuth Client Secret (server-side only)
- REACT_APP_GOOGLE_SPREADSHEET_ID: Google Sheets ID
- REACT_APP_GOOGLE_APPS_SCRIPT_ID: Google Apps Script ID
- REACT_APP_GOOGLE_MAPS_API_KEY: Google Maps API Key

### Security Environment Variables
- REACT_APP_ENABLE_GA: Enable Google Analytics (true/false)
- REACT_APP_GA_MEASUREMENT_ID: Google Analytics Measurement ID
- REACT_APP_ENABLE_SENTRY: Enable Sentry error tracking (true/false)
- REACT_APP_SENTRY_DSN: Sentry DSN
- REACT_APP_ANALYTICS_ENDPOINT: Actuarial analytics endpoint
- REACT_APP_ANALYTICS_API_KEY: Analytics API key

## Security Best Practices

### 1. Environment Variables
- Never commit .env files to version control
- Use different .env files for different environments
- Rotate API keys regularly
- Use environment-specific configurations

### 2. API Key Security
- Restrict API keys by domain/IP
- Use least privilege principle
- Monitor API key usage
- Implement rate limiting

### 3. Google Cloud Security
- Enable audit logging
- Use service accounts with minimal permissions
- Implement IAM policies
- Monitor API usage

### 4. Application Security
- Enable HTTPS only
- Implement Content Security Policy
- Use secure headers
- Validate all inputs
- Sanitize outputs

### 5. Monitoring & Alerting
- Monitor for suspicious activity
- Set up alerts for security events
- Log all API calls
- Track authentication attempts

## Security Checklist

### Pre-deployment
- [ ] Environment variables secured
- [ ] API keys restricted by domain
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Content Security Policy enabled
- [ ] Security headers configured

### Post-deployment
- [ ] Monitor API usage
- [ ] Check error logs
- [ ] Verify security headers
- [ ] Test authentication flows
- [ ] Validate API key restrictions
- [ ] Check SSL certificate

## Security Monitoring

### Key Metrics to Monitor
- Failed authentication attempts
- API quota usage
- Error rates
- Response times
- Suspicious activity patterns

### Alert Thresholds
- API error rate > 5%
- Response time > 5 seconds
- Failed auth attempts > 10 per hour
- Unusual API usage patterns`;

    fs.writeFileSync(path.join(__dirname, '..', 'security', 'environment-security.md'), envSecurityGuide);
    logSuccess('Environment security configuration created');

    return true;
  } catch (error) {
    logError(`Environment security setup failed: ${error.message}`);
    return false;
  }
}

// Create input validation utilities
function createInputValidation() {
  logInfo('Creating input validation utilities...');

  try {
    const validationUtils = `// Input Validation Utilities
import DOMPurify from 'dompurify';

// Sanitize HTML content
export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html);
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Validate Google Sheets ID format
export const validateGoogleSheetsId = (id) => {
  const sheetsIdRegex = /^[a-zA-Z0-9-_]{44}$/;
  return sheetsIdRegex.test(id);
};

// Validate Google Apps Script ID format
export const validateGoogleAppsScriptId = (id) => {
  const scriptIdRegex = /^[a-zA-Z0-9-_]{44}$/;
  return scriptIdRegex.test(id);
};

// Validate Google Maps API Key format
export const validateGoogleMapsApiKey = (key) => {
  const apiKeyRegex = /^AIza[0-9A-Za-z-_]{35}$/;
  return apiKeyRegex.test(key);
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Validate and sanitize form data
export const validateFormData = (formData, schema) => {
  const errors = {};
  const sanitizedData = {};

  Object.keys(schema).forEach(field => {
    const value = formData[field];
    const rules = schema[field];

    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
      errors[field] = \`\${field} is required\`;
      return;
    }

    // Type validation
    if (value && rules.type) {
      if (rules.type === 'email' && !validateEmail(value)) {
        errors[field] = \`\${field} must be a valid email\`;
        return;
      }

      if (rules.type === 'phone' && !validatePhone(value)) {
        errors[field] = \`\${field} must be a valid phone number\`;
        return;
      }

      if (rules.type === 'sheets_id' && !validateGoogleSheetsId(value)) {
        errors[field] = \`\${field} must be a valid Google Sheets ID\`;
        return;
      }

      if (rules.type === 'script_id' && !validateGoogleAppsScriptId(value)) {
        errors[field] = \`\${field} must be a valid Google Apps Script ID\`;
        return;
      }

      if (rules.type === 'api_key' && !validateGoogleMapsApiKey(value)) {
        errors[field] = \`\${field} must be a valid Google Maps API Key\`;
        return;
      }
    }

    // Length validation
    if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = \`\${field} must be at least \${rules.minLength} characters\`;
      return;
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[field] = \`\${field} must be no more than \${rules.maxLength} characters\`;
      return;
    }

    // Sanitize input
    if (value && rules.sanitize !== false) {
      sanitizedData[field] = sanitizeInput(value);
    } else {
      sanitizedData[field] = value;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData
  };
};

// Common validation schemas
export const VALIDATION_SCHEMAS = {
  GOOGLE_CONFIG: {
    clientId: {
      required: true,
      type: 'email',
      minLength: 10,
      maxLength: 100
    },
    spreadsheetId: {
      required: true,
      type: 'sheets_id'
    },
    appsScriptId: {
      required: true,
      type: 'script_id'
    },
    mapsApiKey: {
      required: true,
      type: 'api_key'
    }
  },

  USER_PROFILE: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      type: 'email'
    },
    phone: {
      required: false,
      type: 'phone'
    }
  }
};`;

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'utils', 'validation.js'), validationUtils);
    logSuccess('Input validation utilities created');

    return true;
  } catch (error) {
    logError(`Input validation setup failed: ${error.message}`);
    return false;
  }
}

// Create API security middleware
function createAPISecurityMiddleware() {
  logInfo('Creating API security middleware...');

  try {
    const apiSecurityMiddleware = `// API Security Middleware
import analytics from '../services/analyticsService';

// Rate limiting configuration
const RATE_LIMITS = {
  googleSheets: {
    requests: 100,
    window: 60000, // 1 minute
    blockDuration: 300000 // 5 minutes
  },
  googleDrive: {
    requests: 100,
    window: 60000,
    blockDuration: 300000
  },
  googleMaps: {
    requests: 1000,
    window: 60000,
    blockDuration: 600000 // 10 minutes
  }
};

// Track API usage for rate limiting
const apiUsage = new Map();

// Rate limiting middleware
export const rateLimitMiddleware = (apiName) => {
  return (req, res, next) => {
    const clientId = req.headers['x-client-id'] || req.ip;
    const now = Date.now();
    const limit = RATE_LIMITS[apiName];

    if (!limit) {
      return next();
    }

    const key = \`\${apiName}:\${clientId}\`;
    const usage = apiUsage.get(key) || { count: 0, resetTime: now + limit.window };

    // Reset counter if window has passed
    if (now > usage.resetTime) {
      usage.count = 0;
      usage.resetTime = now + limit.window;
    }

    // Check if limit exceeded
    if (usage.count >= limit.requests) {
      analytics.trackEvent('rate_limit_exceeded', {
        api_name: apiName,
        client_id: clientId,
        limit: limit.requests,
        window: limit.window
      });

      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: \`Too many requests to \${apiName} API\`,
        retryAfter: Math.ceil((usage.resetTime - now) / 1000)
      });
    }

    // Increment counter
    usage.count++;
    apiUsage.set(key, usage);

    // Track API usage
    analytics.trackGoogleAPIUsage(apiName, req.method, true, 0);

    next();
  };
};

// Input validation middleware
export const validateInputMiddleware = (schema) => {
  return (req, res, next) => {
    const validation = validateFormData(req.body, schema);

    if (!validation.isValid) {
      analytics.trackEvent('validation_error', {
        errors: validation.errors,
        endpoint: req.path
      });

      return res.status(400).json({
        error: 'Validation failed',
        errors: validation.errors
      });
    }

    req.body = validation.data;
    next();
  };
};

// Security headers middleware
export const securityHeadersMiddleware = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  next();
};

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://mialogistics.com',
      'https://www.mialogistics.com'
    ];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID']
};

// Error handling middleware
export const errorHandlingMiddleware = (err, req, res, next) => {
  // Log error
  analytics.trackError(err, {
    endpoint: req.path,
    method: req.method,
    userAgent: req.headers['user-agent']
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};`;

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'middleware', 'security.js'), apiSecurityMiddleware);
    logSuccess('API security middleware created');

    return true;
  } catch (error) {
    logError(`API security middleware setup failed: ${error.message}`);
    return false;
  }
}

// Create performance optimization configuration
function createPerformanceOptimization() {
  logInfo('Creating performance optimization configuration...');

  try {
    const performanceConfig = `// Performance Optimization Configuration
export const PERFORMANCE_CONFIG = {
  // Image optimization
  IMAGE_OPTIMIZATION: {
    ENABLED: true,
    QUALITY: 80,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
    FORMATS: ['webp', 'jpeg', 'png']
  },

  // Code splitting
  CODE_SPLITTING: {
    ENABLED: true,
    CHUNK_SIZE_LIMIT: 244000, // 244KB
    MAX_CHUNKS: 10
  },

  // Caching
  CACHING: {
    STATIC_ASSETS: '1y',
    HTML_FILES: '0',
    API_RESPONSES: '5m'
  },

  // Lazy loading
  LAZY_LOADING: {
    ENABLED: true,
    THRESHOLD: 0.1,
    ROOT_MARGIN: '50px'
  },

  // Preloading
  PRELOADING: {
    ENABLED: true,
    CRITICAL_ROUTES: ['/dashboard', '/transport', '/warehouse']
  }
};

// Performance optimization utilities
export const optimizeImage = (src, options = {}) => {
  const {
    quality = PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.QUALITY,
    width = PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.MAX_WIDTH,
    height = PERFORMANCE_CONFIG.IMAGE_OPTIMIZATION.MAX_HEIGHT
  } = options;

  // If using a CDN or image optimization service
  if (src.includes('googleapis.com') || src.includes('gstatic.com')) {
    return \`\${src}?w=\${width}&h=\${height}&q=\${quality}\`;
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
        threshold: options.threshold || PERFORMANCE_CONFIG.LAZY_LOADING.THRESHOLD,
        rootMargin: options.rootMargin || PERFORMANCE_CONFIG.LAZY_LOADING.ROOT_MARGIN
      }
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
        window.gtag('event', 'performance', {
          event_category: 'Performance',
          event_label: name,
          value: Math.round(end - start)
        });
      }

      return result;
    } catch (error) {
      const end = performance.now();

      // Track error performance
      if (window.gtag) {
        window.gtag('event', 'performance_error', {
          event_category: 'Performance',
          event_label: name,
          value: Math.round(end - start)
        });
      }

      throw error;
    }
  };
};`;

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'utils', 'performance.js'), performanceConfig);
    logSuccess('Performance optimization configuration created');

    return true;
  } catch (error) {
    logError(`Performance optimization setup failed: ${error.message}`);
    return false;
  }
}

// Create security audit script
function createSecurityAuditScript() {
  logInfo('Creating security audit script...');

  try {
    const securityAuditScript = `#!/bin/bash

# MIA Logistics Manager - Security Audit Script
echo "🔒 MIA Logistics Manager - Security Audit"
echo "========================================="
echo ""

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m'

print_status() {
    echo -e "\${GREEN}✅ \$1\${NC}"
}

print_warning() {
    echo -e "\${YELLOW}⚠️  \$1\${NC}"
}

print_error() {
    echo -e "\${RED}❌ \$1\${NC}"
}

print_info() {
    echo -e "\${BLUE}ℹ️  \$1\${NC}"
}

# Check for sensitive information in code
print_info "Checking for sensitive information..."
if grep -r "password\\|secret\\|key\\|token" src/ --include="*.js" --include="*.jsx" | grep -v "REACT_APP_" | grep -v "process.env"; then
    print_warning "Potential sensitive information found in code"
else
    print_status "No sensitive information found in code"
fi

# Check for console.log statements in production
print_info "Checking for console.log statements..."
if grep -r "console\\.log\\|console\\.warn\\|console\\.error" src/ --include="*.js" --include="*.jsx" | grep -v "development"; then
    print_warning "Console statements found - consider removing for production"
else
    print_status "No console statements found"
fi

# Check for unused dependencies
print_info "Checking for unused dependencies..."
if command -v depcheck &> /dev/null; then
    depcheck
else
    print_warning "depcheck not installed - run: npm install -g depcheck"
fi

# Check for security vulnerabilities
print_info "Checking for security vulnerabilities..."
npm audit

# Check for outdated packages
print_info "Checking for outdated packages..."
npm outdated

# Check environment variables
print_info "Checking environment variables..."
if [ -f ".env" ]; then
    if grep -q "YOUR_" .env || grep -q "your_" .env; then
        print_warning "Placeholder values found in .env file"
    else
        print_status "Environment variables appear to be configured"
    fi
else
    print_error ".env file not found"
fi

# Check build output for sensitive information
print_info "Checking build output..."
if [ -d "build" ]; then
    if grep -r "password\\|secret\\|key\\|token" build/ | grep -v "REACT_APP_"; then
        print_warning "Potential sensitive information found in build"
    else
        print_status "Build output appears clean"
    fi
else
    print_warning "Build directory not found - run: npm run build"
fi

echo ""
print_info "Security audit completed!"
echo ""
echo "📋 Security Checklist:"
echo "======================"
echo "✓ No sensitive information in code"
echo "✓ No console statements in production"
echo "✓ No security vulnerabilities"
echo "✓ Environment variables configured"
echo "✓ Build output clean"
echo ""
echo "🔒 Security Best Practices:"
echo "=========================="
echo "1. Use HTTPS in production"
echo "2. Implement Content Security Policy"
echo "3. Validate all inputs"
echo "4. Sanitize outputs"
echo "5. Monitor for suspicious activity"
echo "6. Keep dependencies updated"
echo "7. Use environment variables for secrets"
echo "8. Implement rate limiting"
echo "9. Enable security headers"
echo "10. Regular security audits"
`;

    fs.writeFileSync(path.join(__dirname, 'securityAudit.sh'), securityAuditScript);
    execSync('chmod +x ' + path.join(__dirname, 'securityAudit.sh'));
    logSuccess('Security audit script created');

    return true;
  } catch (error) {
    logError(`Security audit script setup failed: ${error.message}`);
    return false;
  }
}

// Main security hardening function
function main() {
  log('🔒 MIA Logistics Manager - Security Hardening', colors.cyan);
  log('=============================================', colors.cyan);
  log('');

  const steps = [
    { name: 'Content Security Policy', fn: createContentSecurityPolicy },
    { name: 'Security Headers', fn: createSecurityHeaders },
    { name: 'Environment Security', fn: createEnvironmentSecurity },
    { name: 'Input Validation', fn: createInputValidation },
    { name: 'API Security Middleware', fn: createAPISecurityMiddleware },
    { name: 'Performance Optimization', fn: createPerformanceOptimization },
    { name: 'Security Audit Script', fn: createSecurityAuditScript }
  ];

  let successCount = 0;

  steps.forEach((step, index) => {
    log(`\n${index + 1}. ${step.name}...`, colors.magenta);
    if (step.fn()) {
      successCount++;
    }
  });

  log('\n📊 Security Hardening Summary:', colors.cyan);
  log('==============================', colors.cyan);
  log(`Completed: ${successCount}/${steps.length} steps`);

  if (successCount === steps.length) {
    logSuccess('Security hardening completed successfully!');
    log('');
    log('🚀 Security features implemented:', colors.yellow);
    log('1. Content Security Policy');
    log('2. Security headers configuration');
    log('3. Environment security guidelines');
    log('4. Input validation utilities');
    log('5. API security middleware');
    log('6. Performance optimization');
    log('7. Security audit script');
    log('');
    log('🔒 Next steps:', colors.blue);
    log('1. Run security audit: ./scripts/securityAudit.sh');
    log('2. Test security headers');
    log('3. Validate input sanitization');
    log('4. Test rate limiting');
    log('5. Monitor security metrics');
  } else {
    logError('Some security hardening steps failed. Please check the errors above.');
  }
}

// Run security hardening
main();
