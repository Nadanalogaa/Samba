import { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../src/store/themeStore';
import { useAuthStore } from '../src/store/authStore';
import { useCartStore } from '../src/store/cartStore';
import { books, getClasses } from '../src/data/mockData';
import { colors, pastelThemes, type PastelThemeId } from '../src/theme/colors';
import type { Book } from '../src/store/cartStore';

const { width: SW } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_SIDE_PADDING = 20;
const CARD_WIDTH = SW * 0.78;

const heroCardColors = [
  { bg: '#1e3a5f', circle: '#2d4f7a', text: '#fff', textSub: 'rgba(255,255,255,0.5)', btn: '#f59e0b', btnText: '#1e3a5f', badgeBg: 'rgba(245,158,11,0.2)', badgeText: '#fbbf24' },
  { bg: '#d4f5e9', circle: '#10b981', text: '#064e3b', textSub: '#6b7280', btn: '#064e3b', btnText: '#fff', badgeBg: 'rgba(16,185,129,0.2)', badgeText: '#047857' },
  { bg: '#ede9fe', circle: '#8b5cf6', text: '#3b0764', textSub: '#6b7280', btn: '#7c3aed', btnText: '#fff', badgeBg: 'rgba(139,92,246,0.15)', badgeText: '#6d28d9' },
  { bg: '#fef3c7', circle: '#f59e0b', text: '#78350f', textSub: '#92400e', btn: '#b45309', btnText: '#fff', badgeBg: 'rgba(245,158,11,0.2)', badgeText: '#92400e' },
  { bg: '#fce7f3', circle: '#ec4899', text: '#831843', textSub: '#6b7280', btn: '#db2777', btnText: '#fff', badgeBg: 'rgba(236,72,153,0.15)', badgeText: '#be185d' },
];

const featuredBooks = books.filter((_, i) => i % 21 === 0).slice(0, 5);
const popularBooks = books.filter((b) => b.stock > 300).slice(0, 10);
const newArrivals = books.filter((b) => b.class === '10th' || b.class === '9th').slice(0, 10);
const allClasses = getClasses();

const classIcons: Record<string, string> = {
  LKG: '🎒', UKG: '🧒', '1st': '📖', '2nd': '✏️', '3rd': '📐', '4th': '🔬',
  '5th': '🌍', '6th': '📚', '7th': '🧪', '8th': '💻', '9th': '🎓', '10th': '🏆',
};

const subjectColors: Record<string, string> = {
  Tamil: '#1e3a5f', English: '#6366f1', Mathematics: '#ef4444',
  Science: '#10b981', 'Social Science': '#f59e0b', Hindi: '#8b5cf6',
  'Computer Science': '#ec4899',
};

const themeOptions: { id: PastelThemeId; label: string; color: string }[] = [
  { id: 'rose', label: 'Rose', color: '#f8bbd0' },
  { id: 'ocean', label: 'Ocean', color: '#b2ebf2' },
  { id: 'mint', label: 'Mint', color: '#c8e6c9' },
  { id: 'lavender', label: 'Lavender', color: '#e1bee7' },
  { id: 'peach', label: 'Peach', color: '#ffe0b2' },
];

const testimonials = [
  { name: 'Mrs. Lakshmi', role: 'Principal, GHS Chennai', text: 'Samba Publications textbooks have been our go-to for years. Quality content at affordable prices.', icon: 'person-circle' },
  { name: 'Mr. Rajesh Kumar', role: 'Teacher, Madurai', text: 'The curriculum-aligned content makes teaching so much easier. Highly recommend for all Tamil Nadu schools.', icon: 'person-circle' },
  { name: 'Mrs. Priya S.', role: 'Parent, Coimbatore', text: 'My children love the clear explanations and colorful illustrations. Best textbooks in Tamil Nadu!', icon: 'person-circle' },
];

const whyChooseUs = [
  { icon: 'shield-checkmark', title: 'Curriculum Aligned', desc: 'All books follow TN State Board syllabus' },
  { icon: 'cash', title: 'Affordable Pricing', desc: 'Bulk discounts for schools up to 30% off' },
  { icon: 'rocket', title: 'Fast Delivery', desc: 'Delivered within 3-5 business days across TN' },
  { icon: 'headset', title: '24/7 Support', desc: 'Dedicated support for schools & representatives' },
];

/* ── Mini Book Cover (for book cards only) ── */
function BookCover({ book }: { book: Book }) {
  const bg = subjectColors[book.subject] || '#1e3a5f';
  return (
    <View style={[s.cardCover, { backgroundColor: bg }]}>
      <Ionicons name="book" size={24} color="rgba(255,255,255,0.25)" />
      <Text style={s.coverSubject} numberOfLines={2}>{book.subject}</Text>
      <Text style={s.coverMeta}>{book.class} · {book.term}</Text>
    </View>
  );
}

/* ── Book Card ── */
function BookCard({ book, theme, onAddToCart }: { book: Book; theme: any; onAddToCart: () => void }) {
  const discount = Math.round(((book.mrp - book.price) / book.mrp) * 100);
  return (
    <TouchableOpacity
      style={[s.bookCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={() => router.push(`/book/${book.id}`)}
      activeOpacity={0.7}
    >
      <BookCover book={book} />
      {discount > 0 && (
        <View style={s.discountBadge}>
          <Text style={s.discountText}>{discount}% OFF</Text>
        </View>
      )}
      <View style={s.bookInfo}>
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
          <View style={[s.badge, { backgroundColor: colors.primary[50] }]}>
            <Text style={[s.badgeText, { color: colors.primary[500] }]}>{book.class}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: colors.info[50] }]}>
            <Text style={[s.badgeText, { color: colors.info[500] }]}>{book.subject.slice(0, 6)}</Text>
          </View>
        </View>
        <Text style={[s.bookTitle, { color: theme.text }]} numberOfLines={2}>{book.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
          <Text style={[s.bookPrice, { color: colors.primary[500] }]}>₹{book.price}</Text>
          <Text style={[s.bookMrp, { color: theme.textSecondary }]}>₹{book.mrp}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={onAddToCart} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={14} color="#fff" />
          <Text style={s.addBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

/* ══════════════════════════════════════════════════ */
export default function LandingScreen() {
  const { theme, mode, isDark, setTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [heroIdx, setHeroIdx] = useState(0);
  const heroRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showThemes, setShowThemes] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const next = (heroIdx + 1) % featuredBooks.length;
      setHeroIdx(next);
      heroRef.current?.scrollTo({ x: next * SW, animated: true });
    }, 4000);
    return () => clearInterval(t);
  }, [heroIdx]);

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SW);
    if (i !== heroIdx) setHeroIdx(i);
  };

  const handleAddToCart = useCallback((book: Book) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    addItem(book);
  }, [isAuthenticated, addItem]);

  return (
    <Animated.View style={[s.screen, { backgroundColor: theme.bg, opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 70 }}>

        {/* ── Navbar ── */}
        <View style={[s.navbar, { backgroundColor: colors.primary[900] }]}>
          <View style={s.navLeft}>
            <View style={s.logoBox}>
              <Ionicons name="book" size={18} color={colors.primary[900]} />
            </View>
            <Text style={s.navTitle}>Samba Publications</Text>
          </View>
          <View style={s.navRight}>
            <TouchableOpacity onPress={() => setShowThemes(!showThemes)} style={s.navBtn}>
              <Ionicons name="color-palette-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={s.navBtn} onPress={() => isAuthenticated ? router.push('/(tabs)/cart') : router.push('/login')}>
              <Ionicons name="cart-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Picker */}
        {showThemes && (
          <View style={[s.themePicker, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[s.themePickerLabel, { color: theme.text }]}>Choose Theme</Text>
            <View style={s.themeRow}>
              {themeOptions.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => { setTheme(t.id); setShowThemes(false); }}
                  style={[s.themeCircle, { backgroundColor: t.color }, mode === t.id && s.themeCircleActive]}
                />
              ))}
              <TouchableOpacity
                onPress={() => { setTheme('dark'); setShowThemes(false); }}
                style={[s.themeCircle, { backgroundColor: '#1e293b' }, isDark && s.themeCircleActive]}
              >
                <Ionicons name="moon" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Auth Buttons ── */}
        {!isAuthenticated ? (
          <View style={[s.authRow, { backgroundColor: theme.surfaceAlt }]}>
            <TouchableOpacity style={[s.authBtn, { borderColor: theme.border }]} onPress={() => router.push('/login')}>
              <Ionicons name="log-in-outline" size={16} color={theme.text} />
              <Text style={[s.authBtnText, { color: theme.text }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.authBtn, { backgroundColor: colors.secondary[500], borderColor: colors.secondary[500] }]}
              onPress={() => router.push('/login')}
            >
              <Ionicons name="person-add-outline" size={16} color={colors.primary[900]} />
              <Text style={[s.authBtnText, { color: colors.primary[900] }]}>Register</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[s.authRow, { backgroundColor: theme.surfaceAlt }]}>
            <TouchableOpacity
              style={[s.authBtn, { backgroundColor: colors.secondary[500], borderColor: colors.secondary[500], flex: 1 }]}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Ionicons name="grid-outline" size={16} color={colors.primary[900]} />
              <Text style={[s.authBtnText, { color: colors.primary[900] }]}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Hero Carousel (Spotify-style peek cards) ── */}
        <ScrollView
          ref={heroRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onHeroScroll}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: CARD_SIDE_PADDING }}
          style={{ marginTop: 8 }}
        >
          {featuredBooks.map((item, idx) => {
            const disc = Math.round(((item.mrp - item.price) / item.mrp) * 100);
            const cardColor = heroCardColors[idx % heroCardColors.length];
            return (
              <View key={item.id} style={[s.heroCard, { backgroundColor: cardColor.bg, marginRight: CARD_GAP }]}>
                {/* Badge */}
                <View style={[s.featBadge, { backgroundColor: cardColor.badgeBg }]}>
                  <Ionicons name="star" size={10} color={cardColor.badgeText} />
                  <Text style={[s.featBadgeText, { color: cardColor.badgeText }]}>Featured</Text>
                </View>

                {/* Circular book cover */}
                <View style={[s.heroCircle, { backgroundColor: cardColor.circle }]}>
                  <Ionicons name="book" size={30} color="rgba(255,255,255,0.3)" />
                  <Text style={s.heroCircleSubject}>{item.subject}</Text>
                </View>
                <Text style={s.heroCircleMeta}>{item.class} · {item.term}</Text>

                {/* Title */}
                <Text style={[s.heroCardTitle, { color: cardColor.text }]} numberOfLines={1}>{item.title}</Text>

                {/* Price row */}
                <View style={s.heroPriceRow}>
                  <Text style={[s.heroCardPrice, { color: cardColor.text }]}>₹{item.price}</Text>
                  <Text style={[s.heroCardMrp, { color: cardColor.textSub }]}>₹{item.mrp}</Text>
                  {disc > 0 && (
                    <View style={s.heroDiscBadge}>
                      <Text style={s.heroDiscText}>{disc}% OFF</Text>
                    </View>
                  )}
                </View>

                {/* CTA */}
                <TouchableOpacity style={[s.heroCartBtn, { backgroundColor: cardColor.btn }]} onPress={() => handleAddToCart(item)} activeOpacity={0.8}>
                  <Ionicons name="cart-outline" size={15} color={cardColor.btnText} />
                  <Text style={[s.heroCartBtnText, { color: cardColor.btnText }]}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
        <View style={s.dots}>
          {featuredBooks.map((_, i) => (
            <View key={i} style={[s.dot, i === heroIdx && s.dotActive]} />
          ))}
        </View>

        {/* ── Stats Strip ── */}
        <View style={[s.statsStrip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {[
            { icon: 'book', val: '250+', label: 'Books' },
            { icon: 'school', val: '12', label: 'Classes' },
            { icon: 'people', val: '500+', label: 'Schools' },
            { icon: 'star', val: '4.8', label: 'Rating' },
          ].map((st) => (
            <View key={st.label} style={s.statItem}>
              <Ionicons name={st.icon as any} size={18} color={colors.secondary[500]} />
              <Text style={[s.statVal, { color: theme.text }]}>{st.val}</Text>
              <Text style={[s.statLbl, { color: theme.textSecondary }]}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Welcome Banner ── */}
        <View style={[s.welcomeBanner, { backgroundColor: colors.primary[50] }]}>
          <Ionicons name="school" size={40} color={colors.primary[500]} />
          <View style={{ flex: 1 }}>
            <Text style={[s.welcomeTitle, { color: colors.primary[900] }]}>Quality Textbooks for Tamil Nadu Schools</Text>
            <Text style={[s.welcomeDesc, { color: colors.primary[700] }]}>
              Trusted by 500+ schools across all 38 districts. Covering LKG to 10th standard with curriculum-aligned content.
            </Text>
          </View>
        </View>

        {/* ── Choose Your Book - Browse by Class ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Ionicons name="school-outline" size={20} color={colors.primary[500]} />
            <Text style={[s.sectionTitle, { color: theme.text }]}>Choose Your Book</Text>
          </View>
          <Text style={[s.sectionSub, { color: theme.textSecondary }]}>Browse by class level</Text>
          <View style={s.classGrid}>
            {allClasses.map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[s.classCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push(`/(tabs)/catalog?class=${cls}`)}
                activeOpacity={0.7}
              >
                <Text style={s.classEmoji}>{classIcons[cls] || '📕'}</Text>
                <Text style={[s.className, { color: theme.text }]}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Popular Books ── */}
        <View style={[s.section, { backgroundColor: theme.surfaceAlt, paddingHorizontal: 0 }]}>
          <View style={[s.sectionHead, { paddingHorizontal: 16 }]}>
            <Ionicons name="flame-outline" size={20} color={colors.danger[500]} />
            <Text style={[s.sectionTitle, { color: theme.text }]}>Popular Books</Text>
          </View>
          <Text style={[s.sectionSub, { color: theme.textSecondary, paddingHorizontal: 16 }]}>Most ordered by schools this year</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {popularBooks.map((item) => (
              <BookCard key={item.id} book={item} theme={theme} onAddToCart={() => handleAddToCart(item)} />
            ))}
          </ScrollView>
        </View>

        {/* ── Why Choose Us ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent[500]} />
            <Text style={[s.sectionTitle, { color: theme.text }]}>Why Choose Samba?</Text>
          </View>
          <Text style={[s.sectionSub, { color: theme.textSecondary }]}>Trusted by educators across Tamil Nadu</Text>
          <View style={s.whyGrid}>
            {whyChooseUs.map((item) => (
              <View key={item.title} style={[s.whyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[s.whyIcon, { backgroundColor: colors.primary[50] }]}>
                  <Ionicons name={item.icon as any} size={22} color={colors.primary[500]} />
                </View>
                <Text style={[s.whyTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[s.whyDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Featured / New Arrivals ── */}
        <View style={[s.section, { backgroundColor: theme.surfaceAlt, paddingHorizontal: 0 }]}>
          <View style={[s.sectionHead, { paddingHorizontal: 16 }]}>
            <Ionicons name="sparkles-outline" size={20} color={colors.secondary[500]} />
            <Text style={[s.sectionTitle, { color: theme.text }]}>New Arrivals</Text>
          </View>
          <Text style={[s.sectionSub, { color: theme.textSecondary, paddingHorizontal: 16 }]}>Fresh for 2026 academic year</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {newArrivals.map((item) => (
              <BookCard key={item.id} book={item} theme={theme} onAddToCart={() => handleAddToCart(item)} />
            ))}
          </ScrollView>
        </View>

        {/* ── Testimonials ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.info[500]} />
            <Text style={[s.sectionTitle, { color: theme.text }]}>What Educators Say</Text>
          </View>
          <Text style={[s.sectionSub, { color: theme.textSecondary }]}>Trusted by schools across Tamil Nadu</Text>
          {testimonials.map((t) => (
            <View key={t.name} style={[s.testimonialCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={s.testimonialTop}>
                <Ionicons name={t.icon as any} size={36} color={colors.primary[500]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.testimonialName, { color: theme.text }]}>{t.name}</Text>
                  <Text style={[s.testimonialRole, { color: theme.textSecondary }]}>{t.role}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={12} color={colors.secondary[500]} />
                  ))}
                </View>
              </View>
              <Text style={[s.testimonialText, { color: theme.textSecondary }]}>"{t.text}"</Text>
            </View>
          ))}
        </View>

        {/* ── How It Works ── */}
        <View style={[s.section, { backgroundColor: theme.surfaceAlt }]}>
          <View style={s.sectionHead}>
            <Ionicons name="layers-outline" size={20} color={colors.primary[500]} />
            <Text style={[s.sectionTitle, { color: theme.text }]}>How It Works</Text>
          </View>
          <Text style={[s.sectionSub, { color: theme.textSecondary }]}>Order textbooks in 3 simple steps</Text>
          {[
            { step: '1', icon: 'search', title: 'Browse Catalog', desc: 'Explore 250+ books organized by class and subject' },
            { step: '2', icon: 'cart', title: 'Add to Cart', desc: 'Select books and choose quantity for bulk orders' },
            { step: '3', icon: 'checkmark-circle', title: 'Place Order', desc: 'Complete your order and get doorstep delivery across TN' },
          ].map((item, idx) => (
            <View key={item.step} style={[s.stepCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[s.stepNum, { backgroundColor: colors.primary[500] }]}>
                <Text style={s.stepNumText}>{item.step}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.stepTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[s.stepDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
              </View>
              <Ionicons name={item.icon as any} size={24} color={colors.primary[100]} />
            </View>
          ))}
        </View>

        {/* ── CTA ── */}
        <View style={[s.ctaCard, { backgroundColor: colors.primary[900] }]}>
          <Ionicons name="school" size={36} color={colors.secondary[500]} />
          <Text style={s.ctaTitle}>Ready to Order?</Text>
          <Text style={s.ctaSub}>Schools, representatives, or individuals - we've got you covered. Get started in minutes.</Text>
          <TouchableOpacity
            style={[s.ctaBtn, { backgroundColor: colors.secondary[500] }]}
            onPress={() => router.push(isAuthenticated ? '/(tabs)/catalog' : '/login')}
            activeOpacity={0.8}
          >
            <Text style={[s.ctaBtnText, { color: colors.primary[900] }]}>Get Started</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary[900]} />
          </TouchableOpacity>
          <View style={s.ctaFeatures}>
            {['Free Delivery', 'Bulk Discounts', 'Easy Returns'].map((f) => (
              <View key={f} style={s.ctaFeatureItem}>
                <Ionicons name="checkmark-circle" size={14} color={colors.accent[500]} />
                <Text style={s.ctaFeatureText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={[s.footer, { backgroundColor: theme.surfaceAlt, borderTopColor: theme.border }]}>
          <View style={s.footerBrand}>
            <View style={s.logoBox}>
              <Ionicons name="book" size={16} color={colors.primary[900]} />
            </View>
            <Text style={[s.footerBrandName, { color: theme.text }]}>Samba Publications</Text>
          </View>
          <Text style={[s.footerDesc, { color: theme.textSecondary }]}>
            Quality educational textbooks for Tamil Nadu schools since 2005. Serving LKG to 10th standard across all 38 districts.
          </Text>
          <View style={s.footerLinks}>
            {['About Us', 'Contact', 'Privacy Policy', 'Terms'].map((link) => (
              <Text key={link} style={[s.footerLink, { color: colors.primary[500] }]}>{link}</Text>
            ))}
          </View>
          <View style={s.footerSocial}>
            {(['logo-facebook', 'logo-twitter', 'logo-instagram', 'logo-youtube'] as const).map((icon) => (
              <View key={icon} style={[s.socialIcon, { backgroundColor: theme.surface }]}>
                <Ionicons name={icon} size={18} color={colors.primary[500]} />
              </View>
            ))}
          </View>
          <Text style={[s.footerCopy, { color: theme.textSecondary }]}>
            © 2026 Samba Publications. All rights reserved.
          </Text>
        </View>

      </ScrollView>

      {/* ── Bottom Navigation ── */}
      <View style={[s.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        {[
          { icon: 'home', label: 'Home', route: '/landing', active: true },
          { icon: 'grid', label: 'Catalog', route: isAuthenticated ? '/(tabs)/catalog' : '/landing', active: false },
          { icon: 'cart', label: 'Cart', route: isAuthenticated ? '/(tabs)/cart' : '/login', active: false },
          { icon: 'receipt', label: 'Orders', route: isAuthenticated ? '/(tabs)/orders' : '/login', active: false },
          { icon: 'person', label: isAuthenticated ? 'Profile' : 'Login', route: isAuthenticated ? '/(tabs)/profile' : '/login', active: false },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={s.bottomTab}
            onPress={() => { if (!tab.active) router.push(tab.route as any); }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(tab.active ? tab.icon : `${tab.icon}-outline`) as any}
              size={22}
              color={tab.active ? colors.primary[500] : theme.textSecondary}
            />
            <Text style={[s.bottomTabLabel, { color: tab.active ? colors.primary[500] : theme.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════════ */
const s = StyleSheet.create({
  screen: { flex: 1 },

  /* Navbar */
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, paddingBottom: 10, paddingHorizontal: 16 },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  navRight: { flexDirection: 'row', gap: 6 },
  navBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  /* Theme Picker */
  themePicker: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 14, borderWidth: 1 },
  themePickerLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  themeRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  themeCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  themeCircleActive: { borderColor: '#1e3a5f', transform: [{ scale: 1.15 }] },

  /* Auth */
  authRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  authBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  authBtnText: { fontSize: 14, fontWeight: '600' },

  /* Hero (Spotify-style peek cards) */
  heroCard: { width: CARD_WIDTH, borderRadius: 20, padding: 20, alignItems: 'center', gap: 8, marginVertical: 12, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)' },
  featBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  featBadgeText: { fontSize: 11, fontWeight: '700' },
  heroCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6 },
  heroCircleSubject: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  heroCircleMeta: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  heroCardTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  heroPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroCardPrice: { fontSize: 22, fontWeight: '800' },
  heroCardMrp: { fontSize: 13, textDecorationLine: 'line-through' },
  heroDiscBadge: { backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  heroDiscText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  heroCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14, marginTop: 2, width: '100%' },
  heroCartBtnText: { fontSize: 14, fontWeight: '700' },

  /* Dots */
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(30,58,95,0.2)' },
  dotActive: { width: 24, backgroundColor: '#1e3a5f' },

  /* Stats */
  statsStrip: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, marginHorizontal: 16, borderRadius: 14, borderWidth: 1, marginTop: 4 },
  statItem: { alignItems: 'center', gap: 2 },
  statVal: { fontSize: 16, fontWeight: '800' },
  statLbl: { fontSize: 10 },

  /* Welcome Banner */
  welcomeBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 16 },
  welcomeTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  welcomeDesc: { fontSize: 11, lineHeight: 16 },

  /* Sections */
  section: { paddingVertical: 18, paddingHorizontal: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionSub: { fontSize: 12, marginTop: 2, marginBottom: 12 },

  /* Class Grid */
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  classCard: { width: (SW - 56) / 4, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 4 },
  classEmoji: { fontSize: 22 },
  className: { fontSize: 10, fontWeight: '600' },

  /* Book Card */
  bookCard: { width: 160, marginRight: 12, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  cardCover: { width: '100%', height: 140, alignItems: 'center', justifyContent: 'center', gap: 4 },
  coverSubject: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  coverMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 9 },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#f59e0b', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  bookInfo: { padding: 10 },
  badge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 9, fontWeight: '600' },
  bookTitle: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  bookPrice: { fontSize: 15, fontWeight: '800' },
  bookMrp: { fontSize: 11, textDecorationLine: 'line-through' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#1e3a5f', paddingVertical: 8, borderRadius: 10, marginTop: 8 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  /* Why Choose Us */
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  whyCard: { width: (SW - 42) / 2, padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  whyIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  whyTitle: { fontSize: 13, fontWeight: '700' },
  whyDesc: { fontSize: 11, lineHeight: 16 },

  /* Testimonials */
  testimonialCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  testimonialTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  testimonialName: { fontSize: 13, fontWeight: '700' },
  testimonialRole: { fontSize: 11 },
  testimonialText: { fontSize: 12, lineHeight: 18, fontStyle: 'italic' },

  /* How It Works */
  stepCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  stepNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  stepTitle: { fontSize: 14, fontWeight: '700' },
  stepDesc: { fontSize: 11, lineHeight: 16, marginTop: 2 },

  /* CTA */
  ctaCard: { margin: 16, padding: 24, borderRadius: 20, alignItems: 'center', gap: 10 },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  ctaSub: { fontSize: 13, textAlign: 'center', color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 6 },
  ctaBtnText: { fontSize: 15, fontWeight: '700' },
  ctaFeatures: { flexDirection: 'row', gap: 16, marginTop: 10 },
  ctaFeatureItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ctaFeatureText: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },

  /* Footer */
  footer: { borderTopWidth: 1, padding: 20, alignItems: 'center', gap: 10 },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerBrandName: { fontSize: 15, fontWeight: '700' },
  footerDesc: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  footerLinks: { flexDirection: 'row', gap: 16, marginVertical: 6 },
  footerLink: { fontSize: 12, fontWeight: '600' },
  footerSocial: { flexDirection: 'row', gap: 10, marginVertical: 6 },
  socialIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  footerCopy: { fontSize: 10, marginTop: 4 },

  /* Bottom Bar */
  bottomBar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 20, paddingTop: 8 },
  bottomTab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 4 },
  bottomTabLabel: { fontSize: 10, fontWeight: '600' },
});
