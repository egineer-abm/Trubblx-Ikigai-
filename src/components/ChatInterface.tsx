import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, User, Brain } from "lucide-react";
import { Message } from "../types";

interface Props {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  pillar: string;
}

export default function ChatInterface({ messages, onSendMessage, isTyping, pillar }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const pillars = ['passion', 'mission', 'vocation', 'profession'];
  const currentIdx = pillars.indexOf(pillar);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ 
          top: scrollRef.current.scrollHeight, 
          behavior: 'smooth' 
        });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white border-t lg:border border-page-border lg:rounded-2xl overflow-hidden shadow-editorial">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-page-border bg-page-bg/50 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-page-text flex items-center justify-center text-page-text">
              <Sparkles size={18} spellCheck={false} className="lg:w-5 lg:h-5" />
            </div>
            <div>
              <h1 className="font-serif italic text-lg lg:text-xl">Ikigai Guide</h1>
              <p className="text-[8px] lg:text-[10px] uppercase tracking-[0.2em] opacity-30 font-bold">Discovering your purpose</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3">
            <button 
              onClick={() => onSendMessage("I'm feeling a bit stuck. Could you explain the current question in a different way or share an example of what others might say here?")}
              className="flex items-center gap-3 px-4 py-2 border border-page-border hover:border-page-text text-[9px] uppercase tracking-[0.2em] font-bold text-page-text/40 hover:text-page-text transition-all bg-white active:scale-[0.98]"
              title="Get a hint or rephrase the question"
            >
              <Sparkles size={10} className="opacity-50" />
              <span>Hint</span>
            </button>
            <button 
              onClick={() => onSendMessage("I'd like to take a mindful breath. Let's pause for a moment of silence.")}
              className="flex items-center gap-3 px-4 py-2 border border-page-border hover:border-passion/30 text-[9px] uppercase tracking-[0.2em] font-bold text-page-text/40 hover:text-passion transition-all bg-white active:scale-[0.98] group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-passion animate-pulse" />
              <span>Breath</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-[8px] lg:text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">Current Pillar:</span>
            <span className="text-[9px] lg:text-[11px] uppercase tracking-[0.15em] font-bold text-passion">{pillar}</span>
          </div>
          <span className="text-[8px] lg:text-[10px] italic opacity-40">Step {currentIdx + 1} of 4</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-10 bg-page-bg/10 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] lg:max-w-[85%] flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-2 opacity-30 text-[8px] lg:text-[9px] uppercase tracking-widest font-bold">
                  {m.role === 'user' ? (
                    <>
                      <span>You</span>
                      <User size={8} className="lg:w-2.5 lg:h-2.5" />
                    </>
                  ) : (
                    <>
                      <Brain size={8} className="lg:w-2.5 lg:h-2.5" />
                      <span>The Guide</span>
                    </>
                  )}
                </div>
                <div className={`leading-relaxed ${
                  m.role === 'user' 
                    ? 'text-xs lg:text-sm font-medium text-right underline underline-offset-8 decoration-page-text/10' 
                    : 'font-sans text-base lg:text-[22px] font-normal leading-[1.6] tracking-tight text-page-text/90 bg-white border border-page-border/50 p-6 lg:p-10 rounded-[1.5rem] lg:rounded-[2.5rem] shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start items-center gap-2"
          >
            <div className="flex gap-1.5 opacity-30">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1 h-1 bg-page-text rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 lg:p-8 border-t border-page-border bg-white">
        <div className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Type your reflection..."
            className="w-full bg-transparent border-b border-page-text/20 py-3 lg:py-4 pr-10 lg:pr-12 text-sm focus:outline-none focus:border-page-text placeholder:italic placeholder:opacity-30 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:opacity-100 opacity-40 transition-opacity disabled:opacity-10"
          >
            <Send size={16} className="lg:w-[18px] lg:h-[18px]" />
          </button>
        </div>
      </form>
    </div>
  );
}
