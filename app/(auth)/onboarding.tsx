// app/(auth)/onboarding.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import OnboardingScreen from '../../screens/Onboarding';

export default function OnboardingRoute() {
  const { login } = useAuth();

  const handleComplete = async (firstName: string, email: string) => {
    try {
      await login(firstName, email);
    } catch (e) {
      console.error('Error logging in:', e);
    }
  };

  return <OnboardingScreen onComplete={handleComplete} />;
}

