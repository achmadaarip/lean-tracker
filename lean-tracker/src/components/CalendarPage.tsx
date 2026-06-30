import React from 'react';
import { Calendar, Trash2, Dumbbell, Utensils, Scale, Plus, Award, Flame, Heart, Info, Clock } from 'lucide-react';
import { FoodLogItem, WorkoutLogItem, BodyCompLogItem, UserProfile } from '../types';
import { getFormattedDate } from '../utils';

interface CalendarPageProps {
  profile: UserProfile;
  foodLogs: FoodLogItem[];
  workoutLogs: WorkoutLogItem[];
  bodyCompLogs: BodyCompLogItem[];
  onOpenQuickAdd: (tab?: 'food' | 'workout' | 'weight' | 'bodycomp') => void;
  onDeleteFood: (id: string) => void;
  onDeleteWorkout: (id: string) => void;
  selectedDateString: string;
  setSelectedDateString: (dateStr: string) => void;
}

export default function CalendarPage({
  profile,
  foodLogs,
  workoutLogs,
  bodyCompLogs,
  onOpenQuickAdd,
  onDeleteFood,
  onDeleteWorkout,
  selectedDateString,
  setSelectedDateString
}: CalendarPageProps) {
  // Hardcoded for June 2026 to match local logs structure
  const totalDays = 30;
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Parse current day number from selectedDateString
  const parts = selectedDateString.split('-');
  const currentDay = parts[2] ? parseInt(parts[2]) : 29;

  const getDayDateString = (dayNum: number) => {
    const padded = dayNum.toString().padStart(2, '0');
    return `2026-06-${padded}`;
  };

  const handleSelectDay = (dayNum: number) => {
    setSelectedDateString(getDayDateString(dayNum));
  };

  // Filter logs for the currently selected day
  const dailyFood = foodLogs.filter(item => item.dateString === selectedDateString);
  const dailyWorkouts = workoutLogs.filter(item => item.dateString === selectedDateString);
  const dailyBodyComp = bodyCompLogs.find(item => item.dateString === selectedDateString);

  // Calculations for selected day
  const totalCaloriesOnDay = dailyFood.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinOnDay = dailyFood.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbsOnDay = dailyFood.reduce((sum, item) => sum + item.carbs, 0);
  const totalFatOnDay = dailyFood.reduce((sum, item) => sum + item.fat, 0);

  const totalBurnedOnDay = dailyWorkouts.reduce((sum, item) => sum + item.caloriesBurned, 0);
  const gymWorkoutsCount = dailyWorkouts.filter(w => w.type === 'gym').length;
  const cardioWorkoutsCount = dailyWorkouts.filter(w => w.type === 'cardio').length;

  const netCaloriesOnDay = totalCaloriesOnDay - totalBurnedOnDay;
  const deficitOnDay = profile.maintenanceTdee - totalCaloriesOnDay + totalBurnedOnDay;
  const targetDeficit = profile.maintenanceTdee - profile.dailyCalorieTarget;

  const calculateBMI = (w: number) => {
    const h = profile.height || 175;
    const heightM = h / 100;
    return parseFloat((w / (heightM * heightM)).toFixed(1));
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in select-none">
      {/* Calendar Grid Section */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-[24px] shadow-sm space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">History Browser</span>
          <span className="text-xs font-extrabold text-primary dark:text-[#99f894]">June 2026</span>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
          {daysOfWeek.map((d, idx) => (
            <div key={idx} className="h-5 flex items-center justify-center">{d}</div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = getDayDateString(dayNum);
            const isSelected = currentDay === dayNum;

            // Check what logs exist on this date to draw small dot indicators
            const hasFood = foodLogs.some(l => l.dateString === dateStr);
            const hasWorkout = workoutLogs.some(l => l.dateString === dateStr);
            const hasWeight = bodyCompLogs.some(l => l.dateString === dateStr);

            return (
              <button
                key={dayNum}
                onClick={() => handleSelectDay(dayNum)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 transition-all relative ${
                  isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105 font-black'
                    : 'bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold'
                }`}
              >
                <span className="text-xs">{dayNum}</span>
                {/* Visual indicator dots */}
                <div className="flex gap-0.5 justify-center w-full">
                  {hasFood && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></span>
                  )}
                  {hasWorkout && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500'}`}></span>
                  )}
                  {hasWeight && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Day Overview */}
      <div className="px-1 flex justify-between items-center">
        <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
          Summary: June {currentDay}
        </h3>
        <button
          onClick={() => onOpenQuickAdd('food')}
          className="flex items-center gap-1 text-xs font-bold text-primary dark:text-[#99f894] hover:opacity-85"
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {/* Selected Day Core Summary Cards Grid */}
      <section className="grid grid-cols-2 gap-3.5">
        {/* Food Summary Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-green-500" />
            <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Food Summary</span>
          </div>
          <div className="space-y-1">
            <p className="text-base font-black text-neutral-900 dark:text-white">{totalCaloriesOnDay} kcal</p>
            <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-neutral-500 dark:text-neutral-400">
              <div>
                <span className="text-primary font-black">{totalProteinOnDay.toFixed(0)}g</span> P
              </div>
              <div>
                <span>{totalCarbsOnDay.toFixed(0)}g</span> C
              </div>
              <div>
                <span>{totalFatOnDay.toFixed(0)}g</span> F
              </div>
            </div>
          </div>
        </div>

        {/* Workout Summary Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Workout Summary</span>
          </div>
          <div className="space-y-1">
            <p className="text-base font-black text-neutral-900 dark:text-white">-{totalBurnedOnDay} kcal</p>
            <p className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400">
              {gymWorkoutsCount} Strength • {cardioWorkoutsCount} Cardio
            </p>
          </div>
        </div>

        {/* Net Calories Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Net Calories</span>
          </div>
          <div className="space-y-1">
            <p className="text-base font-black text-neutral-900 dark:text-white">
              {netCaloriesOnDay.toLocaleString()} <span className="text-[10px] font-medium text-neutral-400">kcal</span>
            </p>
            <p className="text-[9px] text-neutral-500 dark:text-neutral-400 font-bold">
              Food: {totalCaloriesOnDay} - Active: {totalBurnedOnDay}
            </p>
          </div>
        </div>

        {/* Daily Deficit Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary fill-primary/10" />
            <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Daily Deficit</span>
          </div>
          <div className="space-y-1">
            <p className="text-base font-black text-neutral-900 dark:text-white">
              {deficitOnDay.toLocaleString()} <span className="text-[10px] font-medium text-neutral-400">kcal</span>
            </p>
            <p className="text-[9px] text-primary font-bold">
              Goal: {targetDeficit} kcal
            </p>
          </div>
        </div>
      </section>

      {/* Body Composition Card if logged */}
      {dailyBodyComp && (
        <section className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-blue-100/40 dark:border-blue-900/10 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">Weight & Composition</span>
            </div>
            <span className="text-sm font-black text-blue-700 dark:text-blue-400">{dailyBodyComp.weight.toFixed(1)} kg</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 pt-3 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 text-center">
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-neutral-400">Fat</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{dailyBodyComp.bodyFatPercent.toFixed(1)}%</span>
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-neutral-400">Muscle</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">{dailyBodyComp.muscleMassKg?.toFixed(1) || '-'} kg</span>
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-neutral-400">Visc</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">{dailyBodyComp.visceralFat || '-'}</span>
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-neutral-400">BMI</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">{calculateBMI(dailyBodyComp.weight)}</span>
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-neutral-400">BMR</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">{dailyBodyComp.bmr || '-'}</span>
            </div>
          </div>
        </section>
      )}

      {/* List of Details */}
      <div className="space-y-3">
        {/* Food Details list */}
        {dailyFood.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-[22px] border border-neutral-100 dark:border-neutral-800 p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Nutrition Records</h4>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {dailyFood.map(food => (
                <div key={food.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{food.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{food.name}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Protein: {food.protein}g • Carbs: {food.carbs}g • Fat: {food.fat}g</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{food.calories} kcal</span>
                    <button
                      onClick={() => onDeleteFood(food.id)}
                      className="p-1 text-neutral-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workouts detail list */}
        {dailyWorkouts.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-[22px] border border-neutral-100 dark:border-neutral-800 p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Activity Records</h4>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {dailyWorkouts.map(workout => (
                <div key={workout.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{workout.name}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">{workout.category} • {workout.durationMinutes} mins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">-{workout.caloriesBurned} kcal</span>
                    <button
                      onClick={() => onDeleteWorkout(workout.id)}
                      className="p-1 text-neutral-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {dailyFood.length === 0 && dailyWorkouts.length === 0 && !dailyBodyComp && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-8 text-center text-neutral-400 shadow-sm space-y-3">
            <Calendar className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs font-bold">No tracking records on this day</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Maintain your body recomposition streak by logging meals and activity daily.</p>
          </div>
        )}
      </div>
    </div>
  );
}
