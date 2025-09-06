import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Security, Info } from '@mui/icons-material';
import { AttackPattern } from '../types';
import {
  useCybersecurityColors,
  getPhaseColor,
  getPlatformColor,
} from '../utils/themeUtils';

interface AttackPatternTableProps {
  patterns: AttackPattern[];
  isLoading?: boolean;
  error?: string;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (_page: number) => void;
  onPageSizeChange?: (_pageSize: number) => void;
  onViewDetails?: (_pattern: AttackPattern) => void;
  onSecurityInfo?: (_pattern: AttackPattern) => void;
}

// Helper function to get text color based on background color
const getContrastTextColor = (backgroundColor: string): string => {
  // Simple contrast calculation - you can improve this with a proper color contrast library
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000' : '#fff';
};

const AttackPatternTable: React.FC<AttackPatternTableProps> = ({
  patterns,
  isLoading = false,
  error,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onSecurityInfo,
}) => {
  const cybersecurityColors = useCybersecurityColors();
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (patterns.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          flexDirection: 'column',
        }}
      >
        <Typography variant='h6' color='text.secondary'>
          No attack patterns found
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Try adjusting your search criteria
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table sx={{ minWidth: 650 }} aria-label='attack patterns table'>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phase</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Platforms</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Detection</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patterns.map(pattern => (
              <TableRow
                key={pattern.id}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: '#fafafa',
                  },
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  },
                }}
              >
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  >
                    {pattern.external_id || pattern.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                    {pattern.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ maxWidth: 300 }}>
                    {pattern.description.length > 150
                      ? `${pattern.description.substring(0, 150)}...`
                      : pattern.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  {pattern.kill_chain_phases &&
                  pattern.kill_chain_phases.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {pattern.kill_chain_phases
                        .slice(0, 2)
                        .map((phase, index) => (
                          <Chip
                            key={index}
                            label={phase.phase_name}
                            size='small'
                            sx={{
                              backgroundColor: getPhaseColor(
                                phase.phase_name,
                                cybersecurityColors
                              ),
                              color: getContrastTextColor(
                                getPhaseColor(
                                  phase.phase_name,
                                  cybersecurityColors
                                )
                              ),
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                            }}
                          />
                        ))}
                      {pattern.kill_chain_phases.length > 2 && (
                        <Chip
                          label={`+${pattern.kill_chain_phases.length - 2}`}
                          size='small'
                          sx={{
                            backgroundColor: '#e0e0e0',
                            color: '#666',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      N/A
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {pattern.x_mitre_platforms &&
                  pattern.x_mitre_platforms.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {pattern.x_mitre_platforms
                        .slice(0, 3)
                        .map((platform, index) => (
                          <Chip
                            key={index}
                            label={platform}
                            size='small'
                            sx={{
                              backgroundColor: getPlatformColor(
                                platform,
                                cybersecurityColors
                              ),
                              color: getContrastTextColor(
                                getPlatformColor(platform, cybersecurityColors)
                              ),
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                            }}
                          />
                        ))}
                      {pattern.x_mitre_platforms.length > 3 && (
                        <Chip
                          label={`+${pattern.x_mitre_platforms.length - 3}`}
                          size='small'
                          sx={{
                            backgroundColor: '#e0e0e0',
                            color: '#666',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      N/A
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ maxWidth: 200 }}>
                    {pattern.x_mitre_detection &&
                    pattern.x_mitre_detection !== 'N/A'
                      ? pattern.x_mitre_detection.length > 100
                        ? `${pattern.x_mitre_detection.substring(0, 100)}...`
                        : pattern.x_mitre_detection
                      : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title='View Details'>
                      <IconButton
                        size='small'
                        color='primary'
                        onClick={() => onViewDetails?.(pattern)}
                      >
                        <Info fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Security Info'>
                      <IconButton
                        size='small'
                        color='secondary'
                        onClick={() => onSecurityInfo?.(pattern)}
                      >
                        <Security fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            Showing {patterns.length} of {totalCount} patterns
          </Typography>
          <FormControl size='small' sx={{ minWidth: 80 }}>
            <InputLabel>Per page</InputLabel>
            <Select
              value={pageSize}
              label='Per page'
              onChange={e => onPageSizeChange?.(e.target.value as number)}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange?.(page)}
            color='primary'
            size='large'
            showFirstButton
            showLastButton
          />
        )}
      </Box>
    </Box>
  );
};

export default AttackPatternTable;
