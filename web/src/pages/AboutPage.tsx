import { BookOpen, Users, GraduationCap, Award, Target, Heart, Globe, TrendingUp } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

const IMG = {
  hero: '/images/graduation-hero.jpg',
  story: '/images/kids-reading.jpg',
  classroom: '/images/classroom.jpg',
  warehouse: '/images/warehouse.jpg',
  teamWork: '/images/team-work.jpg',
  kidsHappy: '/images/kids-studying.jpg',
  leader1: '/images/leader-1.jpg',
  leader2: '/images/leader-2.jpg',
  leader3: '/images/leader-3.jpg',
  leader4: '/images/leader-4.jpg',
};

const milestones = [
  { year: '1998', title: 'Founded', desc: 'Samba Publications was established in Chennai with a mission to make quality education accessible to every student in Tamil Nadu.' },
  { year: '2003', title: 'Expanded to 5 Districts', desc: 'Grew our distribution network across Chennai, Coimbatore, Madurai, Trichy, and Salem with a team of dedicated representatives.' },
  { year: '2010', title: 'Digital Curriculum Alignment', desc: 'Revamped all textbooks to align with the updated state board curriculum, incorporating modern pedagogy and interactive exercises.' },
  { year: '2015', title: '300+ Schools Partnership', desc: 'Reached a milestone of partnering with over 300 schools across Tamil Nadu for bulk textbook supply.' },
  { year: '2020', title: 'Online Ordering Platform', desc: 'Launched our digital ordering platform enabling schools, representatives, and individuals to browse and order books online.' },
  { year: '2026', title: '500+ Schools & Growing', desc: 'Now serving 500+ schools with 250+ titles covering LKG to 10th standard across 7 subjects.' },
];

const values = [
  { icon: Target, title: 'Quality First', desc: 'Every textbook undergoes rigorous review by subject experts and educators to ensure accuracy and clarity.' },
  { icon: Heart, title: 'Student-Centric', desc: 'Content is designed with the student in mind — clear explanations, practice exercises, and engaging illustrations.' },
  { icon: Globe, title: 'Accessible Education', desc: 'Competitive pricing and bulk order discounts ensure quality education is affordable for every school and family.' },
  { icon: TrendingUp, title: 'Continuous Improvement', desc: 'We update our content annually based on curriculum changes and feedback from teachers and students.' },
];

