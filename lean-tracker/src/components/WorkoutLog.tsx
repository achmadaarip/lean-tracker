import React from 'react';
import { Dumbbell, Activity, Plus, TrendingUp, Flame, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { WorkoutLogItem, UserProfile } from '../types';
import { motion } from 'motion/react';

interface WorkoutLogProps {
  profile: UserProfile;
  workoutLogs: WorkoutLogItem[];
  onOpenQuickAdd: (tab?: 'food' | 'workout' | 'weight') => void;
  onDeleteWorkout: (id: string) => void;
}

export default function WorkoutLog({
  profile,
  workoutLogs,
  onOpenQuickAdd,
  onDeleteWorkout
}: WorkoutLogProps) {
  // Compute dynamic metrics from logs
  const gymBurned = workoutLogs
    .filter(item => item.type === 'gym')
    .reduce((sum, item) => sum + item.caloriesBurned, 0);

  const walkingBurned = workoutLogs
    .filter(item => item.type === 'cardio')
    .reduce((sum, item) => sum + item.caloriesBurned, 0);

  const totalBurned = gymBurned + walkingBurned;
  const totalVolume = workoutLogs.reduce((sum, item) => sum + (item.volumeKg || 0), 0);
  const totalDuration = workoutLogs.reduce((sum, item) => sum + item.durationMinutes, 0);

  // Target: let's set a healthy daily active burn goal (e.g., 500 kcal)
  const targetBurn = 500;
  const burnPercentage = Math.min(100, Math.round((totalBurned / targetBurn) * 100));
  const strokeCircumference = 2 * Math.PI * 58; // Radius 58 -> circumference 364.4
  const strokeOffset = strokeCircumference - (burnPercentage / 100) * strokeCircumference;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* 1. SINGLE LARGE HERO CARD (Daily Active Burn Redesign) */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-100/60 dark:border-neutral-800 p-6 rounded-[28px] shadow-[0_2px_8px_rgba(0,0,0,0.01)] relative overflow-hidden flex flex-col justify-between">
        
        {/* Top Header Row of Hero */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
              Active Expenditure
            </span>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Daily Calories Burned
            </h2>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Recomp Goal Badge with Blinking Green Dot */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-800/40 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Recomp Goal: On Track</span>
            </div>

            <button
              onClick={() => onOpenQuickAdd('workout')}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] font-extrabold rounded-full transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Log Session</span>
            </button>
          </div>
        </div>

        {/* Large Circular Progress Indicator */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-36 h-36 flex items-center justify-center select-none">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
              <circle 
                className="text-neutral-100 dark:text-neutral-800" 
                cx="72" 
                cy="72" 
                r="58" 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="6" 
              />
              <motion.circle 
                className="text-primary"
                cx="72" 
                cy="72" 
                r="58" 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="6.5" 
                strokeDasharray={strokeCircumference}
                initial={{ strokeDashoffset: strokeCircumference }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute text-center">
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight block"
              >
                {totalBurned}
              </motion.span>
              <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mt-0.5">
                kcal burned
              </span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-2 select-none">
            {burnPercentage}% of daily active target ({targetBurn} kcal)
          </p>
        </div>

        {/* Gym, Walking, and Total Calorie Breakdowns below the hero */}
        <div className="grid grid-cols-3 w-full gap-4 pt-5 mt-4 border-t border-neutral-100 dark:border-neutral-800/60 text-center">
          <div>
            <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">🏋️ Strength / Gym</p>
            <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">
              {gymBurned} <span className="text-[10px] font-normal text-neutral-400">kcal</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">🏃 Cardio / Walking</p>
            <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">
              {walkingBurned} <span className="text-[10px] font-normal text-neutral-400">kcal</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-black text-primary">⚡ Total Active</p>
            <p className="text-sm font-extrabold text-primary mt-1">
              {totalBurned} <span className="text-[10px] font-bold text-primary-light">kcal</span>
            </p>
          </div>
        </div>

        {/* Ambient aesthetic shapes */}
        <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-primary/5 blur-[50px] rounded-full"></div>
      </section>

      {/* 2. SECONDARY KPI STATS SUMMARY BAR */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100/60 dark:border-neutral-800 p-4 rounded-2xl flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
              Active Duration
            </span>
            <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100 mt-0.5">
              {totalDuration} <span className="text-[10px] font-normal text-neutral-400">mins</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-100/60 dark:border-neutral-800 p-4 rounded-2xl flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
              Total Volume
            </span>
            <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100 mt-0.5">
              {totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}t` : '0 kg'} <span className="text-[10px] font-normal text-neutral-400">{totalVolume > 0 ? 'lifted' : ''}</span>
            </p>
          </div>
        </div>
      </section>

      {/* 3. WORKOUT SESSIONS TIMELINE */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Today's Sessions</h2>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-bold">{workoutLogs.length} workouts completed</span>
        </div>

        {workoutLogs.length === 0 ? (
          /* Motivational Empty State Redesign */
          <button
            onClick={() => onOpenQuickAdd('workout')}
            className="w-full py-10 px-6 bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-150 dark:border-neutral-800 rounded-[24px] flex flex-col items-center justify-center text-center text-neutral-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)] group"
          >
            <div className="w-14 h-14 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              🏃 Activity not logged yet
            </p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-[250px] leading-relaxed">
              Fuel your muscle synthesis and active recomp. Tap to log your session!
            </p>
          </button>
        ) : (
          <div className="space-y-3">
            {workoutLogs.map((workout) => (
              <div 
                key={workout.id} 
                className="group relative bg-white dark:bg-neutral-900 rounded-[24px] p-5 border border-neutral-100 dark:border-neutral-800 hover:border-primary/25 hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-between gap-4 cursor-pointer"
              >
                
                {/* Left block: Icon & Name details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] ${
                    workout.type === 'gym' 
                      ? 'bg-neutral-950 text-white dark:bg-neutral-800' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {workout.type === 'gym' ? <Dumbbell className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white truncate">
                        {workout.name}
                      </h3>
                      
                      {/* Completed Badge & Category Badge */}
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 rounded-full text-[9px] font-bold uppercase tracking-wide">
                        {workout.category}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full text-[9px] font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5 fill-green-500 text-white" />
                        <span>Done</span>
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium capitalize truncate">
                      {workout.details}
                    </p>

                    {/* Secondary statistics metadata row */}
                    <div className="flex gap-4 mt-2 text-[10px] font-bold text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                        {workout.durationMinutes} min
                      </span>
                      {workout.volumeKg ? (
                        <span>
                          Volume: <b className="text-neutral-700 dark:text-neutral-300">{(workout.volumeKg / 1000).toFixed(1)}k kg</b>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right block: Calories Burned is the LARGEST number inside the card */}
                <div className="text-right flex-shrink-0 flex items-center gap-3">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-0.5">
                      Burned
                    </span>
                    <span className="text-3xl font-black text-primary tracking-tight">
                      {workout.caloriesBurned}
                    </span>
                    <span className="text-[10px] font-bold text-primary-light ml-0.5">
                      kcal
                    </span>
                  </div>

                  {/* Desktop Hover Delete Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteWorkout(workout.id);
                    }}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/10 hover:text-red-500 rounded-full text-neutral-300 transition-colors"
                    title="Delete Workout"
                  >
                    <Plus className="w-4 h-4 transform rotate-45 stroke-[2.5]" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* Spacing for layout */}
      <div className="h-6" />
    </div>
  );
}
