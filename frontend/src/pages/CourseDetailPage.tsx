import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Star, Clock, Calendar, Check, ChevronDown, User, Shield, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, addToCart, cart, purchasedCourseIds } = useApp();
  const [activeSection, setActiveSection] = useState<number | null>(0);

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <div className="w-full bg-bg-dark pt-40 pb-24 text-center min-h-[80vh]">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-brand-red" />
          <h1 className="text-2xl font-display font-black text-white">Course Not Found</h1>
          <p className="text-gray-400 text-sm">The training course you requested does not exist or has been archived.</p>
          <Link to="/courses" className="px-6 py-3 bg-brand-neon text-black font-bold rounded-full text-xs mt-4">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isCarted = cart.some((item) => item.course.id === course.id);
  const isOwned = purchasedCourseIds.includes(course.id);

  const handleCartAction = () => {
    if (isOwned) {
      navigate(`/dashboard?courseId=${course.id}`);
    } else if (isCarted) {
      navigate('/cart');
    } else {
      addToCart(course.id);
    }
  };

  return (
    <div className="w-full bg-bg-dark pt-32 pb-24 px-6 relative">
      {/* Background glowing accents */}
      <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-brand-cyan/5 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px] bg-brand-neon/5 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Main Content Area (Left Col 8) */}
        <div className="lg:col-span-8 flex flex-col gap-10 text-left">
          
          {/* Path Header */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase">
            <Link to="/courses" className="hover:text-white transition-colors">Catalog</Link>
            <span>/</span>
            <span className="text-brand-neon">{course.category}</span>
          </div>

          {/* Title & Description */}
          <div className="flex flex-col gap-4">
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-brand-cyan text-base font-medium">{course.tagline}</p>
            
            <div className="flex flex-wrap items-center gap-6 mt-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-brand-neon stroke-brand-neon" />
                <span className="text-white font-bold">{course.rating}</span>
                <span>({course.reviewsCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{course.difficulty}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{course.lessonsCount} video lessons</span>
              </div>
            </div>
          </div>

          {/* Banner cover image */}
          <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl h-[350px]">
            <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-60" />
          </div>

          {/* Section: Overview Description */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-bold text-white text-xl uppercase tracking-wider">Course Overview</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>

          {/* Section: Learning Outcomes */}
          <div className="flex flex-col gap-5 p-8 rounded-3xl bg-white/5 border border-white/5">
            <h3 className="font-display font-bold text-white text-base uppercase tracking-wider">What you will learn</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.outcomes.map((outcome, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-brand-neon stroke-[3]" />
                  </div>
                  <span className="text-xs text-gray-300 leading-relaxed">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Curriculum syllabus */}
          <div className="flex flex-col gap-5">
            <h3 className="font-display font-bold text-white text-xl uppercase tracking-wider">Curriculum Syllabus</h3>
            <div className="flex flex-col gap-3">
              {course.curriculum.map((section, sIdx) => (
                <div key={sIdx} className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                  <button
                    onClick={() => setActiveSection(activeSection === sIdx ? null : sIdx)}
                    className="w-full flex items-center justify-between p-5 text-left font-display font-bold text-white text-sm hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <span>{section.title}</span>
                      <span className="text-xs text-gray-500 block font-normal mt-0.5">{section.lessons.length} Videos · {section.duration}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        activeSection === sIdx ? 'rotate-180 text-brand-cyan' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeSection === sIdx && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-white/5 bg-white/[0.01]"
                      >
                        <div className="p-2 flex flex-col">
                          {section.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-xs text-gray-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 font-mono">0{lIdx + 1}</span>
                                <span className="text-white font-medium">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 font-mono">{lesson.duration}</span>
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-400 font-semibold uppercase">
                                  Video
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Instructor */}
          <div className="flex flex-col gap-5 border-t border-white/5 pt-10">
            <h3 className="font-display font-bold text-white text-xl uppercase tracking-wider">Meet the Instructor</h3>
            <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 items-start sm:items-center">
              <img
                src={course.instructor.avatar || course.instructor.avatarUrl || course.instructor.imageUrl || course.instructor.image || '/trainer_muthu.png'}
                alt={course.instructor.name}
                className="h-20 w-20 rounded-full object-cover border-2 border-brand-cyan shadow-xl"
              />
              <div className="flex-1 text-left flex flex-col gap-2">
                <div>
                  <h4 className="font-display font-bold text-white text-lg">{course.instructor.name}</h4>
                  <span className="text-xs text-brand-neon font-semibold uppercase">{course.instructor.role}</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{course.instructor.bio}</p>
                <div className="flex gap-6 mt-1 text-[11px] text-gray-500 font-semibold">
                  <div>Students: <span className="text-white">{course.instructor.stats.students}</span></div>
                  <div>Avg Rating: <span className="text-white">{course.instructor.stats.rating} ★</span></div>
                  <div>Courses: <span className="text-white">{course.instructor.stats.coursesCount}</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Purchase Card Sidebar (Right Col 4) */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
          <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-2xl flex flex-col gap-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-brand-neon/5 rounded-full filter blur-[60px] pointer-events-none" />

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Instant Access Enrollment</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">₹{course.price.toLocaleString('en-IN')}</span>
                <span className="text-xs text-gray-500 line-through">₹{(course.price * 1.6).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                <span className="text-[10px] bg-brand-neon/10 border border-brand-neon/20 px-2 py-0.5 rounded text-brand-neon font-bold">40% OFF</span>
              </div>
            </div>

            <hr className="border-white/5" />

            <button
              onClick={handleCartAction}
              className={`w-full py-4 rounded-full font-extrabold text-sm text-center flex items-center justify-center gap-2 transition-all duration-300 ${
                isOwned
                  ? 'bg-brand-cyan text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(0,245,160,0.2)]'
                  : isCarted
                  ? 'bg-white/10 border border-white/10 text-white hover:bg-white/20'
                  : 'bg-brand-neon text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(184,255,34,0.2)]'
              }`}
            >
              {isOwned ? 'Start Training' : isCarted ? 'Go to Cart' : 'Enroll in Course'}
            </button>

            <div className="flex flex-col gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-brand-cyan" />
                <span>14-day Adaptation Guarantee</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-brand-cyan" />
                <span>Direct Q&A support from instructor</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-brand-cyan" />
                <span>Includes 12 Excel / PDF progress sheets</span>
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="text-[10px] text-gray-500 leading-relaxed text-center">
              Secure Checkout encrypted. Adapt or get a full refund within 14 days.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
