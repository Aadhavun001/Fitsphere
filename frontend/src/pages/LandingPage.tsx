import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Award,
  Users,
  Target,
  ChevronDown,
  ArrowUpRight,
  Star,
  Activity,
  Flame,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { courses, addToCart, landingConfig } = useApp();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  
  // Interactive Assessment Quiz State
  const [assessmentGoal, setAssessmentGoal] = useState<string | null>(null);
  const [assessmentLevel, setAssessmentLevel] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);

  // Testimonials Carousel State
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const testimonials = landingConfig?.testimonials || [
    {
      name: 'Priya Mani',
      age: 29,
      role: 'CrossFit Athlete & Designer',
      quote: 'The Kettlebell Conditioning course completely transformed my core power and structural joint mobility. My shoulder pain is completely gone, and my kinetic movement feels bulletproof.',
      metrics: { before: 'Mobility Score: 4/10', after: 'Mobility Score: 9/10' },
      avatar: '/testimonial_priya.png',
      course: 'Kettlebell Flow: Athletic Power & Mobility',
      achievement: 'Restored shoulder mobility, added kettlebell snatch load'
    },
    {
      name: 'Vikram Surya',
      age: 34,
      role: 'Software Engineer',
      quote: 'As someone sitting 10 hours a day, the Calisthenics Mastery course helped me reconnect with bodyweight training. I achieved my first full ring muscle-up and my handstand balance feels solid.',
      metrics: { before: 'Muscle-Up: 0 reps', after: 'Muscle-Up: 5 clean reps' },
      avatar: '/testimonial_vikram.png',
      course: 'Calisthenics Mastery: Rings & Bodyweight Strength',
      achievement: 'Gained first ring muscle-up and 10s handstand hold'
    },
    {
      name: 'Dr. Shalini Muthu',
      age: 41,
      role: 'Research Scientist',
      quote: 'Dr. Muthu’s Hypertrophy Masterclass is pure scientific training. The calculations for volume limits and RIR targets removed all guesswork. I gained 4kg of lean muscle in 12 weeks.',
      metrics: { before: 'Squat 1RM: 85kg', after: 'Squat 1RM: 110kg' },
      avatar: '/testimonial_shalini.png',
      course: 'Hypertrophy Masterclass: Science-Backed Muscle Growth',
      achievement: 'Added 4kg lean muscle mass, +25kg squat max'
    }
  ];

  // Auto-scroll testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Handle Assessment Suggestion
  useEffect(() => {
    if (assessmentGoal) {
      let matchedId = '';
      if (assessmentGoal === 'muscle') matchedId = 'hypertrophy-masterclass';
      else if (assessmentGoal === 'conditioning') matchedId = 'kettlebell-conditioning';
      else if (assessmentGoal === 'rings') matchedId = 'calisthenics-mastery';
      else if (assessmentGoal === 'mobility') matchedId = 'yoga-flexibility';
      else if (assessmentGoal === 'hybrid') matchedId = 'hybrid-athlete';

      const match = courses.find(c => c.id === matchedId);
      setAssessmentResult(match || null);
    }
  }, [assessmentGoal, courses]);

  const faqs = [
    {
      question: 'Do I get lifetime access to the courses?',
      answer: 'Yes! Once enrolled in a course, you get lifetime access to all core lectures, video walkthroughs, training templates, and future content updates. There are no recurring monthly subscription costs.'
    },
    {
      question: 'What equipment do I need to follow these courses?',
      answer: 'Equipment requirements vary by discipline. For Calisthenics Mastery, a set of gymnastic rings and pull-up bars is recommended. For Kettlebell Flow, one or two moderate kettlebells are needed. The Hypertrophy Masterclass is fully optimized for a standard gym setup (barbells, dumbbells, cables).'
    },
    {
      question: 'Can I follow multiple courses at the same time?',
      answer: 'While you can, we strongly advise focusing on one training specialization at a time to maximize adaptation. The exception is combining a primary course (e.g. Hypertrophy Masterclass) with our active recovery program (Yoga Flow) on your off-days.'
    },
    {
      question: 'Are the training routines customizable for busy schedules?',
      answer: 'Yes, each course includes a program scaling framework. Instructors provide protocols for 3-day, 4-day, and 5-day workout splits so you can fit your training around your professional commitments without sacrificing mechanical overload.'
    }
  ];

  // Scroll handler to go to specific section
  const scrollToAbout = () => {
    const aboutSec = document.getElementById('about');
    if (aboutSec) {
      aboutSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-bg-dark">
      {/* 1. HOME SECTION (HERO) */}
      <section className="relative min-h-dvh w-full flex items-center justify-center pt-24 px-6 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/10 w-[500px] h-[500px] bg-brand-neon/10 rounded-full filter blur-[150px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-[450px] h-[450px] bg-brand-cyan/5 rounded-full filter blur-[120px] pointer-events-none" />
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <span className="text-brand-neon font-bold tracking-widest uppercase text-sm">
              Science-Backed Performance Portal
            </span>
            
            <h1 className="font-display font-black text-5xl sm:text-6xl xl:text-7.5xl text-white tracking-tight leading-[1.05] uppercase">
              Rewrite Your <br />
              <span className="text-brand-neon text-glow-neon">Physical Limits</span>
            </h1>
            
            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed max-w-xl">
              Access elite training courses created by exercise scientists and competitive athletes. Master mechanics, build raw power, and unlock cellular recovery.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                to="/courses"
                className="px-8 py-4 rounded-full bg-brand-neon text-black font-extrabold text-base hover:scale-[1.03] transition-all duration-300 shadow-[0_0_30px_rgba(184,255,34,0.3)] hover:shadow-[0_0_40px_rgba(184,255,34,0.5)] flex items-center gap-2"
              >
                Explore Courses
                <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
              </Link>
              <button
                onClick={scrollToAbout}
                className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-base hover:bg-white/10 transition-all duration-300"
              >
                About FitSphere
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Card Widget Overlay */}
            <div className="absolute -top-10 -left-6 bg-brand-neon/10 backdrop-blur-md border border-brand-neon/20 p-4 rounded-2xl flex items-center gap-3 z-20 animate-pulse-slow">
              <div className="bg-brand-neon p-2.5 rounded-xl text-black">
                <Flame className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-300">Energy Output</div>
                <div className="text-sm font-bold text-white">4,280 kcal/week</div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3 z-20">
              <div className="bg-brand-cyan p-2.5 rounded-xl text-black">
                <Activity className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-400">CNS Readiness</div>
                <div className="text-sm font-bold text-brand-cyan">94% Optimal</div>
              </div>
            </div>

            <div className="relative glass-card rounded-3xl p-3 border border-white/10 overflow-hidden shadow-2xl">
              <img
                src="/hero_man_lifting.png"
                alt="Elite Training"
                className="w-full h-[450px] object-cover rounded-2xl filter brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-80" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer animate-bounce" onClick={scrollToAbout}>
          <span className="text-xs text-gray-500 font-semibold tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </section>

      {/* 2. ABOUT SECTION (MANDATORY) */}
      <section id="about" className="min-h-dvh w-full flex items-center justify-center py-24 px-6 relative bg-bg-dark border-t border-white/5">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-neon/5 rounded-3xl filter blur-3xl pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800"
              alt="Scientific training approach"
              className="w-full h-[550px] object-cover rounded-3xl border border-white/10 shadow-2xl"
            />
          </div>

          <div className="flex flex-col gap-6 text-left">
            <span className="text-brand-neon font-bold tracking-widest uppercase text-sm">02 / About Us & Philosophy</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight uppercase">
              The Science of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Uncompromising Fitness</span>
            </h2>
            <p className="text-gray-300 leading-relaxed text-base">
              At FitSphere, we reject workout fads and generic routines. Our courses are founded on biomechanics, metabolic adaptation, and sports physiology. Whether you want to build raw physical size or bulletproof your joints, we provide the underlying math and mechanics of physical adaptation.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              {[
                {
                  title: 'Biomechanical Safety',
                  desc: 'Every lift and movement is broken down in 4K multi-angle video showing joint alignments and muscular activation cues.'
                },
                {
                  title: 'Autoregulated Volume',
                  desc: 'Learn how to calibrate set volumes, rest protocols, and load selection relative to central nervous system limits.'
                },
                {
                  title: 'Nutrition Courses',
                  desc: 'Calculate precise macronutrient ratios, intra-workout carbs, and hydration targets tailored to daily load levels.'
                },
                {
                  title: 'Recovery Calibration',
                  desc: 'Incorporate active range of motion, breathwork, and parasympathetic states to accelerate physical rebuilds.'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-5 rounded-2xl bg-white/5 border border-white/5">
                  <CheckCircle2 className="h-5 w-5 text-brand-neon" />
                  <h3 className="font-display font-semibold text-white text-base">{item.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE PILLARS SECTION */}
      <section className="min-h-dvh w-full flex items-center justify-center py-24 px-6 bg-bg-dark border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-cyan/5 rounded-full filter blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full text-center flex flex-col gap-12 relative z-10">
          <div className="flex flex-col gap-3 items-center">
            <span className="text-brand-cyan font-bold tracking-widest uppercase text-sm">03 / Core Disciplines</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white uppercase">
              Our Five Pillars of Performance
            </h2>
            <p className="text-gray-400 text-sm max-w-xl">
              Specialized knowledge tracks designed to work independently or integrate together for hybrid athleticism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              {
                num: '01',
                title: 'Hypertrophy',
                icon: <TrendingUp className="h-6 w-6" />,
                desc: 'Optimize mechanical tension, volume, and diet metrics to expand skeletal muscle tissue.',
                color: 'from-brand-neon to-lime-400'
              },
              {
                num: '02',
                title: 'Conditioning',
                icon: <Flame className="h-6 w-6" />,
                desc: 'Train anaerobic thresholds, cardiovascular output, and joint resiliency using kettlebell loops.',
                color: 'from-orange-500 to-brand-neon'
              },
              {
                num: '03',
                title: 'Calisthenics',
                icon: <Award className="h-6 w-6" />,
                desc: 'Unlock total control of your bodyweight on gymnastic rings, parallel bars, and handstand setups.',
                color: 'from-brand-cyan to-teal-400'
              },
              {
                num: '04',
                title: 'Yoga Flow',
                icon: <Activity className="h-6 w-6" />,
                desc: 'Bulletproof ligaments, stretch tight posterior fascia, and speed recovery via nervous system down-regulation.',
                color: 'from-purple-500 to-indigo-500'
              },
              {
                num: '05',
                title: 'Hybrid',
                icon: <Target className="h-6 w-6" />,
                desc: 'Combine heavy resistance loading splits and cardiovascular zone training without performance drop.',
                color: 'from-brand-neon to-brand-cyan'
              }
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col gap-6 text-left p-8 rounded-3xl glass-card transition-all duration-300 hover:-translate-y-2 border border-white/5 hover:border-white/10"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-3xl bg-gradient-to-r ${pillar.color}`} />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold font-mono">{pillar.num}</span>
                  <div className="text-gray-400 group-hover:text-brand-neon transition-colors duration-300">
                    {pillar.icon}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-display font-bold text-white text-lg group-hover:text-brand-neon transition-colors duration-200">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED COURSES SECTION */}
      <section className="min-h-dvh w-full flex items-center justify-center py-24 px-6 bg-bg-dark border-t border-white/5">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="text-left flex flex-col gap-3">
              <span className="text-brand-neon font-bold tracking-widest uppercase text-sm">04 / Performance Courses</span>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white uppercase">
                Featured Courses
              </h2>
            </div>
            <Link
              to="/courses"
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:border-brand-neon hover:text-brand-neon font-bold text-sm transition-all duration-300 w-fit"
            >
              View All 5 Courses
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:snap-none md:pb-0 md:mx-0 md:px-0 gap-8">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="group flex flex-col rounded-3xl glass-card border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 flex-shrink-0 w-[290px] sm:w-[320px] snap-start md:w-auto md:flex-shrink"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-bg-dark/85 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10 text-xs font-semibold text-brand-neon">
                    {course.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-bg-dark/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 text-[11px] font-bold text-white">
                    <Star className="h-3.5 w-3.5 fill-brand-neon stroke-brand-neon" />
                    {course.rating}
                  </div>
                </div>

                <div className="p-6 text-left flex flex-col gap-4 flex-1">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display font-bold text-white text-lg tracking-tight group-hover:text-brand-neon transition-colors duration-200 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                      {course.tagline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-y border-white/5 py-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {course.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Price</span>
                      <span className="text-xl font-extrabold text-white">₹{course.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/course/${course.id}`}
                        className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors duration-200"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => addToCart(course.id)}
                        className="px-4 py-2.5 rounded-full bg-brand-neon text-black text-xs font-extrabold hover:scale-[1.03] transition-transform duration-100"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LIVE STATISTICS SECTION */}
      <section className="min-h-dvh w-full flex items-center justify-center py-24 px-6 bg-bg-dark border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-brand-neon/5 rounded-full filter blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-6 text-left flex flex-col gap-6">
            <span className="text-brand-cyan font-bold tracking-widest uppercase text-sm">05 / Community Adaptations</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight uppercase leading-[1.1]">
              FitSphere by <br />
              <span className="text-brand-cyan text-glow-neon">The Numbers</span>
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm max-w-md">
              We track performance, adaptation rates, and program metrics across our global athlete portal. When you train on FitSphere, your progress feeds back into optimized training updates.
            </p>
            <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl w-fit">
              <Users className="h-8 w-8 text-brand-cyan" />
              <div>
                <div className="text-white font-bold text-sm">Adaptive Community</div>
                <div className="text-xs text-gray-400">Join 42,000+ active members today</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-6">
            {[
              { 
                label: 'Registered Athletes', 
                value: landingConfig?.stats?.registeredAthletes 
                  ? `${(landingConfig.stats.registeredAthletes / 1000).toFixed(0)}K+` 
                  : '42K+', 
                detail: 'Global active members' 
              },
              { 
                label: 'Completed Lessons', 
                value: landingConfig?.stats?.completedLessons 
                  ? `${(landingConfig.stats.completedLessons / 1000).toFixed(0)}K+` 
                  : '820K+', 
                detail: 'Lectures watched' 
              },
              { 
                label: 'Average Adapt Rate', 
                value: landingConfig?.stats?.averageAdaptRate || '94%', 
                detail: 'Reported progress success' 
              },
              { 
                label: 'Total Reps Lifted', 
                value: landingConfig?.stats?.totalRepsLifted || '14.8M', 
                detail: 'Strength logs submitted' 
              }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3 text-left hover:border-white/10 transition-colors duration-200"
              >
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</span>
                <span className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">{stat.value}</span>
                <span className="text-[11px] text-gray-400 leading-relaxed">{stat.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. EXPERT TRAINERS SECTION */}
      <section id="trainers" className="min-h-dvh w-full flex items-center justify-center py-24 px-6 bg-bg-dark border-t border-white/5">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
          <div className="text-center flex flex-col gap-3 items-center">
            <span className="text-brand-neon font-bold tracking-widest uppercase text-sm">06 / Elite Coaching Staff</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white uppercase">
              Meet Our Specialists
            </h2>
            <p className="text-gray-400 text-sm max-w-xl">
              Learn from scientists, competitive calisthenics champions, and ultra-marathon runners.
            </p>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:overflow-x-visible md:snap-none md:pb-0 md:mx-0 md:px-0 gap-6">
            {(landingConfig?.specialists || courses.map(c => c.instructor)).map((instructor: any, idx: number) => {
              return (
                <div
                  key={idx}
                  className="group flex flex-col rounded-3xl glass-card border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 hover:-translate-y-1.5 flex-shrink-0 w-[250px] sm:w-[280px] snap-start md:w-auto md:flex-shrink"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={instructor.avatar}
                      alt={instructor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="p-5 text-left flex flex-col gap-3">
                    <div className="flex flex-col">
                      <h4 className="font-display font-bold text-white text-base tracking-tight">{instructor.name}</h4>
                      <span className="text-[10px] text-brand-neon font-semibold uppercase">{instructor.role}</span>
                    </div>

                    <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2">
                      {instructor.bio}
                    </p>

                    <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-[10px] text-gray-500">
                      <div>
                        <div className="font-semibold text-white">{instructor.stats?.students || instructor.students || '0'}</div>
                        <div>Students</div>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{(instructor.stats?.rating || instructor.rating || 5.0)} ★</div>
                        <div>Rating</div>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{instructor.stats?.coursesCount || instructor.coursesCount || '0'}</div>
                        <div>Courses</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE FITNESS ASSESSMENT SECTION */}
      <section id="assessment" className="min-h-dvh w-full flex items-center justify-center py-24 px-6 bg-bg-dark border-t border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#b8ff2203,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto w-full text-center flex flex-col gap-12 relative z-10">
          <div className="flex flex-col gap-3 items-center">
            <span className="text-brand-cyan font-bold tracking-widest uppercase text-sm">07 / Smart Alignment</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white uppercase">
              Identify Your Performance Path
            </h2>
            <p className="text-gray-400 text-sm max-w-md">
              Answer two simple variables to dynamically match your physical targets with an elite training course.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/10 text-left flex flex-col gap-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand-neon/5 rounded-full filter blur-[60px] pointer-events-none" />

            {/* Assessment Steps */}
            <div className="flex flex-col gap-6">
              {/* Question 1 */}
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Step 1: Choose Your Primary Focus Goal</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'muscle', label: 'Build Muscle & Power', sub: 'Hypertrophy' },
                    { id: 'conditioning', label: 'Conditioning & Fat Loss', sub: 'Kettlebells' },
                    { id: 'rings', label: 'Bodyweight Mastery', sub: 'Calisthenics' },
                    { id: 'mobility', label: 'Joint Mobility & Core', sub: 'Active Yoga' },
                    { id: 'hybrid', label: 'Double Specialty Split', sub: 'Hybrid Athlete' }
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setAssessmentGoal(goal.id)}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all duration-300 ${
                        assessmentGoal === goal.id
                          ? 'border-brand-neon bg-brand-neon/10 text-white'
                          : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs font-semibold text-white">{goal.sub}</span>
                      <span className="text-[10px] leading-tight text-gray-400">{goal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Step 2: Training Experience Level</span>
                <div className="flex gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setAssessmentLevel(lvl)}
                      className={`px-5 py-2.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
                        assessmentLevel === lvl
                          ? 'border-brand-cyan bg-brand-cyan/10 text-white'
                          : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Assessment Recommendation Output */}
            <AnimatePresence mode="wait">
              {assessmentResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row gap-6 items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={assessmentResult.coverImage}
                      alt={assessmentResult.title}
                      className="h-20 w-28 object-cover rounded-xl border border-white/10 flex-shrink-0"
                    />
                    <div className="text-left flex flex-col gap-1">
                      <span className="text-[10px] text-brand-neon font-bold uppercase tracking-wider">Recommended Matching Course</span>
                      <h4 className="text-base font-bold text-white">{assessmentResult.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-1">{assessmentResult.tagline}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                    <div className="text-right sm:mr-2">
                      <span className="text-[10px] text-gray-500 font-bold block uppercase">Outcomes Matching</span>
                      <span className="text-sm text-brand-cyan font-semibold">98.4% Match Rate</span>
                    </div>
                    <Link
                      to={`/course/${assessmentResult.id}`}
                      className="w-full sm:w-auto px-5 py-3 rounded-full bg-brand-neon text-black font-extrabold text-xs text-center hover:scale-[1.03] transition-transform duration-100"
                    >
                      View Course
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section className="min-h-dvh w-full flex items-center justify-center py-24 px-6 bg-bg-dark border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full filter blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto w-full flex flex-col gap-12 relative z-10">
          <div className="text-center flex flex-col gap-3 items-center">
            <span className="text-brand-neon font-bold tracking-widest uppercase text-sm">08 / Athlete Transformations</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white uppercase">
              Proven Adaptation Stories
            </h2>
          </div>

          <div className="relative glass-card border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col gap-8 min-h-[380px] justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Quote details */}
                <div className="lg:col-span-8 text-left flex flex-col gap-5">
                  <p className="font-display italic text-lg sm:text-xl text-gray-200 leading-relaxed">
                    "{testimonials[testimonialIndex].quote}"
                  </p>

                  <div className="flex flex-col gap-1">
                    <span className="text-brand-neon text-xs font-bold uppercase tracking-wider">{testimonials[testimonialIndex].achievement}</span>
                    <span className="text-[11px] text-gray-500">Program: {testimonials[testimonialIndex].course}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs">
                    <div>
                      <span className="text-gray-500 block uppercase font-semibold text-[10px]">Initial State</span>
                      <span className="text-white font-medium text-sm">{testimonials[testimonialIndex].metrics.before}</span>
                    </div>
                    <div>
                      <span className="text-brand-cyan block uppercase font-semibold text-[10px]">Post adaptation</span>
                      <span className="text-brand-cyan font-bold text-sm">{testimonials[testimonialIndex].metrics.after}</span>
                    </div>
                  </div>
                </div>

                {/* Avatar details */}
                <div className="lg:col-span-4 flex flex-col items-center gap-3">
                  <img
                    src={testimonials[testimonialIndex].avatar}
                    alt={testimonials[testimonialIndex].name}
                    className="h-28 w-28 rounded-full object-cover border-2 border-brand-neon shadow-[0_0_15px_rgba(184,255,34,0.25)]"
                  />
                  <div className="text-center">
                    <h4 className="font-display font-bold text-white text-base">{testimonials[testimonialIndex].name}</h4>
                    <span className="text-xs text-gray-400">{testimonials[testimonialIndex].role}, Age {testimonials[testimonialIndex].age}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Dots */}
            <div className="flex gap-2 justify-center mt-4">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestimonialIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    testimonialIndex === idx ? 'w-8 bg-brand-neon' : 'w-2 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ & CALL TO ACTION SECTION */}
      <section id="faq" className="min-h-dvh w-full flex flex-col justify-center py-24 px-6 bg-bg-dark border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-16 relative z-10">
          <div className="text-center flex flex-col gap-3 items-center">
            <span className="text-brand-cyan font-bold tracking-widest uppercase text-sm">09 / Support & FAQs</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white uppercase">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Accordion */}
          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-display font-semibold text-white text-base hover:bg-white/10 transition-colors duration-200"
                >
                  {faq.question}
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                      activeFAQ === idx ? 'rotate-180 text-brand-cyan' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {activeFAQ === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/5"
                    >
                      <p className="p-6 text-gray-400 text-sm leading-relaxed text-left bg-white/[0.02]">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Final Call to Action */}
          <div className="rounded-3xl bg-gradient-to-r from-brand-neon/10 to-brand-cyan/10 border border-white/10 p-10 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-[300px] h-[300px] bg-brand-neon/5 rounded-full filter blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-[300px] h-[300px] bg-brand-cyan/5 rounded-full filter blur-[100px] pointer-events-none" />

            <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Ready to Define Your Sphere?
            </h3>
            <p className="text-gray-300 text-sm max-w-md leading-relaxed">
              Enroll today and take complete control of your progression metrics. Unlock immediate access to study templates and video curriculums.
            </p>

            <Link
              to="/courses"
              className="px-8 py-4 rounded-full bg-brand-neon text-black font-extrabold text-base hover:scale-[1.03] transition-all duration-300 shadow-[0_0_20px_rgba(184,255,34,0.2)]"
            >
              Get Started Instantly
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
