import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Star, Clock, Calendar, Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export const CoursesPage: React.FC = () => {
  const { courses, addToCart, cart, purchasedCourseIds } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const categories = ['All', 'Strength', 'Conditioning', 'Calisthenics', 'Yoga', 'Hybrid'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Filtering Logic
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="w-full bg-bg-dark pt-32 pb-24 px-6 min-h-[90vh]">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-neon/5 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-12 relative z-10">
        {/* Header */}
        <div className="text-left flex flex-col gap-3">
          <span className="text-brand-neon font-bold tracking-widest uppercase text-xs">Training catalog</span>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tight">
            Performance Courses
          </h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Choose your physical specialization. Each course contains hours of high-definition movement guidance, downloadable study guides, and periodized routines.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Search Input */}
          <div className="col-span-1 lg:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by course name or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm text-white placeholder-gray-500 focus:border-brand-neon/50 focus:bg-white/10 outline-none transition-all"
            />
          </div>

          {/* Category Filter Desktop */}
          <div className="col-span-1 lg:col-span-6 flex flex-wrap gap-2 justify-start lg:justify-end">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-brand-neon border-brand-neon text-black'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Layout: Sidebar and Course Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Filters Sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-6 text-left">
            <div className="p-6 rounded-3xl glass-card border border-white/5 flex flex-col gap-6">
              <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <SlidersHorizontal className="h-4 w-4 text-brand-neon" />
                <span className="font-display font-bold text-white text-sm uppercase tracking-wider">Refine Courses</span>
              </div>

              {/* Difficulty filter */}
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-500 font-bold uppercase">Difficulty Level</span>
                <div className="flex flex-col gap-2">
                  {difficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        selectedDifficulty === diff
                          ? 'border-brand-cyan bg-brand-cyan/10 text-white'
                          : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Quick Info Box */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-400 leading-relaxed">
                <div className="font-bold text-white mb-1">Guaranteed Outcomes</div>
                <div>✔ Lifetime Course Access</div>
                <div>✔ Downloadable Progression sheets</div>
                <div>✔ Instructor Community Forum</div>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="lg:col-span-9">
            {filteredCourses.length > 0 ? (
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-6 px-6 md:grid md:grid-cols-2 xl:grid-cols-3 md:overflow-x-visible md:snap-none md:pb-0 md:mx-0 md:px-0 gap-6">
                {filteredCourses.map((course) => {
                  const isCarted = cart.some((item) => item.course.id === course.id);
                  const isOwned = purchasedCourseIds.includes(course.id);

                  return (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="group flex flex-col rounded-3xl glass-card border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 flex-shrink-0 w-[290px] sm:w-[320px] snap-start md:w-auto md:flex-shrink"
                    >
                      <div className="relative h-48 overflow-hidden bg-gray-900">
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

                      <div className="p-5 text-left flex flex-col gap-4 flex-1">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-display font-bold text-white text-base tracking-tight group-hover:text-brand-neon transition-colors duration-200 line-clamp-1">
                            {course.title}
                          </h3>
                          <span className="text-[10px] text-gray-500">by {course.instructor.name}</span>
                          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mt-1">
                            {course.tagline}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-y border-white/5 py-2.5 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {course.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 font-bold uppercase">Price</span>
                            <span className="text-lg font-black text-white">₹{course.price.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="flex gap-1.5">
                            <Link
                              to={`/course/${course.id}`}
                              className="px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors duration-200"
                            >
                              Details
                            </Link>

                            {isOwned ? (
                              <Link
                                  to="/dashboard"
                                  className="px-3.5 py-2 rounded-full bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan text-xs font-bold hover:bg-brand-cyan hover:text-black transition-all duration-200"
                              >
                                View Portal
                              </Link>
                            ) : (
                              <button
                                onClick={() => addToCart(course.id)}
                                disabled={isCarted}
                                className={`px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 ${
                                  isCarted
                                    ? 'bg-white/10 border border-white/5 text-gray-400 cursor-not-allowed'
                                    : 'bg-brand-neon text-black hover:scale-[1.03]'
                                }`}
                              >
                                {isCarted ? 'In Cart' : 'Enroll'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
                <Search className="h-10 w-10 text-gray-600 mb-4" />
                <h3 className="font-display font-bold text-white text-lg">No courses matched</h3>
                <p className="text-gray-500 text-xs mt-1">Try resetting your search query or categories.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
