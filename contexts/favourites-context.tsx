'use client';

/**
 * FAVOURITES CONTEXT
 * Manages villa favourites with localStorage persistence
 * No login required - data stored locally in browser
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface FavouritesContextType {
  favourites: string[]; // Array of villa IDs
  addFavourite: (villaId: string) => void;
  removeFavourite: (villaId: string) => void;
  toggleFavourite: (villaId: string) => void;
  isFavourite: (villaId: string) => boolean;
  clearFavourites: () => void;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

const STORAGE_KEY = 'vintage-travel-favourites';

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favourites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavourites(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load favourites from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever favourites change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
      } catch (error) {
        console.error('Failed to save favourites to localStorage:', error);
      }
    }
  }, [favourites, isLoaded]);

  const addFavourite = useCallback((villaId: string) => {
    setFavourites(prev => {
      if (prev.includes(villaId)) return prev;
      return [...prev, villaId];
    });
  }, []);

  const removeFavourite = useCallback((villaId: string) => {
    setFavourites(prev => prev.filter(id => id !== villaId));
  }, []);

  const toggleFavourite = useCallback((villaId: string) => {
    setFavourites(prev => {
      if (prev.includes(villaId)) {
        return prev.filter(id => id !== villaId);
      }
      return [...prev, villaId];
    });
  }, []);

  const isFavourite = useCallback((villaId: string) => {
    return favourites.includes(villaId);
  }, [favourites]);

  const clearFavourites = useCallback(() => {
    setFavourites([]);
  }, []);

  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        addFavourite,
        removeFavourite,
        toggleFavourite,
        isFavourite,
        clearFavourites,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}
