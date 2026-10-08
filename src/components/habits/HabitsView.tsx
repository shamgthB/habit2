import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Search,
  Pin,
  Archive,
  Copy,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Flame,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  Layers,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Habit, HabitCategory } from '../../types';
import { calculateHabitStreak } from '../../utils/calculations';
import { DynamicIcon, CATEGORY_COLORS } from '../common/Icons';
import { ConfirmModal } from '../common/ConfirmModal';
import { getTodayDateString } from '../../utils/dateUtils';

export const HabitsView: React.FC = () => {
  const {
    habits,
    logs,
    setIsAddHabitModalOpen,
    setEditingHabit,
    deleteHabit,
    restoreHabit,
    deletedHabits,
    togglePinHabit,
    toggleArchiveHabit,
    duplicateHabit,
    reorderHabits,
    toggleHabitCompletion,
    setIsTemplatesModalOpen,
    selectedDate,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'pinned'>('active');
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'streak' | 'priority'>('order');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Delete modal state
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const categories = [
    'All',
    'Health',
    'Fitness',
    'Study',
    'Work',
    'Personal',
    'Finance',
    'Mindfulness',
    'Sleep',
    'Productivity',
    'Other',
  ];

  // Filtering and Sorting
  const filteredHabits = useMemo(() => {
    return habits
      .filter((h) => {
        // Status
        if (statusFilter === 'active' && h.isArchived) return false;
        if (statusFilter === 'archived' && !h.isArchived) return false;
        if (statusFilter === 'pinned' && (!h.isPinned || h.isArchived)) return false;

        // Category
        if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = h.name.toLowerCase().includes(q);
          const matchCat = h.category.toLowerCase().includes(q);
          const matchDesc = h.description.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'priority') {
          const priorityScore = { high: 3, medium: 2, low: 1 };
          return priorityScore[b.priority] - priorityScore[a.priority];
        }
        if (sortBy === 'streak') {
          const sA = calculateHabitStreak(a, logs).currentStreak;
          const sB = calculateHabitStreak(b, logs).currentStreak;
          return sB - sA;
        }
        // default order
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.order - b.order;
      });
  }, [habits, logs, statusFilter, selectedCategory, searchQuery, sortBy]);

  // Reorder handlers
  const moveHabit = (index: number, direction: 'up' | 'down') => {
    const newHabits = [...filteredHabits];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newHabits.length) return;

    const temp = newHabits[index];
    newHabits[index] = newHabits[targetIdx];
    newHabits[targetIdx] = temp;
    reorderHabits(newHabits);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            My Habits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, schedule, and track your daily rituals and long-term routines
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button
            onClick={() => setIsAddHabitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Habit</span>
          </button>
        </div>
      </div>

      {/* Recently Deleted Banner (if any) */}
      {deletedHabits.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <RotateCcw className="w-4 h-4" />
            <span>
              Recently deleted habit: &ldquo;{deletedHabits[0].habit.name}&rdquo;
            </span>
          </div>
          <button
            onClick={() => restoreHabit(deletedHabits[0].habit.id)}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Undo Restore
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits by name, category, notes..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Status Tabs & View Toggle */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('pinned')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'pinned'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Pinned
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'archived'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Archived
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
            >
              <option value="order">Custom Order</option>
              <option value="name">Name (A-Z)</option>
              <option value="streak">Longest Streak</option>
              <option value="priority">Priority</option>
            </select>

            {/* List vs Grid View Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habits List / Grid */}
      {filteredHabits.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No habits match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching categories or clear search</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setStatusFilter('active');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs cursor-pointer hover:bg-emerald-700"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredHabits.map((habit, index) => {
            const streakRes = calculateHabitStreak(habit, logs, selectedDate);
            const isCompletedToday = logs.some(
              (l) => l.habitId === habit.id && l.date === selectedDate && l.completed
            );
            const catColor = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.Other;

            return (
              <div
                key={habit.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                {/* Left side: Reorder + Icon + Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Reorder Arrows */}
                  {sortBy === 'order' && (
                    <div className="flex flex-col gap-0.5 text-slate-300 hover:text-slate-600 dark:hover:text-slate-400">
                      <button
                        onClick={() => moveHabit(index, 'up')}
                        disabled={index === 0}
                        className="disabled:opacity-20 cursor-pointer"
                        title="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveHabit(index, 'down')}
                        disabled={index === filteredHabits.length - 1}
                        className="disabled:opacity-20 cursor-pointer"
                        title="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl shrink-0 ${catColor.bg} ${catColor.text}`}>
                    <DynamicIcon name={habit.icon} className="w-5 h-5" />
                  </div>

                  {/* Habit Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {habit.name}
                      </h3>
                      {habit.isPinned && (
                        <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Pinned
                        </span>
                      )}
                      {habit.isArchived && (
                        <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                          Archived
                        </span>
                      )}
                    </div>
                    {habit.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {habit.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 text-2xs text-slate-400">
                      <span className="font-semibold">{habit.category}</span>
                      <span>•</span>
                      <span>Target: {habit.targetValue} {habit.unit}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {streakRes.currentStreak}d (Best: {streakRes.longestStreak}d)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Quick Check + Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Quick toggle check for selected date */}
                  <button
                    onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCompletedToday
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isCompletedToday ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <span>Mark Done</span>
                    )}
                  </button>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinHabit(habit.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        habit.isPinned
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                      title={habit.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => duplicateHabit(habit.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                      title="Duplicate habit"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleArchiveHabit(habit.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                      title={habit.isArchived ? 'Unarchive' : 'Archive habit'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setEditingHabit(habit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Edit habit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setHabitToDelete(habit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => {
            const streakRes = calculateHabitStreak(habit, logs, selectedDate);
            const isCompletedToday = logs.some(
              (l) => l.habitId === habit.id && l.date === selectedDate && l.completed
            );
            const catColor = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.Other;

            return (
              <div
                key={habit.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${catColor.bg} ${catColor.text}`}>
                      <DynamicIcon name={habit.icon} className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePinHabit(habit.id)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          habit.isPinned ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingHabit(habit)}
                        className="p-1 rounded-md text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setHabitToDelete(habit)}
                        className="p-1 rounded-md text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 truncate">
                    {habit.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {habit.description || 'No description added.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-500" />
                    <span>{streakRes.currentStreak}d streak</span>
                  </div>

                  <button
                    onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCompletedToday
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {isCompletedToday ? 'Done' : 'Complete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={habitToDelete !== null}
        title="Delete Habit?"
        message={`Are you sure you want to delete "${habitToDelete?.name}"? You can restore recently deleted habits anytime from the top banner.`}
        confirmText="Delete Habit"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (habitToDelete) {
            deleteHabit(habitToDelete.id);
            setHabitToDelete(null);
          }
        }}
        onCancel={() => setHabitToDelete(null)}
      />
    </div>
  );
};
