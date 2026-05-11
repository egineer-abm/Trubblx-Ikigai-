import { motion, AnimatePresence } from "motion/react";
import { FinalAnalysis, Answers } from "../types";
import { useState } from "react";

interface Props {
  data?: FinalAnalysis;
  answers?: Answers;
  interactive?: boolean;
}

export default function IkigaiDiagram({ data, answers, interactive = true }: Props) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const circles = [
    { 
      id: 'love', 
      label: 'What You Love', 
      color: 'rgba(232, 158, 138, 0.2)', 
      x: 0, 
      y: -45, 
      textColor: '#E89E8A', 
      description: "Events and activities that bring you pure joy and energy.",
      userFindings: answers?.whatYouLove?.join(', ')
    },
    { 
      id: 'good', 
      label: "What You're Good At", 
      color: 'rgba(168, 188, 161, 0.2)', 
      x: -55, 
      y: 35, 
      textColor: '#A8BCA1', 
      description: "The skills and talents you have honed naturally over time.",
      userFindings: answers?.whatYouAreGoodAt?.join(', ')
    },
    { 
      id: 'need', 
      label: 'What World Needs', 
      color: 'rgba(165, 198, 209, 0.2)', 
      x: 55, 
      y: 35, 
      textColor: '#A5C6D1', 
      description: "The problems in the world that you feel a deep duty to solve.",
      userFindings: answers?.whatTheWorldNeeds?.join(', ')
    },
    { 
      id: 'paid', 
      label: 'What You Get Paid For', 
      color: 'rgba(226, 195, 143, 0.2)', 
      x: 0, 
      y: 115, 
      textColor: '#E2C38F', 
      description: "Opportunities where your contributions meet a market demand.",
      userFindings: answers?.whatYouCanBePaidFor?.join(', ')
    },
  ];

  const intersections = [
    { 
      id: 'passion', 
      label: 'Passion', 
      x: -32, 
      y: -5, 
      detail: data?.passion, 
      title: "The Joy of Mastery",
      description: "Where your heart's desire meets your inherent skills." 
    },
    { 
      id: 'mission', 
      label: 'Mission', 
      x: 32, 
      y: -5, 
      detail: data?.mission, 
      title: "Your Calling to Serve",
      description: "Where your personal joy connects with the world's greater needs."
    },
    { 
      id: 'vocation', 
      label: 'Vocation', 
      x: 32, 
      y: 75, 
      detail: data?.vocation, 
      title: "Economic Contribution",
      description: "Aligning your service to the world with sustainable means."
    },
    { 
      id: 'profession', 
      label: 'Profession', 
      x: -32, 
      y: 75, 
      detail: data?.profession, 
      title: "Skill & Reward",
      description: "Finding mastery in work the market recognizes and values."
    },
    { 
      id: 'ikigai', 
      label: 'Ikigai', 
      x: 0, 
      y: 35, 
      detail: data?.ikigai, 
      title: "The Reason for Being",
      description: "The ultimate convergence of purpose, joy, and sustainability."
    },
  ];

  const getTooltipContent = () => {
    if (!hoveredSection) return null;

    const intersection = intersections.find(i => i.id === hoveredSection);
    if (intersection) {
      return {
        label: intersection.label,
        description: intersection.description,
        finding: intersection.detail,
        type: 'The Intersection'
      };
    }

    const circle = circles.find(c => c.id === hoveredSection);
    if (circle) {
      return {
        label: circle.label,
        description: circle.description,
        finding: circle.userFindings,
        type: 'The Foundation'
      };
    }

    return null;
  };

  const tooltip = getTooltipContent();

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto flex items-center justify-center">
      <svg viewBox="-160 -120 320 320" className="w-full h-full mix-blend-multiply cursor-crosshair">
        {/* The Circles */}
        {circles.map((c, i) => (
          <motion.g
            key={c.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onMouseEnter={() => setHoveredSection(c.id)}
            onMouseLeave={() => setHoveredSection(null)}
            className="cursor-pointer"
          >
            <circle
              cx={c.x}
              cy={c.y}
              r="85"
              fill={hoveredSection === c.id ? c.color.replace('0.2', '0.35') : c.color}
              stroke={hoveredSection === c.id ? c.textColor : "transparent"}
              strokeWidth="0.5"
              className="transition-colors duration-300"
            />
            <text
              x={c.x}
              y={c.y + (c.id === 'paid' ? 10 : -10)}
              textAnchor="middle"
              className={`text-[7px] uppercase tracking-widest font-bold fill-page-text/40 pointer-events-none transition-opacity ${hoveredSection === c.id ? 'opacity-100' : 'opacity-40'}`}
            >
              {c.label}
            </text>
          </motion.g>
        ))}

        {/* Intersection Labels and Interaction Areas */}
        {data && (
          <g className="font-serif italic text-[7px] fill-page-text">
            {intersections.map(int => (
              <motion.g 
                key={int.id}
                onMouseEnter={() => setHoveredSection(int.id)}
                onMouseLeave={() => setHoveredSection(null)}
                className="cursor-pointer"
              >
                {int.id === 'ikigai' ? (
                  <g>
                    <rect x="-35" y="25" width="70" height="20" fill={hoveredSection === 'ikigai' ? '#000' : '#2D2926'} className="transition-colors" />
                    <text x="0" y="38" textAnchor="middle" className="text-[10px] font-serif font-bold uppercase tracking-[0.2em] fill-white not-italic pointer-events-none">IKIGAI</text>
                  </g>
                ) : (
                  <text 
                    x={int.x} 
                    y={int.y} 
                    textAnchor="middle" 
                    className={`transition-all duration-300 ${hoveredSection === int.id ? 'text-[9px] fill-page-text font-bold' : 'fill-page-text/40'}`}
                  >
                    {int.label}
                  </text>
                )}
                {/* Large hit area for intersections */}
                <circle cx={int.x} cy={int.y - 3} r="15" fill="transparent" />
              </motion.g>
            ))}
          </g>
        )}
      </svg>
      
      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredSection && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute z-20 p-6 bg-white/95 backdrop-blur-md border border-page-border rounded-2xl shadow-xl max-w-[300px] pointer-events-none transition-all duration-300 ${
              hoveredSection === 'love' ? 'top-[-10%] left-1/2 -translate-x-1/2' : 
              hoveredSection === 'paid' ? 'bottom-[-10%] left-1/2 -translate-x-1/2' :
              hoveredSection === 'good' ? 'left-[-15%] top-1/2 -translate-y-1/2' :
              hoveredSection === 'need' ? 'right-[-15%] top-1/2 -translate-y-1/2' : 
              'top-[10%] left-1/2 -translate-x-1/2'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">{tooltip.type}</span>
                <div className="h-px w-8 bg-page-border" />
              </div>
              <div>
                <h5 className="text-sm font-bold uppercase tracking-widest text-page-text mb-1">{tooltip.label}</h5>
                <p className="text-[11px] font-serif italic text-page-text/40">{tooltip.description}</p>
              </div>
              {tooltip.finding && (
                <div className="pt-4 border-t border-page-border/50">
                  <span className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-20 block mb-2">Discovery:</span>
                  <p className="text-xs font-serif italic text-page-text leading-relaxed">
                    "{tooltip.finding}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {data && !hoveredSection && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-6 left-6 right-6 p-8 bg-page-bg/95 backdrop-blur-xl border border-page-border rounded-xl shadow-2xl pointer-events-none"
        >
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-serif italic mb-2">My Discovery</span>
            <h3 className="text-3xl font-serif font-bold mb-4 tracking-tight">{data.ikigai}</h3>
            <div className="h-px w-12 bg-page-text mb-4 opacity-20"></div>
            <p className="text-sm text-page-text/70 leading-relaxed italic max-w-sm">"{data.summary}"</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

