import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FinalAnalysis, Answers } from "../types";
import { Heart, Star, Globe, DollarSign, Compass, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  data: FinalAnalysis;
  answers: Answers;
}

export default function IkigaiExposition({ data, answers }: Props) {
  const [selectedSection, setSelectedSection] = useState<'ikigai' | 'passion' | 'mission' | 'vocation' | 'profession'>('ikigai');

  const sections = {
    ikigai: {
      title: "The Ultimate Convergence (Your Ikigai)",
      subtitle: "The Sacred Nexus where all realms align",
      themeColor: "text-page-text border-page-text bg-page-text/5",
      icon: <Compass className="w-5 h-5 text-page-text" />,
      explanation: "Your Ikigai represents the perfect harmony of your spirit, your capability, the world's hunger, and material survival. It is not a rigid job title, but a living frequency—an overlap of these four dynamics that anchors your days and guides your decisions.",
      inputs: [
        { label: "Things you adore doing", items: answers.whatYouLove },
        { label: "Your natural & acquired talents", items: answers.whatYouAreGoodAt },
        { label: "The global and local cracks you want to heal", items: answers.whatTheWorldNeeds },
        { label: "Avenues where your utility earns value", items: answers.whatYouCanBePaidFor }
      ],
      synthesis: data.ikigai,
      summary: data.summary,
      crossover: "By integrating these elements, you avoid the common fractures of modern existence: feeling useless or feeling broke. You achieve peace paired with progress.",
      actionableSteps: [
        "Carve out 3 hours per week to dedicate entirely to this newly synthesized Ikigai.",
        "Audit your current daily schedule: identify which activities push you away from this center, and design a silent pact to reduce them.",
        "Share this blueprint with one friend or peer who respects your growth, seeking accountability."
      ]
    },
    passion: {
      title: "The Realm of Passion",
      subtitle: "Intersection of 'What You Love' & 'What You Are Good At'",
      themeColor: "text-passion border-passion bg-passion/5",
      icon: <Heart className="w-5 h-5 text-passion" />,
      explanation: "Passion is your 'Intrinsic Engine.' It triggers deep flow states where self-consciousness dissolves. However, passion without focus on world utility can feel incredibly self-indulgent or commercially isolated over time.",
      inputs: [
        { label: "Your love-centered inputs", items: answers.whatYouLove },
        { label: "Your talent-centered inputs", items: answers.whatYouAreGoodAt }
      ],
      synthesis: data.passion,
      summary: "This is where your natural affinity meets disciplined aptitude. You do these things effortlessly and because they feel like play to you, but work to others.",
      crossover: "Potential Alignment: Creating portfolio pieces, building side projects, or practicing as a local craftsman. Here, you find emotional satisfaction and mastery, but remember to look outward to ensure the work serves a planetary need.",
      actionableSteps: [
        "Initiate a 'Creative Sandpit'—a weekly or bi-weekly session where you combine your greatest skill with something you absolutely adore, with zero commercial pressure.",
        "Reconnect with a childhood project or playfulness that echoes these current skills."
      ]
    },
    mission: {
      title: "The Realm of Mission",
      subtitle: "Intersection of 'What You Love' & 'What the World Needs'",
      themeColor: "text-mission border-mission bg-mission/5",
      icon: <Globe className="w-5 h-5 text-mission" />,
      explanation: "Mission gives your internal delight an external sanctuary. It connects personal satisfaction with empathy for global and local circumstances. This zone provides rich emotional fulfillment, but can lead to frustration if you cannot securely support yourself financially.",
      inputs: [
        { label: "Your love-centered inputs", items: answers.whatYouLove },
        { label: "Your impact-centered inputs", items: answers.whatTheWorldNeeds }
      ],
      synthesis: data.mission,
      summary: "Your heartfelt willingness to act on the fractures you observe. You feel a profound internal calling and a connection to something larger than yourself.",
      crossover: "Potential Alignment: Community activism, volunteer roles, ecological restoration, or nonprofit founding. Here, your impact is clear, but we must construct material avenues to make it sustainable.",
      actionableSteps: [
        "Join one local of global activist group or volunteer program aligned with your core planet needs.",
        "Write a letter or blog outline explaining the world issue you deeply care about from your own heartfelt perspective."
      ]
    },
    vocation: {
      title: "The Realm of Vocation",
      subtitle: "Intersection of 'What the World Needs' & 'What You Can Be Paid For'",
      themeColor: "text-vocation border-vocation bg-vocation/5",
      icon: <DollarSign className="w-5 h-5 text-vocation" />,
      explanation: "Vocation combines planetary service with material sustainability. It ensures you have an active role in resolving societal issues while respecting the economic framework. However, without utilizing your unique, deep-rooted talents, you may experience anxiety or a feeling of being easily replaced.",
      inputs: [
        { label: "Your impact-centered inputs", items: answers.whatTheWorldNeeds },
        { label: "Your economic-centered inputs", items: answers.whatYouCanBePaidFor }
      ],
      synthesis: data.vocation,
      summary: "An alignment between real-world demands and commercial viability. This anchors you in practical survival and service.",
      crossover: "Potential Alignment: Social enterprise development, educational consulting, eco-friendly trade, or public administration. You are useful and secure, but you must look for ways to infuse your core personal passion and unique talents to feel truly inspired.",
      actionableSteps: [
        "Filter your career options through a sustainability framework—where does the market actively pay for solutions you care about?",
        "Identify one small service or agency offering you could pilot that addresses a major corporate or public deficit."
      ]
    },
    profession: {
      title: "The Realm of Profession",
      subtitle: "Intersection of 'What You Are Good At' & 'What You Can Be Paid For'",
      themeColor: "text-talent border-talent bg-talent/5",
      icon: <Star className="w-5 h-5 text-talent" />,
      explanation: "Profession is your 'Economic Fortress.' It represents highly functional capability recognized and rewarded by the market. This offers excellent security and comfortable habits, but if you do not feel connected to the larger 'Why' (Love & Mission), it can lead to a quiet sensation of emptiness or existential pointlessness.",
      inputs: [
        { label: "Your talent-centered inputs", items: answers.whatYouAreGoodAt },
        { label: "Your economic-centered inputs", items: answers.whatYouCanBePaidFor }
      ],
      synthesis: data.profession,
      summary: "High-value skills combined with active financial support. You are confident and capable in this zone, but potentially uninspired.",
      crossover: "Potential Alignment: Freelance consultancy, professional trades, specialized technical roles, or executive placement. This is your safe haven, but you should actively weave in passion and mission.",
      actionableSteps: [
        "Incorporate a 10% Sabbatical or 'Purpose Tax' into your weekly tasks—spending 10% of your billable professional hours on charitable or deeply creative/joyful applications.",
        "Mentor or teach youngsters in your professional circle to experience the joy of contribution."
      ]
    }
  };

  const current = sections[selectedSection];

  return (
    <div className="space-y-12">
      <div className="text-center md:text-left space-y-4">
        <h3 className="text-3xl font-serif italic text-page-text">The Sacred Geometry Unfolded</h3>
        <p className="text-xs uppercase tracking-widest font-bold opacity-40 max-w-xl leading-relaxed">
          Tapping on the intersections reveals how your reflections align to form different realms of life.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-page-border pb-4 justify-center md:justify-start">
        {(Object.keys(sections) as Array<keyof typeof sections>).map((key) => {
          const isActive = selectedSection === key;
          const config = sections[key];
          return (
            <button
              key={key}
              onClick={() => setSelectedSection(key)}
              className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all relative ${
                isActive 
                  ? `${config.themeColor.split(" ")[0]} ${config.themeColor.split(" ")[2]} border border-page-text` 
                  : "bg-transparent text-page-text/40 hover:text-page-text"
              }`}
            >
              {config.title.split(" (")[0]}
            </button>
          );
        })}
      </div>

      {/* Detail Block */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSection}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className={`p-8 md:p-12 border rounded-3xl space-y-8 bg-white shadow-sm`}
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-page-border/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-page-bg rounded-2xl border border-page-border">
                {current.icon}
              </div>
              <div>
                <h4 className="text-xl font-serif italic text-page-text leading-tight">{current.title}</h4>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1">{current.subtitle}</p>
              </div>
            </div>
            {current.synthesis && (
              <div className="px-4 py-2 bg-page-text/5 border border-page-text/10 rounded-xl text-center md:text-right shrink-0">
                <span className="text-[8px] uppercase tracking-widest font-bold opacity-30 block mb-0.5">Synthesized Concept:</span>
                <span className="text-sm font-serif font-bold text-passion italic">"{current.synthesis}"</span>
              </div>
            )}
          </div>

          {/* Explanation Text */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <h5 className="text-[10px] uppercase tracking-wider font-bold text-page-text/30">Theoretical Foundation</h5>
                <p className="text-base font-serif italic leading-relaxed text-page-text/70">{current.explanation}</p>
              </div>

              {current.summary && (
                <div className="p-6 bg-page-bg/50 rounded-2xl border border-page-border/40 pl-8 border-l-4 border-l-page-text/30">
                  <h5 className="text-[10px] uppercase tracking-wider font-bold text-page-text/40 mb-2">My Synthesis Resonance</h5>
                  <p className="text-sm font-serif italic leading-relaxed text-page-text">{current.summary}</p>
                  {selectedSection === 'ikigai' && current.summary && (
                    <div className="mt-4 p-4 bg-passion/5 border border-passion/10 rounded-xl">
                      <p className="text-xs text-passion font-semibold italic">"{current.summary}"</p>
                    </div>
                  )}
                </div>
              )}

              {current.crossover && (
                <div className="p-6 bg-page-text/[0.02] border border-page-border rounded-2xl">
                  <h5 className="text-[10px] uppercase tracking-wider font-bold text-page-text/40 mb-2">Crossover Opportunities</h5>
                  <p className="text-sm font-serif italic leading-relaxed text-page-text/70">{current.crossover}</p>
                </div>
              )}
            </div>

            {/* User inputs sidebar */}
            <div className="lg:col-span-5 space-y-8 bg-page-bg/30 p-6 md:p-8 rounded-2xl border border-page-border/50 height-full">
              <h5 className="text-[10px] uppercase tracking-widest font-bold text-page-text/30 border-b border-page-border pb-3">Your Supporting Pillars</h5>
              
              <div className="space-y-6">
                {current.inputs.map((inp, idx) => (
                  <div key={idx} className="space-y-3">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-page-text/50 block">{inp.label}</span>
                    {inp.items && inp.items.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {inp.items.map((it, itemIdx) => (
                          <span 
                            key={itemIdx} 
                            className="px-2.5 py-1 bg-white border border-page-border text-[10px] font-serif italic rounded-lg text-page-text/80 shadow-3sm shrink-0"
                          >
                            {it}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] italic opacity-40">No entries recorded in this active reflection stage yet.</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Steps */}
          <div className="pt-8 border-t border-page-border/50 space-y-4">
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-page-text/30">Actionable Next Steps</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {current.actionableSteps.map((step, sIdx) => (
                <div key={sIdx} className="p-5 bg-white border border-page-border rounded-xl flex gap-3 shadow-3sm hover:border-page-text/10 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-talent shrink-0 self-start" />
                  <p className="text-xs font-serif italic text-page-text/70 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
