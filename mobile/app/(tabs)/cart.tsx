import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useCartStore, type CartItem } from '../../src/store/cartStore';
import { colors } from '../../src/theme/colors';

export default function CartScreen() {
  const { theme } = useThemeStore();
  const { items, removeItem, updateQuantity, clearCart, totalAmount, totalItems } = useCartStore();

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Image source={{ uri: item.book.coverImage }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{item.book.title}</Text>
        <Text style={styles.price}>Rs. {item.book.price}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: theme.border }]}
            onPress={() => updateQuantity(item.book.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.qtyText, { color: theme.text }]}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: theme.border }]}
            onPress={() => updateQuantity(item.book.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.subtotal, { color: theme.text }]}>
            Rs. {(item.book.price * item.quantity).toLocaleString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.book.id)}>
        <Ionicons name="trash-outline" size={18} color={colors.danger[500]} />
      </TouchableOpacity>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.bg }]}>
        <Ionicons name="cart-outline" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Browse our catalog to add books</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/catalog')}>
          <Text style={styles.browseBtnText}>Browse Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.book.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.headerText, { color: theme.text }]}>{totalItems()} items in cart</Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={{ color: colors.danger[500], fontWeight: '600', fontSize: 13 }}>Clear All</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Bottom Summary */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Amount</Text>
          <Text style={[styles.totalValue, { color: theme.text }]}>Rs. {totalAmount().toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
          <Text style={styles.checkoutBtnText}>Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 4, marginBottom: 20 },
  browseBtn: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: { fontSize: 16, fontWeight: '700' },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  cover: { width: 60, height: 80, borderRadius: 8, backgroundColor: '#e5e7eb' },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  price: { fontSize: 13, fontWeight: '700', color: colors.primary[500], marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 14, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  subtotal: { marginLeft: 'auto', fontSize: 13, fontWeight: '700' },
  removeBtn: { padding: 4 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 12 },
  totalValue: { fontSize: 20, fontWeight: '800' },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent[500],
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
