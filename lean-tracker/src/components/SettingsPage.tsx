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
  ChevronDown,
  Eye
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
  activeTheme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
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
  activeTheme,
  onThemeChange
}: SettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- PROFILE CARD STATE ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(profile.name);
  const [profileEmail, setProfileEmail] = useState(profile.email);
  const [profileHeight, setProfileHeight] = useState((profile.height || 175).toString());
  const [profileTargetWeight, setProfileTargetWeight] = useState(profile.targetWeight.toString());
  const [profileActivityLevel, setProfileActivityLevel] = useState(profile.activityLevel || 'Moderately Active');

  const handleSaveProfile = () => {
    onUpdateProfile({
      ...profile,
      name: profileName,
      email: profileEmail,
      height: parseInt(profileHeight) || 175,
      targetWeight: parseFloat(profileTargetWeight) || 68.0,
      activityLevel: profileActivityLevel
    });
    setIsEditingProfile(false);
  };

  // --- GOALS SECTION STATE ---
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editedCalories, setEditedCalories] = useState(profile.dailyCalorieTarget.toString());
  const [editedProtein, setEditedProtein] = useState(profile.dailyProteinTarget.toString());
  const [editedWeightTarget, setEditedWeightTarget] = useState(profile.targetWeight.toString());
  const [editedBodyFatTarget, setEditedBodyFatTarget] = useState(profile.targetBodyFat.toString());
  const [editedTdee, setEditedTdee] = useState(profile.maintenanceTdee.toString());

  const handleSaveGoals = () => {
    onUpdateProfile({
      ...profile,
      dailyCalorieTarget: parseInt(editedCalories) || 1600,
      dailyProteinTarget: parseInt(editedProtein) || 150,
      targetWeight: parseFloat(editedWeightTarget) || 68.0,
      targetBodyFat: parseFloat(editedBodyFatTarget) || 12,
      maintenanceTdee: parseInt(editedTdee) || 2200
    });
    setIsEditingGoals(false);
  };

  // --- FOOD DATABASE STATE ---
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

  // Food Form Fields
  const [foodName, setFoodName] = useState('');
  const [foodEmoji, setFoodEmoji] = useState('🍗');
  const [foodUnit, setFoodUnit] = useState('g');
  const [foodBaseQty, setFoodBaseQty] = useState('100');
  const [foodCalories, setFoodCalories] = useState('165');
  const [foodProtein, setFoodProtein] = useState('31');
  const [foodCarbs, setFoodCarbs] = useState('0');
  const [foodFat, setFoodFat] = useState('3.6');

  // Filter food database based on query
  const filteredFoods = useMemo(() => {
    if (!foodSearchQuery.trim()) return foodDatabase;
    return foodDatabase.filter(food => 
      food.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
    );
  }, [foodDatabase, foodSearchQuery]);

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    const newFood: FoodDbItem = {
      id: `f_db_${Date.now()}`,
      name: foodName,
      emoji: foodEmoji,
      unit: foodUnit,
      baseQty: parseFloat(foodBaseQty) || 100,
      calories: parseInt(foodCalories) || 0,
      protein: parseFloat(foodProtein) || 0,
      carbs: parseFloat(foodCarbs) || 0,
      fat: parseFloat(foodFat) || 0
    };

    onUpdateFoodDatabase([...foodDatabase, newFood]);
    resetFoodForm();
  };

  const handleStartEditFood = (food: FoodDbItem) => {
    setEditingFoodId(food.id);
    setFoodName(food.name);
    setFoodEmoji(food.emoji);
    setFoodUnit(food.unit);
    setFoodBaseQty(food.baseQty.toString());
    setFoodCalories(food.calories.toString());
    setFoodProtein(food.protein.toString());
    setFoodCarbs(food.carbs.toString());
    setFoodFat(food.fat.toString());
    setIsAddingFood(false);
  };

  const handleSaveEditFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFoodId || !foodName.trim()) return;

    const updated = foodDatabase.map(f => {
      if (f.id === editingFoodId) {
        return {
          ...f,
          name: foodName,
          emoji: foodEmoji,
          unit: foodUnit,
          baseQty: parseFloat(foodBaseQty) || 100,
          calories: parseInt(foodCalories) || 0,
          protein: parseFloat(foodProtein) || 0,
          carbs: parseFloat(foodCarbs) || 0,
          fat: parseFloat(foodFat) || 0
        };
      }
      return f;
    });

    onUpdateFoodDatabase(updated);
    resetFoodForm();
  };

  const handleDeleteFood = (id: string) => {
    if (window.confirm("Are you sure you want to delete this food item from the library? Future logged meals referencing this food may no longer calculate nutrition values correctly.")) {
      onUpdateFoodDatabase(foodDatabase.filter(f => f.id !== id));
    }
  };

  const resetFoodForm = () => {
    setEditingFoodId(null);
    setIsAddingFood(false);
    setFoodName('');
    setFoodEmoji('🍗');
    setFoodUnit('g');
    setFoodBaseQty('100');
    setFoodCalories('165');
    setFoodProtein('31');
    setFoodCarbs('0');
    setFoodFat('3.6');
  };


  // --- QUICK MEAL PRESETS STATE ---
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetName, setPresetName] = useState('');
  
  // Custom rows inside the builder
  const [presetRows, setPresetRows] = useState<{ foodId: string; quantity: string }[]>([
    { foodId: foodDatabase[0]?.id || '', quantity: '1' }
  ]);

  const handleAddRow = () => {
    setPresetRows([...presetRows, { foodId: foodDatabase[0]?.id || '', quantity: '1' }]);
  };

  const handleRemoveRow = (index: number) => {
    setPresetRows(presetRows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: 'foodId' | 'quantity', value: string) => {
    setPresetRows(presetRows.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;

    const items: MealPresetItem[] = presetRows
      .filter(row => row.foodId && parseFloat(row.quantity) > 0)
      .map(row => ({
        foodId: row.foodId,
        quantity: parseFloat(row.quantity) || 1
      }));

    if (editingPresetId) {
      const updated = mealPresets.map(p => {
        if (p.id === editingPresetId) {
          return { ...p, name: presetName, items };
        }
        return p;
      });
      onUpdateMealPresets(updated);
    } else {
      const newPreset: MealPreset = {
        id: `p_${Date.now()}`,
        name: presetName,
        items
      };
      onUpdateMealPresets([...mealPresets, newPreset]);
    }

    resetPresetForm();
  };

  const handleStartEditPreset = (preset: MealPreset) => {
    setEditingPresetId(preset.id);
    setPresetName(preset.name);
    setPresetRows(preset.items.map(item => ({
      foodId: item.foodId,
      quantity: item.quantity.toString()
    })));
    setIsAddingPreset(false);
  };

  const handleDeletePreset = (id: string) => {
    if (window.confirm("Are you sure you want to delete this meal preset?")) {
      onUpdateMealPresets(mealPresets.filter(p => p.id !== id));
    }
  };

  const resetPresetForm = () => {
    setEditingPresetId(null);
    setIsAddingPreset(false);
    setPresetName('');
    setPresetRows([{ foodId: foodDatabase[0]?.id || '', quantity: '1' }]);
  };


  // --- EXPORT / IMPORT HANDLERS ---
  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        profile,
        foodLogs: localStorage.getItem('lean_food_logs') ? JSON.parse(localStorage.getItem('lean_food_logs')!) : [],
        workoutLogs: localStorage.getItem('lean_workout_logs') ? JSON.parse(localStorage.getItem('lean_workout_logs')!) : [],
        bodyCompLogs: localStorage.getItem('lean_body_comp_logs') ? JSON.parse(localStorage.getItem('lean_body_comp_logs')!) : [],
        foodDatabase,
        mealPresets
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `lean_recomp_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("Failed to export data.");
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.profile) {
            onUpdateProfile(parsed.profile);
            // Sync current profile editing states
            setProfileName(parsed.profile.name);
            setProfileEmail(parsed.profile.email);
            setProfileHeight((parsed.profile.height || 175).toString());
            setProfileTargetWeight(parsed.profile.targetWeight.toString());
            setProfileActivityLevel(parsed.profile.activityLevel || 'Moderately Active');

            // Sync goals editing states
            setEditedCalories(parsed.profile.dailyCalorieTarget.toString());
            setEditedProtein(parsed.profile.dailyProteinTarget.toString());
            setEditedWeightTarget(parsed.profile.targetWeight.toString());
            setEditedBodyFatTarget(parsed.profile.targetBodyFat.toString());
            setEditedTdee(parsed.profile.maintenanceTdee.toString());
          }
          if (parsed.foodLogs) onUpdateFoodLogs(parsed.foodLogs);
          if (parsed.workoutLogs) onUpdateWorkoutLogs(parsed.workoutLogs);
          if (parsed.bodyCompLogs) onUpdateBodyCompLogs(parsed.bodyCompLogs);
          if (parsed.foodDatabase) onUpdateFoodDatabase(parsed.foodDatabase);
          if (parsed.mealPresets) onUpdateMealPresets(parsed.mealPresets);
          alert("Recomposition data successfully restored!");
        } catch (err) {
          alert("Error parsing backup file. Please make sure it is a valid JSON file exported from this app.");
        }
      };
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-fade-in select-none">
      
      {/* ========================================================
          EDITABLE PROFILE CARD (REPLACES Redundant Settings Title & Avatar)
          ======================================================== */}
      <section className="bg-white dark:bg-neutral-900 rounded-[28px] border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.015)] p-6 space-y-4">
        
        {!isEditingProfile ? (
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">{profile.name}</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold">{profile.email}</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">
                Manage your personal information.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-3">
                <span className="text-[10px] font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-full border border-neutral-100 dark:border-neutral-800">
                  📏 Height: {profile.height || 175} cm
                </span>
                <span className="text-[10px] font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-full border border-neutral-100 dark:border-neutral-800">
                  🎯 Target Weight: {profile.targetWeight.toFixed(1)} kg
                </span>
                {profile.activityLevel && (
                  <span className="text-[10px] font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-full border border-neutral-100 dark:border-neutral-800">
                    ⚡ {profile.activityLevel}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setProfileName(profile.name);
                setProfileEmail(profile.email);
                setProfileHeight((profile.height || 175).toString());
                setProfileTargetWeight(profile.targetWeight.toString());
                setProfileActivityLevel(profile.activityLevel || 'Moderately Active');
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
              <span className="text-xs font-black uppercase text-primary tracking-wider">Edit Profile Card</span>
              <button onClick={() => setIsEditingProfile(false)} className="p-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-full text-neutral-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Height (cm)</label>
                <input
                  type="number"
                  value={profileHeight}
                  onChange={(e) => setProfileHeight(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Target Weight</label>
                <input
                  type="number"
                  step="0.1"
                  value={profileTargetWeight}
                  onChange={(e) => setProfileTargetWeight(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Activity Level</label>
                <select
                  value={profileActivityLevel}
                  onChange={(e) => setProfileActivityLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none appearance-none"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Lightly Active">Lightly Active</option>
                  <option value="Moderately Active">Moderately Active</option>
                  <option value="Very Active">Very Active</option>
                </select>
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

      {/* ========================================================
          GOALS & TARGETS SECTION
          ======================================================== */}
      <section className="space-y-3">
        <div className="px-1 flex items-center justify-between">
          <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Goals & Targets</span>
          
          {!isEditingGoals ? (
            <button
              onClick={() => {
                setEditedCalories(profile.dailyCalorieTarget.toString());
                setEditedProtein(profile.dailyProteinTarget.toString());
                setEditedWeightTarget(profile.targetWeight.toString());
                setEditedBodyFatTarget(profile.targetBodyFat.toString());
                setEditedTdee(profile.maintenanceTdee.toString());
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
          {/* Daily Calories Target */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Heart className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Daily Calories Target</span>
                <span className="text-[10px] text-neutral-400 font-medium">Daily energy budget</span>
              </div>
            </div>
            <div>
              {isEditingGoals ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editedCalories}
                    onChange={(e) => setEditedCalories(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg"
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
                <span className="text-[10px] text-neutral-400 font-medium">Muscle mass protection target</span>
              </div>
            </div>
            <div>
              {isEditingGoals ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editedProtein}
                    onChange={(e) => setEditedProtein(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">g</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.dailyProteinTarget} g</span>
              )}
            </div>
          </div>

          {/* Target Weight */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Scale className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Target Weight</span>
                <span className="text-[10px] text-neutral-400 font-medium">Recomposition goal weight</span>
              </div>
            </div>
            <div>
              {isEditingGoals ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={editedWeightTarget}
                    onChange={(e) => setEditedWeightTarget(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">kg</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.targetWeight.toFixed(1)} kg</span>
              )}
            </div>
          </div>

          {/* Target Body Fat */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Eye className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Target Body Fat</span>
                <span className="text-[10px] text-neutral-400 font-medium">Goal body fat percentage</span>
              </div>
            </div>
            <div>
              {isEditingGoals ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={editedBodyFatTarget}
                    onChange={(e) => setEditedBodyFatTarget(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">%</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.targetBodyFat}%</span>
              )}
            </div>
          </div>

          {/* Maintenance TDEE */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Maintenance TDEE</span>
                <span className="text-[10px] text-neutral-400 font-medium">Total Daily Energy Expenditure</span>
              </div>
            </div>
            <div>
              {isEditingGoals ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editedTdee}
                    onChange={(e) => setEditedTdee(e.target.value)}
                    className="w-20 px-2 py-1 text-center text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 rounded-lg"
                  />
                  <span className="text-[10px] font-bold text-neutral-400">kcal</span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-neutral-750 dark:text-neutral-300">{profile.maintenanceTdee.toLocaleString()} kcal</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOD DATABASE SECTION (BRAND NEW SINGLE SOURCE OF TRUTH)
          ======================================================== */}
      <section className="space-y-3">
        <div className="flex justify-between items-start px-1">
          <div>
            <h3 className="text-[14px] font-black text-neutral-900 dark:text-white uppercase tracking-wider">Food Database</h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold">Manage your custom food library.</p>
          </div>
          {!isAddingFood && !editingFoodId && (
            <button
              onClick={() => {
                resetFoodForm();
                setIsAddingFood(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-full hover:bg-primary/95 shadow-md shadow-primary/10 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Food
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
                <label className="text-[10px] font-bold uppercase text-neutral-400">Unit (e.g. g, pcs, cups)</label>
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
                <label className="block text-[8px] font-black text-primary-light uppercase tracking-wider mb-1">Calories</label>
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

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 max-h-72 overflow-y-auto scroll-hide">
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
                    title="Edit Food"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFood(food.id)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete Food"
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

      {/* ========================================================
          QUICK MEAL PRESETS SECTION
          ======================================================== */}
      <section className="space-y-3">
        <div className="flex justify-between items-start px-1">
          <div>
            <h3 className="text-[14px] font-black text-neutral-900 dark:text-white uppercase tracking-wider">Quick Meal Presets</h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold">Create reusable meal templates.</p>
          </div>
          {!isAddingPreset && !editingPresetId && (
            <button
              onClick={() => {
                resetPresetForm();
                setIsAddingPreset(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-full hover:bg-primary/95 shadow-md shadow-primary/10 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create Preset
            </button>
          )}
        </div>

        {/* 1. Add / Edit Preset Builder Form */}
        {(isAddingPreset || editingPresetId) && (
          <form onSubmit={handleSavePreset} className="bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl p-5 border border-primary/25 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase text-primary">
                {editingPresetId ? "Edit Meal Preset" : "Build Meal Preset"}
              </h4>
              <button type="button" onClick={resetPresetForm} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Preset Template Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Breakfast Diet, Lunch Warteg"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
              />
            </div>

            {/* Selected food items list */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold uppercase text-neutral-400">Foods in this Preset</label>
              {presetRows.map((row, idx) => {
                const selectedFoodItem = foodDatabase.find(f => f.id === row.foodId);
                return (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-grow">
                      <select
                        value={row.foodId}
                        onChange={(e) => handleRowChange(idx, 'foodId', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none"
                      >
                        <option value="">-- Select Food --</option>
                        {foodDatabase.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.emoji} {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24 relative flex items-center shrink-0">
                      <input
                        type="number"
                        placeholder="Qty"
                        required
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                        className="w-full pl-3 pr-10 py-2 text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none"
                      />
                      <span className="absolute right-3 text-[10px] text-neutral-450 font-bold select-none">
                        {selectedFoodItem?.unit || ''}
                      </span>
                    </div>

                    {presetRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary dark:text-[#99f894] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add another food row
              </button>
            </div>

            <div className="flex gap-2 pt-1.5 justify-end">
              <button
                type="button"
                onClick={resetPresetForm}
                className="px-4 py-2 text-xs font-bold bg-neutral-200 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-md"
              >
                {editingPresetId ? "Save Preset" : "Save Template"}
              </button>
            </div>
          </form>
        )}

        {/* 2. Existing Presets display list */}
        <div className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm divide-y divide-neutral-150 dark:divide-neutral-800/60">
          {mealPresets.map((preset) => {
            // Calculate dynamic calorie and protein totals from Food Database values!
            let presetCalories = 0;
            let presetProtein = 0;

            preset.items.forEach(item => {
              const dbFood = foodDatabase.find(f => f.id === item.foodId);
              if (dbFood) {
                const factor = item.quantity / dbFood.baseQty;
                presetCalories += dbFood.calories * factor;
                presetProtein += dbFood.protein * factor;
              }
            });

            return (
              <div key={preset.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100">{preset.name}</h4>
                    <div className="flex gap-2 text-[10px] text-neutral-400 font-bold mt-0.5">
                      <span className="text-primary-light">{Math.round(presetCalories)} kcal</span>
                      <span>•</span>
                      <span className="text-green-600">{presetProtein.toFixed(1)}g Protein</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEditPreset(preset)}
                      className="p-1 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                      title="Edit Preset"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Preset"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bullets lists */}
                <ul className="pl-3.5 space-y-1 list-disc text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold">
                  {preset.items.map((item, index) => {
                    const dbFood = foodDatabase.find(f => f.id === item.foodId);
                    if (!dbFood) return null;
                    return (
                      <li key={index}>
                        {dbFood.emoji} {item.quantity} {dbFood.unit} {dbFood.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          {mealPresets.length === 0 && (
            <p className="text-xs text-neutral-400 font-bold text-center py-4">No meal presets built yet.</p>
          )}
        </div>
      </section>

      {/* ========================================================
          DATA MANAGEMENT
          ======================================================== */}
      <section className="space-y-3">
        <div className="px-1">
          <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Data Management</span>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/60">
          
          {/* Export Data */}
          <button 
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 dark:text-neutral-400">
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
                <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 dark:text-neutral-400">
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
