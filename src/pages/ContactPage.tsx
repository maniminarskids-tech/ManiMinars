import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Status & Tracking',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E84D3D] mb-1 block">
            We’re Here To Help
          </span>
          <h1 className="font-logo font-bold text-3xl sm:text-4xl text-neutral-900 mb-3">
            Contact Mani Minars
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
            Questions about child sizing, courier delivery across Pakistan, or size exchange? Our customer care specialists are at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Contact Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="font-logo font-bold text-lg text-neutral-900">
                Customer Care Pakistan
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#E84D3D] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Phone & WhatsApp Care
                  </h4>
                  <p className="text-sm font-semibold text-neutral-900">
                    <a
                      href="https://wa.me/923046466815"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#E84D3D] transition-colors"
                    >
                      +923046466815
                    </a>
                  </p>
                  <p className="text-[11px] text-neutral-400">Available on WhatsApp & Call for instant sizing queries</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 text-[#F5BE38] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Email Support
                  </h4>
                  <p className="text-sm font-semibold text-neutral-900">
                    <a
                      href="mailto:maniminarskids@gmail.com"
                      className="hover:text-[#E84D3D] transition-colors"
                    >
                      maniminarskids@gmail.com
                    </a>
                  </p>
                  <p className="text-[11px] text-neutral-400">Response within 12 working hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Operating Hours
                  </h4>
                  <p className="text-xs font-medium text-neutral-800">
                    Monday to Saturday: 10:00 AM – 8:00 PM (PKT)
                  </p>
                </div>
              </div>
            </div>

            {/* Flagship Studios */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="font-logo font-bold text-base text-neutral-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E84D3D]" />
                <span>Flagship Design Studios</span>
              </h3>

              <div className="text-xs space-y-3 divide-y divide-neutral-100">
                <div className="pt-2 first:pt-0">
                  <p className="font-bold text-neutral-900">Lahore Design Studio</p>
                  <p className="text-neutral-500">M.M. Alam Road, Gulberg III, Lahore, Pakistan</p>
                </div>
                <div className="pt-2">
                  <p className="font-bold text-neutral-900">Karachi Studio & Fitting Salon</p>
                  <p className="text-neutral-500">Bukhari Commercial Area, Phase 6, DHA, Karachi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs">
            {isSubmitted ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-logo font-bold text-xl text-neutral-900 mb-1">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
                  Thank you, {formData.name}. Our customer care team will respond to your inquiry within 12 hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-logo font-bold text-lg text-neutral-900 mb-2">
                  Send Us a Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ayesha Khan"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0300 1234567"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@email.com"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white cursor-pointer"
                    >
                      <option>Order Status & Courier Tracking</option>
                      <option>Size Exchange / Return Request</option>
                      <option>Product Sizing Advice</option>
                      <option>Wholesale / Bulk Inquiry</option>
                      <option>Other Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide order ID or details about the garments you are interested in..."
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#1E1E1E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
