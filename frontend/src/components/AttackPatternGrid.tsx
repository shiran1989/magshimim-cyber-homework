import React from 'react';
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import AttackPatternCard from './AttackPatternCard';
import { AttackPattern } from '../types';

interface AttackPatternGridProps {
  patterns: AttackPattern[];
  isLoading?: boolean;
  error?: string;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (_page: number) => void;
  onPageSizeChange?: (_pageSize: number) => void;
}

const AttackPatternGrid: React.FC<AttackPatternGridProps> = ({
  patterns,
  isLoading = false,
  error,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
}) => {
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
        <CircularProgress size={60} />
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
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='text.secondary' gutterBottom>
          No attack patterns found
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Try adjusting your search criteria or check back later
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Results header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6' color='text.primary'>
          {totalCount} attack pattern{totalCount !== 1 ? 's' : ''} found
        </Typography>

        {onPageSizeChange && (
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Per page</InputLabel>
            <Select
              value={pageSize}
              label='Per page'
              onChange={e => onPageSizeChange(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Grid of attack patterns */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {patterns.map(pattern => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pattern.id}>
            <AttackPatternCard pattern={pattern} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_event, page) => onPageChange(page)}
            color='primary'
            size='large'
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default AttackPatternGrid;
