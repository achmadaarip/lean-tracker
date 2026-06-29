import React from 'react';
import { Flame, Calendar, Award, Dumbbell, Sparkles, Plus, Scale, ChevronRight, Apple, X, CheckCircle2, Clock } from 'lucide-react';
import { FoodLogItem, WorkoutLogItem, BodyCompLogItem, UserProfile } from '../types';
import { getFormattedDate } from '../utils';
import { motion } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
  foodLogs: FoodLogItem[];
  workoutLogs: WorkoutLogItem[];
  bodyCompLogs: BodyCompLogItem[];
  onNavigate: (tab: 'home' | 'food' | 'workouts' | 'progress' | 'settings') => void;
  onOpenQuickAdd: (tab?: 'food' | 'workout' | 'weight') => void;
  onDeleteFood: (id: string) => void;
  onDeleteWorkout: (id: string) => void;
}

export default function Dashboard({
  profile,
  foodLogs,
  workoutLogs,
  bodyCompLogs,
  onNavigate,
  onOpenQuickAdd,
  onDeleteFood,
  onDeleteWorkout
}: DashboardProps) {
  // 1. Calculate Core Calories Metrics
  const targetCalories = profile.dailyCalorieTarget;
  const consumedCalories = foodLogs.reduce((sum, item) => sum + item.calories, 0);
  const burnedCalories = workoutLogs.reduce((sum, item) => sum + item.caloriesBurned, 0);
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);

  // Calorie progress percentage
  const caloriePercent = Math.min(100, (consumedCalories / targetCalories) * 100);
  const strokeCircumference = 2 * Math.PI * 92; // Radius 92 -> 578.05
  const strokeOffset = strokeCircumference - (caloriePercent / 100) * strokeCircumference;

  // 2. Protein Metrics
  const targetProtein = profile.dailyProteinTarget;
  const consumedProtein = foodLogs.reduce((sum, item) => sum + item.protein, 0);
  const proteinPercent = Math.min(100, Math.round((consumedProtein / targetProtein) * 100));
  const proteinStrokeCircumference = 2 * Math.PI * 18; // Radius 18 -> 113.1
  const proteinStrokeOffset = proteinStrokeCircumference - (proteinPercent / 100) * proteinStrokeCircumference;

  // 3. Deficit calculation: TDEE - Consumed + Burned
  const currentDeficit = profile.maintenanceTdee - consumedCalories + burnedCalories;
  const targetDeficit = profile.maintenanceTdee - profile.dailyCalorieTarget;

  // 4. Weight Metrics
  const latestWeightLog = bodyCompLogs[0] || { weight: 70.5, bodyFatPercent: 15.2 };
  const baselineWeight = bodyCompLogs[bodyCompLogs.length - 1]?.weight || 72.7;
  const weightChange = latestWeightLog.weight - baselineWeight;
  const weightChangeStr = weightChange <= 0 ? `${weightChange.toFixed(1)} kg` : `+${weightChange.toFixed(1)} kg`;

  // 7-Day Moving Average
  const weightSum = bodyCompLogs.slice(0, 7).reduce((sum, item) => sum + item.weight, 0);
  const ma7Weight = bodyCompLogs.length > 0 ? (weightSum / Math.min(7, bodyCompLogs.length)).toFixed(1) : '70.9';

  // 5. Dynamic AI Coach Evaluation Text
  const getAiEvaluation = () => {
    if (foodLogs.length === 0) {
      return "Start logging your meals and workouts today! Consistency in tracking protein intake and energy deficit is the absolute key to successful body recomposition.";
    }
    const proteinRatio = consumedProtein / targetProtein;
    const calorieRatio = consumedCalories / targetCalories;

    let evaluation = "Optimal progress today. ";
    if (proteinRatio >= 0.85) {
      evaluation += "Protein intake is fully achieved, keeping your muscle mass protected. ";
    } else {
      evaluation += `Protein intake is currently at ${Math.round(proteinRatio * 100)}% of your goal. Add a whole food source like egg whites or chicken breast to hit your recovery target. `;
    }

    if (calorieRatio <= 1.0) {
      evaluation += "Calorie expenditure remains well within your active energy limit. ";
    } else {
      evaluation += "You've exceeded your daily calorie target. Focus on keeping active to secure your recomp deficit. ";
    }

    if (currentDeficit >= targetDeficit) {
      evaluation += "Your caloric deficit is perfectly aligned for lean mass preservation and body fat reduction.";
    } else {
      evaluation += `Try to keep moving to secure your target daily deficit of ${targetDeficit} kcal.`;
    }
    return evaluation;
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in select-none">
      
      {/* Centered Premium Streak Badge */}
      <div className="flex justify-center">
        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#99f894] font-bold px-4 py-1.5 text-[11px] rounded-full flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] uppercase tracking-wider cursor-pointer"
        >
          <span>🔥</span>
          <span>{profile.streakCount} Day Streak</span>
        </motion.div>
      </div>

      {/* 1. HERO CALORIE RING CARD */}
      <section className="bg-white dark:bg-neutral-900 rounded-[28px] border border-neutral-100/60 dark:border-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.015)] p-6 flex flex-col items-center">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Circular SVG Progress Ring with micro-animation */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 224 224">
            <circle
              className="text-neutral-100 dark:text-neutral-800"
              cx="112"
              cy="112"
              r="92"
              strokeWidth="10"
              fill="transparent"
              stroke="currentColor"
            />
            <motion.circle
              className="text-primary"
              cx="112"
              cy="112"
              r="92"
              strokeWidth="10.5"
              fill="transparent"
              stroke="currentColor"
              strokeDasharray={strokeCircumference}
              initial={{ strokeDashoffset: strokeCircumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            {/* Number is the focal point */}
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-5xl font-black tracking-tight text-neutral-900 dark:text-white"
            >
              {remainingCalories.toLocaleString()}
            </motion.span>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1.5">
              kcal remaining
            </span>
          </div>
        </div>

        {/* Dynamic Macro/Calorie KPI Row - Faint border, high negative space */}
        <div className="grid grid-cols-3 w-full gap-4 mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/60 text-center">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Consumed</span>
            <span className="text-base font-extrabold text-neutral-800 dark:text-neutral-100 mt-1 block">
              {consumedCalories.toLocaleString()} <span className="text-[9px] font-normal text-neutral-400">kcal</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Burned</span>
            <span className="text-base font-extrabold text-neutral-800 dark:text-neutral-100 mt-1 block">
              {burnedCalories.toLocaleString()} <span className="text-[9px] font-normal text-neutral-400">kcal</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Goal Target</span>
            <span className="text-base font-extrabold text-neutral-800 dark:text-neutral-100 mt-1 block">
              {targetCalories.toLocaleString()} <span className="text-[9px] font-normal text-neutral-400">kcal</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. RECOMPOSITION SECONDARY SUMMARY CARDS */}
      <section className="grid grid-cols-3 gap-3">
        {/* Protein Summary Card */}
        <div 
          onClick={() => onNavigate('food')}
          className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col items-center text-center cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
        >
          <div className="relative w-12 h-12 mb-2 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="18" fill="transparent" stroke="currentColor" className="text-neutral-100 dark:text-neutral-800" strokeWidth="2.5" />
              <motion.circle 
                cx="24" 
                cy="24" 
                r="18" 
                fill="transparent" 
                stroke="var(--color-primary)" 
                strokeWidth="3" 
                strokeDasharray={proteinStrokeCircumference} 
                initial={{ strokeDashoffset: proteinStrokeCircumference }}
                animate={{ strokeDashoffset: proteinStrokeOffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round" 
              />
            </svg>
            <span className="absolute text-[9px] font-black text-neutral-800 dark:text-neutral-200">{proteinPercent}%</span>
          </div>
          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Protein</span>
          <span className="text-sm font-black text-neutral-900 dark:text-neutral-100 mt-0.5">{consumedProtein.toFixed(1)}g</span>
          <span className="text-[9px] text-neutral-400 mt-1">/ {targetProtein}g</span>
        </div>

        {/* Deficit State Card */}
        <div 
          onClick={() => onNavigate('workouts')}
          className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col items-center text-center cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
        >
          <div className="w-10 h-10 mb-3 flex items-center justify-center bg-primary/10 rounded-full text-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            <Flame className="w-5 h-5 fill-primary" />
          </div>
          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Net Deficit</span>
          <span className="text-sm font-black text-neutral-900 dark:text-neutral-100 mt-0.5">{currentDeficit.toLocaleString()}</span>
          <span className="text-[9px] text-primary font-bold mt-1.5 flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Goal: {targetDeficit}
          </span>
        </div>

        {/* Weight & Body Comp Card */}
        <div 
          onClick={() => onNavigate('progress')}
          className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col items-center text-center cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
        >
          <div className="w-10 h-10 mb-3 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 rounded-full text-neutral-700 dark:text-neutral-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            <Scale className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Weight</span>
          <span className="text-sm font-black text-neutral-900 dark:text-neutral-100 mt-0.5">{latestWeightLog.weight.toFixed(1)}kg</span>
          <div className="mt-1 flex flex-col items-center text-[8px] leading-tight text-neutral-400 font-bold">
            <span className="text-primary">{weightChangeStr}</span>
            <span className="font-normal">MA7: {ma7Weight}</span>
          </div>
        </div>
      </section>

      {/* 3. PREMIUM AI COACH EVALUATION BOX */}
      <section className="bg-primary/[0.02] dark:bg-primary/[0.04] rounded-[24px] p-5 border border-primary/10 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="bg-primary text-white p-2.5 rounded-2xl shadow-sm shadow-primary/20 shrink-0">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div className="space-y-1.5 z-10">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
              Coach Advice
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {getAiEvaluation()}
            </p>
          </div>
        </div>
        {/* Faint luxury glassmorphism radial accent */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 blur-[40px] rounded-full select-none"></div>
      </section>

      {/* 4. TODAY'S SESSIONS TIMELINE PREVIEW */}
      <section className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">Today's Sessions</h3>
          {burnedCalories > 0 && (
            <span className="text-primary font-bold text-xs">{burnedCalories} kcal burned</span>
          )}
        </div>
        
        {workoutLogs.length === 0 ? (
          <div className="border border-dashed border-neutral-150 dark:border-neutral-800 rounded-2xl p-6 text-center">
            <p className="text-xs text-neutral-400 font-bold mb-3">No workouts logged for today.</p>
            <button
              onClick={() => onOpenQuickAdd('workout')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-extrabold text-xs rounded-full border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Log Workout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutLogs.map((workout) => (
              <div 
                key={workout.id} 
                className="group flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-[18px] border border-neutral-100/60 dark:border-neutral-800/40 hover:border-primary/20 transition-all relative"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    workout.type === 'gym' ? 'bg-neutral-950 text-white dark:bg-neutral-800' : 'bg-primary/10 text-primary'
                  }`}>
                    {workout.type === 'gym' ? <Dumbbell className="w-5 h-5" /> : <Flame className="w-5 h-5 fill-primary" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">{workout.name}</p>
                    <div className="flex gap-2 text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 font-bold">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{workout.durationMinutes} min</span>
                      {workout.volumeKg ? (
                        <>
                          <span>•</span>
                          <span>{(workout.volumeKg / 1000).toFixed(1)}t volume</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Calorie value prominently shown */}
                <div className="text-right flex items-center gap-2">
                  <div>
                    <span className="text-xs font-black text-neutral-800 dark:text-neutral-200">{workout.caloriesBurned}</span>
                    <span className="text-[9px] font-bold text-neutral-400 ml-0.5">kcal</span>
                  </div>
                  <button
                    onClick={() => onDeleteWorkout(workout.id)}
                    className="p-1 text-neutral-300 hover:text-red-500 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 transform rotate-45 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. RECENT NUTRITION PREVIEW */}
      <section className="bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">Recent Nutrition</h3>
          <button 
            onClick={() => onNavigate('food')}
            className="text-primary hover:opacity-85 font-bold text-xs flex items-center gap-0.5 cursor-pointer"
          >
            View all logs <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {foodLogs.length === 0 ? (
          <div className="border border-dashed border-neutral-150 dark:border-neutral-800 rounded-2xl p-6 text-center">
            <p className="text-xs text-neutral-400 font-bold mb-3">No foods logged for today.</p>
            <button
              onClick={() => onOpenQuickAdd('food')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-extrabold text-xs rounded-full border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Log Meal
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {foodLogs.slice(-3).reverse().map((food) => (
              <div key={food.id} className="group flex items-center justify-between py-3 px-1 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 rounded-lg transition-colors relative">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 text-xl flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-xl select-none">
                    {food.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100">{food.name}</p>
                    <p className="text-[10px] text-neutral-400 capitalize font-bold mt-0.5">{food.mealType} • {food.time}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-extrabold text-xs text-neutral-800 dark:text-neutral-200">{food.calories} kcal</p>
                    <p className="text-primary text-[9px] font-bold mt-0.5">{food.protein.toFixed(1)}g P</p>
                  </div>
                  <button
                    onClick={() => onDeleteFood(food.id)}
                    className="p-1 hover:text-red-500 rounded text-neutral-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
