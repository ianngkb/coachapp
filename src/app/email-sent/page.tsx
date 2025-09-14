"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MailCheck, CheckCircle2, Copy, Edit3, ExternalLink, RotateCcw, Timer, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function EmailSentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "";
  const isNewAccount = searchParams.get("newAccount") === "true";

  const [resendSeconds, setResendSeconds] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (resendSeconds > 0) {
      const timer = setTimeout(() => setResendSeconds(resendSeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendSeconds]);

  // Auto demo login after 3 seconds (as mentioned in the spec)
  useEffect(() => {
    const demoTimer = setTimeout(() => {
      // For demo purposes, auto-redirect to dashboard
      if (role === "coach") {
        window.location.href = "/coach-dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    }, 3000);

    return () => clearTimeout(demoTimer);
  }, [role]);

  const handleResendLink = async () => {
    setIsResending(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset countdown
      setResendSeconds(60);

      // Show success toast (in a real app, you'd use a toast library)
      alert("Magic link sent! Check your email.");
    } catch (err) {
      alert("Failed to resend link. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  const handleOpenEmail = () => {
    // Try to open email app
    window.location.href = `mailto:`;
  };

  const resendProgress = ((60 - resendSeconds) / 60) * 100;
  const canResend = resendSeconds === 0;

  return (
    <TooltipProvider>
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
          <Card className="w-full max-w-md">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center relative">
                <MailCheck className="w-8 h-8 text-green-600" />
                <CheckCircle2 className="w-5 h-5 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-gray-900">Check your email</h1>
                <p className="text-sm text-gray-600">
                  {isNewAccount
                    ? "We sent a secure magic link to complete your registration."
                    : "We sent a secure magic link to complete your sign-in."
                  }
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Email Row */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">Sent to</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm text-gray-900">{email}</span>
                  <div className="flex gap-1">
                    <Tooltip open={showTooltip}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyEmail}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copied!</p>
                      </TooltipContent>
                    </Tooltip>

                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <Link href="/signin">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-800">Next steps:</h3>
                <ol className="text-sm text-gray-700 space-y-2">
                  <li>1. Open your email app and find the message from us.</li>
                  <li>2. Tap the link on the device where you want to stay signed in.</li>
                  <li>3. If you don't see it, check spam or promotions.</li>
                </ol>
              </div>

              {/* Resend Block */}
              <div className="space-y-3">
                {resendSeconds > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Timer className="w-4 h-4" />
                    <span>You can resend in {resendSeconds}s</span>
                  </div>
                )}

                {resendSeconds > 0 && (
                  <Progress value={resendProgress} className="h-2" />
                )}

                <Button
                  variant="outline"
                  disabled={!canResend || isResending}
                  onClick={handleResendLink}
                  className="w-full"
                >
                  <RotateCcw className={`w-4 h-4 mr-2 ${isResending ? "animate-spin" : ""}`} />
                  {isResending ? "Sending..." : "Resend link"}
                </Button>
              </div>

              {/* Open Email CTA */}
              <Button
                variant="default"
                size="lg"
                onClick={handleOpenEmail}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open email app
              </Button>

              {/* Tips Alert */}
              <Alert>
                <Mail className="w-4 h-4" />
                <AlertTitle>Didn't get the email?</AlertTitle>
                <AlertDescription className="text-sm">
                  Confirm you entered the correct address, check spam, or try resending after the timer ends.
                </AlertDescription>
              </Alert>

              {/* Demo Auto-Login Notice */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Demo mode: Auto-authenticating in 3 seconds...
                </p>
              </div>
            </CardContent>

            <CardFooter className="text-center">
              <p className="text-xs text-gray-500 w-full">
                <Link href="/terms" className="underline hover:text-gray-700">
                  Terms of Service
                </Link>
                {" • "}
                <Link href="/privacy" className="underline hover:text-gray-700">
                  Privacy Policy
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}