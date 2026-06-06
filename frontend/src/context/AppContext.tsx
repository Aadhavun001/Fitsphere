import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl?: string; // Video thumbnail picture URL
}

export interface CurriculumSection {
  title: string;
  duration: string;
  lessons: Lesson[];
}

export interface Instructor {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  stats: {
    students: string;
    rating: number;
    coursesCount: number;
  };
}

export interface CourseResource {
  title: string;
  description: string;
  downloadUrl: string;
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  instructor: Instructor;
  price: number;
  rating: number;
  reviewsCount: number;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonsCount: number;
  coverImage: string;
  category: 'Strength' | 'Conditioning' | 'Calisthenics' | 'Yoga' | 'Hybrid';
  outcomes: string[];
  curriculum: CurriculumSection[];
  resources?: CourseResource[];
}

export interface CartItem {
  course: Course;
  quantity: number;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  weight?: string;
  height?: string;
  targetWeight?: string;
}

export interface UserNote {
  id: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  text: string;
  timestamp: string;
}

export interface AppContextType {
  courses: Course[];
  cart: CartItem[];
  user: User | null;
  purchasedCourseIds: string[];
  completedLessonIds: Record<string, string[]>; // courseId -> lessonIds[]
  userNotes: UserNote[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string, name: string) => void;
  logout: () => void;
  updateProfile: (updatedUser: Partial<User>) => void;
  addToCart: (courseId: string) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  purchaseCourses: () => void;
  toggleLessonCompleted: (courseId: string, lessonId: string) => void;
  addNote: (courseId: string, lessonId: string, lessonTitle: string, text: string) => void;
  deleteNote: (noteId: string) => void;

  // Dynamic CMS fields
  landingConfig: {
    stats: {
      registeredAthletes: number;
      completedLessons: number;
      averageAdaptRate: string;
      totalRepsLifted: string;
    };
    testimonials: any[];
    specialists?: any[];
  } | null;
  footerConfig: {
    phoneNumber: string;
    emailAddress: string;
  } | null;
  loading: boolean;
  addCourse: (newCourse: Course) => Promise<void>;
  updateCourse: (courseId: string, updatedFields: Partial<Course>) => Promise<void>;
}

