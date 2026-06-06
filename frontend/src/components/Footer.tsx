import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowRight, Globe, Video, Send, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-bg-dark border-t border-white/5 pt-20 pb-10 px-6 overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-brand-neon/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-brand-cyan/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/5">
          {/* Brand Info */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-brand-neon p-2 rounded-xl text-black">
                <Dumbbell className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                FIT<span className="text-brand-neon text-glow-neon">SPHERE</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              FitSphere is an elite, science-backed athletic training and digital learning platform. We empower individuals to rewrite their physical limits through custom movement education, hypertrophy, and hybrid fitness.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Globe className="h-4 w-4" />, href: 'https://instagram.com' },
                { icon: <Video className="h-4 w-4" />, href: 'https://youtube.com' },
                { icon: <Send className="h-4 w-4" />, href: 'https://twitter.com' },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:border-brand-neon hover:text-brand-neon transition-all duration-300"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links 1 - Explore */}
          <div className="col-span-1 sm:col-span-4 lg:col-span-2 flex flex-col gap-5">
            <h4 className="font-display font-semibold text-white tracking-wider text-sm uppercase">Explore</h4>
            <div className="flex flex-col gap-3">
              <Link to="/courses" className="text-gray-400 text-sm hover:text-brand-neon transition-all duration-200">All Courses</Link>
              <Link to="/" className="text-gray-400 text-sm hover:text-brand-neon transition-all duration-200">About Us</Link>
              <Link to="/#trainers" className="text-gray-400 text-sm hover:text-brand-neon transition-all duration-200">Our Instructors</Link>
              <Link to="/#assessment" className="text-gray-400 text-sm hover:text-brand-neon transition-all duration-200">Goal Assessment</Link>
            </div>
          </div>

          {/* Links 2 - Support */}
          <div className="col-span-1 sm:col-span-4 lg:col-span-2 flex flex-col gap-5">
            <h4 className="font-display font-semibold text-white tracking-wider text-sm uppercase">Support</h4>
            <div className="flex flex-col gap-3">
              <Link to="/#faq" className="text-gray-400 text-sm hover:text-brand-neon transition-all duration-200">FAQ Directory</Link>
              <a href={`mailto:${useApp().footerConfig?.emailAddress || 'support@fitsphere.com'}`} className="text-gray-400 text-sm hover:text-brand-neon transition-all duration-200">Help Center</a>
              <span className="text-gray-500 text-sm">Mon - Fri: 8 AM - 6 PM</span>
              <span className="text-gray-500 text-sm">{useApp().footerConfig?.phoneNumber || '+1 (800) FIT-SPHR'}</span>
            </div>
          </div>

          {/* Newsletter Input */}
          <div className="col-span-1 sm:col-span-4 lg:col-span-4 flex flex-col gap-5">
            <h4 className="font-display font-semibold text-white tracking-wider text-sm uppercase">Newsletter</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Subscribe to get scientific workout protocols, exclusive discounts, and new course alerts.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                required
                placeholder={subscribed ? 'Subscribed Successfully!' : 'Enter your email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribed}
                className={`w-full bg-white/5 border px-5 py-3 rounded-full text-sm outline-none transition-all duration-300 ${
                  subscribed
                    ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5 placeholder-brand-cyan'
                    : 'border-white/10 text-white placeholder-gray-500 focus:border-brand-neon/60 focus:bg-white/10'
                }`}
              />
              <button
                type="submit"
                disabled={subscribed}
                className="absolute right-1.5 top-1.5 p-2 rounded-full bg-brand-neon hover:scale-105 text-black transition-all duration-200"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 text-gray-500 text-xs">
          <span>&copy; {new Date().getFullYear()} FitSphere Inc. All rights reserved.</span>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 fill-brand-neon stroke-brand-neon text-brand-neon" />
            <span>for elite physical performance.</span>
          </div>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-white transition-colors duration-200">Terms of Use</a>
            <a href="#privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
