export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type WorkoutType = 'gym' | 'cardio';

export interface FoodLogItem {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  quantity: string; // e.g., "180g" or "2 items"
  emoji: string;
  time: string;     // e.g., "08:30 AM"
  dateString: string; // e.g. "2026-06-29"
}

export interface WorkoutLogItem {
  id: string;
  type: WorkoutType;
  name: string;      // e.g. "Chest & Triceps" or "Morning Run"
  category: string;  // e.g. "Strength" or "Endurance"
  durationMinutes: number;
  caloriesBurned: number;
  volumeKg?: number; // Total weight lifted in kg (optional)
  details: string;   // e.g. "Outdoor Run" or "Chest press, dips"
  time: string;      // e.g. "01:15 PM"
  dateString: string;
}

export interface BodyCompLogItem {
  id: string;
  dateString: string;
  weight: number;         // kg
  bodyFatPercent: number; // e.g. 15.2
  muscleMassKg?: number;  // e.g. 56.8
  visceralFat?: number;   // e.g. 4
  bmr?: number;           // e.g. 1750
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  targetWeight: number;
  targetBodyFat: number;
  maintenanceTdee: number;
  streakCount: number;
  height?: number; // in cm
  notificationsEnabled?: boolean;
  activityLevel?: string; // e.g. "Sedentary", "Active", etc.
  age?: number;
  gender?: string;
  currentWeight?: number;
}

export interface FoodDbItem {
  id: string;
  name: string;
  emoji: string;
  unit: string; // e.g. "pcs", "g", etc.
  baseQty: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isCustom?: boolean;
}

export interface MealPresetItem {
  foodId: string; // references FoodDbItem.id
  quantity: number;
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealPreset {
  id: string;
  name: string; // e.g. "Breakfast Diet"
  items: MealPresetItem[];
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  totalCalories?: number;
  totalProtein?: number;
}
