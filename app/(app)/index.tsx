// app/(app)/index.tsx
// Home screen route — landing page after onboarding
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import HomeScreen from '../../screens/Home';

export default function HomeRoute() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const handleNavigateToProfile = () => {
    router.push('/(app)/profile');
  };

  return (
    <HomeScreen
      userProfile={userProfile}
      onNavigateToProfile={handleNavigateToProfile}
    />
  );
}

