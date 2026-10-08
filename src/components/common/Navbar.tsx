import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  FileSpreadsheet,
  Flame,
  Zap,
  Menu,
} from 'lucide-react';
import { getLevelForXp } from '../../utils/calculations';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const {
    profile,
    lifeScore,
    globalStreak,
    reminders,
    settings,
    updateSettings,
    setIsSearchModalOpen,
    setIsNotificationDrawerOpen,
    setIsSheetsModalOpen,
    setCurrentSection,
  } = useApp();

  const levelInfo = getLevelForXp(profile.xp);
  const pendingRemindersCount = reminders.filter((r) => r.status === 'upcoming').length;

  const toggleTheme = () => {
    const next = settings.themeMode === 'dark' ? 'light' : 'dark';
    updateSettings({ themeMode: next });
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger + Search Trigger */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-400 text-xs transition-all cursor-pointer group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          <span className="hidden sm:inline">Search habits, goals, challenges...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="hidden sm:inline-block font-mono text-2xs px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Stats, Google Sheets, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Streak Badge */}
        <div
          title={`Current streak: ${globalStreak.currentStreak} days`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-xs"
        >
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span>{globalStreak.currentStreak}d</span>
        </div>

        {/* Life Score Badge */}
        <button
          onClick={() => setCurrentSection('analytics')}
          title="Overall Life Score - click to inspect breakdown"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-500/20 transition-colors cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Life Score: {lifeScore.overallScore}/100</span>
        </button>

        {/* Level / XP Progress Pill */}
        <button
          onClick={() => setCurrentSection('profile')}
          className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Lv.{levelInfo.level} {levelInfo.title}</span>
          <span className="text-slate-400 text-2xs">({profile.xp} XP)</span>
        </button>

        {/* Google Sheets Trigger */}
        <button
          onClick={() => setIsSheetsModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          title="Google Sheets Backup & Sync"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden xl:inline">Google Sheets</span>
        </button>

        {/* Reminders / Notifications Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {pendingRemindersCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {settings.themeMode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => setCurrentSection('profile')}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          aria-label="View profile"
        >
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/60 transition-all"
          />
        </button>
      </div>
    </header>
  );
};
