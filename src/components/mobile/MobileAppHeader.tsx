import React, { useState } from 'react';
import { ActiveTab, Language } from '../../types';
import { 
  Wifi, 
  Battery, 
  Signal, 
  ChevronLeft, 
  Search, 
  Bell, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Users, 
  SlidersHorizontal,
  Flame,
  Droplet,
  FileText,
  Activity,
  Sparkles,
  PhoneCall,
  Lock
} from 'lucide-react';
import { PrivacyPolicyModal } from '../ecosystem/PrivacyPolicyModal';

interface MobileAppHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSOSModal: () => void;
  onOpenAuthModal: () => void;
  onOpenFamilyModal: () => void;
  onOpenArchitectureModal: () => void;
  onOpenSlideDeck: () => void;
}

export const MobileAppHeader: React.FC<MobileAppHeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  onOpenSOSModal,
  onOpenAuthModal,
  onOpenFamilyModal,
  onOpenArchitectureModal,
  onOpenSlideDeck,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Screen title based on active tab
  const getScreenTitle = () => {
    switch (activeTab) {
      case 'onboarding':
        return lang === 'bn' ? 'ব্লাড হেল্প (Blood Help)' : 'Blood Help';
      case 'search':
        return lang === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Find Donors';
      case 'requests':
        return lang === 'bn' ? 'জরুরি আবেদন' : 'SOS Requests';
      case 'chat':
        return lang === 'bn' ? 'ইনবক্স ও চ্যাট' : 'Messages';
      case 'badges':
        return lang === 'bn' ? 'আমার ব্যাজ (My Badges)' : 'My Badges';
      case 'profile':
        return lang === 'bn' ? 'ডোনার প্রোফাইল' : 'Donor Profile';
      case 'map':
        return lang === 'bn' ? 'হাসপাতাল ম্যাপ' : 'Nearby Hospitals';
      case 'compatibility':
        return lang === 'bn' ? 'রক্তের গ্রুপ মিল' : 'Compatibility Matrix';
      case 'eligibility':
        return lang === 'bn' ? 'যোগ্যতা যাচাই' : 'Donor Eligibility';
      case 'security':
        return lang === 'bn' ? 'সিকিউরিটি অডিট' : 'Security Engine';
      case 'admin':
        return lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel';
      default:
        return 'BloodSearch';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 transition-colors select-none">
      {/* 1. Authentic Mobile Status Bar (9:41, 5G, Wi-Fi, 100% Battery) */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1 text-xs text-slate-800 dark:text-slate-200 font-semibold font-mono tracking-tight">
        <span>09:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 fill-current" />
          <span className="text-[10px] font-black font-sans">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-sans font-bold">100%</span>
            <Battery className="w-4 h-4 fill-current text-emerald-500" />
          </div>
        </div>
      </div>

      {/* 2. Top Mobile App Bar */}
      <div className="flex items-center justify-between px-4 h-13">
        {activeTab === 'home' ? (
          /* Home Mode Branding */
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-black shadow-md shadow-rose-600/30">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-black text-sm text-slate-900 dark:text-white block leading-none tracking-tight">
                BloodSearch
              </span>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mt-0.5">
                {lang === 'bn' ? 'রক্ত সন্ধান · বাংলাদেশ' : 'Emergency Blood Network'}
              </span>
            </div>
          </div>
        ) : (
          /* Sub-Screen Back Navigation Bar */
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className="p-1.5 -ml-1 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {lang === 'bn' ? 'ফিরে যান' : 'Back'}
              </span>
            </button>
            <h2 className="font-black text-sm text-slate-900 dark:text-white truncate max-w-[170px]">
              {getScreenTitle()}
            </h2>
          </div>
        )}

        {/* Action Buttons on Right */}
        <div className="flex items-center gap-1.5">
          {/* Prominent Login Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
            title="লগইন / ওটিপি অ্যাকাউন্ট"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'লগইন' : 'Login'}</span>
          </button>

          {/* Search Quick Tab */}
          <button
            onClick={() => setActiveTab('search')}
            title="Search Donors"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'search'
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Notification / Chat Tab */}
          <button
            onClick={() => setActiveTab('chat')}
            title="Chat & Messages"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          </button>

          {/* Mobile Drawer Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            title="App Menu & Settings"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Slide-Down Quick Menu Sheet */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-xl">
          {/* Quick Language & Theme Toggles */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700">
            {/* Language Switch */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#0f172a] p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLang('bn')}
                className={`px-2 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                  lang === 'bn'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                  lang === 'en'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                EN
              </button>
            </div>

            {/* Dark / Light Mode Switch (Clean solid high contrast) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Menu Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('search');
                setIsMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-left text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer hover:border-rose-400"
            >
              <Search className="w-4 h-4 text-rose-600" />
              <span>{lang === 'bn' ? 'রক্তদাতা তালিকা' : 'Donor Directory'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('map');
                setIsMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-left text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer hover:border-blue-400"
            >
              <Activity className="w-4 h-4 text-blue-600" />
              <span>{lang === 'bn' ? 'হাসপাতাল ম্যাপ' : 'Hospital Map'}</span>
            </button>

            <button
              onClick={() => {
                onOpenFamilyModal();
                setIsMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-left text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer hover:border-emerald-400"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'ফ্যামিলি ও ভলান্টিয়ার' : 'Volunteers'}</span>
            </button>

            <button
              onClick={() => {
                onOpenAuthModal();
                setIsMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-left text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer hover:border-indigo-400"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'bn' ? 'অ্যাকাউন্ট সিকিউরিটি' : 'Auth & OTP'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('admin');
                setIsMenuOpen(false);
              }}
              className="col-span-2 p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 text-left flex items-center justify-between cursor-pointer hover:border-amber-400 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="font-black text-xs">{lang === 'bn' ? 'অ্যাডমিন প্যানেল (মাস্টার পিন আবশ্যক)' : 'Admin Panel (PIN Protected)'}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                ROOT PIN
              </span>
            </button>
          </div>

          {/* Action Row */}
          <div className="pt-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onOpenSlideDeck();
                  setIsMenuOpen(false);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? '📄 মূল PDF প্রেজেন্টেশন (৮ স্লাইড)' : '📄 View 8 PDF Slides'}</span>
              </button>

              <button
                onClick={() => {
                  onOpenArchitectureModal();
                  setIsMenuOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
              >
                Flutter Specs
              </button>
            </div>

            {/* Google Play Store & Privacy Policy Compliance Button */}
            <button
              onClick={() => {
                setIsPrivacyOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? '🔒 গুগল প্লে স্টোর ও হেলথ ডাটা প্রাইভেসী পলিসি' : '🔒 Google Play Safety & Privacy Policy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Google Play Compliance Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        lang={lang}
      />
    </header>
  );
};
