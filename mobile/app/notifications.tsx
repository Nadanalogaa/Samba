import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../src/store/themeStore';
import { useAuthStore, type UserRole } from '../src/store/authStore';
import { colors } from '../src/theme/colors';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  read: boolean;
}

const notificationsByRole: Record<UserRole, Notification[]> = {
  admin: [
    { id: '1', title: 'New Order Received', message: "St. Mary's HSS placed an order for 450 books worth ₹67,500", time: '2 min ago', icon: 'cart', iconColor: colors.accent[500], iconBg: colors.accent[50], read: false },
    { id: '2', title: 'Low Stock Alert', message: 'Mathematics - 8th (Term 2) has only 12 copies left', time: '15 min ago', icon: 'warning', iconColor: colors.secondary[500], iconBg: colors.secondary[50], read: false },
    { id: '3', title: 'New Representative Joined', message: 'Anitha Devi from Coimbatore district has been onboarded', time: '1 hour ago', icon: 'person-add', iconColor: colors.info[500], iconBg: colors.info[50], read: false },
    { id: '4', title: 'Order Delivered', message: 'ORD001 to Government Boys School has been delivered', time: '3 hours ago', icon: 'checkmark-circle', iconColor: colors.accent[500], iconBg: colors.accent[50], read: true },
    { id: '5', title: 'Monthly Report Ready', message: 'February 2026 sales report is now available for download', time: '5 hours ago', icon: 'document-text', iconColor: colors.primary[500], iconBg: colors.primary[50], read: true },
    { id: '6', title: 'Payment Received', message: '₹1,25,000 payment received from DAV Public School', time: '1 day ago', icon: 'cash', iconColor: colors.accent[500], iconBg: colors.accent[50], read: true },
    { id: '7', title: 'New School Registered', message: 'Velammal Matriculation School, Trichy has registered', time: '2 days ago', icon: 'school', iconColor: colors.info[500], iconBg: colors.info[50], read: true },
  ],
  representative: [
    { id: '1', title: 'New School Assigned', message: 'Chettinad Vidyashram, Chennai has been assigned to you', time: '5 min ago', icon: 'school', iconColor: colors.info[500], iconBg: colors.info[50], read: false },
    { id: '2', title: 'Order Confirmed', message: 'ORD002 for Government Boys School has been confirmed by admin', time: '30 min ago', icon: 'checkmark-circle', iconColor: colors.accent[500], iconBg: colors.accent[50], read: false },
    { id: '3', title: 'Target Update', message: 'Your March target has been updated to ₹3,00,000', time: '2 hours ago', icon: 'trending-up', iconColor: colors.secondary[500], iconBg: colors.secondary[50], read: false },
    { id: '4', title: 'Order Shipped', message: "ORD001 for St. Mary's HSS is out for delivery", time: '5 hours ago', icon: 'airplane', iconColor: colors.primary[500], iconBg: colors.primary[50], read: true },
    { id: '5', title: 'Commission Credited', message: '₹8,550 commission credited for January orders', time: '1 day ago', icon: 'cash', iconColor: colors.accent[500], iconBg: colors.accent[50], read: true },
    { id: '6', title: 'New Catalog Available', message: '15 new books added for 2026 academic year', time: '3 days ago', icon: 'book', iconColor: colors.info[500], iconBg: colors.info[50], read: true },
  ],
  school: [
    { id: '1', title: 'Order Shipped', message: 'Your order ORD003 with 240 books has been shipped', time: '10 min ago', icon: 'airplane', iconColor: colors.primary[500], iconBg: colors.primary[50], read: false },
    { id: '2', title: 'New Books Available', message: '2026 edition textbooks for 9th & 10th are now available', time: '1 hour ago', icon: 'book', iconColor: colors.info[500], iconBg: colors.info[50], read: false },
    { id: '3', title: 'Bulk Discount Offer', message: 'Get 25% off on orders above 500 books this month', time: '4 hours ago', icon: 'pricetag', iconColor: colors.secondary[500], iconBg: colors.secondary[50], read: false },
    { id: '4', title: 'Order Delivered', message: 'ORD001 has been delivered. Please confirm receipt', time: '1 day ago', icon: 'checkmark-circle', iconColor: colors.accent[500], iconBg: colors.accent[50], read: true },
    { id: '5', title: 'Invoice Ready', message: 'Invoice for ORD001 is ready for download', time: '2 days ago', icon: 'document-text', iconColor: colors.primary[500], iconBg: colors.primary[50], read: true },
  ],
  individual: [
    { id: '1', title: 'Order Confirmed', message: 'Your order ORD003 has been confirmed and is being packed', time: '20 min ago', icon: 'checkmark-circle', iconColor: colors.accent[500], iconBg: colors.accent[50], read: false },
    { id: '2', title: 'Special Offer', message: 'Get 15% off on all Science textbooks this weekend', time: '2 hours ago', icon: 'pricetag', iconColor: colors.secondary[500], iconBg: colors.secondary[50], read: false },
    { id: '3', title: 'New Arrivals', message: 'Check out the latest 2026 edition Computer Science books', time: '6 hours ago', icon: 'sparkles', iconColor: colors.info[500], iconBg: colors.info[50], read: true },
    { id: '4', title: 'Delivery Update', message: 'Your order is out for delivery. Expected by 5 PM today', time: '1 day ago', icon: 'bicycle', iconColor: colors.primary[500], iconBg: colors.primary[50], read: true },
    { id: '5', title: 'Review Request', message: 'How was your experience? Rate your recent purchase', time: '3 days ago', icon: 'star', iconColor: colors.secondary[500], iconBg: colors.secondary[50], read: true },
  ],
};

