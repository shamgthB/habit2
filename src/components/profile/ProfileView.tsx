import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Edit2,
  Save,
  Zap,
  Flame,
  CheckCircle2,
  Trophy,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { getLevelForXp } from '../../utils/calculations';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, globalStreak, achievements, logs } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);

  const levelInfo = getLevelForXp(profile.xp);
  const totalCompletedHabits = logs.filter((l) => l.completed).length;

  const handleSave = () => {
    updateProfile({
      name: name.trim() || 'Alex',
      username: username.trim() || '@alex',
      bio: bio.trim(),
      avatar: avatar.trim() || profile.avatar,
    });
    setIsEditing(false);
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage identity, level mastery status, and personal consistency credentials
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md"
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {profile.name}
              </h2>
              <span className="text-xs font-mono text-slate-400">{profile.username}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              {profile.bio}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-2xs text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(profile.joinedDate).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                Lv.{levelInfo.level} {levelInfo.title}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer self-center sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Edit Form (if toggled) */}
      {isEditing && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Edit Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Username Handle</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Personal Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Choose Avatar</label>
            <div className="flex items-center gap-3">
              {sampleAvatars.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-12 h-12 rounded-2xl overflow-hidden ring-2 transition-all cursor-pointer ${
                    avatar === av ? 'ring-emerald-500 scale-105' : 'ring-transparent opacity-70'
                  }`}
                >
                  <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Lifetime Stats Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center">
          <Zap className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {profile.xp}
          </span>
          <span className="block text-3xs font-bold uppercase text-slate-400 mt-1">Total XP Earned</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {totalCompletedHabits}
          </span>
          <span className="block text-3xs font-bold uppercase text-slate-400 mt-1">Completed Habits</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center">
          <Flame className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {globalStreak.bestStreak}d
          </span>
          <span className="block text-3xs font-bold uppercase text-slate-400 mt-1">Longest Streak</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {achievements.filter((a) => a.unlockedAt).length}
          </span>
          <span className="block text-3xs font-bold uppercase text-slate-400 mt-1">Unlocked Badges</span>
        </div>
      </div>
    </div>
  );
};
