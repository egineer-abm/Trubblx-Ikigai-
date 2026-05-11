# Trubblx Architecture: The Engineering of Meaning

## Overview
Trubblx is a reactive, AI-augmented sanctuary designed for deep self-reflection. The architecture is optimized for low-latency feedback loops between human input and machine synthesis.

## 🏛 Component Hierarchy

### Level 0: The Sanctuary (`App.tsx`)
The root orchestration layer. It manages the global state:
- `view`: ('landing', 'home', 'chat', 'synthesis')
- `journal`: Collection of atomic insights.
- `progression`: Completion state of the 4 Ikigai pillars.

### Level 1: Core Interaction Engines
- **ChatInterface.tsx**: Handles the message stream. Implements a "Cognitive Pacing" algorithm where AI responses are staggered to prevent information overload.
- **IkigaiDiagram.tsx**: A reactive SVG component that maps state variables to geometric coordinates. It uses `framer-motion` for smooth interpolation between analytical states.

### Level 2: Utilities & Export
- **geminiService.ts**: Abstraction layer for the `@google/genai` SDK. Implements prompt engineering focused on Socratic inquiry.
- **export.ts**: A pure-function utility that takes the current `sanctuaryState` and generates a standalone, CSS-injected HTML document for archival purposes.

## 🧠 Intelligence Design

The application uses **Gemini 1.5 Flash** for its speed and reasoning capabilities. The prompt structure is divided into three phases:

1.  **Exploration Phase**: Minimal intervention, open-ended questions.
2.  **Synthesis Phase**: Pattern matching across the four pillars.
3.  **Refinement Phase**: Challenging assumptions to find the "Center of Resonance."

## 🎨 Visual System

### Typography
- **Primary Display**: `Playfair Display` (Serif). Used for headings to evoke a sense of tradition and wisdom.
- **Interface UI**: `Inter` (Sans-serif). Used for functional elements to ensure clarity and modern precision.

### Color Theory
- **Passion**: Rose/Coral tone (#E89E8A)
- **Talent**: Sage Green (#A8BCA1)
- **Mission**: Slate Blue (#A5C6D1)
- **Vocation**: Ochre/Gold (#E2C38F)
- **Surface**: Off-white/Parchment (#FDFCFB)

## 🔒 Security & Privacy
- **Stateless Backend**: The app uses transient API sessions. No personal data is persisted on Trubblx servers.
- **Local Persistence**: User progress is saved to `localStorage`, keeping the sanctuary data on the user's device.
