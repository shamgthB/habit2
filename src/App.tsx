import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { OnboardingModal } from './components/common/OnboardingModal';
import { HabitTemplatesModal } from './components/common/HabitTemplatesModal';
import { HabitFormModal } from './components/habits/HabitFormModal';
import { SheetsSyncModal } from './components/sheets/SheetsSyncModal';

// Section Views
import { DashboardView } from './components/dashboard/DashboardView';
import { HabitsView } from './components/habits/HabitsView';
import { CalendarView } from './components/calendar/CalendarView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { GoalsView } from './components/goals/GoalsView';
import { ChallengesView } from './components/challenges/ChallengesView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { RoutinesView } from './components/routines/RoutinesView';
import { FocusTimerView } from './components/focustimer/FocusTimerView';
import { MoodView } from './components/mood/MoodView';
import { HistoryView } from './components/history/HistoryView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { currentSection } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'habits':
        return <HabitsView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'goals':
        return <GoalsView />;
      case 'challenges':
        return <ChallengesView />;
      case 'achievements':
        return <AchievementsView />;
      case 'routines':
        return <RoutinesView />;
      case 'focustimer':
        return <FocusTimerView />;
      case 'mood':
        return <MoodView />;
      case 'history':
        return <HistoryView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all">
        {/* Top App Header */}
        <Navbar onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Section View */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
          {renderActiveSection()}
        </main>
      </div>

      {/* Persistent Mobile Bottom Navigation */}
      <BottomNav />

      {/* Modals & Dialogs */}
      <HabitFormModal />
      <GlobalSearchModal />
      <NotificationDrawer />
      <OnboardingModal />
      <HabitTemplatesModal />
      <SheetsSyncModal />

      {/* Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
