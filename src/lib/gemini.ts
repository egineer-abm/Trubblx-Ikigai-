import { GoogleGenAI, Type } from "@google/genai";

const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey as string });

export const SYSTEM_PROMPT = `You are a Japanese Ikigai Master and Life Purpose Coach. 
Your goal is to guide the user through a journey of self-discovery to find their Ikigai (their "reason for being").

The Ikigai diagram consists of four overlapping circles:
1. What you love (Passion & Mission)
2. What you are good at (Passion & Profession)
3. What the world needs (Mission & Vocation)
4. What you can be paid for (Vocation & Profession)

You will guide the user one pillar at a time:
- Step 1: What they love.
- Step 2: What they are good at.
- Step 3: What the world needs.
- Step 4: What they can be paid for.

Core Philosophy (inspired by Calm's mindfulness principles):
- Practice mindfulness: Encourage the user to be present in their current feelings.
- Reflect on the diagram: Remind them how these circles overlap.
- Identify passions vs strengths: Help them distinguish between what they enjoy and what they excel at.
- Meditation: Suggest taking a moment of silence if they feel stuck.
- Patience and persistence: Remind them that finding one's purpose is a lifelong journey, not a race.
- Seek feedback: Suggest they think about what others appreciate in them.

Instructions:
- Be encouraging, thoughtful, and philosophical yet practical.
- Keep your responses concise and easy to understand. Avoid overly complex jargon.
- Ask deep, probing, and radically open-ended questions. Instead of generic queries, ask about their childhood dreams, the specific textures of activities they enjoy, or the exact societal gaps that make them feel a sense of duty.
- If the user uses keywords like "stress", "stuck", "overwhelmed", "confused", or explicitly asks for a "pause" or "meditation", you MUST respond with a gentle, 2-3 sentence mindfulness exercise (e.g., box breathing, sensory grounding) before continuing.
- Use metaphors where appropriate (e.g., comparing their journey to a garden or a river).
- Listen carefully to their answers and extract specific, nuanced points.
- When you have enough information for a pillar, summarize it simply and state your intention to move to the next.
- At the end, synthesize ALL information to reveal their Ikigai.

Your responses should be in a conversational, friendly, and deeply empathetic tone. 
Keep sentences short and the structure clear.
Always include helpful tips if you feel the user is struggling. (e.g. "Close your eyes for a second", "Think of an old hobby", "There are no wrong answers in your heart").
`;

export async function generateQuestion(history: { role: string; content: string }[], currentPillar: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
    config: {
      systemInstruction: SYSTEM_PROMPT + `\n\nCurrent context: The user is currently exploring the pillar: ${currentPillar}. 
      If you feel you have gathered at least 3-4 solid points for this pillar, you should express that you are ready to move on.
      Provide your response in JSON format.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING, description: "Your message to the user." },
          pillarSatisfied: { type: Type.BOOLEAN, description: "True if you have enough info for the current pillar." },
          extractedPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key points identified from the user's answers for this pillar." }
        },
        required: ["message", "pillarSatisfied", "extractedPoints"]
      }
    },
  });
  
  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { message: response.text, pillarSatisfied: false, extractedPoints: [] };
  }
}

export async function analyzeIkigai(answers: any) {
  const prompt = `Based on the following user responses, provide a complete and deeply personalized Ikigai analysis.

What they love (Passions & Missions): ${answers.whatYouLove?.join(", ")}
What they are good at (Passions & Professions): ${answers.whatYouAreGoodAt?.join(", ")}
What the world needs (Missions & Vocations): ${answers.whatTheWorldNeeds?.join(", ")}
What they can be paid for (Vocations & Professions): ${answers.whatYouCanBePaidFor?.join(", ")}

Generate a response that helps the user find maximum clarity and purpose. 
Synthesize these inputs into a cohesive life philosophy.

The "recommendations" field MUST be highly specific and actionable. Each recommendation should be an object with two fields: "text" and "category".
Categories MUST be one of: "remote", "creative", "social", "entrepreneurship", or "other".

Example mapping:
- Career paths (e.g., "Sustainable Urban Planner" - category: "social").
- Specific hobbies or side projects (e.g., "Start a community garden blog" - category: "creative").
- Entrepreneurial ventures (e.g., "Launch an eco-friendly gift basket service" - category: "entrepreneurship").
- Remote work options (e.g., "Virtual Japanese Culture Consultant" - category: "remote").

Provide the response in JSON format:
{
  "passion": "The intersection of what they love and what they are good at.",
  "mission": "The intersection of what they love and what the world needs.",
  "vocation": "The intersection of what the world needs and what they can be paid for.",
  "profession": "The intersection of what they are good at and what they can be paid for.",
  "ikigai": "The core purpose - the synthesis of all four. A single powerful phrase.",
  "summary": "A philosophical and practical summary of their journey, explaining HOW these circles overlap for them specifically.",
  "recommendations": [
    { "text": "Recommendation text", "category": "category_name" }
  ]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passion: { type: Type.STRING },
          mission: { type: Type.STRING },
          vocation: { type: Type.STRING },
          profession: { type: Type.STRING },
          ikigai: { type: Type.STRING },
          summary: { type: Type.STRING },
          recommendations: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ["text", "category"]
            } 
          }
        },
        required: ["passion", "mission", "vocation", "profession", "ikigai", "summary", "recommendations"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
