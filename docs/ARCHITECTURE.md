# Cybersecurity Intelligence Application - Architecture Documentation

## Overview

The Cybersecurity Intelligence Application is a full-stack web application designed to help intelligence officers identify and analyze potential cyber attacks using MITRE ATT&CK framework data. The application provides a modern, responsive interface for browsing, searching, and analyzing attack patterns.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    MongoDB     ┌─────────────────┐
│   React Frontend │ ◄─────────────► │  FastAPI Backend │ ◄────────────► │   MongoDB       │
│   (Port 3000)   │                 │   (Port 8000)   │                │   Database      │
└─────────────────┘                 └─────────────────┘                └─────────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│   Material-UI   │                 │  MITRE ATT&CK   │
│   Components    │                 │  Data Source    │
└─────────────────┘                 └─────────────────┘
```

## Backend Architecture

### Technology Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB with Motor (async driver)
- **Data Models**: Pydantic for validation and serialization
- **Testing**: Pytest with async support
- **API Documentation**: Automatic OpenAPI/Swagger generation

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # Pydantic data models
│   ├── database.py          # MongoDB connection management
│   ├── services.py          # Business logic layer
│   └── routers.py           # API endpoint definitions
├── tests/                   # Pytest test suite
│   ├── test_models.py
│   ├── test_services.py
│   └── test_routers.py
├── requirements.txt         # Python dependencies
├── pytest.ini             # Pytest configuration
├── data_ingestion.py       # MITRE data import script
└── env.example            # Environment variables template
```

### Data Flow

1. **Data Ingestion**:
   - `data_ingestion.py` fetches MITRE ATT&CK data from GitHub
   - `MITREAttackService` processes and transforms the data
   - Data is stored in MongoDB with proper indexing

2. **API Request Flow**:
   - Client sends HTTP request to FastAPI
   - Request is routed through `routers.py`
   - Business logic is handled in `services.py`
   - Data is retrieved from MongoDB
   - Response is serialized using Pydantic models

### Database Schema

#### AttackPattern Collection
```json
{
  "_id": "ObjectId",
  "id": "T1001",
  "name": "Data Obfuscation",
  "description": "Adversaries may obfuscate data...",
  "x_mitre_platforms": ["Windows", "Linux"],
  "x_mitre_detection": "Monitor network traffic...",
  "phase_name": "Defense Evasion",
  "external_id": "T1001",
  "kill_chain_phases": ["defense-evasion"],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/attack-patterns` | Get all attack patterns (paginated) |
| POST | `/api/v1/attack-patterns/search` | Search attack patterns |
| GET | `/api/v1/attack-patterns/{id}` | Get specific attack pattern |
| GET | `/api/v1/stats` | Get statistics |

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Library**: Material-UI (MUI) v5
- **HTTP Client**: RTK Query for API communication
- **Styling**: Emotion (CSS-in-JS)
- **Testing**: Jest with React Testing Library

### Project Structure
```
frontend/src/
├── components/              # React components
│   ├── AttackPatternCard.tsx
│   ├── AttackPatternGrid.tsx
│   ├── SearchBar.tsx
│   └── StatsPanel.tsx
├── hooks/                   # Custom React hooks
│   ├── useSearch.ts
│   └── usePagination.ts
├── services/                # API services
│   └── api.ts              # RTK Query API definition
├── store/                   # Redux store configuration
│   └── store.ts
├── types/                   # TypeScript type definitions
│   └── index.ts
└── App.tsx                  # Main application component
```

### Component Architecture

#### Component Hierarchy
```
App
├── AppBar
├── Tabs
│   ├── TabPanel (Attack Patterns)
│   │   ├── SearchBar
│   │   └── AttackPatternGrid
│   │       └── AttackPatternCard (multiple)
│   └── TabPanel (Statistics)
│       └── StatsPanel
```

