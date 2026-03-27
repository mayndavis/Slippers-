import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { differenceInDays, differenceInHours, differenceInMinutes, isSameDay, isAfter, addYears, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { logOut, db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const bgItems = [
  { id: 1, emoji: '👣', left: '10%', top: '20%', factor: 0.03 },
  { id: 2, emoji: '🎈', left: '85%', top: '15%', factor: -0.04 },
  { id: 3, emoji: '✨', left: '20%', top: '80%', factor: 0.05 },
  { id: 4, emoji: '👣', left: '80%', top: '75%', factor: -0.03 },
  { id: 5, emoji: '🎉', left: '50%', top: '10%', factor: 0.02 },
  { id: 6, emoji: '👣', left: '15%', top: '50%', factor: -0.05 },
  { id: 7, emoji: '✨', left: '85%', top: '45%', factor: 0.04 },
  { id: 8, emoji: '🎈', left: '40%', top: '85%', factor: -0.02 },
  { id: 9, emoji: '👣', left: '60%', top: '60%', factor: 0.06 },
  { id: 10, emoji: '🎉', left: '30%', top: '30%', factor: -0.05 },
];

const goodbyes = [
  "Log Out", 
  "See ya later! 👋", 
  "Adios amigo! 🌮", 
  "Bye bye! 🥺", 
  "Farewell! 🕊️", 
  "Peace out! ✌️", 
  "Until next time! 🕰️", 
  "Gotta blast! 🚀", 
  "Sayonara! 🌸"
];

const deleteTexts = [
  "Delete Account", 
  "Are you sure? 😢", 
  "Please stay!", 
  "I'll be good!", 
  "Don't do it!", 
  "I'm scared! 🏃💨", 
  "Noooo!", 
  "Okay, fine... 😭"
];

const Toggle = ({ label, value, onChange }: { label: string, value: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
    <span className="font-bold text-zinc-700">{label}</span>
    <button onClick={onChange} className={`w-14 h-8 rounded-full transition-colors ${value ? 'bg-indigo-500' : 'bg-zinc-300'} relative shadow-inner`}>
      <motion.div animate={{ x: value ? 26 : 4 }} className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md" />
    </button>
  </div>
);

export default function Dashboard() {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [loadingGreeting, setLoadingGreeting] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  
  // Settings & Modals State
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    publicBirthday: false
  });

  // Interactive State
  const [mousePos, setMousePos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500 });
  const [logoutText, setLogoutText] = useState("Log Out");
  const [deletePos, setDeletePos] = useState({ x: 0, y: 0 });
  const [deleteEscapes, setDeleteEscapes] = useState(0);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  const handleLogOut = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);
      navigate('/');
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        setDeleteError("For security reasons, please log out and log back in before deleting your account.");
      } else {
        setDeleteError("Failed to delete account. Please try again.");
      }
      setIsDeleting(false);
    }
  };

  const handleLogoutHover = () => {
    setLogoutText(goodbyes[Math.floor(Math.random() * goodbyes.length)]);
  };

  const handleDeleteHover = () => {
    if (deleteEscapes < 7) {
      setDeleteEscapes(prev => prev + 1);
      const newX = (Math.random() - 0.5) * 250;
      const newY = -(Math.random() * 250) - 50; // Fly upwards into the modal
      setDeletePos({ x: newX, y: newY });
    }
  };

  const closeSettings = () => {
    setShowSettings(false);
    setTimeout(() => {
      setDeletePos({ x: 0, y: 0 });
      setDeleteEscapes(0);
      setLogoutText("Log Out");
    }, 300);
  };

  useEffect(() => {
    if (!userProfile?.dateOfBirth) return;

    const calculateCountdown = () => {
      const today = startOfDay(new Date());
      const dobDate = userProfile.dateOfBirth?.toDate ? userProfile.dateOfBirth.toDate() : new Date(userProfile.dateOfBirth);
      
      let nextBirthday = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
      
      if (isSameDay(today, nextBirthday)) {
        navigate('/celebration');
        return;
      }

      if (isAfter(today, nextBirthday)) {
        nextBirthday = addYears(nextBirthday, 1);
      }

      const now = new Date();
      const target = new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate());
      
      setCountdown({
        days: differenceInDays(target, now),
        hours: differenceInHours(target, now) % 24,
        minutes: differenceInMinutes(target, now) % 60
      });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);
    return () => clearInterval(interval);
  }, [userProfile, navigate]);

  useEffect(() => {
    const fetchGreeting = async () => {
      if (!userProfile) return;
      
      try {
        const tone = userProfile.gender === 'female' 
          ? "cute, wholesome, playful, and imaginative" 
          : "playful, bold, and fun";
          
        const prompt = `Generate a short, highly personalized, unique welcome message for ${userProfile.name}. 
        They are interested in: ${userProfile.interests?.join(', ')}. 
        Their birthday is in ${countdown.days} days. 
        Tone constraints: ${tone}. 
        Channel the energy of popular anime/cartoon archetypes (like Naruto, Luffy, Gojo, SpongeBob, etc.) but DO NOT use their names, catchphrases, or copyrighted likenesses. Use them strictly for energetic and behavioral inspiration. 
        Keep it under 3 sentences. Be cheeky, surprising, and harmless. Do not use dirty insults, cruelty, harassment, hate, or abuse.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });

        setGreeting(response.text || "Welcome back to Slippers!");
      } catch (error) {
        console.error("Error generating greeting:", error);
        setGreeting("Welcome back to Slippers! We're so glad you're here.");
      } finally {
        setLoadingGreeting(false);
      }
    };

    if (countdown.days > 0 && !greeting) {
      fetchGreeting();
    }
  }, [userProfile, countdown.days]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500 flex flex-col items-center p-6 relative overflow-hidden">
      
      {/* Interactive Background Elements */}
      {bgItems.map(item => {
        const xOffset = (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 500)) * item.factor;
        const yOffset = (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 500)) * item.factor;
        return (
          <motion.div
            key={item.id}
            animate={{ x: xOffset, y: yOffset }}
            transition={{ type: "spring", stiffness: 100, damping: 25 }}
            className="absolute text-5xl opacity-60 drop-shadow-lg pointer-events-none z-0"
            style={{ left: item.left, top: item.top }}
          >
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 + (item.id % 3), ease: "easeInOut" }}
            >
              {item.emoji}
            </motion.div>
          </motion.div>
        );
      })}

      <div className="w-full max-w-2xl mt-12 relative z-10">
        <div className="flex justify-end mb-4 z-20 relative">
          <button 
            onClick={() => setShowSettings(true)}
            className="text-sm font-bold text-indigo-900 bg-white/40 hover:bg-white/60 transition-colors px-6 py-3 rounded-full backdrop-blur-md shadow-lg border border-white/50 flex items-center gap-2"
          >
            <span>Settings</span>
            <span className="text-lg">⚙️</span>
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl p-8 mb-8 relative border-4 border-white/50">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500 bg-indigo-100 shadow-inner">
              {userProfile?.selectedAvatar && (
                <img src={userProfile.selectedAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Hey, {userProfile?.name}!</h1>
              <p className="text-indigo-400 font-bold text-lg">Welcome to your dashboard.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 relative border-2 border-indigo-100 shadow-inner">
            {loadingGreeting ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
                  <div className="h-4 bg-indigo-200 rounded w-5/6"></div>
                </div>
              </div>
            ) : (
              <p className="text-xl font-medium text-indigo-900 leading-relaxed italic">
                "{greeting}"
              </p>
            )}
            <div className="absolute -bottom-4 -right-4 text-4xl drop-shadow-md">✨</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[3rem] shadow-2xl p-10 text-center relative overflow-hidden border-4 border-white/20">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl"
          />
          
          <h2 className="text-3xl font-black mb-8 text-indigo-200 uppercase tracking-widest drop-shadow-sm relative z-10">Countdown to Birthday</h2>
          <div className="flex justify-center gap-4 md:gap-8 relative z-10">
            <div className="flex flex-col items-center bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/20 min-w-[100px]">
              <span className="text-5xl md:text-7xl font-black drop-shadow-md">{countdown.days}</span>
              <span className="text-sm md:text-base font-bold text-indigo-200 mt-2 uppercase tracking-wider">Days</span>
            </div>
            <div className="text-5xl md:text-7xl font-black text-indigo-300/50 self-center">:</div>
            <div className="flex flex-col items-center bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/20 min-w-[100px]">
              <span className="text-5xl md:text-7xl font-black drop-shadow-md">{countdown.hours}</span>
              <span className="text-sm md:text-base font-bold text-indigo-200 mt-2 uppercase tracking-wider">Hours</span>
            </div>
            <div className="text-5xl md:text-7xl font-black text-indigo-300/50 self-center">:</div>
            <div className="flex flex-col items-center bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/20 min-w-[100px]">
              <span className="text-5xl md:text-7xl font-black drop-shadow-md">{countdown.minutes}</span>
              <span className="text-sm md:text-base font-bold text-indigo-200 mt-2 uppercase tracking-wider">Mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl p-8 max-w-md w-full relative border-4 border-white/50"
            >
              <button onClick={closeSettings} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-800 text-2xl font-bold w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center transition-colors">
                ✕
              </button>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">Settings ⚙️</h2>
              
              <div className="space-y-4 mb-12">
                <Toggle label="Push Notifications" value={settings.notifications} onChange={() => setSettings(s => ({...s, notifications: !s.notifications}))} />
                <Toggle label="Fun Sound Effects" value={settings.sounds} onChange={() => setSettings(s => ({...s, sounds: !s.sounds}))} />
                <Toggle label="Public Birthday" value={settings.publicBirthday} onChange={() => setSettings(s => ({...s, publicBirthday: !s.publicBirthday}))} />
              </div>

              <div className="relative h-32 flex flex-col items-center justify-end border-t-2 border-zinc-100 pt-6">
                <button 
                  onMouseEnter={handleLogoutHover}
                  onClick={handleLogOut}
                  className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-zinc-700 to-zinc-900 hover:from-zinc-800 hover:to-black shadow-lg transition-all z-10"
                >
                  {logoutText}
                </button>
                
                <motion.button
                  onMouseEnter={handleDeleteHover}
                  onClick={() => deleteEscapes >= 7 ? setShowDeleteModal(true) : handleDeleteHover()}
                  animate={{ x: deletePos.x, y: deletePos.y }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute bottom-6 py-3 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/30 whitespace-nowrap z-20"
                >
                  {deleteTexts[Math.min(deleteEscapes, deleteTexts.length - 1)]}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-md w-full relative overflow-hidden border-4 border-red-100"
            >
              <h3 className="text-3xl font-black text-red-600 mb-4">Delete Account?</h3>
              <p className="text-zinc-600 mb-8 font-medium text-lg">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              
              {deleteError && (
                <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold border-2 border-red-200">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError('');
                    closeSettings();
                  }}
                  disabled={isDeleting}
                  className="px-6 py-4 rounded-2xl font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors disabled:opacity-50 flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-6 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex-1 shadow-lg shadow-red-500/30"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
