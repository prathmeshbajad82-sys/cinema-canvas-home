export interface Theater {
  id: string;
  name: string;
  location: string;
  amenities: string[];
}

export interface TheaterShowtime {
  theaterId: string;
  times: string[];
  priceMultiplier: number; // Some theaters charge more
}

export const theaters: Theater[] = [
  {
    id: 'theater-1',
    name: 'PVR Cinemas',
    location: 'Phoenix Mall, Lower Parel',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Food Court'],
  },
  {
    id: 'theater-2',
    name: 'INOX',
    location: 'R-City Mall, Ghatkopar',
    amenities: ['IMAX', '4DX', 'Parking'],
  },
  {
    id: 'theater-3',
    name: 'Cinépolis',
    location: 'Viviana Mall, Thane',
    amenities: ['VIP Lounge', 'Dolby Atmos', 'Luxury Seating'],
  },
  {
    id: 'theater-4',
    name: 'Carnival Cinemas',
    location: 'Andheri West',
    amenities: ['3D', 'Snack Bar', 'Wheelchair Access'],
  },
];

// Generate showtimes for each theater based on movie
export const getTheaterShowtimes = (movieShowTimes: string[]): TheaterShowtime[] => {
  return theaters.map((theater, index) => {
    // Distribute showtimes across theaters with some variation
    const baseIndex = index % 2;
    const times = movieShowTimes.filter((_, i) => (i + baseIndex) % 2 === 0 || movieShowTimes.length <= 2);
    
    return {
      theaterId: theater.id,
      times: times.length > 0 ? times : movieShowTimes.slice(0, 2),
      priceMultiplier: 1 + (index * 0.1), // PVR: 1x, INOX: 1.1x, Cinépolis: 1.2x, Carnival: 1.3x
    };
  });
};

export const getTheaterById = (id: string): Theater | undefined => {
  return theaters.find(theater => theater.id === id);
};
