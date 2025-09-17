"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, CircleAlert, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) {
      setError("");
    }
  };

  const handleSignIn = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      // Direct API call to avoid auth issues
      console.log('🔐 Signing in directly via API...');

      const response = await fetch('/api/auth/signin-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      console.log('✅ API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid email or password. Please try again.');
        return;
      }

      const result = await response.json();
      console.log('✅ Signin successful:', result);

      // Store user session in localStorage for now
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('session', JSON.stringify(result.session));
      }

      // Redirect based on user type
      if (result.user.user_type === 'coach') {
        router.push('/coach-dashboard');
      } else {
        router.push('/dashboard');
      }

    } catch (err) {
      console.error('❌ Signin error:', err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !email || !password || isLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-4 p-6 md:p-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-semibold text-neutral-900">Sign In</h1>
              <p className="text-sm text-neutral-600">
                Welcome back! Please enter your email and password to continue.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-6 md:p-8 pt-0">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-800">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-800">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-2 mb-4 bg-red-50 border-red-200">
                <CircleAlert className="w-4 h-4" />
                <AlertTitle className="text-sm font-medium text-red-600">Sign in failed</AlertTitle>
                <AlertDescription className="text-xs text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 space-y-3">
              <Button
                onClick={handleSignIn}
                disabled={isButtonDisabled}
                className={`w-full ${
                  isButtonDisabled
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
                size="lg"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-3">Don't have an account yet?</p>
                <Button variant="outline" size="lg" className="w-full border-black text-black hover:bg-gray-50" asChild>
                  <Link href="/signup">Create new account</Link>
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-6 md:p-8 pt-0">
            <p className="text-xs text-neutral-500 text-center w-full">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}