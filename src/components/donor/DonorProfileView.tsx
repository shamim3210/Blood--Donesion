import React, { useState } from 'react';
import { Donor, Language, HealthConditions } from '../../types';
import { getTranslation } from '../../utils/translations';
import { 
  User, 
  Edit3, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Award,
  Sparkles,
  X,
  Lock,
  FileCheck
} from 'lucide-react';
import { PrivacyPolicyModal } from '../ecosystem/PrivacyPolicyModal';

interface DonorProfileViewProps {
  lang: Language;
  onOpenRegister?: () => void;
}

export const DonorProfileView: React.FC<DonorProfileViewProps> = ({ lang, onOpenRegister }) => {
  const t = getTranslation(lang);

  // Load custom registered profile if exists
  const currentUser = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('bloodsearch_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }, []);

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(currentUser?.availableToDonate ?? true);

  // Health condition toggles matching Reference Image 1!
  const [healthConditions, setHealthConditions] = useState<HealthConditions>({
    nonAlcoholic: true,
    hivNegative: true,
    rheumaticFeverNegative: true,
    covidNegative: true,
    thalassemiaNegative: true,
    hepatitisNegative: true,
    normalBloodPressure: true,
  });

  const toggleCondition = (key: keyof HealthConditions) => {
    setHealthConditions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const displayName = currentUser?.name || 'Hafizur Rahman (হাফিজুর)';
  const displayPhone = currentUser?.phone || '01674366959';
  const displayEmail = currentUser?.email || 'hafiz@gmail.com';
  const displayGroup = currentUser?.bloodGroup || 'A+';
  const displayAvatar = currentUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80';
  const displayId = currentUser?.idCardNumber || 'BD-2026-7821-A+';

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-8 text-left">
      {/* Profile Card Header (matching Image 1) */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm transition-all text-center relative">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'bn' ? 'ডোনার প্রোফাইল' : 'Donor Info'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold cursor-pointer"
              title="Google Play Safety"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'bn' ? 'পলিসি' : 'Privacy'}</span>
            </button>
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-rose-500" />
              <span>QR Profile</span>
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="relative w-22 h-22 sm:w-24 sm:h-24 mx-auto my-3">
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-full h-full object-cover rounded-3xl ring-4 ring-rose-500/20 shadow-xl"
          />
          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-900 shadow">
            ✓
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          {displayName}
        </h2>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate px-2">
          {displayEmail} · {displayPhone}
        </div>
        <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">
          স্মার্ট কার্ড নং: {displayId}
        </div>

        {onOpenRegister && (
          <div className="mt-3">
            <button
              onClick={onOpenRegister}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              + নতুন ফটো দিয়ে স্মার্ট আইডি তৈরি করুন
            </button>
          </div>
        )}

        {/* 4 Metric Tiles matching Reference Image 1 */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Group</span>
            <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">{displayGroup}</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Gender</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Male</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Donated</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-slate-200">6 bags</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Age</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-slate-200">28y</span>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="mt-4 pt-3 flex items-center justify-between px-1">
          <div className="text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {lang === 'bn' ? 'রক্তদানে সক্রিয় উপস্থিতি' : 'Available for Emergency Donation'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isAvailable ? 'Visible to nearby patients in emergency' : 'Resting / Cooldown mode'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              isAvailable ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Health Condition Verified Checklist matching Image 1 */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {lang === 'bn' ? 'স্বাস্থ্যগত মানদণ্ড' : 'Health Conditions'}
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {lang === 'bn' ? 'চিকিৎসাগত নির্দেশিকা অনুযায়ী নিরাপত্তা যাচাই' : 'Clinical safety verification parameters'}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            100% Fit
          </span>
        </div>

        {/* 7 Switches matching Reference Image 1 */}
        <div className="space-y-3 pt-1">
          {[
            { id: 'nonAlcoholic' as const, label: lang === 'bn' ? 'মদ্যপানমুক্ত (Non-alcoholic)' : 'Non-alcoholic' },
            { id: 'hivNegative' as const, label: lang === 'bn' ? 'এইচআইভি নেগেটিভ (HIV negative)' : 'HIV negative' },
            { id: 'rheumaticFeverNegative' as const, label: lang === 'bn' ? 'বাতজ্বর মুক্ত (No Rheumatic fever)' : 'Rheumatic fever negative' },
            { id: 'covidNegative' as const, label: lang === 'bn' ? 'কোভিড নেগেটিভ (COVID negative)' : 'COVID negative' },
            { id: 'thalassemiaNegative' as const, label: lang === 'bn' ? 'থ্যালাসেমিয়ামুক্ত (No Thalassemia)' : 'Thalassemia negative' },
            { id: 'hepatitisNegative' as const, label: lang === 'bn' ? 'হেপাটাইটিস নেগেটিভ (Hepatitis negative)' : 'Hepatitis negative' },
            { id: 'normalBloodPressure' as const, label: lang === 'bn' ? 'স্বাভাবিক রক্তচাপ (Normal blood pressure)' : 'Normal blood-pressure' },
          ].map((item) => {
            const isChecked = healthConditions[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCondition(item.id)}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 transition-all"
              >
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.label}
                </span>
                <div
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    isChecked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform shadow ${
                      isChecked ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Profile Modal */}
      {isQrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1e293b] p-6 shadow-2xl border border-slate-300 dark:border-slate-700 text-center space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Hospital Check-In QR Pass
              </h3>
              <button
                onClick={() => setIsQrOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated QR Code Canvas */}
            <div className="p-5 bg-white rounded-2xl shadow-inner border border-slate-200 inline-block">
              <div className="w-48 h-48 bg-slate-950 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center">
                    <div className="w-6 h-6 bg-slate-950" />
                  </div>
                  <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center">
                    <div className="w-6 h-6 bg-slate-950" />
                  </div>
                </div>
                <div className="text-center font-mono text-[9px] text-white">
                  BLOODSEARCH-ID-884729
                </div>
                <div className="flex justify-between">
                  <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center">
                    <div className="w-6 h-6 bg-slate-950" />
                  </div>
                  <div className="w-8 h-8 bg-rose-500 rounded flex items-center justify-center text-white font-black text-xs">
                    A+
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Hafizur Rahman · Blood Group A+
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Scan at hospital reception or blood transfusion unit for instant verification without paper forms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Play Safety & Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        lang={lang}
      />
    </div>
  );
};
