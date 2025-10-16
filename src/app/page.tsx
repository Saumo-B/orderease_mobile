
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
import { Loader2 } from 'lucide-react';
import { axiosInstance } from '@/lib/axios-instance';

const FEATURE_FLAGS_KEY = 'featureFlags';

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
            if(accessResponse.status === 200 && accessResponse.data.accessControl) {
                localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(accessResponse.data.accessControl));
            } else {
                 console.warn("Could not fetch feature flags, using defaults.");
                 // Set default flags if API fails, or clear them
                 localStorage.removeItem(FEATURE_FLAGS_KEY);
            }
        } catch (accessErr) {
            console.error('Failed to fetch access controls:', accessErr);
            // Handle failure to fetch flags - maybe set defaults or clear them
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
    <div className="flex justify-center bg-background text-foreground min-h-screen">
      <main className="w-full max-w-md flex flex-col justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline text-cyan-400">
            Welcome to OrderEase
          </h1>
          <p className="text-lg text-muted-foreground mt-4">
            The simplest way to manage your food orders
          </p>
        </div>

        <div className="flex flex-col">
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold font-headline text-cyan-400">
                Login
              </CardTitle>
              <CardDescription>Access your kitchen</CardDescription>
            </CardHeader>
            <form onSubmit={handleLoginSubmit} noValidate>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                {loginError && (
                  <p className="text-sm text-center text-destructive">{loginError}</p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  className="w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white"
                  type="submit"
                  disabled={loginLoading || isLoginFormInvalid}
                >
                  {loginLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Login'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        <footer className="text-center p-4 text-muted-foreground text-sm mt-8">
          Powered by <span className="text-cyan-400">OrderEase</span> © 2025
        </footer>
      </main>
    </div>
  );
}
