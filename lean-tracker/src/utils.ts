import { FoodLogItem, WorkoutLogItem, BodyCompLogItem, UserProfile, FoodDbItem, MealPreset } from './types';

export const INITIAL_PROFILE: UserProfile = {
  name: "Achmad Arif",
  email: "achmadaarifty@gmail.com",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPbd7J4gNd4c_cVDxSj0jUSqx-NuUD850uJ130ZsPR0wRwlYrTswnshDp96st1sMmj-sGASeLiFBTl3NbpbNKNhxlD8N8kYUUmkWIY9Vysi9ipuQ0BO_oP9sdvnDJkm-oQCkmrgldurXAeDPMXNeZFYcfnrzjzW0d2LbZjAVr8vO7TbVnTSheEu9aT-7dM3Ail5Js65_BwZTgzdyLYhQMGeXAdcw7V1aKrZYug8Sh6kB5xU5Fi_CcHiLbEp17oVuWsrE_g9bLQZjc",
  dailyCalorieTarget: 1600,
  dailyProteinTarget: 150,
  dailyCarbsTarget: 200,
  dailyFatTarget: 65,
  targetWeight: 68.0,
  targetBodyFat: 12,
  maintenanceTdee: 2200,
  streakCount: 12,
  height: 175,
  notificationsEnabled: true,
  activityLevel: "Moderately Active"
};

