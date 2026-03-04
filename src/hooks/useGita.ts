import { useState, useCallback } from 'react';
import type { SlokaResponse, SlokasByChapterResponse, Sloka } from '../utils/gitaService';
import {
  getSlokaByChapterVerse,
  getSlokasByChapter,
  getAllSlokas,
  searchSlokas,
} from '../utils/gitaService';

interface UseGitaState {
  sloka: SlokaResponse['data'] | null;
  slokasByChapter: Sloka[] | null;
  allSlokas: Sloka[] | null;
  searchResults: Sloka[] | null;
  loading: boolean;
  error: string | null;
}

export function useGita() {
  const [state, setState] = useState<UseGitaState>({
    sloka: null,
    slokasByChapter: null,
    allSlokas: null,
    searchResults: null,
    loading: false,
    error: null,
  });

  const fetchSlokaByChapterVerse = useCallback(
    async (chapter: number, verse: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await getSlokaByChapterVerse(chapter, verse);
        if (response.success) {
          setState((prev) => ({ ...prev, sloka: response.data || null }));
        } else {
          setState((prev) => ({ ...prev, error: response.error || 'Unknown error' }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Unknown error',
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    []
  );

  const fetchSlokasByChapter = useCallback(async (chapter: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response: SlokasByChapterResponse = await getSlokasByChapter(chapter);
      if (response.success && response.data) {
        setState((prev) => ({ ...prev, slokasByChapter: response.data?.verses || null }));
      } else {
        setState((prev) => ({ ...prev, error: response.error || 'Unknown error' }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchAllSlokas = useCallback(async (limit?: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getAllSlokas(limit);
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          allSlokas: (response.data as any).verses || null,
        }));
      } else {
        setState((prev) => ({ ...prev, error: response.error || 'Unknown error' }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const performSearch = useCallback(async (searchTerm: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await searchSlokas(searchTerm);
      if (response.success) {
        setState((prev) => ({ ...prev, searchResults: response.data || null }));
      } else {
        setState((prev) => ({ ...prev, error: response.error || 'Unknown error' }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const clearSearch = useCallback(() => {
    setState((prev) => ({ ...prev, searchResults: null }));
  }, []);

  return {
    ...state,
    fetchSlokaByChapterVerse,
    fetchSlokasByChapter,
    fetchAllSlokas,
    performSearch,
    clearSearch,
  };
}
