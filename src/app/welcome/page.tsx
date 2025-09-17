"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser, createOrUpdateUserProfile } from "@/lib/auth";

export default function WelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"student" | "coach">("student");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/signin');
        return;
      }

      setUser(currentUser);
      setFullName(`${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim());

      // If user already has a user_type, redirect to appropriate dashboard
      if (currentUser.user_type) {
        if (currentUser.user_type === 'coach') {
          router.push('/coach-dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      setIsLoading(false);
    };

    loadUser();
  }, [router]);

  const handleCompleteProfile = async () => {
    if (!fullName.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const result = await createOrUpdateUserProfile(user.id, user.email, {
        first_name: fullName.split(' ')[0] || '',
        last_name: fullName.split(' ').slice(1).join(' ') || '',
        user_type: userType
      });

      if (result.success) {
        // Redirect to appropriate dashboard
        if (userType === 'coach') {
          router.push('/coach-dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        alert('Failed to complete profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-4 p-6 md:p-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-semibold text-neutral-900">Welcome!</h1>
              <p className="text-sm text-neutral-600">
                Complete your profile to get started with our coaching platform.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-6 md:p-8 pt-0">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-neutral-800">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-neutral-800">
                I want to join as a...
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUserType("student")}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    userType === "student"
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
                  onClick={() => setUserType("coach")}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    userType === "coach"
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

            <Button
              onClick={handleCompleteProfile}
              disabled={!fullName.trim() || isSubmitting}
              className={`w-full ${
                (!fullName.trim() || isSubmitting)
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              size="lg"
            >
              {isSubmitting ? "Completing Profile..." : "Complete Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}