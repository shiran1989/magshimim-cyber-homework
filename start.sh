#!/bin/bash

# Cybersecurity Intelligence Application Startup Script
# Version: 2.0.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}🛡️  Cybersecurity Intelligence${NC}"
    echo -e "${PURPLE}   Application Startup Script${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $((max_attempts * 2)) seconds"
    return 1
}

# Function to cleanup processes
cleanup() {
    print_status "Shutting down application..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend server stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend server stopped"
    fi
    
    # Kill any remaining processes on our ports
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    print_success "Application shutdown complete"
    exit 0
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Main execution
main() {
    print_header
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    # Check nvm and Node.js
    # Load nvm first
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    if ! command_exists nvm; then
        print_error "nvm (Node Version Manager) is not installed."
        print_status "Please install nvm first:"
        print_status "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        print_status "  or visit: https://github.com/nvm-sh/nvm"
        exit 1
    fi
    
    # nvm is already loaded above
    
    # Use Node.js version from .nvmrc
    print_status "Using Node.js version from .nvmrc..."
    if ! nvm use; then
        print_error "Failed to use Node.js version from .nvmrc"
        print_status "Installing Node.js version from .nvmrc..."
        nvm install
        nvm use
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    print_success "Node.js version: $NODE_VERSION"
    
    # Check Python
    if ! command_exists python3; then
        print_error "Python is not installed. Please install Python 3.12 or later."
        print_status "Download from: https://www.python.org/downloads/"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python version: $PYTHON_VERSION"
    
    # Check MongoDB
    if ! command_exists mongod; then
        print_warning "MongoDB is not installed. Please install MongoDB 6.0 or later."
        print_status "Installation instructions:"
        print_status "  macOS: brew install mongodb-community"
        print_status "  Ubuntu: https://docs.mongodb.com/manual/installation/"
        exit 1
    fi
    
    # Check if MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB is not running. Attempting to start..."
        
        # Try to start MongoDB
        if command_exists brew; then
            brew services start mongodb-community 2>/dev/null || true
        elif command_exists systemctl; then
            sudo systemctl start mongod 2>/dev/null || true
        fi
        
        # Wait a moment and check again
        sleep 3
        if ! pgrep -x "mongod" > /dev/null; then
            print_error "Failed to start MongoDB. Please start it manually:"
            print_status "  macOS: brew services start mongodb-community"
            print_status "  Ubuntu: sudo systemctl start mongod"
            exit 1
        fi
    fi
    
    print_success "MongoDB is running"
    
    # Check if ports are available
    if port_in_use 8000; then
        print_warning "Port 8000 is already in use. Attempting to free it..."
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    if port_in_use 3000; then
        print_warning "Port 3000 is already in use. Attempting to free it..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    print_success "Prerequisites check passed"
    
    # Start backend
    print_status "Starting backend server..."
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Copy environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file from template..."
        cp env.example .env
        print_warning "Please edit .env file with your MongoDB connection string if needed"
    fi
    
    # Run data ingestion
    print_status "Ingesting MITRE ATT&CK data..."
    python data_ingestion.py
    
    # Start backend server
    print_status "Starting FastAPI server on port 8000..."
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    if ! wait_for_service "http://localhost:8000/api/v1/health" "Backend API"; then
        print_error "Failed to start backend server"
        exit 1
    fi
    
    # Start frontend
    print_status "Starting frontend server..."
    cd ../frontend
    
    # Ensure we're using the correct Node.js version
    print_status "Ensuring correct Node.js version for frontend..."
    nvm use
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install --legacy-peer-deps
    
    # Start frontend server
    print_status "Starting React development server on port 3000..."
    npm start &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    if ! wait_for_service "http://localhost:3000" "Frontend"; then
        print_error "Failed to start frontend server"
        exit 1
    fi
    
    # Success message
    echo ""
    print_success "🎉 Application started successfully!"
    echo ""
    echo -e "${CYAN}🌐 Frontend:${NC} http://localhost:3000"
    echo -e "${CYAN}🔧 Backend API:${NC} http://localhost:8000"
    echo -e "${CYAN}📚 API Documentation:${NC} http://localhost:8000/docs"
    echo -e "${CYAN}🧪 API Health Check:${NC} http://localhost:8000/api/v1/health"
    echo ""
    print_status "Press Ctrl+C to stop the application"
    echo ""
    
    # Keep script running
    wait
}

# Run main function
main "$@"