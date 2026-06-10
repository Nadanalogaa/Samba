import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, type UserRole } from '../src/store/authStore';
import { colors } from '../src/theme/colors';
import { useThemeStore } from '../src/store/themeStore';

const roles: { key: UserRole; label: string; icon: string }[] = [
  { key: 'admin', label: 'Admin', icon: 'A' },
  { key: 'representative', label: 'Representative', icon: 'R' },
  { key: 'school', label: 'School', icon: 'S' },
  { key: 'individual', label: 'Individual', icon: 'I' },
];

export default function LoginScreen() {
  const { login } = useAuthStore();
  const { theme, isDark, toggle } = useThemeStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('individual');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    login(email, password, selectedRole);
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        {/* Top bar: Back to website + Theme toggle */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/landing')}>
            <Ionicons name="arrow-back" size={18} color={theme.text} />
            <Text style={[styles.backText, { color: theme.text }]}>Back to Website</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.themeToggle} onPress={toggle}>
            <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>S</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Samba Publications</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to your account</Text>
        </View>

        {/* Role Selector */}
        <Text style={[styles.label, { color: theme.text }]}>Select Role</Text>
        <View style={styles.roleGrid}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[
                styles.roleCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedRole === role.key && styles.roleCardActive,
              ]}
              onPress={() => setSelectedRole(role.key)}
            >
              <View style={[styles.roleIcon, selectedRole === role.key && styles.roleIconActive]}>
                <Text style={[styles.roleIconText, selectedRole === role.key && { color: '#fff' }]}>
                  {role.icon}
                </Text>
              </View>
              <Text style={[styles.roleLabel, { color: selectedRole === role.key ? colors.primary[500] : theme.textSecondary }]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder="Enter your email"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder="Enter your password"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Don't have an account? <Text style={{ color: colors.primary[500], fontWeight: '600' }}>Sign Up</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: { fontSize: 13, fontWeight: '600' },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoLetter: { fontSize: 28, fontWeight: '800', color: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  roleCardActive: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  roleIconActive: { backgroundColor: colors.primary[500] },
  roleIconText: { fontSize: 16, fontWeight: '700', color: '#6b7280' },
  roleLabel: { fontSize: 12, fontWeight: '600' },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  loginButton: {
    height: 50,
    backgroundColor: colors.primary[500],
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerText: { textAlign: 'center', fontSize: 13, marginTop: 20 },
});
