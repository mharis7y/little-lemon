import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isOnboarded: boolean;
  isLoading: boolean;
  login: (firstName: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  userProfile: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const checkOnboarding = async () => {
    try {
      const raw = await AsyncStorage.getItem('userProfile');
      if (raw) {
        const profile = JSON.parse(raw);
        setUserProfile(profile);
      }
    } catch (e) {
      console.error('Error reading AsyncStorage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkOnboarding();
  }, []);

  const login = async (firstName: string, email: string) => {
    const profileData = {
      firstName,
      lastName: '',
      email,
      phone: '',
      avatar: null,
      checkboxes: {
        orderStatuses: true,
        passwordChanges: true,
        specialOffers: true,
        newsletter: true,
      },
      isOnboardingCompleted: true,
    };
    await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
    setUserProfile(profileData);
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUserProfile(null);
  };

  const updateProfile = async (profileData: any) => {
    await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
    setUserProfile(profileData);
  };

  const isOnboarded = !!userProfile?.isOnboardingCompleted;

  return (
    <AuthContext.Provider value={{ isOnboarded, isLoading, login, logout, updateProfile, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
