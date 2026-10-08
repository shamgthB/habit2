import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Plus, Sparkles, X, Check, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_COLORS } from '../common/Icons';

export interface HabitLocation {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  habitName: string;
}

export const HabitLocationsMap: React.FC = () => {
  const { habits } = useApp();
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDa6fWNx6AXgfI03auWsynQW6svrAIWa0E';

  // Sample habit execution locations across cities with coordinates
  const [locations, setLocations] = useState<HabitLocation[]>([
    {
      id: 'loc-1',
      name: 'Equinox Fitness Sanctuary',
      category: 'Fitness',
      address: '757 Market St, San Francisco, CA',
      lat: 37.7868,
      lng: -122.4048,
      habitName: 'Daily Workout & Movement',
    },
    {
      id: 'loc-2',
      name: 'San Francisco Public Library',
      category: 'Study',
      address: '100 Larkin St, San Francisco, CA',
      lat: 37.7793,
      lng: -122.4160,
      habitName: 'Deep Work & Focus Session',
    },
    {
      id: 'loc-3',
      name: 'Golden Gate Park Meditation Meadow',
      category: 'Mindfulness',
      address: 'Conservatory of Flowers, San Francisco, CA',
      lat: 37.7725,
      lng: -122.4608,
      habitName: 'Morning Meditation & Breathwork',
    },
    {
      id: 'loc-4',
      name: 'Philz Coffee Focus Corner',
      category: 'Productivity',
      address: '201 Berry St, San Francisco, CA',
      lat: 37.7766,
      lng: -122.3942,
      habitName: 'Read Non-Fiction Book',
    },
  ]);

  const [selectedLocation, setSelectedLocation] = useState<HabitLocation | null>(locations[0]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  // Add location form state
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocHabit, setNewLocHabit] = useState(habits[0]?.name || 'Daily Workout');
  const [newLocCategory, setNewLocCategory] = useState('Fitness');
  const [newLocLat, setNewLocLat] = useState('37.7749');
  const [newLocLng, setNewLocLng] = useState('-122.4194');

  const filteredLocations = locations.filter((loc) => {
    if (selectedCategoryFilter === 'All') return true;
    return loc.category === selectedCategoryFilter;
  });

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    const newLoc: HabitLocation = {
      id: `loc-${Date.now()}`,
      name: newLocName.trim(),
      address: newLocAddress.trim() || 'Custom Location',
      category: newLocCategory,
      habitName: newLocHabit,
      lat: parseFloat(newLocLat) || 37.7749,
      lng: parseFloat(newLocLng) || -122.4194,
    };

    setLocations([...locations, newLoc]);
    setSelectedLocation(newLoc);
    setIsAddLocationOpen(false);
    setNewLocName('');
    setNewLocAddress('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Habit Places & Activity Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pin and explore the real-world environments where your rituals, workouts, and study blocks happen
          </p>
        </div>

        <button
          onClick={() => setIsAddLocationOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Pin New Place</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Fitness', 'Study', 'Mindfulness', 'Productivity', 'Health'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryFilter === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Map + Places List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Google Map (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-900 min-h-[480px] h-[520px] relative">
          <APIProvider apiKey={mapsApiKey}>
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={{ lat: 37.7785, lng: -122.425 }}
              defaultZoom={13}
              gestureHandling="greedy"
              disableDefaultUI={false}
              style={{ width: '100%', height: '100%' }}
            >
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                const pinColor = CATEGORY_COLORS[loc.category]?.accent || '#10b981';

                return (
                  <AdvancedMarker
                    key={loc.id}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    onClick={() => setSelectedLocation(loc)}
                  >
                    <Pin
                      background={pinColor}
                      glyphColor="#ffffff"
                      borderColor="#ffffff"
                      scale={isSelected ? 1.25 : 1.0}
                    />
                  </AdvancedMarker>
                );
              })}

              {selectedLocation && (
                <InfoWindow
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  onCloseClick={() => setSelectedLocation(null)}
                >
                  <div className="p-1 max-w-xs text-slate-900">
                    <span className="text-3xs uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {selectedLocation.category}
                    </span>
                    <h4 className="font-bold text-sm mt-1">{selectedLocation.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedLocation.address}</p>
                    <p className="text-2xs font-semibold text-emerald-700 mt-1">
                      Habit: {selectedLocation.habitName}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </div>

        {/* Places List & Inspector (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Pinned Locations ({filteredLocations.length})</span>
              </h3>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {loc.name}
                      </span>
                      <span className="text-3xs font-mono font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {loc.category}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 mt-1">{loc.address}</p>
                    <div className="mt-2 text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Linked: {loc.habitName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-3xs text-slate-400">
            Powered by Google Maps Platform Advanced Markers & Geocoding.
          </div>
        </div>
      </div>

      {/* Add Location Modal */}
      {isAddLocationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pin Habit Location</h3>
              <button
                onClick={() => setIsAddLocationOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Place Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  placeholder="e.g. Golds Gym Downtown"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address / Description
                </label>
                <input
                  type="text"
                  value={newLocAddress}
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  placeholder="e.g. 500 Market St"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newLocCategory}
                    onChange={(e) => setNewLocCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs cursor-pointer"
                  >
                    <option value="Fitness">Fitness</option>
                    <option value="Study">Study</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Linked Habit
                  </label>
                  <select
                    value={newLocHabit}
                    onChange={(e) => setNewLocHabit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs cursor-pointer"
                  >
                    {habits.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={newLocLat}
                    onChange={(e) => setNewLocLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={newLocLng}
                    onChange={(e) => setNewLocLng(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLocationOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  Pin Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
