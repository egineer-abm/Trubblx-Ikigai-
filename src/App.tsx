/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  LogIn, 
  Plus, 
  History, 
  CheckCircle2, 
  ArrowRight,
  LogOut,
  Flower2,
  AlertCircle,
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  Share2,
  Save,
  Check
} from "lucide-react";
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from "./lib/firebase";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  getDocs,
  getDoc
} from "firebase/firestore";
import { generateQuestion, analyzeIkigai } from "./lib/gemini";
import { IkigaiSession, Message, Answers } from "./types";
import { downloadDiscoveryAsHTML } from "./lib/export";
import ChatInterface from "./components/ChatInterface";
import IkigaiDiagram from "./components/IkigaiDiagram";
import Journal from "./components/Journal";
import Guide from "./components/Guide";
import IkigaiExposition from "./components/IkigaiExposition";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<IkigaiSession[]>([]);
  const [activeSession, setActiveSession] = useState<IkigaiSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [view, setView] = useState<'home' | 'session' | 'history'>('home');
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [showJournal, setShowJournal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedSession, setSharedSession] = useState<IkigaiSession | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [recommendationFilter, setRecommendationFilter] = useState<'all' | 'remote' | 'creative' | 'social' | 'entrepreneurship'>('all');

  // Share Link Handler
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    if (shareId) {
      const fetchSharedSession = async () => {
        try {
          const docRef = doc(db, 'sessions', shareId);
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data().isPublic) {
            const data = { id: snap.id, ...snap.data() } as IkigaiSession;
            setSharedSession(data);
            setActiveSession(data);
            setView('session');
          }
        } catch (error) {
          console.error("Error fetching shared session:", error);
        }
      };
      fetchSharedSession();
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // Sync user profile safely
        const userDocRef = doc(db, 'users', u.uid);
        getDoc(userDocRef).then((snap) => {
          if (!snap.exists()) {
            setDoc(userDocRef, {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName || 'Friend',
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp()
            }).catch(err => console.error("Error creating user profile:", err));
          } else {
            // Update only if needed
            updateDoc(userDocRef, {
              updatedAt: serverTimestamp(),
              displayName: u.displayName || snap.data()?.displayName || 'Friend'
            }).catch(err => console.error("Error updating user profile:", err));
          }
        });
      } else {
        setSessions([]);
        setActiveSession(null);
        setView('home');
      }
    });
  }, []);

  // Sessions Listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "sessions"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as IkigaiSession));
      setSessions(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "sessions");
    });
  }, [user]);

  // Messages Listener
  useEffect(() => {
    if (!activeSession || (sharedSession && sharedSession.id === activeSession.id && !user)) return;
    if (sharedSession && sharedSession.id === activeSession.id && user?.uid !== activeSession.userId) return;
    
    const q = query(
      collection(db, `sessions/${activeSession.id}/messages`),
      orderBy("timestamp", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `sessions/${activeSession.id}/messages`);
    });
  }, [activeSession]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const startNewSession = async () => {
    if (!user) return;
    const newSessionData = {
      userId: user.uid,
      status: 'active',
      currentPillar: 'passion',
      answers: {
        whatYouLove: [],
        whatYouAreGoodAt: [],
        whatTheWorldNeeds: [],
        whatYouCanBePaidFor: []
      },
      completedPillars: [],
      pillarCompletionDates: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, "sessions"), newSessionData);
      setActiveSession({ id: docRef.id, ...newSessionData } as IkigaiSession);
      setView('session');
      
      // Initial AI greeting
      await sendMessageToAI(docRef.id, "Hello! I am ready to start my journey to find my Ikigai. What is the first thing we should explore?", true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "sessions");
    }
  };

  const handleManualSave = async () => {
    if (!activeSession || sharedSession) return;
    setSaveStatus('saving');
    try {
      await updateDoc(doc(db, "sessions", activeSession.id), {
        updatedAt: serverTimestamp()
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus('idle');
    }
  };

  const updateSessionAnswers = async (updatedAnswers: Answers) => {
    if (!activeSession) return;
    const updated = {
      ...activeSession,
      answers: updatedAnswers,
      updatedAt: new Date()
    };
    setActiveSession(updated);

    try {
      await updateDoc(doc(db, "sessions", activeSession.id), {
        answers: updatedAnswers,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating answers:", error);
    }
  };

  const handleAddAnswer = async (pillar: string, item: string) => {
    if (!activeSession || !item.trim()) return;
    const pillarMap: Record<string, keyof Answers> = {
      'passion': 'whatYouLove',
      'mission': 'whatTheWorldNeeds',
      'vocation': 'whatYouCanBePaidFor',
      'profession': 'whatYouAreGoodAt'
    };
    const answerKey = pillarMap[pillar];
    if (!answerKey) return;

    const currentAnswers = activeSession.answers[answerKey] || [];
    if (currentAnswers.includes(item.trim())) return;

    const updatedAnswers = {
      ...activeSession.answers,
      [answerKey]: [...currentAnswers, item.trim()]
    };

    await updateSessionAnswers(updatedAnswers);
  };

  const handleRemoveAnswer = async (pillar: string, index: number) => {
    if (!activeSession) return;
    const pillarMap: Record<string, keyof Answers> = {
      'passion': 'whatYouLove',
      'mission': 'whatTheWorldNeeds',
      'vocation': 'whatYouCanBePaidFor',
      'profession': 'whatYouAreGoodAt'
    };
    const answerKey = pillarMap[pillar];
    if (!answerKey) return;

    const currentAnswers = activeSession.answers[answerKey] || [];
    const updatedAnswers = {
      ...activeSession.answers,
      [answerKey]: currentAnswers.filter((_, i) => i !== index)
    };

    await updateSessionAnswers(updatedAnswers);
  };

  const sendMessageToAI = async (sessionId: string, text: string, isInitial = false) => {
    if (sharedSession) return; // Read-only for shared sessions
    setIsTyping(true);
    try {
      if (!isInitial) {
        await addDoc(collection(db, `sessions/${sessionId}/messages`), {
          role: 'user',
          content: text,
          timestamp: serverTimestamp()
        });
      }

      // Get history for context
      const msgsSnapshot = await getDocs(query(collection(db, `sessions/${sessionId}/messages`), orderBy("timestamp", "asc")));
      const history = msgsSnapshot.docs.map(d => ({ role: d.data().role, content: d.data().content }));
      
      const currentPillar = activeSession?.currentPillar || 'passion';
      const aiResponse = await generateQuestion(history, currentPillar);

      await addDoc(collection(db, `sessions/${sessionId}/messages`), {
        role: 'model',
        content: aiResponse.message,
        timestamp: serverTimestamp()
      });

      // Update Session State (Extract points and maybe move pillars)
      if (activeSession) {
        const pillarMap: Record<string, keyof Answers> = {
          'passion': 'whatYouLove',
          'mission': 'whatTheWorldNeeds',
          'vocation': 'whatYouCanBePaidFor',
          'profession': 'whatYouAreGoodAt'
        };
        
        const answerKey = pillarMap[activeSession.currentPillar];
        const newAnswers = { ...activeSession.answers };
        if (answerKey && aiResponse.extractedPoints?.length > 0) {
          const currentPoints = new Set(newAnswers[answerKey]);
          aiResponse.extractedPoints.forEach((p: string) => currentPoints.add(p));
          newAnswers[answerKey] = Array.from(currentPoints);
        }

        let nextPillar = activeSession.currentPillar;
        const newCompletedPillars = [...(activeSession.completedPillars || [])];
        const newPillarCompletionDates = { ...(activeSession.pillarCompletionDates || {}) };
        
        if (aiResponse.pillarSatisfied) {
          if (!newCompletedPillars.includes(activeSession.currentPillar)) {
            newCompletedPillars.push(activeSession.currentPillar);
            newPillarCompletionDates[activeSession.currentPillar] = serverTimestamp();
          }
          
          const flow = ['passion', 'mission', 'vocation', 'profession', 'done'];
          const currentIndex = flow.indexOf(activeSession.currentPillar);
          nextPillar = flow[currentIndex + 1] as any;
          
          if (nextPillar === 'done') {
            const analysis = await analyzeIkigai(newAnswers);
            await updateDoc(doc(db, "sessions", sessionId), {
              status: 'completed',
              currentPillar: 'done',
              answers: newAnswers,
              completedPillars: newCompletedPillars,
              pillarCompletionDates: newPillarCompletionDates,
              finalAnalysis: analysis,
              updatedAt: serverTimestamp()
            });
            return;
          }
        }

        await updateDoc(doc(db, "sessions", sessionId), {
          currentPillar: nextPillar,
          answers: newAnswers,
          completedPillars: newCompletedPillars,
          pillarCompletionDates: newPillarCompletionDates,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zen-bg">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-zen-olive"
        >
          <Flower2 size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-page-bg selection:bg-passion/20">
      {/* Header Section */}
      <header className="h-20 border-b border-page-border flex items-center justify-between px-10 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('home')}>
          <img src="/Trubblx_transparent.png" alt="Trubblx Logo" className="h-12 w-auto object-contain" />
          <div className="flex flex-col">
            <h1 className="text-xl font-serif italic leading-none tracking-tight text-page-text">Trubblx</h1>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold opacity-50">Ikigai Journey</span>
          </div>
        </div>
        
        {user ? (
          <nav className="flex items-center gap-4 lg:gap-8 text-[9px] lg:text-[11px] uppercase tracking-[0.15em] font-medium">
            <button 
              onClick={() => setView('home')} 
              className={`pb-1 transition-all ${view === 'home' ? 'border-b border-page-text' : 'opacity-40 hover:opacity-100'}`}
            >
              <span className="hidden sm:inline">The Journey</span>
              <span className="sm:hidden">Home</span>
            </button>
            <button 
              onClick={() => setView('history')} 
              className={`pb-1 transition-all ${view === 'history' ? 'border-b border-page-text' : 'opacity-40 hover:opacity-100'}`}
            >
              <span className="hidden sm:inline">My Progress</span>
              <span className="sm:hidden">History</span>
            </button>
            <div className="flex items-center gap-2 lg:gap-4 pl-4 lg:pl-8 border-l border-page-border">
              <button 
                onClick={() => { setGuideStep(0); setShowGuide(true); }}
                className="opacity-40 hover:opacity-100 transition-all group relative"
                title="Instructional Guide"
              >
                <div className="px-3 py-1 border border-page-text rounded-sm text-[9px] uppercase tracking-[0.2em] font-bold bg-white active:scale-95 shadow-sm">Sanctuary Docs</div>
              </button>
              <div className="hidden sm:flex h-6 w-6 lg:h-8 lg:w-8 rounded-full border border-page-text items-center justify-center text-[8px] lg:text-[10px] italic">
                {user.displayName?.split(" ").map(n => n[0]).join("")}
              </div>
              <button onClick={() => signOut(auth)} className="opacity-40 hover:text-red-500 transition-all">
                <LogOut size={12} className="lg:w-[14px] lg:h-[14px]" />
              </button>
            </div>
          </nav>
        ) : (
          <button 
            onClick={handleLogin}
            className="text-[11px] uppercase tracking-widest font-bold border border-page-text px-6 py-2 rounded-full hover:bg-page-text hover:text-white transition-all"
          >
            Sign In
          </button>
        )}
      </header>

      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto flex flex-col items-center justify-center text-center p-10 py-20"
            >
              <div className="max-w-3xl space-y-8 flex flex-col items-center">
                <img src="/Trubblx_transparent.png" alt="Trubblx Logo" className="h-32 w-auto object-contain mb-6 drop-shadow-sm" />
                <h2 className="text-6xl md:text-8xl font-serif leading-[0.9] tracking-tighter">
                  Discover your <span className="italic block mt-2 text-passion">Reason for Being</span>
                </h2>
                <p className="text-xl font-serif italic text-page-text/60 max-w-xl mx-auto leading-relaxed">
                  The Japanese art of combining your passion and talents to uncover your true purpose.
                </p>
                <div className="pt-10 flex gap-4">
                  <button 
                    onClick={handleLogin}
                    className="px-12 py-5 bg-page-text text-white text-[12px] uppercase tracking-[0.3em] font-bold rounded-full hover:scale-105 transition-transform shadow-2xl shadow-page-text/20"
                  >
                    Start Your Reflection
                  </button>
                  <button 
                    onClick={() => { setGuideStep(0); setShowGuide(true); }}
                    className="px-12 py-5 border border-page-text text-page-text text-[12px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-page-text hover:text-white transition-all"
                  >
                    How it works
                  </button>
                </div>
              </div>

              <div className="mt-48 w-full max-w-5xl space-y-32">
                <section className="text-left space-y-12">
                  <div className="flex flex-col md:flex-row gap-16 items-start">
                    <div className="flex-1 space-y-6">
                      <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">The Philosophy</p>
                      <h3 className="text-4xl font-serif leading-tight text-page-text/90">A Sacred Geometry <br/> of <span className="italic text-talent">Human Potential</span></h3>
                      <p className="text-lg font-serif italic text-page-text/50 leading-relaxed">
                        Ikigai (生き甲斐) is more than just a Venn diagram. It is a philosophy of living that suggests balance is not found, but built through honest reflection. Trubblx serves as your digital mirror, reflecting the intersections of your daily actions and your deepest aspirations.
                      </p>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="p-6 bg-passion/5 border border-passion/10 rounded-2xl">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-passion">Passion</h4>
                        <p className="text-[10px] font-serif italic opacity-60 italic">The things that make your heart beat faster and time dissolve.</p>
                      </div>
                      <div className="p-6 bg-talent/5 border border-talent/10 rounded-2xl">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-talent">Talent</h4>
                        <p className="text-[10px] font-serif italic opacity-60 italic">The unique frequencies where your aptitude meets discipline.</p>
                      </div>
                      <div className="p-6 bg-mission/5 border border-mission/10 rounded-2xl">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-mission">Impact</h4>
                        <p className="text-[10px] font-serif italic opacity-60 italic">Where your personal joy connects with the world's hunger.</p>
                      </div>
                      <div className="p-6 bg-vocation/5 border border-vocation/10 rounded-2xl">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-vocation">Resource</h4>
                        <p className="text-[10px] font-serif italic opacity-60 italic">Sustainable paths that support your existence in the material world.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
                  {[
                    { title: "Reflect", color: "bg-passion", desc: "Guided deep-thinking questions inspired by mindfulness and Socratic inquiry." },
                    { title: "Synthesize", color: "bg-talent", desc: "Our AI Intelligence extracts nuance from your story to map your personal intersections." },
                    { title: "Manifest", color: "bg-mission", desc: "Receive an actionable blueprint for integrating your purpose into your everyday life." }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-start text-left border-t border-page-border pt-8 group">
                      <div className={`h-1 w-8 ${item.color} mb-6 transition-all group-hover:w-16`}></div>
                      <h3 className="text-xs uppercase tracking-widest font-bold mb-4">{item.title}</h3>
                      <p className="text-base font-serif italic text-page-text/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </section>

                <section className="p-12 md:p-20 bg-page-text text-white rounded-[3rem] text-center space-y-8">
                   <h3 className="text-4xl md:text-5xl font-serif">Ready to <span className="italic">Begin?</span></h3>
                   <p className="text-lg opacity-40 font-serif italic max-w-xl mx-auto">Join thousands of seekers in the Trubblx sanctuary. Your reason for being is waiting to be named.</p>
                   <button 
                    onClick={handleLogin}
                    className="px-12 py-5 bg-passion text-white text-[12px] uppercase tracking-[0.3em] font-bold rounded-full hover:scale-105 transition-transform shadow-2xl"
                  >
                    Enter the Sanctuary
                  </button>
                </section>
              </div>
            </motion.div>
          ) : view === 'home' ? (
            <motion.div 
              key="dash"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 overflow-y-auto p-10 max-w-7xl mx-auto w-full space-y-16"
            >
              <div className="flex items-end justify-between border-b border-page-border pb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-2">Workspace</p>
                  <h2 className="text-5xl font-serif">Welcome back, <span className="italic">{user.displayName?.split(" ")[0]}</span></h2>
                </div>
                <button 
                  onClick={startNewSession}
                  className="bg-page-text text-white px-8 py-4 rounded-full text-[11px] uppercase tracking-widest font-bold hover:shadow-xl transition-all active:scale-95"
                >
                  Start New Journey
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sessions.length > 0 ? sessions.slice(0, 6).map((s) => (
                  <div 
                    key={s.id} 
                    onClick={() => { setActiveSession(s); setView('session'); }}
                    className="editorial-card p-8 group cursor-pointer hover:border-page-text/40 transition-all flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div className={`pillar-chip ${s.status === 'completed' ? 'bg-talent/20 text-talent' : 'bg-passion/20 text-passion'}`}>
                        {s.status === 'completed' ? 'Reflected' : 'In Progress'}
                      </div>
                      <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">
                        {new Date((s.updatedAt?.seconds || 0) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-serif mb-4 group-hover:italic transition-all">
                        {s.status === 'completed' ? s.finalAnalysis?.ikigai : `Exploring ${s.currentPillar}`}
                      </h4>
                      <p className="text-xs font-serif italic text-page-text/50 leading-relaxed line-clamp-3">
                        {s.status === 'completed' ? s.finalAnalysis?.summary : "Your path toward clarity is currently being charted. Continue your reflection to reveal the results."}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Resume Journey <ArrowRight size={10} />
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center editorial-card bg-page-bg/50 border-dashed border-2">
                    <p className="font-serif italic text-xl opacity-30">No inner journeys recorded yet. Your first path awaits.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : view === 'session' && activeSession ? (
            <motion.div 
              key="session-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col lg:flex-row h-full overflow-hidden"
            >
              <aside className="w-full lg:w-[380px] border-b lg:border-b-0 lg:border-r border-page-border bg-page-bg p-6 lg:p-10 flex flex-col lg:overflow-y-auto max-h-[30vh] lg:max-h-full shrink-0">
                <div className="mb-6 lg:mb-12">
                  <h2 className="font-serif italic text-xl lg:text-2xl mb-2 lg:mb-3">Guided Reflection</h2>
                  <p className="text-[9px] lg:text-xs text-page-text/50 leading-relaxed uppercase tracking-wider font-bold">Uncover the hidden intersections of your life's purpose.</p>
                </div>

                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
                  {['passion', 'mission', 'vocation', 'profession'].map((p, i) => {
                    const flow = ['passion', 'mission', 'vocation', 'profession', 'done'];
                    const activeIndex = flow.indexOf(activeSession.currentPillar);
                    const isComplete = i < activeIndex;
                    const isActive = activeSession.currentPillar === p;

                    return (
                      <div key={p} className={`flex items-center justify-between p-3 lg:p-4 border rounded-xl transition-all min-w-[140px] lg:min-w-0 ${
                        isActive ? 'bg-white border-page-text shadow-sm' : isComplete ? 'opacity-100 border-page-border' : 'opacity-40 border-transparent grayscale'
                      }`}>
                        <div className="flex items-center gap-3 lg:gap-4">
                          <span className={`h-5 w-5 lg:h-6 lg:w-6 rounded-full flex items-center justify-center text-[9px] lg:text-[10px] font-bold ${
                            isComplete ? 'bg-talent text-white' : isActive ? 'bg-page-text text-white' : 'border border-page-border text-page-text/30'
                          }`}>
                            {isComplete ? "✓" : i + 1}
                          </span>
                          <span className={`text-[9px] lg:text-[11px] uppercase tracking-[0.15em] font-bold ${isActive ? 'text-page-text' : 'text-page-text/60'}`}>{p}</span>
                        </div>
                        {isActive && <span className="hidden lg:block text-[9px] italic font-bold text-passion uppercase tracking-widest">Active</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Active Questionnaire Answers Management */}
                {activeSession.currentPillar !== 'done' && (
                  <div className="mt-6 p-4 rounded-2xl border border-page-border bg-white shadow-3sm space-y-4">
                    <div className="flex justify-between items-center bg-white">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-page-text/60">Extracted Findings</h4>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-page-bg rounded text-page-text">
                        {(() => {
                           const pMap: Record<string, 'whatYouLove' | 'whatYouAreGoodAt' | 'whatTheWorldNeeds' | 'whatYouCanBePaidFor'> = {
                             'passion': 'whatYouLove',
                             'mission': 'whatTheWorldNeeds',
                             'vocation': 'whatYouCanBePaidFor',
                             'profession': 'whatYouAreGoodAt'
                           };
                           const key = pMap[activeSession.currentPillar];
                           return (activeSession.answers?.[key] || []).length;
                        })()} items
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {(() => {
                         const pMap: Record<string, 'whatYouLove' | 'whatYouAreGoodAt' | 'whatTheWorldNeeds' | 'whatYouCanBePaidFor'> = {
                           'passion': 'whatYouLove',
                           'mission': 'whatTheWorldNeeds',
                           'vocation': 'whatYouCanBePaidFor',
                           'profession': 'whatYouAreGoodAt'
                         };
                         const key = pMap[activeSession.currentPillar];
                         const list = (activeSession.answers?.[key] || []) as string[];
                         return list.map((ans, idx) => (
                           <div key={idx} className="flex justify-between items-center p-2 bg-page-bg border border-page-border/50 rounded-xl text-xs font-serif italic text-page-text/80 hover:bg-page-bg/80 transition-all">
                             <span className="truncate flex-1 pr-2">"{ans}"</span>
                             <button 
                               onClick={() => handleRemoveAnswer(activeSession.currentPillar, idx)}
                               className="text-page-text/40 hover:text-red-500 font-sans font-bold text-sm leading-none px-1"
                               title="Remove finding"
                             >
                               &times;
                             </button>
                           </div>
                         ));
                      })()}
                      {(() => {
                         const pMap: Record<string, 'whatYouLove' | 'whatYouAreGoodAt' | 'whatTheWorldNeeds' | 'whatYouCanBePaidFor'> = {
                           'passion': 'whatYouLove',
                           'mission': 'whatTheWorldNeeds',
                           'vocation': 'whatYouCanBePaidFor',
                           'profession': 'whatYouAreGoodAt'
                         };
                         const key = pMap[activeSession.currentPillar];
                         return (activeSession.answers?.[key] || []).length === 0 && (
                           <p className="text-[10px] italic opacity-40 py-4 text-center">No findings captured yet. Type in chat or add directly below.</p>
                         );
                      })()}
                    </div>

                    {/* Manual additions */}
                    <input 
                      type="text"
                      placeholder={`Press Enter to add finding...`}
                      className="w-full bg-page-bg text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-[0.5px] focus:ring-page-text font-serif italic placeholder:opacity-40 border border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.currentTarget as HTMLInputElement).value;
                          if (val.trim()) {
                            handleAddAnswer(activeSession.currentPillar, val);
                            (e.currentTarget as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                )}

                <div className="mt-auto pt-6 lg:pt-8 border-t border-page-border hidden lg:block">
                  <div className="bg-[#F5F2ED] p-6 rounded-2xl border border-[#EDE9E1] mb-6">
                    <div className="flex items-start gap-4">
                      <AlertCircle size={16} className="text-passion shrink-0 mt-1" />
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Personalized Tip</h4>
                        <div className="space-y-4">
                          <p className="text-[11px] font-serif italic leading-relaxed text-page-text/70">
                            {activeSession.currentPillar === 'passion' && "Think about what activities make you lose all track of time."}
                            {activeSession.currentPillar === 'mission' && "Consider what change you wish to see in the world most."}
                            {activeSession.currentPillar === 'vocation' && "Reflect on how your unique gifts could serve others."}
                            {activeSession.currentPillar === 'profession' && "List the skills others often ask for your help with."}
                            {activeSession.currentPillar === 'done' && "Your Ikigai is ready. Take a breath and reflect on the outcome."}
                          </p>
                          <button 
                            onClick={() => {
                              const pillarMap: Record<string, number> = {
                                'passion': 1,
                                'good': 2,
                                'mission': 3,
                                'vocation': 4,
                                'profession': 2 // profession and good are same here
                              };
                              setGuideStep(pillarMap[activeSession.currentPillar] || 0);
                              setShowGuide(true);
                            }}
                            className="text-[9px] uppercase tracking-widest font-bold underline opacity-50 hover:opacity-100"
                          >
                            Uncertain? View Guide
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!sharedSession && (
                      <>
                        <button 
                          onClick={() => setShowJournal(!showJournal)}
                          className={`w-full py-4 text-[11px] uppercase tracking-widest font-bold border rounded-full transition-all ${
                            showJournal ? 'bg-page-text text-white' : 'border-page-text text-page-text hover:bg-page-text/5'
                          }`}
                        >
                          {showJournal ? "Close Journal" : "Private Journal"}
                        </button>
                        <button 
                          onClick={handleManualSave}
                          disabled={saveStatus !== 'idle'}
                          className={`w-full py-4 text-[11px] uppercase tracking-widest font-bold border rounded-full transition-all flex items-center justify-center gap-2 ${
                            saveStatus === 'saved' 
                              ? 'bg-talent border-talent text-white' 
                              : 'border-page-text text-page-text hover:bg-page-text/5'
                          }`}
                        >
                          {saveStatus === 'saving' ? (
                            <span className="animate-pulse">Saving...</span>
                          ) : saveStatus === 'saved' ? (
                            <>
                              <Check size={14} /> Saved
                            </>
                          ) : (
                            <>
                              <Save size={14} /> Save Progress
                            </>
                          )}
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => {
                        setSharedSession(null);
                        setView('home');
                      }}
                      className="w-full py-4 text-[11px] uppercase tracking-widest font-bold text-page-text/40 hover:text-page-text transition-all"
                    >
                      {sharedSession ? "Start Your Journey" : "Exit Session"}
                    </button>
                  </div>
                </div>
              </aside>

              <section className="flex-1 bg-white overflow-hidden relative flex flex-col">
                {activeSession.status === 'completed' ? (
                  <div className="flex-1 overflow-y-auto p-16 space-y-20">
                    <div className="text-center space-y-6">
                      <p className="text-[11px] uppercase tracking-[0.4em] font-bold opacity-30 italic">
                        {sharedSession ? "Shared Discovery" : "Discovery Complete"}
                      </p>
                      <h2 className="text-7xl font-serif italic text-passion">{activeSession.finalAnalysis?.ikigai}</h2>
                      <div className="h-px w-24 bg-page-text mx-auto opacity-20"></div>
                      <p className="text-xl font-serif italic text-page-text/60 max-w-2xl mx-auto leading-relaxed">
                        "{activeSession.finalAnalysis?.summary}"
                      </p>
                      
                      <div className="flex items-center justify-center gap-4 pt-4">
                        <button 
                          onClick={() => downloadDiscoveryAsHTML(activeSession)}
                          className="px-6 py-2 border border-page-text rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-page-text hover:text-white transition-all flex items-center gap-2"
                        >
                          Download Sanctuary Doc
                        </button>
                        {!sharedSession && (
                          <button 
                            onClick={async () => {
                              if (!activeSession.isPublic) {
                                await updateDoc(doc(db, "sessions", activeSession.id), {
                                  isPublic: true,
                                  updatedAt: serverTimestamp()
                                });
                              }
                              setShowShareModal(true);
                            }}
                            className="px-6 py-2 bg-passion text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-passion/20"
                          >
                            <Share2 size={12} />
                            Share Discovery
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(activeSession, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ikigai-archive-${activeSession.id.slice(-6)}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="px-6 py-2 border border-page-border rounded-full text-[10px] uppercase tracking-widest font-bold opacity-60 hover:opacity-100 hover:border-page-text transition-all"
                        >
                          Archive Discovery
                        </button>
                      </div>
                    </div>

                    <div className="editorial-card p-10 bg-page-bg/30">
                      <IkigaiDiagram data={activeSession.finalAnalysis} answers={activeSession.answers} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {[
                        { label: "Your Passion", val: activeSession.finalAnalysis?.passion, color: "border-passion" },
                        { label: "Your Mission", val: activeSession.finalAnalysis?.mission, color: "border-mission" },
                        { label: "Your Vocation", val: activeSession.finalAnalysis?.vocation, color: "border-vocation" },
                        { label: "Your Profession", val: activeSession.finalAnalysis?.profession, color: "border-talent" },
                      ].map((item, i) => (
                        <div key={i} className={`p-8 border-l-4 ${item.color} bg-page-bg/50 rounded-r-2xl`}>
                          <p className="text-[9px] uppercase font-bold tracking-widest opacity-40 mb-3">{item.label}</p>
                          <p className="text-sm font-medium leading-relaxed italic">"{item.val}"</p>
                        </div>
                      ))}
                    </div>

                    {/* Highly Interactive Intersection Map and Purpose Exposition */}
                    <div className="pt-8 border-t border-page-border/40">
                      <IkigaiExposition data={activeSession.finalAnalysis} answers={activeSession.answers} />
                    </div>

                    <div className="pt-20 border-t border-page-border space-y-12">
                       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                         <h3 className="text-3xl font-serif italic">Personalized Path</h3>
                         
                         <div className="flex flex-wrap gap-2">
                           {['all', 'remote', 'creative', 'social', 'entrepreneurship'].map(cat => (
                             <button
                               key={cat}
                               onClick={() => setRecommendationFilter(cat as any)}
                               className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-all ${
                                 recommendationFilter === cat 
                                   ? 'bg-page-text text-white border-page-text' 
                                   : 'bg-transparent text-page-text/40 border-page-border hover:border-page-text/20'
                               }`}
                             >
                               {cat}
                             </button>
                           ))}
                         </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {activeSession.finalAnalysis?.recommendations
                            .filter(r => recommendationFilter === 'all' || r.category === recommendationFilter)
                            .map((r, i) => (
                              <motion.div 
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={i} 
                                className="space-y-4 p-6 bg-page-bg/20 rounded-2xl border border-page-border/50 group hover:border-page-text/20 transition-all"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="text-[40px] font-serif opacity-10 group-hover:opacity-20 transition-opacity">0{i+1}</span>
                                  <span className="text-[9px] uppercase tracking-tighter opacity-30 font-bold bg-page-text/10 px-2 py-0.5 rounded">{r.category}</span>
                                </div>
                                <p className="text-sm font-serif italic leading-relaxed text-page-text/70">{r.text}</p>
                              </motion.div>
                            ))}
                       </div>
                    </div>
                  </div>
                ) : (
                  <ChatInterface 
                    messages={messages} 
                    onSendMessage={(t) => sendMessageToAI(activeSession.id, t)}
                    isTyping={isTyping}
                    pillar={activeSession.currentPillar}
                  />
                )}
              </section>

              <AnimatePresence>
                {showJournal && (
                  <motion.aside
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className="w-[400px] border-l border-page-border bg-page-bg shadow-2xl p-10 overflow-y-auto z-10"
                  >
                    <Journal sessionId={activeSession.id} />
                  </motion.aside>
                )}
              </AnimatePresence>

              {/* Share Modal */}
              <AnimatePresence>
                {showShareModal && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowShareModal(false)}
                      className="absolute inset-0 bg-page-text/40 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
                    >
                      <div className="text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-passion/10 rounded-full flex items-center justify-center text-passion">
                          <Share2 size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-serif italic mb-2">Share Your Ikigai</h3>
                          <p className="text-xs uppercase tracking-widest font-bold opacity-30">Let the world see your resonance</p>
                        </div>

                        <div className="flex justify-center gap-4 py-4">
                          {[
                            { 
                              icon: <Twitter size={20} />, 
                              label: "Twitter", 
                              color: "bg-[#1DA1F2]",
                              onClick: () => {
                                const text = `I just discovered my Ikigai: ${activeSession.finalAnalysis?.ikigai} 🌸 Find your reason for being at Trubblx.`;
                                const url = `${window.location.origin}${window.location.pathname}?share=${activeSession.id}`;
                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                              }
                            },
                            { 
                              icon: <Linkedin size={20} />, 
                              label: "LinkedIn", 
                              color: "bg-[#0A66C2]",
                              onClick: () => {
                                const url = `${window.location.origin}${window.location.pathname}?share=${activeSession.id}`;
                                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                              }
                            },
                            { 
                              icon: <Facebook size={20} />, 
                              label: "Facebook", 
                              color: "bg-[#1877F2]",
                              onClick: () => {
                                const url = `${window.location.origin}${window.location.pathname}?share=${activeSession.id}`;
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                              }
                            }
                          ].map((social) => (
                            <button 
                              key={social.label}
                              onClick={social.onClick}
                              className={`w-12 h-12 rounded-2xl ${social.color} text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg`}
                              title={`Share on ${social.label}`}
                            >
                              {social.icon}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Or copy direct link</p>
                          <div className="flex items-center gap-2 p-2 bg-page-bg/50 rounded-xl border border-page-border">
                            <input 
                              readOnly 
                              value={`${window.location.origin}${window.location.pathname}?share=${activeSession.id}`}
                              className="bg-transparent text-[10px] flex-1 px-2 border-none focus:ring-0 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?share=${activeSession.id}`);
                              }}
                              className="p-2 bg-white rounded-lg shadow-sm hover:bg-page-bg transition-all"
                            >
                              <LinkIcon size={14} className="text-page-text" />
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => setShowShareModal(false)}
                          className="w-full py-4 text-[11px] uppercase tracking-widest font-bold text-page-text/40 hover:text-page-text transition-all"
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : view === 'history' && (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute inset-0 overflow-y-auto p-10 max-w-5xl mx-auto w-full space-y-20 mt-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-page-text pb-10 gap-8">
                <div>
                  <h2 className="text-7xl font-serif italic mb-4">Journey</h2>
                  <p className="text-xs uppercase tracking-[0.4em] font-bold opacity-30">The history of your unfolding purpose</p>
                </div>
                <button 
                  onClick={() => setView('home')}
                  className="px-10 py-4 bg-page-text text-white text-[10px] uppercase tracking-widest font-bold rounded-full hover:scale-105 transition-transform shadow-xl shadow-page-text/20"
                >
                  Return to Sanctuary
                </button>
              </div>

              <div className="relative space-y-24">
                {/* Timeline Axis */}
                <div className="absolute left-[39px] top-10 bottom-10 w-px bg-gradient-to-b from-page-border via-page-text/20 to-page-border hidden md:block" />

                {sessions.length === 0 ? (
                  <div className="text-center py-32 p-8 border border-dashed border-page-border rounded-[3rem] bg-page-bg/10">
                    <p className="font-serif italic text-2xl text-page-text/30">Your first reflection awaits.</p>
                  </div>
                ) : (
                  sessions.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map((s, index) => (
                    <motion.div 
                      key={s.id} 
                      onClick={() => { setActiveSession(s); setView('session'); }}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative flex flex-col md:flex-row items-start gap-12 group cursor-pointer"
                    >
                      {/* Timeline Node */}
                      <div className="hidden md:flex absolute left-[39px] top-14 -translate-x-1/2 w-5 h-5 rounded-full bg-white z-10 border-[5px] border-page-text group-hover:bg-passion transition-all shadow-md" />

                      {/* Date Block */}
                      <div className="md:w-40 shrink-0 md:pt-4">
                        <div className="flex flex-col">
                          <span className="text-[72px] font-serif leading-none text-page-text/5 group-hover:text-page-text/30 transition-all duration-500">
                            {new Date((s.createdAt?.seconds || 0) * 1000).getDate().toString().padStart(2, '0')}
                          </span>
                          <span className="text-sm uppercase tracking-[0.3em] font-bold opacity-30 mt-3 group-hover:opacity-60 transition-opacity">
                            {new Date((s.createdAt?.seconds || 0) * 1000).toLocaleString('default', { month: 'long' })}
                          </span>
                          <span className="text-[10px] italic opacity-20 mt-1">
                            {new Date((s.createdAt?.seconds || 0) * 1000).getFullYear()}
                          </span>
                        </div>
                      </div>

                      {/* Session Body */}
                      <div className="flex-1 bg-white border border-page-border rounded-[3rem] p-10 md:p-14 shadow-sm hover:shadow-2xl transition-all hover:border-page-text/30 group-hover:-translate-y-3 bg-gradient-to-br from-white via-white to-page-bg/10 overflow-hidden relative">
                        {/* Decorative background elements */}
                        <div className="absolute -top-24 -right-24 w-80 h-80 bg-page-text/5 rounded-full blur-[80px] group-hover:bg-passion/10 transition-all duration-1000" />
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-page-text/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative z-10 space-y-12">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              {s.status === 'completed' ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-talent/10 text-talent text-[9px] uppercase tracking-widest font-bold rounded-full border border-talent/20">
                                  <CheckCircle2 size={10} />
                                  Full Synthesis
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-passion/10 text-passion text-[9px] uppercase tracking-widest font-bold rounded-full border border-passion/20">
                                  <Flower2 size={10} className="animate-spin-slow" />
                                  Budding Purpose
                                </div>
                              )}
                              <span className="text-[10px] opacity-20 font-bold">•</span>
                              <span className="text-[10px] opacity-20 font-bold uppercase tracking-tighter">Session ID: {s.id.slice(-6)}</span>
                            </div>
                            <h4 className="text-5xl font-serif leading-tight group-hover:italic transition-all duration-500 max-w-2xl tracking-tight text-page-text/90">
                              {s.status === 'completed' ? s.finalAnalysis?.ikigai : "An Unwritten Life Chapter"}
                            </h4>
                          </div>
                          
                          {/* Rich Progress Section */}
                          <div className="pt-10 border-t border-page-border/40">
                            <div className="flex flex-wrap md:flex-nowrap gap-6 md:gap-8">
                              {['passion', 'mission', 'vocation', 'profession'].map((p) => {
                                const isCompleted = (s.completedPillars || []).includes(p);
                                const isActive = s.currentPillar === p && s.status === 'active';
                                const completionDate = s.pillarCompletionDates?.[p];
                                return (
                                  <div key={p} className="flex-1 min-w-[140px] space-y-4">
                                    <div className="flex flex-col gap-2 px-1">
                                      <div className="flex justify-between items-center">
                                        <span className={`text-[10px] uppercase tracking-widest font-bold ${
                                          isCompleted ? 'text-talent' : isActive ? 'text-passion animate-pulse' : 'opacity-20'
                                        }`}>
                                          {p}
                                        </span>
                                        {isCompleted && <div className="w-2 h-2 rounded-full bg-talent shadow-[0_0_12px_rgba(20,20,80,0.5)]" />}
                                      </div>
                                      <div className="h-4">
                                        {isCompleted && completionDate && (
                                          <span className="text-[9px] opacity-40 font-serif italic block">
                                            Found on {new Date((completionDate.seconds || 0) * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                          </span>
                                        )}
                                        {isActive && (
                                          <span className="text-[9px] text-passion font-bold uppercase tracking-tighter animate-pulse">Reflecting now</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className={`h-2 rounded-full overflow-hidden transition-all duration-1000 ${
                                      isCompleted ? 'bg-talent/20 w-full shadow-inner' : 
                                      isActive ? 'bg-passion/10 w-full' : 'bg-page-border/30 w-full'
                                    }`}>
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: isCompleted ? '100%' : isActive ? '40%' : '0%' }}
                                        className={`h-full transition-all duration-[1500ms] ${
                                          isCompleted ? 'bg-talent' : 'bg-passion'
                                        } ${isActive ? 'animate-[progress_2s_infinite_ease-in-out]' : ''}`}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 gap-6">
                            <div className="flex items-center gap-4 opacity-40 text-[10px] font-bold uppercase tracking-widest">
                              <div className="flex items-center gap-2">
                                <History size={12} />
                                <span>Last visited {new Date((s.updatedAt?.seconds || 0) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-5 text-page-text/60 group-hover:text-page-text transition-all duration-500">
                              <span className="text-xs uppercase tracking-[0.25em] font-bold">Re-enter Sanctuary</span>
                              <div className="p-5 rounded-full bg-white border border-page-border shadow-md group-hover:bg-page-text group-hover:text-white transition-all transform group-hover:rotate-45 group-hover:scale-110">
                                <ArrowRight size={24} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-24 bg-page-text text-white flex flex-col items-center justify-center px-10">
        <img src="/Trubblx_transparent.png" alt="Trubblx Logo" className="h-10 w-auto object-contain mb-3 opacity-60 invert brightness-200" />
        <div className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">
          Trubblx Ikigai • Sanctuary Discovery
        </div>
        <div className="text-[8px] uppercase tracking-[0.4em] font-medium opacity-20 mt-1">
          Build by Abdul Basit (<a href="http://www.engrabm.com" target="_blank" rel="noopener noreferrer" className="hover:text-passion transition-colors underline underline-offset-4">www.engrabm.com</a>)
        </div>
      </footer>

      <AnimatePresence>
        {showGuide && <Guide onClose={() => setShowGuide(false)} initialStep={guideStep} />}
      </AnimatePresence>
    </div>
  );
}
