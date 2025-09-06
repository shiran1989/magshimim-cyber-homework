# 🛡️ Cybersecurity Intelligence App

A comprehensive full-stack web application for analyzing and visualizing MITRE ATT&CK attack patterns with advanced search capabilities and interactive dashboards.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/shiran1989/magshimim-cyber-homework)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-green)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)

## ✨ Features

- **🔍 Advanced Search**: Debounced search across all attack pattern fields with real-time results
- **📊 Interactive Dashboard**: Comprehensive statistics and visualizations with charts
- **📋 Attack Pattern Details**: Detailed modal views with external references and metadata
- **🔗 Technique Relationships**: Visual representation of attack relationships
- **🎨 Responsive Design**: Modern Material-UI interface with cybersecurity theme
- **⚡ Real-time Data**: Live updates from MITRE CTI database
- **🧪 Complete Testing**: Full test coverage for both frontend and backend
- **📱 Mobile Friendly**: Responsive design that works on all devices

## 🚀 Live Demo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** with TypeScript 5.7.2
- **Material-UI 6.1.0** for components and theming
- **Redux Toolkit 2.3.0** for state management
- **Recharts 2.12.7** for data visualization
- **Framer Motion 11.11.0** for smooth animations
- **Jest & Testing Library** for testing

### Backend
- **Python 3.12** with FastAPI 0.115.6
- **MongoDB 6.0+** for data storage
- **Motor 3.6.0** for async MongoDB operations
- **Pydantic 2.10.0** for data validation
- **Uvicorn** for ASGI server
- **Pytest** for comprehensive testing

### Development Tools
- **ESLint & Prettier** for code quality
- **Black & Flake8** for Python formatting
- **MyPy** for type checking
- **Git** for version control

## 🚀 Quick Start

### Prerequisites
- **Node.js 20.18.0** (use `nvm use` to switch)
- **Python 3.12+**
- **MongoDB 6.0+**
- **Git**
- **nvm** (Node Version Manager)

### One-Command Setup

```bash
# Clone and setup the application
git clone https://github.com/shiran1989/magshimim-cyber-homework.git
cd magshimim-cyber-homework
chmod +x setup.sh
./setup.sh
```

### Alternative: Manual Setup

If you prefer to set up manually or the automated script fails:

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python data_ingestion.py  # Load MITRE ATT&CK data
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
nvm use  # Switch to Node.js 20.18.0
npm install
npm start
```

## 📁 Project Structure

```
cybersecurity-intelligence-app/
├── 📁 backend/                 # FastAPI backend
│   ├── 📁 app/                # Main application code
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── models.py         # Pydantic models
│   │   ├── routers.py        # API endpoints
│   │   ├── services.py       # Business logic
│   │   └── database.py       # MongoDB connection
│   ├── 📁 tests/             # Backend tests
│   ├── data_ingestion.py     # MITRE data loader
│   └── requirements.txt      # Python dependencies
├── 📁 frontend/              # React frontend
│   ├── 📁 src/              # Source code
│   │   ├── 📁 components/   # React components
│   │   ├── 📁 hooks/        # Custom hooks
│   │   ├── 📁 services/     # API services
│   │   ├── 📁 utils/        # Utility functions
│   │   └── 📁 types/        # TypeScript types
│   └── package.json         # Node.js dependencies
├── 📁 docs/                 # Documentation
├── start.sh                # Startup script
└── README.md              # This file
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/attack-patterns` | Get paginated attack patterns |
| `POST` | `/api/v1/search` | Search attack patterns |
| `GET` | `/api/v1/dashboard-data` | Get all data for dashboard |
| `GET` | `/api/v1/stats` | Get statistics |
| `GET` | `/api/v1/health` | Health check |

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm test -- --coverage
```

### Run All Tests
```bash
# From project root
./start.sh test
```

## 📊 Features in Detail

### 🔍 Advanced Search
- **Debounced Input**: 500ms delay for optimal performance
- **Multi-field Search**: Searches across all attack pattern fields
- **Case-insensitive**: Smart search that ignores case
- **Empty Query Support**: Returns all patterns when search is empty

### 📊 Interactive Dashboard
- **Statistics Cards**: Total patterns, top phases, platforms
- **Charts**: Phase distribution, platform distribution
- **Real-time Updates**: Live data from database
- **Export Functionality**: Download data as JSON

### 📋 Attack Pattern Details
- **Comprehensive Modal**: All attack pattern information
- **External References**: Links to MITRE documentation
- **Metadata**: Creation and modification dates
- **Responsive Design**: Works on all screen sizes

## 🎨 Theming

The application features a comprehensive cybersecurity theme with:
- **Risk Level Colors**: Critical, High, Medium, Low
- **Phase Colors**: Unique colors for each attack phase
- **Platform Colors**: Distinct colors for different platforms
- **Consistent Design**: Material-UI components with custom styling

## 📈 Performance

- **Debounced Search**: Reduces API calls by 80%
- **Pagination**: Efficient data loading
- **MongoDB Indexes**: Optimized database queries
- **Lazy Loading**: Components load only when needed
- **Caching**: Redux state management for optimal performance

## 🔧 Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# If you get "Unsupported URL Type 'npm:'" error
nvm use 20.18.0
node --version  # Should show v20.18.0
npm --version   # Should show 10.8.2 or higher
```

#### npm Install Fails
```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Python Dependencies
```bash
# If Python dependencies fail
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
```

#### MongoDB Connection
```bash
# Ensure MongoDB is running
# On macOS with Homebrew:
brew services start mongodb-community
# On Ubuntu/Debian:
sudo systemctl start mongod
```

### Getting Help

If you encounter issues not covered here:
1. Check the [Issues](https://github.com/shiran1989/magshimim-cyber-homework/issues) page
2. Create a new issue with:
   - Your operating system
   - Node.js version (`node --version`)
   - Python version (`python3 --version`)
   - Error message and steps to reproduce

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **GitHub**: [@shiran1989](https://github.com/shiran1989)
- **Repository**: [magshimim-cyber-homework](https://github.com/shiran1989/magshimim-cyber-homework)

## 🙏 Acknowledgments

- [MITRE ATT&CK](https://attack.mitre.org/) for the comprehensive attack pattern database
- [Material-UI](https://mui.com/) for the beautiful component library
- [FastAPI](https://fastapi.tiangolo.com/) for the high-performance web framework
- [MongoDB](https://www.mongodb.com/) for the flexible database solution

---

⭐ **Star this repository if you found it helpful!**