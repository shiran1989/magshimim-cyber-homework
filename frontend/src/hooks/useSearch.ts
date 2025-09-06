import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchAttackPatternsMutation } from '../services/api';
import { SearchRequest, AttackPattern } from '../types';

export const useSearch = () => {
  const [searchAttackPatterns, { isLoading, error }] =
    useSearchAttackPatternsMutation();
  const [searchResults, setSearchResults] = useState<AttackPattern[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [lastQuery, setLastQuery] = useState('');
  const [query, setQuery] = useState('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [currentOffset, setCurrentOffset] = useState(0);

  const search = useCallback(
    async (query: string, limit = 10, offset = 0) => {
      if (!query.trim()) {
        setSearchResults([]);
        setTotalResults(0);
        setLastQuery('');
        return { results: [], total: 0 };
      }

      try {
        const searchRequest: SearchRequest = {
          query: query.trim(),
          limit,
          offset,
        };

        const result = await searchAttackPatterns(searchRequest).unwrap();
        setSearchResults(result.results);
        setTotalResults(result.total);
        setLastQuery(query.trim());
        return result;
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
        setTotalResults(0);
        throw err;
      }
    },
    [searchAttackPatterns]
  );

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setTotalResults(0);
    setLastQuery('');
    setQuery('');
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setCurrentOffset(0); // Reset offset when query changes
  }, []);

  const updatePagination = useCallback((limit: number, offset: number) => {
    setCurrentLimit(limit);
    setCurrentOffset(offset);
  }, []);

  const triggerSearch = useCallback(() => {
    if (query.trim()) {
      search(query, currentLimit, currentOffset);
    } else {
      search('', currentLimit, currentOffset);
    }
  }, [query, currentLimit, currentOffset, search]);

  // Debounce effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query.trim()) {
      debounceTimeoutRef.current = setTimeout(() => {
        search(query, currentLimit, currentOffset);
      }, 500); // 500ms debounce
    } else {
      // Empty query should return all results
      debounceTimeoutRef.current = setTimeout(() => {
        search('', currentLimit, currentOffset);
      }, 100); // Shorter delay for empty query
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, search, currentLimit, currentOffset]);

  return {
    search,
    clearSearch,
    updateQuery,
    updatePagination,
    triggerSearch,
    query,
    searchResults,
    totalResults,
    lastQuery,
    isLoading,
    error,
  };
};
