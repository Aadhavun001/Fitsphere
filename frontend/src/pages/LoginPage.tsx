import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Dumbbell, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Please provide your name.');
      return;
    }

    login(email, name);
    navigate('/dashboard'); // Go straight to post-purchase learning dashboard
  };

  return (
    <div className="min-h-screen w-full flex bg-bg-dark pt-16">
      {/* Split Layout: Left Image Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/5">
        <img
          src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200"
          alt="Athlete Training"
          className="absolute inset-0 h-full w-full object-cover filter brightness-75 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-bg-dark via-bg-dark/30 to-transparent" />
        
        {/* Overlay quote */}
        <div className="absolute bottom-16 left-16 right-16 text-left flex flex-col gap-4 z-10">
          <div className="bg-brand-neon p-2 w-fit rounded-xl text-black">
            <Dumbbell className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h2 className="font-display font-black text-4xl text-white uppercase tracking-tight leading-tight">
            Commit to the <br />
            <span className="text-brand-neon text-glow-neon">Evolution of Output</span>
          </h2>
          <p className="text-gray-300 text-sm max-w-sm">
            Access scientific physical education, set progress metrics, and learn kinetic mechanics from elite coaches.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-brand-neon/5 rounded-full filter blur-[80px] pointer-events-none" />

        <div className="max-w-md w-full flex flex-col gap-8 relative z-10">
          
          {/* Logo / Onboarding Header */}
          <div className="text-left flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-brand-neon p-1.5 rounded-lg text-black">
                <Dumbbell className="h-4.5 w-4.5 stroke-[2.5]" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight text-white">
                FIT<span className="text-brand-neon">SPHERE</span>
              </span>
            </Link>

            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mt-4">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
              {isRegister ? 'Join the scientific training hub' : 'Resume your adaptation tracker'}
            </p>
          </div>

          {/* Form */}
          <div className="p-8 rounded-3xl glass-card border border-white/10 shadow-2xl flex flex-col gap-6 text-left">
            {error && (
              <div className="p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4.5 w-4.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isRegister && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="auth-name" className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-brand-neon/50 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth-email" className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white placeholder-gray-500 focus:border-brand-neon/50 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth-password" className="text-xs font-bold text-gray-400 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white placeholder-gray-500 focus:border-brand-neon/50 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 py-3.5 rounded-full bg-brand-neon text-black font-extrabold text-xs uppercase tracking-wider hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(184,255,34,0.15)]"
              >
                {isRegister ? 'Register & Log In' : 'Sign In to Hub'}
              </button>
            </form>

            <div className="text-center text-xs text-gray-500 mt-2">
              {isRegister ? (
                <span>
                  Already have an account?{' '}
                  <button onClick={() => { setIsRegister(false); setError(''); }} className="text-brand-neon font-semibold hover:underline">
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button onClick={() => { setIsRegister(true); setError(''); }} className="text-brand-neon font-semibold hover:underline">
                    Create one free
                  </button>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Sparkles className="h-4 w-4 text-brand-cyan" />
            <span>Mock login session activated. Use any test credentials.</span>
          </div>

        </div>
      </div>
    </div>
  );
};
