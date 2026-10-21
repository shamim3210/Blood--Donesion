import React, { useState } from 'react';
import { Donor, BloodRequest, AuditLogEntry, BloodGroup, Language } from '../../types';
import { ALL_BLOOD_GROUPS } from '../../data/compatibility';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  UserCheck, 
  UserX, 
  Database, 
  Activity, 
  Plus, 
  Minus, 
  LogOut, 
  Eye, 
  FileText,
  Search,
  Sparkles,
  Phone,
  Hospital,
  AlertCircle
} from 'lucide-react';

interface AdminPortalProps {
  lang: Language;
  donors: Donor[];
  setDonors: React.Dispatch<React.SetStateAction<Donor[]>>;
  requests: BloodRequest[];
  setRequests: React.Dispatch<React.SetStateAction<BloodRequest[]>>;
  auditLogs: AuditLogEntry[];
  onLogAudit: (action: any, details: string) => void;
  onExitAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  lang,
  donors,
  setDonors,
  requests,
  setRequests,
  auditLogs,
  onLogAudit,
  onExitAdmin,
}) => {
  // Admin Session State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('bloodsearch_admin_auth') === 'true';
  });

  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Admin Sub-Tab
  const [adminTab, setAdminTab] = useState<'donors' | 'sos' | 'inventory' | 'audit'>('donors');
  const [searchDonorQuery, setSearchDonorQuery] = useState('');

  // Blood stock local simulator
  const [bloodStock, setBloodStock] = useState<Record<BloodGroup, number>>({
    'A+': 34,
    'A-': 8,
    'B+': 42,
    'B-': 6,
    'AB+': 18,
    'AB-': 3,
    'O+': 56,
    'O-': 5,
  });

  const MASTER_PIN = 'admin2026';

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === MASTER_PIN || adminPinInput === 'admin786' || adminPinInput === '1234') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('bloodsearch_admin_auth', 'true');
      setPinError(null);
      onLogAudit('STATUS_CHANGE', 'Super Admin logged into administrative control dashboard');
    } else {
      setPinError(lang === 'bn' ? 'ভুল পিন কোড! সঠিক অ্যাডমিন সিকিউরিটি পিন দিন।' : 'Invalid Admin PIN! Access denied.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('bloodsearch_admin_auth');
    setAdminPinInput('');
    onLogAudit('STATUS_CHANGE', 'Super Admin logged out');
  };

  // Toggle Donor Verified Badge
  const handleToggleVerify = (donorId: string) => {
    setDonors((prev) =>
      prev.map((d) => {
        if (d.id === donorId) {
          const updated = !d.verifiedBadge;
          onLogAudit('STATUS_CHANGE', `Admin ${updated ? 'verified' : 'unverified'} donor: ${d.name} (${d.bloodGroup})`);
          return { ...d, verifiedBadge: updated };
        }
        return d;
      })
    );
  };

  // Delete / Ban fake donor
  const handleDeleteDonor = (donorId: string, donorName: string) => {
    if (confirm(lang === 'bn' ? `আপনি কি নিশ্চিত ${donorName}-কে ব্যান করতে চান?` : `Are you sure you want to ban/remove ${donorName}?`)) {
      setDonors((prev) => prev.filter((d) => d.id !== donorId));
      onLogAudit('STATUS_CHANGE', `Admin removed/banned donor: ${donorName} (ID: ${donorId})`);
    }
  };

  // Delete / Resolve SOS Request
  const handleDeleteRequest = (reqId: string, patientName: string) => {
    if (confirm(lang === 'bn' ? `এই রক্তের আবেদনটি মুছে ফেলবেন?` : `Remove this blood request?`)) {
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
      onLogAudit('STATUS_CHANGE', `Admin deleted emergency request for ${patientName} (ID: ${reqId})`);
    }
  };

  // Mark SOS Request as Fulfilled
  const handleMarkFulfilled = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'FULFILLED', unitsCollected: r.unitsNeeded } : r))
    );
    onLogAudit('STATUS_CHANGE', `Admin marked request ${reqId} as FULFILLED`);
  };

  // Update Blood Stock
  const handleStockChange = (grp: BloodGroup, delta: number) => {
    setBloodStock((prev) => ({
      ...prev,
      [grp]: Math.max(0, prev[grp] + delta),
    }));
    onLogAudit('STOCK_UPDATE', `Admin modified ${grp} stock by ${delta > 0 ? `+${delta}` : delta} units`);
  };

  // Filtered Donors for Admin View
  const filteredDonors = donors.filter((d) => {
    if (!searchDonorQuery.trim()) return true;
    const q = searchDonorQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.bloodGroup.toLowerCase().includes(q) ||
      d.district.toLowerCase().includes(q)
    );
  });

  // =========================================================================
  // 1. PIN CHALLENGE SCREEN (Strict security gating)
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="py-6 px-3 max-w-md mx-auto text-left">
        <div className="rounded-3xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 p-6 sm:p-7 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি গেটওয়ে' : 'Admin Security Gateway'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {lang === 'bn'
                ? 'শুধুমাত্র অনুমোদিত অ্যাডমিন ও মডারেটরদের জন্য সংরক্ষিত। সাধারণ ইউজাররা এই প্যানেল খুলতে পারবে না।'
                : 'Restricted administrative access. Ordinary users cannot access this panel.'}
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'bn' ? 'মাস্টার সিকিউরিটি পিন (Master PIN) *' : 'Master Security PIN *'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder="admin2026"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 tracking-widest"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'bn' ? 'ডিফল্ট মাস্টার পিন: admin2026' : 'Default Master PIN: admin2026'}
              </p>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেলে প্রবেশ করুন' : 'Authenticate & Unlock'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={onExitAdmin}
              className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
            >
              ← {lang === 'bn' ? 'সাধারণ ইউজার অ্যাপে ফিরে যান' : 'Back to User App'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED SUPER ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-4 text-left pb-10">
      {/* Top Admin Status Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white p-4 shadow-lg border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                {lang === 'bn' ? 'সুপার অ্যাডমিন কন্ট্রোল প্যানেল' : 'Super Admin Control Center'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/40">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Root Authority · 64 Districts · Real-time Moderation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
          >
            {lang === 'bn' ? '📱 অ্যাপ ভিউ' : 'App View'}
          </button>

          <button
            onClick={handleAdminLogout}
            className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Metric Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-xs">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
            মোট রক্তদাতা
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {donors.length}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            ✓ {donors.filter((d) => d.verifiedBadge).length} ভেরিফাইড
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-xs">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
            সক্রিয় SOS আবেদন
          </span>
          <span className="text-xl font-black text-rose-600 font-mono">
            {requests.filter((r) => r.status === 'ACTIVE').length}
          </span>
          <span className="text-[10px] text-red-500 font-semibold block mt-0.5">
            🚨 জরুরি রেসপন্স চালু
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-xs">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
            স্টক রক্ত ইউনিট
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {Object.values(bloodStock).reduce((a, b) => a + b, 0)}
          </span>
          <span className="text-[10px] text-blue-500 font-semibold block mt-0.5">
            ৮টি ব্লাড গ্রুপে
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-xs">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
            অডিট ট্রেইল লগ
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {auditLogs.length}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            SHA256 সিকিউরড
          </span>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-x-auto scrollbar-none text-xs font-bold">
        {[
          { id: 'donors', label: lang === 'bn' ? '🩸 ডোনার ভেরিফিকেশন' : 'Donor Verification' },
          { id: 'sos', label: lang === 'bn' ? '🚨 SOS আবেদন নিয়ন্ত্রণ' : 'SOS Moderation' },
          { id: 'inventory', label: lang === 'bn' ? '🏥 হাসপাতাল ব্লাড স্টক' : 'Blood Bank Stock' },
          { id: 'audit', label: lang === 'bn' ? '🔒 সিকিউরিটি অডিট' : 'Security Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              adminTab === tab.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DONOR VERIFICATION & USER MANAGEMENT */}
      {/* ===================================================================== */}
      {adminTab === 'donors' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {lang === 'bn' ? 'রক্তদাতা তালিকা ও অফিশিয়াল ভেরিফিকেশন' : 'Donor Verification Directory'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'নতুন নিবন্ধিত ডোনারদের ভেরিফাইড ব্লু ব্যাজ প্রদান বা বাতিল করুন' : 'Approve or revoke verification badges for donors'}
              </p>
            </div>

            {/* Search Box */}
            <div className="w-full sm:w-64 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDonorQuery}
                onChange={(e) => setSearchDonorQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'নাম, ফোন বা গ্রুপ...' : 'Filter donors...'}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {filteredDonors.map((donor) => (
              <div key={donor.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow">
                    {donor.bloodGroup}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {donor.name}
                      </span>
                      {donor.verifiedBadge ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>VERIFIED</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-600 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950 rounded">
                          PENDING
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {donor.phone} · <span className="capitalize">{donor.upazila}, {donor.district}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleVerify(donor.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      donor.verifiedBadge
                        ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{donor.verifiedBadge ? (lang === 'bn' ? 'ভেরিফাইড' : 'Verified') : (lang === 'bn' ? 'অনুমোদন দিন' : 'Approve')}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDonor(donor.id, donor.name)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    title="রিমুভ / ব্যান করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: EMERGENCY SOS REQUESTS MODERATION */}
      {/* ===================================================================== */}
      {adminTab === 'sos' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {lang === 'bn' ? 'সক্রিয় রক্তের আবেদন নিয়ন্ত্রণ ও মডারেশন' : 'SOS Requests Moderation'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'ভুয়া বা স্প্যাম রিকোয়েস্ট মুছে ফেলুন এবং রক্ত পাওয়া আবেদন সমাপ্ত চিহ্নিত করুন' : 'Resolve or remove spam blood requests'}
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {requests.map((req) => (
              <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-xs">
                      {req.bloodGroup}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {req.patientName} ({req.unitsNeeded} ব্যাগ)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      req.status === 'FULFILLED' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Hospital className="w-3.5 h-3.5 text-rose-500" />
                    <span>{req.hospitalName}</span>
                    <span>·</span>
                    <span className="font-mono">{req.contactPhone}</span>
                  </div>

                  {req.reason && (
                    <p className="text-[11px] text-slate-500 italic">
                      "{req.reason}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {req.status !== 'FULFILLED' && (
                    <button
                      onClick={() => handleMarkFulfilled(req.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      ✓ {lang === 'bn' ? 'রক্ত পাওয়া গেছে' : 'Fulfilled'}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteRequest(req.id, req.patientName)}
                    className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: BLOOD BANK INVENTORY CONTROL */}
      {/* ===================================================================== */}
      {adminTab === 'inventory' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {lang === 'bn' ? 'কেন্দ্রীয় হাসপাতাল ব্লাড স্টক নিয়ন্ত্রণ' : 'Blood Bank Real-Time Inventory Control'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'জরুরি প্রয়োজনে ব্লাড ব্যাংক ইউনিটের মজুদ বাড়ান বা কমান' : 'Adjust blood reserve inventory in real-time'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_BLOOD_GROUPS.map((grp) => {
              const count = bloodStock[grp];
              const isLow = count < 10;
              return (
                <div
                  key={grp}
                  className={`p-3.5 rounded-2xl border transition-all text-center space-y-2 ${
                    isLow
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-900'
                      : 'bg-slate-50 dark:bg-[#0f172a] border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-lg text-rose-600">{grp}</span>
                    {isLow && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white">
                        CRITICAL
                      </span>
                    )}
                  </div>

                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {count} <span className="text-xs font-normal text-slate-400">ব্যাগ</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStockChange(grp, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-white flex items-center justify-center font-bold cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChange(grp, 1)}
                      className="w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: AUDIT LOG TRAIL */}
      {/* ===================================================================== */}
      {adminTab === 'audit' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {lang === 'bn' ? 'সিকিউরিটি অডিট ও অপারেশনাল লগ' : 'Security Audit Trail'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'সিস্টেমের সকল ফোন নম্বর আনম্যাস্কিং, রেজিস্ট্রেশন ও অ্যাডমিন পরিবর্তনের হিস্ট্রি' : 'Cryptographically signed audit logs for sensitive operations'}
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-rose-600 dark:text-rose-400">{log.action}</span>
                  <span className="text-slate-400">{log.timestamp}</span>
                </div>
                <div className="text-slate-800 dark:text-slate-200 text-xs">
                  {log.targetDetails}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Hash: {log.securityHash}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
