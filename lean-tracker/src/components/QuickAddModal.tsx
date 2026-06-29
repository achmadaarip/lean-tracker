import React, { useState, useEffect, useMemo } from 'react';
import { X, ArrowLeft, Flame, Dumbbell, Shield, Scale, Utensils, BarChart3, Search, Check, Copy, Zap } from 'lucide-react';
import { MealType, WorkoutType, FoodLogItem, WorkoutLogItem, BodyCompLogItem, FoodDbItem, MealPreset } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: Omit<FoodLogItem, 'id' | 'dateString'>) => void;
  onAddWorkout: (workout: Omit<WorkoutLogItem, 'id' | 'dateString'>) => void;
  onAddBodyComp: (comp: Omit<BodyCompLogItem, 'id' | 'dateString'>) => void;
  initialTab?: 'menu' | 'food' | 'workout' | 'weight' | 'bodycomp';
  initialMealType?: MealType;
  bodyCompLogs?: BodyCompLogItem[];
  foodDatabase: FoodDbItem[];
  mealPresets: MealPreset[];
}

const PRESET_WORKOUTS = [
  { name: 'Heavy Pull Session', type: 'gym' as WorkoutType, durationMinutes: 64, volumeKg: 13000, details: 'Pullups, heavy rows, curls' },
  { name: 'Heavy Push Session', type: 'gym' as WorkoutType, durationMinutes: 60, volumeKg: 12500, details: 'Bench press, incline dumbbell, dips' },
  { name: 'Leg Hypertrophy Day', type: 'gym' as WorkoutType, durationMinutes: 70, volumeKg: 17500, details: 'Barbell squats, RDLs' },
  { name: 'Zone 2 Steady Run', type: 'cardio' as WorkoutType, durationMinutes: 40, volumeKg: 0, details: 'Morning run outdoors' },
  { name: 'Incline Treadmill Walk', type: 'cardio' as WorkoutType, durationMinutes: 30, volumeKg: 0, details: 'Zone 2 fat burning' }
];

