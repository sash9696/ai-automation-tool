#!/bin/bash

# 🚀 LinkedIn AI Automation Tool - Quick Deployment Script
# Deploy all services in 2-3 minutes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm 9+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install workspace dependencies
    npm run install:all 2>/dev/null || {
        print_status "Installing dependencies for each service..."
        cd frontend && npm install && cd ..
        cd backend && npm install && cd ..
        cd ai-service && npm install && cd ..
        cd scheduler && npm install && cd ..
    }
    
    print_success "Dependencies installed!"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Copy environment files if they don't exist
    [ ! -f frontend/.env ] && cp frontend/env.example frontend/.env && print_status "Created frontend/.env"
    [ ! -f backend/.env ] && cp backend/env.example backend/.env && print_status "Created backend/.env"
    [ ! -f ai-service/.env ] && cp ai-service/env.example ai-service/.env && print_status "Created ai-service/.env"
    [ ! -f scheduler/.env ] && cp scheduler/env.example scheduler/.env && print_status "Created scheduler/.env"
    
    print_warning "Please update your .env files with your API keys and configuration!"
    print_status "Required environment variables:"
    echo "  - OPENAI_API_KEY"
    echo "  - LINKEDIN_CLIENT_ID"
    echo "  - LINKEDIN_CLIENT_SECRET"
    echo "  - DATABASE_URL (optional for local deployment)"
    echo "  - REDIS_URL (optional for local deployment)"
}

# Function to build all services
build_services() {
    print_status "Building services..."
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    
    # Build backend (if TypeScript)
    if [ -f backend/tsconfig.json ]; then
        cd backend
        npm run build 2>/dev/null || print_warning "Backend build skipped (no build script)"
        cd ..
    fi
    
    print_success "Services built successfully!"
}

# Function to deploy to Vercel (Frontend)
deploy_vercel() {
    print_status "Deploying frontend to Vercel..."
    
    if ! command_exists vercel; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    cd frontend
    vercel --prod --yes
    cd ..
    
    print_success "Frontend deployed to Vercel!"
}

# Function to deploy to Railway (Backend)
deploy_railway() {
    print_status "Deploying backend to Railway..."
    
    if ! command_exists railway; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    cd backend
    railway up
    cd ..
    
    print_success "Backend deployed to Railway!"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Build Docker images
    docker build -t linkedin-ai-frontend ./frontend
    docker build -t linkedin-ai-backend ./backend
    docker build -t linkedin-ai-service ./ai-service
    docker build -t linkedin-ai-scheduler ./scheduler
    
    # Run with Docker Compose
    docker-compose up -d
    
    print_success "Services deployed with Docker!"
}

# Function to start local production
start_local_production() {
    print_status "Starting local production servers..."
    
    # Kill any existing processes
    npm run kill
    
    # Start services in production mode
    cd backend && npm start &
    cd ../ai-service && npm start &
    cd ../scheduler && npm start &
    cd ../frontend && npm start &
    
    # Wait for services to start
    sleep 5
    
    print_success "Local production servers started!"
    print_status "Services running on:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend: http://localhost:3001"
    echo "  - AI Service: http://localhost:3002"
    echo "  - Scheduler: http://localhost:3003"
}

# Function to start development
start_development() {
    print_status "Starting development servers..."
    
    # Kill any existing processes
    npm run kill
    
    # Start all services in development mode
    npm run dev
    
    print_success "Development servers started!"
}

# Function to show status
show_status() {
    print_status "Checking service status..."
    npm run status
}

# Function to show help
show_help() {
    echo "🚀 LinkedIn AI Automation Tool - Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev           Start development servers"
    echo "  local         Start local production servers"
    echo "  vercel        Deploy frontend to Vercel"
    echo "  railway       Deploy backend to Railway"
    echo "  docker        Deploy with Docker"
    echo "  full          Deploy everything (Vercel + Railway)"
    echo "  setup         Setup environment and dependencies"
    echo "  build         Build all services"
    echo "  status        Check service status"
    echo "  stop          Stop all services"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev        # Start development"
    echo "  $0 full       # Deploy to Vercel + Railway"
    echo "  $0 docker     # Deploy with Docker"
    echo ""
}

# Main script logic
main() {
    case "${1:-help}" in
        "dev")
            check_prerequisites
            install_dependencies
            setup_environment
            start_development
            ;;
        "local")
            check_prerequisites
            install_dependencies
            setup_environment
            build_services
            start_local_production
            ;;
        "vercel")
            check_prerequisites
            install_dependencies
            setup_environment
            build_services
            deploy_vercel
            ;;
        "railway")
            check_prerequisites
            install_dependencies
            setup_environment
            deploy_railway
            ;;
        "docker")
            check_prerequisites
            install_dependencies
            setup_environment
            deploy_docker
            ;;
        "full")
            check_prerequisites
            install_dependencies
            setup_environment
            build_services
            deploy_vercel
            deploy_railway
            print_success "Full deployment completed!"
            ;;
        "setup")
            check_prerequisites
            install_dependencies
            setup_environment
            print_success "Setup completed!"
            ;;
        "build")
            check_prerequisites
            build_services
            ;;
        "status")
            show_status
            ;;
        "stop")
            npm run kill
            print_success "All services stopped!"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@" 