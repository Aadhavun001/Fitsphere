import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Activity, Edit2, Check, ArrowRight, Dumbbell, Sparkles, Upload, Award, Download, X } from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, courses, purchasedCourseIds, completedLessonIds } = useApp();
  const navigate = useNavigate();

  // Local editing states
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [weight, setWeight] = useState(user?.weight || '');
  const [height, setHeight] = useState(user?.height || '');
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight || '');
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Certificate states
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [showCertModal, setShowCertModal] = useState(false);
  const [activeCert, setActiveCert] = useState<any>(null);
  const [certScale, setCertScale] = useState(1);
  const certContainerRef = useRef<HTMLDivElement>(null);

  // Handle responsive scaling of the certificate preview
  useEffect(() => {
    const handleResize = () => {
      if (!certContainerRef.current) return;
      const containerWidth = certContainerRef.current.clientWidth;
      const targetWidth = 760; // minimum width of certificate preview
      const scale = Math.min(1, containerWidth / targetWidth);
      setCertScale(scale);
    };

    if (showCertModal) {
      handleResize();
      window.addEventListener('resize', handleResize);
      setTimeout(handleResize, 100);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [showCertModal]);

  // Load/sync certificates from Firestore & local checklist progress on mount/update
  useEffect(() => {
    if (user?.email && courses.length > 0) {
      const userEmail = user.email.toLowerCase();
      const q = query(
        collection(db, 'certificates'),
        where('userEmail', '==', userEmail)
      );

      getDocs(q).then(async (snap) => {
        const existingCerts = new Map();
        snap.forEach((doc) => {
          existingCerts.set(doc.data().courseId, doc.data());
        });

        const certsList: any[] = Array.from(existingCerts.values());

        // Check for completed courses that don't have a certificate saved in Firestore yet
        const purchasedCourses = courses.filter(c => purchasedCourseIds.includes(c.id));
        for (const course of purchasedCourses) {
          const totalLessons = course.curriculum.reduce((acc, sec) => acc + (sec.lessons || []).length, 0);
          const completedCount = (completedLessonIds[course.id] || []).length;
          const isCompleted = totalLessons > 0 && completedCount === totalLessons;

          if (isCompleted && !existingCerts.has(course.id)) {
            const certId = `${userEmail}_${course.id}`;
            const verificationCode = `FS-${course.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const newCert = {
              id: certId,
              userEmail: userEmail,
              userName: user.name,
              courseId: course.id,
              courseTitle: course.title,
              issueDate: new Date().toISOString(),
              verificationCode: verificationCode,
              badgeType: 'Gold'
            };

            try {
              await setDoc(doc(db, 'certificates', certId), newCert);
              certsList.push(newCert);
              console.log('Saved course completion certificate to Firestore from Profile Page:', certId);
            } catch (err) {
              console.warn('Failed to write certificate to Firestore from Profile Page:', err);
              certsList.push(newCert);
            }
          }
        }

        setCertificates(certsList);
        setLoadingCerts(false);

        // Background sync missing certificate images
        for (const cert of certsList) {
          if (!cert.certificateImage) {
            const certRef = doc(db, 'certificates', cert.id);
            uploadCertificateImage(cert, certRef);
          }
        }
      }).catch(err => {
        console.warn('Failed to load certificates on profile page:', err);
        // Fallback: build certificates locally based on course progress
        const fallbackList: any[] = [];
        const purchasedCourses = courses.filter(c => purchasedCourseIds.includes(c.id));
        for (const course of purchasedCourses) {
          const totalLessons = course.curriculum.reduce((acc, sec) => acc + (sec.lessons || []).length, 0);
          const completedCount = (completedLessonIds[course.id] || []).length;
          if (totalLessons > 0 && completedCount === totalLessons) {
            fallbackList.push({
              id: `${userEmail}_${course.id}`,
              userEmail: userEmail,
              userName: user.name,
              courseId: course.id,
              courseTitle: course.title,
              issueDate: new Date().toISOString(),
              verificationCode: `FS-${course.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}-LOCAL`,
              badgeType: 'Gold'
            });
          }
        }
        setCertificates(fallbackList);
        setLoadingCerts(false);
      });
    }
  }, [user?.email, courses, purchasedCourseIds, completedLessonIds]);

  const handleViewCert = (cert: any) => {
    setActiveCert(cert);
    setShowCertModal(true);
  };

  const downloadCertificateAsPNG = () => {
    if (!activeCert || !user) return;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      });
    };

    Promise.all([
      loadImage('/startup_india_logo.png'),
      loadImage('/fitsphere_logo.png'),
      loadImage('/fitsphere_logo_icon.png'),
      loadImage('/gold_seal.jpg')
    ]).then(([startupImg, fitsphereImg, fitsphereIconImg, goldSealImg]) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw Background
      const grad = ctx.createRadialGradient(960, 540, 50, 960, 540, 1100);
      grad.addColorStop(0, '#111827'); 
      grad.addColorStop(1, '#030712'); 
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1920, 1080);

      const glowGrad = ctx.createRadialGradient(960, 540, 10, 960, 540, 600);
      glowGrad.addColorStop(0, 'rgba(217, 119, 6, 0.05)'); 
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Borders
      ctx.strokeStyle = '#D97706'; 
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, 1820, 980);

      ctx.strokeStyle = '#FBBF24'; 
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 70, 1780, 940);

      // Corners
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(40, 120); ctx.lineTo(120, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1880, 120); ctx.lineTo(1800, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, 960); ctx.lineTo(120, 1040); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1880, 960); ctx.lineTo(1800, 1040); ctx.stroke();

      // Top established header & logo
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(251, 191, 36, 0.7)'; 
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.fillText('ESTD. 2016', 960, 82);

      ctx.drawImage(fitsphereImg, 960 - 160, 102, 320, 80);

      // Certificate Title
      ctx.fillStyle = '#FBBF24'; 
      ctx.font = '900 64px Cinzel, serif';
      ctx.fillText('CERTIFICATE OF COMPLETION', 960, 240);

      ctx.fillStyle = '#9CA3AF'; 
      ctx.font = 'italic 28px "Playfair Display", Georgia, serif';
      ctx.fillText('This is proudly presented to', 960, 340);

      // Student name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 76px "Playfair Display", Georgia, serif';
      ctx.fillText(activeCert.userName, 960, 440);

      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(660, 495); ctx.lineTo(1260, 495); ctx.stroke();

      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'italic 26px "Playfair Display", Georgia, serif';
      ctx.fillText('for outstanding dedication and mastery of the professional program', 960, 560);

      // Course title
      ctx.fillStyle = '#FBBF24'; 
      ctx.font = 'bold 44px Outfit, sans-serif';
      ctx.fillText(activeCert.courseTitle.toUpperCase(), 960, 645);

      ctx.fillStyle = '#6B7280'; 
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.fillText('EVALUATED & CERTIFIED BY THE ELITE COACHING DIVISION', 960, 715);

      // Signatures
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

      // Seals
      const sealX = 960;
      const sealY = 855;
      
      // Left stamp: FitSphere icon
      const leftX = 730;
      const leftY = 855;
      const leftR = 45;

      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(leftX, leftY, leftR, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(leftX, leftY, leftR, 0, Math.PI * 2); ctx.stroke();

      ctx.save();
      ctx.beginPath(); ctx.arc(leftX, leftY, leftR - 1, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(fitsphereIconImg, leftX - leftR, leftY - leftR, leftR * 2, leftR * 2);
      ctx.restore();

      // Center gold seal
      const centerR = 55;
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(sealX, sealY, centerR, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(sealX, sealY, centerR - 1, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(goldSealImg, sealX - centerR, sealY - centerR, centerR * 2, centerR * 2);
      ctx.restore();

      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(sealX, sealY, centerR, 0, Math.PI * 2); ctx.stroke();

      // Right stamp: Startup India
      const startupX = 1190;
      const startupY = 855;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(startupX, startupY, 45, 0, Math.PI * 2); ctx.fill();
      ctx.drawImage(startupImg, startupX - 38, startupY - 38, 76, 76);

      // Metadata footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#4B5563'; 
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`VERIFICATION CODE: ${activeCert.verificationCode}  |  ISSUED: ${new Date(activeCert.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}  |  PORTAL: FITSPHERE.COM`, 960, 985);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = `${user.name.replace(/\s+/g, '_')}_${activeCert.courseTitle.replace(/\s+/g, '_')}_Certificate.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    }).catch(err => {
      console.error('Failed to load certificate logo images for canvas export:', err);
    });
  };

  // Background upload of certificate image representation
  const uploadCertificateImage = (cert: any, certRef: any) => {
    if (!cert || !certRef || cert.certificateImage) return;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      });
    };

    Promise.all([
      loadImage('/startup_india_logo.png'),
      loadImage('/fitsphere_logo.png'),
      loadImage('/fitsphere_logo_icon.png'),
      loadImage('/gold_seal.jpg')
    ]).then(async ([startupImg, fitsphereImg, fitsphereIconImg, goldSealImg]) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw Background
      const grad = ctx.createRadialGradient(960, 540, 50, 960, 540, 1100);
      grad.addColorStop(0, '#111827'); 
      grad.addColorStop(1, '#030712'); 
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1920, 1080);

      const glowGrad = ctx.createRadialGradient(960, 540, 10, 960, 540, 600);
      glowGrad.addColorStop(0, 'rgba(217, 119, 6, 0.05)'); 
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Borders
      ctx.strokeStyle = '#D97706'; 
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, 1820, 980);

      ctx.strokeStyle = '#FBBF24'; 
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 70, 1780, 940);

      // Corners
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(40, 120); ctx.lineTo(120, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1880, 120); ctx.lineTo(1800, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, 960); ctx.lineTo(120, 1040); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1880, 960); ctx.lineTo(1800, 1040); ctx.stroke();

      // Top established header & logo
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(251, 191, 36, 0.7)'; 
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.fillText('ESTD. 2016', 960, 82);

      ctx.drawImage(fitsphereImg, 960 - 160, 102, 320, 80);

      // Certificate Title
      ctx.fillStyle = '#FBBF24'; 
      ctx.font = '900 64px Cinzel, serif';
      ctx.fillText('CERTIFICATE OF COMPLETION', 960, 240);

      ctx.fillStyle = '#9CA3AF'; 
      ctx.font = 'italic 28px "Playfair Display", Georgia, serif';
      ctx.fillText('This is proudly presented to', 960, 340);

      // Student name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 76px "Playfair Display", Georgia, serif';
      ctx.fillText(cert.userName, 960, 440);

      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(660, 495); ctx.lineTo(1260, 495); ctx.stroke();

      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'italic 26px "Playfair Display", Georgia, serif';
      ctx.fillText('for outstanding dedication and mastery of the professional program', 960, 560);

      // Course title
      ctx.fillStyle = '#FBBF24'; 
      ctx.font = 'bold 44px Outfit, sans-serif';
      ctx.fillText(cert.courseTitle.toUpperCase(), 960, 645);

      ctx.fillStyle = '#6B7280'; 
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.fillText('EVALUATED & CERTIFIED BY THE ELITE COACHING DIVISION', 960, 715);

      // Signatures
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

      // Seals
      const sealX = 960;
      const sealY = 855;
      
      // Left stamp: FitSphere icon
      const leftX = 730;
      const leftY = 855;
      const leftR = 45;

      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(leftX, leftY, leftR, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(leftX, leftY, leftR, 0, Math.PI * 2); ctx.stroke();

      ctx.save();
      ctx.beginPath(); ctx.arc(leftX, leftY, leftR - 1, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(fitsphereIconImg, leftX - leftR, leftY - leftR, leftR * 2, leftR * 2);
      ctx.restore();

      // Center gold seal
      const centerR = 55;
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(sealX, sealY, centerR, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(sealX, sealY, centerR - 1, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(goldSealImg, sealX - centerR, sealY - centerR, centerR * 2, centerR * 2);
      ctx.restore();

      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(sealX, sealY, centerR, 0, Math.PI * 2); ctx.stroke();

      // Right stamp: Startup India
      const startupX = 1190;
      const startupY = 855;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(startupX, startupY, 45, 0, Math.PI * 2); ctx.fill();
      ctx.drawImage(startupImg, startupX - 38, startupY - 38, 76, 76);

      // Metadata footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#4B5563'; 
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`VERIFICATION CODE: ${cert.verificationCode}  |  ISSUED: ${new Date(cert.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}  |  PORTAL: FITSPHERE.COM`, 960, 985);

      // Get base64 JPEG and save to firestore
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      await updateDoc(certRef, { certificateImage: dataUrl });
      console.log('Background uploaded certificate image on Profile Page for:', cert.id);
    }).catch(err => {
      console.error('Failed to generate background certificate image on Profile Page:', err);
    });
  };

  // Photo editor states
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [imageRatio, setImageRatio] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Predefined avatar selections for rapid change
  const avatarTemplates = [
    '/trainer_muthu.png',
    '/trainer_arun.png',
    '/trainer_selvam.png',
    '/trainer_kavitha.png',
    '/trainer_ananya.png',
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏋️‍♂️</text></svg>',
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧘‍♀️</text></svg>',
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏃‍♂️</text></svg>',
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💪</text></svg>',
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦾</text></svg>'
  ];

  if (!user) {
    return (
      <div className="w-full bg-bg-dark pt-40 pb-24 text-center min-h-[85vh]">
        <h2 className="text-xl font-display font-bold text-white uppercase">Please sign in to view your profile</h2>
        <button onClick={() => navigate('/login')} className="mt-4 px-6 py-3 bg-brand-neon text-black font-bold rounded-full text-xs">
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      bio,
      avatar,
      weight,
      height,
      targetWeight
    });
    setIsEditing(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const src = event.target.result as string;
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setImageRatio(img.width / img.height);
            setUploadedImageSrc(src);
            setZoom(1.0);
            setRotation(0);
            setOffsetX(0);
            setOffsetY(0);
            // Reset input value so the same file can be selected again
            e.target.value = '';
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offsetX, y: clientY - offsetY });
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setOffsetX(clientX - dragStart.x);
    setOffsetY(clientY - dragStart.y);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleAutoAlign = () => {
    setZoom(1.25);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleCropSave = () => {
    if (!uploadedImageSrc) return;
    const img = new Image();
    img.src = uploadedImageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.arc(150, 150, 150, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.save();
        ctx.translate(150, 150);
        const multiplier = 300 / 192;
        ctx.translate(offsetX * multiplier, offsetY * multiplier);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        
        const imgRatio = img.width / img.height;
        let drawW = 300;
        let drawH = 300;
        if (imgRatio > 1) {
          drawW = 300 * imgRatio;
        } else {
          drawH = 300 / imgRatio;
        }
        
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
        
        const croppedUrl = canvas.toDataURL('image/jpeg', 0.95);
        setAvatar(croppedUrl);
        setUploadedImageSrc(null);
      }
    };
  };

  const myCourses = courses.filter((c) => purchasedCourseIds.includes(c.id));

  return (
    <div className="w-full bg-bg-dark pt-32 pb-24 px-6 min-h-[90vh] relative">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Header */}
        <div className="text-left flex flex-col gap-1 pb-4 border-b border-white/5">
          <h1 className="font-display font-black text-4xl text-white uppercase tracking-tight">Your Profile</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            Manage your biometrics and active training courses
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Biometrics & Stats (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Avatar card */}
            <div className="p-6 rounded-3xl glass-card border border-white/5 text-center flex flex-col items-center gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-brand-neon shadow-[0_0_20px_rgba(184,255,34,0.2)]"
              />
              <div className="text-center">
                <h3 className="font-display font-bold text-white text-lg">{user.name}</h3>
                <span className="text-xs text-brand-neon font-semibold">{user.email}</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed italic">
                "{user.bio || 'No bio written yet.'}"
              </p>
              
              {!isEditing && (
                <button
                  onClick={() => {
                    setName(user.name);
                    setBio(user.bio || '');
                    setAvatar(user.avatar);
                    setWeight(user.weight || '');
                    setHeight(user.height || '');
                    setTargetWeight(user.targetWeight || '');
                    setIsEditing(true);
                  }}
                  className="w-full py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-neon hover:text-brand-neon text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Profile & Photo
                </button>
              )}
            </div>

            {/* Biometric Trackers display */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-left flex flex-col gap-4">
              <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-brand-cyan" />
                Physical Metrics
              </h4>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] text-gray-500 block uppercase font-bold">Weight</span>
                  <span className="text-white font-bold text-sm">{user.weight || '—'}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] text-gray-500 block uppercase font-bold">Height</span>
                  <span className="text-white font-bold text-sm">{user.height || '—'}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] text-gray-500 block uppercase font-bold">Goal Wt</span>
                  <span className="text-brand-cyan font-bold text-sm">{user.targetWeight || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl text-[10px] text-gray-400">
                <Sparkles className="h-4.5 w-4.5 text-brand-cyan flex-shrink-0" />
                <span>Adaptation goals are calculated dynamically against metrics.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Settings Form or Enrolled Courses (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {savedMessage && (
              <div className="p-4 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs flex items-center gap-2">
                <Check className="h-4 w-4" />
                Profile updated successfully.
              </div>
            )}

            {isEditing ? (
              <div className="p-8 rounded-3xl glass-card border border-brand-neon/20 text-left">
                <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider mb-6">Edit Profile & Biometrics</h3>
                
                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="prof-name" className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                    <input
                      id="prof-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-neon/50 outline-none transition-all"
                    />
                  </div>

                  {/* Avatar Picker & URL */}
                  <div className="flex flex-col gap-3 sm:col-span-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Profile Picture</span>
                    
                    {/* Quick Avatar selection bubble list */}
                    <div className="flex items-center gap-3 py-1">
                      {avatarTemplates.map((imgUrl, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setAvatar(imgUrl)}
                          className={`h-12 w-12 rounded-full overflow-hidden border-2 transition-all ${
                            avatar === imgUrl ? 'border-brand-neon scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt={`Template ${index}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>

                    {/* Local File Upload Selector */}
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        id="prof-avatar-file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="prof-avatar-file"
                        className="px-4 py-2.5 rounded-xl bg-brand-neon/10 border border-brand-neon/20 hover:bg-brand-neon/20 hover:border-brand-neon text-brand-neon text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Photo from Device
                      </label>
                    </div>

                    {/* Interactive Crop / Align Editor */}
                    {uploadedImageSrc && (
                      <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-4">
                        <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">Crop & Align Photo</div>
                        
                        {/* 192x192px Circle Crop Mask */}
                        <div
                          className="h-48 w-48 rounded-full border-2 border-brand-neon relative overflow-hidden cursor-move bg-black flex items-center justify-center select-none"
                          onMouseDown={handleDragStart}
                          onMouseMove={handleDragMove}
                          onMouseUp={handleDragEnd}
                          onMouseLeave={handleDragEnd}
                          onTouchStart={handleDragStart}
                          onTouchMove={handleDragMove}
                          onTouchEnd={handleDragEnd}
                        >
                          <img
                            src={uploadedImageSrc}
                            alt="Preview"
                            style={{
                              width: imageRatio > 1 ? `${192 * imageRatio}px` : '192px',
                              height: imageRatio > 1 ? '192px' : `${192 / imageRatio}px`,
                              transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom}) rotate(${rotation}deg)`,
                              transformOrigin: 'center center',
                            }}
                            className="max-w-none absolute pointer-events-none select-none transition-transform duration-75"
                          />
                          {/* Crosshair Overlay */}
                          <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none flex items-center justify-center">
                            <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-white/20 -translate-y-1/2"></div>
                            <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-white/20 -translate-x-1/2"></div>
                          </div>
                        </div>
                        
                        <p className="text-[10px] text-gray-400 text-center leading-normal max-w-[280px]">
                          ↔ Drag inside the circle to pan. Use sliders below to scale and rotate.
                        </p>

                        {/* Editor Controls sliders */}
                        <div className="w-full flex flex-col gap-3 mt-1">
                          {/* Zoom Control */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
                              <span>Scale / Zoom ({zoom.toFixed(2)}x)</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                                  className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white hover:border-brand-neon hover:text-brand-neon text-[9px]"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setZoom(prev => Math.min(4.0, prev + 0.1))}
                                  className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white hover:border-brand-neon hover:text-brand-neon text-[9px]"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="4.0"
                              step="0.05"
                              value={zoom}
                              onChange={(e) => setZoom(parseFloat(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-neon"
                            />
                          </div>
                          
                          {/* Rotation Control */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
                              <span>Rotate ({rotation}°)</span>
                              <button
                                type="button"
                                onClick={() => setRotation(0)}
                                className="text-brand-neon hover:underline text-[9px]"
                              >
                                Reset
                              </button>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              step="1"
                              value={rotation}
                              onChange={(e) => setRotation(parseInt(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-neon"
                            />
                          </div>
                        </div>

                        {/* Editor Action Buttons */}
                        <div className="flex w-full gap-2 mt-2">
                          <button
                            type="button"
                            onClick={handleAutoAlign}
                            className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-cyan hover:text-brand-cyan text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="h-3 w-3" />
                            Auto-Align
                          </button>
                          <button
                            type="button"
                            onClick={handleCropSave}
                            className="flex-1 py-2 rounded-xl bg-brand-neon text-black text-[11px] font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5"
                          >
                            <Check className="h-3 w-3" />
                            Apply Crop
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadedImageSrc(null)}
                            className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-brand-red/10 hover:border-brand-red hover:text-brand-red text-white text-[11px] font-bold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 mt-2">
                      <label htmlFor="prof-avatar-url" className="text-[10px] text-gray-500 font-bold uppercase">Or enter custom Image URL</label>
                      <input
                        id="prof-avatar-url"
                        type="text"
                        placeholder="https://example.com/photo.jpg"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-neon/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="prof-bio" className="text-xs font-bold text-gray-400 uppercase">Short Bio</label>
                    <input
                      id="prof-bio"
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-neon/50 outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="prof-weight" className="text-xs font-bold text-gray-400 uppercase">Current Weight</label>
                    <input
                      id="prof-weight"
                      type="text"
                      placeholder="e.g. 78 kg"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-cyan/50 outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="prof-height" className="text-xs font-bold text-gray-400 uppercase">Height</label>
                    <input
                      id="prof-height"
                      type="text"
                      placeholder="e.g. 180 cm"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-cyan/50 outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="prof-target" className="text-xs font-bold text-gray-400 uppercase">Target Weight Goal</label>
                    <input
                      id="prof-target"
                      type="text"
                      placeholder="e.g. 82 kg"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-cyan/50 outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 flex gap-3 justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 rounded-full border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-brand-neon text-black text-xs font-extrabold hover:scale-102 transition-transform"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-col gap-6 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">Enrolled Courses ({myCourses.length})</h3>
                  <Link to="/courses" className="text-xs text-brand-neon font-semibold hover:underline">Buy more courses</Link>
                </div>

                {myCourses.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {myCourses.map((course) => (
                      <div
                        key={course.id}
                        className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col sm:flex-row gap-5 justify-between items-center hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4 w-full">
                          <img
                            src={course.coverImage}
                            alt={course.title}
                            className="h-16 w-24 object-cover rounded-2xl border border-white/10 flex-shrink-0"
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-brand-cyan font-bold uppercase tracking-wider">{course.category}</span>
                            <h4 className="font-display font-bold text-white text-sm line-clamp-1">{course.title}</h4>
                            <span className="text-[10px] text-gray-500">Instructor: {course.instructor.name}</span>
                          </div>
                        </div>
                        
                        <Link
                          to={`/dashboard?courseId=${course.id}`}
                          className="w-full sm:w-auto px-5 py-3 rounded-full bg-brand-neon text-black font-extrabold text-xs text-center flex items-center justify-center gap-1.5 hover:scale-[1.03] transition-transform"
                        >
                          Launch Portal
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col items-center gap-4">
                    <Dumbbell className="h-10 w-10 text-gray-600" />
                    <div className="text-white font-bold text-sm">No active training courses</div>
                    <Link to="/courses" className="px-5 py-2.5 bg-brand-neon text-black text-xs font-bold rounded-full">
                      Explore Courses
                    </Link>
                  </div>
                )}

                {/* Certificates Section */}
                <div className="flex flex-col gap-6 text-left mt-8 border-t border-white/5 pt-8">
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-yellow-400" />
                    <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">Earned Certificates ({certificates.length})</h3>
                  </div>

                  {loadingCerts ? (
                    <div className="flex items-center gap-2 text-gray-400 py-6">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-brand-neon"></div>
                      <span className="text-xs font-semibold">Loading certificates...</span>
                    </div>
                  ) : certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-5 rounded-3xl bg-gradient-to-tr from-amber-950/20 to-yellow-950/10 border border-yellow-500/10 flex flex-col justify-between gap-4 hover:border-yellow-500/30 transition-all duration-300 relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full filter blur-xl pointer-events-none" />
                          <div>
                            <span className="text-[9px] text-yellow-400 font-extrabold uppercase tracking-widest bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/20">
                              🏆 Gold Certification
                            </span>
                            <h4 className="font-display font-bold text-white text-md mt-2 line-clamp-1">{cert.courseTitle}</h4>
                            <p className="text-[10px] text-gray-400 mt-1">
                              Issued: {new Date(cert.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">ID: {cert.verificationCode}</p>
                          </div>
                          
                          <button
                            onClick={() => handleViewCert(cert)}
                            className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xs text-center flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-transform cursor-pointer border-none"
                          >
                            <Award className="h-4 w-4 stroke-[2.5]" />
                            View Certificate
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col items-center gap-3">
                      <Award className="h-8 w-8 text-gray-600" />
                      <div className="text-gray-400 text-sm font-semibold">No certificates earned yet</div>
                      <p className="text-xs text-gray-500 max-w-sm">Complete all lessons in a course to 100% to unlock your official FitSphere certification.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Gold Completion Certificate Modal */}
      {showCertModal && activeCert && (
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
              onClick={() => {
                setShowCertModal(false);
                setActiveCert(null);
              }}
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
                    <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center cursor-pointer border border-amber-500 overflow-hidden">
                      <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10 pointer-events-none" />
                        <img src="/gold_seal.jpg" alt="Gold Seal" className="w-full h-full object-cover rounded-full" />
                      </div>
                    </div>

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
                onClick={() => {
                  setShowCertModal(false);
                  setActiveCert(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={downloadCertificateAsPNG}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4 stroke-[2.5]" />
                Download Certificate (PNG)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
