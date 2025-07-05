# LinkedIn AI Automation Tool - Deployment Guide

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** and npm 9+
2. **PostgreSQL** database
3. **Redis** server (for job queues)
4. **OpenAI API** key
5. **LinkedIn API** credentials

### Environment Setup

1. **Clone and setup:**
```bash
git clone <repository>
cd ai-automation-tool
npm install
```

2. **Configure environment variables:**
```bash
# Frontend
cp frontend/env.example frontend/.env
# Backend
cp backend/env.example backend/.env
# AI Service
cp ai-service/env.example ai-service/.env
# Scheduler
cp scheduler/env.example scheduler/.env
```

3. **Update environment variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `LINKEDIN_CLIENT_ID`: LinkedIn OAuth client ID
   - `LINKEDIN_CLIENT_SECRET`: LinkedIn OAuth client secret
   - `DATABASE_URL`: PostgreSQL connection string
   - `REDIS_URL`: Redis connection string

### Database Setup

1. **Install Prisma CLI:**
```bash
cd backend
npm install -g prisma
```

2. **Initialize database:**
```bash
npx prisma migrate dev
npx prisma generate
```

### Development

1. **Start all services:**
```bash
npm run dev
```

2. **Or start individually:**
```bash
# Frontend (React)
cd frontend && npm run dev

# Backend (Express API)
cd backend && npm run dev

# AI Service
cd ai-service && npm run dev

# Scheduler
cd scheduler && npm run dev
```

## 🏗️ Production Deployment

### Option 1: Vercel + Railway

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Railway):**
```bash
cd backend
railway up
```

### Option 2: Docker Deployment

1. **Build images:**
```bash
docker build -t linkedin-ai-frontend ./frontend
docker build -t linkedin-ai-backend ./backend
docker build -t linkedin-ai-service ./ai-service
docker build -t linkedin-ai-scheduler ./scheduler
```

2. **Run with Docker Compose:**
```bash
docker-compose up -d
```

### Option 3: Kubernetes

1. **Apply configurations:**
```bash
kubectl apply -f k8s/
```

2. **Monitor deployment:**
```bash
kubectl get pods
kubectl logs -f deployment/linkedin-ai-backend
```

## 🔧 Configuration

### LinkedIn API Setup

1. **Create LinkedIn App:**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Create a new app
   - Add OAuth 2.0 redirect URLs
   - Request necessary permissions

2. **Configure OAuth:**
   - Set redirect URI: `https://yourdomain.com/auth/callback`
   - Enable OAuth 2.0 scopes: `r_liteprofile w_member_social`

### OpenAI Configuration

1. **Get API Key:**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create API key
   - Set usage limits

2. **Configure Models:**
   - Default: GPT-4
   - Fallback: GPT-3.5-turbo
   - Set temperature: 0.8 for creativity

### Database Configuration

**PostgreSQL:**
```sql
CREATE DATABASE linkedin_ai_db;
CREATE USER linkedin_ai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE linkedin_ai_db TO linkedin_ai_user;
```

**Redis:**
```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health Checks:**
   - Backend: `GET /health`
   - AI Service: `GET /health`
   - Scheduler: `GET /health`

2. **Metrics:**
   - Queue statistics
   - API response times
   - Error rates
   - Post engagement rates

### Logging

**Structured Logging:**
```javascript
// Winston logger configuration
const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' }),
  ],
});
```

**Log Rotation:**
```bash
# Install logrotate
sudo apt-get install logrotate

# Configure rotation
sudo nano /etc/logrotate.d/linkedin-ai
```

## 🔒 Security

### Environment Variables

**Required for Production:**
```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port
OPENAI_API_KEY=sk-...
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

### Security Headers

**Helmet Configuration:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));
```

### Rate Limiting

**API Rate Limits:**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
```

## 🚨 Troubleshooting

### Common Issues

1. **LinkedIn OAuth Errors:**
   - Check redirect URI configuration
   - Verify client ID and secret
   - Ensure proper scopes are requested

2. **OpenAI API Errors:**
   - Verify API key is valid
   - Check usage limits
   - Ensure proper model access

3. **Database Connection Issues:**
   - Verify connection string
   - Check database permissions
   - Ensure database is running

4. **Redis Connection Issues:**
   - Verify Redis is running
   - Check connection string
   - Ensure proper authentication

### Debug Mode

**Enable Debug Logging:**
```bash
export DEBUG=linkedin-ai:*
export LOG_LEVEL=debug
npm run dev
```

**Check Service Status:**
```bash
# Check all services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# Check queue status
curl http://localhost:3001/api/queue/stats
```

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer:**
   - Use Nginx or HAProxy
   - Configure sticky sessions
   - Set up health checks

2. **Database Scaling:**
   - Read replicas for analytics
   - Connection pooling
   - Query optimization

3. **Queue Scaling:**
   - Multiple Redis instances
   - Queue partitioning
   - Worker scaling

### Performance Optimization

1. **Caching:**
   - Redis for session storage
   - CDN for static assets
   - API response caching

2. **Database Optimization:**
   - Index optimization
   - Query optimization
   - Connection pooling

3. **API Optimization:**
   - Response compression
   - Request batching
   - Pagination

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Docker Pipeline

```yaml
# .github/workflows/docker.yml
name: Docker Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and push
        run: |
          docker build -t linkedin-ai .
          docker push linkedin-ai:latest
```

## 📞 Support

### Getting Help

1. **Documentation:** Check the README.md
2. **Issues:** Create GitHub issue
3. **Discussions:** Use GitHub Discussions
4. **Email:** support@linkedin-ai.com

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

---

**Happy Deploying! 🚀** 