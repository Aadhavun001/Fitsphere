import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { Course, Lesson } from '../context/AppContext';
import { Play, CheckSquare, Square, FileText, Plus, Trash2, Award, BookOpen, MessageSquare, ExternalLink, Download, X } from 'lucide-react';
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

  // Certificate & progress update states
  const [showCertModal, setShowCertModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCert, setActiveCert] = useState<any>(null);

  const [certScale, setCertScale] = useState(1);
  const certContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCertModal) return;
    const updateScale = () => {
      if (certContainerRef.current) {
        const width = certContainerRef.current.getBoundingClientRect().width;
        if (width < 760 && width > 0) {
          setCertScale(width / 760);
        } else {
          setCertScale(1);
        }
      }
    };
    updateScale();
    const timer = setTimeout(updateScale, 100);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [showCertModal]);

  const activeCourse = selectedCourse || myCourses[0] || null;
  const activeLesson = selectedLesson || (activeCourse ? activeCourse.curriculum[0]?.lessons[0] : null) || null;

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
  const totalLessonsCount = activeCourse ? activeCourse.curriculum.reduce((acc, sec) => acc + (sec.lessons || []).length, 0) : 0;
  const completedCount = activeCourse ? (completedLessonIds[activeCourse.id] || []).length : 0;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;
  const isCourseCompleted = progressPercent === 100;

  // Helper to trigger custom toast notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync active certificate from Firestore if the course is completed
  useEffect(() => {
    if (isCourseCompleted && user?.email && activeCourse) {
      const userEmail = user.email.toLowerCase();
      const certId = `${userEmail}_${activeCourse.id}`;
      const certRef = doc(db, 'certificates', certId);

      const unsubscribe = onSnapshot(certRef, (snap) => {
        if (snap.exists()) {
          setActiveCert(snap.data());
        } else {
          // Auto-generate certificate doc on the fly if completed but doc is missing
          const verificationCode = `FS-${activeCourse.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const newCert = {
            id: certId,
            userEmail: userEmail,
            userName: user.name,
            courseId: activeCourse.id,
            courseTitle: activeCourse.title,
            issueDate: new Date().toISOString(),
            verificationCode: verificationCode,
            badgeType: 'Gold'
          };
          setDoc(certRef, newCert)
            .then(() => setActiveCert(newCert))
            .catch(err => {
              console.warn('Failed to save certificate to Firestore, using local fallback:', err);
              setActiveCert(newCert);
            });
        }
      }, (error) => {
        console.warn('Firestore onSnapshot for certificate failed, using local fallback:', error);
        const verificationCode = `FS-${activeCourse.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}-LOCAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setActiveCert({
          id: certId,
          userEmail: userEmail,
          userName: user.name,
          courseId: activeCourse.id,
          courseTitle: activeCourse.title,
          issueDate: new Date().toISOString(),
          verificationCode: verificationCode,
          badgeType: 'Gold'
        });
      });
      return () => unsubscribe();
    } else {
      setActiveCert(null);
    }
  }, [isCourseCompleted, user?.email, activeCourse?.id]);

  // Canvas Generation for high-resolution download
  const downloadCertificateAsPNG = () => {
    if (!activeCert || !user || !activeCourse) return;

    // Helper to load images asynchronously
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      });
    };

    // Load all logos before drawing (excluding unused MSME logo)
    Promise.all([
      loadImage('/startup_india_logo.png'),
      loadImage('/fitsphere_logo.png'),
      loadImage('/fitsphere_logo_icon.png'),
      loadImage('/gold_seal.jpg')
    ]).then(([startupImg, fitsphereImg, fitsphereIconImg, goldSealImg]) => {
      // Create high-res canvas (1920x1080) for high quality print
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw Background (Charcoal radial gradient)
      const grad = ctx.createRadialGradient(960, 540, 50, 960, 540, 1100);
      grad.addColorStop(0, '#111827'); 
      grad.addColorStop(1, '#030712'); 
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Decorative corner patterns or ambient border glow
      const glowGrad = ctx.createRadialGradient(960, 540, 10, 960, 540, 600);
      glowGrad.addColorStop(0, 'rgba(217, 119, 6, 0.05)'); 
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1920, 1080);

      // 2. Double gold border
      ctx.strokeStyle = '#D97706'; 
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, 1820, 980);

      ctx.strokeStyle = '#FBBF24'; 
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 70, 1780, 940);

      // Corner decorative lines
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(40, 120); ctx.lineTo(120, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1880, 120); ctx.lineTo(1800, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, 960); ctx.lineTo(120, 1040); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1880, 960); ctx.lineTo(1800, 1040); ctx.stroke();

      // 3. Draw "ESTD. 2016" above logo and FitSphere Banner Logo (centered at x=960, y=140)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(251, 191, 36, 0.7)'; // Gold color
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.fillText('ESTD. 2016', 960, 82);

      ctx.drawImage(fitsphereImg, 960 - 160, 102, 320, 80);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // "CERTIFICATE OF COMPLETION"
      ctx.fillStyle = '#FBBF24'; 
      ctx.font = '900 64px Cinzel, serif';
      ctx.fillText('CERTIFICATE OF COMPLETION', 960, 240);

      ctx.fillStyle = '#9CA3AF'; 
      ctx.font = 'italic 28px "Playfair Display", Georgia, serif';
      ctx.fillText('This is proudly presented to', 960, 340);

      // USER NAME
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 76px "Playfair Display", Georgia, serif';
      ctx.fillText(activeCert.userName, 960, 440);

      // Underline for name
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(660, 495); ctx.lineTo(1260, 495); ctx.stroke();

      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'italic 26px "Playfair Display", Georgia, serif';
      ctx.fillText('for outstanding dedication and mastery of the professional program', 960, 560);

      // COURSE TITLE (Professional text)
      ctx.fillStyle = '#FBBF24'; 
      ctx.font = 'bold 44px Outfit, sans-serif';
      ctx.fillText(activeCert.courseTitle.toUpperCase(), 960, 645);

      ctx.fillStyle = '#6B7280'; 
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.fillText('EVALUATED & CERTIFIED BY THE ELITE COACHING DIVISION', 960, 715);

      // 4. Draw Signatures
      ctx.textAlign = 'left';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.fillText('INSTRUCTOR / PHYSIOLOGIST', 300, 900);
      ctx.fillStyle = '#E5E7EB';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText('Dr. Muthu Saravanan', 300, 860);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(300, 835); ctx.lineTo(550, 835); ctx.stroke();
      
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; 
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(320, 825); ctx.bezierCurveTo(360, 785, 420, 845, 460, 815); ctx.stroke();

      ctx.textAlign = 'right';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.fillText('DIRECTOR OF FITSPHERE', 1620, 900);
      ctx.fillStyle = '#E5E7EB';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText('Aadhavun', 1620, 860);
      
      ctx.beginPath(); ctx.moveTo(1370, 835); ctx.lineTo(1620, 835); ctx.stroke();
      
      ctx.strokeStyle = 'rgba(184, 255, 34, 0.4)'; 
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(1390, 820); ctx.bezierCurveTo(1450, 840, 1500, 795, 1580, 825); ctx.stroke();

      // 5. Draw Seals (FitSphere Icon stamp, Center Gold Seal Rosette, Startup India logo)
      const sealX = 960;
      const sealY = 855;
      
      // Left stamp: FitSphere Browser Logo Icon (replacing MSME registration)
      const leftX = 730;
      const leftY = 855;
      const leftR = 45;

      // Draw black background circle
      ctx.fillStyle = '#000000';
      ctx.beginPath(); 
      ctx.arc(leftX, leftY, leftR, 0, Math.PI * 2); 
      ctx.fill();

      // Stroke border (gold)
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(leftX, leftY, leftR, 0, Math.PI * 2);
      ctx.stroke();

      // Clip and draw fitsphereIconImg
      ctx.save();
      ctx.beginPath();
      ctx.arc(leftX, leftY, leftR - 1, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(fitsphereIconImg, leftX - leftR, leftY - leftR, leftR * 2, leftR * 2);
      ctx.restore();

      // Center Gold Seal Image (replacing text rosette)
      const centerR = 55;
      
      // Draw background circle
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(sealX, sealY, centerR, 0, Math.PI * 2);
      ctx.fill();

      // Clip and draw goldSealImg
      ctx.save();
      ctx.beginPath();
      ctx.arc(sealX, sealY, centerR - 1, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(goldSealImg, sealX - centerR, sealY - centerR, centerR * 2, centerR * 2);
      ctx.restore();

      // Stroke gold border
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(sealX, sealY, centerR, 0, Math.PI * 2);
      ctx.stroke();

      // Right stamp: Startup India logo image
      const startupX = 1190;
      const startupY = 855;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(startupX, startupY, 45, 0, Math.PI * 2); ctx.fill();
      ctx.drawImage(startupImg, startupX - 38, startupY - 38, 76, 76);

      // 6. Verification metadata (moved up slightly)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#4B5563'; 
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`VERIFICATION CODE: ${activeCert.verificationCode}  |  ISSUED: ${new Date(activeCert.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}  |  PORTAL: FITSPHERE.COM`, 960, 985);

      // 7. Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = `${user.name.replace(/\s+/g, '_')}_${activeCourse.title.replace(/\s+/g, '_')}_Certificate.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    }).catch(err => {
      console.error('Failed to load certificate logo images for canvas export:', err);
    });
  };

  // Fetch notes for active lesson
  const activeLessonNotes = activeCourse && activeLesson ? userNotes.filter(
    (note) => note.courseId === activeCourse.id && note.lessonId === activeLesson.id
  ) : [];

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
              <button 
                onClick={() => setShowCertModal(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-yellow-500/30 px-5 py-2.5 rounded-2xl w-fit cursor-pointer transition-all duration-300 group hover:scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.15)] text-left"
              >
                <Award className="h-5 w-5 text-yellow-400 animate-pulse group-hover:scale-110 transition-transform" />
                <div className="text-left text-xs">
                  <div className="text-white font-bold group-hover:text-yellow-400 transition-colors">Certificate Unlocked</div>
                  <span className="text-yellow-400 font-bold text-[10px] uppercase tracking-wider block">🏆 View Gold Certificate</span>
                </div>
              </button>
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
                onEnded={() => {
                  const isLessonCompleted = (completedLessonIds[activeCourse.id] || []).includes(activeLesson.id);
                  if (!isLessonCompleted) {
                    toggleLessonCompleted(activeCourse.id, activeLesson.id);
                    triggerToast(`🎉 Lesson "${activeLesson.title}" completed! Progress updated.`);
                  }
                }}
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

          {/* VIDEO CONTROLS & COMPLETION STATUS BAR */}
          {activeLesson && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-white/10 shadow-xl bg-white/[0.02] backdrop-blur-md">
              <div className="text-left">
                <span className="text-[10px] text-brand-cyan font-bold uppercase tracking-wider block">
                  Now Studying: {activeCourse.curriculum.find(sec => sec.lessons.some(l => l.id === activeLesson.id))?.title || 'Active Unit'}
                </span>
                <h4 className="font-display font-bold text-white text-base sm:text-lg leading-tight mt-0.5">
                  {activeLesson.title}
                </h4>
                <span className="text-xs text-gray-400 font-mono block mt-1">
                  Duration: {activeLesson.duration}
                </span>
              </div>

              <button
                onClick={() => {
                  toggleLessonCompleted(activeCourse.id, activeLesson.id);
                  const isCompletedNow = !(completedLessonIds[activeCourse.id] || []).includes(activeLesson.id);
                  if (isCompletedNow) {
                    triggerToast(`🎉 Lesson "${activeLesson.title}" marked as complete!`);
                  }
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md ${
                  (completedLessonIds[activeCourse.id] || []).includes(activeLesson.id)
                    ? 'bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(34,221,255,0.15)] hover:bg-brand-cyan/30'
                    : 'bg-brand-neon text-black hover:scale-[1.02] shadow-[0_0_15px_rgba(184,255,34,0.15)] hover:shadow-[0_0_20px_rgba(184,255,34,0.25)]'
                }`}
              >
                {(completedLessonIds[activeCourse.id] || []).includes(activeLesson.id) ? (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    Mark as Complete
                  </>
                )}
              </button>
            </div>
          )}

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

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          key="toast-notification"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 bg-[#121926] border border-brand-cyan/20 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,245,160,0.15)] flex items-center gap-3 text-xs max-w-sm"
        >
          <span className="text-xl">🏆</span>
          <div className="text-left">
            <p className="text-white font-bold">Progress Updated</p>
            <p className="text-gray-400 mt-0.5">{toastMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Gold Completion Certificate Modal */}
      {showCertModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-4xl bg-bg-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col gap-6"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Modal Header */}
            <div className="text-left">
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                Your Course Achievement
              </h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">
                FitSphere Elite Program Graduate
              </p>
            </div>

            {!activeCert ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 w-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-neon"></div>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Synchronizing Certificate...</span>
              </div>
            ) : (
              <>
                {/* Certificate Canvas / HTML Preview Container */}
                <div 
                  ref={certContainerRef}
                  className="w-full flex items-center justify-center overflow-hidden py-2"
                  style={{ height: `${427.5 * certScale + 16}px` }}
                >
                  {/* HTML Certificate Preview */}
                  <div 
                    id="fitsphere-certificate-preview"
                    className="min-w-[760px] aspect-[16/9] bg-gradient-to-tr from-gray-900 to-slate-950 border-[5px] border-amber-600 rounded-2xl p-8 relative flex flex-col items-center justify-between shadow-2xl overflow-hidden text-center select-none origin-center"
                    style={{
                      boxShadow: '0 0 40px rgba(245, 158, 11, 0.1)',
                      transform: `scale(${certScale})`,
                    }}
                  >
                    {/* Subtle inner gold border */}
                    <div className="absolute inset-1.5 border border-yellow-400/50 rounded-xl pointer-events-none" />

                    {/* Corner Accents */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-yellow-500" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-yellow-500" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-yellow-500" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-yellow-500" />

                    {/* Top: Logo & Title */}
                    <div className="flex flex-col items-center gap-1 mt-2">
                      <span className="text-[8px] text-yellow-500/70 font-black tracking-[0.25em] uppercase mb-0.5">ESTD. 2016</span>
                      {/* FitSphere Logo Image */}
                      <div className="flex items-center gap-2">
                        <img src="/fitsphere_logo.png" alt="FitSphere Logo" className="h-8 w-auto object-contain" />
                      </div>
                      <h1 className="text-2xl font-black text-yellow-400 tracking-widest uppercase mt-3" style={{ fontFamily: 'Cinzel, serif' }}>
                        Certificate of Completion
                      </h1>
                      <p className="text-[11px] text-gray-400 italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                        This is proudly presented to
                      </p>
                    </div>

                    {/* Middle: Student & Course */}
                    <div className="flex flex-col items-center gap-2">
                      <h2 className="text-4xl font-extrabold text-white italic tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {activeCert.userName}
                      </h2>
                      <div className="w-80 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                      <p className="text-[11px] text-gray-400 italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                        for outstanding dedication and mastery of the professional program
                      </p>
                      <h3 className="text-xl font-black text-yellow-400 font-sans tracking-wide uppercase mt-1">
                        {activeCert.courseTitle}
                      </h3>
                      <p className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase">
                        Evaluated & Certified by the Elite Coaching Division
                      </p>
                    </div>

                    {/* Bottom: Signatures, Stamps, Metadata */}
                    <div className="w-full flex items-end justify-between px-6 mb-2">
                      {/* Instructor Signature */}
                      <div className="flex flex-col items-center w-48 text-[9px] text-gray-500">
                        {/* Placeholder cursive signature using path */}
                        <svg className="w-24 h-8 text-brand-cyan/50 stroke-current fill-none stroke-2 -mb-1" viewBox="0 0 100 30">
                          <path d="M10,20 Q25,5 40,25 T70,10 T90,20" stroke="currentColor" fill="none" strokeWidth={2} />
                        </svg>
                        <div className="w-full h-[1px] bg-white/10 mb-1" />
                        <span className="text-white font-bold">Dr. Muthu Saravanan</span>
                        <span>Instructor / Physiologist</span>
                      </div>

                      {/* Three Seals in the Center */}
                      <div className="flex items-center gap-4 -mb-2">
                        {/* FitSphere Browser Logo Icon (First Circle) */}
                        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center p-0 shadow-md overflow-hidden border border-yellow-500/40">
                          <img src="/fitsphere_logo_icon.png" alt="FitSphere Icon" className="w-full h-full object-cover rounded-full" />
                        </div>

                        {/* Golden Graduate Badge (Interactive Image Seal - Center Circle) */}
                        <motion.div
                          whileHover={{ scale: 1.08, rotateY: 18, rotateX: 18 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          className="w-18 h-18 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center cursor-pointer border border-amber-500 overflow-hidden"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center relative group">
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10 pointer-events-none" />
                            <img src="/gold_seal.jpg" alt="Gold Seal" className="w-full h-full object-cover rounded-full" />
                          </div>
                        </motion.div>

                        {/* Startup India Stamp (Third Circle) */}
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center p-2 shadow-md overflow-hidden border border-amber-600/20">
                          <img src="/startup_india_logo.png" alt="Startup India Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                      </div>

                      {/* Director Signature */}
                      <div className="flex flex-col items-center w-48 text-[9px] text-gray-500">
                        <svg className="w-24 h-8 text-brand-neon/50 stroke-current fill-none stroke-2 -mb-1" viewBox="0 0 100 30">
                          <path d="M15,15 Q35,25 50,10 T85,20 T95,15" stroke="currentColor" fill="none" strokeWidth={2} />
                        </svg>
                        <div className="w-full h-[1px] bg-white/10 mb-1" />
                        <span className="text-white font-bold">Aadhavun</span>
                        <span>Director of FitSphere</span>
                      </div>
                    </div>

                    {/* Security Verification footer */}
                    <div className="absolute bottom-4.5 w-full text-[9px] text-gray-400 font-mono flex items-center justify-center gap-1.5">
                      <span>VERIFICATION CODE: {activeCert.verificationCode}</span>
                      <span>|</span>
                      <span>ISSUED: {new Date(activeCert.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setShowCertModal(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={downloadCertificateAsPNG}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4 stroke-[2.5]" />
                    Download Certificate (PNG)
                  </button>
                </div>
              </>
            )}

          </motion.div>
        </div>
      )}
    </div>
  );
};
