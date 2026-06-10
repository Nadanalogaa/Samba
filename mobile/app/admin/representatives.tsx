import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { representatives } from '../../src/data/mockData';
import { colors } from '../../src/theme/colors';

export default function RepresentativesScreen() {
  const { theme } = useThemeStore();
  const [search, setSearch] = useState('');

  const filtered = representatives.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.district.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderRep = ({ item }: { item: typeof representatives[0] }) => (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.districtRow}>
            <Ionicons name="location-outline" size={13} color={theme.textSecondary} />
            <Text style={[styles.district, { color: theme.textSecondary }]}>{item.district}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === 'active' ? colors.accent[50] : colors.danger[50],
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.status === 'active' ? colors.accent[600] : colors.danger[500] },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.contactRow}>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={14} color={colors.primary[500]} />
          <Text style={[styles.contactText, { color: theme.textSecondary }]}>{item.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={14} color={colors.primary[500]} />
          <Text style={[styles.contactText, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.primary[50] }]}>
          <Ionicons name="school-outline" size={16} color={colors.primary[500]} />
          <Text style={[styles.statValue, { color: colors.primary[500] }]}>
            {item.assignedSchools.length}
          </Text>
          <Text style={styles.statLabel}>Schools</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.info[50] }]}>
          <Ionicons name="receipt-outline" size={16} color={colors.info[500]} />
          <Text style={[styles.statValue, { color: colors.info[500] }]}>{item.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.accent[50] }]}>
          <Ionicons name="cash-outline" size={16} color={colors.accent[600]} />
          <Text style={[styles.statValue, { color: colors.accent[600] }]}>
            {(item.revenue / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Representatives</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name, district, email..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderRep}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No representatives found
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('Coming Soon', 'Add representative feature will be available soon.')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700' },
  districtRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  district: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  divider: { height: 1, marginVertical: 12 },
  contactRow: { gap: 6, marginBottom: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 10, color: '#6b7280' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
