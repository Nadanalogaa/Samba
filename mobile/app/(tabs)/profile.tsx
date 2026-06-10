import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { colors } from '../../src/theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { theme, isDark, toggle } = useThemeStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    representative: 'Sales Representative',
    school: 'School',
    individual: 'Individual Buyer',
  };

  const roleMenuItems = user?.role === 'admin' ? [
    { icon: 'people-outline' as const, label: 'Manage Representatives', action: () => router.push('/admin/representatives') },
    { icon: 'school-outline' as const, label: 'Manage Schools', action: () => router.push('/admin/schools') },
    { icon: 'bar-chart-outline' as const, label: 'View Reports', action: () => router.push('/admin/reports') },
  ] : user?.role === 'representative' ? [
    { icon: 'school-outline' as const, label: 'My Schools', action: () => router.push('/rep/my-schools') },
    { icon: 'add-circle-outline' as const, label: 'Create Order', action: () => router.push('/rep/create-order') },
  ] : [];

  const menuItems = [
    ...roleMenuItems,
    { icon: 'person-outline' as const, label: 'Edit Profile', action: () => Alert.alert('Edit Profile', 'Profile editing will be available soon.') },
    { icon: 'notifications-outline' as const, label: 'Notifications', action: () => Alert.alert('Notifications', 'Notification settings coming soon.') },
    { icon: 'globe-outline' as const, label: 'Language', action: () => Alert.alert('Language', 'Language selection coming soon.') },
    { icon: 'shield-outline' as const, label: 'Privacy & Security', action: () => Alert.alert('Privacy', 'Privacy settings coming soon.') },
    { icon: 'help-circle-outline' as const, label: 'Help & Support', action: () => Alert.alert('Help', 'Contact us at support@sambapublications.com') },
    { icon: 'information-circle-outline' as const, label: 'About', action: () => Alert.alert('About', 'Samba Publications v1.0.0\nQuality textbooks for Tamil Nadu schools.') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabels[user?.role || 'individual']}</Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={{ padding: 16, gap: 12 }}>
        {user?.phone && (
          <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="call-outline" size={18} color={colors.primary[500]} />
            <View>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Phone</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{user.phone}</Text>
            </View>
          </View>
        )}
        {user?.district && (
          <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="location-outline" size={18} color={colors.primary[500]} />
            <View>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>District</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{user.district}</Text>
            </View>
          </View>
        )}

        {/* Dark Mode Toggle */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={toggle}
        >
          <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? colors.info[500] : colors.secondary[500]} />
          <Text style={[styles.menuLabel, { color: theme.text }]}>Dark Mode</Text>
          <View style={[styles.toggleTrack, { backgroundColor: isDark ? colors.info[500] : '#d1d5db' }]}>
            <View style={[styles.toggleThumb, { transform: [{ translateX: isDark ? 18 : 0 }] }]} />
          </View>
        </TouchableOpacity>

        {/* Menu Items */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={item.action}
          >
            <Ionicons name={item.icon} size={20} color={colors.primary[500]} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger[500]} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.textSecondary }]}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger[100],
    backgroundColor: colors.danger[50],
    gap: 8,
    marginTop: 8,
  },
  logoutText: { color: colors.danger[500], fontWeight: '700', fontSize: 14 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 16, marginBottom: 30 },
});
