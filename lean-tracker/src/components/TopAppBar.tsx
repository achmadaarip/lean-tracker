import React from 'react';
import { Calendar, Settings } from 'lucide-react';
import { UserProfile } from '../types';
import { getFormattedDate } from '../utils';

interface TopAppBarProps {
  activeTab: 'home' | 'food' | 'workouts' | 'progress' | 'calendar' | 'settings' | 'bodycomp';
  onNavigate: (tab: 'home' | 'food' | 'workouts' | 'progress' | 'calendar' | 'settings' | 'bodycomp') => void;
  streakCount: number;
  profile: UserProfile;
  selectedDateString: string;
}

export default function TopAppBar({
  activeTab,
  onNavigate,
  streakCount,
  profile,
  selectedDateString
}: TopAppBarProps) {

  // Dynamic header config based on the active tab
  const getHeaderConfig = () => {
    switch (activeTab) {
      case 'home':
        return {
          title: "Dashboard",
          subtitle: "Today's Summary",
          statusText: getFormattedDate(selectedDateString)
        };
      case 'food':
        return {
          title: "Food",
          subtitle: `Meals for ${getFormattedDate(selectedDateString)}`,
          statusText: null
        };
      case 'workouts':
        return {
          title: "Activity",
          subtitle: `Workouts for ${getFormattedDate(selectedDateString)}`,
          statusText: null
        };
      case 'progress':
        return {
          title: "Progress",
          subtitle: "Your Body Transformation",
          statusText: "Last 30 Days"
        };
      case 'calendar':
        return {
          title: "Calendar",
          subtitle: "History & Daily Records",
          statusText: getFormattedDate(selectedDateString)
        };
      case 'settings':
        return {
          title: profile.name,
          subtitle: profile.email,
          statusText: null
        };
      case 'bodycomp':
        return {
          title: "Body Comp",
          subtitle: "Composition & Metrics",
          statusText: null
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Today's Summary",
          statusText: getFormattedDate(selectedDateString)
        };
    }
  };

  const config = getHeaderConfig();

  return (
    <div className="relative">
      {/* 72px fixed height, with specific paddings */}
      <header className="h-[72px] px-6 pt-[20px] pb-[16px] bg-transparent flex justify-between items-center relative z-40 transition-all duration-300">
        
        {/* Left Section (Title & Subtitle + Optional Status) */}
        <div className="flex flex-col justify-center select-none animate-fade-in">
          <h1 className="text-[28px] font-bold text-[#111827] dark:text-neutral-100 leading-none tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm font-medium text-[#6B7280] dark:text-neutral-400 mt-[4px] leading-none">
            {config.subtitle}
          </p>
          {config.statusText && (
            <p className="text-xs font-bold text-primary dark:text-[#99f894] mt-[6px] leading-none animate-fade-in">
              {config.statusText}
            </p>
          )}
        </div>

        {/* Right Section (📅 Calendar, ⚙ Settings) */}
        <div className="flex items-center gap-3">
          {/* Calendar Button */}
          <button
            onClick={() => onNavigate('calendar')}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:scale-105 active:scale-95 transition-all text-neutral-700 dark:text-neutral-300 ${
              activeTab === 'calendar'
                ? 'bg-primary text-white dark:bg-[#99f894] dark:text-neutral-950 font-bold'
                : 'bg-[#F5F5F5] dark:bg-neutral-800'
            }`}
            aria-label="Calendar History"
          >
            <Calendar className="w-[18px] h-[18px]" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => onNavigate('settings')}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:scale-105 active:scale-95 transition-all text-neutral-700 dark:text-neutral-300 ${
              activeTab === 'settings'
                ? 'bg-primary text-white dark:bg-[#99f894] dark:text-neutral-950 font-bold'
                : 'bg-[#F5F5F5] dark:bg-neutral-800'
            }`}
            aria-label="Settings"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
        </div>
      </header>
    </div>
  );
}
