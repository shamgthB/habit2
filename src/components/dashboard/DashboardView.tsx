import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  Smile,
  Zap,
  Droplets,
  Moon,
  Activity,
  BookOpen,
  Trophy,
  ArrowRight,
  Sparkles,
  Calendar as CalendarIcon,
  Play,
  Clock,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { getGreeting, formatHumanDate, getPastDaysArray, getTodayDateString } from '../../utils/dateUtils';
import { DynamicIcon, CATEGORY_COLORS } from '../common/Icons';
import { calculateHabitStreak } from '../../utils/calculations';
import { MoodType } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    profile,
    selectedDate,
    setSelectedDate,
    lifeScore,
    globalStreak,
    todayScheduledHabits,
    todayCompletedCount,
    todayCompletionRate,
    todayMood,
    todayWellness,
    toggleHabitCompletion,
    updateHabitLogValue,
    skipHabitForDay,
    logMoodEnergy,
    updateWellness,
    goals,
    reminders,
    toggleReminderStatus,
    achievements,
    setCurrentSection,
    setIsAddHabitModalOpen,
    logs,
  } = useApp();

  const isToday = selectedDate === getTodayDateString();
  const { greeting, icon: greetingIcon } = getGreeting();

  // Partial update modal or popover for numeric habits
  const [selectedHabitForValue, setSelectedHabitForValue] = useState<string | null>(null);
  const [customValueInput, setCustomValueInput] = useState<number>(0);
  const [customNote, setCustomNote] = useState<string>('');

  // Motivational Quotes
  const quotes = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  ];
  const todayQuote = quotes[new Date().getDate() % quotes.length];

  // Past 7 days completion rate mini chart
  const past7Days = getPastDaysArray(7);
  const weeklyMiniData = past7Days.map((date) => {
    const scheduled = todayScheduledHabits.length || 5;
    const completed = logs.filter((l) => l.date === date && l.completed).length;
    const pct = Math.min(100, Math.round((completed / (scheduled || 1)) * 100));
    return { date, pct };
  });

  const moodsList: { id: MoodType; label: string; emoji: string }[] = [
    { id: 'very_happy', label: 'Great', emoji: '😄' },
    { id: 'happy', label: 'Good', emoji: '🙂' },
    { id: 'neutral', label: 'Neutral', emoji: '😐' },
    { id: 'sad', label: 'Down', emoji: '😔' },
    { id: 'stressed', label: 'Stressed', emoji: '😫' },
  ];

  const currentEnergy = todayMood?.energy || 8;
  const currentWater = todayWellness?.water?.current ?? 6;
  const targetWater = todayWellness?.water?.target ?? 8;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner: Greeting, Date, Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-linear-to-r from-emerald-600/10 via-teal-500/5 to-transparent dark:from-emerald-500/15 dark:via-slate-800/40 dark:to-slate-900 border border-emerald-500/20 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span>{greetingIcon} {greeting}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <CalendarIcon className="w-3.5 h-3.5" />
              {formatHumanDate(selectedDate)}
            </span>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(getTodayDateString())}
                className="ml-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-2xs cursor-pointer hover:bg-emerald-600"
              >
                Go to Today
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Welcome back, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl italic">
            &ldquo;{todayQuote.text}&rdquo; <span className="font-semibold not-italic">— {todayQuote.author}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentSection('focustimer')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Focus</span>
          </button>
          <button
            onClick={() => setIsAddHabitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Completion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Today&apos;s Progress
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {todayCompletionRate}%
              </span>
              <span className="text-xs text-slate-400">
                ({todayCompletedCount}/{todayScheduledHabits.length} done)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${todayCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Life Score Card */}
        <div
          onClick={() => setCurrentSection('analytics')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Overall Life Score
            </span>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {lifeScore.overallScore}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {lifeScore.overallScore >= 80 ? 'Optimal' : 'Strong'}
              </span>
            </div>
            <p className="mt-2 text-2xs text-slate-400 flex items-center justify-between">
              <span>View full balance breakdown</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Current Total Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Current Streak
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {globalStreak.currentStreak}
              </span>
              <span className="text-xs text-slate-400">days active</span>
            </div>
            <p className="mt-2 text-2xs text-amber-600 dark:text-amber-400 font-medium">
              Best Record: {globalStreak.bestStreak} days
            </p>
          </div>
        </div>

        {/* Gamification Level & XP */}
        <div
          onClick={() => setCurrentSection('achievements')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mastery Tier
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Zap className="w-4 h-4 fill-purple-500 text-purple-500" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Lv.{profile.level} {profile.levelTitle}
              </span>
            </div>
            <p className="mt-2 text-2xs text-slate-400 flex items-center justify-between">
              <span>{profile.xp} total XP accumulated</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid: Left (Today's Habits) & Right (Wellness, Mood, Routines, Reminders) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Today's Habits Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Today&apos;s Habits</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {todayCompletedCount}/{todayScheduledHabits.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Check off or log values to extend your active streaks
                </p>
              </div>

              <button
                onClick={() => setCurrentSection('habits')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Habit Cards List */}
            <div className="mt-4 space-y-3">
              {todayScheduledHabits.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    No habits scheduled for this day
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Add new habits or adjust frequency rules.
                  </p>
                </div>
              ) : (
                todayScheduledHabits.map((habit) => {
                  const log = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);
                  const isDone = log?.completed ?? false;
                  const curValue = log?.value ?? (isDone ? habit.targetValue : 0);
                  const streakRes = calculateHabitStreak(habit, logs, selectedDate);
                  const catColor = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.Other;

                  return (
                    <div
                      key={habit.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 ${
                        isDone
                          ? 'bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/30 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Complete Checkbox + Icon + Title */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <button
                            onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
                            className={`p-1 rounded-xl transition-transform active:scale-90 cursor-pointer ${
                              isDone
                                ? 'text-emerald-500 hover:text-emerald-600'
                                : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500'
                            }`}
                            aria-label={isDone ? 'Mark incomplete' : 'Mark completed'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-6 h-6 fill-emerald-500 text-white dark:text-slate-900" />
                            ) : (
                              <Circle className="w-6 h-6 stroke-[1.5]" />
                            )}
                          </button>

                          {/* Habit Icon */}
                          <div className={`p-2.5 rounded-xl shrink-0 ${catColor.bg} ${catColor.text}`}>
                            <DynamicIcon name={habit.icon} className="w-4 h-4" />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-sm font-bold truncate transition-colors ${
                                  isDone
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {habit.name}
                              </h3>
                              {habit.isPinned && (
                                <span className="text-3xs font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  Pinned
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-2xs text-slate-400">
                              <span>{habit.category}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold font-mono">
                                <Flame className="w-3 h-3 fill-amber-500" />
                                {streakRes.currentStreak}d streak
                              </span>
                              {habit.reminderTime && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                    {habit.reminderTime}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Stepper / Numeric Target Log */}
                        <div className="flex items-center gap-2 shrink-0">
                          {habit.targetValue > 1 ? (
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                              <button
                                onClick={() =>
                                  updateHabitLogValue(
                                    habit.id,
                                    Math.max(0, curValue - 1),
                                    selectedDate
                                  )
                                }
                                className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 min-w-10 text-center">
                                {curValue}/{habit.targetValue}
                              </span>
                              <button
                                onClick={() =>
                                  updateHabitLogValue(
                                    habit.id,
                                    curValue + 1,
                                    selectedDate
                                  )
                                }
                                className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                aria-label="Increase"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }`}
                            >
                              {isDone ? 'Completed' : 'Complete'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Numeric Target Progress bar */}
                      {habit.targetValue > 1 && (
                        <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.round((curValue / habit.targetValue) * 100))}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Weekly Progress Summary Mini Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Weekly Completion Trajectory
              </h3>
              <button
                onClick={() => setCurrentSection('analytics')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Deep Analytics →
              </button>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2 text-center">
              {weeklyMiniData.map((day, idx) => {
                const dayDate = new Date(day.date);
                const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                const isSelected = day.date === selectedDate;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/40 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xs font-semibold text-slate-400">{dayName}</span>
                    <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex flex-col justify-end p-0.5 overflow-hidden">
                      <div
                        className="w-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ height: `${day.pct}%` }}
                      />
                    </div>
                    <span className="text-2xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {day.pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Mood, Water & Wellness, Upcoming Reminders, Goals (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Mood & Energy Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-emerald-500" />
                Mood & Energy
              </span>
              <span className="text-2xs text-slate-400 font-mono">Energy: {currentEnergy}/10</span>
            </div>

            {/* Mood selector */}
            <div className="mt-4 flex items-center justify-between gap-1">
              {moodsList.map((m) => {
                const isSelected = todayMood?.mood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => logMoodEnergy(m.id, currentEnergy, todayMood?.note, selectedDate)}
                    className={`flex flex-col items-center p-2 rounded-xl text-lg transition-transform hover:scale-110 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/40 scale-105'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    title={m.label}
                  >
                    <span>{m.emoji}</span>
                    <span className="text-3xs text-slate-400 mt-1 font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Energy Slider */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-2xs text-slate-500 mb-1.5">
                <span>Energy Battery</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentEnergy}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={currentEnergy}
                onChange={(e) =>
                  logMoodEnergy(
                    todayMood?.mood || 'happy',
                    Number(e.target.value),
                    todayMood?.note,
                    selectedDate
                  )
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Water & Sleep Wellness Counters */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Wellness Snapshot
            </h3>

            {/* Water Tracker Counter */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Water Intake</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
                    {currentWater} / {targetWater} glasses
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    updateWellness(
                      { water: { current: Math.max(0, currentWater - 1), target: targetWater } },
                      selectedDate
                    )
                  }
                  className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    updateWellness(
                      { water: { current: currentWater + 1, target: targetWater } },
                      selectedDate
                    )
                  }
                  className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sleep Summary */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sleep Duration</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                    {todayWellness?.sleep?.durationHours ?? 7.5} hours
                  </p>
                </div>
              </div>
              <span className="text-2xs font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                {todayWellness?.sleep?.bedtime || '23:00'} → {todayWellness?.sleep?.wakeupTime || '06:30'}
              </span>
            </div>

            {/* Exercise & Study quick stats */}
            <div className="grid grid-cols-2 gap-2 text-2xs">
              <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Workout</span>
                  <p className="text-rose-600 font-mono">{todayWellness?.exercise?.durationMins ?? 45} mins</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Deep Study</span>
                  <p className="text-amber-600 font-mono">{todayWellness?.study?.hours ?? 2.5} hrs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Reminders Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                Scheduled Reminders
              </h3>
            </div>

            <div className="mt-3 space-y-2">
              {reminders.slice(0, 3).map((rem) => {
                const isDone = rem.status === 'completed';
                return (
                  <div
                    key={rem.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {rem.time}
                        </span>
                        <p className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {rem.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleReminderStatus(rem.id, isDone ? 'upcoming' : 'completed')}
                      className={`p-1 rounded-lg cursor-pointer transition-colors ${
                        isDone ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-emerald-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="p-5 rounded-3xl bg-linear-to-tr from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                Unlocked Badges
              </span>
              <button
                onClick={() => setCurrentSection('achievements')}
                className="text-2xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                View all ({achievements.filter((a) => a.unlockedAt).length})
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
              {achievements
                .filter((a) => a.unlockedAt)
                .slice(0, 4)
                .map((ach) => (
                  <div
                    key={ach.id}
                    title={`${ach.title} (+${ach.xp} XP)`}
                    className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/40 shrink-0 w-20 text-center"
                  >
                    <span className="text-xl">🏆</span>
                    <span className="text-3xs font-bold text-slate-700 dark:text-slate-300 mt-1 truncate w-full">
                      {ach.title}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
