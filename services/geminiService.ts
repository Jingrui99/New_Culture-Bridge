import { GoogleGenAI, Type } from "@google/genai";
import { EpistemicProbeResult, EpistemicStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function runEpistemicProbe(
  sourceSystem: string,
  targetSystem: string,
  userInput: string,
  lang: string
): Promise<EpistemicProbeResult> {
  const languageName = lang === 'zh' ? 'Chinese' : 'English';
  const prompt = `
    You are an AI performing an 'Epistemic Probe' for a cross-cultural music research project.
    Your task is NOT to generate music, but to diagnose your own boundaries of understanding when translating between two musical epistemic systems.

    Source System: ${sourceSystem}
    Target System: ${targetSystem}
    User Element: ${userInput}
    Response Language Requirement: ALL text fields in the JSON response (title, description, details, question, options) MUST be written in ${languageName}.

    Analyze the input based on:
    1. Geographic Origin: Do you understand the specific locale and cultural lineage?
    2. Tonal Structure: Do you understand the scales, modes, or tuning systems? 
    3. Ambiguity: Where is your logic fuzzy? What might you misinterpret?
    4. Cultural Refusal: What elements are 'untranslatable' or shouldn't be touched by AI for ethical/sacred reasons?

    Categorize each into one of: UNDERSTOOD, MISUNDERSTOOD, REFUSED.
    
    Also generate:
    - 3 specific 'Composer Tasks': Questions in ${languageName} that force the human composer to make an ethical or aesthetic decision about your interpretation. Use unique IDs for each.
    - 2 'Propositions': Short melodic sketches with titles and descriptions in ${languageName}. 
      For each sketch, provide a 'notes' array of objects: { pitch (MIDI), start (seconds), duration (seconds) }. 
      Ensure the sketch is about 5-10 seconds long and reflects the cultural tension described.

    Return the result in JSON strictly following the provided schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          geographicOrigin: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING, enum: Object.values(EpistemicStatus) },
              details: { type: Type.STRING }
            },
            required: ['title', 'description', 'status', 'details']
          },
          tonalStructure: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING, enum: Object.values(EpistemicStatus) },
              details: { type: Type.STRING }
            },
            required: ['title', 'description', 'status', 'details']
          },
          ambiguity: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING, enum: Object.values(EpistemicStatus) },
              details: { type: Type.STRING }
            },
            required: ['title', 'description', 'status', 'details']
          },
          culturalRefusal: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING, enum: Object.values(EpistemicStatus) },
              details: { type: Type.STRING }
            },
            required: ['title', 'description', 'status', 'details']
          },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['id', 'question', 'options']
            }
          },
          propositions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                musical_sketch_prompt: { type: Type.STRING },
                notes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      pitch: { type: Type.NUMBER },
                      start: { type: Type.NUMBER },
                      duration: { type: Type.NUMBER }
                    },
                    required: ['pitch', 'start', 'duration']
                  }
                }
              },
              required: ['title', 'description', 'musical_sketch_prompt', 'notes']
            }
          }
        },
        required: ['id', 'geographicOrigin', 'tonalStructure', 'ambiguity', 'culturalRefusal', 'tasks', 'propositions']
      }
    }
  });

  return JSON.parse(response.text);
}