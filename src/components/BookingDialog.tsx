import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, Ticket, CreditCard, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking, useMockPayment } from '@/hooks/useBookings';
import { Movie } from '@/hooks/useMovies';

interface BookingDialogProps {
  movie: Movie;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingDialog = ({ movie, open, onOpenChange }: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const mockPayment = useMockPayment();
  
  const [selectedShowTime, setSelectedShowTime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [step, setStep] = useState<'select' | 'confirm' | 'payment' | 'success'>('select');
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const bookingDate = format(new Date(), 'yyyy-MM-dd');
  const totalAmount = movie.ticket_price * selectedSeats;

  const handleBook = async () => {
    if (!user) {
      onOpenChange(false);
      navigate('/auth');
      return;
    }

    if (!selectedShowTime) return;

    try {
      const result = await createBooking.mutateAsync({
        movie_id: movie.id,
        show_time: selectedShowTime,
        booking_date: bookingDate,
        seats: selectedSeats,
        total_amount: totalAmount,
      });
      
      if (result) {
        setCreatedBookingId(result.id);
        setStep('confirm');
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const handlePayment = async () => {
    if (!createdBookingId) return;
    
    setStep('payment');
    
    try {
      await mockPayment.mutateAsync(createdBookingId);
      setStep('success');
    } catch (error) {
      setStep('confirm');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('select');
    setSelectedShowTime(null);
    setSelectedSeats(1);
    setCreatedBookingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            {step === 'success' ? 'Booking Confirmed!' : `Book: ${movie.title}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && 'Select your preferred show time and number of seats'}
            {step === 'confirm' && 'Review your booking details'}
            {step === 'payment' && 'Processing your payment...'}
            {step === 'success' && 'Your tickets are ready!'}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6 py-4">
            {/* Show Times */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Show Time
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {movie.show_times.map((time) => (
                  <Button
                    key={time}
                    variant={selectedShowTime === time ? 'default' : 'outline'}
                    onClick={() => setSelectedShowTime(time)}
                    className="w-full"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <div className="p-3 rounded-lg bg-secondary text-center font-medium">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </div>
            </div>

            {/* Seats */}
            <div className="space-y-2">
              <Label>Number of Seats</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                  disabled={selectedSeats <= 1}
                >
                  -
                </Button>
                <span className="text-xl font-semibold w-8 text-center">{selectedSeats}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedSeats(Math.min(10, selectedSeats + 1))}
                  disabled={selectedSeats >= 10}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleBook}
              disabled={!selectedShowTime || createBooking.isPending}
              className="w-full"
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Booking...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Movie</span>
                <span className="font-medium">{movie.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(new Date(), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedShowTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats</span>
                <span className="font-medium">{selectedSeats}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary text-lg">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={handlePayment} className="w-full gap-2">
              <CreditCard className="w-4 h-4" />
              Pay Now
            </Button>
          </div>
        )}

        {step === 'payment' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium">Processing Payment...</p>
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Ticket className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">Booking Successful!</p>
              <p className="text-muted-foreground">
                Your e-ticket has been sent to your email.
              </p>
            </div>
            <Button onClick={handleClose} variant="outline" className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
