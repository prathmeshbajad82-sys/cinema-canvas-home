import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, Ticket, CreditCard, Loader2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking, useMockPayment } from '@/hooks/useBookings';
import { Movie } from '@/hooks/useMovies';
import { getTheaterShowtimes, getTheaterById } from '@/data/theaters';
import TheaterList from '@/components/TheaterList';

interface BookingDialogProps {
  movie: Movie;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BookingStep = 'theaters' | 'seats' | 'confirm' | 'payment' | 'success';

interface SelectedShowtime {
  theaterId: string;
  time: string;
  price: number;
}

const BookingDialog = ({ movie, open, onOpenChange }: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const mockPayment = useMockPayment();
  
  const [step, setStep] = useState<BookingStep>('theaters');
  const [selectedShowtime, setSelectedShowtime] = useState<SelectedShowtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const bookingDate = format(new Date(), 'yyyy-MM-dd');
  const theaterShowtimes = getTheaterShowtimes(movie.show_times);
  const selectedTheater = selectedShowtime ? getTheaterById(selectedShowtime.theaterId) : null;
  const totalAmount = selectedShowtime ? selectedShowtime.price * selectedSeats : 0;

  const handleSelectShowtime = (theaterId: string, time: string, price: number) => {
    if (!user) {
      onOpenChange(false);
      navigate('/auth');
      return;
    }
    
    setSelectedShowtime({ theaterId, time, price });
    setStep('seats');
  };

  const handleBook = async () => {
    if (!user || !selectedShowtime) return;

    try {
      const result = await createBooking.mutateAsync({
        movie_id: movie.id,
        show_time: selectedShowtime.time,
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
    setStep('theaters');
    setSelectedShowtime(null);
    setSelectedSeats(1);
    setCreatedBookingId(null);
  };

  const handleBack = () => {
    if (step === 'seats') {
      setStep('theaters');
      setSelectedShowtime(null);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'theaters': return `Book: ${movie.title}`;
      case 'seats': return 'Select Seats';
      case 'confirm': return 'Confirm Booking';
      case 'payment': return 'Processing Payment';
      case 'success': return 'Booking Confirmed!';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'theaters': return 'Choose a theater and showtime';
      case 'seats': return 'Select number of seats';
      case 'confirm': return 'Review your booking details';
      case 'payment': return 'Please wait...';
      case 'success': return 'Your tickets are ready!';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Theater & Showtime Selection */}
          {step === 'theaters' && (
            <div className="py-4">
              <TheaterList
                movieName={movie.title}
                theaterShowtimes={theaterShowtimes}
                basePrice={movie.ticket_price}
                onSelectShowtime={handleSelectShowtime}
              />
            </div>
          )}

          {/* Step 2: Seat Selection */}
          {step === 'seats' && selectedShowtime && selectedTheater && (
            <div className="space-y-6 py-4">
              {/* Selected Theater Info */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedTheater.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{format(new Date(), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{selectedShowtime.time}</span>
                  </div>
                </div>
              </div>

              {/* Seats Selection */}
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
                <p className="text-xs text-muted-foreground">Maximum 10 seats per booking</p>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {selectedSeats} × ₹{selectedShowtime.price}
                  </span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleBook}
                  disabled={createBooking.isPending}
                  className="flex-1"
                >
                  {createBooking.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && selectedShowtime && selectedTheater && (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movie</span>
                  <span className="font-medium">{movie.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theater</span>
                  <span className="font-medium">{selectedTheater.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{format(new Date(), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedShowtime.time}</span>
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

          {/* Step 4: Payment Processing */}
          {step === 'payment' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium">Processing Payment...</p>
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && selectedTheater && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Ticket className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Booking Successful!</p>
                <p className="text-muted-foreground text-sm">
                  {movie.title} at {selectedTheater.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  Your e-ticket has been sent to your email.
                </p>
              </div>
              <Button onClick={handleClose} variant="outline" className="mt-4">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
