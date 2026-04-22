import { toast } from 'sonner';

/**
 * Mock email notification trigger.
 * Instead of sending a real email (e.g. via Resend), this surfaces a UI toast
 * so the developer can confirm the auth/booking event fired end-to-end.
 */
export const notifyLoginConfirmed = (identifier: string) => {
  toast.success('Login confirmed', {
    description: `📧 (mock email) Welcome back — signed in as ${identifier}`,
  });
};

export const notifyBookingConfirmed = (movieTitle: string, seats: number) => {
  toast.success('Booking confirmed', {
    description: `📧 (mock email) ${seats} seat(s) reserved for "${movieTitle}".`,
  });
};
