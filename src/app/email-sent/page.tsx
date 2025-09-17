"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EmailSentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage('Email address not found. Please sign up again.');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setResendMessage(result.error || 'Failed to resend email. Please try again.');
      }
    } catch (error) {
      setResendMessage('Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4 p-6 md:p-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-neutral-900">Check Your Email</h1>
            <p className="text-sm text-neutral-600">
              We&apos;ve sent a verification link to your email address.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6 md:p-8 pt-0">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-800">Account Created Successfully!</p>
                <p className="text-sm text-green-700">
                  Click the verification link in your email to complete your registration.
                </p>
                {email && (
                  <p className="text-xs text-green-600 font-mono bg-green-100 px-2 py-1 rounded">
                    {email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-800">What&apos;s next?</h3>
            <ol className="text-sm text-neutral-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium mt-0.5 flex-shrink-0">
                  1
                </span>
                <span>Check your inbox (and spam folder) for our verification email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium mt-0.5 flex-shrink-0">
                  2
                </span>
                <span>Click the &quot;Verify Email&quot; button in the email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium mt-0.5 flex-shrink-0">
                  3
                </span>
                <span>You&apos;ll be redirected to your dashboard to get started</span>
              </li>
            </ol>
          </div>

          {resendMessage && (
            <Alert className={resendMessage.includes('sent') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <AlertDescription className={resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}>
                {resendMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-6 md:p-8 pt-0">
          <Button
            onClick={handleResendEmail}
            disabled={isResending || !email}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Resend verification email
              </>
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm text-neutral-500 hover:text-neutral-700 underline"
            >
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-500">
          Having trouble? Check your spam folder or{" "}
          <Link href="/support" className="underline hover:text-neutral-700">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}