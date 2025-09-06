# Installation Guide

## Prerequisites

Before installing the Cybersecurity Intelligence Application, ensure you have the following installed:

### Required Software
- **Node.js 18.20.8** (use `.nvmrc` file)
- **Python 3.11+**
- **MongoDB** (local or cloud instance)
- **Git** (for cloning the repository)

### Optional but Recommended
- **nvm** (Node Version Manager)
- **Docker** (for containerized deployment)
- **VS Code** (with Python and TypeScript extensions)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cybersecurity-intelligence-app
```

### 2. Use Correct Node Version
```bash
nvm use  # This will use Node.js 18.20.8 as specified in .nvmrc
```

### 3. Run the Startup Script
```bash
./start.sh
```

This script will:
- Check prerequisites
- Set up Python virtual environment
- Install backend dependencies
- Install frontend dependencies
- Start both backend and frontend servers

## Manual Installation

If you prefer to set up the services manually:

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create Python virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB connection string
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

6. **Populate database with MITRE ATT&CK data**
   ```bash
   python data_ingestion.py
   ```

7. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Verification

After installation, verify that everything is working:

1. **Backend API**: Visit http://localhost:8000/docs
2. **Frontend App**: Visit http://localhost:3000
3. **Health Check**: Visit http://localhost:8000/api/v1/health

## Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Check current Node version
node --version

# If not 18.20.8, use nvm
nvm install 18.20.8
nvm use 18.20.8
```

#### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# If not running, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

#### Python Virtual Environment Issues
```bash
# Make sure you're in the backend directory
cd backend

# Create new virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Port Already in Use
```bash
# Check what's using the ports
lsof -i :3000  # Frontend port
lsof -i :8000  # Backend port

# Kill processes if needed
kill -9 <PID>
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=cybersecurity_intelligence
API_HOST=0.0.0.0
API_PORT=8000
```

### Database Issues

If the database is empty or corrupted:

```bash
cd backend
python data_ingestion.py
```

This will:
- Fetch fresh data from MITRE ATT&CK
- Clear existing data
- Import new attack patterns

## Development Setup

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

### Git Configuration

Create `.gitignore`:

```gitignore
# Python
backend/venv/
backend/__pycache__/
backend/.env
backend/*.pyc

# Node.js
frontend/node_modules/
frontend/build/
frontend/.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

## Production Deployment

### Docker Deployment

1. **Create Dockerfile for backend**
2. **Create Dockerfile for frontend**
3. **Use docker-compose.yml for orchestration**

### Environment Configuration

For production, update environment variables:

```env
MONGODB_URL=mongodb://your-production-mongodb:27017
DATABASE_NAME=cybersecurity_intelligence_prod
API_HOST=0.0.0.0
API_PORT=8000
NODE_ENV=production
```

## Support

If you encounter issues:

1. Check the logs in the terminal
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check that ports 3000 and 8000 are available
5. Review the troubleshooting section above

For additional help, refer to:
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](http://localhost:8000/docs) (when running)
- [React Documentation](https://reactjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
