import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Computer as ComputerIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { AttackPattern } from '../types';

interface AttackPatternCardProps {
  pattern: AttackPattern;
}

const AttackPatternCard: React.FC<AttackPatternCardProps> = ({ pattern }) => {
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
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
            {pattern.name}
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <SecurityIcon color='primary' fontSize='small' />
            <Typography variant='body2' color='text.secondary'>
              {pattern.external_id}
            </Typography>
            <Chip
              label={pattern.phase_name}
              size='small'
              sx={{
                backgroundColor: getPhaseColor(pattern.phase_name),
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
          }}
        >
          {pattern.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant='subtitle2'
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            <ComputerIcon
              fontSize='small'
              sx={{ mr: 1, verticalAlign: 'middle' }}
            />
            Vulnerable Platforms:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {pattern.x_mitre_platforms.map((platform, index) => (
              <Chip
                key={index}
                label={platform}
                size='small'
                variant='outlined'
                color='primary'
              />
            ))}
          </Box>
        </Box>

        {pattern.x_mitre_detection !== 'NA' && (
          <Accordion
            sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ minHeight: 'auto', py: 0 }}
            >
              <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                <VisibilityIcon
                  fontSize='small'
                  sx={{ mr: 1, verticalAlign: 'middle' }}
                />
                Detection Methods
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant='body2' color='text.secondary'>
                {pattern.x_mitre_detection}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}

        {pattern.kill_chain_phases.length > 0 &&
          pattern.kill_chain_phases[0] &&
          pattern.kill_chain_phases[0].phase_name !== 'NA' && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant='subtitle2'
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Kill Chain Phases:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {pattern.kill_chain_phases.map((phase, index) => (
                  <Chip
                    key={index}
                    label={phase.phase_name}
                    size='small'
                    sx={{
                      backgroundColor: getPhaseColor(phase.phase_name),
                      color: 'white',
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
      </CardContent>
    </Card>
  );
};

export default AttackPatternCard;
