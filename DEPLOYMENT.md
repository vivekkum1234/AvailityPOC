# AWS Deployment Guide

This guide provides step-by-step instructions for deploying both the backend and frontend services to AWS.

## Prerequisites

- AWS CLI configured with appropriate permissions
- GitHub repository with the code
- Environment variables and secrets ready

## Backend Deployment (AWS App Runner)

### 1. Prepare Environment Variables

Set up the following environment variables in AWS App Runner:

```bash
NODE_ENV=production
PORT=3001
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENAI_API_KEY=your-openai-api-key
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

### 2. Deploy to App Runner

1. Go to AWS App Runner console
2. Create a new service
3. Choose "Source code repository"
4. Connect your GitHub repository
5. Select the `backend` folder as the source directory
6. App Runner will automatically detect the `apprunner.yaml` configuration
7. Configure environment variables in the service settings
8. Deploy the service

### 3. Configure Health Checks

App Runner will automatically use the health check endpoint at `/health`.

## Frontend Deployment (AWS Amplify)

### 1. Prepare Environment Variables

Set up the following environment variables in AWS Amplify:

```bash
DISABLE_ESLINT_PLUGIN=true
REACT_APP_API_URL=https://your-backend-app-runner-url.com
```

### 2. Deploy to Amplify

1. Go to AWS Amplify console
2. Create a new app
3. Connect your GitHub repository
4. Select the `frontend` folder as the source directory
5. Amplify will automatically detect the `amplify.yml` configuration
6. Configure environment variables in the app settings
7. Deploy the app

### 3. Configure Custom Domain (Optional)

1. In Amplify console, go to "Domain management"
2. Add your custom domain
3. Configure DNS settings as instructed

## Security Configuration

### 1. AWS IAM Roles

Ensure proper IAM roles are configured for:
- App Runner service role
- Amplify service role

### 2. Environment Variables

- Never commit sensitive data to the repository
- Use AWS Systems Manager Parameter Store or AWS Secrets Manager for sensitive values
- Configure environment variables through AWS console

### 3. Network Security

- Configure VPC settings if needed
- Set up security groups for database access
- Enable HTTPS/SSL certificates

## Monitoring and Logging

### 1. CloudWatch Integration

Both services automatically integrate with CloudWatch for:
- Application logs
- Performance metrics
- Error tracking

### 2. Health Monitoring

- Backend: `/health` endpoint
- Frontend: Amplify built-in health checks

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version compatibility
2. **Environment Variables**: Verify all required variables are set
3. **Database Connection**: Ensure Supabase credentials are correct
4. **CORS Issues**: Configure proper CORS settings in backend

### Logs Access

- App Runner: CloudWatch Logs
- Amplify: Build logs in Amplify console

## Cost Optimization

- Use appropriate instance sizes
- Configure auto-scaling settings
- Monitor usage and adjust resources as needed

## Backup and Recovery

- Database: Supabase handles backups automatically
- Code: Ensure GitHub repository is properly backed up
- Configuration: Document all environment variables and settings
