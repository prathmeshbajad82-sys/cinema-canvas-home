import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, InsertTables, UpdateTables } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type Booking = Tables<'bookings'>;
export type BookingInsert = InsertTables<'bookings'>;
export type BookingUpdate = UpdateTables<'bookings'>;

interface CreateBookingInput {
  movie_id: string;
  theater_name: string;
  theater_location: string;
  show_time: string;
  booking_date: string;
  seats: number;
  total_amount: number;
}

// Type-safe helper for bookings table operations
const getBookingsTable = () => {
  return (supabase as any).from('bookings');
};

export const useBookings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async (): Promise<Booking[]> => {
      if (!user) return [];
      
      const { data, error } = await getBookingsTable()
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as Booking[]) ?? [];
    },
    enabled: !!user,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (booking: CreateBookingInput): Promise<Booking> => {
      if (!user) throw new Error('User not authenticated');
      
      const insertData = {
        movie_id: booking.movie_id,
        theater_name: booking.theater_name,
        theater_location: booking.theater_location,
        showtime: booking.show_time,
        booking_date: booking.booking_date,
        seats: booking.seats,
        total_price: booking.total_amount,
        user_id: user.id,
        payment_status: 'pending',
        booking_status: 'confirmed',
      };
      
      const { data, error } = await getBookingsTable()
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: '📧 Email Notification',
        description: 'A confirmation email has been sent to your registered email address.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message,
      });
    },
  });
};

export const useMockPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (bookingId: string): Promise<Booking> => {
      toast({
        title: '💳 Processing Payment',
        description: 'Please wait while we process your payment...',
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updateData: BookingUpdate = { payment_status: 'paid' };
      
      const { data, error } = await getBookingsTable()
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: '✅ Payment Successful',
        description: 'Your payment has been processed successfully. Enjoy your movie!',
      });
      setTimeout(() => {
        toast({
          title: '📧 Email Notification',
          description: 'Your e-ticket has been sent to your email address.',
        });
      }, 1000);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message,
      });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (bookingId: string): Promise<Booking> => {
      const updateData: BookingUpdate = { booking_status: 'cancelled' };
      
      const { data, error } = await getBookingsTable()
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description: error.message,
      });
    },
  });
};
