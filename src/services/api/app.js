const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)
const hpp = require('hpp')
const compression = require('compression')
const path = require('path')
require('dotenv').config()

// Import routes
const authRoutes = require('./routes/authRoutes')
const googleSheetsRoutes = require('./routes/googleSheetsRoutes')
const googleSheetsAuthRoutes = require('./routes/googleSheetsAuthRoutes')

// Import middleware
const { securityHeaders, requestLogger } = require('./middleware/googleSheetsAuth')
const { globalErrorHandler } = require('./middleware/errorHandler')
const { prettyLogger } = require('./middleware/prettyLogger')

// Create Express app
const app = express()

// Set view engine for email templates
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1)

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
)

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://mia-logistics.vercel.app',
      process.env.CORS_ORIGIN,
    ].filter(Boolean)

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}

app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// app.use('/api/', limiter); // Tạm thời disable để test

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Data sanitization against XSS
app.use((req, res, next) => {
  if (req.body) {
    req.body = JSON.parse(DOMPurify.sanitize(JSON.stringify(req.body)))
  }
  next()
})

// Prevent parameter pollution
app.use(hpp())

// Compression middleware
app.use(compression())

// Logging middleware - Sử dụng pretty logger thay vì morgan
if (process.env.NODE_ENV === 'development') {
  app.use(prettyLogger)
} else {
  app.use(morgan('combined'))
}

// Custom middleware
app.use(securityHeaders)
// app.use(requestLogger); // Tạm thời tắt để tránh duplicate logs

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/auth-sheets', googleSheetsAuthRoutes)
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/sheets', googleSheetsRoutes)
app.use('/api/transfers', require('./routes/transfersRoutes'))
app.use('/api/carriers', require('./routes/carriersRoutes'))
app.use('/api/employees', require('./routes/employeesRoutes'))
app.use('/api/locations', require('./routes/locationsRoutes'))
app.use('/api/roles', require('./routes/rolesRoutes'))
app.use('/api/role-permissions', require('./routes/rolePermissionsRoutes'))

// 404 handler
app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// Global error handler
app.use(globalErrorHandler)

module.exports = { app }
