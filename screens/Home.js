// screens/Home.js
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createTable,
  filterMenuItems,
  getMenuItems,
  saveMenuItems,
} from '../utils/database';

const API_URL =
  'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json';
const IMAGE_BASE =
  'https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/';

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks'];

function Avatar({ uri, firstName, lastName, size = 44, onPress }) {
  if (uri) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      </TouchableOpacity>
    );
  }
  const initials =
    `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`.toUpperCase() || '?';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.initialsCircle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.initialsText}>{initials}</Text>
    </TouchableOpacity>
  );
}

function MenuItemCard({ item }) {
  return (
    <View style={styles.menuItem}>
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.menuItemPrice}>${Number(item.price).toFixed(2)}</Text>
      </View>
      <Image
        source={{ uri: `${IMAGE_BASE}${item.image}?raw=true` }}
        style={styles.menuItemImage}
        resizeMode="cover"
      />
    </View>
  );
}

export default function Home({ userProfile, onNavigateToProfile }) {
  const db = useSQLiteContext();
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  // ── Load menu data ──────────────────────────────────────────────
  useEffect(() => {
    async function loadMenu() {
      try {
        await createTable(db);
        const stored = await getMenuItems(db);
        if (stored.length === 0) {
          // Fetch from remote
          const res = await fetch(API_URL);
          const json = await res.json();
          const items = json.menu ?? [];
          await saveMenuItems(db, items);
          setMenuItems(items);
        } else {
          setMenuItems(stored);
        }
      } catch (e) {
        console.error('Error loading menu:', e);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [db]);

  // ── Filter whenever categories or query changes ─────────────────
  const applyFilters = useCallback(
    async (categories, query) => {
      try {
        const results = await filterMenuItems(db, categories, query);
        setMenuItems(results);
      } catch (e) {
        console.error('Filter error:', e);
      }
    },
    [db]
  );

  const handleCategoryToggle = (category) => {
    setActiveCategories((prev) => {
      const next = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      applyFilters(next, searchQuery);
      return next;
    });
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters(activeCategories, text);
    }, 500);
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLogoWrap}>
          <Image
            source={require('../assets/images/img/littleLemonLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Avatar
          uri={userProfile?.avatar}
          firstName={userProfile?.firstName}
          lastName={userProfile?.lastName}
          size={44}
          onPress={onNavigateToProfile}
        />
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item, i) => `${item.name}-${i}`}
        renderItem={({ item }) => <MenuItemCard item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <>
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
              {/* Search Bar */}
              <View style={styles.searchBarWrap}>
                <Ionicons name="search" size={20} color="#495E57" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  placeholder="Search menu..."
                  placeholderTextColor="#AFAEAE"
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
              </View>
            </View>

            {/* ── Delivery + Categories ── */}
            <View style={styles.deliverySection}>
              <Text style={styles.deliveryTitle}>ORDER FOR DELIVERY!</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map((cat) => {
                  const active = activeCategories.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryPill, active && styles.categoryPillActive]}
                      onPress={() => handleCategoryToggle(cat)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[styles.categoryPillText, active && styles.categoryPillTextActive]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.separator} />
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#495E57" style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.emptyText}>No items found.</Text>
          )
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  headerLogoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 44,
  },
  initialsCircle: {
    backgroundColor: '#495E57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#F4CE14',
    fontWeight: '700',
    fontSize: 16,
  },
  // Hero
  heroBanner: {
    backgroundColor: '#495E57',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroTextCol: {
    marginBottom: 12,
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
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    maxWidth: '55%',
  },
  heroImage: {
    width: 130,
    height: 130,
    borderRadius: 16,
    position: 'absolute',
    right: 20,
    top: 20,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEFEE',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    padding: 0,
  },
  // Delivery & Categories
  deliverySection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 8,
  },
  categoryPill: {
    borderWidth: 1.5,
    borderColor: '#495E57',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EDEFEE',
  },
  categoryPillActive: {
    backgroundColor: '#495E57',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495E57',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  // Menu Items
  listContent: {
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  menuItemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  menuItemName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 19,
    marginBottom: 6,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495E57',
  },
  menuItemImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#AFAEAE',
    fontSize: 15,
  },
});