const team = [
  { name: 'Mr. S. Ramachandran', role: 'Founder & Managing Director', desc: 'A veteran in educational publishing with over 30 years of experience. Started Samba Publications with the vision of quality textbooks for every Tamil Nadu student.', img: IMG.leader1 },
  { name: 'Mrs. Lakshmi Venkatesh', role: 'Head of Content', desc: 'Former school principal with 20+ years in education. Leads our team of 25+ authors and subject experts across all disciplines.', img: IMG.leader2 },
  { name: 'Mr. Karthik Sundaram', role: 'Operations Director', desc: 'Manages our printing, warehousing, and distribution network across 8 districts. Ensures timely delivery to all partner schools.', img: IMG.leader3 },
  { name: 'Mrs. Priya Natarajan', role: 'Head of School Relations', desc: 'Oversees our network of 50+ field representatives and manages partnerships with 500+ schools across the state.', img: IMG.leader4 },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <PublicNavbar />
      <div className="h-16 sm:h-18" />

      {/* Hero with background image */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary-900/70" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-secondary-500/30 text-secondary-300 border border-secondary-500/40 mb-4">
            About Us
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4 text-white">
            Empowering Education Since 1998
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-white/80">
            Samba Publications is a leading Tamil Nadu-based educational publisher, dedicated to providing
            high-quality textbooks for students from LKG to 10th standard.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, value: '250+', label: 'Published Titles' },
              { icon: GraduationCap, value: '12', label: 'Classes Covered' },
              { icon: Users, value: '500+', label: 'Partner Schools' },
              { icon: Award, value: '25+', label: 'Years of Excellence' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--theme-accent-bg)' }}>
                  <stat.icon size={24} className="text-primary-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--theme-text)' }}>{stat.value}</p>
                <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story with image */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Our Story</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                <p>
                  Founded in 1998 by Mr. S. Ramachandran, Samba Publications began as a small publishing house
                  in Chennai with a simple mission: to create textbooks that make learning enjoyable and effective
                  for every student in Tamil Nadu.
                </p>
                <p>
                  What started with just 15 titles for primary classes has grown into a comprehensive catalog
                  of over 250 books covering all subjects from LKG through 10th standard. Our textbooks are
                  available in Tamil, English, and Hindi, catering to the diverse linguistic needs of our state.
                </p>
                <p>
                  Our unique representative model ensures that schools in every district — from metropolitan
                  Chennai to rural Salem — have access to our textbooks. Each representative personally visits
                  schools, understands their needs, and facilitates bulk orders with doorstep delivery.
                </p>
                <p>
                  Today, Samba Publications is trusted by over 500 schools, employs 50+ field representatives
                  across 8 districts, and has a dedicated team of 25+ subject-matter authors and editors who
                  ensure every textbook meets the highest educational standards.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img src={IMG.story} alt="Children reading books in a classroom" className="w-full h-56 object-cover" loading="lazy" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src={IMG.classroom} alt="School classroom" className="w-full h-36 object-cover" loading="lazy" />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src={IMG.warehouse} alt="Book warehouse" className="w-full h-36 object-cover" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="py-10" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl overflow-hidden shadow-xl p-8" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--theme-text)' }}>Quick Facts</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: 'Headquarters', value: 'Chennai, Tamil Nadu' },
                { label: 'Founded', value: '1998' },
                { label: 'Employees', value: '150+' },
                { label: 'Districts Covered', value: '8' },
                { label: 'Languages', value: 'Tamil, English, Hindi' },
                { label: 'Subjects', value: '7 Core Subjects' },
                { label: 'Annual Prints', value: '2 Million+ Copies' },
                { label: 'Warehouses', value: '3 Across Tamil Nadu' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>{item.label}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>Our Values</h2>
              <p className="text-sm mb-8" style={{ color: 'var(--theme-text-secondary)' }}>The principles that guide everything we do</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {values.map((v) => (
                  <div key={v.title} className="p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--theme-accent-bg)' }}>
                      <v.icon size={20} className="text-primary-500" />
                    </div>
                    <h3 className="text-sm font-bold mb-1.5" style={{ color: 'var(--theme-text)' }}>{v.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={IMG.kidsHappy} alt="Happy students in school" className="w-full h-80 sm:h-96 object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-14 sm:py-20" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>Our Journey</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--theme-text-secondary)' }}>Key milestones in our 25+ year history</p>
          </div>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-xs font-bold text-white">{m.year}</span>
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: 'var(--theme-border)' }} />
                  )}
                </div>
                <div className="pb-6 pt-1">
                  <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--theme-text)' }}>{m.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership with photos */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>Leadership Team</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--theme-text-secondary)' }}>The people behind Samba Publications</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t) => (
              <div key={t.name} className="p-5 rounded-2xl border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <img src={t.img} alt={t.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-md border-2 border-white" loading="lazy" />
                <h3 className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{t.name}</h3>
                <p className="text-xs font-medium text-primary-500 mb-2">{t.role}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team photo banner */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.teamWork} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary-900/70" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">Join Our Mission</h2>
          <p className="text-sm text-white/80 max-w-xl mx-auto mb-6">
            We are always looking for passionate educators, talented writers, and motivated sales representatives
            to join our growing team across Tamil Nadu.
          </p>
          <a
            href="mailto:careers@sambapublications.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-secondary-500 text-primary-900 hover:bg-secondary-400 shadow-lg transition-all duration-200 btn-press"
          >
            careers@sambapublications.com
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
