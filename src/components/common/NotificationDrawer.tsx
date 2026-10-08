import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, Check, Clock, AlertCircle } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    reminders,
    toggleReminderStatus,
  } = useApp();

  if (!isNotificationDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Reminders & Alerts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Today's scheduled check-ins</p>
              </div>
            </div>
            <button
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {reminders.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No active reminders</p>
                <p className="text-xs text-slate-400 mt-1">Configure habit reminders in settings</p>
              </div>
            ) : (
              reminders.map((rem) => {
                const isDone = rem.status === 'completed';
                const isMissed = rem.status === 'missed';

                return (
                  <div
                    key={rem.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                        : isMissed
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {rem.time}
                          </span>
                          <h4 className={`text-sm font-semibold truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                            {rem.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          {rem.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleReminderStatus(rem.id, isDone ? 'upcoming' : 'completed')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                          title={isDone ? 'Mark as upcoming' : 'Mark completed'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
