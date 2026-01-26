import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/database.types';

export type Movie = Tables<'movies'>;

// Type-safe helper for movies table operations
const getMoviesTable = () => (supabase as any).from('movies');

export const useMovies = () => {
  return useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const { data, error } = await getMoviesTable()
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as Movie[]) ?? [];
    },
  });
};

export const useFeaturedMovies = () => {
  return useQuery({
    queryKey: ['movies', 'featured'],
    queryFn: async () => {
      const { data, error } = await getMoviesTable()
        .select('*')
        .eq('is_featured', true)
        .eq('is_available', true)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return (data as Movie[]) ?? [];
    },
  });
};

export const useAvailableMovies = () => {
  return useQuery({
    queryKey: ['movies', 'available'],
    queryFn: async () => {
      const { data, error } = await getMoviesTable()
        .select('*')
        .eq('is_available', true)
        .order('release_date', { ascending: false });
      
      if (error) throw error;
      return (data as Movie[]) ?? [];
    },
  });
};

export const useMovieById = (movieId: string) => {
  return useQuery({
    queryKey: ['movies', movieId],
    queryFn: async () => {
      const { data, error } = await getMoviesTable()
        .select('*')
        .eq('id', movieId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Movie | null;
    },
    enabled: !!movieId,
  });
};
