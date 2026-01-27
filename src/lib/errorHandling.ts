/**
 * Centralized error handling utilities to prevent information leakage
 * Maps internal error messages to safe, user-friendly messages
 */

export const mapDatabaseError = (error: unknown): string => {
  const message = (error as Error)?.message?.toLowerCase() || '';
  
  // Map specific constraint violations
  if (message.includes('duplicate key') || message.includes('unique constraint')) {
    return 'This record already exists. Please try again.';
  }
  if (message.includes('foreign key') || message.includes('does not exist')) {
    return 'Invalid reference. Please check your selection.';
  }
  if (message.includes('not-null') || message.includes('is required')) {
    return 'Required information is missing. Please fill all fields.';
  }
  if (message.includes('check constraint') || message.includes('invalid')) {
    return 'Invalid data provided. Please verify your input.';
  }
  if (message.includes('permission denied') || message.includes('rls') || message.includes('unauthorized')) {
    return 'You do not have permission to perform this action.';
  }
  if (message.includes('seat count') || message.includes('seats')) {
    return 'Invalid seat selection. Please select between 1 and 10 seats.';
  }
  if (message.includes('price') || message.includes('amount')) {
    return 'Invalid price. Please try again.';
  }
  if (message.includes('past date') || message.includes('booking_date')) {
    return 'Cannot book for past dates. Please select a future date.';
  }
  if (message.includes('movie') && message.includes('exist')) {
    return 'Selected movie is no longer available.';
  }
  if (message.includes('theater') || message.includes('showtime')) {
    return 'Please select a valid theater and showtime.';
  }
  
  // Generic fallback - never expose raw error
  return 'An error occurred. Please try again or contact support.';
};

export const mapAuthError = (error: unknown): string => {
  const message = (error as Error)?.message?.toLowerCase() || '';
  
  if (message.includes('invalid login') || message.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'This email is already registered. Please login instead.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please verify your email address.';
  }
  if (message.includes('weak password')) {
    return 'Please choose a stronger password.';
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please try again later.';
  }
  if (message.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Connection error. Please check your internet connection.';
  }
  
  // Generic fallback
  return 'Authentication failed. Please try again.';
};

export const mapPaymentError = (error: unknown): string => {
  const message = (error as Error)?.message?.toLowerCase() || '';
  
  if (message.includes('card') || message.includes('payment method')) {
    return 'Payment method error. Please try a different payment method.';
  }
  if (message.includes('insufficient')) {
    return 'Insufficient funds. Please try a different payment method.';
  }
  if (message.includes('declined')) {
    return 'Payment declined. Please try a different payment method.';
  }
  
  return 'Payment processing failed. Please try again.';
};