const initialCourses: Course[] = [
  {
    id: 'hypertrophy-masterclass',
    title: 'Hypertrophy Masterclass: Science-Backed Muscle Growth',
    tagline: 'Unlock optimal muscle growth using evidence-based training principles.',
    description: 'Transform your physique with deep-dives into mechanical tension, target muscle recruitment, and advanced progressive overload methods. Skip the gym myths and build muscle with pure exercise science.',
    price: 5999,
    rating: 4.9,
    reviewsCount: 384,
    duration: '12 Weeks',
    difficulty: 'Advanced',
    lessonsCount: 15,
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    category: 'Strength',
    outcomes: [
      'Master the mechanics of hypertrophy and muscular hypertrophy science',
      'Optimize volume, frequency, and load selection for target body parts',
      'Understand how to properly measure and hit RPE and RIR targets',
      'Design customized, advanced programs for intermediate and elite lifters'
    ],
    instructor: {
      name: 'Dr. Muthu Saravanan',
      role: 'Exercise Physiologist & Professional Coach',
      avatar: '/trainer_muthu.png',
      bio: 'Dr. Saravanan holds a Ph.D. in Exercise Physiology from Madras Medical College and has spent 15+ years training national-level athletes in Tamil Nadu. His science-first approach cuts through fitness myths.',
      stats: { students: '42K+', rating: 4.9, coursesCount: 3 }
    },
    curriculum: [
      {
        title: 'Phase 1: Foundations of Hypertrophy Science',
        duration: '3 hours',
        lessons: [
          { id: 'hyp-1', title: 'Mechanical Tension vs. Metabolic Stress', duration: '22:15', videoUrl: '/muscle_hypertrophy_science.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400' },
          { id: 'hyp-2', title: 'Understanding Reps in Reserve (RIR) & RPE', duration: '18:40', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400' },
          { id: 'hyp-3', title: 'Volume Selection: Maintenance vs. Maximum Adaptive Volume', duration: '28:10', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400' }
        ]
      },
      {
        title: 'Phase 2: Exercise Mechanics & Execution',
        duration: '4.5 hours',
        lessons: [
          { id: 'hyp-4', title: 'Biomechanical Setup: Squats, Hinges, & Presses', duration: '35:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400' },
          { id: 'hyp-5', title: 'Stimulus-to-Fatigue Ratio (SFR) and Selection', duration: '25:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400' },
          { id: 'hyp-6', title: 'Mind-Muscle Connection: EMG vs. Real Tension', duration: '21:05', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400' }
        ]
      },
      {
        title: 'Phase 3: Program Design & Diet',
        duration: '3 hours',
        lessons: [
          { id: 'hyp-7', title: 'Macro Periodization for Hypertrophy Cycles', duration: '32:45', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400' },
          { id: 'hyp-8', title: 'Hypertrophy Nutrition: Surplus, Protein Synthesis, & Timing', duration: '29:50', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400' }
        ]
      }
    ],
    resources: [
      { title: '12-Week Periodized Sheet.xlsx', description: 'Volume tracking and RPE logs', downloadUrl: '#download' },
      { title: 'Scientific Nutrition Guide.pdf', description: 'Macronutrient formulas and hydration charts', downloadUrl: '#download' }
    ]
  },
  {
    id: 'kettlebell-conditioning',
    title: 'Kettlebell Flow: Athletic Power & Mobility',
    tagline: 'Combine explosive conditioning and deep structural mobility.',
    description: 'Learn dynamic kettlebell flows that build core strength, endurance, and mobile joints. Perfect for functional fitness enthusiasts looking to gain work capacity and look athletic.',
    price: 3499,
    rating: 4.8,
    reviewsCount: 198,
    duration: '6 Weeks',
    difficulty: 'Intermediate',
    lessonsCount: 10,
    coverImage: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800',
    category: 'Conditioning',
    outcomes: [
      'Master the basic kettlebell swing, clean, snatch, and Turkish get-up',
      'Construct energy system training protocols using kettlebells',
      'Build core stability and bulletproof shoulder joints',
      'Create dynamic transitions between kettlebell exercises'
    ],
    instructor: {
      name: 'Kavitha Rajendran',
      role: 'Functional Movement Coach & RKC Specialist',
      avatar: '/trainer_kavitha.png',
      bio: 'Kavitha is a Chennai-based functional movement coach and Russian Kettlebell Certified (RKC) specialist. She blends gymnastics with explosive ballistic work to build joint longevity.',
      stats: { students: '18K+', rating: 4.8, coursesCount: 2 }
    },
    curriculum: [
      {
        title: 'Section 1: The Ballistic Movements',
        duration: '2 hours',
        lessons: [
          { id: 'kb-1', title: 'The Hip Hinge & Two-Handed Swing Basics', duration: '19:40', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400' },
          { id: 'kb-2', title: 'Single Arm Swings & Hand-to-Hand Transitions', duration: '15:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400' },
          { id: 'kb-3', title: 'The Kettlebell Clean: Taming the Arc', duration: '22:10', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400' }
        ]
      },
      {
        title: 'Section 2: Overhead Work & Grinds',
        duration: '2.5 hours',
        lessons: [
          { id: 'kb-4', title: 'Military Press & Overhead Lockout Alignment', duration: '18:50', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400' },
          { id: 'kb-5', title: 'The Turkish Get-Up: Step-by-Step Breakdown', duration: '31:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400' }
        ]
      }
    ],
    resources: [
      { title: 'Kettlebell Conditioning Tracker.xlsx', description: 'Flow sequence repetition tracker', downloadUrl: '#download' },
      { title: 'Mobility Screening Checklist.pdf', description: 'Joint range assessment guidelines', downloadUrl: '#download' }
    ]
  },
  {
    id: 'calisthenics-mastery',
    title: 'Calisthenics Mastery: Rings & Bodyweight Strength',
    tagline: 'Build relative strength and master advanced bodyweight elements.',
    description: 'Break free from commercial gym machines. Train with gymnastic rings and parallel bars to master handstands, muscle-ups, L-sits, and build an aesthetic, powerful upper body.',
    price: 4499,
    rating: 4.95,
    reviewsCount: 245,
    duration: '10 Weeks',
    difficulty: 'Intermediate',
    lessonsCount: 12,
    coverImage: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&q=80&w=800',
    category: 'Calisthenics',
    outcomes: [
      'Master gymnastic ring control and the false grip technique',
      'Learn progression paths for the Handstand and L-Sit',
      'Unlock the Ring Muscle-Up with proper transition mechanics',
      'Build exceptional scapular stability, core compression, and pull strength'
    ],
    instructor: {
      name: 'Arun Karthik',
      role: 'Elite Calisthenics Competitor & Coach',
      avatar: '/trainer_arun.png',
      bio: 'Arun is an elite calisthenics competitor from Coimbatore. He specializes in ring mechanics, planches, and handbalancing, helping traditional lifters transition to bodyweight mastery.',
      stats: { students: '22K+', rating: 4.95, coursesCount: 2 }
    },
    curriculum: [
      {
        title: 'Unit 1: The Ring Setup & Support Hold',
        duration: '1.8 hours',
        lessons: [
          { id: 'cal-1', title: 'Ring Setup, Heights, and False Grip Mechanics', duration: '14:30', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&q=80&w=400' },
          { id: 'cal-2', title: 'Developing the Active Support Hold (Rings Turned Out)', duration: '18:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&q=80&w=400' },
          { id: 'cal-3', title: 'Scapular Pull-ups & Core Compression Drills', duration: '20:45', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&q=80&w=400' }
        ]
      },
      {
        title: 'Unit 2: The Muscle-Up & Dynamic Power',
        duration: '2.4 hours',
        lessons: [
          { id: 'cal-4', title: 'The Muscle-Up Transition: Pulling to the Chest', duration: '24:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&q=80&w=400' },
          { id: 'cal-5', title: 'Deep Ring Dips & Shoulder Flexion Safety', duration: '19:50', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&q=80&w=400' }
        ]
      }
    ],
    resources: [
      { title: 'Ring Strength Progression Template.xlsx', description: 'Scapula hold timing sheet', downloadUrl: '#download' },
      { title: 'False Grip Preparation Guide.pdf', description: 'Wrist flexibility routines', downloadUrl: '#download' }
    ]
  },
  {
    id: 'yoga-flexibility',
    title: 'Yoga Flow: Deep Flexibility & Mindful Recovery',
    tagline: 'Restore joint health, release tension, and build core alignment.',
    description: 'An active, deep recovery flow program designed for athletes. Restore tight hamstrings, open stiff hips, build rotational core strength, and master deep breathing.',
    price: 2499,
    rating: 4.7,
    reviewsCount: 112,
    duration: '4 Weeks',
    difficulty: 'Beginner',
    lessonsCount: 8,
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    category: 'Yoga',
    outcomes: [
      'Increase active range of motion in the hips, spine, and shoulders',
      'Optimize parasympathetic nervous activation for enhanced recovery',
      'Develop isometric core strength and balance stability',
      'Integrate breath control with flow transitions'
    ],
    instructor: {
      name: 'Ananya Krishnan',
      role: 'Yoga Therapist & Meditation Facilitator',
      avatar: '/trainer_ananya.png',
      bio: 'Ananya trained in traditional yoga at Krishnamacharya Yoga Mandiram in Chennai. She merges traditional vinyasa with modern biomechanics to accelerate recovery.',
      stats: { students: '12K+', rating: 4.7, coursesCount: 4 }
    },
    curriculum: [
      {
        title: 'Module 1: Opening the Stiff Posterior Chain',
        duration: '1.5 hours',
        lessons: [
          { id: 'yog-1', title: 'Active Hamstring Lengthening & Pelvic Tilt', duration: '20:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400' },
          { id: 'yog-2', title: 'Hip Openers: Pigeon Progression & Low Lunge Work', duration: '25:30', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400' }
        ]
      },
      {
        title: 'Module 2: Spinal Health & Core Balance',
        duration: '1.8 hours',
        lessons: [
          { id: 'yog-3', title: 'Spinal Decompression & Rotational Flows', duration: '22:45', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400' },
          { id: 'yog-4', title: 'Balance States: Tree Pose to Warrior III Balance', duration: '28:10', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400' }
        ]
      }
    ],
    resources: [
      { title: 'Parasympathetic Breathing Protocol.pdf', description: 'Nervous system recovery timing', downloadUrl: '#download' }
    ]
  },
  {
    id: 'hybrid-athlete',
    title: 'Hybrid Conditioning: Elite Strength & Zone 2 Endurance',
    tagline: 'Learn to run far and lift heavy without sacrificing either.',
    description: 'Break the rule that says you cannot build size and run marathons. This course details cardiorespiratory programming alongside heavy strength blocks to synthesize elite energy systems.',
    price: 6999,
    rating: 4.98,
    reviewsCount: 310,
    duration: '8 Weeks',
    difficulty: 'Advanced',
    lessonsCount: 16,
    coverImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800',
    category: 'Hybrid',
    outcomes: [
      'Program Zone 2 endurance work without degrading resistance training output',
      'Optimize intra-workout nutrition for heavy conditioning blocks',
      'Manage CNS fatigue during intensive double-day training splits',
      'Build heart rate efficiency and high lactate threshold'
    ],
    instructor: {
      name: 'Selvam Ramasamy',
      role: 'Ultra-Marathoner & Powerlifter',
      avatar: '/trainer_selvam.png',
      bio: 'Selvam is an ultra-endurance athlete and powerlifter from Madurai. He benches 180kg and runs 100km trail races, coaching athletes to program zone-2 and strength pathways.',
      stats: { students: '29K+', rating: 4.98, coursesCount: 1 }
    },
    curriculum: [
      {
        title: 'Cycle 1: Energy System Synthesis',
        duration: '2.5 hours',
        lessons: [
          { id: 'hyb-1', title: 'The Hybrid Dilemma: Interference Effect Demystified', duration: '26:40', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400' },
          { id: 'hyb-2', title: 'Zone 2 Cardio Protocols: Heart Rate Calculation', duration: '29:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400' },
          { id: 'hyb-3', title: 'Macrocycle Architecture: Structuring Double Days', duration: '31:40', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400' }
        ]
      },
      {
        title: 'Cycle 2: Recovery & Fueling Protocols',
        duration: '2 hours',
        lessons: [
          { id: 'hyb-4', title: 'Intra-Workout Carb Loading & Electrolyte Math', duration: '25:50', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400' },
          { id: 'hyb-5', title: 'Fatigue Monitoring: HRV and Sleep Staging', duration: '28:30', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400' }
        ]
      }
    ],
    resources: [
      { title: 'Double Split Fatigue Matrix.xlsx', description: 'HRV and volume matching log', downloadUrl: '#download' }
    ]
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to seed curriculum subcollection
const seedCourses = async () => {
  try {
    for (const course of initialCourses) {
      const { curriculum, ...courseMeta } = course;
      await setDoc(doc(db, 'courses', course.id), courseMeta);

      for (let i = 0; i < curriculum.length; i++) {
        const section = curriculum[i];
        await setDoc(doc(db, 'courses', course.id, 'curriculum', `section-${i}`), {
          title: section.title,
          duration: section.duration,
          lessons: section.lessons.map(l => ({
            id: l.id,
            title: l.title,
            duration: l.duration,
            videoUrl: l.videoUrl,
            thumbnailUrl: l.thumbnailUrl || ''
          })),
          order: i
        });
      }
    }
    console.log('Seeded courses & curriculum subcollections successfully.');
  } catch (err) {
    console.warn('Failed to seed courses into Firestore:', err);
  }
};

// Helper to load courses from Firestore
const loadCourses = async (): Promise<Course[]> => {
  const coursesSnapshot = await getDocs(collection(db, 'courses'));
  const loadedCourses: Course[] = [];
  for (const courseDoc of coursesSnapshot.docs) {
    const courseData = courseDoc.data();
    // Fetch curriculum subcollection
    const curriculumSnapshot = await getDocs(collection(db, 'courses', courseDoc.id, 'curriculum'));
    const curriculumSections: any[] = [];
    curriculumSnapshot.forEach(secDoc => {
      curriculumSections.push(secDoc.data());
    });
    // Sort sections by order
    curriculumSections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const mappedCurriculum = curriculumSections.map(sec => ({
      title: sec.title,
      duration: sec.duration,
      lessons: (sec.lessons || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        videoUrl: l.videoUrl,
        thumbnailUrl: l.thumbnailUrl || ''
      }))
    }));

    loadedCourses.push({
      ...courseData,
      id: courseDoc.id,
      curriculum: mappedCurriculum
    } as Course);
  }
  return loadedCourses;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('fitsphere-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fitsphere-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return null;
  });

  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Record<string, string[]>>({});

  const [userNotes, setUserNotes] = useState<UserNote[]>([]);

  const [landingConfig, setLandingConfig] = useState<AppContextType['landingConfig']>(null);
  const [footerConfig, setFooterConfig] = useState<AppContextType['footerConfig']>(null);
  const [loading, setLoading] = useState(true);

  // Sync theme class on HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('fitsphere-theme', theme);
  }, [theme]);

  // Save user session to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('fitsphere-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fitsphere-user');
    }
  }, [user]);

  // Fetch configs and courses
  const refreshData = async () => {
    try {
      // 1. Fetch settings/footer
      const footerDocRef = doc(db, 'settings', 'footer');
      const footerSnap = await getDoc(footerDocRef);
      if (footerSnap.exists()) {
        const data = footerSnap.data();
        setFooterConfig({
          phoneNumber: data.phoneNumber || '+1 (800) FIT-SPHR',
          emailAddress: data.emailAddress || 'support@fitsphere.com'
        });
      } else {
        const defaultFooter = {
          phoneNumber: '+1 (800) FIT-SPHR',
          emailAddress: 'support@fitsphere.com'
        };
        await setDoc(footerDocRef, defaultFooter);
        setFooterConfig(defaultFooter);
      }

      // 2. Fetch landingPage/config
      const landingDocRef = doc(db, 'landingPage', 'config');
      const landingSnap = await getDoc(landingDocRef);
      let loadedLandingData: any = null;
      if (landingSnap.exists()) {
        loadedLandingData = landingSnap.data();
      } else {
        const defaultLanding = {
          statsBaseline: {
            registeredAthletes: 42000,
            completedLessons: 820000,
            averageAdaptRate: '96.4%',
            totalRepsLifted: '12.4M'
          },
          testimonials: [
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
          ],
          specialists: [
            {
              name: 'Dr. Muthu Saravanan',
              role: 'Exercise Physiologist & Professional Coach',
              avatar: '/trainer_muthu.png',
              bio: 'Dr. Saravanan holds a Ph.D. in Exercise Physiology from Madras Medical College and has spent 15+ years training national-level athletes in Tamil Nadu. His science-first approach cuts through fitness myths.',
              students: '42K+',
              rating: 4.9,
              coursesCount: 3
            },
            {
              name: 'Kavitha Rajendran',
              role: 'Functional Movement Coach & RKC Specialist',
              avatar: '/trainer_kavitha.png',
              bio: 'Kavitha is a functional movement coach and Russian Kettlebell Certified (RKC) specialist. She blends gymnastics with explosive ballistic work to build joint longevity.',
              students: '18K+',
              rating: 4.8,
              coursesCount: 2
            },
            {
              name: 'Arun Karthik',
              role: 'Elite Calisthenics Competitor & Coach',
              avatar: '/trainer_arun.png',
              bio: 'Arun is an elite calisthenics competitor from Coimbatore. He specializes in ring mechanics, planches, and handbalancing, helping traditional lifters transition to bodyweight mastery.',
              students: '22K+',
              rating: 4.95,
              coursesCount: 2
            },
            {
              name: 'Ananya Krishnan',
              role: 'Yoga Therapist & Meditation Facilitator',
              avatar: '/trainer_ananya.png',
              bio: 'Ananya trained in traditional yoga at Krishnamacharya Yoga Mandiram in Chennai. She merges traditional vinyasa with modern biomechanics to accelerate recovery.',
              students: '12K+',
              rating: 4.7,
              coursesCount: 4
            },
            {
              name: 'Selvam Ramasamy',
              role: 'Ultra-Marathoner & Powerlifter',
              avatar: '/trainer_selvam.png',
              bio: 'Selvam is an ultra-endurance athlete and powerlifter from Madurai. He benches 180kg and runs 100km trail races, coaching athletes to program zone-2 and strength pathways.',
              students: '29K+',
              rating: 4.98,
              coursesCount: 1
            }
          ]
        };
        await setDoc(landingDocRef, defaultLanding);
        loadedLandingData = defaultLanding;
      }

      setLandingConfig({
        stats: {
          registeredAthletes: loadedLandingData.statsBaseline?.registeredAthletes || 42000,
          completedLessons: loadedLandingData.statsBaseline?.completedLessons || 820000,
          averageAdaptRate: loadedLandingData.statsBaseline?.averageAdaptRate || '96.4%',
          totalRepsLifted: loadedLandingData.statsBaseline?.totalRepsLifted || '12.4M'
        },
        testimonials: loadedLandingData.testimonials || [],
        specialists: loadedLandingData.specialists || []
      } as any);

      // 3. Fetch courses
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      if (coursesSnapshot.empty) {
        await seedCourses();
        const loaded = await loadCourses();
        setCourses(loaded);
      } else {
        const loaded = await loadCourses();
        setCourses(loaded);
      }
    } catch (err) {
      console.warn('Firestore fallback: failed to fetch config, using local fallbacks:', err);
      // Local fallback
      setLandingConfig({
        stats: {
          registeredAthletes: 42000,
          completedLessons: 820000,
          averageAdaptRate: '96.4%',
          totalRepsLifted: '12.4M'
        },
        testimonials: [
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
        ]
      } as any);
      setFooterConfig({
        phoneNumber: '+1 (800) FIT-SPHR',
        emailAddress: 'support@fitsphere.com'
      });
    } finally {
      setLoading(false);
    }
  };

  // Seeding, loading and listening to users for real-time stats
  useEffect(() => {
    refreshData();

    // Listen to changes in the users collection to calculate live statistics
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userCount = snapshot.size;
      let totalCompletedLessons = 0;

      snapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.completedLessonIds) {
          Object.values(userData.completedLessonIds).forEach((lessonsList: any) => {
            if (Array.isArray(lessonsList)) {
              totalCompletedLessons += lessonsList.length;
            }
          });
        }
      });

      // Update landingConfig stats with live calculations
      setLandingConfig((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            registeredAthletes: 42000 + userCount,
            completedLessons: 820000 + totalCompletedLessons
          }
        };
      });
    }, (err) => {
      console.warn('Failed to listen to users collection for live stats:', err);
    });

    return () => unsubscribe();
  }, []);

  // Load user data and notes from Firestore when logging in / email changes
  useEffect(() => {
    if (!user) {
      setPurchasedCourseIds([]);
      setCompletedLessonIds({});
      setUserNotes([]);
      return;
    }

    const loadUserData = async () => {
      try {
        const userEmail = user.email.toLowerCase();
        const userRef = doc(db, 'users', userEmail);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUser(prev => prev ? {
            ...prev,
            name: data.name || prev.name,
            avatar: data.avatar || prev.avatar,
            bio: data.bio || prev.bio,
            weight: data.weight || prev.weight,
            height: data.height || prev.height,
            targetWeight: data.targetWeight || prev.targetWeight,
          } : null);

          if (Array.isArray(data.purchasedCourseIds)) {
            setPurchasedCourseIds(data.purchasedCourseIds);
          }
          if (data.completedLessonIds) {
            setCompletedLessonIds(data.completedLessonIds);
          }
        } else {
          // User doc does not exist, initialize it with current state
          await setDoc(userRef, {
            name: user.name,
            email: userEmail,
            avatar: user.avatar,
            bio: user.bio || '',
            weight: user.weight || '',
            height: user.height || '',
            targetWeight: user.targetWeight || '',
            purchasedCourseIds,
            completedLessonIds
          });
        }

        // Load Notes
        const notesRef = collection(db, 'notes');
        const q = query(notesRef, where('userEmail', '==', userEmail));
        const querySnapshot = await getDocs(q);
        const fetchedNotes: UserNote[] = [];
        querySnapshot.forEach((doc) => {
          fetchedNotes.push(doc.data() as UserNote);
        });

        setUserNotes(fetchedNotes);
      } catch (err) {
        console.warn('Firestore failed to load data, falling back to local state:', err);
      }
    };

    loadUserData();
  }, [user?.email]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = (email: string, name: string) => {
    setUser({
      name: name || 'Aadhi',
      email: email,
      avatar: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏋️‍♂️</text></svg>',
      bio: 'Elite member of FitSphere community.',
      weight: '80 kg',
      height: '182 cm',
      targetWeight: '80 kg'
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedUser: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updatedUser };

      if (nextUser.email) {
        const userEmail = nextUser.email.toLowerCase();
        updateDoc(doc(db, 'users', userEmail), {
          name: nextUser.name,
          avatar: nextUser.avatar,
          bio: nextUser.bio || '',
          weight: nextUser.weight || '',
          height: nextUser.height || '',
          targetWeight: nextUser.targetWeight || '',
        }).catch(err => console.warn('Failed to sync profile update to Firestore:', err));
      }
      return nextUser;
    });
  };

  const addToCart = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.course.id === courseId);
      if (existingItem) {
        return prevCart;
      }
      return [...prevCart, { course, quantity: 1 }];
    });
  };

  const removeFromCart = (courseId: string) => {
    setCart(prevCart => prevCart.filter(item => item.course.id !== courseId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const purchaseCourses = () => {
    const newCourseIds = cart.map(item => item.course.id);
    const updatedPurchasedCourseIds = Array.from(new Set([...purchasedCourseIds, ...newCourseIds]));

    const updatedCompletedLessonIds = { ...completedLessonIds };
    newCourseIds.forEach(id => {
      if (!updatedCompletedLessonIds[id]) {
        updatedCompletedLessonIds[id] = [];
      }
    });

    if (user?.email && cart.length > 0) {
      const userEmail = user.email.toLowerCase();
      const paymentId = `pay_${Date.now()}`;
      const subtotal = cart.reduce((acc, item) => acc + item.course.price, 0);
      const tax = subtotal * 0.05;
      const totalAmount = subtotal + tax;

      const paymentDoc = {
        id: paymentId,
        userEmail: userEmail,
        userName: user.name,
        purchasedCourseIds: newCourseIds,
        purchasedCoursesDetails: cart.map(item => ({
          id: item.course.id,
          title: item.course.title,
          price: item.course.price
        })),
        amountPaid: totalAmount,
        timestamp: new Date().toISOString(),
        status: 'Success'
      };

      setDoc(doc(db, 'payments', paymentId), paymentDoc)
        .then(() => console.log('Payment transaction recorded successfully:', paymentId))
        .catch(err => console.error('Failed to log payment transaction to Firestore:', err));

      updateDoc(doc(db, 'users', userEmail), {
        purchasedCourseIds: updatedPurchasedCourseIds,
        completedLessonIds: updatedCompletedLessonIds
      }).catch(err => console.warn('Failed to sync purchases to Firestore:', err));
    }

    setPurchasedCourseIds(updatedPurchasedCourseIds);
    setCompletedLessonIds(updatedCompletedLessonIds);
    setCart([]);
  };

  const toggleLessonCompleted = (courseId: string, lessonId: string) => {
    const courseLessons = completedLessonIds[courseId] || [];
    const updated = courseLessons.includes(lessonId)
      ? courseLessons.filter(id => id !== lessonId)
      : [...courseLessons, lessonId];

    const nextCompletedLessonIds = { ...completedLessonIds, [courseId]: updated };
    setCompletedLessonIds(nextCompletedLessonIds);

    if (user?.email) {
      const userEmail = user.email.toLowerCase();
      updateDoc(doc(db, 'users', userEmail), {
        completedLessonIds: nextCompletedLessonIds
      }).catch(err => console.warn('Failed to sync lesson completion to Firestore:', err));
    }
  };

  const addNote = (courseId: string, lessonId: string, lessonTitle: string, text: string) => {
    const noteId = `note-${Date.now()}`;
    const newNote: UserNote = {
      id: noteId,
      courseId,
      lessonId,
      lessonTitle,
      text,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setUserNotes(prev => [newNote, ...prev]);

    if (user?.email) {
      const userEmail = user.email.toLowerCase();
      setDoc(doc(db, 'notes', noteId), {
        ...newNote,
        userEmail
      }).catch(err => console.warn('Failed to sync added note to Firestore:', err));
    }
  };

  const deleteNote = (noteId: string) => {
    setUserNotes(prev => prev.filter(note => note.id !== noteId));

    if (user?.email) {
      deleteDoc(doc(db, 'notes', noteId)).catch(err =>
        console.warn('Failed to delete note from Firestore:', err)
      );
    }
  };

  const addCourse = async (newCourse: Course) => {
    try {
      const { curriculum, ...courseMeta } = newCourse;
      await setDoc(doc(db, 'courses', newCourse.id), courseMeta);

      if (curriculum) {
        for (let i = 0; i < curriculum.length; i++) {
          const section = curriculum[i];
          await setDoc(doc(db, 'courses', newCourse.id, 'curriculum', `section-${i}`), {
            title: section.title,
            duration: section.duration,
            lessons: section.lessons,
            order: i
          });
        }
      }
      await refreshData();
    } catch (err) {
      console.warn('Failed to add course to Firestore:', err);
    }
  };

  const updateCourse = async (courseId: string, updatedFields: Partial<Course>) => {
    try {
      const { curriculum, ...courseMeta } = updatedFields;
      if (Object.keys(courseMeta).length > 0) {
        await updateDoc(doc(db, 'courses', courseId), courseMeta);
      }

      if (curriculum) {
        for (let i = 0; i < curriculum.length; i++) {
          const section = curriculum[i];
          await setDoc(doc(db, 'courses', courseId, 'curriculum', `section-${i}`), {
            title: section.title,
            duration: section.duration,
            lessons: section.lessons,
            order: i
          });
        }
      }
      await refreshData();
    } catch (err) {
      console.warn('Failed to update course in Firestore:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      courses,
      cart,
      user,
      purchasedCourseIds,
      completedLessonIds,
      userNotes,
      theme,
      toggleTheme,
      login,
      logout,
      updateProfile,
      addToCart,
      removeFromCart,
      clearCart,
      purchaseCourses,
      toggleLessonCompleted,
      addNote,
      deleteNote,
      landingConfig,
      footerConfig,
      loading,
      addCourse,
      updateCourse
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
