import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, Users, Star, ArrowRight } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import HeroBanner from '../components/HeroBanner';
import BookCarousel from '../components/BookCarousel';
import Footer from '../components/Footer';
import { books } from '../services/mockData';

const classes = ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const classIcons: Record<string, string> = {
  LKG: '🎒', UKG: '🧒', '1st': '📖', '2nd': '✏️', '3rd': '📐', '4th': '🔬',
  '5th': '🌍', '6th': '📚', '7th': '🧪', '8th': '💻', '9th': '🎓', '10th': '🏆',
};

// Pick featured books (spread across subjects)
const featuredBooks = books.filter((_, i) => i % 21 === 0).slice(0, 6);
const popularBooks = books.filter((b) => b.stock > 300).slice(0, 12);
const newArrivals = books.filter((b) => b.class === '10th' || b.class === '9th').slice(0, 12);

const stats = [
  { icon: BookOpen, value: '250+', label: 'Books Available' },
  { icon: GraduationCap, value: '12', label: 'Classes Covered' },
  { icon: Users, value: '500+', label: 'Schools Trust Us' },
  { icon: Award, value: '25+', label: 'Years Experience' },
];

const IMG = {
  kidsReading: '/images/kids-reading.jpg',
  classroom: '/images/classroom.jpg',
  kidsStudying: '/images/kids-studying.jpg',
  library: '/images/library.jpg',
  girlWriting: '/images/girl-writing.jpg',
  schoolKids: '/images/textbooks-stack.jpg',
};

function useScrollAnimate() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollAnimate();
  return (
    <div ref={ref} className={`scroll-animate ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <PublicNavbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-18" />

      {/* Hero Banner */}
      <HeroBanner books={featuredBooks} />

      {/* Stats bar */}
      <AnimatedSection>
        <div className="border-y" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 justify-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--theme-accent-bg)' }}>
                    <stat.icon size={22} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--theme-text)' }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Image banner — kids in classroom */}
      <AnimatedSection>
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={IMG.kidsReading}
                  alt="Children reading books together"
                  className="w-full h-64 sm:h-80 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent" />
              </div>
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-secondary-500/20 text-secondary-700 dark:text-secondary-400 border border-secondary-300 dark:border-secondary-600">
                  Why Samba Publications?
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'var(--theme-text)' }}>
                  Building Brighter Futures Through Quality Education
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                  For over 25 years, Samba Publications has been the trusted choice for schools across Tamil Nadu.
                  Our textbooks are crafted by experienced educators, aligned with the latest curriculum standards,
                  and designed to make learning engaging and effective.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[
                    { num: '7', label: 'Core Subjects' },
                    { num: '3', label: 'Terms per Year' },
                    { num: '25+', label: 'Expert Authors' },
                    { num: '8', label: 'Districts Served' },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                      <p className="text-lg font-extrabold text-primary-500">{item.num}</p>
                      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Choose Your Book - Browse by Class */}
      <AnimatedSection>
        <section className="py-12 sm:py-16" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>
                Choose Your Book
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
                Browse textbooks by class - from LKG to 10th Standard
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {classes.map((cls, i) => (
                <Link
                  key={cls}
                  to={`/catalog?class=${cls}`}
                  className="group relative flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 btn-press"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <span className="text-3xl sm:text-4xl">{classIcons[cls]}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>
                    {cls === 'LKG' || cls === 'UKG' ? cls : `Class ${cls}`}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--theme-text-secondary)' }}>
                    {books.filter((b) => b.class === cls).length} books
                  </span>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 bg-secondary-500 transition-all duration-300 rounded-full" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Popular Books Carousel */}
      <AnimatedSection>
        <BookCarousel
          title="Popular Books"
          subtitle="Most ordered textbooks by schools across Tamil Nadu"
          books={popularBooks}
        />
      </AnimatedSection>

      {/* Image gallery strip */}
      <AnimatedSection>
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { src: IMG.classroom, alt: 'Students in a classroom' },
                { src: IMG.girlWriting, alt: 'Girl writing in notebook' },
                { src: IMG.library, alt: 'Library with books' },
                { src: IMG.schoolKids, alt: 'Stack of colorful textbooks' },
              ].map((img) => (
                <div key={img.alt} className="relative rounded-2xl overflow-hidden shadow-lg group">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Featured / New Arrivals Carousel */}
      <AnimatedSection>
        <div style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
          <BookCarousel
            title="Featured Books"
            subtitle="Handpicked selections for the current academic year"
            books={newArrivals}
          />
        </div>
      </AnimatedSection>

      {/* Testimonials / Trust Section */}
      <AnimatedSection>
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>
                Trusted by Schools
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
                What educators say about our textbooks
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Sr. Maria Thomas', school: "St. Mary's HSS, Chennai", text: 'Samba Publications has consistently provided high-quality textbooks. The content is well-structured and student-friendly.', img: '/images/testimonial-1.jpg' },
                { name: 'Mr. Arun Prasad', school: 'Kendriya Vidyalaya, Madurai', text: 'We have been using Samba textbooks for over 5 years. The curriculum alignment is excellent and delivery is always on time.', img: '/images/testimonial-2.jpg' },
                { name: 'Mrs. Priya Venkat', school: 'Velammal School, Trichy', text: 'The ordering process through their representatives is seamless. Great support and competitive pricing for bulk orders.', img: '/images/testimonial-3.jpg' },
              ].map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
                >
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className="fill-secondary-500 text-secondary-500" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--theme-text-secondary)' }}>
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={testimonial.img} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>{testimonial.name}</p>
                      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{testimonial.school}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section with background image */}
      <AnimatedSection>
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0">
            <img src={IMG.kidsStudying} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-primary-900/75 dark:bg-primary-900/85" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4 text-white">
              Ready to Order Textbooks?
            </h2>
            <p className="text-base mb-8 max-w-2xl mx-auto text-white/80">
              Whether you're a school placing bulk orders, a representative managing districts,
              or a parent buying for your child - we've got you covered.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold bg-secondary-500 text-primary-900 hover:bg-secondary-400 shadow-lg hover:shadow-xl transition-all duration-200 btn-press"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold border-2 border-white/40 text-white hover:bg-white/10 transition-all duration-200 btn-press"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
}
