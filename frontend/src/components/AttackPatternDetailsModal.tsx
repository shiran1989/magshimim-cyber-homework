import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Link,
  Paper,
  Grid,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Security } from '@mui/icons-material';
import { AttackPattern } from '../types';
import {
  useCybersecurityColors,
  getPhaseColor,
  getPlatformColor,
} from '../utils/themeUtils';

interface AttackPatternDetailsModalProps {
  open: boolean;
  onClose: () => void;
  pattern: AttackPattern | null;
}

const AttackPatternDetailsModal: React.FC<AttackPatternDetailsModalProps> = ({
  open,
  onClose,
  pattern,
}) => {
  const cybersecurityColors = useCybersecurityColors();

  if (!pattern) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Security color='primary' />
          <Typography variant='h6' component='div'>
            {pattern.name}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom color='primary'>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    External ID
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                    {pattern.external_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Phase
                  </Typography>
                  <Chip
                    label={pattern.phase_name}
                    size='small'
                    sx={{
                      backgroundColor: getPhaseColor(
                        pattern.phase_name,
                        cybersecurityColors
                      ),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom color='primary'>
                Description
              </Typography>
              <Typography variant='body1' sx={{ textAlign: 'justify' }}>
                {pattern.description}
              </Typography>
            </Paper>
          </Grid>

          {/* Platforms */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom color='primary'>
                Platforms
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {pattern.x_mitre_platforms.map((platform, index) => (
                  <Chip
                    key={index}
                    label={platform}
                    size='small'
                    sx={{
                      backgroundColor: getPlatformColor(
                        platform,
                        cybersecurityColors
                      ),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Kill Chain Phases */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom color='primary'>
                Kill Chain Phases
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {pattern.kill_chain_phases.map((phase, index) => (
                  <Chip
                    key={index}
                    label={phase.phase_name}
                    size='small'
                    sx={{
                      backgroundColor: getPhaseColor(
                        phase.phase_name,
                        cybersecurityColors
                      ),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Detection */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom color='primary'>
                Detection
              </Typography>
              <Typography variant='body1' sx={{ textAlign: 'justify' }}>
                {pattern.x_mitre_detection ||
                  'No detection information available'}
              </Typography>
            </Paper>
          </Grid>

          {/* External References */}
          {pattern.external_references &&
            pattern.external_references.length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant='h6' gutterBottom color='primary'>
                    External References
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    {pattern.external_references.map((ref, index) => (
                      <Box key={index}>
                        <Typography variant='body2' color='text.secondary'>
                          {ref.source_name}
                        </Typography>
                        {ref.url && (
                          <Link
                            href={ref.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            variant='body2'
                          >
                            {ref.url}
                          </Link>
                        )}
                        {ref.external_id && (
                          <Typography
                            variant='body2'
                            sx={{ fontFamily: 'monospace' }}
                          >
                            ID: {ref.external_id}
                          </Typography>
                        )}
                        {index < pattern.external_references.length - 1 && (
                          <Divider sx={{ mt: 1 }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

          {/* Metadata */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom color='primary'>
                Metadata
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Created
                  </Typography>
                  <Typography variant='body2'>
                    {pattern.created_at
                      ? new Date(pattern.created_at).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Modified
                  </Typography>
                  <Typography variant='body2'>
                    {pattern.modified_at
                      ? new Date(pattern.modified_at).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttackPatternDetailsModal;
