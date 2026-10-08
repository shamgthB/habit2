import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  BarChart3,
  Flame,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { getDaysAgo, getTodayDateString } from '../../utils/dateUtils';
import { calculateHabitStreak, isHabitScheduledForDate } from '../../utils/calculations';
import { CATEGORY_COLORS, DynamicIcon } from '../common/Icons';

export const AnalyticsView: React.FC = () => {
  const { habits, logs, lifeScore, globalStreak } = useApp();

  const [dateRangeFilter, setDateRangeFilter] = useState<'7' | '30' | '90' | '365'>('30');

  const daysCount = Number(dateRangeFilter);
  const cutoffDate = getDaysAgo(daysCount);

  // Filter logs for selected date range
  const rangeLogs = useMemo(() => {
    return logs.filter((l) => l.date >= cutoffDate);
  }, [logs, cutoffDate]);

  // Total completed vs missed
  const stats = useMemo(() => {
    const activeHabits = habits.filter((h) => !h.isArchived);

    let totalScheduled = 0;
    let totalCompleted = 0;

    for (let i = 0; i < daysCount; i++) {
      const date = getDaysAgo(i);
      activeHabits.forEach((h) => {
        if (isHabitScheduledForDate(h, date)) {
          totalScheduled++;
          const matchLog = rangeLogs.find((l) => l.habitId === h.id && l.date === date);
          if (matchLog && matchLog.completed) {
            totalCompleted++;
          }
        }
      });
    }

    const totalMissed = Math.max(0, totalScheduled - totalCompleted);
    const avgRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

    // Per habit performance ranking
    const habitStats = activeHabits.map((h) => {
      let hSched = 0;
      let hDone = 0;
      for (let i = 0; i < daysCount; i++) {
        const date = getDaysAgo(i);
        if (isHabitScheduledForDate(h, date)) {
          hSched++;
          const match = rangeLogs.find((l) => l.habitId === h.id && l.date === date);
          if (match && match.completed) hDone++;
        }
      }
      const pct = hSched > 0 ? Math.round((hDone / hSched) * 100) : 0;
      const streakRes = calculateHabitStreak(h, logs);
      return {
        habit: h,
        scheduled: hSched,
        completed: hDone,
        pct,
        currentStreak: streakRes.currentStreak,
        longestStreak: streakRes.longestStreak,
      };
    });

    habitStats.sort((a, b) => b.pct - a.pct);

    const bestPerforming = habitStats.slice(0, 3);
    const needsImprovement = habitStats.slice(-3).reverse();

    // Category performance
    const categoryMap = new Map<string, { scheduled: number; completed: number }>();
    habitStats.forEach((hs) => {
      const cat = hs.habit.category;
      const cur = categoryMap.get(cat) || { scheduled: 0, completed: 0 };
      categoryMap.set(cat, {
        scheduled: cur.scheduled + hs.scheduled,
        completed: cur.completed + hs.completed,
      });
    });

    const categoryPerformance = Array.from(categoryMap.entries()).map(([cat, val]) => ({
      category: cat,
      scheduled: val.scheduled,
      completed: val.completed,
      pct: val.scheduled > 0 ? Math.round((val.completed / val.scheduled) * 100) : 0,
    }));

    // Daily completion points for line chart
    const dailyPoints: { date: string; label: string; pct: number }[] = [];
    const step = daysCount <= 14 ? 1 : daysCount <= 30 ? 2 : 5;
    for (let i = daysCount - 1; i >= 0; i -= step) {
      const d = getDaysAgo(i);
      const dayLogs = rangeLogs.filter((l) => l.date === d);
      const dayDone = dayLogs.filter((l) => l.completed).length;
      const daySched = activeHabits.filter((h) => isHabitScheduledForDate(h, d)).length || 1;
      const pct = Math.min(100, Math.round((dayDone / daySched) * 100));
      dailyPoints.push({
        date: d,
        label: new Date(d).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        pct,
      });
    }

    return {
      totalScheduled,
      totalCompleted,
      totalMissed,
      avgRate,
      bestPerforming,
      needsImprovement,
      categoryPerformance,
      dailyPoints,
    };
  }, [habits, rangeLogs, daysCount, logs]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Analytics & Consistency
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-driven insights across habits, streaks, and category mastery
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
          {[
            { id: '7', label: '7 Days' },
            { id: '30', label: '30 Days' },
            { id: '90', label: '90 Days' },
            { id: '365', label: '1 Year' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateRangeFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                dateRangeFilter === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Completion</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {stats.avgRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              In past {daysCount} days
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Check-ins</span>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {stats.totalCompleted}
            </span>
            <span className="text-xs text-slate-400">of {stats.totalScheduled} total</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Streak Records</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {globalStreak.currentStreak}d
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Best: {globalStreak.bestStreak}d
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Life Score Index</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {lifeScore.overallScore}/100
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Balanced</span>
          </div>
        </div>
      </div>

      {/* Main Trend Line Chart Simulation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Consistency Curve ({daysCount} Days)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily completion rate percentage over time
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Success Rate</span>
          </div>
        </div>

        {/* CSS Scaled Bar/Area Curve */}
        <div className="pt-6 pb-2">
          <div className="h-44 w-full flex items-end gap-1.5 sm:gap-3 px-2">
            {stats.dailyPoints.map((pt, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div
                  className="w-full bg-linear-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-300 group-hover:from-emerald-500 group-hover:to-teal-300 relative"
                  style={{ height: `${Math.max(8, pt.pct)}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-3xs font-mono py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                    {pt.pct}% on {pt.label}
                  </div>
                </div>
                <span className="text-3xs text-slate-400 font-mono truncate w-full text-center">
                  {pt.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Performing Habits vs Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Best Habits & Improvement (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Best Performing */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span>Highest Consistency Habits</span>
            </h3>

            <div className="mt-4 space-y-3">
              {stats.bestPerforming.map((item) => (
                <div
                  key={item.habit.id}
                  className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔥</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.habit.name}
                      </p>
                      <p className="text-2xs text-slate-500">
                        {item.completed}/{item.scheduled} completed • {item.currentStreak}d streak
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {item.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Improvement */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-amber-500" />
              <span>Habits Needing Focus</span>
            </h3>

            <div className="mt-4 space-y-3">
              {stats.needsImprovement.map((item) => (
                <div
                  key={item.habit.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎯</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.habit.name}
                      </p>
                      <p className="text-2xs text-slate-500">
                        {item.completed}/{item.scheduled} logged in this window
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
                    {item.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Performance & Life Score Factors (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category Performance */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-500" />
              <span>Performance by Category</span>
            </h3>

            <div className="mt-4 space-y-3">
              {stats.categoryPerformance.map((cp) => (
                <div key={cp.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{cp.category}</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {cp.pct}% ({cp.completed}/{cp.scheduled})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${cp.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Life Score Breakdown Explanation */}
          <div className="p-6 rounded-3xl bg-linear-to-tr from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Life Score Calculation Logic</span>
              </h3>
              <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {lifeScore.overallScore}/100
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {lifeScore.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
