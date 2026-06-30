import React from 'react';
import { 
  Flame, 
  Calendar, 
  Award, 
  Dumbbell, 
  Sparkles, 
  Plus, 
  Scale, 
  ChevronRight, 
  Apple, 
  X, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Target,
  Heart
} from 'lucide-react';
import { FoodLogItem, WorkoutLogItem, BodyCompLogItem, UserProfile } from '../types';
import { getFormattedDate } from '../utils';
import { motion } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
  foodLogs: FoodLogItem[];
  workoutLogs: WorkoutLogItem[];
  bodyCompLogs: BodyCompLogItem[];
  onNavigate: (tab: 'home' | 'food' | 'workouts' | 'progress' | 'calendar' | 'settings' | 'bodycomp') => void;
  onOpenQuickAdd: (tab?: 'food' | 'workout' | 'weight' | 'bodycomp') => void;
  onDeleteFood: (id: string) => void;
  onDeleteWorkout: (id: string) => void;
  selectedDateString: string;
}

export default function Dashboard({
  profile,
  foodLogs,
  workoutLogs,
  bodyCompLogs,
  onNavigate,
  onOpenQuickAdd,
  onDeleteFood,
  onDeleteWorkout,
  selectedDateString
}: DashboardProps) {
  // 1. Filter Logs for Selected Date ONLY
  const dailyFood = foodLogs.filter(item => item.dateString === selectedDateString);
  const dailyWorkouts = workoutLogs.filter(item => item.dateString === selectedDateString);
  const dailyBodyComp = bodyCompLogs.find(item => item.dateString === selectedDateString);

  // 2. Core Calories Calculations
  const targetCalories = profile.dailyCalorieTarget;
  const consumedCalories = dailyFood.reduce((sum, item) => sum + item.calories, 0);
  const burnedCalories = dailyWorkouts.reduce((sum, item) => sum + item.caloriesBurned, 0);
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);

  const caloriePercent = Math.min(100, (consumedCalories / targetCalories) * 100);
  const strokeCircumference = 2 * Math.PI * 92; 
  const strokeOffset = strokeCircumference - (caloriePercent / 100) * strokeCircumference;

  // 3. Protein Metrics
  const targetProtein = profile.dailyProteinTarget;
  const consumedProtein = dailyFood.reduce((sum, item) => sum + item.protein, 0);
  const proteinPercent = Math.min(100, Math.round((consumedProtein / targetProtein) * 100));

  // 4. Energy Balance & Deficit
  const netCalories = consumedCalories - burnedCalories;
  const currentDeficit = profile.maintenanceTdee - consumedCalories + burnedCalories;
  const targetDeficit = profile.maintenanceTdee - profile.dailyCalorieTarget;
  const deficitProgressPercent = Math.min(100, Math.max(0, Math.round((currentDeficit / targetDeficit) * 100)));

  // 5. Weight & Composition (Filtered & Historical)
  const weightVal = dailyBodyComp ? dailyBodyComp.weight : (bodyCompLogs[0]?.weight || profile.currentWeight || 70.5);
  const bodyFatVal = dailyBodyComp ? dailyBodyComp.bodyFatPercent : (bodyCompLogs[0]?.bodyFatPercent || profile.targetBodyFat || 15.0);

  // Calculate Weekly Weight Change relative to selectedDateString
  const getWeeklyWeightChange = () => {
    const pastLogs = bodyCompLogs
      .filter(l => l.dateString <= selectedDateString)
      .sort((a, b) => b.dateString.localeCompare(a.dateString));
    
    if (pastLogs.length === 0) return '0.0 kg';
    const latest = pastLogs[0];
    const latestDate = new Date(latest.dateString);
    const targetDateStr = new Date(latestDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const referenceLog = bodyCompLogs
      .filter(l => l.dateString <= targetDateStr)
      .sort((a, b) => b.dateString.localeCompare(a.dateString))[0];
    
    if (!referenceLog) {
      const earliest = bodyCompLogs[bodyCompLogs.length - 1];
      if (earliest && earliest.id !== latest.id) {
        const diff = latest.weight - earliest.weight;
        return diff <= 0 ? `${diff.toFixed(1)} kg` : `+${diff.toFixed(1)} kg`;
      }
      return '0.0 kg';
    }
    const diff = latest.weight - referenceLog.weight;
    return diff <= 0 ? `${diff.toFixed(1)} kg` : `+${diff.toFixed(1)} kg`;
  };

  const weeklyWeightChangeStr = getWeeklyWeightChange();

  // 7-Day Moving Average Weight
  const weightSum = bodyCompLogs.slice(0, 7).reduce((sum, item) => sum + item.weight, 0);
  const ma7Weight = bodyCompLogs.length > 0 ? (weightSum / Math.min(7, bodyCompLogs.length)).toFixed(1) : '70.9';

  // 6. Body Fat Goal Progress
  const getBodyFatGoalProgress = () => {
    const target = profile.targetBodyFat;
    const oldest = bodyCompLogs[bodyCompLogs.length - 1]?.bodyFatPercent || 15.9;
    if (oldest === target) return 100;
    const progress = ((oldest - bodyFatVal) / (oldest - target)) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  };

  const bodyFatGoalProgress = getBodyFatGoalProgress();

  // 7. Dynamic AI Coach Advice
  const getAiEvaluation = () => {
    if (dailyFood.length === 0 && dailyWorkouts.length === 0) {
      return "Start logging meals and activity for today! Maintaining a consistent active caloric deficit protects lean muscle mass while promoting body fat reduction.";
    }
    const proteinRatio = consumedProtein / targetProtein;
    let evaluation = "";
    if (proteinRatio >= 0.9) {
      evaluation += "Outstanding protein achievement today! Muscle tissue recovery is fully optimized. ";
    } else {
      evaluation += `Protein intake is at ${Math.round(proteinRatio * 100)}% of your target. Consider adding egg whites or whey to hit your target. `;
    }

    if (currentDeficit >= targetDeficit) {
      evaluation += "Your active caloric deficit is perfectly on point for continuous fat loss.";
    } else {
      evaluation += `You are ${targetDeficit - currentDeficit} kcal short of your deficit target. An extra short walk will secure your goal today.`;
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

        {/* Dynamic Macro/Calorie KPI Row */}
        <div className="grid grid-cols-3 w-full gap-4 mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/60 text-center">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Consumed</span>
            <span className="text-sm font-black text-neutral-800 dark:text-neutral-100 mt-1 block">
              {consumedCalories.toLocaleString()} <span className="text-[8px] font-normal text-neutral-400">kcal</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Burned</span>
            <span className="text-sm font-black text-neutral-800 dark:text-neutral-100 mt-1 block">
              {burnedCalories.toLocaleString()} <span className="text-[8px] font-normal text-neutral-400">kcal</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Goal Target</span>
            <span className="text-sm font-black text-neutral-800 dark:text-neutral-100 mt-1 block">
              {targetCalories.toLocaleString()} <span className="text-[8px] font-normal text-neutral-400">kcal</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. PREMIUM iOS BENTO DASHBOARD METRICS */}
      <section className="space-y-3.5">
        <h3 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1">Daily Vital Metrics</h3>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Today's Weight Card */}
          <div 
            onClick={() => onNavigate('bodycomp')}
            className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Today's Weight</span>
              <Scale className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <div className="mt-3">
              <p className="text-xl font-black text-neutral-900 dark:text-white leading-none">
                {dailyBodyComp ? `${weightVal.toFixed(1)} kg` : "Not Logged"}
              </p>
              {!dailyBodyComp && (
                <p className="text-[9px] text-primary font-bold mt-1.5 flex items-center gap-0.5">
                  <Plus className="w-3 h-3" /> Log weight
                </p>
              )}
              {dailyBodyComp && (
                <p className="text-[9px] text-neutral-400 font-bold mt-1.5">
                  Previous: {bodyCompLogs[1]?.weight.toFixed(1) || '70.6'} kg
                </p>
              )}
            </div>
          </div>

          {/* Body Fat % Card */}
          <div 
            onClick={() => onNavigate('bodycomp')}
            className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Body Fat %</span>
              <Award className="w-4.5 h-4.5 text-rose-500" />
            </div>
            <div className="mt-3">
              <p className="text-xl font-black text-neutral-900 dark:text-white leading-none">
                {dailyBodyComp ? `${bodyFatVal.toFixed(1)}%` : "Not Logged"}
              </p>
              <p className="text-[9px] text-neutral-400 font-bold mt-1.5">
                Target: {profile.targetBodyFat}%
              </p>
            </div>
          </div>

          {/* Weekly Weight Change Card */}
          <div 
            onClick={() => onNavigate('progress')}
            className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Weekly Change</span>
              <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <div className="mt-3">
              <p className={`text-xl font-black leading-none ${weeklyWeightChangeStr.startsWith('-') ? 'text-green-500' : 'text-neutral-900 dark:text-white'}`}>
                {weeklyWeightChangeStr}
              </p>
              <p className="text-[9px] text-neutral-400 font-bold mt-1.5">
                Moving Avg: {ma7Weight} kg
              </p>
            </div>
          </div>

          {/* Net Calories Card */}
          <div 
            onClick={() => onNavigate('food')}
            className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Net Calories</span>
              <Apple className="w-4.5 h-4.5 text-orange-500" />
            </div>
            <div className="mt-3">
              <p className="text-xl font-black text-neutral-900 dark:text-white leading-none">
                {netCalories.toLocaleString()} <span className="text-[10px] font-medium text-neutral-400">kcal</span>
              </p>
              <p className="text-[9px] text-neutral-400 font-bold mt-1.5">
                In: {consumedCalories} • Out: {burnedCalories}
              </p>
            </div>
          </div>

          {/* Active Deficit Card */}
          <div 
            onClick={() => onNavigate('workouts')}
            className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Daily Deficit</span>
              <Flame className="w-4.5 h-4.5 text-primary fill-primary/10" />
            </div>
            <div className="mt-3">
              <p className="text-xl font-black text-neutral-900 dark:text-white leading-none">
                {currentDeficit.toLocaleString()} <span className="text-[10px] font-medium text-neutral-400">kcal</span>
              </p>
              <p className="text-[9px] text-neutral-400 font-bold mt-1.5">
                Target: {targetDeficit} kcal
              </p>
            </div>
          </div>

          {/* Protein Progress Card */}
          <div 
            onClick={() => onNavigate('food')}
            className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Protein Target</span>
              <Award className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-neutral-900 dark:text-white leading-none">
                  {consumedProtein.toFixed(1)}g
                </span>
                <span className="text-[10px] font-extrabold text-primary">{proteinPercent}%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Goal Progress Cards */}
        <div className="grid grid-cols-1 gap-3.5 pt-1.5">
          {/* Target Deficit Progress Meter */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4.5 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-primary" /> Deficit Target Progress</span>
              <span className="font-extrabold text-primary">{deficitProgressPercent}%</span>
            </div>
            <div className="space-y-1.5">
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${deficitProgressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-neutral-400">
                <span>0 kcal</span>
                <span>Active Deficit: {currentDeficit} kcal</span>
                <span>Goal: {targetDeficit} kcal</span>
              </div>
            </div>
          </div>

          {/* Body Fat Goal Progress Meter */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 p-4.5 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> Body Fat Goal Progress</span>
              <span className="font-extrabold text-rose-500">{bodyFatGoalProgress}%</span>
            </div>
            <div className="space-y-1.5">
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#f43f5e] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${bodyFatGoalProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-neutral-400">
                <span>Start: {(bodyCompLogs[bodyCompLogs.length - 1]?.bodyFatPercent || 15.9).toFixed(1)}%</span>
                <span>Current: {bodyFatVal.toFixed(1)}%</span>
                <span>Goal: {profile.targetBodyFat}%</span>
              </div>
            </div>
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
        
        {dailyWorkouts.length === 0 ? (
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
            {dailyWorkouts.map((workout) => (
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

        {dailyFood.length === 0 ? (
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
            {dailyFood.slice(-3).reverse().map((food) => (
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
