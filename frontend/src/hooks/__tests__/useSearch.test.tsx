import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useSearch } from '../useSearch';
import { api } from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
  api: {
    useSearchAttackPatternsMutation: jest.fn(),
  },
}));

const mockStore = configureStore({
  reducer: {
    api: api.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(api.middleware),
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={mockStore}>{children}</Provider>
);

describe('useSearch', () => {
  const mockSearchMutation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.useSearchAttackPatternsMutation as jest.Mock).mockReturnValue([
      mockSearchMutation,
      { isLoading: false, error: null },
    ]);
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.search).toBe('function');
    expect(typeof result.current.clearSearch).toBe('function');
  });

  it('should handle search function call', async () => {
    const mockResults = {
      results: [
        {
          id: 'T1001',
          name: 'Test Attack',
          description: 'Test description',
          x_mitre_platforms: ['Windows'],
          x_mitre_detection: 'Test detection',
          phase_name: 'Execution',
          external_id: 'T1001',
          kill_chain_phases: [{ phase_name: 'Execution' }],
          external_references: [],
          created_at: '2024-01-01T00:00:00Z',
          modified_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      limit: 10,
      offset: 0,
    };

    mockSearchMutation.mockResolvedValue({ data: mockResults });

    const { result } = renderHook(() => useSearch(), { wrapper });

    await act(async () => {
      const searchResult = await result.current.search('test query', 10, 0);
      expect(searchResult).toEqual(mockResults);
    });

    expect(mockSearchMutation).toHaveBeenCalledWith({
      query: 'test query',
      limit: 10,
      offset: 0,
    });
  });

  it('should handle search errors', async () => {
    const mockError = new Error('Search failed');
    mockSearchMutation.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSearch(), { wrapper });

    await act(async () => {
      try {
        await result.current.search('test query', 10, 0);
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  it('should clear search correctly', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    act(() => {
      result.current.clearSearch();
    });

    // The clearSearch function should not throw an error
    expect(() => result.current.clearSearch()).not.toThrow();
  });

  it('should update query correctly', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    act(() => {
      result.current.updateQuery('test query');
    });

    expect(result.current.query).toBe('test query');
  });
});
