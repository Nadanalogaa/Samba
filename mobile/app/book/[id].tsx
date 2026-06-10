import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useCartStore } from '../../src/store/cartStore';
import { books } from '../../src/data/mockData';
import { colors } from '../../src/theme/colors';
import { useState } from 'react';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useThemeStore();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const book = books.find((b) => b.id === id);
  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.text }}>Book not found</Text>
      </View>
    );
  }

  const discount = Math.round(((book.mrp - book.price) / book.mrp) * 100);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Cover */}
      <View style={styles.coverSection}>
        <Image source={{ uri: book.coverImage }} style={styles.cover} />
      </View>

      {/* Details */}
      <View style={[styles.details, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>{book.title}</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.primary[50] }]}>
            <Text style={[styles.badgeText, { color: colors.primary[500] }]}>{book.class}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.info[50] }]}>
            <Text style={[styles.badgeText, { color: colors.info[500] }]}>{book.subject}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.secondary[50] }]}>
            <Text style={[styles.badgeText, { color: colors.secondary[600] }]}>{book.term}</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>Rs. {book.price}</Text>
          <Text style={styles.mrp}>Rs. {book.mrp}</Text>
          <View style={[styles.discountBadge, { backgroundColor: colors.accent[50] }]}>
            <Text style={{ color: colors.accent[600], fontWeight: '700', fontSize: 12 }}>{discount}% off</Text>
          </View>
        </View>

        {/* Stock */}
        <View style={[styles.stockRow, { backgroundColor: book.stock > 0 ? colors.accent[50] : colors.danger[50] }]}>
          <Ionicons
            name={book.stock > 0 ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={book.stock > 0 ? colors.accent[600] : colors.danger[500]}
          />
          <Text style={{ color: book.stock > 0 ? colors.accent[600] : colors.danger[500], fontWeight: '600', fontSize: 13 }}>
            {book.stock > 0 ? `In Stock (${book.stock} available)` : 'Out of Stock'}
          </Text>
        </View>

        {/* Description */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Description</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{book.description}</Text>

        {/* Quantity */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Quantity</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: theme.border }]}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.qtyText, { color: theme.text }]}>{quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: theme.border }]}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.subtotal, { color: colors.primary[500] }]}>
            Rs. {(book.price * quantity).toLocaleString()}
          </Text>
        </View>

        {/* Add to Cart */}
        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={() => {
            addItem(book, quantity);
            router.back();
          }}
        >
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.addCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.primary[500],
  },
  cover: { width: 180, height: 250, borderRadius: 12, backgroundColor: '#e5e7eb' },
  details: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    paddingBottom: 40,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  priceSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  price: { fontSize: 24, fontWeight: '800', color: colors.primary[500] },
  mrp: { fontSize: 16, color: '#9ca3af', textDecorationLine: 'line-through' },
  discountBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  description: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  subtotal: { marginLeft: 'auto', fontSize: 18, fontWeight: '800' },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  addCartText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
