import React, { useState } from 'react';
import { Scale, ChevronLeft, Plus, Calendar, Trash2, X, Award, Flame, Heart, Info } from 'lucide-react';
import { BodyCompLogItem, UserProfile } from '../types';
import { getFormattedDate, getTodayDateString } from '../utils';

interface BodyCompositionPageProps {
  profile: UserProfile;
  bodyCompLogs: BodyCompLogItem[];
  onAddBodyComp: (comp: Omit<BodyCompLogItem, 'id'> & { dateString?: string }) => void;
  onUpdateBodyCompLogs: React.Dispatch<React.SetStateAction<BodyCompLogItem[]>>;
  onNavigate: (tab: 'home' | 'food' | 'workouts' | 'progress' | 'calendar' | 'settings' | 'bodycomp') => void;
}

export default function BodyCompositionPage({
  profile,
  bodyCompLogs,
  onAddBodyComp,
  onUpdateBodyCompLogs,
  onNavigate
}: BodyCompositionPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [dateStr, setDateStr] = useState(() => getTodayDateString());
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscle, setMuscle] = useState('');
  const [visceral, setVisceral] = useState('');
  const [bmrInput, setBmrInput] = useState('');

  // Get the most recent log as the active/current composition
  const sortedLogs = [...bodyCompLogs].sort((a, b) => b.dateString.localeCompare(a.dateString));
  const latestLog = sortedLogs[0];

  const calculateBMI = (w: number) => {
    const h = profile.height || 175;
    const heightM = h / 100;
    return parseFloat((w / (heightM * heightM)).toFixed(1));
  };

  const currentWeight = latestLog?.weight || profile.currentWeight || 70.5;
  const currentBodyFat = latestLog?.bodyFatPercent || profile.targetBodyFat || 15.0;
  const currentMuscle = latestLog?.muscleMassKg || 55.0;
  const currentVisceral = latestLog?.visceralFat || 4;
  const currentBMI = calculateBMI(currentWeight);
  const currentBMR = latestLog?.bmr || 1750;

  const lastUpdatedText = latestLog
    ? getFormattedDate(latestLog.dateString)
    : "No records yet";

  const handleOpenModal = () => {
    setDateStr(getTodayDateString());
    setWeight(latestLog?.weight?.toString() || '');
    setBodyFat(latestLog?.bodyFatPercent?.toString() || '');
    setMuscle(latestLog?.muscleMassKg?.toString() || '');
    setVisceral(latestLog?.visceralFat?.toString() || '');
    setBmrInput(latestLog?.bmr?.toString() || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wVal = parseFloat(weight);
    if (!wVal || isNaN(wVal)) return;

    const bfVal = parseFloat(bodyFat) || 15.0;
    const muscleVal = parseFloat(muscle) || 55.0;
    const visceralVal = parseInt(visceral) || 4;

    // Estimate BMR if not provided
    let bmrVal = parseInt(bmrInput);
    if (!bmrVal || isNaN(bmrVal)) {
      const h = profile.height || 175;
      const age = profile.age || 25;
      const gender = profile.gender || 'Male';
      if (gender.toLowerCase() === 'female') {
        bmrVal = Math.round(10 * wVal + 6.25 * h - 5 * age - 161);
      } else {
        bmrVal = Math.round(10 * wVal + 6.25 * h - 5 * age + 5);
      }
    }

    onAddBodyComp({
      weight: wVal,
      bodyFatPercent: bfVal,
      muscleMassKg: muscleVal,
      visceralFat: visceralVal,
      bmr: bmrVal,
      dateString: dateStr
    });

    setIsModalOpen(false);
  };

  const handleDeleteLog = (id: string) => {
    if (window.confirm("Are you sure you want to delete this measurement?")) {
      onUpdateBodyCompLogs(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in select-none">
      {/* Back to Settings Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Settings
        </button>
        <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Body Composition</span>
      </div>

      {/* Top Summary Card */}
      <section className="bg-white dark:bg-neutral-900 rounded-[28px] border border-neutral-100/60 dark:border-neutral-800 shadow-[0_4px_20px_rgba(0,0,0,0.015)] p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-neutral-50 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-500 dark:text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-850 dark:text-white uppercase tracking-wider">Active Summary</h2>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wide">
                Last Updated: <span className="text-blue-500 dark:text-blue-400 normal-case font-extrabold">{lastUpdatedText}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3x2 Grid Metrics */}
        <div className="grid grid-cols-3 gap-3.5">
          {/* Weight */}
          <div className="bg-neutral-50/55 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3 text-center transition-all hover:scale-[1.02]">
            <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Weight</p>
            <p className="text-lg font-black text-neutral-900 dark:text-white mt-1 leading-none">{currentWeight.toFixed(1)} <span className="text-[10px] font-medium text-neutral-400">kg</span></p>
          </div>

          {/* Body Fat */}
          <div className="bg-neutral-50/55 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3 text-center transition-all hover:scale-[1.02]">
            <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Body Fat</p>
            <p className="text-lg font-black text-[#f43f5e] mt-1 leading-none">{currentBodyFat.toFixed(1)}<span className="text-[10px] font-medium">%</span></p>
          </div>

          {/* Muscle Mass */}
          <div className="bg-neutral-50/55 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3 text-center transition-all hover:scale-[1.02]">
            <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Muscle Mass</p>
            <p className="text-lg font-black text-green-500 mt-1 leading-none">{currentMuscle.toFixed(1)} <span className="text-[10px] font-medium">kg</span></p>
          </div>

          {/* Visceral Fat */}
          <div className="bg-neutral-50/55 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3 text-center transition-all hover:scale-[1.02]">
            <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Visceral Fat</p>
            <p className="text-lg font-black text-orange-500 mt-1 leading-none">{currentVisceral}</p>
          </div>

          {/* BMI */}
          <div className="bg-neutral-50/55 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3 text-center transition-all hover:scale-[1.02]">
            <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">BMI</p>
            <p className="text-lg font-black text-purple-500 mt-1 leading-none">{currentBMI.toFixed(1)}</p>
          </div>

          {/* BMR */}
          <div className="bg-neutral-50/55 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3 text-center transition-all hover:scale-[1.02]">
            <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">BMR</p>
            <p className="text-lg font-black text-primary mt-1 leading-none">{currentBMR} <span className="text-[8px] font-bold">kcal</span></p>
          </div>
        </div>
      </section>

      {/* Measurement History Section */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1">Measurement History</h3>

        <div className="space-y-3">
          {sortedLogs.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-8 text-center text-neutral-400">
              <Scale className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-bold">No measurements logged yet</p>
              <p className="text-[10px] text-neutral-500 mt-1">Click "+ Add Measurement" to track your progress.</p>
            </div>
          ) : (
            sortedLogs.map((log) => {
              const bmiVal = calculateBMI(log.weight);
              return (
                <div
                  key={log.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm transition-all flex justify-between items-center group hover:border-neutral-200 dark:hover:border-neutral-700"
                >
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-neutral-800 dark:text-white">
                        {getFormattedDate(log.dateString)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {log.weight.toFixed(1)} kg
                      </span>
                    </div>

                    {/* Detailed Row Metrics Grid */}
                    <div className="grid grid-cols-5 gap-2 pt-1 text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-neutral-400">Fat</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">{log.bodyFatPercent.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-neutral-400">Muscle</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">{log.muscleMassKg ? log.muscleMassKg.toFixed(1) : '-'} kg</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-neutral-400">Visc</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">{log.visceralFat || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-neutral-400">BMI</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">{bmiVal}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-neutral-400">BMR</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">{log.bmr || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-2 text-neutral-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-all ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Primary Elevated Action Trigger Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-[0_6px_20px_rgba(22,163,74,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Measurement
        </button>
      </div>

      {/* Add Measurement Full Screen / Sheet Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-[28px] border border-neutral-100 dark:border-neutral-800 w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-5 py-4 border-b border-neutral-50 dark:border-neutral-800/80 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-950/20">
              <span className="text-xs font-black uppercase tracking-wider text-primary">New Body Measurement</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Date String Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">Log Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-150 dark:border-neutral-700/80 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Weight & Body Fat Side-by-Side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 70.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-150 dark:border-neutral-700/80 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.2"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-150 dark:border-neutral-700/80 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Muscle & Visceral Fat */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">Muscle Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 56.8"
                    value={muscle}
                    onChange={(e) => setMuscle(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-150 dark:border-neutral-700/80 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">Visceral Fat</label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={visceral}
                    onChange={(e) => setVisceral(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-150 dark:border-neutral-700/80 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* BMR (optional) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">BMR (kcal - optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty to auto-estimate"
                  value={bmrInput}
                  onChange={(e) => setBmrInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-150 dark:border-neutral-700/80 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md shadow-primary/15 transition-all"
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
