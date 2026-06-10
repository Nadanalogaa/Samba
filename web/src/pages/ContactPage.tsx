import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Building2, Headphones } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

const IMG = {
  hero: '/images/contact-hero.jpg',
  office: '/images/office.jpg',
  support: '/images/support-team.jpg',
};

const offices = [
  {
    city: 'Chennai (Head Office)',
    address: '42, Anna Salai, Teynampet, Chennai - 600018, Tamil Nadu',
    phone: '+91 44-2834 5678',
    email: 'info@sambapublications.com',
    hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
  },
  {
    city: 'Coimbatore (Branch Office)',
    address: '15, DB Road, RS Puram, Coimbatore - 641002, Tamil Nadu',
    phone: '+91 422-254 1234',
    email: 'coimbatore@sambapublications.com',
    hours: 'Mon - Sat: 9:30 AM - 5:30 PM',
  },
  {
    city: 'Madurai (Distribution Center)',
    address: '8, West Masi Street, Madurai - 625001, Tamil Nadu',
    phone: '+91 452-258 1234',
    email: 'madurai@sambapublications.com',
    hours: 'Mon - Sat: 9:00 AM - 5:00 PM',
  },
];

const faqs = [
  {
    q: 'How do I place a bulk order for my school?',
    a: 'Schools can place bulk orders through our website by registering as a School user, or by contacting your assigned representative. Representatives visit schools personally to help with order placement and ensure timely delivery.',
  },
  {
    q: 'What is the minimum order quantity for bulk pricing?',
    a: 'Bulk pricing is available for orders of 50 or more copies per title. Schools typically order 100-500 copies per book. Contact our sales team for a customized quote based on your requirements.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery within Tamil Nadu takes 3-5 business days. For bulk school orders placed before the academic term, we ensure delivery within 7-10 days. Express delivery is available for urgent requirements.',
  },
  {
    q: 'Do you offer digital/e-book versions?',
    a: 'We are currently working on digital versions of our textbooks. This feature is expected to launch by the 2027 academic year. Sign up for notifications to be the first to know when e-books become available.',
  },
  {
    q: 'How can I become a Samba Publications representative?',
    a: 'We are always looking for motivated individuals to join our sales team. Representatives are assigned district-wise and earn competitive commissions. Send your resume to careers@sambapublications.com or call our HR team.',
  },
  {
    q: 'What is your return/exchange policy?',
    a: 'Damaged or misprinted books can be exchanged within 15 days of delivery. Please contact our support team with photos of the damaged books. We will arrange a pickup and replacement at no extra cost.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

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
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4 text-white">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-white/80">
            Have questions about our textbooks, bulk orders, or partnerships?
            We'd love to hear from you. Reach out and our team will respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="border-b" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Phone, label: 'Call Us', value: '+91 44-2834 5678', sub: 'Mon-Sat, 9AM-6PM' },
              { icon: Mail, label: 'Email Us', value: 'info@sambapublications.com', sub: 'We reply within 24 hours' },
              { icon: Headphones, label: 'Support', value: 'support@sambapublications.com', sub: 'For order & delivery queries' },
              { icon: Building2, label: 'Visit Us', value: '42, Anna Salai, Chennai', sub: 'Head Office' },
            ].map((card) => (
              <div key={card.label} className="p-5 rounded-2xl border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--theme-accent-bg)' }}>
                  <card.icon size={22} className="text-primary-500" />
                </div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>{card.label}</p>
                <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--theme-text)' }}>{card.value}</p>
                <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Office Addresses */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Form - takes 3 cols */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare size={20} className="text-primary-500" />
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>Send us a Message</h2>
              </div>

              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-700">
                  <p className="text-sm font-medium text-accent-700 dark:text-accent-400">
                    Thank you! Your message has been sent. We'll get back to you within 24 hours.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--theme-text)' }}>Full Name *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--theme-text)' }}>Email Address *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--theme-text)' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--theme-text)' }}>Subject *</label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                    >
                      <option value="">Select a subject</option>
                      <option value="bulk-order">Bulk Order Inquiry</option>
                      <option value="school-partnership">School Partnership</option>
                      <option value="representative">Become a Representative</option>
                      <option value="order-support">Order / Delivery Support</option>
                      <option value="curriculum">Curriculum & Content</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--theme-text)' }}>Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg transition-all duration-200 btn-press"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </form>
            </div>

            {/* Office Addresses - takes 2 cols */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Our Offices</h2>
              {offices.map((office) => (
                <div
                  key={office.city}
                  className="p-5 rounded-2xl border transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
                >
                  <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--theme-text)' }}>{office.city}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0 text-primary-500" />
                      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{office.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="flex-shrink-0 text-primary-500" />
                      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{office.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="flex-shrink-0 text-primary-500" />
                      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{office.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="flex-shrink-0 text-primary-500" />
                      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{office.hours}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Image strip */}
      <section className="py-10" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={IMG.office} alt="Our modern office space" className="w-full h-52 sm:h-64 object-cover" loading="lazy" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={IMG.support} alt="Our support team at work" className="w-full h-52 sm:h-64 object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-20" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>Frequently Asked Questions</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--theme-text-secondary)' }}>Quick answers to common queries</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--theme-text)' }}>{faq.q}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
