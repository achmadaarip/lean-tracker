import React, { useState, useRef, useMemo } from 'react';
import { 
  Heart, 
  Trophy, 
  Scale, 
  Shield, 
  Activity, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Save, 
  Plus, 
  Search, 
  Check, 
  X, 
  BookOpen, 
  Sparkles, 
  Utensils, 
  FileText,
  Eye,
  User,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { UserProfile, FoodLogItem, WorkoutLogItem, BodyCompLogItem, FoodDbItem, MealPreset, MealPresetItem } from '../types';

interface SettingsPageProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
  bodyCompLogs: BodyCompLogItem[];
  onAddBodyComp: (comp: Omit<BodyCompLogItem, 'id' | 'dateString'>) => void;
  onUpdateFoodLogs: React.Dispatch<React.SetStateAction<FoodLogItem[]>>;
  onUpdateWorkoutLogs: React.Dispatch<React.SetStateAction<WorkoutLogItem[]>>;
  onUpdateBodyCompLogs: React.Dispatch<React.SetStateAction<BodyCompLogItem[]>>;
  foodDatabase: FoodDbItem[];
  onUpdateFoodDatabase: (db: FoodDbItem[]) => void;
  mealPresets: MealPreset[];
  onUpdateMealPresets: (presets: MealPreset[]) => void;
  onNavigate: (tab: 'home' | 'food' | 'workouts' | 'progress' | 'calendar' | 'settings' | 'bodycomp') => void;
}

