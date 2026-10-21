import React, { useState } from 'react';
import { BloodRequest, BloodGroup, Language } from '../../types';
import { getTranslation } from '../../utils/translations';
import { 
  Megaphone, 
  ChevronRight, 
  CheckCircle2, 
  Droplet, 
  HeartHandshake, 
  Hospital, 
  Share2, 
  MapPin, 
  Bell, 
  Calendar, 
  Search, 
  Clock, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  UserCheck, 
  Award,
  Phone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  LogIn
} from 'lucide-react';

interface DonorHomeViewProps {
  requests: BloodRequest[];
  lang: Language;
  onOpenSOSWizard: () => void;
  onOpenRegister: () => void;
  onOpenAuthModal?: () => void;
  onSelectRequest: (req: BloodRequest) => void;
  onQuickDonate: (req: BloodRequest) => void;
  onNavigateTab: (tab: any) => void;
}

interface MiniMapPin {
  id: string;
  name: string;
  group: BloodGroup;
  type: 'DONOR' | 'SOS' | 'HOSPITAL';
  distance: string;
  district: string;
  phone: string;
  x: number; // percentage
  y: number; // percentage
}

const MINI_MAP_PINS: MiniMapPin[] = [
  {
    id: 'pin-1',
    name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
    group: 'O-',
    type: 'SOS',
    distance: '১.২ কিমি',
    district: 'শাহবাগ, ঢাকা',
    phone: '+8801711223344',
    x: 52,
    y: 42,
  },
  {
    id: 'pin-2',
    name: 'কামাল হোসেন (প্রস্তুত রক্তদাতা)',
    group: 'B+',
    type: 'DONOR',
    distance: '১.৮ কিমি',
    district: 'ধানমন্ডি ২৭, ঢাকা',
    phone: '+8801822334455',
    x: 36,
    y: 50,
  },
  {
    id: 'pin-3',
    name: 'ফারজানা আক্তার (প্রস্তুত রক্তদাতা)',
    group: 'O-',
    type: 'DONOR',
    distance: '৩.২ কিমি',
    district: 'উত্তরা সেক্টর ৭, ঢাকা',
    phone: '+8801755667788',
    x: 56,
    y: 22,
  },
  {
    id: 'pin-4',
    name: 'বিএসএমএমইউ (পিজি হাসপাতাল)',
    group: 'A+',
    type: 'HOSPITAL',
    distance: '২.০ কিমি',
    district: 'বাংলামোটর, ঢাকা',
    phone: '+8801933445566',
    x: 64,
    y: 46,
  },
  {
    id: 'pin-5',
    name: 'তানভীর আহমেদ (জরুরি ডোনার)',
    group: 'AB-',
    type: 'DONOR',
    distance: '৪.১ কিমি',
    district: 'মিরপুর ১০, ঢাকা',
    phone: '+8801688990011',
    x: 32,
    y: 28,
  },
];

