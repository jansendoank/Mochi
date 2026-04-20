/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Volume2, VolumeX, Sparkles, User, Bot, Trash2 } from 'lucide-react';
import Mochi, { MochiEmotion } from './components/Mochi';
import { chatWithMochi } from './services/gemini';
import confetti from 'canvas-confetti';
import { Candy, Stars, Ghost, CloudRain, Heart, Gamepad2, Trophy, Frown } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  emotion?: MochiEmotion;
  gameStatus?: 'WIN' | 'LOSE' | 'NONE';
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'E-eto... Halo! Aku Mochi-kun. Aku penjaga Toko Permen Ajaib... Kamu mau main tebak permen denganku? Mochi~! ✨', emotion: 'SHY' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<MochiEmotion>('SHY');
  const [useVoice, setUseVoice] = useState(true);
  const [score, setScore] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speak = (text: string) => {
    if (!useVoice) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.9;
    utterance.rate = 1.2;
    utterance.lang = 'id-ID';
    
    utterance.onstart = () => setIsTalking(true);
    utterance.onend = () => setIsTalking(false);
    utterance.onerror = () => setIsTalking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const rawResponse = await chatWithMochi(userMessage, history);
    
    // Parse emotion tag
    let emotion: MochiEmotion = 'IDLE';
    let cleanText = rawResponse;
    const emotionMatch = rawResponse.match(/^\[(HAPPY|SHY|SAD|SURPRISED|CLUMSY|IDLE)\]/);
    if (emotionMatch) {
      emotion = emotionMatch[1] as MochiEmotion;
      cleanText = cleanText.replace(/^\[.*?\]\s*/, '');
    }

    // Parse game status
    let gameStatus: 'WIN' | 'LOSE' | 'NONE' = 'NONE';
    if (cleanText.includes('{WIN}')) {
      gameStatus = 'WIN';
      cleanText = cleanText.replace('{WIN}', '');
      setScore(s => s + 1);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ffd1dc', '#ffff00', '#00ff00']
      });
    } else if (cleanText.includes('{LOSE}')) {
      gameStatus = 'LOSE';
      cleanText = cleanText.replace('{LOSE}', '');
    }

    setMessages(prev => [...prev, { role: 'model', text: cleanText, emotion, gameStatus }]);
    setCurrentEmotion(emotion);
    setIsLoading(false);
    speak(cleanText);
  };

  const startNewGame = () => {
    const startMsg = "Ayo main tebak permen! Mochi akan berikan petunjuk tentang permen ajaib dari tokoku, dan kamu harus tebak apa gunanya! Siap? {GO}";
    setInput('Ayo main!');
    handleSend();
  };

  const handlePoke = () => {
    const pokeMessages = [
      { t: "[SHY] W-wah! Kaget! Jangan tekan aku begitu... Mochi~!", e: 'SHY' },
      { t: "[HAPPY] Hehe! geli tau! Kamu baik sekali! ✨", e: 'HAPPY' },
      { t: "[SURPRISED] Puwu! Kenapa kamu menekan aku? Apa aku terlihat seperti jelly?", e: 'SURPRISED' },
    ];
    const pick = pokeMessages[Math.floor(Math.random() * pokeMessages.length)];
    const emotion = pick.e as MochiEmotion;
    const cleanText = pick.t.replace(/^\[.*?\]\s*/, '');
    
    setCurrentEmotion(emotion);
    setMessages(prev => [...prev, { role: 'model', text: cleanText, emotion }]);
    speak(cleanText);
    
    if (emotion === 'HAPPY') {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.5 },
        colors: ['#ffd1dc']
      });
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: 'E-eto... kita mulai lagi ya? Mochi~! ✨', emotion: 'SHY' }]);
    setCurrentEmotion('SHY');
    setScore(0);
  };

  return (
    <div className="flex flex-col h-screen bg-[#fff5f7] font-sans overflow-hidden text-[#5c4044] relative">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 opacity-10 pointer-events-none animate-pulse">
        <Candy className="w-16 h-16 text-[#ff8ba7]" />
      </div>
      <div className="absolute bottom-40 right-10 opacity-10 pointer-events-none animate-bounce">
        <Stars className="w-20 h-20 text-[#ff8ba7]" />
      </div>

      {/* Header */}
      <header className="p-4 bg-white/80 backdrop-blur-md border-b-2 border-[#ffd1dc] flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ffd1dc] rounded-full flex items-center justify-center shadow-inner group">
            <Candy className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#ff8ba7]">Mochi's Magic Shop</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-[10px] uppercase tracking-widest text-[#ffc2d1] font-bold">Game Master Mode</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#fff5f7] px-3 py-1.5 rounded-2xl border border-[#ffd1dc] shadow-sm">
            <Trophy className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-xs font-bold text-[#ff8ba7]">{score}</span>
          </div>
          <button 
            onClick={() => setUseVoice(!useVoice)}
            className="p-2 rounded-full hover:bg-[#ffd1dc]/20 transition-colors"
            title="Toggle Voice"
          >
            {useVoice ? <Volume2 className="w-5 h-5 text-[#ff8ba7]" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>
          <button 
            onClick={clearChat}
            className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-300"
            title="Reset Game"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-6 gap-0 overflow-hidden relative z-10 max-w-6xl mx-auto w-full">
        {/* Integrated Container */}
        <div className="flex-1 flex flex-col md:flex-row bg-white/40 backdrop-blur-xl rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden w-full h-full">
          
          {/* Mochi Viewport (Integrated & Transparent) */}
          <div className="flex-[1.2] relative min-h-[300px] md:min-h-0 border-b-2 md:border-b-0 md:border-r-2 border-white/20">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true, antialias: true }}>
              <ambientLight intensity={0.8} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
              <Environment preset="city" />
              
              <Mochi isTalking={isTalking} emotion={currentEmotion} onPoke={handlePoke} />
              
              <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                minPolarAngle={Math.PI/3} 
                maxPolarAngle={Math.PI/1.5}
              />
              <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.15} far={10} color="#ff8ba7" />
            </Canvas>
            
            {/* Reaction Overlay */}
            <AnimatePresence>
              {currentEmotion !== 'IDLE' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-6 right-6 bg-white/60 backdrop-blur-md p-2 px-4 rounded-2xl border border-white shadow-sm flex items-center gap-2"
                >
                  {currentEmotion === 'HAPPY' && <Heart className="w-4 h-4 text-pink-500 fill-current animate-pulse" />}
                  {currentEmotion === 'SHY' && <div className="text-lg">😳</div>}
                  {currentEmotion === 'SAD' && <CloudRain className="w-4 h-4 text-blue-400" />}
                  {currentEmotion === 'SURPRISED' && <Stars className="w-4 h-4 text-yellow-400 animate-spin" />}
                  {currentEmotion === 'CLUMSY' && <Ghost className="w-4 h-4 text-purple-400" />}
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ff8ba7]">{currentEmotion}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute top-6 left-6 flex flex-col items-start gap-2">
               <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startNewGame}
                className="bg-white/80 backdrop-blur-md border border-white px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm group pointer-events-auto"
              >
                <Gamepad2 className="w-4 h-4 text-[#ff8ba7] group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-black text-[#ff8ba7] uppercase tracking-wider">Main Kuis</span>
              </motion.button>
            </div>
          </div>

          {/* Chat Container (Resized & Integrated) */}
          <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-md overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
            >
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-[#ff8ba7]' : 'bg-white border border-[#ffd1dc]'}`}>
                        {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-[#ff8ba7]" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm relative overflow-hidden ${
                          m.role === 'user' 
                            ? 'bg-[#ff8ba7] text-white rounded-tr-none' 
                            : 'bg-white text-[#5c4044] border border-[#ffd1dc] rounded-tl-none'
                        }`}>
                          {m.text}
                          {m.gameStatus === 'WIN' && <Trophy className="absolute -top-1 -right-1 w-8 h-8 text-yellow-400/20" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex justify-start items-center gap-3 text-[#ff8ba7] text-[10px] font-black pl-10 italic">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#ff8ba7] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[#ff8ba7] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[#ff8ba7] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  MOCHI IS THINKING...
                </div>
              )}
            </div>

            <div className="p-6 bg-white/40 border-t border-white/40">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ketik pesan..."
                  className="w-full bg-white/80 border border-white rounded-2xl py-3 px-5 pr-14 focus:outline-none focus:ring-2 focus:ring-[#ff8ba7]/20 transition-all placeholder:text-[#ffd1dc] shadow-sm text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#ff8ba7] text-white rounded-xl hover:bg-[#ff7091] disabled:opacity-50 disabled:bg-[#ffd1dc] transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Decorative Floor */}
      <div className="h-3 bg-gradient-to-r from-[#ffd1dc] via-[#ff8ba7] to-[#ffd1dc] opacity-30 blur-[2px]" />
    </div>
  );
}
