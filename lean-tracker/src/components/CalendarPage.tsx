import React, { useState } from 'react';
import { Calendar, Trash2, Dumbbell, Utensils, Scale, Plus, Award } from 'lucide-react';
import { FoodLogItem, WorkoutLogItem, BodyCompLogItem, UserProfile } from '../types';

interface CalendarPageProps {
  profile: UserProfile;
  foodLogs: FoodLogItem[];
  workoutLogs: WorkoutLogItem[];
  bodyCompLogs: BodyCompLogItem[];
  onOpenQuickAdd: (tab?: 'food' | 'workout' | 'weight') => void;
  onDeleteFood: (id: string) => void;
  onDeleteWorkout: (id: string) => void;
}

export default function CalendarPage({
  profile,
  foodLogs,
  workoutLogs,
  bodyCompLogs,
  onOpenQuickAdd,
  onDeleteFood,
  onDeleteWorkout
}: CalendarPageProps) {
  // June 2026 calendar helper
  // June 2026 has 30 days. June 1, 2026 is a Monday.
  // Since it starts on Monday, grid aligns perfectly with Monday-first system!
  const totalDays = 30;
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Keep track of currently selected day of June 2026 (1-30)
  const [selectedDay, setSelectedDay] = useState<number>(29); // Default to today (29th)

  const getDayDateString = (dayNum: number) => {
    const padded = dayNum.toString().padStart(2, '0');
    return `2026-06-${padded}`;
  };

  const selectedDateStr = getDayDateString(selectedDay);

  // Filter logs for selected day
  const dailyFood = foodLogs.filter(item => item.dateString === selectedDateStr);
  const dailyWorkouts = workoutLogs.filter(item => item.dateString === selectedDateStr);
  const dailyBodyComp = bodyCompLogs.find(item => item.dateString === selectedDateStr);

  const totalCaloriesOnDay = dailyFood.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinOnDay = dailyFood.reduce((sum, item) => sum + item.protein, 0);
  const totalBurnedOnDay = dailyWorkouts.reduce((sum, item) => sum + item.caloriesBurned, 0);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Calendar Grid Section */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-[24px] shadow-sm space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Select Day</span>
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
            const isSelected = selectedDay === dayNum;

            // Check what logs exist on this date to draw small dot indicators
            const hasFood = foodLogs.some(l => l.dateString === dateStr);
            const hasWorkout = workoutLogs.some(l => l.dateString === dateStr);
            const hasWeight = bodyCompLogs.some(l => l.dateString === dateStr);

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
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

      {/* Selected Day Overview Headers */}
      <div className="px-1 flex justify-between items-center">
        <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
          Daily Log: June {selectedDay}
        </h3>
        <button
          onClick={() => onOpenQuickAdd('food')}
          className="flex items-center gap-1 text-xs font-bold text-primary dark:text-[#99f894] hover:opacity-85"
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {/* Selected Day Analytics Metrics */}
      <section className="grid grid-cols-3 gap-3">
        {/* Consumed */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3.5 text-center shadow-sm">
          <Utensils className="w-4 h-4 text-green-500 mx-auto mb-1.5" />
          <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Consumed</p>
          <p className="text-sm font-extrabold text-neutral-900 dark:text-white mt-1">{totalCaloriesOnDay} kcal</p>
        </div>

        {/* Protein */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3.5 text-center shadow-sm">
          <Award className="w-4 h-4 text-primary mx-auto mb-1.5" />
          <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Protein</p>
          <p className="text-sm font-extrabold text-neutral-900 dark:text-white mt-1">{totalProteinOnDay}g</p>
        </div>

        {/* Burned */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3.5 text-center shadow-sm">
          <Dumbbell className="w-4 h-4 text-orange-500 mx-auto mb-1.5" />
          <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Burned</p>
          <p className="text-sm font-extrabold text-neutral-900 dark:text-white mt-1">{totalBurnedOnDay} kcal</p>
        </div>
      </section>

      {/* List of details */}
      <div className="space-y-3">
        {/* Weight measurement */}
        {dailyBodyComp && (
          <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Weight & Composition</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Body fat: {dailyBodyComp.bodyFatPercent}%</p>
              </div>
            </div>
            <p className="text-sm font-black text-blue-700 dark:text-blue-400">{dailyBodyComp.weight} kg</p>
          </div>
        )}

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
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Protein: {food.protein}g • Carbs: {food.carbs}g</p>
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
