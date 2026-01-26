import { format } from 'date-fns';
import { MapPin, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Theater, TheaterShowtime, getTheaterById } from '@/data/theaters';

interface TheaterListProps {
  movieName: string;
  theaterShowtimes: TheaterShowtime[];
  basePrice: number;
  onSelectShowtime: (theaterId: string, time: string, price: number) => void;
  selectedDate?: Date;
}

const TheaterList = ({ movieName, theaterShowtimes, basePrice, onSelectShowtime, selectedDate }: TheaterListProps) => {
  const displayDate = selectedDate ? format(selectedDate, 'EEE, MMM d') : 'Today';
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Showtimes for <span className="text-primary">{displayDate}</span>
        </h2>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {theaterShowtimes.map((showtime) => {
          const theater = getTheaterById(showtime.theaterId);
          if (!theater) return null;
          
          const adjustedPrice = Math.round(basePrice * showtime.priceMultiplier);
          
          return (
            <div
              key={theater.id}
              className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card/80 transition-colors"
            >
              {/* Theater Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{theater.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{theater.location}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">₹{adjustedPrice}</span>
              </div>
              
              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {theater.amenities.map((amenity) => (
                  <Badge 
                    key={amenity} 
                    variant="secondary" 
                    className="text-xs font-normal bg-secondary/50"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {amenity}
                  </Badge>
                ))}
              </div>
              
              {/* Showtimes */}
              <div className="flex flex-wrap gap-2">
                {showtime.times.map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectShowtime(theater.id, time, adjustedPrice)}
                    className="min-w-[80px] hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Prices may vary by theater. Select a showtime to continue.
      </p>
    </div>
  );
};

export default TheaterList;
