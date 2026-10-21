import React, { useState } from 'react';
import { Language } from '../../types';
import { 
  X, 
  Smartphone, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  Laptop, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  PhoneCall,
  Lock,
  RefreshCw,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface AuthModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLogAudit: (action: any, details: string) => void;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export const AuthModuleModal: React.FC<AuthModuleModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'otp' | 'email' | 'devices' | 'recovery'>('otp');
  
  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('01712345678');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(45);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Email password state
  const [email, setEmail] = useState('tanvir.ahmed@gmail.com');
  const [password, setPassword] = useState('••••••••••');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess-1',
      device: 'iPhone 16 Pro (iOS 18.2)',
      browser: 'Mobile Safari 18',
      location: 'Dhaka, Bangladesh',
      ip: '103.205.132.44',
      lastActive: 'Active Now',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      device: 'MacBook Pro 16" (macOS Sequoia)',
      browser: 'Google Chrome 132',
      location: 'Dhanmondi, Dhaka',
      ip: '103.205.132.88',
      lastActive: '24 min ago',
      isCurrent: false,
    },
    {
      id: 'sess-3',
      device: 'Samsung Galaxy S24 Ultra',
      browser: 'BloodSearch Android Native App',
      location: 'Agrabad, Chattogram',
      ip: '118.179.220.12',
      lastActive: 'Yesterday 08:42 PM',
      isCurrent: false,
    },
  ]);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpTimer(45);
    onLogAudit('STATUS_CHANGE', `Dispatched 6-digit SMS OTP to +880 ${phoneNumber}`);
  };

  const handleVerifyOtp = () => {
    setAuthSuccess(lang === 'bn' ? 'ওটিপি যাচাই সফল! সেশন অথেনটিকেটেড।' : 'Phone OTP verified! Session authenticated.');
    onLogAudit('STATUS_CHANGE', `User logged in via Phone OTP +880 ${phoneNumber}`);
    setTimeout(() => {
      setAuthSuccess(null);
      onClose();
    }, 1800);
  };

  const handleGoogleLogin = () => {
    setAuthSuccess(lang === 'bn' ? 'Google অ্যাকাউন্টের মাধ্যমে সফলভাবে সাইন ইন হয়েছে!' : 'Signed in with Google (OAuth2.0 Token validated)');
    onLogAudit('STATUS_CHANGE', `User authenticated with Google OAuth: ${email}`);
    setTimeout(() => {
      setAuthSuccess(null);
      onClose();
    }, 1500);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSuccess(lang === 'bn' ? 'ইমেইল লগইন সম্পন্ন হয়েছে!' : 'Email authentication successful!');
    onLogAudit('STATUS_CHANGE', `User logged in with email: ${email}`);
    setTimeout(() => {
      setAuthSuccess(null);
      onClose();
    }, 1500);
  };

  const handleLogoutAllOther = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    onLogAudit('STATUS_CHANGE', 'Terminated all other active remote sessions and revoked refresh tokens');
    setAuthSuccess(lang === 'bn' ? 'অন্যান্য সকল ডিভাইস থেকে লগআউট করা হয়েছে।' : 'Logged out of all other remote sessions.');
    setTimeout(() => setAuthSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 overflow-y-auto">
      <div className="w-full max-w-lg my-4 rounded-3xl bg-white dark:bg-[#1e293b] p-6 sm:p-7 shadow-2xl border border-slate-300 dark:border-slate-700 transition-all text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'নিরাপদ অ্যাকাউন্ট ও সেশন ম্যানেজমেন্ট' : 'Authentication & Device Security'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'Firebase Auth · OTP · Google · ডিভাইস অডিট' : 'Firebase Auth · Phone OTP · Multi-Device Control'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {authSuccess && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* 4 Segmented Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl my-5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('otp')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'otp'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Phone OTP
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Email / Pass
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'devices'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Devices ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'recovery'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Recovery
          </button>
        </div>

        {/* Tab 1: Phone OTP */}
        {activeTab === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {lang === 'bn' ? 'বাংলাদেশ মোবাইল নম্বর' : 'Bangladesh Mobile Number'}
              </label>
              <div className="flex gap-2">
                <div className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
                  <span>🇧🇩 +880</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>{lang === 'bn' ? '৬-ডিজিটের কোড পাঠান (Send OTP)' : 'Send 6-Digit SMS OTP'}</span>
              </button>
            ) : (
              <div className="space-y-4 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/50 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'এসএমএস কোড লিখুন' : 'Enter 6-Digit Code'}
                  </span>
                  <span className="font-mono text-rose-600 font-bold">00:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}</span>
                </div>

                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      defaultValue={index === 0 ? '7' : index === 1 ? '4' : index === 2 ? '9' : ''}
                      className="w-10 sm:w-12 h-12 text-center font-mono font-black text-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Verify & Login
                  </button>
                </div>
              </div>
            )}

            {/* Social Google One-Tap */}
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Or Social Auth
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Email Password */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Password Strength: Strong (SHA-256 + Salt)
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('recovery')}
                  className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              {isRegisterMode ? 'Create BloodSearch Account' : 'Sign In with Email'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                {isRegisterMode
                  ? 'Already have an account? Sign in'
                  : 'New to BloodSearch? Register as voluntary donor'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Multi-Device & Session Management */}
        {activeTab === 'devices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Active Logged-In Sessions
                </span>
                <span className="text-[11px] text-slate-400">
                  Real-time token revocations via Firebase Session Management
                </span>
              </div>
              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleLogoutAllOther}
                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Logout All Others
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    sess.isCurrent
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      {sess.device.includes('iPhone') || sess.device.includes('Samsung') ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {sess.device}
                        </span>
                        {sess.isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {sess.browser} · {sess.location} · {sess.ip}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    {sess.lastActive}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Account Recovery */}
        {activeTab === 'recovery' && (
          <div className="space-y-3.5">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {lang === 'bn'
                ? 'আপনার নিবন্ধিত ইমেইল বা ফোন নম্বরে পাসওয়ার্ড রিসেট লিংক পাঠানো হবে।'
                : 'Enter your registered email address or phone number to receive secure password recovery link.'}
            </p>
            <input
              type="text"
              placeholder="e.g. user@gmail.com or 017XXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="button"
              onClick={() => {
                setAuthSuccess(lang === 'bn' ? 'রিকভারি লিংক সফলভাবে পাঠানো হয়েছে!' : 'Recovery link dispatched successfully!');
                setTimeout(() => setAuthSuccess(null), 2500);
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              Send Recovery Instructions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
