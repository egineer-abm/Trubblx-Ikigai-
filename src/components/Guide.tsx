import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Heart, 
  Star, 
  Globe, 
  DollarSign, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Zap,
  Leaf,
  Anchor,
  Compass
} from "lucide-react";

interface Props {
  onClose: () => void;
  initialStep?: number;
}

export default function Guide({ onClose, initialStep = 0 }: Props) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const guideSteps = [
    {
      id: "mastery",
      icon: <Sparkles className="w-5 h-5" />,
      title: "The Art of Gentle Reflection",
      subtitle: "Navigating Your Journey",
      content: "Trubblx is a rhythmic dialogue between you and clarity. Speak freely, as if journaling in the quiet of dawn. Use specific examples, mention old hobbies, or describe feelings in detail. The more honest your input, the more profound the final synthesis will be.",
      reflection: "Where to start? Click 'Start Journey' on the home screen. Type your thoughts. When a realm is complete, it will turn blue. Your progress is saved automatically.",
      color: "text-passion"
    },
    {
      id: "mechanics",
      icon: <Zap className="w-5 h-5" />,
      title: "Sacred Mechanics",
      subtitle: "The Interface of Being",
      content: "Watch the spheres at the top of your chat. As each realm of your life—Passion, Mission, Vocation, and Profession—finds its voice, the spheres will ignite. Completion is not the goal; clarity is.",
      reflection: "Use the 'Stuck?' button if you need a hint. The 'Journal' (top right) captures your findings in real-time. Once all four realms are blue, Trubblx will synthesize your Ikigai.",
      color: "text-talent"
    },
    {
      id: "ai",
      icon: <Compass className="w-5 h-5" />,
      title: "The AI Interface",
      subtitle: "Intelligent Guidance",
      content: "Our AI is not just a chat bot; it is a curator of your potential. It uses Gemini's reasoning to connect patterns in your stories that you might miss. It listens for the 'why' behind your 'what'.",
      reflection: "Pro-tip: If you're feeling a specific emotion, tell the AI. It will adapt its line of inquiry to your state of mind. You are in control of the pace.",
      color: "text-mission"
    },
    {
      id: "intro",
      icon: <FlowerIcon />,
      title: "The Architecture of Purpose",
      subtitle: "A Sacred Journey Inward",
      content: "Ikigai is the ancient wisdom of finding your 'reason for being.' It is the delicate equilibrium where your inner passion, planetary mission, professional vocation, and economic profession converge. In the Trubblx sanctuary, we treat this not as a problem to be solved, but as a resonance to be discovered.",
      reflection: "Take a deep breath. Close your eyes for 10 seconds. What is the single most important word you would want written on your heart's wall?",
      color: "text-page-text"
    },
    {
      id: "ai",
      icon: <Compass className="w-5 h-5" />,
      title: "Intelligence as a Mirror",
      subtitle: "The Gemini Protocol",
      content: "Our system utilizes the Gemini large language model not as a simple generator, but as a cognitive mirror. It employs Socratic inquiry and sentiment analysis to identify semantic threads in your responses, weave them into actionable insights, and map them against the four foundational spheres of human existence.",
      reflection: "Pro-tip: Don't hold back. Speak to the AI as you would to a trusted mentor. It is trained to listen for the 'silence between your words'—the subtle clues of your true calling.",
      color: "text-mission"
    },
    {
      id: "mechanics",
      icon: <Zap className="w-5 h-5" />,
      title: "The Rhythm of Interaction",
      subtitle: "Synchronous Discovery",
      content: "The interface is designed with 'Cognitive Pacing' in mind. As you answer questions, the AI populates the four spheres of your Ikigai. The visual feedback (colored spheres) indicates the depth of data captured for each dimension. When all spheres reach structural integrity, the 'Synthesis' option is unlocked.",
      reflection: "The Journal in the top right is your dynamic memory. It extracts 'Atomic Insights' from your conversation, ensuring that no epiphany is lost to the stream of dialogue.",
      color: "text-talent"
    },
    {
      id: "love",
      icon: <Heart className="w-5 h-5" />,
      title: "Pillar I: Passion",
      subtitle: "The Inner Engine",
      content: "Passion is the 'Intrinsic Reward' system. This realm isolates activities that trigger a 'Flow State'—where the boundary between the self and the task dissolves. We look for visceral reactions, lost hobbies, and the things you do simply because they make you feel alive.",
      reflection: "Think of your childhood. What was the one thing you could do for hours without ever looking at a clock? That is a fundamental frequency of your passion.",
      color: "text-passion"
    },
    {
      id: "good",
      icon: <Star className="w-5 h-5" />,
      title: "Pillar II: Talent",
      subtitle: "Architectural Mastery",
      content: "This represents your 'Competitive Advantage'—the intersection of natural neurological aptitude and thousands of hours of deliberate practice. It's not just what you do, but the unique *way* you do it that sets you apart.",
      reflection: "Ask yourself: What is easy for me that others find difficult? This 'Easiness' is often the shadow of a profound talent that you've taken for granted.",
      color: "text-talent"
    },
    {
      id: "need",
      icon: <Globe className="w-5 h-5" />,
      title: "Pillar III: Mission",
      subtitle: "The World's Hunger",
      content: "Mission is your 'External Impact.' It aligns your personal joy with a global necessity. This requires an honest look at the world's fractures—environmental, social, or technological—and deciding which ones you are uniquely positioned to heal.",
      reflection: "If you had all the money in the world, what is the one global problem you would spend your life trying to solve? This is the core of your mission.",
      color: "text-mission"
    },
    {
      id: "paid",
      icon: <DollarSign className="w-5 h-5" />,
      title: "Pillar IV: Vocation",
      subtitle: "Material Sustainability",
      content: "The 'Economic Reality.' Purpose without sustainability is a recipe for burnout. This pillar identifies the market value of your contributions, ensuring that your work in the world supports your existence in the material plane.",
      reflection: "What service can you provide that people value so much they are willing to exchange their resources for it? Sustainability is the foundation of long-term impact.",
      color: "text-vocation"
    },
    {
      id: "export",
      icon: <Anchor className="w-5 h-5" />,
      title: "The Blueprint Export",
      subtitle: "Tangible Manifestation",
      content: "Once synthesized, you can export your 'Purpose Blueprint.' This is a high-fidelity documentation of your current state of being. It includes your core foundations, personalized discovery pathways, and a professional-grade visualization of your Ikigai.",
      reflection: "The report is designed to be a living document. Print it, hang it in your sanctuary, and revisit it as you evolve. Your Ikigai is not static; it is a living, breathing map.",
      color: "text-page-text"
    },
    {
      id: "privacy",
      icon: <Leaf className="w-5 h-5" />,
      title: "Privacy & Sanctuary",
      subtitle: "Your Sacred Data",
      content: "Your reflections are yours alone. Trubblx operates as a local-first sanctuary for your thoughts. We do not store your personal stories on permanent servers. The AI processing happens via transient sessions to ensure your journey remains private and secure.",
      reflection: "Feel safe to be vulnerable. The walls of the sanctuary are built to protect your truth, not to export it. Your progress is stored locally in your browser's memory.",
      color: "text-talent"
    }
  ];

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = guideSteps[currentStep];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-y-auto"
    >
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 lg:top-8 lg:right-8 p-3 hover:bg-page-bg rounded-md transition-all group z-50 text-page-text/40 hover:text-page-text"
      >
        <X size={20} />
      </button>

      <div className="w-full max-w-2xl min-h-screen p-8 lg:p-24 relative z-10 flex flex-col mx-auto">
        <div className="flex flex-col items-center mb-16">
          <img src="/Trubblx_transparent.png" alt="Trubblx Logo" className="h-20 w-auto object-contain mb-6" />
          <h2 className="text-xl font-serif italic opacity-40">Documentation</h2>
        </div>
        
        {/* Navigation - Architectural Minimalism */}
        <div className="flex items-center gap-10 mb-32 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-page-border/40" />
          {guideSteps.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentStep(i)}
              className={`pb-5 text-[10px] uppercase tracking-[0.4em] font-medium transition-all relative ${
                i === currentStep ? 'text-page-text' : 'text-page-text/20 hover:text-page-text/50'
              }`}
            >
              {i === currentStep && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-page-text" 
                />
              )}
              {i + 1}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-20 flex-1"
          >
            {/* Header - Precise Typography */}
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className={`p-2 rounded-sm border border-page-border/30 transition-colors duration-1000 ${step.color.replace('text', 'bg').replace('passion', 'passion/5').replace('talent', 'talent/5').replace('mission', 'mission/5').replace('vocation', 'vocation/5')}`}>
                  {React.cloneElement(step.icon as React.ReactElement, { size: 12, className: step.color })}
                </div>
                <span className={`text-[10px] uppercase tracking-[0.6em] font-bold ${step.color}`}>{step.subtitle}</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-serif text-page-text tracking-tight leading-[1.05]">
                {step.title}
              </h2>
            </div>

            {/* Content Body - High Density Minimalism */}
            <div className="max-w-xl">
              <p className="text-xl font-serif text-page-text/60 leading-[1.8] font-light">
                {step.content}
              </p>
            </div>

            {/* Instruction Card - Solid Structure */}
            <div className="pt-20 border-t border-page-border/30">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-[1px] h-3 bg-page-text/20" />
                  <h4 className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30">
                    A Moment of Pause
                  </h4>
                </div>
                <div className="pl-4 border-l border-passion/30">
                  <p className="text-xl font-serif italic text-page-text/50 leading-relaxed max-w-lg selection:bg-passion/10">
                    "{step.reflection}"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer - Functional Elegance */}
        <div className="mt-32 pt-12 border-t border-page-border/50 flex items-center justify-between">
          <div className="flex gap-10">
            {currentStep > 0 && (
              <button 
                onClick={prevStep}
                className="text-[10px] uppercase tracking-[0.4em] font-bold text-page-text/30 hover:text-page-text transition-all flex items-center gap-3 group"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Previous
              </button>
            )}
          </div>
          <button 
            onClick={currentStep === guideSteps.length - 1 ? onClose : nextStep}
            className="px-12 py-5 border border-page-text text-page-text hover:bg-page-text hover:text-white text-[10px] uppercase tracking-[0.5em] font-bold rounded-sm transition-all flex items-center gap-5 active:scale-[0.98]"
          >
            {currentStep === guideSteps.length - 1 ? "Enter Sanctuary" : "Next Revelation"}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function FlowerIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower2">
      <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/>
      <path d="M12 3v4"/>
      <path d="M12 17v4"/>
      <path d="M3 12h4"/>
      <path d="M17 12h4"/>
      <path d="M18.36 5.64l-2.82 2.82"/>
      <path d="M8.46 15.54l-2.82 2.82"/>
      <path d="M5.64 5.64l2.82 2.82"/>
      <path d="M15.54 15.54l2.82 2.82"/>
    </svg>
  );
}
