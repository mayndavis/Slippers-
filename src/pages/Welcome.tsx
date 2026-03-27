import React from 'react';
import { signInWithGoogle } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Welcome() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/onboarding');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Playful background elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-20 left-10 text-6xl opacity-80 drop-shadow-lg"
      >
        👣
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 text-6xl opacity-80 drop-shadow-lg"
      >
        👣
      </motion.div>
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
        className="absolute top-40 right-20 text-5xl opacity-60 drop-shadow-lg"
      >
        ✨
      </motion.div>
      <motion.div 
        animate={{ y: [0, 30, 0], rotate: [0, -20, 20, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-40 left-20 text-5xl opacity-60 drop-shadow-lg"
      >
        🎉
      </motion.div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl p-10 text-center relative z-10 border-4 border-white/50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
        >
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-4 tracking-tight drop-shadow-sm">Slippers</h1>
          <p className="text-purple-800/80 mb-10 font-semibold text-lg">Your personalized birthday countdown experience.</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 border-2 border-white/20"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </motion.button>
      </div>
    </div>
  );
}
