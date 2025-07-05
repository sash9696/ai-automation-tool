#!/bin/bash

# AI Automation Tool - Service Management Script
# Usage: ./scripts/dev.sh [start|stop|restart|status]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[AI-AUTOMATION]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Function to kill all services
kill_services() {
    print_status "Stopping all services..."
    
    # Kill processes by port
    lsof -ti:3001,3002,5173,5174,5175,5176,5177 | xargs kill -9 2>/dev/null || true
    
    # Kill processes by name
    pkill -f "node.*3001" || true
    pkill -f "node.*3002" || true
    pkill -f "vite" || true
    pkill -f "nodemon" || true
    
    print_success "All services stopped"
}

# Function to start services
start_services() {
    print_status "Starting all services..."
    
    # Kill any existing processes first
    kill_services
    
    # Wait a moment for ports to be freed
    sleep 2
    
    # Start services using npm scripts
    npm run dev
}

# Function to check service status
check_status() {
    print_status "Checking service status..."
    
    # Check Backend
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend: Running on port 3001"
    else
        print_error "Backend: Not running"
    fi
    
    # Check AI Service
    if curl -s http://localhost:3002/health > /dev/null 2>&1; then
        print_success "AI Service: Running on port 3002"
    else
        print_error "AI Service: Not running"
    fi
    
    # Check Frontend
    if curl -s -I http://localhost:5173 > /dev/null 2>&1; then
        print_success "Frontend: Running on port 5173"
    else
        print_error "Frontend: Not running"
    fi
}

# Function to show help
show_help() {
    echo "AI Automation Tool - Service Management"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services (backend, AI service, frontend)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Check status of all services"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start    # Start all services"
    echo "  $0 stop     # Stop all services"
    echo "  $0 status   # Check service status"
}

# Main script logic
case "${1:-start}" in
    "start")
        start_services
        ;;
    "stop")
        kill_services
        ;;
    "restart")
        print_status "Restarting all services..."
        kill_services
        sleep 2
        start_services
        ;;
    "status")
        check_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 