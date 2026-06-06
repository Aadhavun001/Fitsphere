import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Course, Lesson } from '../context/AppContext';
import { Play, CheckSquare, Square, FileText, Plus, Trash2, Award, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, setDoc, doc } from 'firebase/firestore';

export const DashboardPage: React.FC = () => {
  const {
    courses,
    purchasedCourseIds,
    completedLessonIds,
    toggleLessonCompleted,
    userNotes,
    addNote,
    deleteNote,
    user
  } = useApp();

  const myCourses = courses.filter((c) => purchasedCourseIds.includes(c.id));
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(myCourses[0] || null);
  
  // Find first uncompleted lesson, or default to first lesson
  const getFirstLesson = (course: Course | null) => {
    if (!course) return null;
    const completed = completedLessonIds[course.id] || [];
    for (const section of course.curriculum) {
      for (const lesson of section.lessons) {
        if (!completed.includes(lesson.id)) return lesson;
      }
    }
    return course.curriculum[0]?.lessons[0] || null;
  };

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(getFirstLesson(myCourses[0]));
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'resources' | 'notes' | 'forum'>('resources');
  
  // Custom video player play status
  const [isPlaying, setIsPlaying] = useState(false);

  // Q&A Forum posts state
  const [forumPosts, setForumPosts] = useState<Array<{ id: string; user: string; text: string; date: string }>>([]);
  const [newQuestion, setNewQuestion] = useState('');

  if (!user) {
    return (
      <div className="w-full bg-bg-dark pt-40 pb-24 text-center min-h-[85vh]">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          <Award className="h-12 w-12 text-gray-500" />
          <h2 className="text-xl font-display font-bold text-white uppercase">Please Sign In</h2>
          <p className="text-gray-400 text-sm">Please sign in to access your learning portal, courses, and checklists.</p>
          <Link to="/login" className="px-6 py-3 bg-brand-neon text-black font-bold rounded-full text-xs mt-4">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (myCourses.length === 0) {
    return (
      <div className="w-full bg-bg-dark pt-40 pb-24 text-center min-h-[85vh]">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          <Award className="h-12 w-12 text-gray-500" />
          <h2 className="text-xl font-display font-bold text-white uppercase">Learning Portal Empty</h2>
          <p className="text-gray-400 text-sm">You have not purchased any courses yet. Please browse our training catalog to unlock your portal.</p>
        </div>
      </div>
    );
  }

  const activeCourse = selectedCourse || myCourses[0];
  const activeLesson = selectedLesson || activeCourse.curriculum[0]?.lessons[0];

  // Subscribe to Q&A Forum posts dynamically
  useEffect(() => {
    if (!activeCourse) return;

    const q = query(
      collection(db, 'forum'),
      where('courseId', '==', activeCourse.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          user: data.user,
          text: data.text,
          date: data.date || 'Just now',
          timestamp: data.timestamp
        });
      });

      posts.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });

      if (posts.length === 0) {
        setForumPosts([
          { id: 'f-1', user: 'Liam Peterson', text: 'Is it normal to feel central nervous system fatigue during Week 3? My RPE feels much higher than normal.', date: '2 hours ago' },
          { id: 'f-2', user: 'Dr. Muthu Saravanan', text: 'Yes, Liam. Week 3 is our accumulative load week. Ensure you scale back sets if HRV drops by more than 15%. Recovery protocols are in Lesson 8.', date: '1 hour ago' }
        ]);
      } else {
        setForumPosts(posts);
      }
    }, (err) => {
      console.warn('Failed to subscribe to forum posts:', err);
    });

    return () => unsubscribe();
  }, [activeCourse?.id]);

  // Calculate progress
  const totalLessonsCount = activeCourse.curriculum.reduce((acc, sec) => acc + sec.lessons.length, 0);
  const completedCount = (completedLessonIds[activeCourse.id] || []).length;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;
  const isCourseCompleted = progressPercent === 100;

  // Fetch notes for active lesson
  const activeLessonNotes = userNotes.filter(
    (note) => note.courseId === activeCourse.id && note.lessonId === activeLesson?.id
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteText.trim() && activeLesson) {
      addNote(activeCourse.id, activeLesson.id, activeLesson.title, noteText);
      setNoteText('');
    }
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim() && user) {
      try {
        await setDoc(doc(collection(db, 'forum')), {
          courseId: activeCourse.id,
          user: user.name,
          text: newQuestion,
          date: 'Just now',
          timestamp: new Date()
        });
        setNewQuestion('');
      } catch (err) {
        console.warn('Failed to post question to Firestore:', err);
        setForumPosts(prev => [
          {
            id: `f-${Date.now()}`,
            user: `${user.name} (You)`,
            text: newQuestion,
            date: 'Just now'
          },
          ...prev
        ]);
        setNewQuestion('');
      }
    }
  };

  const selectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedLesson(getFirstLesson(course));
    setIsPlaying(false);
  };

  return (
    <div className="w-full bg-bg-dark pt-24 min-h-screen text-left flex flex-col lg:flex-row">
      
      {/* 1. Portal Left Sidebar: Owned Courses Selector (width 320px) */}
      <div className="w-full lg:w-[300px] border-r border-white/5 lg:min-h-[calc(100vh-6rem)] bg-bg-dark/40 flex flex-col p-6 gap-6 flex-shrink-0">
        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
          <BookOpen className="h-5 w-5 text-brand-neon" />
          <span className="font-display font-bold text-white text-sm uppercase tracking-wider">Your Courses</span>
        </div>

        <div className="flex flex-col gap-3">
          {myCourses.map((course) => {
            const courseCompletedCount = (completedLessonIds[course.id] || []).length;
            const courseTotalCount = course.curriculum.reduce((acc, sec) => acc + sec.lessons.length, 0);
            const courseProgress = courseTotalCount > 0 ? Math.round((courseCompletedCount / courseTotalCount) * 100) : 0;
            const isSelected = activeCourse.id === course.id;

            return (
              <button
                key={course.id}
                onClick={() => selectCourse(course)}
                className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                  isSelected
                    ? 'bg-white/5 border-brand-neon'
                    : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-brand-neon' : 'text-gray-500'}`}>
                  {course.category}
                </span>
                <span className="font-display font-semibold text-white text-sm leading-tight line-clamp-1">
                  {course.title}
                </span>
                
                {/* Progress bar info */}
                <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
                  <div className="w-4/5 bg-white/10 h-1 rounded-full overflow-hidden mr-3">
                    <div className="bg-brand-cyan h-full rounded-full" style={{ width: `${courseProgress}%` }} />
                  </div>
                  <span className="font-bold font-mono">{courseProgress}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Portal Workspace: Active Course & Video Player (Flex 1) */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        
        {/* Main Workspace Frame (Col 8) */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-8 min-w-0">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <span className="text-[10px] text-brand-neon font-bold uppercase tracking-wider">{activeCourse.category} Track</span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight mt-1">
                {activeCourse.title}
              </h2>
            </div>
            
            {/* Dynamic circular certificate button if completed */}
            {isCourseCompleted ? (
              <div className="flex items-center gap-3 bg-brand-cyan/15 border border-brand-cyan/20 px-4 py-2 rounded-2xl w-fit">
                <Award className="h-5 w-5 text-brand-cyan" />
                <div className="text-left text-xs">
                  <div className="text-white font-bold">Certificate Unlocked</div>
                  <button className="text-brand-cyan font-bold hover:underline text-[10px]">Download PDF</button>
                </div>
              </div>
            ) : (
              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Course Progress</span>
                <span className="text-lg font-black text-white">{progressPercent}%</span>
              </div>
            )}
          </div>

          {/* MOCK VIDEO PLAYER */}
          <div className="relative rounded-3xl overflow-hidden aspect-video bg-black border border-white/10 shadow-2xl flex items-center justify-center">
            {isPlaying && activeLesson ? (
              <video
                src={activeLesson.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4 bg-cover bg-center"
                style={{ backgroundImage: activeLesson?.thumbnailUrl ? `url(${activeLesson.thumbnailUrl})` : 'none' }}
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="bg-brand-neon/15 border border-brand-neon/30 p-5 rounded-full text-brand-neon cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsPlaying(true)}>
                    <Play className="h-8 w-8 fill-brand-neon" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">
                      {activeLesson?.title || 'Select a lesson to begin'}
                    </h3>
                    <span className="text-xs text-gray-300">Duration: {activeLesson?.duration}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TABBED INTERACTION INTERFACES */}
          <div className="flex flex-col gap-6">
            
            {/* Tab select headers */}
            <div className="flex gap-6 border-b border-white/5 pb-2.5">
              {[
                { id: 'resources', label: 'Study Resources' },
                { id: 'notes', label: 'My Training Notes' },
                { id: 'forum', label: 'Q&A Forum' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all ${
                    activeTab === tab.id
                      ? 'text-brand-neon border-b-2 border-brand-neon'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[220px]">
              
              {/* Tab 1: Resources */}
              {activeTab === 'resources' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                  {(activeCourse.resources || [
                    { title: '12-Week Periodized Sheet.xlsx', description: 'Volume tracking and RPE logs', downloadUrl: '#download' },
                    { title: 'Scientific Nutrition Guide.pdf', description: 'Macronutrient formulas and hydration charts', downloadUrl: '#download' }
                  ]).map((res, index) => (
                    <div key={index} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-brand-cyan" />
                        <div>
                          <div className="text-white font-bold">{res.title}</div>
                          <span className="text-[10px] text-gray-500">{res.description}</span>
                        </div>
                      </div>
                      <a href={res.downloadUrl} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:text-brand-cyan transition-colors">
                        <ExternalLink className="h-4.5 w-4.5" />
                      </a>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Tab 2: Personal Notes */}
              {activeTab === 'notes' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                  {/* Note Entry */}
                  <form onSubmit={handleAddNote} className="flex gap-3">
                    <input
                      type="text"
                      placeholder={`Add personal training note for "${activeLesson?.title}"...`}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-brand-neon/50 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      className="px-5 rounded-xl bg-brand-neon text-black font-bold text-xs flex items-center gap-1.5 hover:scale-[1.02] transition-transform"
                    >
                      <Plus className="h-4 w-4" /> Add Note
                    </button>
                  </form>

                  {/* Notes List */}
                  <div className="flex flex-col gap-3">
                    {activeLessonNotes.length > 0 ? (
                      activeLessonNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-left"
                        >
                          <div className="flex flex-col gap-1.5 flex-1 pr-4">
                            <p className="text-gray-300 leading-relaxed">{note.text}</p>
                            <span className="text-[10px] text-gray-500">{note.timestamp}</span>
                          </div>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-500 text-xs italic">
                        No training notes recorded yet for this lesson.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Q&A Forum */}
              {activeTab === 'forum' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                  {/* Post question */}
                  <form onSubmit={handlePostQuestion} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Ask the instructor/community a question..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-brand-cyan/50 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      className="px-5 rounded-xl bg-brand-cyan text-black font-bold text-xs flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-4 w-4" /> Post
                    </button>
                  </form>

                  {/* Questions Grid */}
                  <div className="flex flex-col gap-4">
                    {forumPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-5 rounded-2xl bg-white/5 border border-white/5 text-xs text-left flex flex-col gap-2"
                      >
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className={post.user.includes('Coach') ? 'text-brand-neon' : 'text-white'}>
                            {post.user}
                          </span>
                          <span className="text-gray-500">{post.date}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{post.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>
          </div>

        </div>

        {/* 3. Portal Right Sidebar: Curriculum Navigation Checklist (width 320px) */}
        <div className="w-full lg:w-[320px] border-l border-white/5 lg:min-h-[calc(100vh-6rem)] bg-bg-dark/40 flex flex-col p-6 gap-6 flex-shrink-0">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <CheckSquare className="h-5 w-5 text-brand-cyan" />
            <span className="font-display font-bold text-white text-sm uppercase tracking-wider">Workout Curriculum</span>
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto max-h-[600px] scrollbar-none pr-1">
            {activeCourse.curriculum.map((section, sIdx) => (
              <div key={sIdx} className="flex flex-col gap-2.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pb-1 border-b border-white/5">
                  {section.title}
                </span>

                <div className="flex flex-col gap-1.5">
                  {section.lessons.map((lesson) => {
                    const isLessonCompleted = (completedLessonIds[activeCourse.id] || []).includes(lesson.id);
                    const isCurrent = activeLesson?.id === lesson.id;

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-white/5 border-brand-neon/30 text-white'
                            : 'bg-white/[0.01] border-white/5 text-gray-300 hover:border-white/10'
                        }`}
                      >
                        {/* Toggle Checkbox */}
                        <button
                          onClick={() => toggleLessonCompleted(activeCourse.id, lesson.id)}
                          className={`p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 transition-colors ${
                            isLessonCompleted
                              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                              : 'bg-white/5 border border-white/10 text-gray-500 hover:text-white'
                          }`}
                        >
                          {isLessonCompleted ? (
                            <CheckSquare className="h-3.5 w-3.5" />
                          ) : (
                            <Square className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setIsPlaying(false);
                          }}
                          className="flex-1 text-left flex flex-col gap-0.5"
                        >
                          <span className={`text-xs font-semibold leading-tight line-clamp-2 ${isCurrent ? 'text-brand-neon' : 'text-white'}`}>
                            {lesson.title}
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono">{lesson.duration}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