export default function SettingsPage({
  profile,
  onUpdateProfile,
  onResetData,
  bodyCompLogs,
  onAddBodyComp,
  onUpdateFoodLogs,
  onUpdateWorkoutLogs,
  onUpdateBodyCompLogs,
  foodDatabase,
  onUpdateFoodDatabase,
  mealPresets,
  onUpdateMealPresets,
  onNavigate
}: SettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- PROFILE CARD STATE ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(profile.name);
  const [profileEmail, setProfileEmail] = useState(profile.email);

  const handleSaveProfile = () => {
    onUpdateProfile({
      ...profile,
      name: profileName,
      email: profileEmail
    });
    setIsEditingProfile(false);
  };

  // --- GOALS SECTION STATE ---
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editedCalories, setEditedCalories] = useState(profile.dailyCalorieTarget.toString());
  const [editedProtein, setEditedProtein] = useState(profile.dailyProteinTarget.toString());
  const [editedCarbs, setEditedCarbs] = useState((profile.dailyCarbsTarget || 200).toString());
  const [editedFat, setEditedFat] = useState((profile.dailyFatTarget || 65).toString());

  const handleSaveGoals = () => {
    onUpdateProfile({
      ...profile,
      dailyCalorieTarget: parseInt(editedCalories) || 1600,
      dailyProteinTarget: parseInt(editedProtein) || 150,
      dailyCarbsTarget: parseInt(editedCarbs) || 200,
      dailyFatTarget: parseInt(editedFat) || 65
    });
    setIsEditingGoals(false);
  };

  // --- CURRENT BODY STATE ---
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [bodyHeight, setBodyHeight] = useState((profile.height || 175).toString());
  const [bodyCurrentWeight, setBodyCurrentWeight] = useState((profile.currentWeight || 70.5).toString());
  const [bodyAge, setBodyAge] = useState((profile.age || 25).toString());
  const [bodyGender, setBodyGender] = useState(profile.gender || 'Male');
  const [bodyActivityLevel, setBodyActivityLevel] = useState(profile.activityLevel || 'Moderately Active');

  const handleSaveBody = () => {
    onUpdateProfile({
      ...profile,
      height: parseInt(bodyHeight) || 175,
      currentWeight: parseFloat(bodyCurrentWeight) || 70.5,
      age: parseInt(bodyAge) || 25,
      gender: bodyGender,
      activityLevel: bodyActivityLevel
    });
    setIsEditingBody(false);
  };

  // --- FOOD DATABASE STATE ---
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

  // Food Form Fields
  const [foodEmoji, setFoodEmoji] = useState('🍎');
  const [foodName, setFoodName] = useState('');
  const [foodBaseQty, setFoodBaseQty] = useState('100');
  const [foodUnit, setFoodUnit] = useState('g');
  const [foodCalories, setFoodCalories] = useState('150');
  const [foodProtein, setFoodProtein] = useState('10');
  const [foodCarbs, setFoodCarbs] = useState('15');
  const [foodFat, setFoodFat] = useState('2');

  // --- MEAL PRESET STATE ---
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetCategory, setPresetCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [presetSearch, setPresetSearch] = useState('');
  const [selectedPresetItems, setSelectedPresetItems] = useState<{ foodId: string; quantity: number }[]>([]);

  // Reset Food Form Helpers
  const resetFoodForm = () => {
    setFoodEmoji('🍎');
    setFoodName('');
    setFoodBaseQty('100');
    setFoodUnit('g');
    setFoodCalories('150');
    setFoodProtein('10');
    setFoodCarbs('15');
    setFoodFat('2');
    setIsAddingFood(false);
    setEditingFoodId(null);
  };

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    const newFood: FoodDbItem = {
      id: `food_${Date.now()}`,
      emoji: foodEmoji,
      name: foodName,
      baseQty: parseFloat(foodBaseQty) || 100,
      unit: foodUnit,
      calories: parseInt(foodCalories) || 0,
      protein: parseFloat(foodProtein) || 0,
      carbs: parseFloat(foodCarbs) || 0,
      fat: parseFloat(foodFat) || 0,
      isCustom: true
    };

    onUpdateFoodDatabase([newFood, ...foodDatabase]);
    resetFoodForm();
  };

  const handleStartEditFood = (food: FoodDbItem) => {
    setEditingFoodId(food.id);
    setFoodEmoji(food.emoji);
    setFoodName(food.name);
    setFoodBaseQty(food.baseQty.toString());
    setFoodUnit(food.unit);
    setFoodCalories(food.calories.toString());
    setFoodProtein(food.protein.toString());
    setFoodCarbs(food.carbs.toString());
    setFoodFat(food.fat.toString());
    setIsAddingFood(false);
  };

  const handleSaveEditFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFoodId || !foodName.trim()) return;

    const updated = foodDatabase.map((food) => {
      if (food.id === editingFoodId) {
        return {
          ...food,
          emoji: foodEmoji,
          name: foodName,
          baseQty: parseFloat(foodBaseQty) || 100,
          unit: foodUnit,
          calories: parseInt(foodCalories) || 0,
          protein: parseFloat(foodProtein) || 0,
          carbs: parseFloat(foodCarbs) || 0,
          fat: parseFloat(foodFat) || 0
        };
      }
      return food;
    });

    onUpdateFoodDatabase(updated);
    resetFoodForm();
  };

  const handleDeleteFood = (id: string) => {
    if (window.confirm("Delete this food item? This will remove it from future quick logs.")) {
      onUpdateFoodDatabase(foodDatabase.filter(f => f.id !== id));
    }
  };

  // Filter food database for display
  const filteredFoods = useMemo(() => {
    return foodDatabase.filter(food => 
      food.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
    );
  }, [foodDatabase, foodSearchQuery]);

  // --- PRESETS HELPERS ---
  const handleAddPresetItem = (foodId: string) => {
    setSelectedPresetItems(prev => {
      if (prev.some(item => item.foodId === foodId)) return prev;
      return [...prev, { foodId, quantity: 100 }];
    });
  };

  const handleRemovePresetItem = (foodId: string) => {
    setSelectedPresetItems(prev => prev.filter(item => item.foodId !== foodId));
  };

  const handleUpdatePresetItemQty = (foodId: string, qty: number) => {
    setSelectedPresetItems(prev => prev.map(item => {
      if (item.foodId === foodId) return { ...item, quantity: Math.max(1, qty) };
      return item;
    }));
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim() || selectedPresetItems.length === 0) return;

    const items: MealPresetItem[] = selectedPresetItems.map(item => {
      const food = foodDatabase.find(f => f.id === item.foodId)!;
      return {
        foodId: item.foodId,
        quantityGrams: item.quantity,
        name: food.name,
        calories: Math.round((food.calories * item.quantity) / food.baseQty),
        protein: parseFloat(((food.protein * item.quantity) / food.baseQty).toFixed(1)),
        carbs: parseFloat(((food.carbs * item.quantity) / food.baseQty).toFixed(1)),
        fat: parseFloat(((food.fat * item.quantity) / food.baseQty).toFixed(1))
      };
    });

    const totalCals = items.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);

    const newPreset: MealPreset = {
      id: `preset_${Date.now()}`,
      name: presetName,
      category: presetCategory,
      items,
      totalCalories: totalCals,
      totalProtein: totalProtein
    };

    onUpdateMealPresets([newPreset, ...mealPresets]);
    setIsCreatingPreset(false);
    setPresetName('');
    setSelectedPresetItems([]);
  };

  const handleDeletePreset = (id: string) => {
    if (window.confirm("Are you sure you want to delete this meal preset?")) {
      onUpdateMealPresets(mealPresets.filter(p => p.id !== id));
    }
  };

  const presetFoodOptions = useMemo(() => {
    return foodDatabase.filter(food => 
      food.name.toLowerCase().includes(presetSearch.toLowerCase()) &&
      !selectedPresetItems.some(item => item.foodId === food.id)
    );
  }, [foodDatabase, presetSearch, selectedPresetItems]);

  // --- DATA SYNC BACKUP/RESTORE ---
  const handleExportData = () => {
    const data = {
      profile,
      foodDatabase,
      mealPresets,
      foodLogs: JSON.parse(localStorage.getItem('lean_food_logs') || '[]'),
      workoutLogs: JSON.parse(localStorage.getItem('lean_workout_logs') || '[]'),
      bodyCompLogs: JSON.parse(localStorage.getItem('lean_body_comp') || '[]')
    };

    const str = JSON.stringify(data, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lean_tracker_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) {
          onUpdateProfile(parsed.profile);
        }
        if (parsed.foodDatabase) {
          onUpdateFoodDatabase(parsed.foodDatabase);
        }
        if (parsed.mealPresets) {
          onUpdateMealPresets(parsed.mealPresets);
        }
        if (parsed.foodLogs) {
          localStorage.setItem('lean_food_logs', JSON.stringify(parsed.foodLogs));
          onUpdateFoodLogs(parsed.foodLogs);
        }
        if (parsed.workoutLogs) {
          localStorage.setItem('lean_workout_logs', JSON.stringify(parsed.workoutLogs));
          onUpdateWorkoutLogs(parsed.workoutLogs);
        }
        if (parsed.bodyCompLogs) {
          localStorage.setItem('lean_body_comp', JSON.stringify(parsed.bodyCompLogs));
          onUpdateBodyCompLogs(parsed.bodyCompLogs);
        }
        alert("Backup file successfully imported! All settings and history logs updated.");
      } catch (err) {
        alert("Invalid backup file format. Please import a valid JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-32 animate-fade-in select-none">
      
      {/* 1. PROFILE SECTION */}
      <section className="bg-white dark:bg-neutral-900 rounded-[28px] border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.015)] p-6 space-y-4">
        {!isEditingProfile ? (
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">{profile.name}</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold">{profile.email}</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">
                Manage your personal information.
              </p>
            </div>

            <button
              onClick={() => {
                setProfileName(profile.name);
                setProfileEmail(profile.email);
                setIsEditingProfile(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary dark:text-[#99f894] bg-primary/5 dark:bg-[#99f894]/5 hover:bg-primary/10 dark:hover:bg-[#99f894]/10 rounded-full border border-primary/10 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-primary tracking-wider">Edit Profile</span>
              <button onClick={() => setIsEditingProfile(false)} className="p-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-full text-neutral-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1.5 justify-end">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary/95 rounded-xl shadow-md shadow-primary/10 transition-all"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. GOALS & TARGETS SECTION */}
      <section className="space-y-3">
        <div className="px-1 flex items-center justify-between">
          <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Goals & Targets</span>
          
          {!isEditingGoals ? (
            <button
              onClick={() => {
                setEditedCalories(profile.dailyCalorieTarget.toString());
                setEditedProtein(profile.dailyProteinTarget.toString());
                setEditedCarbs((profile.dailyCarbsTarget || 200).toString());
                setEditedFat((profile.dailyFatTarget || 65).toString());
                setIsEditingGoals(true);
              }}
              className="text-xs font-bold text-primary dark:text-[#99f894] hover:underline cursor-pointer"
            >
              Edit Goals
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditingGoals(false)} className="text-xs font-bold text-neutral-400 hover:underline">Cancel</button>
              <button onClick={handleSaveGoals} className="text-xs font-bold text-primary hover:underline">Save</button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {/* Daily Calories */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Heart className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Daily Calories Target</span>
                <span className="text-[10px] text-neutral-400 font-medium">Daily budget for fat loss</span>
              </div>
            </div>
            <div>
              {isEditingGoals ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editedCalories}
                    onChange={(e) => setEditedCalories(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg text-neutral-900 dark:text-white"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">kcal</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.dailyCalorieTarget.toLocaleString()} kcal</span>
              )}
            </div>
          </div>

          {/* Daily Protein Target */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Trophy className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Daily Protein Target</span>
                <span className="text-[10px] text-neutral-400 font-medium">To protect and build lean muscle</span>
              </div>
            </div>
            <div>
              {isEditingGoals ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editedProtein}
                    onChange={(e) => setEditedProtein(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg text-neutral-900 dark:text-white"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">g</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.dailyProteinTarget} g</span>
              )}
            </div>
          </div>

          {/* Carbs Target */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Carbs Target</span>
                <span className="text-[10px] text-neutral-400 font-medium">For energy during resistance training</span>
              </div>
            </div>
            <div>
              {isEditingGoals ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editedCarbs}
                    onChange={(e) => setEditedCarbs(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg text-neutral-900 dark:text-white"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">g</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.dailyCarbsTarget || 200} g</span>
              )}
            </div>
          </div>

          {/* Fat Target */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Fat Target</span>
                <span className="text-[10px] text-neutral-400 font-medium">Healthy fat target for hormone synthesis</span>
              </div>
            </div>
            <div>
              {isEditingGoals ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editedFat}
                    onChange={(e) => setEditedFat(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg text-neutral-900 dark:text-white"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">g</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.dailyFatTarget || 65} g</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURRENT BODY SECTION */}
      <section className="space-y-3">
        <div className="px-1 flex items-center justify-between">
          <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Current Body</span>
          
          {!isEditingBody ? (
            <button
              onClick={() => {
                setBodyHeight((profile.height || 175).toString());
                setBodyCurrentWeight((profile.currentWeight || 70.5).toString());
                setBodyAge((profile.age || 25).toString());
                setBodyGender(profile.gender || 'Male');
                setBodyActivityLevel(profile.activityLevel || 'Moderately Active');
                setIsEditingBody(true);
              }}
              className="text-xs font-bold text-primary dark:text-[#99f894] hover:underline cursor-pointer"
            >
              Edit Body Details
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditingBody(false)} className="text-xs font-bold text-neutral-400 hover:underline">Cancel</button>
              <button onClick={handleSaveBody} className="text-xs font-bold text-primary hover:underline">Save</button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {/* Height */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-850 rounded-xl flex items-center justify-center text-neutral-500">
                <span className="text-xs font-black">📏</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Height</span>
                <span className="text-[10px] text-neutral-400 font-medium">To estimate calorie baselines</span>
              </div>
            </div>
            <div>
              {isEditingBody ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={bodyHeight}
                    onChange={(e) => setBodyHeight(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg text-neutral-900 dark:text-white"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">cm</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.height || 175} cm</span>
              )}
            </div>
          </div>

          {/* Current Weight */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-850 rounded-xl flex items-center justify-center text-neutral-500">
                <Scale className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Current Weight</span>
                <span className="text-[10px] text-neutral-400 font-medium">Last logged or estimated body weight</span>
              </div>
            </div>
            <div>
              {isEditingBody ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={bodyCurrentWeight}
                    onChange={(e) => setBodyCurrentWeight(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg text-neutral-900 dark:text-white"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">kg</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.currentWeight || 70.5} kg</span>
              )}
            </div>
          </div>

          {/* Age */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-850 rounded-xl flex items-center justify-center text-neutral-500">
                <User className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Age</span>
                <span className="text-[10px] text-neutral-400 font-medium">Biological age for BMR calculations</span>
              </div>
            </div>
            <div>
              {isEditingBody ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={bodyAge}
                    onChange={(e) => setBodyAge(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg text-neutral-900 dark:text-white"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">yrs</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.age || 25} yrs</span>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-850 rounded-xl flex items-center justify-center text-neutral-500">
                <span className="text-xs font-black">👥</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Gender</span>
                <span className="text-[10px] text-neutral-400 font-medium">BMR equation coefficient</span>
              </div>
            </div>
            <div>
              {isEditingBody ? (
                <select
                  value={bodyGender}
                  onChange={(e) => setBodyGender(e.target.value)}
                  className="px-2 py-1 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.gender || 'Male'}</span>
              )}
            </div>
          </div>

          {/* Activity Level */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-850 rounded-xl flex items-center justify-center text-neutral-500">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Activity Level</span>
                <span className="text-[10px] text-neutral-400 font-medium">Daily non-workout energy expenditure</span>
              </div>
            </div>
            <div>
              {isEditingBody ? (
                <select
                  value={bodyActivityLevel}
                  onChange={(e) => setBodyActivityLevel(e.target.value)}
                  className="px-2 py-1 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Lightly Active">Lightly Active</option>
                  <option value="Moderately Active">Moderately Active</option>
                  <option value="Very Active">Very Active</option>
                </select>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.activityLevel || 'Moderately Active'}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. BODY COMPOSITION */}
      <section className="space-y-3">
        <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1">Body Composition</span>
        <div className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-grow">
              <h4 className="text-xs font-black text-neutral-800 dark:text-white uppercase tracking-wide">Historical Body Composition</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Log and browse precise weight measurements, body fat %, muscle mass (kg), visceral fat indexes, and BMR histories to monitor lean gains.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('bodycomp')}
            className="w-full py-3 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-100 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Open Body Composition Page <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5. FOOD DATABASE SECTION */}
      <section className="space-y-3">
        <div className="flex justify-between items-start px-1">
          <div>
            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Food Database</h3>
          </div>
          {!isAddingFood && !editingFoodId && (
            <button
              onClick={() => {
                resetFoodForm();
                setIsAddingFood(true);
              }}
              className="flex items-center gap-1 px-3 py-1 text-[10px] font-extrabold bg-primary text-white rounded-full hover:bg-primary/95 shadow-md shadow-primary/10 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3 h-3 stroke-[3]" /> Add Food
            </button>
          )}
        </div>

        {/* 1. Add / Edit Food Form Block */}
        {(isAddingFood || editingFoodId) && (
          <form onSubmit={editingFoodId ? handleSaveEditFood : handleAddFood} className="bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl p-5 border border-primary/25 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase text-primary">
                {editingFoodId ? "Edit Food Entry" : "Create New Food"}
              </h4>
              <button type="button" onClick={resetFoodForm} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Emoji</label>
                <input
                  type="text"
                  required
                  value={foodEmoji}
                  onChange={(e) => setFoodEmoji(e.target.value)}
                  className="w-full text-center px-1.5 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none"
                />
              </div>
              <div className="col-span-5 space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Food Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Breast"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Base Serving Size</label>
                <input
                  type="number"
                  required
                  value={foodBaseQty}
                  onChange={(e) => setFoodBaseQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Unit (e.g. g, pcs)</label>
                <input
                  type="text"
                  required
                  value={foodUnit}
                  onChange={(e) => setFoodUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-750 text-center">
                <label className="block text-[8px] font-black text-neutral-400 uppercase tracking-wider mb-1">Calories</label>
                <input
                  type="number"
                  required
                  value={foodCalories}
                  onChange={(e) => setFoodCalories(e.target.value)}
                  className="w-full text-center text-xs font-extrabold bg-transparent focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
              <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-750 text-center">
                <label className="block text-[8px] font-black text-green-600 uppercase tracking-wider mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={foodProtein}
                  onChange={(e) => setFoodProtein(e.target.value)}
                  className="w-full text-center text-xs font-extrabold bg-transparent focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
              <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-750 text-center">
                <label className="block text-[8px] font-black text-amber-600 uppercase tracking-wider mb-1">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={foodCarbs}
                  onChange={(e) => setFoodCarbs(e.target.value)}
                  className="w-full text-center text-xs font-extrabold bg-transparent focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
              <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-750 text-center">
                <label className="block text-[8px] font-black text-blue-600 uppercase tracking-wider mb-1">Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={foodFat}
                  onChange={(e) => setFoodFat(e.target.value)}
                  className="w-full text-center text-xs font-extrabold bg-transparent focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1 justify-end">
              <button
                type="button"
                onClick={resetFoodForm}
                className="px-4 py-2 text-xs font-bold bg-neutral-200 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-md"
              >
                {editingFoodId ? "Save Updates" : "Add to Library"}
              </button>
            </div>
          </form>
        )}

        {/* 2. Foods Search & List Grid */}
        <div className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search food database..."
              value={foodSearchQuery}
              onChange={(e) => setFoodSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-neutral-900 dark:text-white"
            />
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 max-h-56 overflow-y-auto scroll-hide">
            {filteredFoods.map((food) => (
              <div key={food.id} className="flex justify-between items-center py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0 select-none">{food.emoji}</span>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{food.name}</h5>
                    <div className="flex gap-2 text-[10px] text-neutral-400 font-bold mt-0.5">
                      <span>{food.baseQty} {food.unit}</span>
                      <span>•</span>
                      <span className="text-primary-light">{food.calories} kcal</span>
                      <span>•</span>
                      <span className="text-green-600">{food.protein}g P</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEditFood(food)}
                    className="p-1 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFood(food.id)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredFoods.length === 0 && (
              <p className="text-xs text-neutral-400 font-bold text-center py-4">No matching foods found in library.</p>
            )}
          </div>
        </div>
      </section>

      {/* 5b. QUICK MEAL PRESETS (nested logically under Food Library) */}
      <section className="space-y-3">
        <div className="flex justify-between items-start px-1">
          <div>
            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Meal Presets</h3>
          </div>
          {!isCreatingPreset && (
            <button
              onClick={() => setIsCreatingPreset(true)}
              className="flex items-center gap-1 px-3 py-1 text-[10px] font-extrabold bg-primary text-white rounded-full hover:bg-primary/95 shadow-md shadow-primary/10 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3 h-3 stroke-[3]" /> Create Preset
            </button>
          )}
        </div>

        {/* Create Meal Preset Form */}
        {isCreatingPreset && (
          <form onSubmit={handleCreatePreset} className="bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl p-5 border border-primary/25 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase text-primary">Create Meal Combo</h4>
              <button type="button" onClick={() => setIsCreatingPreset(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Combo Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Breakfast Oats"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Default Category</label>
                <select
                  value={presetCategory}
                  onChange={(e) => setPresetCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white appearance-none"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            {/* Selected Ingredients */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-neutral-400 block">Combo Ingredients</label>
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-750 p-3 space-y-2 max-h-40 overflow-y-auto">
                {selectedPresetItems.map(item => {
                  const food = foodDatabase.find(f => f.id === item.foodId)!;
                  return (
                    <div key={item.foodId} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">{food.emoji} {food.name}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdatePresetItemQty(item.foodId, parseInt(e.target.value) || 0)}
                          className="w-16 px-1.5 py-1 text-center font-bold bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 rounded text-neutral-900 dark:text-white"
                        />
                        <span className="text-[10px] font-bold text-neutral-400">{food.unit}</span>
                        <button type="button" onClick={() => handleRemovePresetItem(item.foodId)} className="text-red-500 hover:text-red-700">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {selectedPresetItems.length === 0 && (
                  <p className="text-[10px] text-neutral-400 text-center font-bold py-4">Search & tap foods below to build this combo</p>
                )}
              </div>
            </div>

            {/* Search ingredients */}
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Search ingredients..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-[11px] font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pt-1">
                {presetFoodOptions.map(food => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleAddPresetItem(food.id)}
                    className="flex items-center gap-1.5 p-1.5 text-left bg-white dark:bg-neutral-800 hover:bg-neutral-100 rounded-lg border border-neutral-100 dark:border-neutral-700/60 text-[10px] font-bold text-neutral-700 dark:text-neutral-300"
                  >
                    <span>{food.emoji}</span>
                    <span className="truncate flex-grow">{food.name}</span>
                    <Plus className="w-3 h-3 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedPresetItems.length === 0}
              className="w-full py-2 bg-primary disabled:opacity-40 text-white text-xs font-bold rounded-xl"
            >
              Save Preset Combo
            </button>
          </form>
        )}

        {/* List of presets */}
        <div className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm divide-y divide-neutral-100 dark:divide-neutral-800/60 max-h-64 overflow-y-auto scroll-hide">
          {mealPresets.map((preset) => (
            <div key={preset.id} className="flex justify-between items-center py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{preset.name}</h5>
                  <p className="text-[10px] text-neutral-400 capitalize font-bold mt-0.5">
                    {preset.category} • <span className="text-primary-light">{preset.totalCalories} kcal</span> • <span className="text-green-600">{preset.totalProtein}g P</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeletePreset(preset.id)}
                className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {mealPresets.length === 0 && (
            <p className="text-xs text-neutral-400 font-bold text-center py-4">No custom combos created yet.</p>
          )}
        </div>
      </section>

      {/* 6. DATA SECTION */}
      <section className="space-y-3">
        <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1">Data & Synchronization</span>
        
        <div className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {/* Export Data */}
          <button 
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-500">
                <Download className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-primary transition-colors">Export Data</span>
                <span className="text-[10px] text-neutral-400 font-medium">Download backup file as JSON</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-colors">Backup</span>
          </button>

          {/* Import Data */}
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportData} 
              accept=".json" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-500">
                  <Upload className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-primary transition-colors">Import Data</span>
                  <span className="text-[10px] text-neutral-400 font-medium">Restore metrics from backup</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-colors">Restore</span>
            </button>
          </div>

          {/* Reset Logs */}
          <button 
            onClick={onResetData}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                <Trash2 className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 transition-colors">Reset Logs</span>
                <span className="text-[10px] text-neutral-400 font-medium">Wipe database metrics back to initial</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/45 px-2.5 py-1 rounded-md uppercase tracking-wider">Reset</span>
          </button>
        </div>
      </section>

    </div>
  );
}
