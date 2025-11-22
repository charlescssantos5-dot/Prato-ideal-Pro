export enum GoalType {
  WEIGHT_LOSS = 'Perda de Peso',
  MUSCLE_GAIN = 'Ganho de Massa',
  MAINTENANCE = 'Manutenção',
  HEALTH = 'Saúde Geral'
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentário',
  LIGHTLY_ACTIVE = 'Levemente Ativo',
  MODERATELY_ACTIVE = 'Moderadamente Ativo',
  VERY_ACTIVE = 'Muito Ativo'
}

export interface Ingredient {
  name: string;
  amount: string;
  checked?: boolean;
}

export interface Meal {
  id: string;
  name: string; // e.g., Café da Manhã
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  suggestion: string;
  ingredients: Ingredient[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // "12-15" or "Failure"
  restSeconds: number;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  dayName: string; // "Treino A - Peito e Tríceps"
  exercises: Exercise[];
  completed?: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: GoalType;
  activityLevel: ActivityLevel;
  gender: 'Masculino' | 'Feminino';
  createdAt: string;
}

export interface AppData {
  profile: UserProfile | null;
  dietPlan: Meal[];
  workoutPlan: WorkoutDay[];
  waterIntake: number; // in ml
  waterTarget: number; // in ml
  dailyCaloriesTarget: number;
  badges: string[];
  lastUpdated: string;
  tipOfTheDay: string;
}

// For AI Generation Response
export interface AIPlanResponse {
  dietPlan: Meal[];
  workoutPlan: WorkoutDay[];
  dailyCaloriesTarget: number;
  waterTarget: number;
  tipOfTheDay: string;
}