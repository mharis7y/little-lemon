// screens/Onboarding.js
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s]+$/;

export default function Onboarding({ onComplete }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  const isNameValid = firstName.trim().length > 0 && NAME_REGEX.test(firstName);
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isFormValid = isNameValid && isEmailValid;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/img/littleLemonLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* ── Hero Banner ── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>Little Lemon</Text>
            <Text style={styles.heroSubtitle}>Chicago</Text>
            <Text style={styles.heroDescription}>
              We are a family owned Mediterranean restaurant, focused on
              traditional recipes served with a modern twist.
            </Text>
          </View>
          <Image
            source={require('../assets/images/img/restauranfood.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* ── Form ── */}
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Name *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor="#AFAEAE"
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#AFAEAE"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
            onPress={() => isFormValid && onComplete(firstName.trim(), email.trim())}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextButtonText, !isFormValid && styles.nextButtonTextDisabled]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 200,
    height: 50,
  },
  heroBanner: {
    backgroundColor: '#495E57',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 36,
    fontWeight: '700',
    color: '#F4CE14',
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  heroImage: {
    width: 130,
    height: 130,
    borderRadius: 16,
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#495E57',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#EDEFEE',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  nextButtonTextDisabled: {
    color: '#AFAEAE',
  },
});
