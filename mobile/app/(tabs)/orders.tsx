import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { orders } from '../../src/data/mockData';
import { colors } from '../../src/theme/colors';

const tabs = ['All', 'Placed', 'Confirmed', 'Shipped', 'Delivered'];

const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
  placed: { bg: colors.info[50], text: colors.info[500], icon: 'time-outline' },
  confirmed: { bg: colors.secondary[50], text: colors.secondary[600], icon: 'checkmark-circle-outline' },
  shipped: { bg: colors.primary[50], text: colors.primary[500], icon: 'airplane-outline' },
  delivered: { bg: colors.accent[50], text: colors.accent[600], icon: 'checkmark-done-outline' },
};

export default function OrdersScreen() {
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? orders : orders.filter((o) => o.status === activeTab.toLowerCase());

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Tabs */}
      <FlatList
        horizontal
        data={tabs}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === item ? colors.primary[500] : theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setActiveTab(item)}
          >
            <Text style={{ color: activeTab === item ? '#fff' : theme.textSecondary, fontWeight: '600', fontSize: 13 }}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Orders List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => {
          const config = statusConfig[item.status];
          return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.orderId, { color: colors.primary[500] }]}>{item.id}</Text>
                  <Text style={[styles.orderDate, { color: theme.textSecondary }]}>{item.createdAt}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon as any} size={12} color={config.text} />
                  <Text style={[styles.statusText, { color: config.text }]}>{item.status}</Text>
                </View>
              </View>

              {item.schoolName && (
                <Text style={[styles.schoolName, { color: theme.textSecondary }]}>
                  <Ionicons name="school-outline" size={12} /> {item.schoolName}
                </Text>
              )}

              <View style={styles.itemsRow}>
                <Text style={[styles.itemCount, { color: theme.textSecondary }]}>
                  {item.items.length} item{item.items.length > 1 ? 's' : ''} ({item.items.reduce((s, i) => s + i.quantity, 0)} books)
                </Text>
                <Text style={[styles.amount, { color: theme.text }]}>Rs. {item.totalAmount.toLocaleString()}</Text>
              </View>

              {/* Items preview */}
              {item.items.map((orderItem) => (
                <View key={orderItem.bookId} style={[styles.itemRow, { borderTopColor: theme.border }]}>
                  <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>{orderItem.title}</Text>
                  <Text style={[styles.itemQty, { color: theme.textSecondary }]}>x{orderItem.quantity}</Text>
                  <Text style={[styles.itemPrice, { color: theme.text }]}>Rs. {(orderItem.price * orderItem.quantity).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderId: { fontWeight: '700', fontSize: 15 },
  orderDate: { fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  schoolName: { fontSize: 12, marginBottom: 8 },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: { fontSize: 12 },
  amount: { fontSize: 16, fontWeight: '800' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    gap: 8,
  },
  itemTitle: { flex: 1, fontSize: 12, fontWeight: '500' },
  itemQty: { fontSize: 12 },
  itemPrice: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, marginTop: 10 },
});
