import { useCallback, useEffect, useState } from 'react';

type VerseType = 'gita' | 'bible' | 'quran';

export interface Favorite {
  verseType: VerseType;
  verseId: string;
  createdAt: string;
}

const STORAGE_KEY = 'favorites';

function loadFavorites(): Favorite[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item): Favorite | null => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const verseType = (item as { verseType?: unknown }).verseType;
        const verseId = (item as { verseId?: unknown }).verseId;
        const createdAt = (item as { createdAt?: unknown }).createdAt;

        if (
          (verseType !== 'gita' && verseType !== 'bible' && verseType !== 'quran') ||
          typeof verseId !== 'string'
        ) {
          return null;
        }

        return {
          verseType,
          verseId,
          createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
        };
      })
      .filter((item): item is Favorite => item !== null);
  } catch {
    return [];
  }
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(loadFavorites);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (verseType: VerseType, verseId: string) => {
      return favorites.some((favorite) => favorite.verseType === verseType && favorite.verseId === String(verseId));
    },
    [favorites]
  );

  const toggleFavorite = useCallback((verseType: VerseType, verseId: string) => {
    setFavorites((prevFavorites) => {
      const normalizedId = String(verseId);
      const exists = prevFavorites.some(
        (favorite) => favorite.verseType === verseType && favorite.verseId === normalizedId
      );

      if (exists) {
        return prevFavorites.filter(
          (favorite) => !(favorite.verseType === verseType && favorite.verseId === normalizedId)
        );
      }

      return [
        ...prevFavorites,
        {
          verseType,
          verseId: normalizedId,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const removeFavorite = useCallback((verseType: VerseType, verseId: string) => {
    const normalizedId = String(verseId);
    setFavorites((prevFavorites) =>
      prevFavorites.filter(
        (favorite) => !(favorite.verseType === verseType && favorite.verseId === normalizedId)
      )
    );
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}
