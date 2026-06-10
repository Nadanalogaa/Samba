import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../src/store/themeStore';
import { useCartStore } from '../src/store/cartStore';
import { colors } from '../src/theme/colors';

export default function CheckoutScreen() {
  const { theme } = useThemeStore();
  const { items, totalAmount, clearCart } = useCartStore();
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', pincode: '' });

  const handlePlaceOrder = () => {
    Alert.alert(
      'Order Placed!',
      'Your order has been placed successfully. You can track it in the Orders tab.',
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            router.replace('/(tabs)/orders');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={{ padding: 16 }}>
        {/* Order Summary */}
        <Text style={[styles.heading, { color: theme.text }]}>Order Summary</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {items.map((item) => (
            <View key={item.book.id} style={[styles.itemRow, { borderBottomColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>{item.book.title}</Text>
                <Text style={[styles.itemQty, { color: theme.textSecondary }]}>Qty: {item.quantity} x Rs. {item.book.price}</Text>
              </View>
              <Text style={[styles.itemTotal, { color: theme.text }]}>Rs. {(item.book.price * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
            <Text style={styles.totalValue}>Rs. {totalAmount().toLocaleString()}</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <Text style={[styles.heading, { color: theme.text, marginTop: 20 }]}>Shipping Address</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {[
            { key: 'name', label: 'Full Name', placeholder: 'Enter your name' },
            { key: 'phone', label: 'Phone', placeholder: 'Enter phone number', keyboardType: 'phone-pad' as const },
            { key: 'street', label: 'Address', placeholder: 'Street address' },
            { key: 'city', label: 'City', placeholder: 'City' },
            { key: 'pincode', label: 'Pincode', placeholder: 'Pincode', keyboardType: 'number-pad' as const },
          ].map((field) => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{field.label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]}
                placeholder={field.placeholder}
                placeholderTextColor={theme.textSecondary}
                value={address[field.key as keyof typeof address]}
                onChangeText={(v) => setAddress({ ...address, [field.key]: v })}
                keyboardType={field.keyboardType}
              />
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={[styles.paymentInfo, { backgroundColor: colors.secondary[50], borderColor: colors.secondary[100] }]}>
          <Ionicons name="card-outline" size={20} color={colors.secondary[600]} />
          <Text style={[styles.paymentText, { color: colors.secondary[700] }]}>
            Payment gateway will be integrated soon. Orders will be confirmed manually.
          </Text>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemTitle: { fontSize: 13, fontWeight: '600' },
  itemQty: { fontSize: 12, marginTop: 2 },
  itemTotal: { fontSize: 13, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary[500] },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  paymentText: { flex: 1, fontSize: 12, lineHeight: 18 },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent[500],
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  placeOrderText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
