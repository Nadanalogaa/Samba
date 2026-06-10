import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { schools, representatives } from '../../src/data/mockData';
import { colors } from '../../src/theme/colors';

export default function MySchoolsScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  // Find the rep matching current user's district, or show all schools in district
  const repDistrict = user?.district || 'Chennai';
  const currentRep = representatives.find((r) => r.district === repDistrict);
  const assignedSchoolIds = currentRep?.assignedSchools || [];
  const mySchools = schools.filter(
    (s) => assignedSchoolIds.includes(s.id) || s.district === repDistrict
  );

  const handleCall = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Cannot Make Call', `Unable to dial ${phone}`);
      }
    });
  };

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
          <Text style={[styles.infoValue, { color: theme.text }]}>{item.contactPerson}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={15} color={colors.primary[500]} />
          <Text style={[styles.infoValue, { color: theme.text }]}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="navigate-outline" size={15} color={colors.primary[500]} />
          <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.callBtn}
        onPress={() => handleCall(item.phone)}
      >
        <Ionicons name="call" size={16} color="#fff" />
        <Text style={styles.callBtnText}>{item.phone}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>My Schools</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.infoBanner, { backgroundColor: colors.primary[50] }]}>
        <Ionicons name="location" size={16} color={colors.primary[500]} />
        <Text style={[styles.infoBannerText, { color: colors.primary[500] }]}>
          District: {repDistrict} | {mySchools.length} school{mySchools.length !== 1 ? 's' : ''} assigned
        </Text>
      </View>

      <FlatList
        data={mySchools}
        keyExtractor={(item) => item.id}
        renderItem={renderSchool}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No schools assigned yet
            </Text>
          </View>
        }
      />
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  infoBannerText: { fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
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
  infoSection: { gap: 8, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoValue: { fontSize: 13, flex: 1, fontWeight: '500' },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent[500],
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
});