export default function NotificationsScreen() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const role = user?.role || 'individual';
  const notifications = notificationsByRole[role];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[st.screen, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[st.header, { backgroundColor: colors.primary[500] }]}>
        <TouchableOpacity onPress={() => router.back()} style={st.headerBack}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Notifications</Text>
        <View style={st.headerRight}>
          {unreadCount > 0 && (
            <View style={st.unreadBadge}>
              <Text style={st.unreadText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
      </View>

      {/* Summary */}
      <View style={[st.summary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={st.summaryItem}>
          <Text style={[st.summaryNum, { color: colors.danger[500] }]}>{unreadCount}</Text>
          <Text style={[st.summaryLabel, { color: theme.textSecondary }]}>Unread</Text>
        </View>
        <View style={[st.summaryDivider, { backgroundColor: theme.border }]} />
        <View style={st.summaryItem}>
          <Text style={[st.summaryNum, { color: colors.primary[500] }]}>{notifications.length}</Text>
          <Text style={[st.summaryLabel, { color: theme.textSecondary }]}>Total</Text>
        </View>
        <View style={[st.summaryDivider, { backgroundColor: theme.border }]} />
        <View style={st.summaryItem}>
          <Text style={[st.summaryNum, { color: colors.accent[500] }]}>{notifications.length - unreadCount}</Text>
          <Text style={[st.summaryLabel, { color: theme.textSecondary }]}>Read</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={[
            st.notifCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            !item.read && { borderLeftWidth: 3, borderLeftColor: colors.primary[500] },
          ]}>
            <View style={[st.notifIcon, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
            </View>
            <View style={st.notifBody}>
              <View style={st.notifTopRow}>
                <Text style={[st.notifTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                {!item.read && <View style={st.unreadDot} />}
              </View>
              <Text style={[st.notifMsg, { color: theme.textSecondary }]} numberOfLines={2}>{item.message}</Text>
              <Text style={[st.notifTime, { color: theme.textSecondary }]}>{item.time}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  headerBack: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  unreadBadge: { backgroundColor: colors.danger[500], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  summary: {
    flexDirection: 'row', marginHorizontal: 14, marginTop: 12, marginBottom: 8,
    padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 2 },
  summaryNum: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 11 },
  summaryDivider: { width: 1, height: 30 },

  notifCard: {
    flexDirection: 'row', marginHorizontal: 14, marginBottom: 8,
    padding: 14, borderRadius: 14, borderWidth: 1, gap: 12,
  },
  notifIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifBody: { flex: 1, gap: 3 },
  notifTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary[500] },
  notifMsg: { fontSize: 12, lineHeight: 17 },
  notifTime: { fontSize: 10, marginTop: 2 },
});
