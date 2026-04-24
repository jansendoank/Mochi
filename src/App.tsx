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
import { sounds } from './services/sounds';
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
    sounds.playPop();
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
      sounds.playWin();
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
    sounds.playPop();
    setIsLoading(false);
    speak(cleanText);
  };

  const startNewGame = () => {
    const startMsg = "Ayo main tebak permen! Mochi akan berikan petunjuk tentang permen ajaib dari tokoku, dan kamu harus tebak apa gunanya! Siap? {GO}";
    setInput('Ayo main!');
    handleSend();
  };

  const handlePoke = () => {
    sounds.playTick();
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
    sounds.playTick();
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
            onClick={() => {
              setUseVoice(!useVoice);
              sounds.playTick();
            }}
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

      <main className="flex-1 p-4 md:p-8 overflow-hidden relative z-10 w-full h-full">
        {/* Full Screen Chat Container */}
        <div className="max-w-6xl mx-auto w-full h-full bg-white/40 backdrop-blur-xl rounded-[3.5rem] border-4 border-white shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Left Decoration / Mochi Integrated View */}
          <div className="flex-[0.8] lg:flex-1 relative flex items-center justify-center border-b border-white/20 md:border-b-0 md:border-r border-white/20 bg-gradient-to-br from-white/10 to-transparent">
            
            {/* The Floating Mochi Bubble INSIDE the Chat Border */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 z-10">
              <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-full border-[10px] border-white/80 shadow-[0_20px_60px_rgba(255,183,197,0.3),inset_0_4px_20px_rgba(255,255,255,0.8)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(255,183,197,0.4)]">
                <Canvas camera={{ position: [0, 0, 5], fov: 40 }} gl={{ alpha: true, antialias: true }}>
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
              </div>

              {/* Game Button Integrated inside Left Panel */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    startNewGame();
                    sounds.playTick();
                  }}
                  className="bg-[#ff8ba7] text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-xl group border-2 border-white transition-all hover:bg-[#ff7091]"
                >
                  <Gamepad2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Main Kuis Magic!</span>
                </motion.button>
              </div>
            </div>

            {/* Reaction Overlay (Integrated with left panel) */}
            <AnimatePresence>
              {currentEmotion !== 'IDLE' && (
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-12 left-12 bg-white/90 backdrop-blur-md p-4 rounded-3xl border-2 border-[#ffd1dc] shadow-xl flex items-center gap-4 z-30"
                >
                  <div className="bg-[#fff5f7] p-2 rounded-xl">
                    {currentEmotion === 'HAPPY' && <Heart className="w-6 h-6 text-pink-500 fill-current animate-pulse" />}
                    {currentEmotion === 'SHY' && <div className="text-2xl">😳</div>}
                    {currentEmotion === 'SAD' && <CloudRain className="w-6 h-6 text-blue-400" />}
                    {currentEmotion === 'SURPRISED' && <Stars className="w-6 h-6 text-yellow-400 animate-spin" />}
                    {currentEmotion === 'CLUMSY' && <Ghost className="w-6 h-6 text-purple-400" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff8ba7]">Mochi Status</span>
                    <span className="text-sm font-bold text-[#5c4044]">{currentEmotion}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Chat Logic */}
          <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl h-full min-h-0">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 md:space-y-6 scroll-smooth custom-scrollbar"
            >
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 md:gap-4 max-w-[85%] md:max-w-[70%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-[#ff8ba7]' : 'bg-white border border-[#ffd1dc]'}`}>
                      {m.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <Bot className="w-4 h-4 md:w-5 md:h-5 text-[#ff8ba7]" />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className={`p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm relative overflow-hidden ${
                        m.role === 'user' 
                          ? 'bg-[#ff8ba7] text-white rounded-tr-none' 
                          : 'bg-white text-[#5c4044] border-2 border-[#fff5f7] rounded-tl-none shadow-[0_2px_10px_rgba(255,209,220,0.05)]'
                      }`}>
                        {m.text}
                        {m.gameStatus === 'WIN' && <Trophy className="absolute -top-1 -right-1 w-8 h-8 text-yellow-400 opacity-20" />}
                      </div>
                      {m.emotion && <span className="text-[8px] font-bold text-[#ffc2d1] uppercase tracking-widest ml-2">{m.emotion}</span>}
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
                MOCHI...
              </div>
            )}
          </div>

          <div className="p-4 md:p-6 bg-white/60 border-t-2 border-[#fff5f7]">
            <div className="relative group max-w-2xl mx-auto w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pesan..."
                className="w-full bg-white border-2 border-[#ffd1dc]/30 rounded-2xl py-3 px-5 pr-14 focus:outline-none focus:ring-4 focus:ring-[#ff8ba7]/10 focus:border-[#ff8ba7]/40 transition-all placeholder:text-[#ffd1dc] shadow-sm text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#ff8ba7] text-white rounded-xl hover:bg-[#ff7091] disabled:opacity-50 disabled:bg-[#ffd1dc] transition-all shadow-md active:scale-95"
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
