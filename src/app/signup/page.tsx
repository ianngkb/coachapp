"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserRole = "student" | "coach";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
  };

  const handleCreateAccount = async () => {
    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // For demo purposes, show validation error for incomplete email like "me@ian."
    if (email.endsWith(".") || email === "me@ian.") {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to create account
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to email sent page with user role
      window.location.href = `/email-sent?email=${encodeURIComponent(email)}&role=${userRole}&newAccount=true`;
    } catch (err) {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !email || isLoading || !!emailError;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/signin" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
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
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">Create Account</h1>
              <p className="text-sm text-gray-600">
                Join our coaching platform! We'll send you a secure link to complete your registration.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-800">
                I want to join as a...
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUserRole("student")}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    userRole === "student"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <User className="w-6 h-6 text-gray-700" />
                    <div>
                      <div className="font-medium text-gray-900">Student</div>
                      <div className="text-xs text-gray-600">Looking to book coaching sessions</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setUserRole("coach")}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    userRole === "coach"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Users className="w-6 h-6 text-gray-700" />
                    <div>
                      <div className="font-medium text-gray-900">Coach</div>
                      <div className="text-xs text-gray-600">Offering coaching services</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Email Input */}
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
                className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <Button
              onClick={handleCreateAccount}
              disabled={isButtonDisabled}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Creating account..." : "Create account & send magic link"}
            </Button>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-gray-500 text-center w-full">
              By creating an account, you agree to our{" "}
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