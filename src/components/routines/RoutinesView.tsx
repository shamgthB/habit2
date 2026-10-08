import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Repeat,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { Routine } from '../../types';
import { getTodayDateString } from '../../utils/dateUtils';
import { ConfirmModal } from '../common/ConfirmModal';

export const RoutinesView: React.FC = () => {
  const {
    routines,
    habits,
    addRoutine,
    deleteRoutine,
    completeRoutineAction,
    toggleHabitCompletion,
    logs,
  } = useApp();

  const today = getTodayDateString();

  // Active playing routine session
  const [activePlayingRoutine, setActivePlayingRoutine] = useState<Routine | null>(null);
  const [routineCompletedHabitIds, setRoutineCompletedHabitIds] = useState<string[]>([]);

  // Create routine modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [reminderTime, setReminderTime] = useState('07:30');
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [icon, setIcon] = useState('Sun');
  const [color, setColor] = useState('amber');

  const startRoutineSession = (routine: Routine) => {
    setActivePlayingRoutine(routine);
    // Pre-check habits already completed today
    const doneToday = routine.habitIds.filter((hId) => {
      const match = logs.find((l) => l.habitId === hId && l.date === today);
      return match && match.completed;
    });
    setRoutineCompletedHabitIds(doneToday);
  };

  const toggleRoutineHabit = (hId: string) => {
    toggleHabitCompletion(hId, today);
    if (routineCompletedHabitIds.includes(hId)) {
      setRoutineCompletedHabitIds(routineCompletedHabitIds.filter((id) => id !== hId));
    } else {
      setRoutineCompletedHabitIds([...routineCompletedHabitIds, hId]);
    }
  };

  const handleFinishRoutineSession = () => {
    if (activePlayingRoutine) {
      completeRoutineAction(activePlayingRoutine.id);
      setActivePlayingRoutine(null);
    }
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addRoutine({
      name: name.trim(),
      description: description.trim(),
      habitIds: selectedHabitIds.length > 0 ? selectedHabitIds : habits.slice(0, 2).map((h) => h.id),
      estimatedMinutes: Number(estimatedMinutes) || 20,
      reminderTime,
      icon,
      color,
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Daily Routines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bundle complementary habits into seamless morning, afternoon, and evening rituals
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setDescription('');
            setSelectedHabitIds(habits.slice(0, 2).map((h) => h.id));
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Routine</span>
        </button>
      </div>

      {/* Active Routine Player Modal */}
      {activePlayingRoutine && (
        <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-600/15 via-teal-600/10 to-transparent dark:from-emerald-950/40 dark:via-slate-800/60 dark:to-slate-900 border border-emerald-500/30 shadow-lg space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                <Repeat className="w-6 h-6 animate-spin" />
              </span>
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Active Routine Player
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {activePlayingRoutine.name}
                </h2>
              </div>
            </div>

            <button
              onClick={() => setActivePlayingRoutine(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400">
                {routineCompletedHabitIds.length} of {activePlayingRoutine.habitIds.length} habits checked off
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {Math.round(
                  (routineCompletedHabitIds.length / (activePlayingRoutine.habitIds.length || 1)) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${(routineCompletedHabitIds.length / (activePlayingRoutine.habitIds.length || 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Steps checklist */}
          <div className="space-y-2">
            {activePlayingRoutine.habitIds.map((hId, index) => {
              const habit = habits.find((h) => h.id === hId);
              if (!habit) return null;
              const isDone = routineCompletedHabitIds.includes(hId);

              return (
                <div
                  key={hId}
                  onClick={() => toggleRoutineHabit(hId)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold w-5 text-slate-400">
                      0{index + 1}
                    </span>
                    <span className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {habit.name}
                    </span>
                  </div>

                  <div className={`p-1 rounded-xl ${isDone ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <CheckCircle2 className="w-5 h-5 fill-current" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Complete Routine Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleFinishRoutineSession}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Finish Routine (+50 XP)</span>
            </button>
          </div>
        </div>
      )}

      {/* Routines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {routines.map((routine) => {
          const routineHabits = habits.filter((h) => routine.habitIds.includes(h.id));
          const completedCount = routineHabits.filter((h) => {
            const l = logs.find((log) => log.habitId === h.id && log.date === today);
            return l && l.completed;
          }).length;
          const pct = routineHabits.length > 0 ? Math.round((completedCount / routineHabits.length) * 100) : 0;

          return (
            <div
              key={routine.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                      {routine.icon === 'Sun' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {routine.name}
                      </h3>
                      <div className="flex items-center gap-2 text-2xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Est. {routine.estimatedMinutes} mins
                        </span>
                        {routine.reminderTime && (
                          <>
                            <span>•</span>
                            <span>{routine.reminderTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setRoutineToDelete(routine)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  {routine.description}
                </p>

                {/* Habits in Routine */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                    Habits in Sequence ({routineHabits.length})
                  </span>
                  {routineHabits.map((h, i) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {i + 1}. {h.name}
                      </span>
                      <span className="text-2xs text-slate-400">{h.targetValue} {h.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  Today: {completedCount}/{routineHabits.length} done ({pct}%)
                </span>

                <button
                  onClick={() => startRoutineSession(routine)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Routine</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Routine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create Routine</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoutine} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Routine Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Energizing Morning Ritual"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="How does this ritual prepare you for the day?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Est. Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-hidden"
                  />
                </div>
              </div>

              {/* Select habits */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Habits to Include in Routine
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {habits.map((h) => {
                    const isSelected = selectedHabitIds.includes(h.id);
                    return (
                      <button
                        type="button"
                        key={h.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedHabitIds(selectedHabitIds.filter((id) => id !== h.id));
                          } else {
                            setSelectedHabitIds([...selectedHabitIds, h.id]);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-semibold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{h.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  Create Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={routineToDelete !== null}
        title="Delete Routine?"
        message={`Are you sure you want to delete "${routineToDelete?.name}"? The individual habits will not be deleted.`}
        confirmText="Delete Routine"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (routineToDelete) {
            deleteRoutine(routineToDelete.id);
            setRoutineToDelete(null);
          }
        }}
        onCancel={() => setRoutineToDelete(null)}
      />
    </div>
  );
};
