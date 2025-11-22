import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AIPlanResponse } from "../types";

// NOTE: In a real production app, calls should be proxied through a backend to protect the API key.
// For this client-side blueprint, we use the env var directly.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generatePlan = async (user: UserProfile): Promise<AIPlanResponse | null> => {
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }

  const prompt = `
    Crie um plano de saúde completo para um usuário com o seguinte perfil:
    Nome: ${user.name}
    Idade: ${user.age}
    Peso: ${user.weight}kg
    Altura: ${user.height}cm
    Gênero: ${user.gender}
    Nível de Atividade: ${user.activityLevel}
    Objetivo: ${user.goal}

    Retorne um JSON estrito contendo:
    1. Uma dieta diária (dietPlan) com 4-6 refeições.
    2. Uma rotina de treinos (workoutPlan) dividida em dias (ex: Treino A, Treino B).
    3. Meta calórica diária (dailyCaloriesTarget).
    4. Meta de água diária em ml (waterTarget).
    5. Uma dica de saúde motivacional (tipOfTheDay).
    
    Para as refeições, inclua ingredientes específicos com quantidades.
    Para os treinos, inclua séries, repetições e descanso.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dietPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  time: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fats: { type: Type.NUMBER },
                  suggestion: { type: Type.STRING },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            workoutPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  dayName: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        restSeconds: { type: Type.NUMBER },
                        notes: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            dailyCaloriesTarget: { type: Type.NUMBER },
            waterTarget: { type: Type.NUMBER },
            tipOfTheDay: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIPlanResponse;
    }
    return null;
  } catch (error) {
    console.error("Error generating plan:", error);
    return null;
  }
};