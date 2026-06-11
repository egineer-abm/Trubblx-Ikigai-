import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Heart, 
  Star, 
  Globe, 
  DollarSign, 
  Compass, 
  Sparkles, 
  BookOpen, 
  Activity, 
  Clock, 
  Brain, 
  Play, 
  Pause,
  Award,
  AlertCircle
} from "lucide-react";

interface Props {
  onClose: () => void;
  initialStep?: number;
}

export default function Guide({ onClose, initialStep = 0 }: Props) {
  const [activeTab, setActiveTab] = useState<'manual' | 'breathing' | 'articles' | 'stuck'>('manual');
  const [currentManualStep, setCurrentManualStep] = useState(0);

  // Breathing Simulator state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedBreaths, setCompletedBreaths] = useState(0);

  // Breathing simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isBreathing) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phase
            setBreathPhase((currentPhase) => {
              switch (currentPhase) {
                case 'inhale':
                  return 'holdIn';
                case 'holdIn':
                  return 'exhale';
                case 'exhale':
                  return 'holdOut';
                case 'holdOut':
                  setCompletedBreaths((b) => b + 1);
                  return 'inhale';
                default:
                  return 'inhale';
              }
            });
            return 4; // Reset phase duration
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSecondsLeft(4);
      setBreathPhase('inhale');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathing]);

  const guideSteps = [
    {
      title: "The Socratic Mirror",
      subtitle: "A Sacred Space for Purpose",
      content: "Trubblx isn't just a database of your responses—it is a secure cognitive mirror. Through Socratic dialogue, Gemini processes semantic patterns in your stories to unlock insights in the areas you may take for granted.",
      tip: "We treat finding purpose not as a tactical problem to be solved, but as a subtle self-resonance to discover. Speak as if writing in a daily journal.",
      icon: <Compass className="w-5 h-5 text-page-text" />
    },
    {
      title: "The Socratic Spheres",
      subtitle: "Four Anchors of Human Flow",
      content: "As you speak with the AI, watch the progress meters. The model listens for signals in your stories, categorizing them into: Passion (your joy), Mission (world cracks), Vocation (societal needs), and Profession (market viability).",
      tip: "You don't need to answer mechanically. Speak organic truths; our AI maps them to the appropriate sphere synchronously behind the scenes.",
      icon: <Brain className="w-5 h-5 text-passion" />
    },
    {
      title: "Active State Retention",
      subtitle: "Manual & Continuous Sinking",
      content: "Your answers and session milestones are securely written to high-fidelity cloud Firestore as you chat, preserving every insight. The 'Save Progress' button gives you manual piece of mind while active snapshotting handles the background synchrony.",
      tip: "Need to take a breather and step away? Click 'Save Progress' to sync everything, then close the tab. Return anytime to re-enter your Sanctuary exactly where you left off.",
      icon: <Star className="w-5 h-5 text-talent" />
    }
  ];

  const articles = [
    {
      title: "Decelerating the Soul: Mindfulness and Purpose",
      author: "Inspired by Calm.com Care team",
      readTime: "3 min read",
      summary: "True purpose is rarely found under extreme stress. It is only when the sympathetic nervous system slows down that self-reflective answers emerge.",
      copy: "Modern career hunting treats finding purpose like a hyper-efficient hackathon. But Ikigai—which translates to 'the feeling of being alive'—cannot be hacked. Our ancestors cultivated clarity in moments of deep solitude: watching steam lift off morning tea, or walking amongst old growth forests. When we feel overwhelmed by Socratic inquiry, pausing for a single mindful minute shifts us from our active, stress-reactive analytical brain to our organic, self-reflective neural network."
    },
    {
      title: "The Socratic Path: How to Converse with Your Future",
      author: "Trubblx Philosophical Board",
      readTime: "4 min read",
      summary: "Understand the subtle science of using prompt dialogue as an mirror of your subconsciousness.",
      copy: "Often, when someone asks 'What are you passionate about?', our mind draws a complete blank. This is because passion is non-verbal; it lives in the body as excitement, warmth, and flow states. Socratic dialogue works by asking you specific, concrete, micro-analogies: 'Describe something you built as a child where hours disappeared' or 'What frustrates you so much about the world that you'd fix it for free?'. By answering these, you bypass your internal editor, allowing true, raw insights to bubble to the surface."
    },
    {
      title: "Harmonizing Labor with Planetary Need",
      author: "Sustainable Ikigai Council",
      readTime: "3 min read",
      summary: "Weaving material stability and global restorative compassion together.",
      copy: "A common mistake in career planning is over-focusing on what markets pay for, ending in high-compensated burnout. The opposite mistake—absolute dedication to noble planetary causes with zero financial strategy—leads to financial exhaustive stress. True harmony lies in the delicate cross-stitching of 'Sustained Vocations'. By knowing both what you excel at and what societies desperately need, you can market useful solutions, establishing a protective cocoon of cash flow that fuels your larger mission of service."
    }
  ];

  const stuckPrompts = [
    {
      question: "Struggling with Passion (What You Love)?",
      exercise: "The 10-Year Retro Audit",
      description: "Close your eyes and remember yourself exactly 10 years ago. Who did you spend time with? What book, game, or physical play did you lose yourself in for hours? Jot this down in the Journal. Your adult passion is often a mature variation of this exact intrinsic joy."
    },
    {
      question: "Struggling with Talent (What You're Good At)?",
      exercise: "The Shadow of Compliments",
      description: "We are often blind to our greatest capabilities because they are easy to us. Ask yourself: What tasks or problems do people constantly dump on you because 'you handle them so effortlessly'? If colleagues say 'You are so good with nervous clients' or 'You simplify complex data', that is an epic talent. Record it!"
    },
    {
      question: "Struggling with Mission (What World Needs)?",
      exercise: "The Heartbreak Query",
      description: "Look at modern news. What is the one social, ecological, structural, or emotional deficit that makes your heart twist with genuine anger or sorrow? If it's environmental neglect, childhood education gap, or community isolation, that fracture is your direct invitation to act."
    },
    {
      question: "Struggling with Vocation (What Can Be Paid For)?",
      exercise: "The Value-Transaction Audit",
      description: "If you had all your living expenses fully cleared for the next five years, what service would you still happily render because you know people value it enough to say 'thank you'? Your Ikigai economic avenue resides inside the things people happily pay to resolve."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex bg-white/95 backdrop-blur-md overflow-hidden"
    >
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row h-screen border-l border-r border-page-border bg-white shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-md hover:bg-page-bg transition-colors z-50 text-page-text/40 hover:text-page-text"
        >
          <X size={20} />
        </button>

        {/* Sidebar navigation */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-page-border p-6 md:p-10 flex flex-col justify-between shrink-0 bg-page-bg/10">
          <div className="space-y-12">
            <div className="flex flex-col items-center md:items-start">
              <img src="/Trubblx_transparent.png" alt="Trubblx Logo" className="h-14 w-auto object-contain mb-4" />
              <h3 className="text-sm uppercase tracking-[0.2em] font-bold opacity-30 mt-1">Calm Sanctuary</h3>
            </div>

            <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0">
              {[
                { id: 'manual', label: 'The Manual', icon: <Compass className="w-4 h-4" /> },
                { id: 'breathing', label: 'Breathing Space', icon: <Activity className="w-4 h-4" /> },
                { id: 'articles', label: 'Sanctuary Essays', icon: <BookOpen className="w-4 h-4" /> },
                { id: 'stuck', label: 'Struggling?', icon: <Sparkles className="w-4 h-4" /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[11px] uppercase tracking-wider font-bold transition-all shrink-0 md:w-full ${
                      isActive 
                        ? 'bg-page-text text-white shadow-md shadow-page-text/10' 
                        : 'text-page-text/40 hover:text-page-text hover:bg-page-bg/50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:block">
            <p className="text-[9px] uppercase tracking-widest font-bold opacity-20">Trubblx Reflection Protocol v1.2</p>
          </div>
        </aside>

        {/* Main interactive window */}
        <main className="flex-1 overflow-y-auto p-8 md:p-16 flex flex-col justify-between min-h-0 bg-white">
          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Socratic Manual */}
              {activeTab === 'manual' && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-10 py-10"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-widest text-passion font-bold">Chapter {currentManualStep + 1} of 3</span>
                      <div className="h-px w-8 bg-page-border" />
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-serif text-page-text tracking-tight italic">
                      {guideSteps[currentManualStep].title}
                    </h2>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-30">
                      {guideSteps[currentManualStep].subtitle}
                    </p>
                  </div>

                  <p className="text-lg font-serif leading-[1.8] text-page-text/70">
                    {guideSteps[currentManualStep].content}
                  </p>

                  <div className="p-6 bg-page-bg rounded-2xl border border-page-border border-l-4 border-l-passion/40">
                    <span className="text-[8px] uppercase tracking-widest font-bold opacity-40 block mb-2">Sanctuary Suggestion:</span>
                    <p className="text-sm font-serif italic text-page-text/60 leading-relaxed">
                      "{guideSteps[currentManualStep].tip}"
                    </p>
                  </div>

                  {/* Manual pagination */}
                  <div className="flex justify-between items-center pt-8 border-t border-page-border/50">
                    <div className="flex gap-2">
                      {guideSteps.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentManualStep(i)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            i === currentManualStep ? 'bg-page-text w-6' : 'bg-page-border hover:bg-page-text/40'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {currentManualStep > 0 && (
                        <button 
                          onClick={() => setCurrentManualStep(p => p - 1)}
                          className="px-6 py-2 border border-page-border hover:border-page-text text-[10px] uppercase tracking-widest font-bold text-page-text/50 hover:text-page-text transition-colors"
                        >
                          Prev
                        </button>
                      )}
                      {currentManualStep < guideSteps.length - 1 ? (
                        <button 
                          onClick={() => setCurrentManualStep(p => p + 1)}
                          className="px-6 py-2 bg-page-text text-white text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-transform"
                        >
                          Next
                        </button>
                      ) : (
                        <button 
                          onClick={() => setActiveTab('breathing')}
                          className="px-6 py-2 bg-passion text-white text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-transform"
                        >
                          Enter Breathing Space
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Mindful Box Breathing */}
              {activeTab === 'breathing' && (
                <motion.div
                  key="breathing"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-12 py-10 text-center"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-passion font-semibold">
                      <Clock size={14} />
                      <span className="text-[10px] uppercase tracking-widest">Active Mindfulness Exercises</span>
                    </div>
                    <h2 className="text-4xl font-serif italic text-page-text">A Space to Pause & Reset</h2>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-30 max-w-sm mx-auto leading-relaxed">
                      Inspired by Calm.com’s restorative breathing cycle. Use this Box Breathing simulator to ease mind fog before journaling.
                    </p>
                  </div>

                  {/* Active Simulator Circle */}
                  <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
                    
                    {/* Pulsing Back Glow */}
                    <AnimatePresence>
                      {isBreathing && (
                        <motion.div
                          animate={{ 
                            scale: breathPhase === 'inhale' ? 1.6 : breathPhase === 'holdIn' ? 1.6 : breathPhase === 'exhale' ? 1.0 : 1.0,
                            opacity: [0.15, 0.35, 0.15]
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-4 rounded-full bg-passion/20 blur-xl z-0"
                        />
                      )}
                    </AnimatePresence>

                    {/* Central Lotus Element */}
                    <motion.div
                      animate={isBreathing ? {
                        scale: breathPhase === 'inhale' ? 1.4 : breathPhase === 'holdIn' ? 1.4 : breathPhase === 'exhale' ? 0.95 : 0.95,
                        backgroundColor: breathPhase === 'holdIn' ? 'rgba(232, 158, 138, 0.15)' : 'rgba(244, 244, 242, 1)'
                      } : { scale: 1 }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="w-48 h-48 rounded-full border border-page-border bg-page-bg flex flex-col items-center justify-center z-10 shadow-lg relative"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={breathPhase + (isBreathing ? secondsLeft : 'idle')}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="space-y-2 flex flex-col items-center justify-center"
                        >
                          {!isBreathing ? (
                            <Compass className="w-10 h-10 text-page-text/20 animate-spin-slow" />
                          ) : (
                            <>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-passion">
                                {breathPhase === 'inhale' && 'Inhale Slowly'}
                                {breathPhase === 'holdIn' && 'Retain Breath'}
                                {breathPhase === 'exhale' && 'Exhale Gently'}
                                {breathPhase === 'holdOut' && 'Rest'}
                              </span>
                              <span className="text-4xl font-serif italic text-page-text">{secondsLeft}s</span>
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Breathing Controls */}
                  <div className="space-y-6 max-w-md mx-auto">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setIsBreathing(!isBreathing)}
                        className={`px-10 py-4 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-3 shadow-md ${
                          isBreathing 
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/15' 
                            : 'bg-page-text hover:bg-page-text/90 text-white'
                        }`}
                      >
                        {isBreathing ? <Pause size={12} /> : <Play size={12} />}
                        <span>{isBreathing ? "Pause Sanctuary" : "Start Box Breathing"}</span>
                      </button>

                      {completedBreaths > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-talent/10 text-talent border border-talent/20 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                          <Award size={12} />
                          <span>{completedBreaths} Cycles Done</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-page-bg/40 rounded-xl border border-page-border/50 text-xs italic opacity-40 leading-relaxed font-serif max-w-sm mx-auto">
                      "Inhale for 4s, hold for 4s, exhale for 4s, rest for 4s. Repeat this twice to restore clarity and creative resonance."
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Calm Sanctuary Essays */}
              {activeTab === 'articles' && (
                <motion.div
                  key="articles"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-12 py-10"
                >
                  <div className="space-y-3">
                    <h2 className="text-3xl font-serif text-page-text italic">The Calm.com Inspired Library</h2>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-30">Mental essays for self-alignment</p>
                  </div>

                  <div className="space-y-10">
                    {articles.map((art, index) => (
                      <div key={index} className="editorial-card p-8 bg-white border border-page-border rounded-2xl hover:border-page-text/15 transition-all space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-passion">{art.author}</span>
                          <span className="text-[9px] uppercase tracking-widest font-medium opacity-30">{art.readTime}</span>
                        </div>
                        <h3 className="text-xl font-serif italic text-page-text inline-block">{art.title}</h3>
                        <p className="text-xs uppercase tracking-widest font-bold opacity-30">{art.summary}</p>
                        <p className="text-sm font-serif text-page-text/60 leading-[1.7] italic pt-2">
                          {art.copy}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Struggling Drill Assistance */}
              {activeTab === 'stuck' && (
                <motion.div
                  key="stuck"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-12 py-10"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-passion font-semibold">
                      <AlertCircle size={14} />
                      <span className="text-[10px] uppercase tracking-widest">Self-Coaching Assistance</span>
                    </div>
                    <h2 className="text-3xl font-serif text-page-text italic">Proactive Support Prompts</h2>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-40 leading-relaxed">
                      If Socratic questions feel heavy or vague, perform one of these curated, gentle exercises right now to dissolve blockers.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {stuckPrompts.map((drill, dIdx) => (
                      <div key={dIdx} className="p-8 bg-page-bg/30 border border-page-border/50 rounded-2xl space-y-4">
                        <h4 className="font-serif italic text-lg text-page-text leading-tight">{drill.question}</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-talent" />
                          <span className="text-[10px] uppercase tracking-widest font-bold text-talent">Active exercise: {drill.description && drill.exercise}</span>
                        </div>
                        <p className="text-sm font-serif italic text-page-text/60 leading-relaxed pt-1">
                          {drill.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>
    </motion.div>
  );
}
