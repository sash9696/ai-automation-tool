# 🚀 Quick Deployment Guide - 2-3 Minutes

## Prerequisites
- Node.js 18+ and npm 9+
- Git (for cloning)
- API Keys (OpenAI, LinkedIn)

## 🎯 Quick Deployment Options

### Option 1: Development (Fastest - 30 seconds)
```bash
# Start development servers
npm run deploy:dev
```

### Option 2: Local Production (1-2 minutes)
```bash
# Build and start local production servers
npm run deploy:local
```

### Option 3: Cloud Deployment (2-3 minutes)

#### A. Vercel + Railway (Recommended)
```bash
# Deploy frontend to Vercel and backend to Railway
npm run deploy:full
```

#### B. Docker (Self-hosted)
```bash
# Deploy with Docker Compose
npm run deploy:docker
```

#### C. Individual Services
```bash
# Deploy frontend only
npm run deploy:vercel

# Deploy backend only  
npm run deploy:railway
```

## 🔧 Setup Commands

### Initial Setup (First time only)
```bash
# Setup environment and dependencies
npm run deploy:setup
```

### Check Status
```bash
# Check if services are running
npm run deploy:status
```

### Stop Services
```bash
# Stop all services
npm run deploy:stop
```

## 📋 Required Environment Variables

Create `.env` files in each service directory:

### Backend (.env)
```env
OPENAI_API_KEY=your_openai_key
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### AI Service (.env)
```env
OPENAI_API_KEY=your_openai_key
```

## 🌐 Deployment URLs

After deployment, your services will be available at:

- **Development**: http://localhost:5173 (frontend)
- **Local Production**: http://localhost:3000 (frontend)
- **Vercel**: https://your-app.vercel.app
- **Railway**: https://your-app.railway.app

## 🚨 Troubleshooting

### Port Conflicts
```bash
# Kill all processes and restart
npm run deploy:stop
npm run deploy:dev
```

### Missing Dependencies
```bash
# Reinstall dependencies
npm run deploy:setup
```

### Environment Issues
```bash
# Check environment setup
npm run deploy:setup
```

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- AI Service: `GET /health`
- Scheduler: `GET /health`

### Logs
```bash
# View logs for all services
docker-compose logs -f
```

## 🎉 Success Indicators

✅ All services show "Running" status  
✅ Health checks return 200 OK  
✅ Frontend loads without errors  
✅ Custom prompts work correctly  
✅ LinkedIn authentication works  

## 🔄 Update Deployment

To update your deployment:

```bash
# Pull latest changes
git pull origin main

# Redeploy
npm run deploy:full
```

## 📞 Support

If you encounter issues:
1. Check the logs: `npm run deploy:status`
2. Verify environment variables
3. Ensure all prerequisites are met
4. Check the full deployment guide in `DEPLOYMENT.md` 