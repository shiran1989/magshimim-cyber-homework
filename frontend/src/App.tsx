import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import {
  useGetAttackPatternsQuery,
  useGetStatsQuery,
  useGetDashboardDataQuery,
} from './services/api';
import { useSearch } from './hooks/useSearch';
import { usePagination } from './hooks/usePagination';
import { AttackPattern } from './types';
import SearchBar from './components/SearchBar';
import AttackPatternTable from './components/AttackPatternTable';
import StatsPanel from './components/StatsPanel';
import AdvancedDashboard from './components/AdvancedDashboard';
import TechniqueRelationships from './components/TechniqueRelationships';
import AttackPatternDetailsModal from './components/AttackPatternDetailsModal';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Blue for primary actions
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e', // Red for alerts/danger
      light: '#ff5983',
      dark: '#9a0036',
    },
    error: {
      main: '#d32f2f', // Red for errors
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02', // Orange for warnings
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1', // Light blue for info
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#2e7d32', // Green for success
      light: '#4caf50',
      dark: '#1b5e20',
    },
    // Custom colors for cybersecurity theme
    cybersecurity: {
      critical: '#d32f2f', // Critical threats
      high: '#f57c00', // High risk
      medium: '#fbc02d', // Medium risk
      low: '#388e3c', // Low risk
      info: '#1976d2', // Information
      phase: {
        initialAccess: '#e91e63',
        execution: '#9c27b0',
        persistence: '#673ab7',
        privilegeEscalation: '#3f51b5',
        defenseEvasion: '#2196f3',
        credentialAccess: '#03a9f4',
        discovery: '#00bcd4',
        lateralMovement: '#009688',
        collection: '#4caf50',
        commandAndControl: '#8bc34a',
        exfiltration: '#cddc39',
        impact: '#ffeb3b',
      },
      platform: {
        windows: '#0078d4',
        linux: '#fcc624',
        macos: '#000000',
        network: '#6c757d',
        containers: '#0d7377',
        esxi: '#00d4aa',
      },
    },
  },
  typography: {
    h4: {
      fontWeight: 'bold',
    },
    h6: {
      fontWeight: 'bold',
    },
  },
  // Custom component styles
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function AppContent() {
  const [tabValue, setTabValue] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<AttackPattern | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const {
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  } = usePagination(0, 10);
  const {
    clearSearch,
    updateQuery,
    updatePagination,
    query,
    searchResults,
    totalResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearch();

  // Get all patterns with pagination
  const {
    data: patternsData,
    isLoading: isPatternsLoading,
    error: patternsError,
  } = useGetAttackPatternsQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  // Get statistics
  const { data: statsData, isLoading: isStatsLoading } = useGetStatsQuery();

  // Get dashboard data (all patterns)
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useGetDashboardDataQuery();

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setIsSearchMode(true);
      resetPagination();
      updatePagination(pageSize, 0);
      // The search will be triggered by the debounce effect
    }
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    clearSearch();
    resetPagination();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (pattern: AttackPattern) => {
    setSelectedPattern(pattern);
    setModalOpen(true);
  };

  const handleSecurityInfo = (pattern: AttackPattern) => {
    // For now, same as view details - can be customized later
    setSelectedPattern(pattern);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPattern(null);
  };

  // Update search pagination when page changes
  useEffect(() => {
    if (isSearchMode && query.trim()) {
      updatePagination(pageSize, page * pageSize);
    }
  }, [isSearchMode, query, pageSize, page, updatePagination]);

  const currentPatterns = isSearchMode
    ? searchResults
    : patternsData?.results || [];
  const currentTotal = isSearchMode ? totalResults : patternsData?.total || 0;
  const currentLoading = isSearchMode ? isSearchLoading : isPatternsLoading;
  const currentError = isSearchMode ? searchError : patternsError;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            🛡️ Cybersecurity Intelligence Platform
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label='Attack Patterns' />
            <Tab label='🛡️ Cybersecurity Intelligence Dashboard' />
            <Tab label='Technique Relationships' />
            <Tab label='Statistics' />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            onQueryChange={updateQuery}
            query={query}
            isLoading={isSearchLoading}
          />

          {currentError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {typeof currentError === 'string'
                ? currentError
                : 'An error occurred while loading data'}
            </Alert>
          )}

          <AttackPatternTable
            patterns={currentPatterns}
            isLoading={currentLoading}
            error={currentError ? 'Failed to load attack patterns' : ''}
            totalCount={currentTotal}
            currentPage={page + 1}
            pageSize={pageSize}
            onPageChange={newPage => handlePageChange(newPage - 1)}
            onPageSizeChange={handlePageSizeChange}
            onViewDetails={handleViewDetails}
            onSecurityInfo={handleSecurityInfo}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AdvancedDashboard
            patterns={dashboardData?.results || []}
            isLoading={isDashboardLoading}
            error={dashboardError ? 'Failed to load dashboard data' : ''}
            onRefresh={() => window.location.reload()}
            onExport={() => {
              const dataStr = JSON.stringify(
                dashboardData?.results || [],
                null,
                2
              );
              const dataBlob = new Blob([dataStr], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'all-attack-patterns.json';
              link.click();
              URL.revokeObjectURL(url);
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TechniqueRelationships
            patterns={currentPatterns}
            isLoading={currentLoading}
            error={currentError ? 'Failed to load data' : ''}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <StatsPanel
            stats={
              statsData || {
                total_patterns: 0,
                phase_distribution: [],
                platform_distribution: [],
              }
            }
            isLoading={isStatsLoading}
          />
        </TabPanel>
      </Container>

      {/* Attack Pattern Details Modal */}
      <AttackPatternDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        pattern={selectedPattern}
      />
    </Box>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
