"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSendMagicLink = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call to check if user exists
    try {
      // Mock validation - checking if email exists in database
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, show error for "asd@mail.com" as shown in design
      if (email === "asd@mail.com") {
        setError("Account not found. No account exists with this email address.");
        setIsLoading(false);
        return;
      }

      // Redirect to email sent page
      window.location.href = `/email-sent?email=${encodeURIComponent(email)}`;
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !email || isLoading || !!error;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="base" className="h-8" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">Sign In</h1>
              <p className="text-sm text-gray-600">
                We'll send you a secure link to sign in. No password needed.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-800">
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

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <CircleAlert className="w-4 h-4" />
                <AlertTitle className="text-red-800">Account not found</AlertTitle>
                <AlertDescription className="text-red-700">
                  {error === "Account not found. No account exists with this email address."
                    ? "No account exists with this email address."
                    : error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSendMagicLink}
              disabled={isButtonDisabled}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Sending..." : "Send magic link"}
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Don't have an account yet?</p>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/signup">Create new account</Link>
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-gray-500 text-center w-full">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
              . We use passwordless authentication for your security.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}