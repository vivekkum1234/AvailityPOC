# Frontend-Backend URL Mapping Guide

## Current Setup
Your frontend is configured to dynamically determine the backend API URL based on environment variables and deployment context.

## Configuration Methods

### Method 1: AWS Amplify Environment Variables (Recommended)

1. **Access Amplify Console**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Select your frontend application

2. **Set Environment Variable**
   - Navigate to **App settings** → **Environment variables**
   - Click **Manage variables**
   - Add new variable:
     ```
     Variable name: REACT_APP_API_URL
     Value: https://your-backend-domain.com/api
     ```

3. **Common Backend URL Formats**
   - **AWS App Runner**: `https://abc123def.us-east-1.awsapprunner.com/api`
   - **Elastic Beanstalk**: `https://your-app.us-east-1.elasticbeanstalk.com/api`
   - **API Gateway**: `https://api-id.execute-api.region.amazonaws.com/stage/api`
   - **ALB/ELB**: `https://your-load-balancer-dns.region.elb.amazonaws.com/api`
   - **Custom Domain**: `https://api.yourdomain.com/api`

4. **Redeploy Application**
   - After adding the environment variable, trigger a new deployment
   - Go to **App settings** → **Build settings**
   - Click **Redeploy this version**

### Method 2: Update Code Directly

If you prefer to hardcode the URL, update the fallback in your API service:

```typescript
// In src/services/api.ts, line 16
return 'https://YOUR_ACTUAL_BACKEND_URL/api';
```

## Environment-Specific Configuration

### Development
- Uses: `http://localhost:3002/api`
- For local development with backend running on port 3002

### Production
- Priority 1: `process.env.REACT_APP_API_URL` (from Amplify environment variables)
- Priority 2: Hardcoded fallback URL

## Verification Steps

### 1. Check Environment Variable
```bash
# In your local development, you can test with:
REACT_APP_API_URL=https://your-backend-url.com/api npm start
```

### 2. Test API Connection
Open browser developer tools and check:
- Network tab for API calls
- Console for any CORS or connection errors
- Verify API calls are going to the correct URL

### 3. Common Issues and Solutions

#### CORS Issues
If you get CORS errors, ensure your backend is configured to allow requests from your frontend domain:
```javascript
// Backend CORS configuration should include:
origin: [
  'https://your-amplify-app.amplifyapp.com',
  'http://localhost:3000' // for development
]
```

#### SSL/HTTPS Issues
- Ensure both frontend and backend use HTTPS in production
- Mixed content (HTTPS frontend calling HTTP backend) will be blocked

#### API Path Issues
- Verify your backend API endpoints match the paths in your frontend
- Check if your backend expects `/api` prefix or not

## Testing Your Configuration

### 1. Local Testing
```bash
cd frontend
REACT_APP_API_URL=https://your-backend-url.com/api npm start
```

### 2. Production Testing
1. Deploy with environment variable set
2. Open browser developer tools
3. Navigate through your app
4. Check Network tab to verify API calls are going to correct URL

## Multiple Environment Setup

For different environments (staging, production), you can:

1. **Use Branch-based Environment Variables**
   - In Amplify Console, set different variables for different branches
   - `main` branch → production backend URL
   - `staging` branch → staging backend URL

2. **Environment Variable Examples**
   ```
   # Production (main branch)
   REACT_APP_API_URL=https://prod-api.yourdomain.com/api
   
   # Staging (staging branch)
   REACT_APP_API_URL=https://staging-api.yourdomain.com/api
   ```

## Security Considerations

1. **Environment Variables**
   - Only use `REACT_APP_` prefix for variables you want exposed to the browser
   - Don't put sensitive data in frontend environment variables

2. **API Security**
   - Implement proper authentication/authorization
   - Use HTTPS for all production communications
   - Configure CORS properly

## Next Steps

1. **Get your backend URL** from your deployment (App Runner, Elastic Beanstalk, etc.)
2. **Set the environment variable** in Amplify Console
3. **Redeploy your frontend** application
4. **Test the connection** using browser developer tools
5. **Monitor for errors** and adjust CORS settings if needed

## Quick Commands

```bash
# Test locally with specific backend URL
REACT_APP_API_URL=https://your-backend.com/api npm start

# Build with environment variable
REACT_APP_API_URL=https://your-backend.com/api npm run build
```