#### State Management
- **Global State**: Redux store with RTK Query for API state
- **Local State**: React hooks for component-specific state
- **Custom Hooks**: Reusable logic for search and pagination

### Data Flow

1. **Component Mount**: Components mount and trigger API calls
2. **API Calls**: RTK Query handles HTTP requests to backend
3. **State Updates**: Redux store updates with API responses
4. **UI Updates**: Components re-render with new data
5. **User Interactions**: User actions trigger new API calls or state updates

## Key Features Implementation

### 1. Search Functionality
- **Backend**: Case-insensitive regex search on description field
- **Frontend**: Real-time search with debouncing
- **Implementation**: MongoDB `$regex` with `$options: "i"`

### 2. Pagination
- **Backend**: `limit` and `offset` parameters
- **Frontend**: Material-UI Pagination component
- **State**: Custom `usePagination` hook

### 3. Data Visualization
- **Attack Cards**: Material-UI Cards with color-coded phases
- **Statistics**: Charts and lists for phase/platform distribution
- **Responsive Design**: Grid layout that adapts to screen size

### 4. Error Handling
- **Backend**: HTTP status codes and error messages
- **Frontend**: Error boundaries and user-friendly messages
- **API**: RTK Query automatic error handling

## Security Considerations

### Backend Security
- **CORS**: Configured for development (should be restricted in production)
- **Input Validation**: Pydantic models validate all inputs
- **Database**: MongoDB connection with proper authentication
- **Environment Variables**: Sensitive data in environment files

### Frontend Security
- **XSS Protection**: React's built-in XSS protection
- **Input Sanitization**: User inputs are properly escaped
- **API Security**: HTTPS in production (HTTP for development)

## Performance Optimizations

### Backend Optimizations
- **Async Operations**: FastAPI with async/await
- **Database Indexing**: Indexes on frequently queried fields
- **Pagination**: Limit data transfer with pagination
- **Caching**: RTK Query provides automatic caching

### Frontend Optimizations
- **Code Splitting**: React lazy loading
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large lists (future enhancement)
- **Image Optimization**: Optimized assets

## Testing Strategy

### Backend Testing
- **Unit Tests**: Individual function testing with pytest
- **Integration Tests**: API endpoint testing
- **Mocking**: Database and external service mocking
- **Coverage**: Aim for >90% code coverage

### Frontend Testing
- **Component Tests**: React Testing Library
- **Hook Tests**: Custom hook testing
- **Integration Tests**: User interaction testing
- **E2E Tests**: Full application testing (future)

## Deployment Considerations

### Development
- **Local Development**: Docker Compose for easy setup
- **Hot Reloading**: Both frontend and backend support hot reloading
- **Environment**: Separate development and production configs

### Production
- **Containerization**: Docker containers for both services
- **Reverse Proxy**: Nginx for serving static files and API
- **Database**: MongoDB Atlas or self-hosted MongoDB
- **Monitoring**: Application performance monitoring
- **Security**: HTTPS, proper CORS, input validation

## Future Enhancements

### Planned Features
1. **Stage 2**: Cyber Bot with chat interface
2. **Stage 3**: Sandbox integration for file analysis
3. **Advanced Search**: Filters by phase, platform, etc.
4. **Export Functionality**: Export data to various formats
5. **User Authentication**: Multi-user support
6. **Real-time Updates**: WebSocket integration
7. **Mobile App**: React Native version

### Technical Improvements
1. **Caching**: Redis for better performance
2. **Search**: Elasticsearch for advanced search
3. **Analytics**: User behavior tracking
4. **Monitoring**: Application performance monitoring
5. **CI/CD**: Automated testing and deployment

## Conclusion

The Cybersecurity Intelligence Application provides a solid foundation for intelligence officers to analyze cyber threats. The architecture is designed to be scalable, maintainable, and extensible for future enhancements. The separation of concerns between frontend and backend allows for independent development and deployment, while the use of modern technologies ensures good performance and user experience.
