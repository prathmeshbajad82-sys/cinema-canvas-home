-- Fix 1: Add DELETE policy for profiles table
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = user_id);

-- Fix 2: Add DELETE policy for user_preferences table
CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences FOR DELETE
USING (auth.uid() = user_id);

-- Fix 3: Add database constraints for booking input validation
-- Constraint: seats must be positive and max 10
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_seats_positive CHECK (seats > 0 AND seats <= 10);

-- Constraint: total_price must be positive
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_price_positive CHECK (total_price > 0);

-- Create validation trigger for bookings
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate seats range
  IF NEW.seats <= 0 OR NEW.seats > 10 THEN
    RAISE EXCEPTION 'Invalid seat count: must be between 1 and 10';
  END IF;
  
  -- Validate price is positive
  IF NEW.total_price <= 0 THEN
    RAISE EXCEPTION 'Invalid price: must be greater than 0';
  END IF;
  
  -- Validate showtime is not empty
  IF NEW.showtime IS NULL OR NEW.showtime = '' THEN
    RAISE EXCEPTION 'Showtime is required';
  END IF;
  
  -- Validate theater info is not empty
  IF NEW.theater_name IS NULL OR NEW.theater_name = '' THEN
    RAISE EXCEPTION 'Theater name is required';
  END IF;
  
  IF NEW.theater_location IS NULL OR NEW.theater_location = '' THEN
    RAISE EXCEPTION 'Theater location is required';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for booking validation
CREATE TRIGGER validate_booking_trigger
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_booking();