# Environment Security Configuration

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
- Unusual API usage patterns