export const DonorHomeView: React.FC<DonorHomeViewProps> = ({
  requests,
  lang,
  onOpenSOSWizard,
  onOpenRegister,
  onOpenAuthModal,
  onSelectRequest,
  onQuickDonate,
  onNavigateTab,
}) => {
  const t = getTranslation(lang);
  const activeRequests = requests.filter((r) => r.status === 'ACTIVE');

  // Load registered user profile if exists
  const currentUser = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('bloodsearch_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }, []);

  const displayName = currentUser?.name || (lang === 'bn' ? 'রাকিব হাসান' : 'Rakib Hasan');
  const displayGroup = currentUser?.bloodGroup || 'B+';
  const displayPhoto = currentUser?.photoUrl;

  // Selected pin on Home Live Mini-Map
  const [selectedPin, setSelectedPin] = useState<MiniMapPin>(MINI_MAP_PINS[0]);

  // RSVP state for donor events
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({
    'ev-1': false,
    'ev-2': true,
    'ev-3': false,
  });

  const toggleRsvp = (id: string) => {
    setRsvps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto text-left pb-8">
      {/* 1. Top User Profile & Quick Login Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div 
          onClick={() => onNavigateTab('profile')}
          className="flex items-center gap-3 cursor-pointer group"
          title="প্রোফাইল দেখুন"
        >
          <div className="relative">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={displayName}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-rose-500/30 shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                <span>{displayGroup}</span>
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f172a]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <span>{lang === 'bn' ? 'স্বাগতম' : 'Welcome'} 👋</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {lang === 'bn' ? `● ${displayGroup} প্রস্তুত রক্তদাতা` : `● ${displayGroup} Ready Donor`}
              </span>
            </div>
            <h1 className="text-base font-black text-slate-900 dark:text-white leading-tight group-hover:text-rose-600 transition-colors">
              {displayName}
            </h1>
          </div>
        </div>

        {/* Top Right Quick Login Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1e293b] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors cursor-pointer shadow-xs"
            title="লগইন বা অ্যাকাউন্ট পরিচালনা"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{lang === 'bn' ? 'লগইন / একাউন্ট' : 'Login / Account'}</span>
          </button>
        </div>
      </div>

      {/* 2. Prominent Red Emergency Broadcast Banner */}
      <div
        onClick={onOpenSOSWizard}
        className="w-full rounded-2xl p-4 bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/25 flex items-center justify-between cursor-pointer group hover:opacity-95 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 block">
              {lang === 'bn' ? 'জরুরি রক্তের আবেদন' : 'EMERGENCY REQUEST'}
            </span>
            <h2 className="text-sm sm:text-base font-black tracking-tight leading-snug">
              {lang === 'bn' ? '১-ক্লিকে জরুরি আবেদন সম্প্রচার করুন' : 'Broadcast Blood Need to Donors'}
            </h2>
            <p className="text-xs text-rose-100 mt-0.5">
              {lang === 'bn' ? 'কাছের ৫ কিলোমিটারের রক্তদাতারা তৎক্ষণাৎ নোটিফিকেশন পাবেন' : 'Alert nearby donors within 5 km immediately'}
            </p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* 3. FRONT-AND-CENTER: Live Blood Donor & Hospital Radar Map (USER EXPLICITLY REQUESTED!) */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Map Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'লাইভ রক্তদাতা ও হাসপাতাল ম্যাপ' : 'Live Blood Donor & Hospital Map'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{lang === 'bn' ? 'সক্রিয় রাডার' : 'Radar Active'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'আপনার চারপাশে প্রস্তুত রক্তদাতা ও জরুরি কেন্দ্রের অবস্থান'
                  : 'Live positions of verified donors and emergency hospitals'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('map')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer whitespace-nowrap"
          >
            {lang === 'bn' ? 'পূর্ণাঙ্গ ম্যাপ →' : 'Full Map →'}
          </button>
        </div>

        {/* Interactive Mini-Map Canvas */}
        <div className="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-[#0c121e]">
          {/* Radar Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#e11d48_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-25" />
          
          {/* Radar Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-rose-500/20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-rose-500/10 pointer-events-none" />
          
          {/* Center User Location Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-blue-500/30 animate-pulse" />
            <span className="text-[9px] font-black text-blue-300 bg-slate-900/90 px-1.5 py-0.5 rounded mt-1 font-mono">
              {lang === 'bn' ? 'আপনার অবস্থান' : 'You'}
            </span>
          </div>

          {/* Map Pins */}
          {MINI_MAP_PINS.map((pin) => {
            const isSelected = selectedPin.id === pin.id;
            return (
              <div
                key={pin.id}
                onClick={() => setSelectedPin(pin)}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              >
                {/* Ping wave for SOS */}
                {pin.type === 'SOS' && (
                  <span className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
                )}

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-lg transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white ring-4 ring-white dark:ring-slate-900 scale-110 z-30'
                      : pin.type === 'SOS'
                      ? 'bg-red-600 text-white ring-2 ring-red-400'
                      : pin.type === 'DONOR'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-slate-800 text-white border border-slate-600'
                  }`}
                >
                  {pin.group}
                </div>

                {/* Distance pill on hover */}
                <span className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-white bg-black/90 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {pin.distance}
                </span>
              </div>
            );
          })}

          {/* Top-Right Active Count Pill */}
          <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-emerald-400 text-[10px] font-bold font-mono">
            {MINI_MAP_PINS.length}টি সক্রিয় পিন
          </div>
        </div>

        {/* Selected Pin Mini Info Card */}
        {selectedPin && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-sm ${
                  selectedPin.type === 'DONOR' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                <span>{selectedPin.group}</span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                  {selectedPin.name}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>{selectedPin.district}</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedPin.distance}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={`tel:${selectedPin.phone}`}
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'কল' : 'Call'}</span>
              </a>
              <button
                onClick={() => onNavigateTab('map')}
                className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                title="Open in Map"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Eligibility & Next Donation Cooldown Strip */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-sm rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              <span>{lang === 'bn' ? 'রক্তদানের জন্য প্রস্তুত' : 'Eligible to Donate'}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600 text-white dark:text-slate-900" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {lang === 'bn' ? 'সর্বশেষ রক্তদান: ৩ মাস পূর্বে · স্বাস্থ্য পরীক্ষায় উত্তীর্ণ' : 'Last donation: 3 months ago · Cleared'}
            </p>
          </div>
        </div>

        {/* Countdown Digits: 12 : 09 : 25 */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-[#0f172a] px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
          <div className="text-center font-mono">
            <span className="text-sm font-black text-slate-900 dark:text-white">12</span>
            <span className="text-[9px] text-slate-600 dark:text-slate-400 block font-bold -mt-1">{lang === 'bn' ? 'দিন' : 'Day'}</span>
          </div>
          <span className="text-slate-500 font-bold">:</span>
          <div className="text-center font-mono">
            <span className="text-sm font-black text-slate-900 dark:text-white">09</span>
            <span className="text-[9px] text-slate-600 dark:text-slate-400 block font-bold -mt-1">{lang === 'bn' ? 'ঘণ্টা' : 'Hrs'}</span>
          </div>
          <span className="text-slate-500 font-bold">:</span>
          <div className="text-center font-mono">
            <span className="text-sm font-black text-slate-900 dark:text-white">25</span>
            <span className="text-[9px] text-slate-600 dark:text-slate-400 block font-bold -mt-1">{lang === 'bn' ? 'মিনিট' : 'Min'}</span>
          </div>
        </div>
      </div>

      {/* 5. Quick Actions 4-Grid */}
      <div>
        <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          {lang === 'bn' ? 'দ্রুত সেবা' : 'Quick Actions'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={onOpenSOSWizard}
            className="p-3 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-sm hover:border-rose-500 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 fill-rose-600" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'রক্তের আবেদন' : 'Request Blood'}
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'bn' ? 'জরুরি রক্তের চাহিদা' : '1-Click SOS'}
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('search')}
            className="p-3 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-sm hover:border-emerald-500 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Find Donors'}
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'bn' ? '৬৪ জেলা ডিরেক্টরি' : '64 Districts'}
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('map')}
            className="p-3 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-sm hover:border-blue-500 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Hospital className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'হাসপাতাল ম্যাপ' : 'Nearby Hospitals'}
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'bn' ? 'জরুরি চিকিৎসা কেন্দ্র' : 'Emergency Centers'}
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('badges')}
            className="p-3 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-sm hover:border-amber-500 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আমার ব্যাজ' : 'My Badges'}
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'bn' ? 'রক্তদান সম্মাননা' : 'Awards & Level'}
            </span>
          </button>
        </div>
      </div>

      {/* 6. Blood Type Inventory Progress Rings */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'রক্তের গ্রুপ ও মজুদের অবস্থা' : 'Blood Type Inventory'}
          </div>
          <button
            onClick={() => onNavigateTab('search')}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            {lang === 'bn' ? 'সব দেখুন' : 'See all'}
          </button>
        </div>

        {/* 3 Circular Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: A+ 85% High Stock */}
          <div 
            onClick={() => onNavigateTab('search')}
            className="p-3.5 rounded-2xl bg-gradient-to-b from-red-600 to-rose-700 text-white shadow-md flex flex-col items-center text-center cursor-pointer hover:scale-[1.01] transition-all"
          >
            <span className="text-lg font-black">A+</span>
            <div className="relative w-12 h-12 my-1.5 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeDasharray="85, 100" />
              </svg>
              <span className="absolute font-mono font-bold text-[10px]">85%</span>
            </div>
            <span className="text-[10px] font-black text-rose-100 uppercase tracking-tight">
              {lang === 'bn' ? 'মজুদ বেশি' : 'High'}
            </span>
          </div>

          {/* Card 2: B- 12% Critical */}
          <div 
            onClick={() => onNavigateTab('search')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1e293b] border-2 border-red-500 shadow-sm flex flex-col items-center text-center cursor-pointer hover:scale-[1.01] transition-all"
          >
            <span className="text-lg font-black text-slate-900 dark:text-white">B-</span>
            <div className="relative w-12 h-12 my-1.5 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="12, 100" />
              </svg>
              <span className="absolute font-mono font-bold text-[10px] text-red-600 dark:text-red-400">12%</span>
            </div>
            <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight">
              {lang === 'bn' ? 'জরুরি সংকট' : 'Critical'}
            </span>
          </div>

          {/* Card 3: O+ 95% Sufficient */}
          <div 
            onClick={() => onNavigateTab('search')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-sm flex flex-col items-center text-center cursor-pointer hover:scale-[1.01] transition-all"
          >
            <span className="text-lg font-black text-slate-900 dark:text-white">O+</span>
            <div className="relative w-12 h-12 my-1.5 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="95, 100" />
              </svg>
              <span className="absolute font-mono font-bold text-[10px] text-emerald-600 dark:text-emerald-400">95%</span>
            </div>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
              {lang === 'bn' ? 'পর্যাপ্ত' : 'Sufficient'}
            </span>
          </div>
        </div>
      </div>

      {/* 7. Active Requests Near You */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'নিকটস্থ জরুরি রক্তের আবেদনসমূহ' : 'Active Requests Near You'}
          </div>
          <button
            onClick={() => onNavigateTab('requests')}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            {lang === 'bn' ? 'সকল আবেদন' : 'See all'}
          </button>
        </div>

        <div className="space-y-2.5">
          {activeRequests.slice(0, 3).map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-sm rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-400 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex flex-col items-center justify-center text-white font-black text-base shadow-sm shrink-0">
                  <span>{req.bloodGroup}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {req.hospitalName}
                    </h3>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        req.urgency === 'CRITICAL'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {req.urgency === 'CRITICAL' ? (lang === 'bn' ? 'জীবন-মরণ জরুরি' : 'CRITICAL') : req.urgency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{req.district} (১.২ কিমি)</span>
                    </span>
                    <span>·</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {req.unitsNeeded - req.unitsCollected} ব্যাগ প্রয়োজন
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => onQuickDonate(req)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer whitespace-nowrap"
                >
                  {lang === 'bn' ? 'আমি রক্ত দেব' : 'Donate Now'}
                </button>
                <button
                  onClick={() => onSelectRequest(req)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Donor Events & Campaigns */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'রক্তদান ক্যাম্প ও ইভেন্ট' : 'Donor Events'}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
            {lang === 'bn' ? '৩টি আসন্ন ক্যাম্প' : '3 Upcoming'}
          </span>
        </div>

        <div className="space-y-2">
          {[
            {
              id: 'ev-1',
              dateNum: '২৮',
              dateMonth: 'অক্টো',
              title: 'ঢাকা মেডিকেল সিটি রক্তদান ড্রাইভ',
              time: 'সকাল ৯:০০ - বিকাল ৪:০০',
              location: 'কার্জন হল চত্বর, ঢাকা বিশ্ববিদ্যালয়',
            },
            {
              id: 'ev-2',
              dateNum: '২৮',
              dateMonth: 'অক্টো',
              title: 'মেট্রো হেলথ রক্তদান মেলা',
              time: 'সকাল ১০:০০ - বিকাল ৫:০০',
              location: 'চট্টগ্রাম মেডিকেল কলেজ অডিটোরিয়াম',
            },
            {
              id: 'ev-3',
              dateNum: '৩১',
              dateMonth: 'অক্টো',
              title: 'কমিউনিটি ডোনার ডে',
              time: 'সকাল ৯:০০ - দুপুর ৩:০০',
              location: 'ওসমানী মেডিকেল কলেজ কমপ্লেক্স, সিলেট',
            },
          ].map((event) => {
            const isRsvpd = rsvps[event.id];
            return (
              <div
                key={event.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3 hover:border-rose-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-black uppercase">{event.dateMonth}</span>
                    <span className="text-sm font-black font-mono leading-none">{event.dateNum}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {event.title}
                    </h4>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {event.time}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleRsvp(event.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isRsvpd
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                  }`}
                >
                  {isRsvpd ? (lang === 'bn' ? 'নিশ্চিত ✓' : 'Joined ✓') : 'RSVP'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
