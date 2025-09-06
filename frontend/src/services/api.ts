import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  AttackPattern,
  SearchRequest,
  SearchResponse,
  StatsResponse,
} from '../types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/v1',
  }),
  tagTypes: ['AttackPattern', 'Stats'],
  endpoints: builder => ({
    // Get all attack patterns with pagination
    getAttackPatterns: builder.query<
      SearchResponse,
      { limit?: number; offset?: number }
    >({
      query: ({ limit = 50, offset = 0 }) => ({
        url: 'attack-patterns',
        params: { limit, offset },
      }),
      providesTags: ['AttackPattern'],
    }),

    // Search attack patterns
    searchAttackPatterns: builder.mutation<SearchResponse, SearchRequest>({
      query: body => ({
        url: 'attack-patterns/search',
        method: 'POST',
        body,
      }),
    }),

    // Get specific attack pattern by ID
    getAttackPattern: builder.query<AttackPattern, string>({
      query: id => `attack-patterns/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AttackPattern', id }],
    }),

    // Get statistics
    getStats: builder.query<StatsResponse, void>({
      query: () => 'stats',
      providesTags: ['Stats'],
    }),

    // Get dashboard data (all patterns)
    getDashboardData: builder.query<SearchResponse, void>({
      query: () => 'dashboard-data',
      providesTags: ['AttackPattern'],
    }),

    // Health check
    getHealth: builder.query<{ status: string; message: string }, void>({
      query: () => 'health',
    }),
  }),
});

export const {
  useGetAttackPatternsQuery,
  useSearchAttackPatternsMutation,
  useGetAttackPatternQuery,
  useGetStatsQuery,
  useGetDashboardDataQuery,
  useGetHealthQuery,
} = api;
