import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SeatMapProps {
  totalSeats: number;
  requiredSeats: number;
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
}

// Generate random filled seats (simulating already booked seats)
const generateFilledSeats = (totalSeats: number): Set<string> => {
  const filled = new Set<string>();
  const rows = 8;
  const seatsPerRow = Math.ceil(totalSeats / rows);
  const fillPercentage = 0.3; // 30% of seats are filled
  
  for (let row = 0; row < rows; row++) {
    for (let seat = 0; seat < seatsPerRow; seat++) {
      if (Math.random() < fillPercentage) {
        const rowLetter = String.fromCharCode(65 + row);
        filled.add(`${rowLetter}${seat + 1}`);
      }
    }
  }
  return filled;
};

const SeatMap = ({ totalSeats, requiredSeats, selectedSeats, onSeatsChange }: SeatMapProps) => {
  const [filledSeats, setFilledSeats] = useState<Set<string>>(new Set());
  
  const rows = 8;
  const seatsPerRow = Math.ceil(totalSeats / rows);
  
  useEffect(() => {
    // Generate filled seats once on mount
    setFilledSeats(generateFilledSeats(totalSeats));
  }, [totalSeats]);

  const handleSeatClick = (seatId: string) => {
    if (filledSeats.has(seatId)) return;
    
    if (selectedSeats.includes(seatId)) {
      // Deselect the seat
      onSeatsChange(selectedSeats.filter(s => s !== seatId));
    } else {
      // Only allow selecting up to the required number of seats
      if (selectedSeats.length < requiredSeats) {
        onSeatsChange([...selectedSeats, seatId]);
      }
    }
  };

  const getSeatStatus = (seatId: string) => {
    if (filledSeats.has(seatId)) return 'filled';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="relative">
        <div className="w-full h-8 bg-gradient-to-b from-primary/30 to-transparent rounded-t-full flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-medium tracking-widest">SCREEN</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-2 py-4">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const rowLetter = String.fromCharCode(65 + rowIndex);
          return (
            <div key={rowLetter} className="flex items-center gap-2">
              {/* Row Label */}
              <span className="w-6 text-xs font-medium text-muted-foreground text-center">
                {rowLetter}
              </span>
              
              {/* Seats */}
              <div className="flex gap-1">
                {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                  const seatNumber = seatIndex + 1;
                  const seatId = `${rowLetter}${seatNumber}`;
                  const status = getSeatStatus(seatId);
                  
                  // Add aisle gap in the middle
                  const hasAisle = seatIndex === Math.floor(seatsPerRow / 2) - 1;
                  
                  return (
                    <div key={seatId} className={cn("flex", hasAisle && "mr-4")}>
                      <button
                        onClick={() => handleSeatClick(seatId)}
                        disabled={status === 'filled'}
                        className={cn(
                          "w-7 h-7 rounded text-xs font-medium transition-all duration-200",
                          "flex items-center justify-center",
                          status === 'filled' && "bg-muted text-muted-foreground cursor-not-allowed",
                          status === 'available' && "border-2 border-green-500 text-green-500 hover:bg-green-500/10 cursor-pointer",
                          status === 'selected' && "bg-green-500 text-white border-2 border-green-500"
                        )}
                        title={status === 'filled' ? 'Seat unavailable' : `Seat ${seatId}`}
                      >
                        {seatNumber}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Row Label (right side) */}
              <span className="w-6 text-xs font-medium text-muted-foreground text-center">
                {rowLetter}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border-2 border-green-500" />
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-green-500 border-2 border-green-500" />
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-muted" />
          <span className="text-xs text-muted-foreground">Filled</span>
        </div>
      </div>

      {/* Selection Status */}
      <div className="text-center">
        <p className="text-sm">
          <span className="font-medium">{selectedSeats.length}</span>
          <span className="text-muted-foreground"> of </span>
          <span className="font-medium">{requiredSeats}</span>
          <span className="text-muted-foreground"> seats selected</span>
        </p>
        {selectedSeats.length > 0 && (
          <p className="text-xs text-primary mt-1">
            Seats: {selectedSeats.sort().join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeatMap;
