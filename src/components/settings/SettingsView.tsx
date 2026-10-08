import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Bell,
  Volume2,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Check,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AccentColor, ThemeMode } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    exportDataCSV,
    resetAllData,
    setIsSheetsModalOpen,
    isGoogleAuthenticated,
    addToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRequestBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      addToast({
        type: 'warning',
        title: 'Not Supported',
        message: 'Browser notifications are not supported in this browser.',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      updateSettings({ browserNotifications: true });
      addToast({
        type: 'success',
        title: 'Notifications Allowed',
        message: 'You will receive reminders for scheduled habits and routines.',
      });
    } else {
      updateSettings({ browserNotifications: false });
      addToast({
        type: 'info',
        title: 'Notifications Denied',
        message: 'Permission was not granted.',
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize themes, calendar preferences, Google Sheets sync, and local data persistence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance & Theme */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Appearance & Visual Theme</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark' as ThemeMode, label: 'Dark Mode', icon: Moon },
                { id: 'light' as ThemeMode, label: 'Light Mode', icon: Sun },
                { id: 'system' as ThemeMode, label: 'System', icon: Laptop },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = settings.themeMode === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => updateSettings({ themeMode: t.id })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-2.5">
              {[
                { id: 'emerald' as AccentColor, color: '#10b981', label: 'Emerald' },
                { id: 'indigo' as AccentColor, color: '#6366f1', label: 'Indigo' },
                { id: 'violet' as AccentColor, color: '#8b5cf6', label: 'Violet' },
                { id: 'amber' as AccentColor, color: '#f59e0b', label: 'Amber' },
                { id: 'rose' as AccentColor, color: '#f43f5e', label: 'Rose' },
                { id: 'cyan' as AccentColor, color: '#06b6d4', label: 'Cyan' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateSettings({ accentColor: c.id })}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                    settings.accentColor === c.id ? 'ring-2 ring-offset-2 ring-emerald-500' : ''
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                >
                  {settings.accentColor === c.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date & Time Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Calendar & Formatting</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Week Starts On
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ weekStartDay: 1 })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    settings.weekStartDay === 1
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Monday (ISO)
                </button>
                <button
                  onClick={() => updateSettings({ weekStartDay: 0 })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    settings.weekStartDay === 0
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Sunday
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => updateSettings({ dateFormat: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs cursor-pointer"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Time Format
                </label>
                <select
                  value={settings.timeFormat}
                  onChange={(e) => updateSettings({ timeFormat: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs cursor-pointer"
                >
                  <option value="12h">12-Hour (AM/PM)</option>
                  <option value="24h">24-Hour (Military)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Google Sheets Sync Setting */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              <span>Google Sheets Integration</span>
            </h2>
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
            >
              Open Sync Center
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Continuously mirror habit records, streaks, and health statistics to Google Sheets spreadsheets with 4 auto-generated tabs.
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Connection Status:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {isGoogleAuthenticated ? 'Connected to Google' : 'Not Connected'}
              </span>
            </div>
            {settings.googleSheets.lastSyncedAt && (
              <div className="flex justify-between">
                <span className="text-slate-500">Last Synced:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {new Date(settings.googleSheets.lastSyncedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Sound */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Alerts & Reminders</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Browser Push Notifications</p>
                <p className="text-3xs text-slate-400">Receive system prompts when habit reminders fire</p>
              </div>
              <button
                onClick={handleRequestBrowserNotifications}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold cursor-pointer"
              >
                {settings.browserNotifications ? 'Enabled' : 'Request Permission'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sound Effects & Celebrations</p>
                <p className="text-3xs text-slate-400">Play pleasant audio chimes on milestone completions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Data Management: Export / Import / Backup / Reset (Spans full width) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-500" />
              <span>Data Portability, Backup & Reset</span>
            </h2>
            <span className="text-xs text-slate-400">100% Client-Side Privacy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Export JSON */}
            <button
              onClick={exportDataJSON}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Export JSON Backup</span>
              <span className="text-3xs text-slate-400">Full raw state backup file</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={exportDataCSV}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Export CSV Logs</span>
              <span className="text-3xs text-slate-400">Spreadsheet table logs</span>
            </button>

            {/* Import JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5 text-indigo-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Import JSON Backup</span>
              <span className="text-3xs text-slate-400">Restore from local file</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />

            {/* Reset Data */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-rose-500" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Reset Application</span>
              <span className="text-3xs text-rose-400">Restore default demo data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation modal before application reset */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Application Data?"
        message="This will reset all current habits, logs, and settings back to the initial sample state. Make sure you export a backup first if you have important progress."
        confirmText="Yes, Reset Everything"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          resetAllData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
