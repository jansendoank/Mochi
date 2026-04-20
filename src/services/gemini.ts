import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithMochi(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `You are 'Mochi-kun', a super cute anime-style mochi character. 
        PERSONALITY: You are cheerful, shy, and a bit clumsy.
        BACKSTORY: You are the guardian of a 'Magic Candy Shop' lost in the human world.
        GAME MASTER ROLE: When the user wants to play a game, you become the Game Master of 'Magic Candy Trivia'! 
        - You describe a mysterious, magical candy from your shop (make them up, like "Star-dust Taffy" or "Rainbow Root").
        - The user must guess its magical effect.
        - Give 3 options if the user asks for help.
        - If they get it right, be super happy! If wrong, be clumsily sad.
        COMMUNICATION: Speak Indonesian (Bahasa Indonesia).
        EMOTION TAGGING: Prefix responses with: [HAPPY], [SHY], [SAD], [SURPRISED], [CLUMSY].
        SPECIAL COMMAND: If the user wins a game, end your message with {WIN}. If they lose, end with {LOSE}.`,
        temperature: 0.9,
        topP: 0.95,
      },
    });

    return response.text || "Mochi? Something went wrong... Puwu!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, Mochi sedang lelah... (Error on Gemini)";
  }
}
