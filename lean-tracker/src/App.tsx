import React, { useState, useEffect } from 'react';
import { Home, Utensils, Dumbbell, TrendingUp, Settings, Plus, Calendar } from 'lucide-react';
import { FoodLogItem, WorkoutLogItem, BodyCompLogItem, UserProfile, MealType, FoodDbItem, MealPreset } from './types';
import {
  INITIAL_PROFILE,
  INITIAL_FOOD_LOGS,
  INITIAL_WORKOUT_LOGS,
  INITIAL_BODY_COMP,
  INITIAL_FOOD_DB,
  INITIAL_MEAL_PRESETS_CLEANED
} from './utils';

// Import modular pages
import TopAppBar from './components/TopAppBar';
import Dashboard from './components/Dashboard';
import FoodLog from './components/FoodLog';
import WorkoutLog from './components/WorkoutLog';
import CalendarPage from './components/CalendarPage';
import ProgressAnalytics from './components/ProgressAnalytics';
import SettingsPage from './components/SettingsPage';
import QuickAddModal from './components/QuickAddModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'food' | 'workouts' | 'progress' | 'calendar' | 'settings'>('home');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState<'menu' | 'food' | 'workout' | 'weight' | 'bodycomp'>('menu');
  const [quickAddInitialMealType, setQuickAddInitialMealType] = useState<MealType>('breakfast');

  const [activeTheme, setActiveTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('lean_active_theme');
    return (saved as 'light' | 'dark' | 'system') || 'light';
  });

  // Sync activeTheme with DOM classList & localStorage
  useEffect(() => {
    localStorage.setItem('lean_active_theme', activeTheme);
    const html = document.documentElement;
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      if (theme === 'dark') {
        html.classList.add('dark');
      } else if (theme === 'light') {
        html.classList.remove('dark');
      } else {
        // System Theme
        const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkSystem) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    };
    applyTheme(activeTheme);

    if (activeTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [activeTheme]);

  // Core State with Local Storage fallback
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lean_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [foodDatabase, setFoodDatabase] = useState<FoodDbItem[]>(() => {
    const saved = localStorage.getItem('lean_food_db');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_DB;
  });

  const [mealPresets, setMealPresets] = useState<MealPreset[]>(() => {
    const saved = localStorage.getItem('lean_meal_presets');
    return saved ? JSON.parse(saved) : INITIAL_MEAL_PRESETS_CLEANED;
  });

  const [foodLogs, setFoodLogs] = useState<FoodLogItem[]>(() => {
    const saved = localStorage.getItem('lean_food_logs');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_LOGS;
  });

  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogItem[]>(() => {
    const saved = localStorage.getItem('lean_workout_logs');
    return saved ? JSON.parse(saved) : INITIAL_WORKOUT_LOGS;
  });

  const [bodyCompLogs, setBodyCompLogs] = useState<BodyCompLogItem[]>(() => {
    const saved = localStorage.getItem('lean_body_comp_logs');
    return saved ? JSON.parse(saved) : INITIAL_BODY_COMP;
  });

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem('lean_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('lean_food_db', JSON.stringify(foodDatabase));
  }, [foodDatabase]);

  useEffect(() => {
    localStorage.setItem('lean_meal_presets', JSON.stringify(mealPresets));
  }, [mealPresets]);

  useEffect(() => {
    localStorage.setItem('lean_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('lean_workout_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem('lean_body_comp_logs', JSON.stringify(bodyCompLogs));
  }, [bodyCompLogs]);

  // State Modification Handlers
  const handleAddFood = (food: Omit<FoodLogItem, 'id' | 'dateString'>) => {
    const newItem: FoodLogItem = {
      ...food,
      id: `f_${Date.now()}`,
      dateString: '2026-06-29' // Persisting current mock date for unified display
    };
    setFoodLogs((prev) => [...prev, newItem]);
  };

  const handleAddWorkout = (workout: Omit<WorkoutLogItem, 'id' | 'dateString'>) => {
    const newItem: WorkoutLogItem = {
      ...workout,
      id: `w_${Date.now()}`,
      dateString: '2026-06-29'
    };
    setWorkoutLogs((prev) => [...prev, newItem]);
  };

  const handleAddBodyComp = (comp: Omit<BodyCompLogItem, 'id' | 'dateString'>) => {
    const newItem: BodyCompLogItem = {
      ...comp,
      id: `bc_${Date.now()}`,
      dateString: '2026-06-29'
    };
    // If a log for today already exists, overwrite it, otherwise prepend
    setBodyCompLogs((prev) => {
      const filtered = prev.filter((log) => log.dateString !== '2026-06-29');
      return [newItem, ...filtered];
    });
  };

  const handleDeleteFood = (id: string) => {
    setFoodLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkoutLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all tracked data to default settings?")) {
      setProfile(INITIAL_PROFILE);
      setFoodLogs(INITIAL_FOOD_LOGS);
      setWorkoutLogs(INITIAL_WORKOUT_LOGS);
      setBodyCompLogs(INITIAL_BODY_COMP);
      setFoodDatabase(INITIAL_FOOD_DB);
      setMealPresets(INITIAL_MEAL_PRESETS_CLEANED);
      setActiveTab('home');
    }
  };

  const openQuickAdd = (tab?: 'menu' | 'food' | 'workout' | 'weight' | 'bodycomp', mealType?: MealType) => {
    setQuickAddInitialTab(tab || 'menu');
    setQuickAddInitialMealType(mealType || 'breakfast');
    setIsQuickAddOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8fe] dark:bg-[#0c0c0e] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      
      {/* Central Content Stage */}
      <div className="max-w-md mx-auto relative flex flex-col min-h-screen">
        
        {/* Global Uniform Top App Bar */}
        <TopAppBar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          streakCount={profile.streakCount}
        />

        {/* Dynamic Screen Stage */}
        <main className="px-5 pt-2 pb-28 flex-grow">
          {activeTab === 'home' && (
            <Dashboard
              profile={profile}
              foodLogs={foodLogs}
              workoutLogs={workoutLogs}
              bodyCompLogs={bodyCompLogs}
              onNavigate={setActiveTab}
              onOpenQuickAdd={openQuickAdd}
              onDeleteFood={handleDeleteFood}
              onDeleteWorkout={handleDeleteWorkout}
            />
          )}
          {activeTab === 'food' && (
            <FoodLog
              profile={profile}
              foodLogs={foodLogs}
              onOpenQuickAdd={openQuickAdd}
              onDeleteFood={handleDeleteFood}
            />
          )}
          {activeTab === 'workouts' && (
            <WorkoutLog
              profile={profile}
              workoutLogs={workoutLogs}
              onOpenQuickAdd={openQuickAdd}
              onDeleteWorkout={handleDeleteWorkout}
            />
          )}
          {activeTab === 'calendar' && (
            <CalendarPage
              profile={profile}
              foodLogs={foodLogs}
              workoutLogs={workoutLogs}
              bodyCompLogs={bodyCompLogs}
              onOpenQuickAdd={openQuickAdd}
              onDeleteFood={handleDeleteFood}
              onDeleteWorkout={handleDeleteWorkout}
            />
          )}
          {activeTab === 'progress' && (
            <ProgressAnalytics
              bodyCompLogs={bodyCompLogs}
              foodLogs={foodLogs}
              workoutLogs={workoutLogs}
              onOpenQuickAdd={openQuickAdd}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsPage
              profile={profile}
              onUpdateProfile={setProfile}
              onResetData={handleResetData}
              activeTheme={activeTheme}
              onThemeChange={setActiveTheme}
              bodyCompLogs={bodyCompLogs}
              onAddBodyComp={handleAddBodyComp}
              onUpdateFoodLogs={setFoodLogs}
              onUpdateWorkoutLogs={setWorkoutLogs}
              onUpdateBodyCompLogs={setBodyCompLogs}
              foodDatabase={foodDatabase}
              onUpdateFoodDatabase={setFoodDatabase}
              mealPresets={mealPresets}
              onUpdateMealPresets={setMealPresets}
            />
          )}
        </main>

        {/* Persistent Floating Glass Bottom Navigation Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[420px] z-50">
          <nav className="bg-white/90 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/80 rounded-[32px] h-[68px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex items-center justify-between px-6 relative">
            
            {/* Home */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                activeTab === 'home'
                  ? 'text-primary dark:text-[#99f894]'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
              aria-label="Home"
            >
              <Home className={`w-[22px] h-[22px] ${activeTab === 'home' ? 'fill-primary/10 dark:fill-white/5' : ''}`} />
            </button>

            {/* Food */}
            <button
              onClick={() => setActiveTab('food')}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                activeTab === 'food'
                  ? 'text-primary dark:text-[#99f894]'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
              aria-label="Food Log"
            >
              <Utensils className="w-[22px] h-[22px]" />
            </button>

            {/* Elevated Floating Quick Logger Button - Centered & Floats above Nav by ~16-20px */}
            <div className="relative -top-5">
              <button
                onClick={() => openQuickAdd()}
                className="w-14 h-14 bg-primary hover:bg-primary/95 text-white rounded-full shadow-[0_8px_24px_rgba(22,163,74,0.3)] flex items-center justify-center active:scale-95 hover:scale-105 transition-all duration-200 border-4 border-white dark:border-neutral-900"
                aria-label="Quick Add Menu"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            {/* Activity (Workouts) */}
            <button
              onClick={() => setActiveTab('workouts')}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                activeTab === 'workouts'
                  ? 'text-primary dark:text-[#99f894]'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
              aria-label="Activity Log"
            >
              <Dumbbell className="w-[22px] h-[22px]" />
            </button>

            {/* Progress */}
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                activeTab === 'progress'
                  ? 'text-primary dark:text-[#99f894]'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
              aria-label="Progress Analytics"
            >
              <TrendingUp className="w-[22px] h-[22px]" />
            </button>
          </nav>
        </div>

      </div>

      {/* Logger Quick Modal Sheet */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddFood={handleAddFood}
        onAddWorkout={handleAddWorkout}
        onAddBodyComp={handleAddBodyComp}
        initialTab={quickAddInitialTab}
        initialMealType={quickAddInitialMealType}
        bodyCompLogs={bodyCompLogs}
        foodDatabase={foodDatabase}
        mealPresets={mealPresets}
      />
    </div>
  );
}
