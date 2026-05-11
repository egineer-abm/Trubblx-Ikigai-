# Trubblx Ikigai Sanctuary

![Trubblx Logo](./public/Trubblx_transparent.png)

## 🌸 Discover Your Reason for Being

**Trubblx Ikigai** is an AI-powered sanctuary for self-discovery. It orchestrates a rhythmic dialogue using Gemini AI to help users navigate the four pillars of Ikigai—**Passion, Mission, Vocation, and Profession**—uncovering their unique "reason for being" through mindful reflection, interactive diagramming, and actionable purpose blueprints.

---

## 🚀 Key Features

### 🧠 AI-Powered Reflection
Utilizes the **Gemini Pro** model to provide a personalized, socratic guidance experience. The AI doesn't just ask questions; it listens, synthesizes patterns, and helps you connect the dots between your childhood dreams and current skillsets.

### 🎨 Dynamic Ikigai Visualization
A custom-built, interactive SVG diagram that updates in real-time as you explore different aspects of your life. Watch as the intersections of Passion, Mission, Vocation, and Profession become clearer.

### 📓 Perpetual Journaling
A persistent record of your insights. As you converse with the AI, key realizations are automatically distilled and stored in your digital sanctuary, allowing for long-term growth and reflection.

### 📄 Professional Export
Generate a beautifully curated PDF/HTML report of your Ikigai journey. Includes your core foundations, discovery pathways, and a high-resolution version of your personal Ikigai diagram.

---

## 🛠 Technical Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS (Modern minimalist aesthetic)
- **Animations:** Framer Motion (Orchestrated transitions)
- **AI Engine:** Google Gemini AI (@google/genai)
- **Interactions:** Custom SVG + Framer Motion
- **Icons:** Lucide React

---

## 📖 The Ikigai Philosophy

The application is structured around the four fundamental questions of Ikigai:

1.  **What you LOVE** (Your Passion & Mission)
2.  **What you are GOOD AT** (Your Passion & Profession)
3.  **What the world NEEDS** (Your Mission & Vocation)
4.  **What you can be PAID FOR** (Your Vocation & Profession)

The center point, where all four overlap, is your **Ikigai**—the balanced state of fulfillment and sustainability.

---

## 🛠 Development & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file and add:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### Running the App
```bash
npm run dev
```

---

## 🏛 Architecture

- `src/App.tsx`: The heart of the application, managing state transitions and the overall sanctuary experience.
- `src/components/ChatInterface.tsx`: A bespoke chat container designed for deep, focused dialogue.
- `src/components/IkigaiDiagram.tsx`: Logic and rendering for the interactive purpose mapping.
- `src/components/Guide.tsx`: Advanced documentation and philosophical grounding accessible within the app.
- `src/lib/export.ts`: A robust export engine that renders discovery reports.

---

## 🎨 Design Philosophy

Trubblx is built on the principles of **Architectural Minimalism**. We avoid clutter to allow the user's thoughts to take center stage. The use of serif typography (Playfair Display) paired with clean geometric lines (Inter) creates a mood of both tradition and modern clarity.

---

Created with ❤️ by **Abdul Basit**
