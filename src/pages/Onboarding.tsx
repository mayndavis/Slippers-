import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, logOut } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const INTERESTS = [
  "Anime", "Gaming", "Sports", "Music", "Art", "Reading", "Technology", 
  "Fashion", "Cooking", "Travel", "Movies", "Photography", "Fitness", "Nature"
];

export default function Onboarding() {
  const { currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Form State
  const [name, setName] = useState(currentUser?.displayName || '');
  const [gender, setGender] = useState('other');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('');
  const [currentAvatars, setCurrentAvatars] = useState<string[]>([]);

  // Escaping Button State
  const [escapeAttempts, setEscapeAttempts] = useState(0);
  const [maxEscapes] = useState(Math.floor(Math.random() * 12) + 3); // 3 to 14
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const generateAvatars = () => {
    const type = gender === 'female' ? 'adventurer' : gender === 'male' ? 'adventurer' : 'bottts';
    const bgColors = gender === 'female' ? ['ffd5dc', 'c0aede', 'b6e3f4', 'ffdfbf'] :
                     gender === 'male' ? ['b6e3f4', 'c0aede', 'ffdfbf', 'ffd5dc'] :
                     ['b6e3f4', 'c0aede', 'ffdfbf', 'ffd5dc'];
    
    const newAvatars = Array.from({ length: 4 }).map((_, i) => {
      const randomSeed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/${type}/svg?seed=${randomSeed}&backgroundColor=${bgColors[i]}`;
    });
    setCurrentAvatars(newAvatars);
  };

  useEffect(() => {
    if (step === 3) {
      generateAvatars();
    }
  }, [step, gender]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleButtonHover = () => {
    if (escapeAttempts < maxEscapes) {
      setEscapeAttempts(prev => prev + 1);
      // Limit movement to stay within the card boundaries
      const maxX = 120;
      const maxY = 100;
      const newX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * maxX * 0.6 + maxX * 0.4);
      const newY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * maxY * 0.6 + maxY * 0.4);
      setButtonPos({ x: newX, y: newY });
    }
  };

  const saveProfile = async () => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        name,
        gender,
        dateOfBirth: new Date(dob),
        email,
        interests: selectedInterests,
        selectedAvatar: avatar,
        onboardingComplete: true,
      }, { merge: true });
      await refreshProfile();
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleLogOut = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-400 to-teal-500 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Playful background elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-20 left-10 text-6xl opacity-80 drop-shadow-lg"
      >
        ✨
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 text-6xl opacity-80 drop-shadow-lg"
      >
        🎨
      </motion.div>

      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={handleLogOut}
          className="text-sm font-bold text-white/80 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/20 backdrop-blur-sm"
        >
          Log Out
        </button>
      </div>
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl p-10 relative border-4 border-white/50 z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <h2 className="text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 text-center">Let's get to know you!</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-1 ml-2">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-teal-50 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-teal-300 border-2 border-teal-100 text-teal-900 font-medium"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-1 ml-2">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-teal-50 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-teal-300 border-2 border-teal-100 text-teal-900 font-medium opacity-70"
                    placeholder="Your email"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-1 ml-2">Gender</label>
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value)}
                    className="w-full bg-teal-50 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-teal-300 border-2 border-teal-100 text-teal-900 font-medium"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-1 ml-2">Date of Birth</label>
                  <input 
                    type="date" 
                    value={dob} 
                    onChange={e => setDob(e.target.value)}
                    className="w-full bg-teal-50 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-teal-300 border-2 border-teal-100 text-teal-900 font-medium"
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => name && dob ? setStep(2) : alert('Please fill in name and DOB')}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-400 text-white font-bold text-lg py-4 rounded-2xl mt-8 shadow-lg hover:shadow-xl transition-all border-2 border-white/20"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <h2 className="text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 text-center">What do you like?</h2>
              <div className="flex flex-wrap gap-2 mb-12 justify-center">
                {INTERESTS.map(interest => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all border-2 ${
                      selectedInterests.includes(interest) 
                        ? 'bg-teal-500 text-white border-teal-600 shadow-md' 
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200'
                    }`}
                  >
                    {interest}
                  </motion.button>
                ))}
              </div>
              
              <div className="relative h-20 flex items-center justify-center">
                <motion.button
                  ref={buttonRef}
                  onMouseEnter={handleButtonHover}
                  onClick={() => escapeAttempts >= maxEscapes ? setStep(3) : handleButtonHover()}
                  animate={{ x: buttonPos.x, y: buttonPos.y }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 text-white font-bold text-lg py-4 px-8 rounded-2xl z-10 absolute shadow-xl border-2 border-white/20"
                >
                  {escapeAttempts >= maxEscapes ? "Okay, you caught me! Next" : "Save Interests"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <h2 className="text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 text-center">Pick your Avatar</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {currentAvatars.map((url, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAvatar(url)}
                    className={`cursor-pointer rounded-3xl overflow-hidden border-4 transition-all shadow-md ${
                      avatar === url ? 'border-teal-500 shadow-teal-500/50 scale-105' : 'border-transparent hover:border-teal-200'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-auto" referrerPolicy="no-referrer" />
                  </motion.div>
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateAvatars}
                className="w-full bg-teal-50 text-teal-700 font-bold py-3 rounded-2xl mb-4 hover:bg-teal-100 transition-colors border-2 border-teal-200"
              >
                Suggest New Avatars
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => avatar ? saveProfile() : alert('Pick an avatar!')}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-400 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-white/20"
              >
                Complete Setup
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
