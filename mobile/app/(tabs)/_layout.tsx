import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useCartStore } from '../../src/store/cartStore';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

function HeaderLeft() {
  return (
    <TouchableOpacity onPress={() => router.push('/landing')} style={{ marginLeft: 12, padding: 4 }}>
      <Ionicons name="arrow-back" size={22} color="#fff" />
    </TouchableOpacity>
  );
}

function HeaderRight() {
  return (
    <TouchableOpacity onPress={() => router.push('/notifications')} style={hst.bellWrap}>
      <Ionicons name="notifications-outline" size={21} color="#fff" />
      <View style={hst.bellDot} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { theme } = useThemeStore();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary[500] },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: 'Samba Publications',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart" size={size} color={color} />
              {totalItems > 0 && (
                <View style={bst.badge}>
                  <Text style={bst.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const hst = StyleSheet.create({
  bellWrap: { marginRight: 14, padding: 4, position: 'relative' },
  bellDot: {
    position: 'absolute', top: 3, right: 3,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.danger[500],
    borderWidth: 1.5, borderColor: colors.primary[500],
  },
});

const bst = StyleSheet.create({
  badge: {
    position: 'absolute', top: -4, right: -10,
    backgroundColor: colors.danger[500],
    borderRadius: 10, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
