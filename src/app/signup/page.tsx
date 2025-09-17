"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, User, Users, Eye, EyeOff, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { signUpWithPassword } from "@/lib/auth";

type UserRole = "student" | "coach";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (error) {
      setError("");
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    return null;
  };

  const handleCreateAccount = async () => {
    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUpWithPassword(email, password, userRole);
      
      console.log('✅ Account created successfully:', result);

      if (!result.success) {
        setError(result.error || 'Failed to create account. Please try again.');
        return;
      }

      // Show success message and redirect
      alert('Account created successfully! Please check your email to confirm your account.');
      router.push('/welcome');

    } catch (err) {
      console.error('❌ Signup error:', err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !email || !password || !confirmPassword || isLoading || !validateEmail(email);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Link href="/signin" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-4 p-6 md:p-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-semibold text-neutral-900">Create Account</h1>
              <p className="text-sm text-neutral-600">
                Join our coaching platform! Create your account to get started.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-6 md:p-8 pt-0">
            <form onSubmit={(e) => { e.preventDefault(); handleCreateAccount(); }}>
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-neutral-800">
                I want to join as a...
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserRole("student")}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    userRole === "student"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <User className="w-6 h-6 text-gray-700" />
                    <div>
                      <div className="font-medium text-neutral-900">Student</div>
                      <div className="text-xs text-neutral-600">Looking to book coaching sessions</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserRole("coach")}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    userRole === "coach"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Users className="w-6 h-6 text-gray-700" />
                    <div>
                      <div className="font-medium text-neutral-900">Coach</div>
                      <div className="text-xs text-neutral-600">Offering coaching services</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-800">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@domain.co"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-800">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
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

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-800">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
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
                <AlertTitle className="text-sm font-medium text-red-600">Account creation failed</AlertTitle>
                <AlertDescription className="text-xs text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full ${
                isButtonDisabled
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              size="lg"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            </form>
          </CardContent>

          <CardFooter className="p-6 md:p-8 pt-0">
            <p className="text-xs text-neutral-500 text-center w-full">
              By creating an account, you agree to our{" "}
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