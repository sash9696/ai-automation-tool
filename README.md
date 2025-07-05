# AI LinkedIn Automation Tool

A scalable, production-ready MVP for automating viral LinkedIn posts targeting software engineers.

## 🚀 Features

- **AI-Powered Post Generation**: Daily posts using OpenAI for maximum engagement
- **Topic Categories**: Full Stack Development, DSA, Interview Prep, College Placements
- **Viral Optimization**: Hooks, CTAs, hashtags, and optimal timing
- **Smart Scheduling**: Automated daily posting at optimal times
- **Analytics Dashboard**: Track views, likes, comments, and engagement
- **LinkedIn Integration**: Direct API posting with OAuth2 authentication

## 🏗️ Architecture

```
ai-automation-tool/
├── frontend/          # React + TypeScript UI
├── backend/           # Express API server
├── ai-service/        # OpenAI integration & post generation
├── scheduler/         # CRON jobs & scheduling
├── config/           # Environment & deployment configs
└── docs/             # Documentation
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **AI**: OpenAI GPT-4, Custom prompt engineering
- **Scheduling**: node-cron, BullMQ
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis + BullMQ for job processing
- **Deployment**: Vercel (frontend), Railway (backend)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database
- Redis server (for job queues)
- OpenAI API key
- LinkedIn API credentials

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd ai-automation-tool
npm install
```

2. **Environment Setup:**
```bash
# Copy environment templates
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
cp scheduler/.env.example scheduler/.env
```

3. **Configure environment variables:**
   - OpenAI API key
   - LinkedIn API credentials
   - Database connection strings
   - Redis connection

4. **Database Setup:**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. **Start Development:**
```bash
npm run dev
```

## 📊 API Documentation

### Core Endpoints

- `POST /api/posts/generate` - Generate AI post
- `POST /api/posts/schedule` - Schedule post
- `GET /api/posts/analytics` - Get post analytics
- `POST /api/linkedin/auth` - LinkedIn OAuth
- `POST /api/linkedin/post` - Publish to LinkedIn

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway)
```bash
cd backend
railway up
```

### Environment Variables
Set production environment variables in your deployment platform:
- `DATABASE_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

## 📈 Scaling Considerations

- **Microservices**: Each service can be deployed independently
- **Load Balancing**: API routes support horizontal scaling
- **Caching**: Redis for session and job caching
- **Monitoring**: Built-in logging and error tracking
- **Rate Limiting**: API rate limiting for external services

## 🔧 Development

### Code Structure
- **TypeScript**: Full type safety across all services
- **ESLint + Prettier**: Consistent code formatting
- **Testing**: Jest for unit tests, Playwright for E2E
- **Git Hooks**: Pre-commit linting and testing

### Adding New Features
1. Create feature branch
2. Implement in appropriate service
3. Add tests
4. Update documentation
5. Submit PR

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team. 