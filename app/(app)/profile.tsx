// app/(app)/profile.tsx
// Profile screen route
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import ProfileScreen from '../../screens/Profile';

export default function ProfileRoute() {
  const router = useRouter();
  const { userProfile, logout, updateProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async (profileData: any) => {
    try {
      await updateProfile(profileData);
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  };

  return (
    <ProfileScreen
      userProfile={userProfile}
      onLogout={handleLogout}
      onBack={handleBack}
      onSave={handleSave}
    />
  );
}

