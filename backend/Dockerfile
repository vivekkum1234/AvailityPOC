# Backend Dockerfile for AWS App Runner
FROM node:16-alpine
# Set working directory
WORKDIR /app
# Copy package files first
COPY package*.json ./
# Install dependencies
RUN npm ci --only=production
# Copy source code
COPY . .
# Build TypeScript
RUN npm run build
# Expose port (App Runner default)
EXPOSE 3002
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1
# Start the app
CMD ["npm", "start"]