import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ActiveTab, 
  Language, 
  Donor, 
  BloodRequest, 
  AuditLogEntry, 
  BloodGroup,
  PortalMode 
} from './types';
import { INITIAL_DONORS, INITIAL_REQUESTS } from './data/mockDonors';
import { getTranslation } from './utils/translations';
import { MobileAppHeader } from './components/mobile/MobileAppHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { EmergencyBanner } from './components/EmergencyBanner';
import { DonorSearch } from './components/DonorSearch';
import { RequestsFeed } from './components/RequestsFeed';
import { CompatibilityMatrixModal } from './components/CompatibilityMatrixModal';
import { EligibilityChecker } from './components/EligibilityChecker';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { PhoneRevealModal } from './components/PhoneRevealModal';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { RegisterDonorModal } from './components/RegisterDonorModal';
import { DonorHomeView } from './components/donor/DonorHomeView';
import { BloodHelpOnboardingView } from './components/donor/BloodHelpOnboardingView';
import { DonorProfileView } from './components/donor/DonorProfileView';
import { DonorBadgesView } from './components/donor/DonorBadgesView';
import { DonorChatView } from './components/donor/DonorChatView';
import { InteractiveMapView } from './components/donor/InteractiveMapView';
import { RequestBloodWizard } from './components/donor/RequestBloodWizard';
import { EmergencyCommandCenter } from './components/portals/EmergencyCommandCenter';
import { BloodBankPortal } from './components/portals/BloodBankPortal';
import { AdminPortal } from './components/portals/AdminPortal';
import { ArchitectureDocModal } from './components/ecosystem/ArchitectureDocModal';
import { AuthModuleModal } from './components/auth/AuthModuleModal';
import { FamilyVolunteerModal } from './components/ecosystem/FamilyVolunteerModal';
import { EmergencyDirectoryModal } from './components/ecosystem/EmergencyDirectoryModal';
import { EmergencyPosterModal } from './components/ecosystem/EmergencyPosterModal';
import { ThalassemiaManagerModal } from './components/ecosystem/ThalassemiaManagerModal';
import { PlayStoreGuideModal } from './components/ecosystem/PlayStoreGuideModal';
import { PwaInstallPrompt } from './components/ecosystem/PwaInstallPrompt';
import { PdfExactShowcase } from './components/showcase/PdfExactShowcase';
import { 
  Smartphone, 
  Monitor, 
  FileText, 
  Sun, 
  Moon, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Building2, 
  Radio, 
  Layers,
  ChevronRight,
  Maximize2,
  Lock,
  ShieldAlert,
  UserPlus,
  LogOut,
  Download
} from 'lucide-react';
import {
  auth,
  onAuthStateChanged,
  completeRealGmailSignInIfPresent,
  fetchUserProfileFromFirestore,
  checkIsVerifiedAdminInFirestore,
  subscribePublicDonors,
  subscribePublicRequests,
  createBloodRequestInFirestore,
  pledgeBloodRequestUnitInFirestore,
  signOutReal,
  User as FirebaseUser,
} from './firebase';

