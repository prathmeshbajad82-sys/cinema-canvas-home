-- Fix 1: Update validate_booking function with explicit authorization check
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- CRITICAL: Verify user owns this booking (authorization check)
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot create/modify bookings for other users';
  END IF;
  
  -- Validate seats range (1-10)
  IF NEW.seats <= 0 OR NEW.seats > 10 THEN
    RAISE EXCEPTION 'Invalid seat count: must be between 1 and 10';
  END IF;
  
  -- Validate price is positive
  IF NEW.total_price <= 0 THEN
    RAISE EXCEPTION 'Invalid price: must be greater than 0';
  END IF;
  
  -- Validate showtime is not empty
  IF NEW.showtime IS NULL OR TRIM(NEW.showtime) = '' THEN
    RAISE EXCEPTION 'Showtime is required';
  END IF;
  
  -- Validate theater name is not empty
  IF NEW.theater_name IS NULL OR TRIM(NEW.theater_name) = '' THEN
    RAISE EXCEPTION 'Theater name is required';
  END IF;
  
  -- Validate theater location is not empty
  IF NEW.theater_location IS NULL OR TRIM(NEW.theater_location) = '' THEN
    RAISE EXCEPTION 'Theater location is required';
  END IF;
  
  -- Validate booking date is not in the past
  IF NEW.booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot book for past dates';
  END IF;
  
  -- Validate movie exists
  IF NOT EXISTS (SELECT 1 FROM public.movies WHERE id = NEW.movie_id) THEN
    RAISE EXCEPTION 'Invalid movie: movie does not exist';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix 2: Update update_updated_at_column to use SECURITY INVOKER (doesn't need elevated privileges)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;