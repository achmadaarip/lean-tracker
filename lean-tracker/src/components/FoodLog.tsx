import React, { useState } from 'react';
import { Calendar, Trash2, Plus, ChevronRight, Apple, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { FoodLogItem, MealType, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface FoodLogProps {
  profile: UserProfile;
  foodLogs: FoodLogItem[];
  onOpenQuickAdd: (tab?: 'food' | 'workout' | 'weight', mealType?: MealType) => void;
  onDeleteFood: (id: string) => void;
}

interface CompactMacroRingProps {
  label: string;
  current: number;
  target: number;
  color: string;
  bgColor: string;
}

function CompactMacroProgressRing({ 
  label, 
  current, 
  target, 
  color, 
  bgColor 
}: CompactMacroRingProps) {
  const percent = Math.min(100, Math.round((current / target) * 100));
  const strokeCircumference = 2 * Math.PI * 16; // Radius 16 -> circumference 100.53
  const strokeOffset = strokeCircumference - (percent / 100) * strokeCircumference;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all hover:scale-[1.02]">
      <div className="relative w-12 h-12 flex items-center justify-center mb-2 select-none">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="transparent" stroke={bgColor} strokeWidth="3" />
          <motion.circle 
            cx="24" 
            cy="24" 
            r="16" 
            fill="transparent" 
            stroke={color} 
            strokeWidth="3.5" 
            strokeDasharray={strokeCircumference}
            initial={{ strokeDashoffset: strokeCircumference }}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round" 
          />
        </svg>
        <span className="absolute text-[10px] font-black text-neutral-800 dark:text-neutral-100">{percent}%</span>
      </div>
      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1">{current.toFixed(1)}g</span>
      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5">/ {target.toFixed(0)}g</span>
    </div>
  );
}

export default function FoodLog({
  profile,
  foodLogs,
  onOpenQuickAdd,
  onDeleteFood
}: FoodLogProps) {
  const targetCalories = profile.dailyCalorieTarget;
  const targetProtein = profile.dailyProteinTarget;
  const targetCarbs = profile.dailyCarbsTarget;
  const targetFat = profile.dailyFatTarget;

  // Compute total dynamic macros
  const totalCalories = foodLogs.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = foodLogs.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = foodLogs.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = foodLogs.reduce((sum, item) => sum + item.fat, 0);

  const caloriesRemaining = Math.max(0, targetCalories - totalCalories);
  const caloriePercent = Math.min(100, (totalCalories / targetCalories) * 100);

  // Expanded/Collapsed state for Meal groups
  const [expandedGroups, setExpandedGroups] = useState<Record<MealType, boolean>>({
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true
  });

  const toggleGroup = (type: MealType) => {
    setExpandedGroups(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const mealGroups: { type: MealType; label: string; defaultTime: string; emoji: string; motto: string }[] = [
    { type: 'breakfast', label: 'Breakfast', defaultTime: '08:30 AM', emoji: '🍳', motto: 'Fuel your day with clean fuel.' },
    { type: 'lunch', label: 'Lunch', defaultTime: '01:15 PM', emoji: '🥗', motto: 'Power through your afternoon.' },
    { type: 'dinner', label: 'Dinner', defaultTime: '07:30 PM', emoji: '🥩', motto: 'Recover and build overnight.' },
    { type: 'snack', label: 'Snacks & Post-workout', defaultTime: '05:45 PM', emoji: '🥤', motto: 'Keep metabolic activity high.' }
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* 1. HERO CARD (Calories Remaining Redesign) */}
      <section className="bg-white dark:bg-neutral-900 rounded-[28px] p-6 border border-neutral-100/60 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-5">
        <div className="flex flex-col items-center justify-center text-center py-2">
          {/* Much larger Calories Left Today display */}
          <motion.p 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-6xl font-black text-neutral-900 dark:text-white tracking-tight select-none"
          >
            {caloriesRemaining.toLocaleString()}
          </motion.p>
          <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-2 select-none">
            Calories Left Today
          </p>
        </div>

        {/* Thicker Progress Bar */}
        <div className="w-full h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
          <motion.div 
            className="h-full bg-primary rounded-full" 
            initial={{ width: 0 }}
            animate={{ width: `${caloriePercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Consumed, Target, Deficit in one single horizontal row */}
        <div className="grid grid-cols-3 w-full gap-4 pt-4 border-t border-neutral-100/80 dark:border-neutral-800/60 text-center">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Consumed</p>
            <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">
              {totalCalories.toLocaleString()} <span className="text-[9px] font-normal text-neutral-400">kcal</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Target Goal</p>
            <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">
              {targetCalories.toLocaleString()} <span className="text-[9px] font-normal text-neutral-400">kcal</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Net Budget</p>
            <p className="text-sm font-extrabold text-primary mt-1">
              {caloriesRemaining.toLocaleString()} <span className="text-[9px] font-normal text-primary-light">kcal</span>
            </p>
          </div>
        </div>
      </section>

      {/* 2. COMPACT MACRO CARDS WITH PROGRESS RINGS */}
      <section className="grid grid-cols-3 gap-3">
        <CompactMacroProgressRing 
          label="Protein" 
          current={totalProtein} 
          target={targetProtein} 
          color="#16a34a" 
          bgColor="rgba(22, 163, 74, 0.1)" 
        />
        <CompactMacroProgressRing 
          label="Carbs" 
          current={totalCarbs} 
          target={targetCarbs} 
          color="#f59e0b" 
          bgColor="rgba(245, 158, 11, 0.1)" 
        />
        <CompactMacroProgressRing 
          label="Fat" 
          current={totalFat} 
          target={targetFat} 
          color="#3b82f6" 
          bgColor="rgba(59, 130, 246, 0.1)" 
        />
      </section>

      {/* 3. TIMELINE OF COLLAPSIBLE MEAL GROUPS */}
      <section className="space-y-5">
        {mealGroups.map((group) => {
          const meals = foodLogs.filter((item) => item.mealType === group.type);
          const groupCalories = meals.reduce((sum, item) => sum + item.calories, 0);
          const isExpanded = expandedGroups[group.type];

          return (
            <div key={group.type} className="space-y-2 select-none">
              
              {/* Group Collapsible Header */}
              <button 
                onClick={() => toggleGroup(group.type)}
                className="w-full flex items-center justify-between py-2 px-1 hover:opacity-80 transition-opacity text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  )}
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-extrabold text-base text-neutral-900 dark:text-white capitalize">
                      {group.label}
                    </h3>
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
                      {group.defaultTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {groupCalories > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary dark:text-primary-light rounded-md">
                      {groupCalories} kcal
                    </span>
                  )}
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {meals.length} {meals.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2"
                  >
                    {meals.length === 0 ? (
                      /* Empty State Placeholder redesign */
                      <button
                        onClick={() => onOpenQuickAdd('food', group.type)}
                        className="w-full py-6 px-4 bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-[22px] flex flex-col items-center justify-center text-center text-neutral-400 hover:text-primary hover:border-primary/30 hover:bg-primary/[0.01] transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)] group"
                      >
                        <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110 duration-200">{group.emoji}</span>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          No {group.label.toLowerCase()} logged yet
                        </span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                          {group.motto} Tap to log food.
                        </span>
                        <span className="mt-3 w-7 h-7 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center border border-neutral-100 dark:border-neutral-700 font-black text-sm text-neutral-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                          ＋
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {meals.map((meal) => (
                          <div 
                            key={meal.id} 
                            className="relative overflow-hidden rounded-[22px] bg-neutral-50 dark:bg-neutral-800/30"
                          >
                            {/* Left swipe trigger button (Log Again) */}
                            <div className="absolute inset-y-0 left-0 w-24 bg-primary/20 text-primary flex items-center justify-center rounded-l-[22px]">
                              <div className="flex flex-col items-center justify-center text-[10px] font-extrabold gap-0.5">
                                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                                <span>Add Again</span>
                              </div>
                            </div>

                            {/* Right swipe trigger button (Delete) */}
                            <div className="absolute inset-y-0 right-0 w-24 bg-red-500 text-white flex items-center justify-center rounded-r-[22px]">
                              <div className="flex flex-col items-center justify-center text-[10px] font-extrabold gap-0.5">
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </div>
                            </div>

                            {/* Interactive Swipable Top Layer */}
                            <motion.div
                              drag="x"
                              dragConstraints={{ left: -100, right: 100 }}
                              dragElastic={0.1}
                              onDragEnd={(event, info) => {
                                if (info.offset.x < -60) {
                                  onDeleteFood(meal.id);
                                } else if (info.offset.x > 60) {
                                  // Add again: clone food
                                  onOpenQuickAdd('food', meal.mealType);
                                }
                              }}
                              className="relative bg-white dark:bg-neutral-900 rounded-[22px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-neutral-100 dark:border-neutral-800/80 flex items-center gap-4 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all active:scale-[0.99] touch-pan-y z-10 cursor-grab active:cursor-grabbing"
                            >
                              {/* Enlarged Icon/Emoji */}
                              <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-center text-3xl select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
                                {meal.emoji}
                              </div>

                              {/* Content Details */}
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white truncate">
                                    {meal.name}
                                  </h4>
                                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                                    {meal.quantity}
                                  </span>
                                </div>

                                {/* Colored Chips for Nutrition */}
                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full text-[10px] font-bold select-none">
                                    {meal.calories} kcal
                                  </span>
                                  <span className="px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold select-none">
                                    {meal.protein.toFixed(1)}g Protein
                                  </span>
                                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold select-none">
                                    {meal.carbs.toFixed(1)}g Carbs
                                  </span>
                                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-bold select-none">
                                    {meal.fat.toFixed(1)}g Fat
                                  </span>
                                </div>
                              </div>

                              {/* Action helper hints for Desktop users */}
                              <div className="hidden md:flex flex-col gap-1 items-end ml-1">
                                <button
                                  onClick={() => onDeleteFood(meal.id)}
                                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/10 hover:text-red-500 rounded-full text-neutral-300 transition-colors"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </section>

      {/* Floating Plus button footer wrapper spacer */}
      <div className="h-6" />
    </div>
  );
}
