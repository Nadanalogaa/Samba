import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useCartStore } from '../../src/store/cartStore';
import { books, orders, getClasses } from '../../src/data/mockData';
import { colors } from '../../src/theme/colors';
import type { Book } from '../../src/store/cartStore';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { addItem } = useCartStore();
  const [featured, setFeatured] = useState<Book[]>([]);
  const classes = getClasses();

  useEffect(() => {
    const shuffled = [...books].sort(() => 0.5 - Math.random());
    setFeatured(shuffled.slice(0, 6));
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerGreeting}>Welcome back,</Text>
          <Text style={styles.bannerName}>{user?.name || 'Guest'}!</Text>
          <Text style={styles.bannerSubtext}>Discover quality textbooks for every class</Text>
          <TouchableOpacity style={styles.bannerBtn} onPress={() => router.push('/(tabs)/catalog')}>
            <Ionicons name="book-outline" size={16} color={colors.primary[500]} />
            <Text style={styles.bannerBtnText}>Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Role-specific Quick Actions */}
      {user?.role === 'admin' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Admin Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.primary[50] }]}
              onPress={() => router.push('/admin/representatives')}
            >
              <Ionicons name="people" size={24} color={colors.primary[500]} />
              <Text style={[styles.quickActionText, { color: colors.primary[500] }]}>Manage Reps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.info[50] }]}
              onPress={() => router.push('/admin/schools')}
            >
              <Ionicons name="school" size={24} color={colors.info[500]} />
              <Text style={[styles.quickActionText, { color: colors.info[500] }]}>Manage Schools</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.accent[50] }]}
              onPress={() => router.push('/admin/reports')}
            >
              <Ionicons name="bar-chart" size={24} color={colors.accent[600]} />
              <Text style={[styles.quickActionText, { color: colors.accent[600] }]}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {user?.role === 'representative' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Rep Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.info[50], flex: 1 }]}
              onPress={() => router.push('/rep/my-schools')}
            >
              <Ionicons name="school" size={24} color={colors.info[500]} />
              <Text style={[styles.quickActionText, { color: colors.info[500] }]}>My Schools</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.secondary[50], flex: 1 }]}
              onPress={() => router.push('/rep/create-order')}
            >
              <Ionicons name="create" size={24} color={colors.secondary[600]} />
              <Text style={[styles.quickActionText, { color: colors.secondary[600] }]}>Create Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Browse by Class */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Browse by Class</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classRow}>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls}
              style={[styles.classChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push({ pathname: '/(tabs)/catalog', params: { class: cls } })}
            >
              <Text style={[styles.classChipText, { color: theme.text }]}>{cls}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Books */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Books</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/catalog')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {featured.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={[styles.bookCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push({ pathname: '/book/[id]', params: { id: book.id } })}
            >
              <Image source={{ uri: book.coverImage }} style={styles.bookCover} />
              <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>{book.title}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.bookPrice}>Rs. {book.price}</Text>
                <Text style={styles.bookMrp}>Rs. {book.mrp}</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addItem(book)}
              >
                <Ionicons name="cart-outline" size={14} color="#fff" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Orders */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Orders</Text>
        {orders.slice(0, 3).map((order) => (
          <View key={order.id} style={[styles.orderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.orderRow}>
              <View>
                <Text style={[styles.orderId, { color: colors.primary[500] }]}>{order.id}</Text>
                <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                  {order.items.length} items - {order.createdAt}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.orderAmount, { color: theme.text }]}>Rs. {order.totalAmount.toLocaleString()}</Text>
                <View style={[styles.statusBadge, {
                  backgroundColor: order.status === 'delivered' ? colors.accent[50] :
                    order.status === 'shipped' ? colors.primary[50] :
                    order.status === 'confirmed' ? colors.secondary[50] : colors.info[50]
                }]}>
                  <Text style={[styles.statusText, {
                    color: order.status === 'delivered' ? colors.accent[600] :
                      order.status === 'shipped' ? colors.primary[500] :
                      order.status === 'confirmed' ? colors.secondary[600] : colors.info[500]
                  }]}>{order.status}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    backgroundColor: colors.primary[500],
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerOverlay: { padding: 24 },
  bannerGreeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  bannerName: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  bannerSubtext: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  bannerBtnText: { color: colors.primary[500], fontWeight: '700', fontSize: 13 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  viewAll: { color: colors.primary[500], fontWeight: '600', fontSize: 13 },
  classRow: { gap: 8, paddingBottom: 4 },
  classChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  classChipText: { fontWeight: '600', fontSize: 13 },
  bookCard: {
    width: 150,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bookCover: { width: '100%', height: 120, backgroundColor: '#e5e7eb' },
  bookTitle: { fontSize: 12, fontWeight: '600', padding: 10, paddingBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 6, marginBottom: 8 },
  bookPrice: { fontSize: 14, fontWeight: '700', color: colors.primary[500] },
  bookMrp: { fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    margin: 10,
    marginTop: 0,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  orderCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontWeight: '700', fontSize: 14 },
  orderDate: { fontSize: 12, marginTop: 2 },
  orderAmount: { fontWeight: '700', fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  quickActions: { flexDirection: 'row', gap: 10 },
  quickActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 8,
    minWidth: 105,
  },
  quickActionText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
