import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type Booking = Tables<'bookings'>;

interface BookingInsert {
  movie_id: string;
  show_time: string;
  booking_date: string;
  seats: number;
  total_amount: number;
}

export const useBookings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (booking: BookingInsert) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          movie_id: booking.movie_id,
          show_time: booking.show_time,
          booking_date: booking.booking_date,
          seats: booking.seats,
          total_amount: booking.total_amount,
          user_id: user.id,
          payment_status: 'pending' as const,
          booking_status: 'confirmed' as const,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
    mutationFn: async (bookingId: string) => {
      toast({
        title: '💳 Processing Payment',
        description: 'Please wait while we process your payment...',
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data, error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' as const })
        .eq('id', bookingId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ booking_status: 'cancelled' as const })
        .eq('id', bookingId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
