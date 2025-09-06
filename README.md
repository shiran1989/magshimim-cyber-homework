# 🛡️ Cybersecurity Intelligence Application

A comprehensive full-stack web application for managing and analyzing MITRE ATT&CK attack patterns, built for intelligence officers to identify potential cyber attacks and defense strategies.

## 🚀 Features

### Core Features
- ✅ **MITRE ATT&CK Integration** - Import and manage attack patterns from official MITRE repository
- ✅ **Advanced Search** - Case-insensitive keyword search across attack descriptions
- ✅ **Interactive Dashboard** - Real-time analytics and visualizations
- ✅ **Technique Relationships** - Visual network showing connections between attack patterns
- ✅ **Risk Assessment** - Automated risk level classification
- ✅ **Export Capabilities** - Export data in multiple formats
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

### Advanced Features (Bonus)
- 🎯 **Interactive Network Visualization** - Drag-and-drop relationship mapping
- 📊 **Real-time Analytics** - Live charts and statistics
- 🔍 **Advanced Filtering** - Multi-criteria search and filtering
- 📱 **Modern UI/UX** - Material Design with smooth animations
- 🔗 **Technique Correlation** - AI-powered pattern relationship detection

## 🛠️ Tech Stack

### Backend
- **Python 3.12** with FastAPI 0.115.6
- **MongoDB 6.0+** for data storage
- **Pytest 8.3+** for comprehensive testing
- **Motor 3.6** for async MongoDB operations
- **Pydantic 2.10** for data validation
- **Uvicorn** for ASGI server

### Frontend
- **React 18.3** with TypeScript 5.7
- **Material-UI 6.1** for modern components
- **Redux Toolkit 2.3** for state management
- **Recharts 2.12** for data visualization
- **Framer Motion 11.11** for animations
- **Jest & Testing Library** for testing

### Development Tools
- **ESLint & Prettier** for code quality
- **TypeScript** for type safety
- **Pytest** for backend testing
- **Jest** for frontend testing
- **Black** for Python code formatting

## Prerequisites

- **Node.js 18.20.8** (use `.nvmrc` file)
- **Python 3.11+**
- **MongoDB** (local or cloud instance)

## Quick Start

### 1. Clone and Setup Node Version
```bash
git clone <repository-url>
cd cybersecurity-intelligence-app
nvm use  # This will use Node.js 18.20.8 as specified in .nvmrc
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your MongoDB connection string
python data_ingestion.py  # Populate database with MITRE ATT&CK data
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Features

### Stage 1 - Web Application
- ✅ Import MITRE ATT&CK attack patterns from GitHub
- ✅ Display attacks in grid/list format
- ✅ Search by keywords in descriptions (case-insensitive)
- ✅ Show attack details (name, description, platforms, detection methods, phases)
- ✅ Modern Material-UI interface
- ✅ Responsive design

### Future Stages
- Stage 2: Cyber Bot with chat interface
- Stage 3: Sandbox integration for file analysis

## Project Structure

```
cybersecurity-intelligence-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # Pydantic models
│   │   ├── database.py      # MongoDB connection
│   │   ├── services.py      # Business logic
│   │   └── routers.py       # API endpoints
│   ├── tests/               # Pytest tests
│   ├── requirements.txt     # Python dependencies
│   └── data_ingestion.py    # MITRE data import script
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json        # Node dependencies
├── docs/                   # Documentation
├── .nvmrc                  # Node.js version specification
└── README.md
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Environment Variables
Create `.env` file in backend directory:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=cybersecurity_intelligence
API_HOST=0.0.0.0
API_PORT=8000
```

## API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/attack-patterns` - Get all attack patterns (paginated)
- `POST /api/v1/attack-patterns/search` - Search attack patterns
- `GET /api/v1/attack-patterns/{id}` - Get specific attack pattern
- `GET /api/v1/stats` - Get statistics

## Contributing

1. Ensure you're using Node.js 18.20.8 (`nvm use`)
2. Follow TypeScript and Python coding standards
3. Write tests for new features
4. Update documentation as needed

## License

This project is developed for educational purposes as part of the 2025 Development Exercise.
