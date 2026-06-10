import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { schools, getDistricts } from '../../src/data/mockData';
import { colors } from '../../src/theme/colors';

export default function SchoolsScreen() {
  const { theme } = useThemeStore();
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const districts = getDistricts();

  const filtered = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = !selectedDistrict || s.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  const renderSchool = ({ item }: { item: typeof schools[0] }) => (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: colors.info[50] }]}>
          <Ionicons name="school" size={22} color={colors.info[500]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.schoolName, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.districtRow}>
            <Ionicons name="location-outline" size={13} color={theme.textSecondary} />
            <Text style={[styles.districtText, { color: theme.textSecondary }]}>{item.district}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={15} color={colors.primary[500]} />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Contact:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{item.contactPerson}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={15} color={colors.primary[500]} />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Phone:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{item.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={15} color={colors.primary[500]} />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Email:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="navigate-outline" size={15} color={colors.primary[500]} />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Address:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={2}>
            {item.address}
          </Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Schools</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search schools..."
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[
            styles.filterPill,
            {
              backgroundColor: !selectedDistrict ? colors.primary[500] : theme.surface,
              borderColor: !selectedDistrict ? colors.primary[500] : theme.border,
            },
          ]}
          onPress={() => setSelectedDistrict(null)}
        >
          <Text
            style={[
              styles.filterPillText,
              { color: !selectedDistrict ? '#fff' : theme.textSecondary },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {districts.map((d) => (
          <TouchableOpacity
            key={d}
            style={[
              styles.filterPill,
              {
                backgroundColor: selectedDistrict === d ? colors.primary[500] : theme.surface,
                borderColor: selectedDistrict === d ? colors.primary[500] : theme.border,
              },
            ]}
            onPress={() => setSelectedDistrict(selectedDistrict === d ? null : d)}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: selectedDistrict === d ? '#fff' : theme.textSecondary },
              ]}
            >
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderSchool}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No schools found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('Coming Soon', 'Add school feature will be available soon.')}
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
  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 12, height: 38 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolName: { fontSize: 15, fontWeight: '700' },
  districtRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  districtText: { fontSize: 12 },
  divider: { height: 1, marginVertical: 12 },
  infoSection: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoLabel: { fontSize: 12, width: 55 },
  infoValue: { fontSize: 13, flex: 1, fontWeight: '500' },
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
