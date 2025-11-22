import { AppData, UserProfile } from '../types';

const STORAGE_KEY = 'PRATO_IDEAL_DATA';

const INITIAL_DATA: AppData = {
  profile: null,
  dietPlan: [],
  workoutPlan: [],
  waterIntake: 0,
  waterTarget: 2500,
  dailyCaloriesTarget: 2000,
  badges: [],
  lastUpdated: new Date().toISOString(),
};

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Reset water if it's a new day
      const lastDate = new Date(parsed.lastUpdated).toDateString();
      const today = new Date().toDateString();
      
      if (lastDate !== today) {
        return {
          ...parsed,
          waterIntake: 0,
          workoutPlan: parsed.workoutPlan.map((w: any) => ({...w, completed: false})),
          lastUpdated: new Date().toISOString()
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }
  return INITIAL_DATA;
};

export const saveData = (data: AppData) => {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const exportData = (data: AppData) => {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prato_ideal_backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};