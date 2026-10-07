import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteColleges, setFavoriteColleges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavoriteIds(new Set());
      setFavoriteColleges([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/favorites');
      setFavoriteColleges(res.data);
      setFavoriteIds(new Set(res.data.map((c) => c.id)));
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (college) => {
    if (!user) {
      alert('Please log in to save colleges to your favorites.');
      return false;
    }

    const isFav = favoriteIds.has(college.id);
    try {
      if (isFav) {
        await api.delete(`/favorites/${college.id}`);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(college.id);
          return next;
        });
        setFavoriteColleges((prev) => prev.filter((c) => c.id !== college.id));
      } else {
        await api.post(`/favorites/${college.id}`);
        setFavoriteIds((prev) => new Set([...prev, college.id]));
        setFavoriteColleges((prev) => [...prev, college]);
      }
      return true;
    } catch (err) {
      console.error('Failed to update favorite:', err);
      return false;
    }
  };

  const isFavorite = (collegeId) => favoriteIds.has(collegeId);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteColleges,
        favoriteIds,
        toggleFavorite,
        isFavorite,
        loading,
        count: favoriteIds.size,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
