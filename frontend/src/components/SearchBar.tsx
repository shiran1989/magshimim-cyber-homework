import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

interface SearchBarProps {
  onSearch: (_query: string) => void;
  onClear: () => void;
  onQueryChange: (_query: string) => void;
  query: string;
  isLoading?: boolean;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  onQueryChange,
  query,
  isLoading = false,
  placeholder = 'Search attack patterns across all fields...',
}) => {
  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    onQueryChange('');
    onClear();
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    onQueryChange(newQuery);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          variant='outlined'
          placeholder={placeholder}
          value={query}
          onChange={handleQueryChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon color='action' />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position='end'>
                <IconButton
                  onClick={handleClear}
                  edge='end'
                  size='small'
                  disabled={isLoading}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <IconButton
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          color='primary'
          sx={{ minWidth: 'auto', px: 2 }}
        >
          <SearchIcon />
        </IconButton>
      </Box>
      <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
        Search through attack descriptions
      </Typography>
    </Paper>
  );
};

export default SearchBar;
