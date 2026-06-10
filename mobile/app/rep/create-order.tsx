import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { schools, books, representatives } from '../../src/data/mockData';
import { colors } from '../../src/theme/colors';
import type { Book } from '../../src/store/cartStore';

interface OrderItem {
  book: Book;
  quantity: number;
}

export default function CreateOrderScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const [step, setStep] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState<typeof schools[0] | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [bookSearch, setBookSearch] = useState('');

  // Get schools for this rep's district
  const repDistrict = user?.district || 'Chennai';
  const currentRep = representatives.find((r) => r.district === repDistrict);
  const assignedSchoolIds = currentRep?.assignedSchools || [];
  const mySchools = schools.filter(
    (s) => assignedSchoolIds.includes(s.id) || s.district === repDistrict
  );

  const filteredBooks = useMemo(() => {
    if (!bookSearch) return books.slice(0, 20);
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.subject.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.class.toLowerCase().includes(bookSearch.toLowerCase())
    );
  }, [bookSearch]);

  const totalAmount = orderItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  const addBook = (book: Book) => {
    const exists = orderItems.find((i) => i.book.id === book.id);
    if (exists) {
      setOrderItems(
        orderItems.map((i) =>
          i.book.id === book.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setOrderItems([...orderItems, { book, quantity: 1 }]);
    }
  };

  const updateQuantity = (bookId: string, qty: number) => {
    if (qty <= 0) {
      setOrderItems(orderItems.filter((i) => i.book.id !== bookId));
    } else {
      setOrderItems(
        orderItems.map((i) => (i.book.id === bookId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const removeItem = (bookId: string) => {
    setOrderItems(orderItems.filter((i) => i.book.id !== bookId));
  };

  const placeOrder = () => {
    Alert.alert(
      'Order Placed!',
      `Order for ${selectedSchool?.name} with ${orderItems.length} book(s) totaling Rs. ${totalAmount.toLocaleString()} has been placed successfully.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: step >= s ? colors.primary[500] : theme.border,
              },
            ]}
          >
            {step > s ? (
              <Ionicons name="checkmark" size={14} color="#fff" />
            ) : (
              <Text style={[styles.stepNum, { color: step >= s ? '#fff' : theme.textSecondary }]}>
                {s}
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              { color: step >= s ? colors.primary[500] : theme.textSecondary },
            ]}
          >
            {s === 1 ? 'School' : s === 2 ? 'Books' : 'Review'}
          </Text>
        </View>
      ))}
      <View style={[styles.stepLine, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.stepLineFill,
            { backgroundColor: colors.primary[500], width: `${((step - 1) / 2) * 100}%` },
          ]}
        />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Select a School</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        Choose which school this order is for
      </Text>
      {mySchools.map((school) => (
        <TouchableOpacity
          key={school.id}
          style={[
            styles.schoolOption,
            {
              backgroundColor: theme.surface,
              borderColor: selectedSchool?.id === school.id ? colors.primary[500] : theme.border,
              borderWidth: selectedSchool?.id === school.id ? 2 : 1,
            },
          ]}
          onPress={() => setSelectedSchool(school)}
        >
          <View style={[styles.radioOuter, { borderColor: selectedSchool?.id === school.id ? colors.primary[500] : theme.border }]}>
            {selectedSchool?.id === school.id && (
              <View style={[styles.radioInner, { backgroundColor: colors.primary[500] }]} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.schoolOptionName, { color: theme.text }]}>{school.name}</Text>
            <Text style={[styles.schoolOptionSub, { color: theme.textSecondary }]}>
              {school.contactPerson} | {school.district}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.nextBtn,
          { backgroundColor: selectedSchool ? colors.primary[500] : theme.border },
        ]}
        onPress={() => selectedSchool && setStep(2)}
        disabled={!selectedSchool}
      >
        <Text style={styles.nextBtnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ flex: 1 }}>
      <Text style={[styles.stepTitle, { color: theme.text, paddingHorizontal: 16 }]}>Add Books</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary, paddingHorizontal: 16 }]}>
        Search and add books with quantities
      </Text>

      {orderItems.length > 0 && (
        <View style={[styles.cartSummary, { backgroundColor: colors.primary[50] }]}>
          <Ionicons name="cart" size={16} color={colors.primary[500]} />
          <Text style={[styles.cartSummaryText, { color: colors.primary[500] }]}>
            {orderItems.length} book(s) | Rs. {totalAmount.toLocaleString()}
          </Text>
        </View>
      )}

      <View
        style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by title, subject, class..."
          placeholderTextColor={theme.textSecondary}
          value={bookSearch}
          onChangeText={setBookSearch}
        />
        {bookSearch.length > 0 && (
          <TouchableOpacity onPress={() => setBookSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        renderItem={({ item }) => {
          const inCart = orderItems.find((i) => i.book.id === item.id);
          return (
            <View
              style={[
                styles.bookRow,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Image source={{ uri: item.coverImage }} style={styles.bookThumb} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.bookPrice, { color: colors.primary[500] }]}>
                  Rs. {item.price}
                </Text>
              </View>
              {inCart ? (
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.danger[50] }]}
                    onPress={() => updateQuantity(item.id, inCart.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color={colors.danger[500]} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: theme.text }]}>{inCart.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.accent[50] }]}
                    onPress={() => updateQuantity(item.id, inCart.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.accent[600]} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.addBookBtn, { backgroundColor: colors.primary[500] }]}
                  onPress={() => addBook(item)}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity style={[styles.backStepBtn, { borderColor: theme.border }]} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={18} color={theme.text} />
          <Text style={[styles.backStepText, { color: theme.text }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { flex: 1, backgroundColor: orderItems.length > 0 ? colors.primary[500] : theme.border },
          ]}
          onPress={() => orderItems.length > 0 && setStep(3)}
          disabled={orderItems.length === 0}
        >
          <Text style={styles.nextBtnText}>Review Order</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <ScrollView contentContainerStyle={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Review Order</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        Confirm the details before placing
      </Text>

      {/* School info */}
      <View style={[styles.reviewSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.reviewSectionHeader}>
          <Ionicons name="school" size={18} color={colors.primary[500]} />
          <Text style={[styles.reviewSectionTitle, { color: theme.text }]}>School</Text>
        </View>
        <Text style={[styles.reviewSchoolName, { color: theme.text }]}>{selectedSchool?.name}</Text>
        <Text style={[styles.reviewSchoolSub, { color: theme.textSecondary }]}>
          {selectedSchool?.contactPerson} | {selectedSchool?.district}
        </Text>
      </View>

      {/* Items */}
      <View style={[styles.reviewSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.reviewSectionHeader}>
          <Ionicons name="book" size={18} color={colors.primary[500]} />
          <Text style={[styles.reviewSectionTitle, { color: theme.text }]}>
            Items ({orderItems.length})
          </Text>
        </View>
        {orderItems.map((item) => (
          <View
            key={item.book.id}
            style={[styles.reviewItem, { borderBottomColor: theme.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.reviewItemTitle, { color: theme.text }]} numberOfLines={1}>
                {item.book.title}
              </Text>
              <Text style={[styles.reviewItemSub, { color: theme.textSecondary }]}>
                Rs. {item.book.price} x {item.quantity}
              </Text>
            </View>
            <Text style={[styles.reviewItemTotal, { color: colors.primary[500] }]}>
              Rs. {(item.book.price * item.quantity).toLocaleString()}
            </Text>
            <TouchableOpacity onPress={() => removeItem(item.book.id)}>
              <Ionicons name="trash-outline" size={18} color={colors.danger[500]} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={[styles.totalSection, { backgroundColor: colors.primary[50] }]}>
        <Text style={[styles.totalLabel, { color: colors.primary[500] }]}>Total Amount</Text>
        <Text style={[styles.totalValue, { color: colors.primary[500] }]}>
          Rs. {totalAmount.toLocaleString()}
        </Text>
      </View>

      <View style={styles.reviewActions}>
        <TouchableOpacity
          style={[styles.backStepBtn, { borderColor: theme.border, flex: 1 }]}
          onPress={() => setStep(2)}
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
          <Text style={[styles.backStepText, { color: theme.text }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.placeOrderBtn]} onPress={placeOrder}>
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Create Order</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderStepIndicator()}

      {step === 1 && <ScrollView>{renderStep1()}</ScrollView>}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
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
    paddingBottom: 8,
  },
  headerBackBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    position: 'relative',
  },
  stepLine: {
    position: 'absolute',
    left: 60,
    right: 60,
    top: 30,
    height: 3,
    borderRadius: 2,
    zIndex: -1,
  },
  stepLineFill: { height: '100%', borderRadius: 2 },
  stepItem: { alignItems: 'center', gap: 4, zIndex: 1 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 11, fontWeight: '600' },
  stepContent: { paddingHorizontal: 16, paddingBottom: 30 },
  stepTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  stepSubtitle: { fontSize: 13, marginBottom: 16 },
  schoolOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  schoolOptionName: { fontSize: 14, fontWeight: '700' },
  schoolOptionSub: { fontSize: 12, marginTop: 2 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  cartSummaryText: { fontSize: 13, fontWeight: '600' },
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
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  bookThumb: { width: 44, height: 56, borderRadius: 6, backgroundColor: '#e5e7eb' },
  bookTitle: { fontSize: 12, fontWeight: '600' },
  bookPrice: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 14, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  addBookBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  backStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  backStepText: { fontWeight: '600', fontSize: 14 },
  reviewSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  reviewSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  reviewSectionTitle: { fontSize: 15, fontWeight: '700' },
  reviewSchoolName: { fontSize: 15, fontWeight: '600' },
  reviewSchoolSub: { fontSize: 12, marginTop: 2 },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  reviewItemTitle: { fontSize: 13, fontWeight: '600' },
  reviewItemSub: { fontSize: 11, marginTop: 2 },
  reviewItemTotal: { fontSize: 14, fontWeight: '700' },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  totalLabel: { fontSize: 15, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '800' },
  reviewActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  placeOrderBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent[500],
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  placeOrderText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