export default function App() {
  // Theme state: Normal solid light or normal solid dark (NO glass, NO blur)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bloodsearch_dark_mode');
    return saved !== null ? saved === 'true' : false; // Default clean normal light mode
  });

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('bloodsearch_lang') as Language;
    return saved === 'en' || saved === 'bn' ? saved : 'bn'; // Default to Bangla
  });

  // Display Mode:
  // 'apk': Authentic Mobile Phone APK Simulator / App (Default!)
  // 'deck': 8-Slide Presentation Deck matching Presentation2.pdf
  // 'fullscreen': Full desktop / tablet responsive layout
  const [displayMode, setDisplayMode] = useState<'apk' | 'deck' | 'fullscreen'>('apk');

  // Phone frame model when on desktop in 'apk' mode
  const [phoneModel, setPhoneModel] = useState<'iphone' | 'android'>('iphone');
  const [framelessOnDesktop, setFramelessOnDesktop] = useState<boolean>(false);

  // Active navigation tab within Mobile App (landing on Home Dashboard)
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Application Data States
  const [donors, setDonors] = useState<Donor[]>(() => {
    const saved = localStorage.getItem('bloodsearch_donors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DONORS;
      }
    }
    return INITIAL_DONORS;
  });

  const [requests, setRequests] = useState<BloodRequest[]>(() => {
    const saved = localStorage.getItem('bloodsearch_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_REQUESTS;
      }
    }
    return INITIAL_REQUESTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('bloodsearch_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'audit-1',
        action: 'STATUS_CHANGE',
        actorName: 'System Security Engine',
        targetDetails: 'Initial verification checks passed for 10 voluntary donors',
        timestamp: 'আজ সকাল ৮:৩০',
        securityHash: 'sha256:7f83b165...9c1a',
      },
      {
        id: 'audit-2',
        action: 'CREATE_SOS',
        actorName: 'কামাল হোসেন',
        targetDetails: 'Broadcasted O- request at DMCH (2 units)',
        timestamp: 'আজ সকাল ৯:১৫',
        securityHash: 'sha256:c4ca4238...d01b',
      },
      {
        id: 'audit-3',
        action: 'DISPATCH_INCIDENT',
        actorName: 'Emergency Command Center',
        targetDetails: 'Rapid response unit assigned to DMCH emergency Bleeding Case #INC-0412',
        timestamp: 'আজ সকাল ১০:০৫',
        securityHash: 'sha256:8b1a992...e4fa',
      },
    ];
  });

  // Modals state
  const [selectedDonorForPhone, setSelectedDonorForPhone] = useState<Donor | null>(null);
  const [activeDonorForChat, setActiveDonorForChat] = useState<Donor | null>(null);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [isSOSWizardOpen, setIsSOSWizardOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [registerInitialRole, setRegisterInitialRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState<boolean>(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState<boolean>(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState<boolean>(false);
  const [isThalassemiaModalOpen, setIsThalassemiaModalOpen] = useState<boolean>(false);
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);

  const openRegisterWithRole = useCallback((role: 'USER' | 'ADMIN' = 'USER') => {
    setRegisterInitialRole(role);
    setIsRegisterModalOpen(true);
  }, []);

  const [liveFirebaseUser, setLiveFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);

  // Real Firebase Auth & Cloud Firestore Live Listeners
  useEffect(() => {
    completeRealGmailSignInIfPresent().catch(() => {});

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setLiveFirebaseUser(u);
      if (u) {
        try {
          const profile = await fetchUserProfileFromFirestore(u.uid);
          const isAdmin = await checkIsVerifiedAdminInFirestore(u);
          if (profile) {
            if (isAdmin) {
              profile.role = 'ADMIN';
            }
            localStorage.setItem('bloodsearch_current_user', JSON.stringify(profile));
            window.dispatchEvent(new Event('bloodsearch_user_changed'));
          }
        } catch {}
      }
    });

    let unsubDonors: (() => void) | null = null;
    let unsubRequests: (() => void) | null = null;
    try {
      unsubDonors = subscribePublicDonors((cloudDonors) => {
        if (cloudDonors.length > 0) {
          setDonors((prev) => {
            const cloudIds = new Set(cloudDonors.map((d) => d.id));
            const remaining = prev.filter((p) => !cloudIds.has(p.id));
            return [...cloudDonors, ...remaining];
          });
        }
      });
      unsubRequests = subscribePublicRequests((cloudReqs) => {
        if (cloudReqs.length > 0) {
          setRequests((prev) => {
            const cloudIds = new Set(cloudReqs.map((r) => r.id));
            const remaining = prev.filter((p) => !cloudIds.has(p.id));
            return [...cloudReqs, ...remaining];
          });
        }
      });
    } catch {}

    return () => {
      unsubAuth();
      if (unsubDonors) unsubDonors();
      if (unsubRequests) unsubRequests();
    };
  }, []);

  // Apply dark mode class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('bloodsearch_dark_mode', String(darkMode));
  }, [darkMode]);

  // Sync language to local storage
  useEffect(() => {
    localStorage.setItem('bloodsearch_lang', lang);
  }, [lang]);

  // Debounced persistence to localStorage so large arrays/avatars NEVER block UI frames
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem('bloodsearch_donors', JSON.stringify(donors));
      } catch {}
    }, 450);
    return () => window.clearTimeout(timer);
  }, [donors]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem('bloodsearch_requests', JSON.stringify(requests));
      } catch {}
    }, 450);
    return () => window.clearTimeout(timer);
  }, [requests]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem('bloodsearch_audit_logs', JSON.stringify(auditLogs));
      } catch {}
    }, 450);
    return () => window.clearTimeout(timer);
  }, [auditLogs]);

  const t = getTranslation(lang);

  // Audit Logger helper
  const addAuditLog = useCallback((action: any, targetDetails: string) => {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      action,
      actorName: 'Current Operator',
      targetDetails,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      securityHash: `sha256:${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  // Phone Reveal Action
  const handleRevealPhone = useCallback((donor: Donor) => {
    setSelectedDonorForPhone(donor);
    setIsPhoneModalOpen(true);
  }, []);

  // SOS Creation Action
  const handleSubmitSOS = (newRequest: BloodRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
    createBloodRequestInFirestore(newRequest).catch(() => {});
    setActiveTab('requests');
  };

  // Volunteer Response to SOS
  const handleRespondToRequest = (
    requestId: string,
    responderName: string,
    responderPhone: string,
    group: BloodGroup,
    note?: string
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const newResponder = {
            id: `resp-${Date.now()}`,
            name: responderName,
            phone: responderPhone,
            bloodGroup: group,
            timestamp: lang === 'bn' ? 'এইমাত্র' : 'Just now',
            notes: note,
          };
          return {
            ...r,
            unitsCollected: Math.min(r.unitsNeeded, r.unitsCollected + 1),
            status: r.unitsCollected + 1 >= r.unitsNeeded ? 'FULFILLED' : r.status,
            responders: [newResponder, ...r.responders],
          };
        }
        return r;
      })
    );

    pledgeBloodRequestUnitInFirestore(requestId).catch(() => {});
    addAuditLog('RESPOND_SOS', `Volunteer ${responderName} (${group}) responded to request ${requestId}`);
  };

  // New Donor Registration
  const handleRegisterDonor = useCallback((newDonor: Donor) => {
    setDonors((prev) => {
      const filtered = prev.filter((d) => d.id !== newDonor.id);
      return [newDonor, ...filtered];
    });
  }, []);

  // Urgent active requests count
  const urgentRequests = useMemo(
    () => requests.filter((r) => r.status === 'ACTIVE' && r.urgency === 'CRITICAL'),
    [requests]
  );

  // =========================================================================
  // MOBILE APK INNER APP SCREEN (Authentic mobile experience matching PDF)
  // =========================================================================
  const renderMobileAPK = () => (
    <div className={`@container w-full h-full flex flex-col transition-colors ${
      darkMode ? 'bg-[#0b0f19] text-[#f8fafc]' : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      {/* 1. Mobile App Top Bar with Status Bar & App Header */}
      <MobileAppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSOSModal={() => setIsSOSWizardOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenRegisterModal={(role) => openRegisterWithRole(role || 'USER')}
        onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onOpenSlideDeck={() => setDisplayMode('deck')}
        onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
      />

      {/* 2. Scrollable App Body (Render Active Screen from PDF) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden app-scroll-smooth p-3.5 sm:p-4 space-y-4">
        {/* Tab: Home (Dashboard matching Page 1 & 5) */}
        {activeTab === 'home' && (
          <DonorHomeView
            requests={requests}
            lang={lang}
            onOpenSOSWizard={() => setIsSOSWizardOpen(true)}
            onOpenRegister={(role) => openRegisterWithRole(role || 'USER')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSelectRequest={(req) => setActiveTab('requests')}
            onQuickDonate={(req) => setActiveTab('requests')}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenDirectory={() => setIsDirectoryModalOpen(true)}
            onOpenPoster={() => setIsPosterModalOpen(true)}
            onOpenThalassemia={() => setIsThalassemiaModalOpen(true)}
            onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
          />
        )}

        {/* Tab: Blood Help Onboarding (Page 2: 8 Blood Type Buttons + Urgent Feed) */}
        {activeTab === 'onboarding' && (
          <BloodHelpOnboardingView
            lang={lang}
            onSelectGroup={(group) => setActiveTab('search')}
            onOpenSOSModal={() => setIsSOSWizardOpen(true)}
          />
        )}

        {/* Tab: Search Donors */}
        {activeTab === 'search' && (
          <DonorSearch
            donors={donors}
            lang={lang}
            onRevealPhone={handleRevealPhone}
            onOpenSOSModal={() => setIsSOSWizardOpen(true)}
            onStartChatWithDonor={(donor) => {
              setActiveDonorForChat(donor);
              setActiveTab('chat');
            }}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
          />
        )}

        {/* Tab: Live SOS Requests Feed */}
        {activeTab === 'requests' && (
          <RequestsFeed
            requests={requests}
            lang={lang}
            onOpenSOSModal={() => setIsSOSWizardOpen(true)}
            onRespondToRequest={handleRespondToRequest}
          />
        )}

        {/* Tab: Messages / Inbox & Real-Time WhatsApp-Style User-to-User Chat */}
        {activeTab === 'chat' && (
          <DonorChatView
            lang={lang}
            donors={donors}
            initialDonor={activeDonorForChat}
            onClearInitialDonor={() => setActiveDonorForChat(null)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenRegister={() => openRegisterWithRole('USER')}
          />
        )}

        {/* Tab: My Badges (Page 6 & 12) */}
        {activeTab === 'badges' && (
          <DonorBadgesView lang={lang} />
        )}

        {/* Tab: Profile & Hospital QR Pass */}
        {activeTab === 'profile' && (
          <DonorProfileView
            lang={lang}
            onOpenRegister={(role) => openRegisterWithRole(role || 'USER')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Tab: Interactive Map */}
        {activeTab === 'map' && (
          <InteractiveMapView
            lang={lang}
            onOpenSOSWizard={() => setIsSOSWizardOpen(true)}
            onStartChatWithDonor={(donorName, bloodGroup, phone) => {
              const matched = donors.find((d) => d.name === donorName) || {
                id: `d-${Date.now()}`,
                name: donorName,
                bloodGroup,
                division: 'dhaka',
                district: 'ঢাকা',
                upazila: 'সদর',
                phone: phone || '+88017XXXXXXXX',
                available: true,
                lastDonatedDate: '',
                totalDonations: 1,
                verifiedBadge: true,
                rating: 5,
                reviewsCount: 1,
                age: 26,
                gender: 'MALE' as const,
                weightKg: 65,
              };
              setActiveDonorForChat(matched);
              setActiveTab('chat');
            }}
          />
        )}

        {/* Tab: Dedicated Protected Admin Portal */}
        {activeTab === 'admin' && (
          <AdminPortal
            lang={lang}
            donors={donors}
            setDonors={setDonors}
            requests={requests}
            setRequests={setRequests}
            auditLogs={auditLogs}
            onLogAudit={addAuditLog}
            onExitAdmin={() => setActiveTab('home')}
            onOpenRegisterWithRole={(role) => openRegisterWithRole(role)}
            onOpenApkGuide={() => setIsPlayStoreModalOpen(true)}
          />
        )}

        {/* Tab: Compatibility Matrix */}
        {activeTab === 'compatibility' && (
          <CompatibilityMatrixModal lang={lang} />
        )}

        {/* Tab: Donor Eligibility */}
        {activeTab === 'eligibility' && (
          <EligibilityChecker lang={lang} />
        )}

        {/* Tab: Security Audit */}
        {activeTab === 'security' && (
          <SecurityAuditModal logs={auditLogs} lang={lang} />
        )}
      </div>

      {/* 3. Authentic Mobile Touch Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        unreadSosCount={urgentRequests.length}
        unreadChatCount={1}
        onOpenSOSModal={() => setIsSOSWizardOpen(true)}
      />
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'dark bg-[#070a12] text-slate-100' : 'bg-[#eef2f6] text-slate-900'
    }`}>
      {/* ========================================================================= */}
      {/* TOP DESKTOP CONTROL BAR (Hidden on mobile phones for 100% native APK feel) */}
      {/* ========================================================================= */}
      <header className="hidden sm:block sticky top-0 z-50 w-full bg-white dark:bg-[#0f172a] border-b border-slate-300 dark:border-slate-800 shadow-sm py-2 px-3 sm:px-6 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black shadow-sm">
              🩸
            </div>
            <div className="text-left">
              <span className="font-black text-sm text-slate-900 dark:text-white leading-none block">
                BloodSearch
              </span>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                {lang === 'bn' ? 'বাংলাদেশ রক্ত সন্ধান নেটওয়ার্ক' : 'Mobile Blood Network'}
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1e293b] p-1 rounded-xl border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setDisplayMode('apk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                displayMode === 'apk'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '📱 মোবাইল APK ভিউ' : '📱 Mobile APK'}</span>
            </button>

            <button
              onClick={() => setDisplayMode('deck')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                displayMode === 'deck'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '📄 PDF প্রেজেন্টেশন (৮ স্লাইড)' : '📄 8 PDF Slides'}</span>
            </button>

            <button
              onClick={() => setDisplayMode('fullscreen')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                displayMode === 'fullscreen'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '🖥️ ফুল স্ক্রিন' : '🖥️ Full Screen'}</span>
            </button>
          </div>

          {/* Right Tools: APK Install, ID Register, Login Button, Admin Panel, Frame Toggle, Language, Theme */}
          <div className="flex items-center gap-2">
            {/* Direct APK & Anti-Hack Hub Button */}
            <button
              onClick={() => setIsPlayStoreModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black dark:bg-slate-800 text-emerald-400 border border-slate-700 font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap"
              title="APK ডাউনলোড, ডিপ্লয় ও অ্যান্টি-হ্যাক গাইড"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'APK ও সিকিউরিটি' : 'APK & Security'}</span>
            </button>

            {/* Prominent ID Register Trigger (User / Admin) */}
            <button
              onClick={() => openRegisterWithRole('USER')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'আইডি রেজিস্টার' : 'Register ID'}</span>
            </button>

            {/* Prominent Login / Account Trigger */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {liveFirebaseUser
                  ? liveFirebaseUser.email?.split('@')[0] || liveFirebaseUser.phoneNumber || (lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account')
                  : lang === 'bn'
                  ? 'লগইন'
                  : 'Login'}
              </span>
            </button>

            {liveFirebaseUser && (
              <button
                onClick={() => {
                  signOutReal().catch(() => {});
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold text-xs cursor-pointer whitespace-nowrap"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            )}

            {/* Admin Panel Access Button */}
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black dark:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer border border-slate-700"
              title={lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
            </button>

            {/* Frame / Frameless switcher when in APK mode on desktop */}
            {displayMode === 'apk' && (
              <button
                onClick={() => setFramelessOnDesktop(!framelessOnDesktop)}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer hover:border-slate-400"
                title="ফ্রেম অন/অফ করুন"
              >
                <span>{framelessOnDesktop ? (lang === 'bn' ? '📱 ফ্রেম অন' : 'Frame ON') : (lang === 'bn' ? '📱 ফ্রেম ছাড়া' : 'Frameless')}</span>
              </button>
            )}

            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>

            {/* Normal Solid Theme Toggle (NO glass, NO blur) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs"
              title="Toggle Light / Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT ROUTING */}
      {/* ========================================================================= */}
      <main className="w-full">
        {/* 1. AUTHENTIC MOBILE APK PHONE SIMULATOR (Default View) */}
        {displayMode === 'apk' && (
          <>
            {/* Mobile Viewports (< 640px): 100% Fullscreen Native Mobile APK (NO fake bezel, NO desktop bar) */}
            <div className="sm:hidden w-full min-h-screen flex flex-col">
              {renderMobileAPK()}
            </div>

            {/* Desktop Viewports (>= 640px): Centered Simulator */}
            <div className="hidden sm:flex py-4 sm:py-6 px-2 sm:px-4 flex-col items-center justify-center min-h-[calc(100vh-56px)]">
              {framelessOnDesktop ? (
                /* Frameless centered mobile app container */
                <div className="w-full max-w-[420px] h-[850px] max-h-[92vh] rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden relative">
                  {renderMobileAPK()}
                </div>
              ) : (
                /* Sleek Phone Frame container */
                <div className="w-full max-w-[410px] flex flex-col items-center">
                  <div
                    className={`w-full h-[850px] max-h-[92vh] rounded-[48px] p-2.5 shadow-2xl relative overflow-hidden flex flex-col border-[8px] transition-colors ${
                      phoneModel === 'iphone'
                        ? darkMode
                          ? 'bg-[#090d16] border-[#1e293b] shadow-2xl shadow-black/90 ring-1 ring-slate-800'
                          : 'bg-[#f1f5f9] border-[#cbd5e1] shadow-2xl shadow-slate-400/50 ring-1 ring-slate-300'
                        : darkMode
                        ? 'bg-[#090d16] border-[#334155] rounded-[38px] shadow-2xl shadow-black/90'
                        : 'bg-[#f1f5f9] border-[#94a3b8] rounded-[38px] shadow-2xl shadow-slate-400/50'
                    }`}
                  >
                    {/* Dynamic Island (iPhone) */}
                    {phoneModel === 'iphone' ? (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 border border-slate-800 pointer-events-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800 z-50 flex items-center justify-center pointer-events-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      </div>
                    )}

                    {/* Inner Screen Running the Mobile APK */}
                    <div className={`w-full h-full rounded-[38px] overflow-hidden relative shadow-inner ${
                      darkMode ? 'bg-[#0b0f19]' : 'bg-[#f8fafc]'
                    }`}>
                      {renderMobileAPK()}
                    </div>
                  </div>

                  {/* Sub-label under phone on desktop */}
                  <div className="hidden sm:flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {lang === 'bn' 
                        ? 'ফ্লাটার মোবাইল APK টাচ প্রিভিউ · নিচের ট্যাব ব্যবহার করুন'
                        : 'Mobile APK Touch Preview · Navigate with bottom tabs'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* 2. 8-SLIDE PRESENTATION DECK (Matching Presentation2.pdf) */}
        {displayMode === 'deck' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <PdfExactShowcase
              lang={lang}
              darkMode={darkMode}
              onOpenSOSModal={() => setIsSOSWizardOpen(true)}
            />
          </div>
        )}

        {/* 3. FULL SCREEN RESPONSIVE LAYOUT */}
        {displayMode === 'fullscreen' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 shadow-sm mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  BloodSearch Fullscreen Responsive Canvas
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Expand views to test on large monitors or tablets.
                </p>
              </div>
              <button
                onClick={() => setDisplayMode('apk')}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Return to Mobile APK 📱
              </button>
            </div>

            <div className="rounded-3xl border border-slate-300 dark:border-slate-700 overflow-hidden shadow-lg">
              {renderMobileAPK()}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODALS & BOTTOM SHEETS */}
      {/* ========================================================================= */}
      <PhoneRevealModal
        donor={selectedDonorForPhone}
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        lang={lang}
        onLogAudit={addAuditLog}
      />

      <RequestBloodWizard
        isOpen={isSOSWizardOpen}
        onClose={() => setIsSOSWizardOpen(false)}
        lang={lang}
        onSubmitSOS={handleSubmitSOS}
        onLogAudit={addAuditLog}
      />

      <RegisterDonorModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        lang={lang}
        initialRole={registerInitialRole}
        onRegisterDonor={handleRegisterDonor}
        onLogAudit={addAuditLog}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <AuthModuleModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        onLogAudit={addAuditLog}
        onOpenRegister={() => openRegisterWithRole('USER')}
      />

      <FamilyVolunteerModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        lang={lang}
        onOpenSOSWithGroup={(group) => {
          setIsSOSWizardOpen(true);
        }}
      />

      <EmergencyDirectoryModal
        isOpen={isDirectoryModalOpen}
        onClose={() => setIsDirectoryModalOpen(false)}
        lang={lang}
      />

      <EmergencyPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        lang={lang}
      />

      <ThalassemiaManagerModal
        isOpen={isThalassemiaModalOpen}
        onClose={() => setIsThalassemiaModalOpen(false)}
        lang={lang}
      />

      <PlayStoreGuideModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
        lang={lang}
      />

      <PwaInstallPrompt
        lang={lang}
        onOpenApkGuide={() => setIsPlayStoreModalOpen(true)}
      />

      {isArchitectureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 overflow-y-auto">
          <div className="w-full max-w-4xl my-4 rounded-3xl bg-white dark:bg-[#1e293b] p-6 shadow-2xl border border-slate-300 dark:border-slate-700 transition-all text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                BloodSearch Enterprise Architecture & Specifications
              </h2>
              <button
                onClick={() => setIsArchitectureModalOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>
            <ArchitectureDocModal />
          </div>
        </div>
      )}
    </div>
  );
}
