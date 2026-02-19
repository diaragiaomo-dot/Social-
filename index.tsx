
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Instagram, 
  Linkedin, 
  Mail, 
  Zap,
  Menu,
  X,
  Sparkles,
  Mic,
  MicOff,
  BarChart,
  Video,
  Globe,
  User,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- Configuration & Data ---
const CONFIG = {
  name: "Giacomo Diara",
  title: "Digital Strategy & Creative Design",
  email: "diaragiacomo@gmail.com",
  social: {
    linkedin: "https://www.linkedin.com/in/giacomodiara",
    instagram: "https://www.instagram.com/giacomodiara",
  }
};

const NAV_ITEMS = [
  { label: 'Servizi', href: '#servizi' },
  { label: 'Chi Sono', href: '#chi-sono' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contatti', href: '#contatti' },
];

const SERVICES = [
  {
    id: 'smm',
    title: "Social Media Management",
    icon: <BarChart size={24} />,
    desc: "Strategie verticali su TikTok e Meta per scalare la presenza organica e adv.",
    tags: ["TikTok Strategy", "Content Plan", "Community Management"]
  },
  {
    id: 'web',
    title: "Web Architecture",
    icon: <Globe size={24} />,
    desc: "Landing page e siti WordPress focalizzati sulla conversione e sulla velocità.",
    tags: ["UX/UI Design", "Conversion Rate", "SEO Ready"]
  },
  {
    id: 'video',
    title: "Dynamic Video Editing",
    icon: <Video size={24} />,
    desc: "Editing ritmato e coinvolgente per formati short-form (Reels/TikTok).",
    tags: ["CapCut Expert", "Visual Storytelling", "Hooks"]
  }
];

const PORTFOLIO = [
  { id: 1, title: "Social Feed Concept", category: "Social Design", tech: "Canva" },
  { id: 2, title: "Brand Identity", category: "Branding", tech: "Adobe Suite" },
  { id: 3, title: "Web Mockup", category: "Web Design", tech: "WordPress" },
  { id: 4, title: "Short Form Video", category: "Video Editing", tech: "CapCut" }
];

const GIACOMO_CONTEXT = `
Sei il "Gemello Digitale" di Giacomo Diara. Giacomo è un esperto in SMM, Web Design e Video Editing.
PERSONALITÀ: Professionale, sintetico, energico, cordiale.
LINGUA: Italiano.
OBIETTIVO: Rispondere a domande sui servizi di Giacomo, fissare contatti via email (${CONFIG.email}) e mostrare competenza digitale.
`;

// --- Helpers ---
const encode = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

// --- Components ---

const SectionHeading = ({ subtitle, title, centered = false }: { subtitle: string, title: string, centered?: boolean }) => (
  <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
    <motion.span 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-electric-blue text-[10px] font-black uppercase tracking-[0.4em] mb-4 block"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none"
    >
      {title}
    </motion.h2>
  </div>
);

const Navbar = ({ onToggleAI, aiActive, isLive }: any) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm border-b border-zinc-100' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#top" className="text-xl font-black tracking-tighter flex items-center gap-2 group">
          <div className="w-8 h-8 bg-zinc-950 text-white rounded-lg flex items-center justify-center text-xs font-bold group-hover:bg-electric-blue transition-colors">GD</div>
          <span>GIACOMO<span className="text-electric-blue">DIARA</span></span>
        </a>

        <div className="hidden md:flex items-center gap-10">
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-electric-blue transition-colors">{item.label}</a>
            ))}
          </div>
          <button 
            onClick={onToggleAI}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${aiActive ? 'bg-electric-blue text-white shadow-lg shadow-blue-500/30' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'}`}
          >
            <Sparkles size={14} className={isLive ? 'animate-pulse' : ''} />
            AI Twin
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-b border-zinc-100 overflow-hidden">
            <div className="px-6 py-10 flex flex-col gap-6 text-[11px] font-black uppercase tracking-widest">
              {NAV_ITEMS.map((item) => (
                <a key={item.label} href={item.href} onClick={() => setIsOpen(false)}>{item.label}</a>
              ))}
              <button onClick={() => { onToggleAI(); setIsOpen(false); }} className="text-electric-blue flex items-center gap-2 font-black uppercase tracking-widest text-[11px]">
                <Sparkles size={14}/> AI Assistant
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AIAgent = ({ isOpen, onToggle, isLive, setIsLive }: any) => {
  const [history, setHistory] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const sessionRef = useRef<any>(null);
  const statusRef = useRef(status);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, status]);

  const startSession = async () => {
    if (sessionRef.current) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            const source = inCtx.createMediaStreamSource(stream);
            const proc = inCtx.createScriptProcessor(4096, 1, 1);
            proc.onaudioprocess = (e) => {
              if (statusRef.current !== 'listening') return;
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(proc);
            proc.connect(inCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) {
              setHistory(prev => {
                const last = prev[prev.length-1];
                if (last?.role === 'model') return [...prev.slice(0, -1), { ...last, text: last.text + msg.serverContent!.outputTranscription!.text }];
                return [...prev, { role: 'model', text: msg.serverContent!.outputTranscription!.text }];
              });
            }
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatus('speaking');
              const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.onended = () => setStatus('idle');
              source.start();
            }
          },
          onclose: () => { setIsLive(false); sessionRef.current = null; setStatus('idle'); },
          onerror: () => { setIsLive(false); setStatus('idle'); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: GIACOMO_CONTEXT,
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { console.error(e); }
  };

  const handleToggleMic = () => {
    if (!isLive) {
      startSession();
      setStatus('listening');
    } else {
      setStatus(prev => prev === 'listening' ? 'idle' : 'listening');
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-[150]">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute bottom-20 left-0 w-[350px] bg-white rounded-[32px] shadow-2xl border border-zinc-100 overflow-hidden flex flex-col">
            <div className="bg-zinc-950 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Digital Twin</span>
              </div>
              <button onClick={onToggle} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="h-[300px] overflow-y-auto p-6 space-y-4 bg-zinc-50/50 custom-scrollbar">
              {history.length === 0 && <p className="text-zinc-400 text-xs italic text-center py-10">Inizia a parlare per attivare il gemello digitale...</p>}
              {history.map((h, i) => (
                <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-[12px] ${h.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-100 text-zinc-700'}`}>
                    {h.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-6 border-t border-zinc-100">
              <button 
                onClick={handleToggleMic}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${status === 'listening' ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-950 text-white hover:bg-electric-blue'}`}
              >
                {status === 'listening' ? <MicOff size={16} /> : <Mic size={16} />}
                {status === 'listening' ? 'Stop' : isLive ? 'Parla ora' : 'Attiva AI'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={onToggle} className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all group ${isOpen ? 'bg-zinc-950 text-white rotate-90' : 'bg-electric-blue text-white hover:scale-105'}`}>
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />}
      </button>
    </div>
  );
};

const App = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-inter overflow-x-hidden">
      <Navbar onToggleAI={() => setIsAIOpen(!isAIOpen)} aiActive={isAIOpen} isLive={isLive} />
      <AIAgent isOpen={isAIOpen} onToggle={() => setIsAIOpen(!isAIOpen)} isLive={isLive} setIsLive={setIsLive} />

      {/* Hero Section */}
      <section id="top" className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-blue-50/30 blur-[150px] rounded-full -z-10" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="text-electric-blue text-[10px] font-black uppercase tracking-[0.5em] mb-6 block italic">Junior Digital Strategist</span>
          <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter leading-[0.8] mb-12 italic uppercase">
            Scolpire la <br /> <span className="gradient-text">Presenza</span> Digitale
          </h1>
          <p className="text-zinc-500 text-xl md:text-2xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium italic">
            "Semplifico la complessità del web con strategie social audaci e design funzionale."
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#portfolio" className="bg-zinc-950 text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-electric-blue transition-all shadow-xl shadow-zinc-950/10">Portfolio</a>
            <a href="#contatti" className="bg-white border-2 border-zinc-100 px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-electric-blue transition-all">Contatti</a>
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="servizi" className="py-32 px-6 bg-zinc-50/50 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading subtitle="Expertise" title="Cosa posso fare per te" centered />
          <div className="grid md:grid-cols-3 gap-10">
            {SERVICES.map((s, i) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-zinc-50 text-electric-blue rounded-2xl flex items-center justify-center mb-8 group-hover:bg-electric-blue group-hover:text-white transition-all">
                  {s.icon}
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4">{s.title}</h3>
                <p className="text-zinc-500 mb-8 leading-relaxed">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="chi-sono" className="py-32 px-6 bg-white scroll-mt-24">
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading subtitle="About" title="Giacomo Diara" centered />
          <div className="space-y-10 text-xl md:text-2xl text-zinc-600 leading-relaxed font-medium">
            <p>Sono un creativo digitale che crede nel potere della narrazione visiva unita alla precisione tecnica.</p>
            <p>Essere <strong className="text-zinc-950">"Junior"</strong> non è un limite, ma una licenza per innovare, testare nuovi trend e utilizzare tool all'avanguardia prima degli altri.</p>
            <div className="pt-10 flex justify-center gap-12">
               <div className="text-center">
                 <div className="text-5xl font-black text-electric-blue italic mb-1">100%</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Passione</div>
               </div>
               <div className="w-px h-16 bg-zinc-100 hidden md:block" />
               <div className="text-center">
                 <div className="text-5xl font-black text-electric-blue italic mb-1">7/24</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Curiosità</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 px-6 bg-zinc-950 text-white rounded-t-[60px] md:rounded-t-[100px] scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading subtitle="Showcase" title="Archivio Lavori" />
          <div className="grid md:grid-cols-2 gap-8">
            {PORTFOLIO.map((item, i) => (
              <motion.div 
                key={item.id}
                whileHover={{ scale: 0.98 }}
                className="bg-zinc-900 aspect-video rounded-[40px] p-12 flex flex-col justify-end border border-zinc-800 hover:border-electric-blue transition-all cursor-pointer relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-electric-blue text-[10px] font-black uppercase tracking-widest mb-4">{item.category}</span>
                <h3 className="text-4xl font-black italic uppercase mb-2 group-hover:text-electric-blue transition-colors">{item.title}</h3>
                <p className="text-zinc-500 font-bold text-sm">Tech: {item.tech}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts Section */}
      <section id="contatti" className="py-32 px-6 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20">
          <div>
            <SectionHeading subtitle="Contact" title="Iniziamo Qualcosa" />
            <p className="text-zinc-500 text-xl italic mb-12">"Il futuro del tuo brand merita una visione fresca e digitale. Parliamone ora."</p>
            <div className="space-y-6">
              <a href={`mailto:${CONFIG.email}`} className="flex items-center gap-6 p-8 bg-zinc-50 rounded-[32px] hover:bg-blue-50 transition-colors group">
                <Mail className="text-electric-blue group-hover:scale-110 transition-transform" size={32} />
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Diretto</div>
                  <div className="text-xl font-bold">{CONFIG.email}</div>
                </div>
              </a>
              <div className="flex gap-6">
                 <a href={CONFIG.social.linkedin} target="_blank" className="flex-1 p-8 bg-zinc-50 rounded-[32px] flex flex-col items-center gap-3 hover:bg-zinc-100 transition-colors">
                    <Linkedin size={24} className="text-electric-blue" />
                    <span className="text-[9px] font-black uppercase tracking-widest">LinkedIn</span>
                 </a>
                 <a href={CONFIG.social.instagram} target="_blank" className="flex-1 p-8 bg-zinc-50 rounded-[32px] flex flex-col items-center gap-3 hover:bg-zinc-100 transition-colors">
                    <Instagram size={24} className="text-electric-blue" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Instagram</span>
                 </a>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-50 p-12 rounded-[50px]">
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-4">Nome</label>
                 <input type="text" placeholder="Giacomo Rossi" className="w-full bg-white border-0 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" />
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-4">Email</label>
                 <input type="email" placeholder="mail@esempio.it" className="w-full bg-white border-0 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" />
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-4">Messaggio</label>
                 <textarea rows={4} placeholder="Parlami del tuo progetto..." className="w-full bg-white border-0 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium resize-none" />
               </div>
               <button className="w-full bg-zinc-950 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-[11px] hover:bg-electric-blue transition-all shadow-xl">Invia Messaggio</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-100 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <div className="text-2xl font-black tracking-tighter uppercase">GIACOMO<span className="text-electric-blue">DIARA</span></div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
             {NAV_ITEMS.map(i => <a key={i.label} href={i.href} className="hover:text-electric-blue transition-colors">{i.label}</a>)}
          </div>
          <div className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.5em]">© {new Date().getFullYear()} ALL RIGHTS RESERVED</div>
        </div>
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
