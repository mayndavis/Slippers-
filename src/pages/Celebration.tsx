import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { differenceInYears } from 'date-fns';
import { logOut } from '../firebase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Celebration() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const handleLogOut = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fetchBirthdayMessage = async () => {
    if (!userProfile?.dateOfBirth) return;
    
    try {
      const dobDate = userProfile.dateOfBirth?.toDate ? userProfile.dateOfBirth.toDate() : new Date(userProfile.dateOfBirth);
      const age = differenceInYears(new Date(), dobDate);
      
      const prompt = `Generate a highly personalized, uplifting birthday message for ${userProfile.name} who is turning ${age} today. 
      They are interested in: ${userProfile.interests?.join(', ')}. 
      The message MUST include:
      - Their exact new age (${age}).
      - Uplifting encouragement.
      - A faith-based reminder that God is with them.
      - A specific acknowledgment that they have reached this milestone through God's help, mercy, and grace.
      - Contextual references to their interests.
      Tone: Joyful, celebratory, and deeply encouraging. Keep it under 4 sentences.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      setMessage(response.text || "Happy Birthday! May God bless you abundantly this year.");
    } catch (error) {
      console.error("Error generating birthday message:", error);
      setMessage("Happy Birthday! May God bless you abundantly this year.");
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  useEffect(() => {
    if (confirmed) {
      triggerConfetti();
      fetchBirthdayMessage();
    }
  }, [confirmed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Playful background elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-20 left-10 text-6xl opacity-40 drop-shadow-lg"
      >
        🎉
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 text-6xl opacity-40 drop-shadow-lg"
      >
        🎂
      </motion.div>
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
        className="absolute top-40 right-20 text-5xl opacity-30 drop-shadow-lg"
      >
        ✨
      </motion.div>
      <motion.div 
        animate={{ y: [0, 30, 0], rotate: [0, -20, 20, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-40 left-20 text-5xl opacity-30 drop-shadow-lg"
      >
        🎁
      </motion.div>

      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={handleLogOut}
          className="text-sm font-bold text-white/60 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/10 backdrop-blur-sm"
        >
          Log Out
        </button>
      </div>
      <AnimatePresence mode="wait">
        {!confirmed ? (
          <motion.div
            key="confirmation"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl p-12 text-center max-w-lg w-full z-10 border-4 border-white/50"
          >
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-600 mb-6">Wait...</h1>
            <p className="text-2xl text-purple-800 font-bold mb-8">Are you REALLY the birthday star?</p>
            <div className="flex gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfirmed(true)}
                className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold text-xl py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-white/20"
              >
                Yes, it's me! 🎉
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="celebration"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex flex-col items-center w-full max-w-3xl z-10"
          >
            {/* Dancing Slippers */}
            <div className="flex gap-8 mb-12">
              <motion.div
                animate={{ y: [0, -40, 0], rotate: [0, 20, -20, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                className="text-7xl drop-shadow-2xl"
              >
                👣
              </motion.div>
              <div className="w-56 h-56 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-fuchsia-100 z-20 relative">
                {userProfile?.selectedAvatar && (
                  <img src={userProfile.selectedAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
              </div>
              <motion.div
                animate={{ y: [0, -40, 0], rotate: [0, -20, 20, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }}
                className="text-7xl drop-shadow-2xl"
              >
                👣
              </motion.div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 text-center border-2 border-white/30 shadow-2xl relative overflow-hidden">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute -bottom-20 -left-20 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-2xl"
              />

              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-lg relative z-10">
                Happy Birthday, {userProfile?.name}!
              </h1>
              
              {loading ? (
                <div className="animate-pulse flex flex-col items-center space-y-4 mt-8 relative z-10">
                  <div className="h-4 bg-white/40 rounded w-3/4"></div>
                  <div className="h-4 bg-white/40 rounded w-5/6"></div>
                  <div className="h-4 bg-white/40 rounded w-2/3"></div>
                </div>
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl md:text-3xl font-medium text-fuchsia-100 leading-relaxed italic relative z-10 drop-shadow-md"
                >
                  "{message}"
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
