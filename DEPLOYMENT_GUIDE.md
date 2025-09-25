# AWS Deployment Guide - Node.js 14 Ready (`availity-deploy` Branch)

This guide provides step-by-step instructions for deploying both backend and frontend services to AWS with Node.js 14 compatibility from the `availity-deploy` branch.

## 🚀 Prerequisites

- AWS Account with appropriate permissions
- GitHub repository access
- Node.js 14+ locally for testing
- Required API keys (Supabase, OpenAI, SMTP)

## 📋 Pre-Deployment Checklist

### ✅ Backend Ready for Node.js 14
- [x] Dependencies downgraded for Node.js 14 compatibility
- [x] TypeScript target set to ES2018
- [x] Express-rate-limit downgraded to v6.10.0
- [x] Supabase client downgraded to v2.38.0
- [x] Zod downgraded to v3.20.6
- [x] Port configuration aligned (3002)
- [x] Dockerfile uses Node.js 14-alpine
- [x] Health check endpoint configured

### ✅ Frontend Ready for Node.js 14
- [x] ESLint disabled for build compatibility
- [x] Zod version fixed to v3.20.6
- [x] Build script includes DISABLE_ESLINT_PLUGIN=true
- [x] Dockerfile uses Node.js 14-alpine
- [x] Production environment configured

## 🔧 Backend Deployment (AWS App Runner)

### Step 1: Prepare Environment Variables
Update `backend/.env.production` with your actual values:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
OPENAI_API_KEY=your-actual-openai-key
SMTP_USER=your-actual-smtp-user
SMTP_PASS=your-actual-smtp-password
```

### Step 2: Deploy to AWS App Runner
1. Go to AWS App Runner console
2. Click "Create service"
3. Choose "Source code repository"
4. Connect your GitHub repository
5. Configure:
   - **Repository**: `https://github.com/vivekkum1234/AvailityPOC`
   - **Branch**: `availity-deploy`
   - **Source directory**: `backend/`
   - **Configuration source**: "Use configuration file" (apprunner.yaml)

### Step 3: Configure Environment Variables in AWS Console
Add these environment variables in App Runner service configuration:
```
NODE_ENV=production
PORT=3002
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
OPENAI_API_KEY=your-actual-openai-key
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-actual-smtp-user
SMTP_PASS=your-actual-smtp-password
SMTP_FROM=your-actual-smtp-user
```

### Step 4: Deploy and Test
1. Click "Create & deploy"
2. Wait for deployment to complete
3. Test the health endpoint: `https://your-app.apprunner.amazonaws.com/health`

## 🎨 Frontend Deployment (AWS Amplify)

### Step 1: Update Frontend Environment
Update `frontend/.env.production`:
```bash
REACT_APP_API_URL=https://your-backend-app.apprunner.amazonaws.com
GENERATE_SOURCEMAP=false
DISABLE_ESLINT_PLUGIN=true
```

### Step 2: Deploy to AWS Amplify
1. Go to AWS Amplify console
2. Click "New app" > "Host web app"
3. Connect your GitHub repository
4. Configure:
   - **Repository**: `https://github.com/vivekkum1234/AvailityPOC`
   - **Branch**: `availity-deploy`
   - **App root directory**: `frontend/`

### Step 3: Configure Build Settings
Use the existing `amplify.yml` configuration which includes:
- Node.js 14 compatibility
- ESLint disabled
- Optimized build settings
- Security headers

### Step 4: Deploy and Test
1. Click "Save and deploy"
2. Wait for build and deployment
3. Test the application at your Amplify URL

## 🔍 Verification Steps

### Backend Verification
```bash
# Health check
curl https://your-backend-app.apprunner.amazonaws.com/health

# API test
curl https://your-backend-app.apprunner.amazonaws.com/api/questionnaire
```

### Frontend Verification
1. Open your Amplify app URL
2. Check browser console for errors
3. Test API connectivity
4. Verify all features work

## 🛠️ Troubleshooting

### Common Issues

**Backend Build Fails**
- Check Node.js version in logs (should be 14.x)
- Verify all dependencies are compatible
- Check environment variables are set

**Frontend Build Fails**
- Ensure DISABLE_ESLINT_PLUGIN=true is set
- Check for TypeScript errors
- Verify all dependencies installed

**API Connection Issues**
- Update CORS settings in backend
- Check App Runner URL in frontend env
- Verify security groups/networking

### Logs and Monitoring
- **App Runner**: Check service logs in AWS console
- **Amplify**: Check build logs in Amplify console
- **Application**: Monitor health endpoints

## 📝 Post-Deployment

1. Update DNS records if using custom domain
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Test all functionality end-to-end
5. Update documentation with actual URLs

## 🔐 Security Notes

- Never commit `.env.production` files
- Use AWS Secrets Manager for sensitive data
- Enable HTTPS only
- Configure proper CORS origins
- Set up rate limiting
- Monitor for security issues

## 📞 Support

If you encounter issues:
1. Check AWS service status
2. Review deployment logs
3. Verify environment variables
4. Test locally with Node.js 14
5. Check GitHub Actions (if configured)
