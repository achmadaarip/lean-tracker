import React from 'react';
import { Calendar, Settings, Droplet, Dumbbell, Activity, Flame, Award, ShieldCheck, Zap } from 'lucide-react';
import { BodyCompLogItem, FoodLogItem, WorkoutLogItem } from '../types';
import { calculateMA7 } from '../utils';

interface ProgressAnalyticsProps {
  bodyCompLogs: BodyCompLogItem[];
  foodLogs: FoodLogItem[];
  workoutLogs: WorkoutLogItem[];
  onOpenQuickAdd: (tab?: 'food' | 'workout' | 'weight') => void;
}

export default function ProgressAnalytics({
  bodyCompLogs,
  foodLogs,
  workoutLogs,
  onOpenQuickAdd
}: ProgressAnalyticsProps) {
  // Sort logs chronological (oldest to newest) for chart plotting, but keep descending for stats
  const sortedCompLogs = [...bodyCompLogs].sort((a, b) => a.dateString.localeCompare(b.dateString));
  const latestLog = bodyCompLogs[0] || { weight: 70.5, bodyFatPercent: 15.2, muscleMassKg: 56.8, visceralFat: 4, bmr: 1750 };
  const baselineLog = bodyCompLogs[bodyCompLogs.length - 1] || latestLog;

  const totalWeightLoss = latestLog.weight - baselineLog.weight;
  const fatLossChange = latestLog.bodyFatPercent - baselineLog.bodyFatPercent;

  // 1. Plot Weight Trend SVG
  // Let's map weights to a 0-100 grid for width and 10-30 for height
  const getWeightSvgPath = () => {
    if (sortedCompLogs.length < 2) {
      return { path: "M 0 20 H 100", ma7Path: "M 0 20 H 100", points: [] };
    }
    const weights = sortedCompLogs.map(l => l.weight);
    const minW = Math.min(...weights) - 0.5;
    const maxW = Math.max(...weights) + 0.5;
    const rangeW = maxW - minW || 1;

    // Build Weight Line Points
    const points = sortedCompLogs.map((log, index) => {
      const x = (index / (sortedCompLogs.length - 1)) * 100;
      // Map weight to SVG Y: higher weight is lower on screen? No, higher weight should be higher up (smaller Y is higher up in SVG coordinates)
      // SVG viewport height is 40. Let's map minW to Y=32 and maxW to Y=8
      const y = 32 - ((log.weight - minW) / rangeW) * 24;
      return { x, y, weight: log.weight, date: log.dateString };
    });

    // Build MA7 Points
    const ma7Points = sortedCompLogs.map((log, index) => {
      const x = (index / (sortedCompLogs.length - 1)) * 100;
      // Index in original desc logs for ma7 calculation
      const descIndex = bodyCompLogs.findIndex(item => item.id === log.id);
      const ma7 = calculateMA7(bodyCompLogs, descIndex);
      const y = 32 - ((ma7 - minW) / rangeW) * 24;
      return { x, y };
    });

    // Generate Cubic bezier or simple line command
    const path = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const ma7Path = ma7Points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    return { path, ma7Path, points };
  };

  // 2. Plot Body Fat Trend SVG
  const getFatSvgPath = () => {
    if (sortedCompLogs.length < 2) {
      return { path: "M 0 20 H 100", points: [] };
    }
    const fats = sortedCompLogs.map(l => l.bodyFatPercent);
    const minF = Math.min(...fats) - 0.2;
    const maxF = Math.max(...fats) + 0.2;
    const rangeF = maxF - minF || 1;

    const points = sortedCompLogs.map((log, index) => {
      const x = (index / (sortedCompLogs.length - 1)) * 100;
      const y = 32 - ((log.bodyFatPercent - minF) / rangeF) * 24;
      return { x, y, fat: log.bodyFatPercent };
    });

    const path = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    return { path, points };
  };

  const weightChart = getWeightSvgPath();
  const fatChart = getFatSvgPath();

  // Macros progress calculations for the Progress dashboard
  const consumedProtein = foodLogs.reduce((sum, item) => sum + item.protein, 0);
  const targetProtein = 180; // Standard goal showcased on mockup
  const proteinPercent = Math.min(100, Math.round((consumedProtein / targetProtein) * 100));

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Hero Weight Trend Section */}
      <section className="bg-white dark:bg-neutral-900 rounded-[24px] p-5 border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Weight Trend</p>
            <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
              {latestLog.weight}{' '}
              <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">kg</span>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => onOpenQuickAdd('weight')}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 text-[10px] font-bold rounded-full transition-all shadow-sm"
            >
              <span>+ Log Weight</span>
            </button>
            <div className="text-right">
              <p className="text-primary dark:text-[#99f894] font-bold flex items-center justify-end gap-1 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary dark:bg-[#99f894] inline-block"></span>
                {totalWeightLoss <= 0 ? `${totalWeightLoss.toFixed(1)}kg` : `+${totalWeightLoss.toFixed(1)}kg`}
              </p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">This Month</p>
            </div>
          </div>
        </div>

        {/* Dynamic Weight SVG Line Chart */}
        <div className="h-44 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
            {/* Grid Helper Lines */}
            <line stroke="#f1eff5" className="dark:stroke-neutral-800/80" strokeWidth="0.5" x1="0" x2="100" y1="10" y2="10"></line>
            <line stroke="#f1eff5" className="dark:stroke-neutral-800/80" strokeWidth="0.5" x1="0" x2="100" y1="20" y2="20"></line>
            <line stroke="#f1eff5" className="dark:stroke-neutral-800/80" strokeWidth="0.5" x1="0" x2="100" y1="30" y2="30"></line>

            {/* Shaded Area Under Weight Line */}
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#006e1c" stopOpacity="0.12"></stop>
                <stop offset="100%" stopColor="#006e1c" stopOpacity="0.00"></stop>
              </linearGradient>
            </defs>
            {weightChart.points.length > 0 && (
              <path
                d={`${weightChart.path} V 40 H 0 Z`}
                fill="url(#chartGradient)"
              />
            )}

            {/* Moving Average 7 Trend Line (Dashed) */}
            <path
              d={weightChart.ma7Path}
              fill="none"
              stroke="#bfcab9"
              strokeDasharray="2,2"
              strokeWidth="1.2"
            />

            {/* Main Weight Trend Line */}
            <path
              d={weightChart.path}
              fill="none"
              stroke="#006e1c"
              strokeLinecap="round"
              strokeWidth="2.2"
            />

            {/* Dynamic Interactive Dot Highlight (Latest point) */}
            {weightChart.points.length > 0 && (
              <circle
                cx={weightChart.points[weightChart.points.length - 1].x}
                cy={weightChart.points[weightChart.points.length - 1].y}
                fill="#006e1c"
                r="3"
                stroke="white"
                strokeWidth="1"
              />
            )}
          </svg>
          <div className="flex justify-between mt-3 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <span>1st Jul</span>
            <span>10th Jul</span>
            <span>20th Jul</span>
            <span>Today</span>
          </div>
        </div>

        {/* Legend Row */}
        <div className="flex gap-4 border-t border-neutral-100 dark:border-neutral-800/80 pt-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
            <span>Daily Weight</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
            <span className="w-2.5 h-2.5 rounded-full bg-outline-variant border border-dashed border-neutral-400 inline-block"></span>
            <span>MA7 Trend</span>
          </div>
        </div>
      </section>

      {/* Body Composition Bento Grid */}
      <section className="grid grid-cols-2 gap-3.5">
        {/* Body Fat Card */}
        <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-[22px] p-4 shadow-sm">
          <Droplet className="w-5 h-5 text-primary mb-2.5" />
          <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5">Body Fat</p>
          <p className="text-xl font-extrabold text-neutral-900 dark:text-white">{latestLog.bodyFatPercent}%</p>
          <p className="text-xs font-semibold text-primary mt-1">{fatLossChange <= 0 ? `${fatLossChange.toFixed(1)}%` : `+${fatLossChange.toFixed(1)}%`}</p>
        </div>

        {/* Muscle Mass Card */}
        <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-[22px] p-4 shadow-sm">
          <Dumbbell className="w-5 h-5 text-primary mb-2.5" />
          <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5">Muscle Mass</p>
          <p className="text-xl font-extrabold text-neutral-900 dark:text-white">
            {latestLog.muscleMassKg || 56.8} <span className="text-[10px] font-semibold text-neutral-400">kg</span>
          </p>
          <p className="text-xs font-semibold text-primary mt-1">+0.2kg increase</p>
        </div>

        {/* Visceral Fat */}
        <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-[22px] p-4 shadow-sm">
          <Activity className="w-5 h-5 text-primary mb-2.5" />
          <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5">Visceral Fat</p>
          <p className="text-xl font-extrabold text-neutral-900 dark:text-white">{latestLog.visceralFat || 4}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">Optimal</span>
        </div>

        {/* BMR Card */}
        <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-[22px] p-4 shadow-sm">
          <Zap className="w-5 h-5 text-primary mb-2.5" />
          <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5">BMR</p>
          <p className="text-xl font-extrabold text-neutral-900 dark:text-white">{latestLog.bmr || 1750}</p>
          <p className="text-xs font-semibold text-neutral-400 mt-1">kcal/day passive</p>
        </div>
      </section>

      {/* Body Fat Trend Chart */}
      <section className="bg-white dark:bg-neutral-900 rounded-[24px] p-5 border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Body Fat % Trend</h3>
        <div className="h-32 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
            {/* Trend Line */}
            <path
              d={fatChart.path}
              fill="none"
              stroke="#4CAF50"
              strokeLinecap="round"
              strokeWidth="2"
            />
            {/* Draw Dot Highlights */}
            {fatChart.points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                fill="#4CAF50"
                r="1.5"
              />
            ))}
          </svg>
          <div className="flex justify-between mt-3 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>
      </section>

      {/* Dual Column: Deficit and Protein Consistency */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Deficit */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Weekly Deficit</h4>
              <p className="text-xs text-neutral-500 font-medium">Avg: -540 kcal/day</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Flame className="w-5 h-5 fill-primary" />
            </div>
          </div>
          {/* Aesthetic Bars */}
          <div className="flex items-end gap-2.5 h-20 pt-2 px-1">
            <div className="flex-1 bg-primary/15 rounded-t-md h-[70%]" title="Mon"></div>
            <div className="flex-1 bg-primary/25 rounded-t-md h-[95%]" title="Tue"></div>
            <div className="flex-1 bg-primary/15 rounded-t-md h-[60%]" title="Wed"></div>
            <div className="flex-1 bg-primary/35 rounded-t-md h-[100%]" title="Thu"></div>
            <div className="flex-1 bg-primary/20 rounded-t-md h-[80%]" title="Fri"></div>
            <div className="flex-1 bg-primary/15 rounded-t-md h-[55%]" title="Sat"></div>
            <div className="flex-1 bg-primary/45 rounded-t-md h-[90%]" title="Sun"></div>
          </div>
        </div>

        {/* Protein Target Gauge */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Protein Target</h4>
              <p className="text-xs text-neutral-500 font-medium">Consistency: 92%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          {/* Progress Indicators */}
          <div className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <span>Actual Average</span>
                <span className="text-primary">{consumedProtein}g</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${proteinPercent}%` }}></div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold">
              <span>Daily Goal Target</span>
              <span>{targetProtein}g</span>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Progress Summary Achievements Banner */}
      <section className="bg-primary text-white rounded-[24px] p-6 relative overflow-hidden shadow-md">
        <div className="relative z-10 space-y-5">
          <h3 className="font-bold text-base flex items-center gap-1.5">
            <Award className="w-5 h-5 fill-primary text-white" />
            Monthly Achievements
          </h3>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Total Weight Lost</p>
              <p className="text-3xl font-extrabold tracking-tight">{totalWeightLoss.toFixed(1)}kg</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Body Fat Change</p>
              <p className="text-3xl font-extrabold tracking-tight">{fatLossChange.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        {/* Glowing backgrounds */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-400/15 blur-[60px] rounded-full"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 blur-[55px] rounded-full"></div>
      </section>
    </div>
  );
}
