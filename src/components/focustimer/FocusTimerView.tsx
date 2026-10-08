import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { getTodayDateString } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';

export const FocusTimerView: React.FC = () => {
  const { habits, focusSessions, logFocusSession, addToast } = useApp();

  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [focusDuration, setFocusDuration] = useState<number>(25); // minutes
  const [breakDuration, setBreakDuration] = useState<number>(5); // minutes

  const [timeLeft, setTimeLeft] = useState<number>(focusDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>(habits[0]?.id || '');
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timeLeft when durations change and timer is stopped
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    }
  }, [focusDuration, breakDuration, mode, isRunning]);

  // Main countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {}

    if (mode === 'focus') {
      const habit = habits.find((h) => h.id === selectedHabitId);
      logFocusSession({
        habitId: selectedHabitId || undefined,
        habitName: habit?.name,
        date: getTodayDateString(),
        durationMinutes: focusDuration,
        type: 'focus',
      });
      setCompletedSessionsCount((c) => c + 1);
      setMode('break');
      setTimeLeft(breakDuration * 60);
      addToast({
        type: 'success',
        title: 'Focus Session Completed!',
        message: `Great discipline! Time for a ${breakDuration}-minute break.`,
        duration: 5000,
      });
    } else {
      setMode('focus');
      setTimeLeft(focusDuration * 60);
      addToast({
        type: 'info',
        title: 'Break Finished',
        message: 'Ready for another deep focus sprint?',
      });
    }
  };

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTimeForMode = (mode === 'focus' ? focusDuration : breakDuration) * 60;
  const progressPct = Math.round(((totalTimeForMode - timeLeft) / totalTimeForMode) * 100);

  // Today's total focus time
  const todaySessions = focusSessions.filter((s) => s.date === getTodayDateString() && s.type === 'focus');
  const todayTotalFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Focus Timer & Pomodoro
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Lock in uninterrupted deep work and link sessions directly to your habits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Timer Display (8 cols) */}
        <div className="lg:col-span-8 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => {
                setMode('focus');
                setIsRunning(false);
                setTimeLeft(focusDuration * 60);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'focus'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Brain className="w-4 h-4 text-emerald-500" />
              <span>Deep Focus</span>
            </button>
            <button
              onClick={() => {
                setMode('break');
                setIsRunning(false);
                setTimeLeft(breakDuration * 60);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'break'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Coffee className="w-4 h-4 text-amber-500" />
              <span>Rest Break</span>
            </button>
          </div>

          {/* Large Circular Countdown Display */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center border-8 border-slate-100 dark:border-slate-800 my-4 shadow-inner">
            {/* Animated SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="fill-none stroke-emerald-500 stroke-8 transition-all duration-500"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progressPct) / 100}
                strokeLinecap="round"
              />
            </svg>

            <div className="flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
                {formattedTime}
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400 mt-2">
                {mode === 'focus' ? 'Session in progress' : 'Recharge time'}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg transition-transform active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Duration Buttons */}
          <div className="flex items-center gap-2 pt-4">
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setFocusDuration(mins);
                  if (mode === 'focus' && !isRunning) setTimeLeft(mins * 60);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                  focusDuration === mins && mode === 'focus'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar: Session Details & Today's Log (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Link to habit */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Link Session to Habit
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Active Habit Target
              </label>
              <select
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 outline-hidden cursor-pointer"
              >
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Today's Focus Stats */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Today&apos;s Focus Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {todayTotalFocusMinutes}
                </span>
                <span className="block text-3xs font-bold uppercase text-slate-400 mt-1">
                  Minutes Logged
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {todaySessions.length}
                </span>
                <span className="block text-3xs font-bold uppercase text-slate-400 mt-1">
                  Completed Sprints
                </span>
              </div>
            </div>

            {/* List of recent sessions today */}
            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
              <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                Recent Sessions
              </span>
              {todaySessions.length === 0 ? (
                <p className="text-xs text-slate-400">No sessions logged yet today.</p>
              ) : (
                todaySessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {s.habitName || 'Deep Focus'}
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      +{s.durationMinutes}m
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
