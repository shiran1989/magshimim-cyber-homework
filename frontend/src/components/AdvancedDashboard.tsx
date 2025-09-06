import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  Security,
  Info,
  Refresh,
  Download,
  Share,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { AttackPattern } from '../types';
import { useCybersecurityColors, getChartColors } from '../utils/themeUtils';

interface AdvancedDashboardProps {
  patterns: AttackPattern[];
  isLoading: boolean;
  error?: string;
  onRefresh: () => void;
  onExport: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  patterns,
  isLoading,
  error,
  onRefresh,
  onExport,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const cybersecurityColors = useCybersecurityColors();
  interface PhaseDistribution {
    phase: string;
    count: number;
    percentage: string;
  }

  interface PlatformDistribution {
    platform: string;
    count: number;
    percentage: string;
  }

  interface DashboardStats {
    totalPatterns: number;
    phaseDistribution: PhaseDistribution[];
    platformDistribution: PlatformDistribution[];
    recentPatterns: AttackPattern[];
  }

  const [stats, setStats] = useState<DashboardStats>({
    totalPatterns: 0,
    phaseDistribution: [],
    platformDistribution: [],
    recentPatterns: [],
  });

  useEffect(() => {
    if (patterns.length > 0) {
      calculateStats();
    }
  }, [patterns]);

  const calculateStats = () => {
    const phaseCount: { [key: string]: number } = {};
    const platformCount: { [key: string]: number } = {};

    patterns.forEach(pattern => {
      // Phase distribution
      const phase = pattern.phase_name || 'Unknown';
      phaseCount[phase] = (phaseCount[phase] || 0) + 1;

      // Platform distribution
      pattern.x_mitre_platforms.forEach(platform => {
        if (platform !== 'NA') {
          platformCount[platform] = (platformCount[platform] || 0) + 1;
        }
      });
    });

    const phaseDistribution = Object.entries(phaseCount).map(
      ([phase, count]) => ({
        phase,
        count,
        percentage: ((count / patterns.length) * 100).toFixed(1),
      })
    );

    const platformDistribution = Object.entries(platformCount).map(
      ([platform, count]) => ({
        platform,
        count,
        percentage: ((count / patterns.length) * 100).toFixed(1),
      })
    );

    const recentPatterns = [...patterns]
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at === 'N/A' ? '2020-01-01' : a.created_at
        );
        const dateB = new Date(
          b.created_at === 'N/A' ? '2020-01-01' : b.created_at
        );
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    setStats({
      totalPatterns: patterns.length,
      phaseDistribution,
      platformDistribution,
      recentPatterns,
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // const getRiskColor = (level: string) => {
  //   switch (level) {
  //     case 'high':
  //       return '#f44336';
  //     case 'medium':
  //       return '#ff9800';
  //     case 'low':
  //       return '#4caf50';
  //     default:
  //       return '#9e9e9e';
  //   }
  // };

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          🛡️ Cybersecurity Intelligence Dashboard
        </Typography>
        <Box>
          <Tooltip title='Refresh Data'>
            <IconButton onClick={onRefresh} disabled={isLoading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title='Export Data'>
            <IconButton onClick={onExport}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title='Share Dashboard'>
            <IconButton>
              <Share />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security color='primary' sx={{ mr: 1 }} />
                  <Typography variant='h6'>Total Patterns</Typography>
                </Box>
                <Typography variant='h4' color='primary'>
                  {stats.totalPatterns}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Attack patterns in database
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security color='primary' sx={{ mr: 1 }} />
                  <Typography variant='h6'>Top Phase</Typography>
                </Box>
                <Typography variant='h4' color='primary'>
                  {stats.phaseDistribution[0]?.phase || 'N/A'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {stats.phaseDistribution[0]?.count || 0} patterns
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp color='warning' sx={{ mr: 1 }} />
                  <Typography variant='h6'>Top Platform</Typography>
                </Box>
                <Typography variant='h4' color='warning.main'>
                  {stats.platformDistribution[0]?.platform || 'N/A'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {stats.platformDistribution[0]?.count || 0} patterns
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Info color='success' sx={{ mr: 1 }} />
                  <Typography variant='h6'>Unique Phases</Typography>
                </Box>
                <Typography variant='h4' color='success.main'>
                  {stats.phaseDistribution.length}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Different attack phases
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label='dashboard tabs'
        >
          <Tab label='Overview' />
          <Tab label='Phase Analysis' />
          <Tab label='Platform Analysis' />
          <Tab label='Recent Activity' />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Attack Pattern Distribution by Phase
                  </Typography>
                  <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={stats.phaseDistribution}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='phase' />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey='count' fill='#1976d2' />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Platform Distribution
                  </Typography>
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={stats.platformDistribution
                          .slice(0, 8)
                          .map((item, index) => {
                            const chartColors = getChartColors(
                              8,
                              cybersecurityColors
                            );
                            return {
                              name: item.platform,
                              value: item.count,
                              percentage: item.percentage,
                              color: chartColors[index],
                            };
                          })}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ name, percentage }) =>
                          `${name}: ${percentage}%`
                        }
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {stats.platformDistribution
                          .slice(0, 8)
                          .map((_item, index) => {
                            const chartColors = getChartColors(
                              8,
                              cybersecurityColors
                            );
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={chartColors[index]}
                              />
                            );
                          })}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Detailed Phase Analysis
              </Typography>
              <Grid container spacing={2}>
                {stats.phaseDistribution.map((phase, index) => (
                  <Grid item xs={12} sm={6} md={4} key={phase.phase}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card variant='outlined'>
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant='subtitle1'>
                              {phase.phase}
                            </Typography>
                            <Chip
                              label={`${phase.count}`}
                              color='primary'
                              size='small'
                            />
                          </Box>
                          <LinearProgress
                            variant='determinate'
                            value={parseFloat(phase.percentage)}
                            sx={{ mt: 1 }}
                          />
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 1 }}
                          >
                            {phase.percentage}% of total patterns
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Platform Vulnerability Analysis
              </Typography>
              <ResponsiveContainer width='100%' height={400}>
                <AreaChart data={stats.platformDistribution}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='platform' />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type='monotone'
                    dataKey='count'
                    stroke='#1976d2'
                    fill='#1976d2'
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Recent Attack Patterns
              </Typography>
              <AnimatePresence>
                {stats.recentPatterns.map((pattern, index) => (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography
                            variant='subtitle1'
                            sx={{ fontWeight: 'bold' }}
                          >
                            {pattern.name}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {pattern.description.substring(0, 100)}...
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={pattern.phase_name}
                              size='small'
                              sx={{ mr: 1 }}
                            />
                            {pattern.x_mitre_platforms
                              .slice(0, 2)
                              .map(platform => (
                                <Chip
                                  key={platform}
                                  label={platform}
                                  size='small'
                                  variant='outlined'
                                  sx={{ mr: 1 }}
                                />
                              ))}
                          </Box>
                        </Box>
                        <Typography variant='caption' color='text.secondary'>
                          {new Date(pattern.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {isLoading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default AdvancedDashboard;
