import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mapAuthError } from '@/lib/errorHandling';
import { notifyLoginConfirmed } from '@/lib/notifications';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Phone } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
// Indian phone: exactly 10 digits, must not start with 0, after +91 prefix
const indianPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number (no leading 0)');
const RESEND_SECONDS = 30;

const mapOtpError = (raw: string): string => {
  const msg = raw.toLowerCase();
  if (msg.includes('expired')) return 'This code has expired. Please request a new one.';
  if (msg.includes('invalid') || msg.includes('token')) return 'Incorrect code. Please check the 6 digits and try again.';
  if (msg.includes('rate') || msg.includes('too many')) return 'Too many attempts. Please wait before trying again.';
  return raw || 'Verification failed. Please try again.';
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string; otp?: string }>({});

  // Phone OTP state — Indian numbers only, +91 fixed
  const [phone, setPhone] = useState(''); // 10 local digits only
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [otpInvalid, setOtpInvalid] = useState(false);
  const otpContainerRef = useRef<HTMLDivElement>(null);

  // Focus the first OTP slot input whenever an invalid/expired error is detected
  const focusOtpInput = () => {
    requestAnimationFrame(() => {
      const input = otpContainerRef.current?.querySelector<HTMLInputElement>('input');
      input?.focus();
      input?.select?.();
    });
  };

  const { signIn, signUp, signInWithPhone, verifyPhoneOtp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fullPhone = `+91${phone}`;

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Countdown for resend button
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const validateEmailForm = () => {
    const newErrors: typeof errors = {};
    const e = emailSchema.safeParse(email);
    if (!e.success) newErrors.email = e.error.errors[0].message;
    const p = passwordSchema.safeParse(password);
    if (!p.success) newErrors.password = p.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateEmailForm()) return;
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ variant: 'destructive', title: 'Login Failed', description: mapAuthError(error) });
        } else {
          notifyLoginConfirmed(email);
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({ variant: 'destructive', title: 'Sign Up Failed', description: mapAuthError(error) });
        } else {
          toast({ title: 'Account Created!', description: 'Check your email to verify your account.' });
          setIsLogin(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async () => {
    const result = indianPhoneSchema.safeParse(phone);
    if (!result.success) {
      setErrors({ phone: result.error.errors[0].message });
      return false;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const { error } = await signInWithPhone(fullPhone);
      if (error) {
        toast({ variant: 'destructive', title: 'Failed to send code', description: mapAuthError(error) });
        return false;
      }
      setOtpSent(true);
      setOtp('');
      setOtpInvalid(false);
      setResendIn(RESEND_SECONDS);
      toast({ title: 'Code sent', description: `We sent a 6-digit code to ${fullPhone}.` });
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    await requestOtp();
  };

  const handleResendOtp = async () => {
    if (resendIn > 0 || isLoading) return;
    await requestOtp();
  };

  const handleVerifyOtp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (otp.length !== 6) {
      setErrors({ otp: 'Enter all 6 digits of the code' });
      setOtpInvalid(true);
      focusOtpInput();
      return;
    }
    setErrors({});
    setOtpInvalid(false);
    setIsLoading(true);
    try {
      const { error } = await verifyPhoneOtp(fullPhone, otp);
      if (error) {
        const friendly = mapOtpError(mapAuthError(error));
        setErrors({ otp: friendly });
        setOtpInvalid(true);
        setOtp('');
        focusOtpInput();
        toast({ variant: 'destructive', title: 'Verification failed', description: friendly });
      } else {
        notifyLoginConfirmed(fullPhone);
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

      <Card className="w-full max-w-md relative z-10 border-border bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-2">
            <span className="text-primary-foreground font-bold text-xl">B</span>
          </div>
          <CardTitle className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
          <CardDescription>Sign in with phone or email to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="phone"><Phone className="w-4 h-4 mr-2" />Phone</TabsTrigger>
              <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" />Email</TabsTrigger>
            </TabsList>

            <TabsContent value="phone">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile number</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center px-3 rounded-md border border-input bg-muted text-sm font-medium text-foreground select-none">
                        +91
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          maxLength={10}
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setPhone(digits);
                            setErrors((p) => ({ ...p, phone: undefined }));
                          }}
                          className={`pl-10 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                      </div>
                    </div>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    <p className="text-xs text-muted-foreground">
                      Indian numbers only. Enter 10 digits without the leading 0 — we add +91 automatically.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || phone.length !== 10}>
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending code...</> : 'Send code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp-input">Enter 6-digit code sent to {fullPhone}</Label>
                    <div className="flex justify-center" ref={otpContainerRef}>
                      <InputOTP
                        id="otp-input"
                        maxLength={6}
                        value={otp}
                        onChange={(v) => {
                          setOtp(v);
                          setErrors((p) => ({ ...p, otp: undefined }));
                          setOtpInvalid(false);
                        }}
                        aria-invalid={otpInvalid}
                        aria-describedby="otp-error"
                      >
                        <InputOTPGroup className={otpInvalid ? '[&>div]:border-destructive [&>div]:ring-1 [&>div]:ring-destructive' : ''}>
                          {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p
                      id="otp-error"
                      role="alert"
                      aria-live="assertive"
                      aria-atomic="true"
                      className={`text-sm text-destructive text-center min-h-[1.25rem] ${errors.otp ? '' : 'sr-only'}`}
                    >
                      {errors.otp ?? ''}
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify & Sign in'}
                  </Button>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => { setOtpSent(false); setOtp(''); setOtpInvalid(false); setErrors({}); setResendIn(0); }}
                    >
                      Change number
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleResendOtp}
                      disabled={resendIn > 0 || isLoading}
                    >
                      {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="fullName" type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }} className={`pl-10 ${errors.email ? 'border-destructive' : ''}`} />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }} className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isLogin ? 'Signing in...' : 'Creating account...'}</> : (isLogin ? 'Sign In' : 'Create Account')}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button type="button" onClick={() => { setIsLogin(!isLogin); setErrors({}); }} className="text-primary hover:underline font-medium">
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
};

export default Auth;
