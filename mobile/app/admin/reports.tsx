import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { orders, books, schools, representatives, getDistricts } from '../../src/data/mockData';
import { colors } from '../../src/theme/colors';

export default function ReportsScreen() {
  const { theme } = useThemeStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const totalBooks = books.length;
  const avgValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const statusCounts = {
    placed: orders.filter((o) => o.status === 'placed').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  const districts = getDistricts();
  const revenueByDistrict = districts.map((d) => {
    const districtReps = representatives.filter((r) => r.district === d);
    const revenue = districtReps.reduce((sum, r) => sum + r.revenue, 0);
    const schoolCount = schools.filter((s) => s.district === d).length;
    return { district: d, revenue, schoolCount };
  });

  const topBooks = [...books]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const statCards = [
    {
      label: 'Total Revenue',
      value: `Rs. ${(totalRevenue / 1000).toFixed(0)}K`,
      icon: 'cash-outline' as const,
      bg: colors.accent[50],
      color: colors.accent[600],
    },
    {
      label: 'Total Orders',
      value: String(totalOrders),
      icon: 'receipt-outline' as const,
      bg: colors.info[50],
      color: colors.info[500],
    },
    {
      label: 'Total Books',
      value: String(totalBooks),
      icon: 'book-outline' as const,
      bg: colors.primary[50],
      color: colors.primary[500],
    },
    {
      label: 'Avg Order Value',
      value: `Rs. ${avgValue.toLocaleString()}`,
      icon: 'trending-up-outline' as const,
      bg: colors.secondary[50],
      color: colors.secondary[600],
    },
  ];

  const statusColors: Record<string, { bg: string; color: string }> = {
    placed: { bg: colors.info[50], color: colors.info[500] },
    confirmed: { bg: colors.secondary[50], color: colors.secondary[600] },
    shipped: { bg: colors.primary[50], color: colors.primary[500] },
    delivered: { bg: colors.accent[50], color: colors.accent[600] },
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <View
              key={card.label}
              style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={[styles.statIcon, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={20} color={card.color} />
              </View>
              <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue by District */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Revenue by District</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.districtRow}
        >
          {revenueByDistrict.map((d) => (
            <View
              key={d.district}
              style={[styles.districtCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={[styles.districtIcon, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="location" size={20} color={colors.primary[500]} />
              </View>
              <Text style={[styles.districtName, { color: theme.text }]}>{d.district}</Text>
              <Text style={[styles.districtRevenue, { color: colors.accent[600] }]}>
                Rs. {(d.revenue / 1000).toFixed(0)}K
              </Text>
              <Text style={[styles.districtSchools, { color: theme.textSecondary }]}>
                {d.schoolCount} schools
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Order Status Breakdown */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Status Breakdown</Text>
        <View style={[styles.statusSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <View key={status} style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View style={[styles.statusDot, { backgroundColor: statusColors[status].color }]} />
                <Text style={[styles.statusLabel, { color: theme.text }]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
              <View style={[styles.statusCountBadge, { backgroundColor: statusColors[status].bg }]}>
                <Text style={[styles.statusCountText, { color: statusColors[status].color }]}>
                  {count}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Top Books */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Books (by Stock)</Text>
        <View style={[styles.topBooksSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {topBooks.map((book, index) => (
            <View
              key={book.id}
              style={[
                styles.topBookRow,
                index < topBooks.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <View style={[styles.rankBadge, { backgroundColor: colors.secondary[50] }]}>
                <Text style={[styles.rankText, { color: colors.secondary[600] }]}>#{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.topBookTitle, { color: theme.text }]} numberOfLines={1}>
                  {book.title}
                </Text>
                <Text style={[styles.topBookSub, { color: theme.textSecondary }]}>
                  Rs. {book.price} | Stock: {book.stock}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
  content: { paddingHorizontal: 16 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '46%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  districtRow: { gap: 10, paddingBottom: 4, marginBottom: 24 },
  districtCard: {
    width: 150,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  districtIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  districtName: { fontSize: 14, fontWeight: '700' },
  districtRevenue: { fontSize: 16, fontWeight: '800' },
  districtSchools: { fontSize: 12 },
  statusSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 14, fontWeight: '600' },
  statusCountBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusCountText: { fontSize: 14, fontWeight: '700' },
  topBooksSection: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topBookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '800' },
  topBookTitle: { fontSize: 13, fontWeight: '600' },
  topBookSub: { fontSize: 11, marginTop: 2 },
});
