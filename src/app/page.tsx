
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { axiosInstance } from '@/lib/axios-instance';

const FEATURE_FLAGS_KEY = 'featureFlags';
const THEME_SETTINGS_KEY = 'themeSettings';

export default function LandingPage() {
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const loginResponse = await axiosInstance.post(`/api/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      if (loginResponse.status === 200 && loginResponse.data.token) {
        localStorage.setItem('authToken', loginResponse.data.token);
        if (loginResponse.data.userResponse) {
          // Set both the dynamic and static profiles on login
          localStorage.setItem(
            'userProfile',
            JSON.stringify(loginResponse.data.userResponse)
          );
          localStorage.setItem(
            'staticUserProfile',
            JSON.stringify(loginResponse.data.userResponse)
          );
        }

        // Fetch access control / feature flags
        try {
          const accessResponse = await axiosInstance.get('/api/access/');
          if (accessResponse.status === 200 && accessResponse.data.accessControl) {
            localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(accessResponse.data.accessControl));
          } else {
            console.warn("Could not fetch feature flags, using defaults.");
            localStorage.removeItem(FEATURE_FLAGS_KEY);
          }
        } catch (accessErr) {
          console.error('Failed to fetch access controls:', accessErr);
          localStorage.removeItem(FEATURE_FLAGS_KEY);
        }

        router.push('/kitchen');
      } else {
        setLoginError(loginResponse.data.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setLoginError(
        err.response?.data?.message || 'Invalid credentials or server error.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const isLoginFormInvalid = !isValidEmail(loginEmail) || !loginPassword.trim();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-aurora dark:bg-background transition-colors duration-500">
      {/* Abstract shapes/blobs for background vibe */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 animate-pulse" />

      <main className="z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 p-6 md:p-12">
        {/* Left Side: Branding & Pitch */}
        <div className="flex-1 text-center md:text-left space-y-6 animate-float">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-primary">
            <Zap className="w-4 h-4 fill-current" />
            <span>Faster orders, happier kitchens</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
            Welcome to <span className="text-gradient">OrderEase</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/90 max-w-lg mx-auto md:mx-0 leading-relaxed">
            The modern operating system for your kitchen. Streamline workflows, manage orders, and deliver success.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center text-xs text-white">U{i}</div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">Trusted by 500+ Kitchens</div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="flex-1 w-full max-w-md">
          <Card className="w-full glass-card border-white/5 shadow-2xl transition-all duration-300 hover:shadow-green-900/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLoginSubmit} noValidate>
              <CardContent className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="ml-1">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="ml-1">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                {loginError && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    {loginError}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-base font-medium group"
                  type="submit"
                  disabled={loginLoading || isLoginFormInvalid}
                >
                  {loginLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Login to Kitchen <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                <div className="text-center text-xs text-muted-foreground">
                  Protected by enterprise-grade security
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <footer className="absolute bottom-4 w-full text-center text-xs text-white/20">
        Powered by OrderEase © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
