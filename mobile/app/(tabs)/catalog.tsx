import { useState, useMemo, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
  Dimensions, Modal, Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useCartStore } from '../../src/store/cartStore';
import { useAuthStore } from '../../src/store/authStore';
import { books, getClasses, getSubjects, getTerms } from '../../src/data/mockData';
import { colors } from '../../src/theme/colors';
import type { Book } from '../../src/store/cartStore';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 36) / 2;

const subjectColors: Record<string, string> = {
  Tamil: '#1e3a5f', English: '#6366f1', Mathematics: '#ef4444',
  Science: '#10b981', 'Social Science': '#f59e0b', Hindi: '#8b5cf6',
  'Computer Science': '#ec4899',
};

const classEmojis: Record<string, string> = {
  LKG: '🎒', UKG: '🧒', '1st': '📖', '2nd': '✏️', '3rd': '📐', '4th': '🔬',
  '5th': '🌍', '6th': '📚', '7th': '🧪', '8th': '💻', '9th': '🎓', '10th': '🏆',
};

/* ── Dropdown Component ── */
function Dropdown({ label, value, options, onSelect, theme, icon }: {
  label: string; value: string; options: string[]; onSelect: (v: string) => void; theme: any; icon: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        style={[st.dropdown, { backgroundColor: theme.surface, borderColor: value ? colors.primary[500] : theme.border }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Ionicons name={icon as any} size={14} color={value ? colors.primary[500] : theme.textSecondary} />
        <Text style={[st.dropdownText, { color: value ? colors.primary[500] : theme.textSecondary }]} numberOfLines={1}>
          {value || label}
        </Text>
        <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={st.modalOverlay} onPress={() => setOpen(false)}>
          <View style={[st.modalContent, { backgroundColor: theme.surface }]}>
            <View style={st.modalHeader}>
              <Text style={[st.modalTitle, { color: theme.text }]}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={['', ...options]}
              keyExtractor={(item) => item || 'all'}
              renderItem={({ item }) => {
                const active = value === item;
                return (
                  <TouchableOpacity
                    style={[st.optionRow, active && { backgroundColor: colors.primary[50] }]}
                    onPress={() => { onSelect(item); setOpen(false); }}
                  >
                    <Text style={[st.optionText, { color: active ? colors.primary[500] : theme.text }]}>
                      {item || `All ${label.replace('Select ', '')}`}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={18} color={colors.primary[500]} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

/* ══════════════════════════════════════ */
export default function CatalogScreen() {
  const params = useLocalSearchParams<{ class?: string }>();
  const { theme } = useThemeStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState(params.class || '');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (selectedClass && b.class !== selectedClass) return false;
      if (selectedSubject && b.subject !== selectedSubject) return false;
      if (selectedTerm && b.term !== selectedTerm) return false;
      if (search) {
        const q = search.toLowerCase();
        return b.title.toLowerCase().includes(q) || b.subject.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, selectedClass, selectedSubject, selectedTerm]);

  const handleAddToCart = (item: Book) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    addItem(item);
  };

  const hasFilters = selectedClass || selectedSubject || selectedTerm || search;

  const renderBook = ({ item }: { item: Book }) => {
    const bg = subjectColors[item.subject] || '#1e3a5f';
    const disc = Math.round(((item.mrp - item.price) / item.mrp) * 100);
    const emoji = classEmojis[item.class] || '📕';

    return (
      <TouchableOpacity
        style={[st.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => router.push({ pathname: '/book/[id]', params: { id: item.id } })}
        activeOpacity={0.7}
      >
        <View style={[st.cover, { backgroundColor: bg }]}>
          <View style={st.coverWatermark}>
            <Ionicons name="book" size={50} color="rgba(255,255,255,0.06)" />
          </View>
          <Text style={st.coverEmoji}>{emoji}</Text>
          <Text style={st.coverSubject} numberOfLines={1}>{item.subject}</Text>
          <Text style={st.coverClass}>{item.class} · {item.term}</Text>
          {disc > 0 && (
            <View style={st.discBadge}>
              <Text style={st.discText}>{disc}% OFF</Text>
            </View>
          )}
        </View>
        <View style={st.info}>
          <Text style={[st.title, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
          <View style={st.priceRow}>
            <Text style={st.price}>₹{item.price}</Text>
            <Text style={[st.mrp, { color: theme.textSecondary }]}>₹{item.mrp}</Text>
          </View>
          <TouchableOpacity style={st.cartBtn} onPress={() => handleAddToCart(item)} activeOpacity={0.8}>
            <Ionicons name="cart-outline" size={13} color="#fff" />
            <Text style={st.cartBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[st.screen, { backgroundColor: theme.bg }]}>
      {/* Search */}
      <View style={[st.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={16} color={theme.textSecondary} />
        <TextInput
          style={[st.searchInput, { color: theme.text }]}
          placeholder="Search books..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Dropdown Filters */}
      <View style={st.filterRow}>
        <Dropdown label="Select Class" value={selectedClass} options={getClasses()} onSelect={setSelectedClass} theme={theme} icon="school-outline" />
        <Dropdown label="Select Subject" value={selectedSubject} options={getSubjects()} onSelect={setSelectedSubject} theme={theme} icon="book-outline" />
        <Dropdown label="Term" value={selectedTerm} options={getTerms()} onSelect={setSelectedTerm} theme={theme} icon="calendar-outline" />
      </View>

      {/* Results count + clear */}
      <View style={st.resultRow}>
        <Text style={[st.resultCount, { color: theme.textSecondary }]}>
          {filtered.length} books found
        </Text>
        {hasFilters ? (
          <TouchableOpacity onPress={() => { setSelectedClass(''); setSelectedSubject(''); setSelectedTerm(''); setSearch(''); }}>
            <View style={st.clearBtn}>
              <Ionicons name="close-circle-outline" size={13} color={colors.danger[500]} />
              <Text style={{ color: colors.danger[500], fontSize: 11, fontWeight: '600' }}>Clear all</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={st.gridRow}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={renderBook}
        ListEmptyComponent={
          <View style={st.empty}>
            <Ionicons name="book-outline" size={48} color={theme.textSecondary} />
            <Text style={[st.emptyText, { color: theme.textSecondary }]}>No books found</Text>
            <Text style={[st.emptyHint, { color: theme.textSecondary }]}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, marginTop: 8, marginBottom: 6,
    paddingHorizontal: 12, height: 40, borderRadius: 12, borderWidth: 1, gap: 6,
  },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },

  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 4 },

  dropdown: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 9,
    borderRadius: 10, borderWidth: 1, gap: 4,
  },
  dropdownText: { flex: 1, fontSize: 11, fontWeight: '500' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', paddingHorizontal: 30,
  },
  modalContent: { borderRadius: 16, maxHeight: 400, overflow: 'hidden' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  optionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  optionText: { fontSize: 14, fontWeight: '500' },

  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 4 },
  resultCount: { fontSize: 11, fontWeight: '500' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  gridRow: { gap: 10, paddingHorizontal: 12, marginBottom: 10 },
  card: { width: CARD_W, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },

  cover: {
    width: '100%', height: 110,
    alignItems: 'center', justifyContent: 'center',
    gap: 2, position: 'relative', overflow: 'hidden',
  },
  coverWatermark: { position: 'absolute', bottom: -5, right: -5 },
  coverEmoji: { fontSize: 22, marginBottom: 2 },
  coverSubject: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  coverClass: { color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: '500' },
  discBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: colors.secondary[500],
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  discText: { fontSize: 8, fontWeight: '700', color: '#fff' },

  info: { padding: 8, gap: 4 },
  title: { fontSize: 11, fontWeight: '600', lineHeight: 15 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  price: { fontSize: 14, fontWeight: '800', color: colors.primary[500] },
  mrp: { fontSize: 10, textDecorationLine: 'line-through' },

  cartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary[500], paddingVertical: 7, borderRadius: 8, gap: 4, marginTop: 2,
  },
  cartBtnText: { color: '#fff', fontWeight: '700', fontSize: 11 },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 6 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 12 },
});