export default function QuickAddModal({
  isOpen,
  onClose,
  onAddFood,
  onAddWorkout,
  onAddBodyComp,
  initialTab = 'menu',
  initialMealType = 'breakfast',
  bodyCompLogs = [],
  foodDatabase,
  mealPresets
}: QuickAddModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'menu' | 'food' | 'workout' | 'weight' | 'bodycomp'>('menu');

  // Reset tab to initial tab when modal opens
  useEffect(() => {
    setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  // --- 1. FOOD LOG STATE ---
  const [selectedFood, setSelectedFood] = useState<FoodDbItem>(() => {
    return foodDatabase[0] || { id: 'f_db_1', name: 'Whole Egg', emoji: '🥚', unit: 'pcs', baseQty: 1, calories: 70, protein: 6.0, carbs: 0.6, fat: 5.0 };
  });
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [foodQtyInput, setFoodQtyInput] = useState('2');
  const [foodViewMode, setFoodViewMode] = useState<'single' | 'presets'>('single');

  // Synchronize meal type when initialMealType changes
  useEffect(() => {
    setMealType(initialMealType);
  }, [initialMealType]);

  // Filter food database based on search query
  const filteredFoods = useMemo(() => {
    if (!foodSearchQuery.trim()) return foodDatabase;
    return foodDatabase.filter(f => 
      f.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
    );
  }, [foodDatabase, foodSearchQuery]);

  // Synchronize food qty when food item is selected or preset clicked
  const selectFoodItem = (food: FoodDbItem) => {
    setSelectedFood(food);
    setFoodSearchQuery(food.name);
    // Suggest some realistic initial quantities based on unit
    if (food.unit === 'pcs' || food.unit === 'piece') {
      setFoodQtyInput('2');
    } else if (food.unit === 'g') {
      setFoodQtyInput('150');
    } else {
      setFoodQtyInput(food.baseQty.toString());
    }
    setIsFoodDropdownOpen(false);
  };

  // Derived nutrition values based on selection & quantity
  const parsedFoodQty = parseFloat(foodQtyInput) || 0;
  const nutritionFactor = selectedFood ? (parsedFoodQty / selectedFood.baseQty) : 1;
  
  const calculatedCalories = Math.round((selectedFood?.calories || 0) * nutritionFactor);
  const calculatedProtein = parseFloat(((selectedFood?.protein || 0) * nutritionFactor).toFixed(1));
  const calculatedCarbs = parseFloat(((selectedFood?.carbs || 0) * nutritionFactor).toFixed(1));
  const calculatedFat = parseFloat(((selectedFood?.fat || 0) * nutritionFactor).toFixed(1));

  // --- 2. WORKOUT LOG STATE ---
  const [workoutName, setWorkoutName] = useState('');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('gym');
  const [workoutDuration, setWorkoutDuration] = useState('60');
  const [workoutVolume, setWorkoutVolume] = useState('13000');
  const [workoutDetails, setWorkoutDetails] = useState('');

  // Manual Override state for workout calories
  const [isCaloriesOverridden, setIsCaloriesOverridden] = useState(false);
  const [overriddenCalories, setOverriddenCalories] = useState('');

  // Automatically estimate calories burned
  const durationNum = parseInt(workoutDuration) || 0;
  const volumeNum = parseInt(workoutVolume) || 0;
  const estimatedWorkoutCalories = useMemo(() => {
    if (workoutType === 'gym') {
      // 4.5 kcal/min steady strength work + extra burn based on total weight volume lifted
      return Math.round(durationNum * 4.5 + volumeNum * 0.008);
    } else {
      // 7.5 kcal/min steady cardiovascular work
      return Math.round(durationNum * 7.5);
    }
  }, [workoutType, durationNum, volumeNum]);

  const caloriesToSubmit = isCaloriesOverridden 
    ? (parseInt(overriddenCalories) || estimatedWorkoutCalories)
    : estimatedWorkoutCalories;

  const applyPresetWorkout = (preset: typeof PRESET_WORKOUTS[0]) => {
    setWorkoutName(preset.name);
    setWorkoutType(preset.type);
    setWorkoutDuration(preset.durationMinutes.toString());
    setWorkoutVolume(preset.volumeKg ? preset.volumeKg.toString() : '');
    setWorkoutDetails(preset.details);
    setIsCaloriesOverridden(false);
    setOverriddenCalories('');
  };

  // --- 3. WEIGHT & BODY COMP STATE ---
  const lastLog = bodyCompLogs.length > 0 ? bodyCompLogs[0] : null;
  const [weight, setWeight] = useState(lastLog ? lastLog.weight.toString() : '70.5');
  const [bodyFat, setBodyFat] = useState(lastLog ? lastLog.bodyFatPercent.toString() : '15.2');
  const [muscleMass, setMuscleMass] = useState(lastLog?.muscleMassKg ? lastLog.muscleMassKg.toString() : '56.8');
  const [visceral, setVisceral] = useState(lastLog?.visceralFat ? lastLog.visceralFat.toString() : '4');

  useEffect(() => {
    if (lastLog) {
      setWeight(lastLog.weight.toString());
      setBodyFat(lastLog.bodyFatPercent.toString());
      if (lastLog.muscleMassKg) setMuscleMass(lastLog.muscleMassKg.toString());
      if (lastLog.visceralFat) setVisceral(lastLog.visceralFat.toString());
    }
  }, [lastLog]);

  // Submit handlers
  const handleFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;
    
    const qtyFormatted = `${parsedFoodQty} ${selectedFood.unit}`;

    onAddFood({
      name: selectedFood.name,
      mealType,
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
      quantity: qtyFormatted,
      emoji: selectedFood.emoji,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });

    onClose();
  };

  // Log all items inside a preset cohesively
  const handleLogPreset = (preset: MealPreset) => {
    preset.items.forEach(item => {
      const dbFood = foodDatabase.find(f => f.id === item.foodId);
      if (dbFood) {
        const factor = item.quantity / dbFood.baseQty;
        onAddFood({
          name: dbFood.name,
          mealType,
          calories: Math.round(dbFood.calories * factor),
          protein: parseFloat((dbFood.protein * factor).toFixed(1)),
          carbs: parseFloat((dbFood.carbs * factor).toFixed(1)),
          fat: parseFloat((dbFood.fat * factor).toFixed(1)),
          quantity: `${item.quantity} ${dbFood.unit}`,
          emoji: dbFood.emoji,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    onClose();
  };

  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutName.trim()) return;

    onAddWorkout({
      type: workoutType,
      name: workoutName,
      category: workoutType === 'gym' ? 'Strength' : 'Endurance',
      durationMinutes: durationNum,
      caloriesBurned: caloriesToSubmit,
      volumeKg: workoutType === 'gym' ? volumeNum : undefined,
      details: workoutDetails || 'Completed session',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });

    setWorkoutName('');
    setIsCaloriesOverridden(false);
    setOverriddenCalories('');
    onClose();
  };

  const handleWeightOnlySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;
    onAddBodyComp({
      weight: parsedWeight,
      bodyFatPercent: lastLog ? lastLog.bodyFatPercent : 15.2,
      muscleMassKg: lastLog?.muscleMassKg ? lastLog.muscleMassKg : 56.8,
      visceralFat: lastLog?.visceralFat ? lastLog.visceralFat : 4,
      bmr: lastLog?.bmr ? lastLog.bmr : 1750
    });
    onClose();
  };

  const handleBodyCompSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;
    onAddBodyComp({
      weight: parsedWeight,
      bodyFatPercent: parseFloat(bodyFat) || 15.2,
      muscleMassKg: parseFloat(muscleMass) || 56.8,
      visceralFat: parseInt(visceral) || 4,
      bmr: lastLog?.bmr ? lastLog.bmr : 1750
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/45 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 z-0" onClick={onClose} />
      
      <div className="bg-white dark:bg-neutral-900 w-full sm:max-w-md rounded-t-[32px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.15)] transition-all border border-neutral-100 dark:border-neutral-800 z-10 relative">
        
        {/* iOS style sheet drag indicator handle */}
        <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto my-3 shrink-0 block sm:hidden" />

        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 pb-4 pt-2 sm:pt-6 border-b border-neutral-100 dark:border-neutral-800/80 shrink-0 select-none">
          <div className="flex items-center gap-2">
            {activeTab !== 'menu' && (
              <button 
                onClick={() => setActiveTab('menu')}
                className="p-2 -ml-2 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-400 cursor-pointer"
                aria-label="Back to Quick Actions"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-[17px] font-bold text-neutral-900 dark:text-white">
              {activeTab === 'menu' && "Quick Logger"}
              {activeTab === 'food' && "Log Food"}
              {activeTab === 'workout' && "Log Workout"}
              {activeTab === 'weight' && "Daily Weight Check-in"}
              {activeTab === 'bodycomp' && "Body Composition"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Container */}
        <div className="p-6">
          
          {/* ========================================================
              1. QUICK ACTIONS GRID MENU
              ======================================================== */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold select-none">
                Select metrics to update or logs to submit for today's recomposition journey.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('food');
                    if (foodDatabase.length > 0) {
                      selectFoodItem(foodDatabase[0]);
                    }
                  }}
                  className="flex flex-col items-start text-left p-4 rounded-2xl border border-green-100 dark:border-green-950/20 bg-green-50/20 hover:bg-green-50/45 dark:bg-green-950/10 dark:hover:bg-green-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <span className="text-2xl mb-2.5 transition-transform group-hover:scale-110">🍗</span>
                  <span className="text-xs font-extrabold text-green-800 dark:text-green-300">Add Food</span>
                  <span className="text-[9px] text-green-600/75 dark:text-green-400/60 mt-1 font-semibold leading-relaxed">
                    Log meals, protein, and custom presets
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('workout');
                    applyPresetWorkout(PRESET_WORKOUTS[0]);
                  }}
                  className="flex flex-col items-start text-left p-4 rounded-2xl border border-orange-100 dark:border-orange-950/20 bg-orange-50/20 hover:bg-orange-50/45 dark:bg-orange-950/10 dark:hover:bg-orange-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <span className="text-2xl mb-2.5 transition-transform group-hover:scale-110">🏋️</span>
                  <span className="text-xs font-extrabold text-orange-800 dark:text-orange-300">Add Workout</span>
                  <span className="text-[9px] text-orange-600/75 dark:text-orange-400/60 mt-1 font-semibold leading-relaxed">
                    Log lift volumes, cardio, and estimated burn
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('weight')}
                  className="flex flex-col items-start text-left p-4 rounded-2xl border border-blue-100 dark:border-blue-950/20 bg-blue-50/20 hover:bg-blue-50/45 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <span className="text-2xl mb-2.5 transition-transform group-hover:scale-110">⚖️</span>
                  <span className="text-xs font-extrabold text-blue-800 dark:text-blue-300">Add Weight</span>
                  <span className="text-[9px] text-blue-600/75 dark:text-blue-400/60 mt-1 font-semibold leading-relaxed">
                    Log daily weight to keep your trend active
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('bodycomp')}
                  className="flex flex-col items-start text-left p-4 rounded-2xl border border-purple-100 dark:border-purple-950/20 bg-purple-50/20 hover:bg-purple-50/45 dark:bg-purple-950/10 dark:hover:bg-purple-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <span className="text-2xl mb-2.5 transition-transform group-hover:scale-110">📊</span>
                  <span className="text-xs font-extrabold text-purple-800 dark:text-purple-300">Body Comp</span>
                  <span className="text-[9px] text-purple-600/75 dark:text-purple-400/60 mt-1 font-semibold leading-relaxed">
                    Submit muscle mass, fat % and visceral indexes
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              2. SIMPLIFIED NUTRITION/FOOD LOG WITH NO MANUAL MACROS ENTRIES
              ======================================================== */}
          {activeTab === 'food' && (
            <div className="space-y-5">
              
              {/* FOOD LOG SUB-TABS: Single Food vs Reusable Meal Presets */}
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button
                  onClick={() => setFoodViewMode('single')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    foodViewMode === 'single'
                      ? 'bg-white dark:bg-neutral-900 shadow-sm text-primary dark:text-white'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  🍏 Single Food
                </button>
                <button
                  onClick={() => setFoodViewMode('presets')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    foodViewMode === 'presets'
                      ? 'bg-white dark:bg-neutral-900 shadow-sm text-primary dark:text-white'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  🍱 Reusable Presets ({mealPresets.length})
                </button>
              </div>

              {/* MEAL SELECTION ROW (GLOBAL FOR BOTH MODES) */}
              <div className="select-none">
                <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
                  Meal Group
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold capitalize border transition-all cursor-pointer text-center ${
                        mealType === type
                          ? 'border-primary bg-primary/5 text-primary font-black'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {foodViewMode === 'single' ? (
                <form onSubmit={handleFoodSubmit} className="space-y-4">
                  {/* FAST PRESETS CAROUSEL (FROM DATABASE STATE ONLY) */}
                  <div>
                    <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2 select-none">
                      Fast Presets
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scroll-hide scroll-smooth flex-nowrap -mx-2 px-2 select-none">
                      {foodDatabase.map((foodItem) => (
                        <button
                          key={foodItem.id}
                          type="button"
                          onClick={() => selectFoodItem(foodItem)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border shrink-0 transition-all cursor-pointer active:scale-95 ${
                            selectedFood?.id === foodItem.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <span>{foodItem.emoji}</span>
                          <span>{foodItem.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SEARCHABLE FOOD DROPDOWN */}
                  <div className="relative">
                    <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 select-none">
                      Search Food
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search food database..."
                        value={foodSearchQuery}
                        onFocus={() => setIsFoodDropdownOpen(true)}
                        onChange={(e) => {
                          setFoodSearchQuery(e.target.value);
                          setIsFoodDropdownOpen(true);
                        }}
                        className="w-full pl-9 pr-8 py-2.5 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-neutral-900 dark:text-white"
                      />
                      {foodSearchQuery && (
                        <button 
                          type="button"
                          onClick={() => {
                            setFoodSearchQuery('');
                            setIsFoodDropdownOpen(true);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-bold"
                        >
                          Clear
                        </button>
                      )}

                      {isFoodDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] max-h-48 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 animate-fade-in">
                          {filteredFoods.length > 0 ? (
                            filteredFoods.map((food) => {
                              const isSelected = selectedFood?.id === food.id;
                              return (
                                <button
                                  key={food.id}
                                  type="button"
                                  onClick={() => selectFoodItem(food)}
                                  className="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{food.emoji}</span>
                                    <span className={isSelected ? "text-primary" : "text-neutral-800 dark:text-neutral-200"}>{food.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400">
                                    <span>{food.baseQty} {food.unit}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-4 py-3 text-xs font-bold text-neutral-400 dark:text-neutral-500">
                              No matching foods in database
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QUANTITY INPUT */}
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 select-none">
                      Quantity
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="any"
                        required
                        min="0.1"
                        value={foodQtyInput}
                        onChange={(e) => setFoodQtyInput(e.target.value)}
                        className="w-full pl-4 pr-16 py-2.5 text-sm font-black bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-neutral-900 dark:text-white"
                      />
                      <span className="absolute right-4 text-xs font-extrabold text-neutral-400 dark:text-neutral-500 select-none">
                        {selectedFood?.unit || 'pcs'}
                      </span>
                    </div>
                  </div>

                  {/* READ-ONLY COMPUTED NUTRITIONAL PREVIEW */}
                  <div className="space-y-2 pt-1 select-none">
                    <span className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                      Live Nutrition Preview
                    </span>
                    
                    <div className="bg-neutral-50 dark:bg-neutral-800/45 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200/50 dark:border-neutral-800/50 mb-2.5">
                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Calories</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-black text-primary">{calculatedCalories}</span>
                          <span className="text-[10px] font-bold text-primary-light">kcal</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-500/5 dark:bg-green-500/10 p-2 rounded-xl text-center">
                          <span className="block text-[8px] font-black text-green-700 dark:text-green-400 uppercase">Protein</span>
                          <span className="text-xs font-black text-green-700 dark:text-green-400">{calculatedProtein}g</span>
                        </div>
                        <div className="bg-amber-500/5 dark:bg-amber-500/10 p-2 rounded-xl text-center">
                          <span className="block text-[8px] font-black text-amber-700 dark:text-amber-400 uppercase">Carbs</span>
                          <span className="text-xs font-black text-amber-700 dark:text-amber-400">{calculatedCarbs}g</span>
                        </div>
                        <div className="bg-blue-500/5 dark:bg-blue-500/10 p-2 rounded-xl text-center">
                          <span className="block text-[8px] font-black text-blue-700 dark:text-blue-400 uppercase">Fat</span>
                          <span className="text-xs font-black text-blue-700 dark:text-blue-400">{calculatedFat}g</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/10 text-sm cursor-pointer"
                  >
                    Log Food Item
                  </button>
                </form>
              ) : (
                /* REUSABLE MEAL PRESETS SELECTOR */
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest select-none">
                    Select a Preset Template to Log
                  </p>

                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto scroll-hide">
                    {mealPresets.map(preset => {
                      let presetCals = 0;
                      let presetPro = 0;

                      preset.items.forEach(item => {
                        const dbFood = foodDatabase.find(f => f.id === item.foodId);
                        if (dbFood) {
                          const factor = item.quantity / dbFood.baseQty;
                          presetCals += dbFood.calories * factor;
                          presetPro += dbFood.protein * factor;
                        }
                      });

                      return (
                        <div key={preset.id} className="p-4 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-150 dark:border-neutral-800 flex justify-between items-center group">
                          <div>
                            <h4 className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200">{preset.name}</h4>
                            <div className="flex gap-2 text-[9px] text-neutral-400 font-bold mt-0.5">
                              <span className="text-primary-light">{Math.round(presetCals)} kcal</span>
                              <span>•</span>
                              <span className="text-green-600">{presetPro.toFixed(1)}g Protein</span>
                            </div>
                            
                            {/* Short inline list */}
                            <p className="text-[10px] text-neutral-450 mt-1.5 font-semibold">
                              {preset.items.map(item => {
                                const dbF = foodDatabase.find(f => f.id === item.foodId);
                                return dbF ? `${dbF.emoji} ${item.quantity}${dbF.unit}` : '';
                              }).join(' • ')}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleLogPreset(preset)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] font-black rounded-full shadow-md shadow-primary/10 transition-all cursor-pointer active:scale-95"
                          >
                            <Zap className="w-3 h-3 fill-white" /> Log Preset
                          </button>
                        </div>
                      );
                    })}

                    {mealPresets.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-xs text-neutral-400 font-bold">No meal presets built yet.</p>
                        <p className="text-[10px] text-neutral-400 mt-1">Configure presets in the Settings tab to log templates instantly.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              3. SIMPLIFIED WORKOUT LOG MODAL WITH AUTOMATIC CALORIE ESTIMATION & BADGE
              ======================================================== */}
          {activeTab === 'workout' && (
            <form onSubmit={handleWorkoutSubmit} className="space-y-4">
              
              {/* Presets Row */}
              <div>
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2 select-none">
                  Preset Templates
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scroll-hide scroll-smooth flex-nowrap -mx-2 px-2 select-none">
                  {PRESET_WORKOUTS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPresetWorkout(preset)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-full border border-neutral-150 dark:border-neutral-800 shrink-0 transition-colors cursor-pointer active:scale-95"
                    >
                      <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{preset.name.split(' ')[0]} {preset.name.includes('Run') ? 'Run' : 'Lifts'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Type (Category) */}
              <div>
                <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 select-none">
                  Workout Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkoutType('gym');
                      setIsCaloriesOverridden(false);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      workoutType === 'gym'
                        ? 'border-primary bg-primary/5 text-primary font-black'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    💪 Strength
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkoutType('cardio');
                      setIsCaloriesOverridden(false);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      workoutType === 'cardio'
                        ? 'border-primary bg-primary/5 text-primary font-black'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    🏃 Cardio
                  </button>
                </div>
              </div>

              {/* Workout Name */}
              <div>
                <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
                  Workout Name
                </label>
                <input
                  type="text"
                  required
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder={workoutType === 'gym' ? "Bench & Triceps (Hevy)" : "Cardio Run"}
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-neutral-900 dark:text-white"
                />
              </div>

              {/* Duration and Lift Volume */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-black bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
                    Total Lifted Volume (kg)
                  </label>
                  <input
                    type="number"
                    value={workoutVolume}
                    onChange={(e) => setWorkoutVolume(e.target.value)}
                    placeholder="e.g. 13000"
                    disabled={workoutType === 'cardio'}
                    className="w-full px-3.5 py-2 text-sm font-black bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* ESTIMATED CALORIES BURNED BOX WITH BADGE */}
              <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl p-4 border border-neutral-150 dark:border-neutral-800 space-y-3 select-none">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                      Estimated Calories Burned
                    </span>
                    {!isCaloriesOverridden && (
                      <span className="text-[9px] font-black bg-primary/10 dark:bg-[#99f894]/10 text-primary dark:text-[#99f894] px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Auto Calculated
                      </span>
                    )}
                  </div>
                  
                  {!isCaloriesOverridden ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCaloriesOverridden(true);
                        setOverriddenCalories(estimatedWorkoutCalories.toString());
                      }}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Override
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCaloriesOverridden(false)}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Auto-Calc
                    </button>
                  )}
                </div>

                {!isCaloriesOverridden ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-neutral-800 dark:text-neutral-100">{estimatedWorkoutCalories}</span>
                    <span className="text-xs font-bold text-neutral-400">kcal</span>
                  </div>
                ) : (
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      value={overriddenCalories}
                      onChange={(e) => setOverriddenCalories(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm font-bold bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                    />
                    <span className="absolute right-3.5 text-xs font-bold text-neutral-400">kcal</span>
                  </div>
                )}
              </div>

              {/* Details notes */}
              <div>
                <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
                  Workout details
                </label>
                <textarea
                  value={workoutDetails}
                  onChange={(e) => setWorkoutDetails(e.target.value)}
                  placeholder="Completed workout via Hevy app..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/10 text-sm cursor-pointer"
              >
                Log Workout
              </button>
            </form>
          )}

          {/* ========================================================
              4. WEIGHT CHECK-IN VIEW
              ======================================================== */}
          {activeTab === 'weight' && (
            <form onSubmit={handleWeightOnlySubmit} className="space-y-4">
              <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 rounded-2xl p-4 flex gap-3 items-start select-none">
                <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">Scale Weight Check-In</h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
                    We maintain your 7-Day Moving Average trend. Keep logging daily for maximal body composition precision.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                  Body Weight (kg)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 text-lg font-black bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-750 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-neutral-900 dark:text-white"
                  />
                  <span className="absolute right-4 text-sm font-black text-neutral-400">kg</span>
                </div>
              </div>

              {/* Adjusters */}
              <div className="flex gap-1.5 justify-center py-1 select-none">
                {[-0.5, -0.1, 0.1, 0.5].map((adj) => (
                  <button
                    key={adj}
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(weight) || 70.0;
                      setWeight((cur + adj).toFixed(2));
                    }}
                    className="px-3.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-xs font-bold rounded-lg border border-neutral-150 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer active:scale-90"
                  >
                    {adj > 0 ? `+${adj}` : adj}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/10 text-sm cursor-pointer mt-2"
              >
                Log Scale Weight
              </button>
            </form>
          )}

          {/* ========================================================
              5. BODY COMPOSITION DETAILED VIEW
              ======================================================== */}
          {activeTab === 'bodycomp' && (
            <form onSubmit={handleBodyCompSubmit} className="space-y-4">
              <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 rounded-2xl p-4 flex gap-3 items-start select-none">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300">Biimpedance Composition</h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
                    Submit skinfold caliper or smart scale indices. Tracks visceral lipid layers and muscle synthesis.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Muscle Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Visceral level</label>
                  <input
                    type="number"
                    required
                    value={visceral}
                    onChange={(e) => setVisceral(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 rounded-xl focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/10 text-sm cursor-pointer mt-2"
              >
                Log Detailed Composition
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
