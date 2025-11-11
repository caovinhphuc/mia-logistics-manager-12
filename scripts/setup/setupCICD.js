// MIA Logistics Manager - CI/CD Pipeline Setup
// Setup CI/CD pipeline với GitHub Actions

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 MIA Logistics Manager - CI/CD Pipeline Setup');
console.log('==============================================');
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

// Create GitHub Actions workflows
function createGitHubActionsWorkflows() {
  logInfo('Creating GitHub Actions workflows...');

  try {
    const workflowsDir = path.join(__dirname, '..', '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    // Main deployment workflow
    const deployWorkflow = `name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '16'
  NPM_VERSION: '8'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run tests
      run: npm test -- --coverage --watchAll=false

    - name: Build application
      run: npm run build
      env:
        REACT_APP_GOOGLE_CLIENT_ID: \${{ secrets.GOOGLE_CLIENT_ID }}
        REACT_APP_GOOGLE_SPREADSHEET_ID: \${{ secrets.GOOGLE_SPREADSHEET_ID }}
        REACT_APP_GOOGLE_APPS_SCRIPT_ID: \${{ secrets.GOOGLE_APPS_SCRIPT_ID }}
        REACT_APP_GOOGLE_MAPS_API_KEY: \${{ secrets.GOOGLE_MAPS_API_KEY }}

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

  security-audit:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run security audit
      run: npm audit --audit-level moderate

    - name: Run dependency check
      run: npx depcheck

    - name: Check for secrets
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: main
        head: HEAD

  deploy-staging:
    needs: [test, security-audit]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build for staging
      run: npm run build
      env:
        NODE_ENV: staging
        REACT_APP_GOOGLE_CLIENT_ID: \${{ secrets.GOOGLE_CLIENT_ID }}
        REACT_APP_GOOGLE_SPREADSHEET_ID: \${{ secrets.GOOGLE_SPREADSHEET_ID }}
        REACT_APP_GOOGLE_APPS_SCRIPT_ID: \${{ secrets.GOOGLE_APPS_SCRIPT_ID }}
        REACT_APP_GOOGLE_MAPS_API_KEY: \${{ secrets.GOOGLE_MAPS_API_KEY }}

    - name: Deploy to Netlify (Staging)
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './build'
        production-deploy: false
        github-token: \${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions - Staging"
      env:
        NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID_STAGING }}

  deploy-production:
    needs: [deploy-staging]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build for production
      run: npm run build
      env:
        NODE_ENV: production
        GENERATE_SOURCEMAP: false
        REACT_APP_GOOGLE_CLIENT_ID: \${{ secrets.GOOGLE_CLIENT_ID }}
        REACT_APP_GOOGLE_SPREADSHEET_ID: \${{ secrets.GOOGLE_SPREADSHEET_ID }}
        REACT_APP_GOOGLE_APPS_SCRIPT_ID: \${{ secrets.GOOGLE_APPS_SCRIPT_ID }}
        REACT_APP_GOOGLE_MAPS_API_KEY: \${{ secrets.GOOGLE_MAPS_API_KEY }}

    - name: Deploy to Netlify (Production)
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './build'
        production-deploy: true
        github-token: \${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions - Production"
      env:
        NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}

    - name: Notify deployment success
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: 'MIA Logistics Manager deployed successfully to production!'
      env:
        SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}
      if: always()`;

    fs.writeFileSync(path.join(workflowsDir, 'deploy.yml'), deployWorkflow);
    logSuccess('Main deployment workflow created');

    // Security workflow
    const securityWorkflow = `name: Security Scan

on:
  schedule:
    - cron: '0 2 * * *' # Run daily at 2 AM
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run npm audit
      run: npm audit --audit-level moderate

    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

    - name: Run CodeQL Analysis
      uses: github/codeql-action/analyze@v2
      with:
        languages: javascript
        queries: security-and-quality

    - name: Check for secrets
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: main
        head: HEAD

    - name: Upload security scan results
      uses: actions/upload-artifact@v3
      with:
        name: security-scan-results
        path: |
          snyk-results.json
          codeql-results.sarif`;

    fs.writeFileSync(path.join(workflowsDir, 'security.yml'), securityWorkflow);
    logSuccess('Security workflow created');

    // Performance workflow
    const performanceWorkflow = `name: Performance Test

on:
  schedule:
    - cron: '0 4 * * *' # Run daily at 4 AM
  push:
    branches: [ main ]

jobs:
  performance-test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
        REACT_APP_GOOGLE_CLIENT_ID: \${{ secrets.GOOGLE_CLIENT_ID }}

    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v9
      with:
        configPath: './.lighthouserc.json'
        uploadArtifacts: true
        temporaryPublicStorage: true

    - name: Analyze bundle size
      run: npx webpack-bundle-analyzer build/static/js/*.js --mode static --report build/bundle-report.html

    - name: Upload performance results
      uses: actions/upload-artifact@v3
      with:
        name: performance-results
        path: |
          .lighthouseci/
          build/bundle-report.html`;

    fs.writeFileSync(path.join(workflowsDir, 'performance.yml'), performanceWorkflow);
    logSuccess('Performance workflow created');

    return true;
  } catch (error) {
    logError(`GitHub Actions workflows setup failed: ${error.message}`);
    return false;
  }
}

// Create Lighthouse configuration
function createLighthouseConfig() {
  logInfo('Creating Lighthouse configuration...');

  try {
    const lighthouseConfig = `{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "chromeFlags": "--no-sandbox"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}`;

    fs.writeFileSync(path.join(__dirname, '..', '.lighthouserc.json'), lighthouseConfig);
    logSuccess('Lighthouse configuration created');

    return true;
  } catch (error) {
    logError(`Lighthouse configuration setup failed: ${error.message}`);
    return false;
  }
}

// Create Docker CI configuration
function createDockerCIConfig() {
  logInfo('Creating Docker CI configuration...');

  try {
    const dockerWorkflow = `name: Docker Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: \${{ env.REGISTRY }}
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha

    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: \${{ steps.meta.outputs.tags }}
        labels: \${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max`;

    const workflowsDir = path.join(__dirname, '..', '.github', 'workflows');
    fs.writeFileSync(path.join(workflowsDir, 'docker.yml'), dockerWorkflow);
    logSuccess('Docker CI workflow created');

    return true;
  } catch (error) {
    logError(`Docker CI configuration setup failed: ${error.message}`);
    return false;
  }
}

// Create deployment scripts
function createDeploymentScripts() {
  logInfo('Creating deployment scripts...');

  try {
    // Netlify deployment script
    const netlifyDeployScript = `#!/bin/bash

# Netlify Deployment Script
echo "🚀 Deploying to Netlify..."

# Set environment
ENVIRONMENT=\${1:-production}
SITE_ID=\${2:-$NETLIFY_SITE_ID}

if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
    echo "❌ NETLIFY_AUTH_TOKEN not set"
    exit 1
fi

if [ -z "$SITE_ID" ]; then
    echo "❌ NETLIFY_SITE_ID not set"
    exit 1
fi

# Install Netlify CLI if not installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify
netlify login --token $NETLIFY_AUTH_TOKEN

# Build application
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Deploy
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Deploying to production..."
    netlify deploy --prod --dir=build --site=$SITE_ID
else
    echo "Deploying to staging..."
    netlify deploy --dir=build --site=$SITE_ID
fi

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed"
    exit 1
fi`;

    fs.writeFileSync(path.join(__dirname, 'deployNetlify.sh'), netlifyDeployScript);
    execSync('chmod +x ' + path.join(__dirname, 'deployNetlify.sh'));
    logSuccess('Netlify deployment script created');

    // Vercel deployment script
    const vercelDeployScript = `#!/bin/bash

# Vercel Deployment Script
echo "🚀 Deploying to Vercel..."

# Set environment
ENVIRONMENT=\${1:-production}

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN not set"
    exit 1
fi

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
vercel login --token $VERCEL_TOKEN

# Build application
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Deploy
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Deploying to production..."
    vercel --prod
else
    echo "Deploying to preview..."
    vercel
fi

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed"
    exit 1
fi`;

    fs.writeFileSync(path.join(__dirname, 'deployVercel.sh'), vercelDeployScript);
    execSync('chmod +x ' + path.join(__dirname, 'deployVercel.sh'));
    logSuccess('Vercel deployment script created');

    return true;
  } catch (error) {
    logError(`Deployment scripts setup failed: ${error.message}`);
    return false;
  }
}

// Create CI/CD configuration files
function createCICDConfigs() {
  logInfo('Creating CI/CD configuration files...');

  try {
    // GitHub Actions environment file
    const envExample = `# GitHub Actions Environment Variables
# Add these as secrets in your GitHub repository

# Google APIs
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_SPREADSHEET_ID=your_google_spreadsheet_id_here
GOOGLE_APPS_SCRIPT_ID=your_google_apps_script_id_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Deployment Platforms
NETLIFY_AUTH_TOKEN=your_netlify_auth_token_here
NETLIFY_SITE_ID=your_netlify_site_id_here
NETLIFY_SITE_ID_STAGING=your_netlify_staging_site_id_here

VERCEL_TOKEN=your_vercel_token_here

# Security
SNYK_TOKEN=your_snyk_token_here

# Monitoring
SLACK_WEBHOOK_URL=your_slack_webhook_url_here

# Analytics
GA_MEASUREMENT_ID=your_ga_measurement_id_here
SENTRY_DSN=your_sentry_dsn_here`;

    fs.writeFileSync(path.join(__dirname, '..', '.env.github-actions.example'), envExample);
    logSuccess('GitHub Actions environment example created');

    // CI/CD documentation
    const cicdDocs = `# CI/CD Pipeline Documentation

## Overview

MIA Logistics Manager uses GitHub Actions for continuous integration and deployment.

## Workflows

### 1. Main Deployment Workflow (\`.github/workflows/deploy.yml\`)

**Triggers:**
- Push to main branch
- Pull requests to main branch

**Jobs:**
- **test**: Run tests, linting, and build
- **security-audit**: Security scanning and dependency checks
- **deploy-staging**: Deploy to staging environment
- **deploy-production**: Deploy to production environment

### 2. Security Workflow (\`.github/workflows/security.yml\`)

**Triggers:**
- Daily at 2 AM
- Push to main branch
- Pull requests to main branch

**Features:**
- npm audit
- Snyk security scanning
- CodeQL analysis
- Secret detection

### 3. Performance Workflow (\`.github/workflows/performance.yml\`)

**Triggers:**
- Daily at 4 AM
- Push to main branch

**Features:**
- Lighthouse CI
- Bundle size analysis
- Performance metrics

### 4. Docker Workflow (\`.github/workflows/docker.yml\`)

**Triggers:**
- Push to main branch
- Version tags

**Features:**
- Multi-platform Docker builds
- Container registry push
- Build caching

## Environment Variables

### Required Secrets

Add these secrets to your GitHub repository:

\`\`\`bash
# Google APIs
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_SPREADSHEET_ID
GOOGLE_APPS_SCRIPT_ID
GOOGLE_MAPS_API_KEY

# Deployment
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
NETLIFY_SITE_ID_STAGING
VERCEL_TOKEN

# Security
SNYK_TOKEN

# Monitoring
SLACK_WEBHOOK_URL
\`\`\`

## Deployment Process

### Staging Deployment
1. Code is pushed to main branch
2. Tests and security scans run
3. If successful, deploy to staging
4. Staging URL is available for testing

### Production Deployment
1. After staging deployment succeeds
2. Build optimized production bundle
3. Deploy to production
4. Send notification to Slack

## Local Development

### Prerequisites
- Node.js 16+
- npm 8+
- Git

### Setup
\`\`\`bash
# Clone repository
git clone <repository-url>
cd mia-logistics-manager

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
\`\`\`

### Testing
\`\`\`bash
# Run tests
npm test

# Run linting
npm run lint

# Run security audit
npm audit

# Build application
npm run build
\`\`\`

## Monitoring

### Performance Monitoring
- Lighthouse CI runs daily
- Bundle size analysis
- Core Web Vitals tracking

### Security Monitoring
- Daily security scans
- Dependency vulnerability checks
- Secret detection

### Deployment Monitoring
- Deployment success/failure notifications
- Build time tracking
- Error logging

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version
   - Verify environment variables
   - Check dependency versions

2. **Deployment Failures**
   - Verify deployment tokens
   - Check site IDs
   - Review build logs

3. **Security Scan Failures**
   - Update vulnerable dependencies
   - Fix security issues
   - Review secret detection results

### Support

- Check GitHub Actions logs
- Review deployment documentation
- Contact development team

## Best Practices

1. **Branch Protection**
   - Require pull request reviews
   - Require status checks
   - Require up-to-date branches

2. **Environment Management**
   - Use different environments for staging/production
   - Secure environment variables
   - Regular rotation of secrets

3. **Monitoring**
   - Set up alerts for failures
   - Monitor performance metrics
   - Track security issues

4. **Documentation**
   - Keep documentation updated
   - Document deployment process
   - Maintain troubleshooting guides`;

    fs.writeFileSync(path.join(__dirname, '..', 'docs', 'CICD.md'), cicdDocs);
    logSuccess('CI/CD documentation created');

    return true;
  } catch (error) {
    logError(`CI/CD configuration setup failed: ${error.message}`);
    return false;
  }
}

// Main CI/CD setup function
function main() {
  log('🔄 MIA Logistics Manager - CI/CD Pipeline Setup', colors.cyan);
  log('===============================================', colors.cyan);
  log('');

  const steps = [
    { name: 'GitHub Actions Workflows', fn: createGitHubActionsWorkflows },
    { name: 'Lighthouse Configuration', fn: createLighthouseConfig },
    { name: 'Docker CI Configuration', fn: createDockerCIConfig },
    { name: 'Deployment Scripts', fn: createDeploymentScripts },
    { name: 'CI/CD Configuration Files', fn: createCICDConfigs }
  ];

  let successCount = 0;

  steps.forEach((step, index) => {
    log(`\n${index + 1}. ${step.name}...`, colors.magenta);
    if (step.fn()) {
      successCount++;
    }
  });

  log('\n📊 CI/CD Pipeline Setup Summary:', colors.cyan);
  log('================================', colors.cyan);
  log(`Completed: ${successCount}/${steps.length} steps`);

  if (successCount === steps.length) {
    logSuccess('CI/CD Pipeline setup completed successfully!');
    log('');
    log('🚀 CI/CD Features implemented:', colors.yellow);
    log('1. GitHub Actions workflows');
    log('2. Automated testing and deployment');
    log('3. Security scanning');
    log('4. Performance testing');
    log('5. Docker containerization');
    log('6. Multi-environment deployment');
    log('');
    log('🔒 Next steps:', colors.blue);
    log('1. Add secrets to GitHub repository');
    log('2. Configure branch protection rules');
    log('3. Test CI/CD pipeline');
    log('4. Setup monitoring and alerts');
    log('5. Deploy to production');
    log('');
    log('📚 Documentation:', colors.blue);
    log('- docs/CICD.md: CI/CD documentation');
    log('- .github/workflows/: GitHub Actions workflows');
    log('- scripts/: Deployment scripts');
  } else {
    logError('Some CI/CD setup steps failed. Please check the errors above.');
  }
}

// Run CI/CD setup
main();
