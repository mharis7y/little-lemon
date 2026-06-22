// app/_layout.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { AuthProvider, useAuth } from '../context/AuthContext';

function NavigationGuard() {
  const { isOnboarded } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!isOnboarded && !inAuthGroup) {
      router.replace('/(auth)/onboarding');
    } else if (isOnboarded && !inAppGroup) {
      router.replace('/(app)/');
    }
  }, [isOnboarded, segments]);

  return null;
}

function RootLayoutContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#495E57" />
      </View>
    );
  }

  return (
    <>
      <NavigationGuard />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SQLiteProvider databaseName="little_lemon">
        <RootLayoutContent />
      </SQLiteProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

