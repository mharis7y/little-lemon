// screens/Profile.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const PHONE_REGEX = /^\(\d{3}\) \d{3}-\d{4}$/;

function Checkbox({ checked, onToggle, label }) {
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function Avatar({ uri, firstName, lastName, size = 72 }) {
  if (uri) {
    return (
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    );
  }
  const initials =
    `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`.toUpperCase() || '?';
  return (
    <View style={[styles.initialsCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.33 }]}>{initials}</Text>
    </View>
  );
}

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function Profile({ userProfile, onLogout, onBack, onSave }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(null);

  const [checkboxes, setCheckboxes] = useState({
    orderStatuses: true,
    passwordChanges: true,
    specialOffers: true,
    newsletter: true,
  });

  // Populate from saved profile on mount
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName ?? '');
      setLastName(userProfile.lastName ?? '');
      setEmail(userProfile.email ?? '');
      setPhone(userProfile.phone ?? '');
      setAvatar(userProfile.avatar ?? null);
      setCheckboxes((prev) => ({
        ...prev,
        ...(userProfile.checkboxes ?? {}),
      }));
    }
  }, [userProfile]);

  const handlePhoneChange = (text) => {
    setPhone(formatPhone(text));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const removeImage = () => setAvatar(null);

  const handleSave = async () => {
    const profileData = {
      firstName,
      lastName,
      email,
      phone,
      avatar,
      checkboxes,
      isOnboardingCompleted: true,
    };
    if (onSave) {
      await onSave(profileData);
    } else {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
    }
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const handleDiscard = () => {
    if (userProfile) {
      setFirstName(userProfile.firstName ?? '');
      setLastName(userProfile.lastName ?? '');
      setEmail(userProfile.email ?? '');
      setPhone(userProfile.phone ?? '');
      setAvatar(userProfile.avatar ?? null);
      setCheckboxes((prev) => ({ ...prev, ...(userProfile.checkboxes ?? {}) }));
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    onLogout();
  };

  const toggleCheckbox = (key) => {
    setCheckboxes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerLogoWrap}>
          <Image
            source={require('../assets/images/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Avatar uri={avatar} firstName={firstName} lastName={lastName} size={44} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Personal Information ── */}
        <Text style={styles.sectionTitle}>Personal information</Text>

        {/* Avatar row */}
        <Text style={styles.fieldLabel}>Avatar</Text>
        <View style={styles.avatarRow}>
          <Avatar uri={avatar} firstName={firstName} lastName={lastName} size={80} />
          <TouchableOpacity style={styles.changeBtn} onPress={pickImage} activeOpacity={0.8}>
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={removeImage} activeOpacity={0.8}>
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>

        {/* First Name */}
        <Text style={styles.fieldLabel}>First name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor="#AFAEAE"
          autoCapitalize="words"
        />

        {/* Last Name */}
        <Text style={styles.fieldLabel}>Last name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor="#AFAEAE"
          autoCapitalize="words"
        />

        {/* Email */}
        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#AFAEAE"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone */}
        <Text style={styles.fieldLabel}>Phone number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={handlePhoneChange}
          placeholder="(XXX) XXX-XXXX"
          placeholderTextColor="#AFAEAE"
          keyboardType="phone-pad"
        />

        {/* ── Email Notifications ── */}
        <Text style={styles.notificationsTitle}>Email notifications</Text>
        <Checkbox
          checked={checkboxes.orderStatuses}
          onToggle={() => toggleCheckbox('orderStatuses')}
          label="Order statuses"
        />
        <Checkbox
          checked={checkboxes.passwordChanges}
          onToggle={() => toggleCheckbox('passwordChanges')}
          label="Password changes"
        />
        <Checkbox
          checked={checkboxes.specialOffers}
          onToggle={() => toggleCheckbox('specialOffers')}
          label="Special offers"
        />
        <Checkbox
          checked={checkboxes.newsletter}
          onToggle={() => toggleCheckbox('newsletter')}
          label="Newsletter"
        />

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>

        {/* ── Bottom Buttons ── */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.discardButton}
            onPress={handleDiscard}
            activeOpacity={0.8}
          >
            <Text style={styles.discardButtonText}>Discard changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Save changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#495E57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 40,
  },
  initialsCircle: {
    backgroundColor: '#495E57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#F4CE14',
    fontWeight: '700',
  },
  // Scroll
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
    marginBottom: 6,
    marginTop: 4,
  },
  // Avatar
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  changeBtn: {
    backgroundColor: '#495E57',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  changeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  removeBtn: {
    borderWidth: 1.5,
    borderColor: '#495E57',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  removeBtnText: {
    color: '#495E57',
    fontWeight: '700',
    fontSize: 15,
  },
  // Inputs
  input: {
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  // Notifications
  notificationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginTop: 8,
    marginBottom: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#495E57',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#495E57',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333333',
  },
  // Logout
  logoutButton: {
    backgroundColor: '#F4CE14',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
    letterSpacing: 0.3,
  },
  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  discardButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#495E57',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#495E57',
    fontWeight: '700',
    fontSize: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#495E57',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