export const INITIAL_FOOD_DB: FoodDbItem[] = [
  { id: 'f_db_1', name: 'Whole Egg', emoji: '🥚', unit: 'pcs', baseQty: 1, calories: 70, protein: 6.0, carbs: 0.6, fat: 5.0 },
  { id: 'f_db_2', name: 'Egg White', emoji: '🥚', unit: 'pcs', baseQty: 1, calories: 17, protein: 4.0, carbs: 0.2, fat: 0.1 },
  { id: 'f_db_3', name: 'Chicken Breast', emoji: '🍗', unit: 'g', baseQty: 100, calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
  { id: 'f_db_4', name: 'Chicken Breast (Small / Warteg)', emoji: '🍗', unit: 'pcs', baseQty: 1, calories: 140, protein: 22.0, carbs: 0.0, fat: 5.0 },
  { id: 'f_db_5', name: 'Omelette', emoji: '🍳', unit: 'pcs', baseQty: 1, calories: 150, protein: 11.0, carbs: 1.0, fat: 11.0 },
  { id: 'f_db_6', name: 'Tempe Bacem', emoji: '🟫', unit: 'pcs', baseQty: 1, calories: 90, protein: 5.0, carbs: 10.0, fat: 3.5 },
  { id: 'f_db_7', name: 'Tempe Orek', emoji: '🟫', unit: 'g', baseQty: 100, calories: 220, protein: 12.0, carbs: 18.0, fat: 11.0 },
  { id: 'f_db_8', name: 'Mixed Vegetables', emoji: '🥬', unit: 'g', baseQty: 100, calories: 50, protein: 2.0, carbs: 10.0, fat: 0.2 },
  { id: 'f_db_9', name: 'Mr Bread Whole Wheat', emoji: '🍞', unit: 'slices', baseQty: 1, calories: 80, protein: 4.0, carbs: 14.0, fat: 1.0 },
  { id: 'f_db_10', name: 'Fitbar', emoji: '🍫', unit: 'pcs', baseQty: 1, calories: 90, protein: 1.0, carbs: 16.0, fat: 2.5 },
  { id: 'f_db_11', name: 'Americano', emoji: '☕', unit: 'cups', baseQty: 1, calories: 5, protein: 0.1, carbs: 0.0, fat: 0.0 },
  { id: 'f_db_12', name: 'Outside Blend Protein', emoji: '🥤', unit: 'sachet', baseQty: 1, calories: 130, protein: 25.0, carbs: 3.0, fat: 1.5 }
];

export const INITIAL_MEAL_PRESETS: MealPreset[] = [
  {
    id: 'p_1',
    name: 'Breakfast Diet',
    items: [
      { foodId: 'f_db_1', quantity: 2 },
      { foodId: 'f_db_2', quantity: 4 }
    ]
  },
  {
    id: 'p_2',
    name: 'Lunch Warteg',
    items: [
      { foodId: 'f_db_4', quantity: 1 },
      { id: 'dummy_item_bacem', foodId: 'f_db_6', quantity: 1 } as any, // fallback compatible
      { foodId: 'f_db_8', quantity: 150 }
    ]
  },
  {
    id: 'p_3',
    name: 'Post Workout',
    items: [
      { foodId: 'f_db_12', quantity: 1 }
    ]
  },
  {
    id: 'p_4',
    name: 'Coffee Break',
    items: [
      { foodId: 'f_db_11', quantity: 1 },
      { foodId: 'f_db_10', quantity: 1 }
    ]
  }
];

// Clean backup compatibility fix
export const INITIAL_MEAL_PRESETS_CLEANED: MealPreset[] = [
  {
    id: 'p_1',
    name: 'Breakfast Diet',
    items: [
      { foodId: 'f_db_1', quantity: 2 },
      { foodId: 'f_db_2', quantity: 4 }
    ]
  },
  {
    id: 'p_2',
    name: 'Lunch Warteg',
    items: [
      { foodId: 'f_db_4', quantity: 1 },
      { foodId: 'f_db_6', quantity: 1 },
      { foodId: 'f_db_8', quantity: 150 }
    ]
  },
  {
    id: 'p_3',
    name: 'Post Workout',
    items: [
      { foodId: 'f_db_12', quantity: 1 }
    ]
  },
  {
    id: 'p_4',
    name: 'Coffee Break',
    items: [
      { foodId: 'f_db_11', quantity: 1 },
      { foodId: 'f_db_10', quantity: 1 }
    ]
  }
];

export const INITIAL_FOOD_LOGS: FoodLogItem[] = [
  {
    id: "f1",
    name: "2 Whole Eggs",
    mealType: "breakfast",
    calories: 140,
    protein: 12,
    carbs: 2,
    fat: 10,
    quantity: "2 large",
    emoji: "🥚",
    time: "08:30 AM",
    dateString: "2026-06-29"
  },
  {
    id: "f2",
    name: "Blueberry Oats",
    mealType: "breakfast",
    calories: 340,
    protein: 12,
    carbs: 45,
    fat: 8,
    quantity: "180g",
    emoji: "🥣",
    time: "08:45 AM",
    dateString: "2026-06-29"
  },
  {
    id: "f3",
    name: "Chicken Breast 180g",
    mealType: "lunch",
    calories: 297,
    protein: 54,
    carbs: 0,
    fat: 6,
    quantity: "180g",
    emoji: "🍗",
    time: "01:15 PM",
    dateString: "2026-06-29"
  },
  {
    id: "f4",
    name: "Grilled Chicken Salad",
    mealType: "lunch",
    calories: 420,
    protein: 45,
    carbs: 15,
    fat: 18,
    quantity: "250g",
    emoji: "🥗",
    time: "01:15 PM",
    dateString: "2026-06-29"
  },
  {
    id: "f5",
    name: "Green Apple",
    mealType: "lunch",
    calories: 75,
    protein: 0,
    carbs: 19,
    fat: 0,
    quantity: "150g",
    emoji: "🍏",
    time: "01:30 PM",
    dateString: "2026-06-29"
  },
  {
    id: "f6",
    name: "Outside Blend Protein",
    mealType: "snack",
    calories: 90,
    protein: 20,
    carbs: 3,
    fat: 1,
    quantity: "1 scoop",
    emoji: "🥤",
    time: "05:45 PM",
    dateString: "2026-06-29"
  }
];

export const INITIAL_WORKOUT_LOGS: WorkoutLogItem[] = [
  {
    id: "w1",
    type: "gym",
    name: "Heavy Pull Session",
    category: "Strength",
    durationMinutes: 64,
    caloriesBurned: 240,
    volumeKg: 13000,
    details: "Chest & Triceps",
    time: "03:30 PM",
    dateString: "2026-06-29"
  },
  {
    id: "w2",
    type: "cardio",
    name: "Zone 2 Cardio",
    category: "Endurance",
    durationMinutes: 40,
    caloriesBurned: 250,
    details: "Morning Run",
    time: "07:00 AM",
    dateString: "2026-06-29"
  }
];

export const INITIAL_BODY_COMP: BodyCompLogItem[] = [
  {
    id: "bc1",
    dateString: "2026-06-29",
    weight: 70.5,
    bodyFatPercent: 15.2,
    muscleMassKg: 56.8,
    visceralFat: 4,
    bmr: 1750
  },
  {
    id: "bc2",
    dateString: "2026-06-28",
    weight: 70.6,
    bodyFatPercent: 15.3,
    muscleMassKg: 56.7,
    visceralFat: 4,
    bmr: 1750
  },
  {
    id: "bc3",
    dateString: "2026-06-27",
    weight: 70.8,
    bodyFatPercent: 15.4,
    muscleMassKg: 56.6,
    visceralFat: 4,
    bmr: 1750
  },
  {
    id: "bc4",
    dateString: "2026-06-26",
    weight: 71.0,
    bodyFatPercent: 15.5,
    muscleMassKg: 56.5,
    visceralFat: 4,
    bmr: 1750
  },
  {
    id: "bc5",
    dateString: "2026-06-25",
    weight: 71.1,
    bodyFatPercent: 15.6,
    muscleMassKg: 56.5,
    visceralFat: 4,
    bmr: 1750
  },
  {
    id: "bc6",
    dateString: "2026-06-24",
    weight: 71.3,
    bodyFatPercent: 15.7,
    muscleMassKg: 56.4,
    visceralFat: 4,
    bmr: 1750
  },
  {
    id: "bc7",
    dateString: "2026-06-23",
    weight: 71.5,
    bodyFatPercent: 15.8,
    muscleMassKg: 56.3,
    visceralFat: 4,
    bmr: 1750
  },
  {
    id: "bc8",
    dateString: "2026-06-22",
    weight: 71.7,
    bodyFatPercent: 15.9,
    muscleMassKg: 56.2,
    visceralFat: 4,
    bmr: 1750
  }
];

export function getFormattedDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  const date = new Date(year, month, day);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function calculateMA7(logs: BodyCompLogItem[], targetIndex: number): number {
  if (targetIndex >= logs.length) return 0;
  let sum = 0;
  let count = 0;
  // Get up to 7 items starting from targetIndex
  for (let i = targetIndex; i < Math.min(targetIndex + 7, logs.length); i++) {
    sum += logs[i].weight;
    count++;
  }
  return count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
}
