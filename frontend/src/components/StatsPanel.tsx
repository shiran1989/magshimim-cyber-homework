import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { StatsResponse } from '../types';

interface StatsPanelProps {
  stats: StatsResponse;
  isLoading?: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom>
          Loading statistics...
        </Typography>
      </Paper>
    );
  }

  const getPhaseColor = (phase: string) => {
    const phaseColors: { [key: string]: string } = {
      'Initial Access': '#f44336',
      Execution: '#ff9800',
      Persistence: '#9c27b0',
      'Privilege Escalation': '#673ab7',
      'Defense Evasion': '#3f51b5',
      'Credential Access': '#2196f3',
      Discovery: '#00bcd4',
      'Lateral Movement': '#009688',
      Collection: '#4caf50',
      'Command and Control': '#8bc34a',
      Exfiltration: '#cddc39',
      Impact: '#ffeb3b',
      NA: '#9e9e9e',
    };
    return phaseColors[phase] || '#9e9e9e';
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography
        variant='h6'
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <SecurityIcon color='primary' />
        Attack Pattern Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Total Patterns */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant='h4'
              color='primary'
              sx={{ fontWeight: 'bold' }}
            >
              {stats.total_patterns}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Total Attack Patterns
            </Typography>
          </Box>
        </Grid>

        {/* Phase Distribution */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography
            variant='subtitle1'
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            <TimelineIcon
              fontSize='small'
              sx={{ mr: 1, verticalAlign: 'middle' }}
            />
            Attack Phases
          </Typography>
          <List dense>
            {stats.phase_distribution.slice(0, 5).map((phase, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={phase._id}
                        size='small'
                        sx={{
                          backgroundColor: getPhaseColor(phase._id),
                          color: 'white',
                          fontSize: '0.75rem',
                        }}
                      />
                      <Typography variant='body2'>
                        {phase.count} patterns
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Platform Distribution */}
        <Grid item xs={12} sm={6} md={5}>
          <Typography
            variant='subtitle1'
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            <ComputerIcon
              fontSize='small'
              sx={{ mr: 1, verticalAlign: 'middle' }}
            />
            Target Platforms
          </Typography>
          <List dense>
            {stats.platform_distribution.slice(0, 5).map((platform, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={platform._id}
                        size='small'
                        variant='outlined'
                        color='primary'
                      />
                      <Typography variant='body2'>
                        {platform.count} patterns
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StatsPanel;
