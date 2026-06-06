import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Activity, Edit2, Check, ArrowRight, Dumbbell, Sparkles, Upload } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, courses, purchasedCourseIds } = useApp();
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

  // Photo editor states
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
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
          setUploadedImageSrc(event.target.result as string);
          setZoom(1.0);
          setRotation(0);
          setOffsetX(0);
          setOffsetY(0);
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
                              transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom}) rotate(${rotation}deg)`,
                              transformOrigin: 'center center',
                            }}
                            className="max-w-none w-full h-full object-contain pointer-events-none select-none transition-transform duration-75"
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
                          to="/dashboard"
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
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
