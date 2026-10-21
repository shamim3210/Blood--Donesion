import React, { useState, useRef } from 'react';
import { Donor, BloodGroup, Language, UserAccount } from '../types';
import { ALL_BLOOD_GROUPS } from '../data/compatibility';
import { DIVISIONS, DISTRICTS } from '../data/bangladeshGeo';
import { getTranslation } from '../utils/translations';
import { 
  HeartHandshake, 
  X, 
  Check, 
  UserPlus, 
  Camera, 
  Upload, 
  QrCode, 
  Download, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface RegisterDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onRegisterDonor: (newDonor: Donor, newAccount?: UserAccount) => void;
  onLogAudit: (action: any, details: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
];

export const RegisterDonorModal: React.FC<RegisterDonorModalProps> = ({
  isOpen,
  onClose,
  lang,
  onRegisterDonor,
  onLogAudit,
}) => {
  const t = getTranslation(lang);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka');
  const [upazila, setUpazila] = useState('dhanmondi');
  const [age, setAge] = useState(24);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [weightKg, setWeightKg] = useState(62);
  const [available, setAvailable] = useState(true);
  const [lastDonatedDate, setLastDonatedDate] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('স্বেচ্ছাসেবী রক্তদাতা');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bio, setBio] = useState('জরুরি প্রয়োজনে যেকোনো সময় রক্ত দিতে প্রস্তুত আছি।');

  // Photo Upload State
  const [photoUrl, setPhotoUrl] = useState<string>(PRESET_AVATARS[0]);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  
  // Generated ID Card Screen
  const [createdAccount, setCreatedAccount] = useState<UserAccount | null>(null);
  const [isCopiedId, setIsCopiedId] = useState(false);

  if (!isOpen) return null;

  const currentDistricts = DISTRICTS.filter((d) => d.divisionId === division);
  const selectedDistrictObj = DISTRICTS.find((d) => d.id === district);
  const currentUpazilas = selectedDistrictObj ? selectedDistrictObj.upazilas : [];

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const firstDist = DISTRICTS.find((d) => d.divisionId === newDiv);
    if (firstDist) {
      setDistrict(firstDist.id);
      setUpazila(firstDist.upazilas[0]?.id || '');
    }
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    const dObj = DISTRICTS.find((d) => d.id === newDist);
    setUpazila(dObj?.upazilas[0]?.id || '');
  };

  // Real File Upload Handler (reads image file as base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম ও মোবাইল নম্বর প্রদান করুন' : 'Please provide your full name and phone number');
      return;
    }

    const randomSerial = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `BD-${new Date().getFullYear()}-${randomSerial}-${bloodGroup}`;

    const newAccount: UserAccount = {
      id: `acc-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@bloodsearch.bd`,
      phone: phone.trim(),
      bloodGroup,
      division,
      district,
      upazila,
      photoUrl,
      role: 'USER', // Standard user only, NOT admin!
      verifiedStatus: true,
      idCardNumber: generatedId,
      age: Number(age) || 24,
      gender,
      weightKg: Number(weightKg) || 60,
      availableToDonate: available,
      lastDonationDate: lastDonatedDate || undefined,
      totalDonations: lastDonatedDate ? 1 : 0,
      emergencyContactPhone: emergencyContact,
      createdAt: new Date().toISOString(),
    };

    const newDonor: Donor = {
      id: `donor-${Date.now()}`,
      name: name.trim(),
      bloodGroup,
      division,
      district,
      upazila,
      phone: phone.trim(),
      available,
      lastDonatedDate: lastDonatedDate || '',
      totalDonations: lastDonatedDate ? 1 : 0,
      verifiedBadge: true, // auto-verified on verified smart card creation
      rating: 5.0,
      reviewsCount: 1,
      age: Number(age) || 24,
      gender,
      weightKg: Number(weightKg) || 60,
      hospitalAffiliation: hospitalAffiliation || 'Voluntary Donor',
      bio: bio || 'জরুরি প্রয়োজনে রক্তদানে প্রস্তুত আছি।',
      avatar: photoUrl,
      reliabilityScore: 98,
    };

    // Save active user profile in localStorage
    localStorage.setItem('bloodsearch_current_user', JSON.stringify(newAccount));

    onRegisterDonor(newDonor, newAccount);
    onLogAudit('DONOR_REGISTERED', `Smart ID Created: ${name} (${bloodGroup}, ${district}, ID: ${generatedId})`);
    setCreatedAccount(newAccount);
  };

  const handleCopyCardId = () => {
    if (createdAccount) {
      navigator.clipboard.writeText(createdAccount.idCardNumber);
      setIsCopiedId(true);
      setTimeout(() => setIsCopiedId(false), 2000);
    }
  };

  const handleClose = () => {
    setCreatedAccount(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 overflow-y-auto">
      <div className="w-full max-w-xl my-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white p-4 sm:p-6 shadow-2xl border border-slate-300 dark:border-slate-700 transition-all text-left">
        {/* Modal Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {createdAccount 
                  ? (lang === 'bn' ? 'স্মার্ট ডিজিটাল রক্তদাতা কার্ড' : 'Smart Digital Donor ID Card')
                  : (lang === 'bn' ? 'ইউজার ও রক্তদাতা স্মার্ট আইডি তৈরি' : 'Smart ID Registration')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'আপনার ফটো, তথ্য ও ব্লাড গ্রুপ দিয়ে তৈরি করুন অফিসিয়াল ডোনার আইডি'
                  : 'Register user ID with photo upload & verified donor pass'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SUCCESS / GENERATED SMART ID CARD VIEW */}
        {createdAccount ? (
          <div className="py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Success Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                  {lang === 'bn' ? 'স্মার্ট আইডি কার্ড সফলভাবে তৈরি হয়েছে!' : 'Smart Donor ID Card Created Successfully!'}
                </h4>
                <p className="text-emerald-700 dark:text-emerald-300 text-[11px] mt-0.5">
                  {lang === 'bn' 
                    ? 'আপনার আইডি নম্বর ও তথ্য ডাটাবেজে সংরক্ষিত হয়েছে। আপনি এখন নিবন্ধিত রক্তদাতা।'
                    : 'Your information is registered in the national blood donor directory.'}
                </p>
              </div>
            </div>

            {/* Authentic Visual National Smart Donor Card */}
            <div className="w-full rounded-3xl bg-gradient-to-br from-slate-900 via-[#182234] to-slate-950 text-white p-5 sm:p-6 shadow-2xl border-2 border-rose-500/40 relative overflow-hidden">
              {/* Holographic Watermark Pattern */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-rose-600/10 blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none text-rose-500">
                <QrCode className="w-24 h-24" />
              </div>

              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center font-black text-xs text-white">
                    🩸
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                      BANGLADESH BLOOD NETWORK
                    </span>
                    <span className="text-xs font-bold text-slate-200 block">
                      জাতীয় ডিজিটাল রক্তদাতা স্মার্ট কার্ড
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>VERIFIED</span>
                </div>
              </div>

              {/* Card Body with Photo & Info */}
              <div className="py-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10">
                {/* User Photo */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-rose-500/30 shrink-0 bg-slate-800 shadow-xl">
                  <img
                    src={createdAccount.photoUrl}
                    alt={createdAccount.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-center text-[9px] font-bold text-emerald-400">
                    ID VERIFIED
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-lg font-black text-white">
                      {createdAccount.name}
                    </h3>
                    <div className="inline-flex self-center sm:self-auto items-center px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm shadow-md">
                      {createdAccount.bloodGroup}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 font-mono flex items-center justify-center sm:justify-start gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{createdAccount.phone}</span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="capitalize">{createdAccount.upazila}, {createdAccount.district}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800">
                    <span>আইডি: <strong className="text-slate-200">{createdAccount.idCardNumber}</strong></span>
                    <span>রক্তদান: <strong className="text-emerald-400">প্রস্তুত</strong></span>
                  </div>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono relative z-10">
                <span>রোল: সাধারণ ইউজার ও রক্তদাতা</span>
                <span>BloodSearch Network BD</span>
              </div>
            </div>

            {/* Notice: Role Differentiation (Anti-Spoofing Rule) */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  {lang === 'bn' ? 'ইউজার অ্যাকাউন্ট এক্সেস সক্রিয়:' : 'User Account Access Enabled:'}
                </span>
                <span className="text-[11px] text-blue-800 dark:text-blue-300">
                  {lang === 'bn'
                    ? 'আপনার আইডি তৈরি হয়েছে। আপনি ডোনার সার্চ, রক্ত আবেদন, ও চ্যাট করতে পারবেন। অ্যাডমিন প্যানেলে প্রবেশের জন্য অ্যাডমিন পিন কোড প্রয়োজন।'
                    : 'Your regular user account is ready for blood requests, searches, and chats. Admin tools are restricted by Master PIN.'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCardId}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-300 dark:border-slate-700"
              >
                {isCopiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <QrCode className="w-4 h-4 text-rose-500" />}
                <span>{isCopiedId ? (lang === 'bn' ? 'আইডি কপি হয়েছে!' : 'ID Copied!') : (lang === 'bn' ? 'আইডি কপি করুন' : 'Copy ID Number')}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
              >
                <span>{lang === 'bn' ? 'সম্পন্ন (হোমে যান)' : 'Done (Go to Home)'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 2. REGISTRATION FORM (With Photo Upload & Details) */
          <form onSubmit={handleSubmit} className="py-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Photo Upload Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {lang === 'bn' ? '১. রক্তদাতার ছবি আপলোড করুন (বা সিলেক্ট করুন) *' : '1. Upload Donor Profile Photo *'}
              </label>

              <div className="flex items-center gap-4">
                {/* Current Photo Preview */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-3 ring-rose-500/40 shrink-0 bg-slate-200 dark:bg-slate-800 shadow-md">
                  <img
                    src={photoUrl}
                    alt="Donor avatar"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    title="ছবি পরিবর্তন করুন"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-0.5">Change</span>
                  </button>
                </div>

                {/* Upload Buttons */}
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'গ্যালারি / ডিভাইস থেকে ছবি দিন' : 'Upload from Device'}</span>
                  </button>

                  {photoFileName && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block truncate max-w-[200px]">
                      ✓ {photoFileName}
                    </span>
                  )}

                  {/* Preset Avatar Fast Switcher */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">বা প্রিসেট:</span>
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPhotoUrl(url);
                          setPhotoFileName('');
                        }}
                        className={`w-6 h-6 rounded-full overflow-hidden ring-1 transition-all cursor-pointer ${
                          photoUrl === url ? 'ring-2 ring-rose-600 scale-110' : 'ring-slate-300 dark:ring-slate-700 opacity-60'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Group Selector (Prominent Touch Buttons) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                {lang === 'bn' ? '২. আপনার রক্তের গ্রুপ নির্বাচন করুন *' : '2. Select Your Blood Group *'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ALL_BLOOD_GROUPS.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setBloodGroup(grp)}
                    className={`py-2.5 rounded-xl text-center font-black text-sm transition-all cursor-pointer ${
                      bloodGroup === grp
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-102 ring-2 ring-rose-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-400'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Info: Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            {/* Geo Location: Division, District, Upazila */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {lang === 'bn' ? '৩. আপনার বর্তমান এলাকা ও জেলা' : '3. Location & Area'}
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {lang === 'bn' ? 'বিভাগ' : 'Division'}
                  </label>
                  <select
                    value={division}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    {DIVISIONS.map((div) => (
                      <option key={div.id} value={div.id}>
                        {lang === 'bn' ? div.nameBn : div.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {lang === 'bn' ? 'জেলা' : 'District'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    {currentDistricts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {lang === 'bn' ? d.nameBn : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {lang === 'bn' ? 'থানা/উপজেলা' : 'Upazila'}
                  </label>
                  <select
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    {currentUpazilas.map((u) => (
                      <option key={u.id} value={u.id}>
                        {lang === 'bn' ? u.nameBn : u.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Health & Demographics: Age, Weight, Gender */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'বয়স (বছর)' : 'Age (Yrs)'}
                </label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'ওজন (কেজি)' : 'Weight (kg)'}
                </label>
                <input
                  type="number"
                  min="45"
                  max="120"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'লিঙ্গ' : 'Gender'}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="MALE">পুরুষ (Male)</option>
                  <option value="FEMALE">মহিলা (Female)</option>
                  <option value="OTHER">অন্যান্য</option>
                </select>
              </div>
            </div>

            {/* Last Donation Date & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'সর্বশেষ রক্তদানের তারিখ (যদি থাকে)' : 'Last Donated Date (Optional)'}
                </label>
                <input
                  type="date"
                  value={lastDonatedDate}
                  onChange={(e) => setLastDonatedDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'জরুরি রক্তের জন্য প্রস্তুত?' : 'Available to Donate?'}
                </label>
                <button
                  type="button"
                  onClick={() => setAvailable(!available)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                    available
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${available ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>{available ? (lang === 'bn' ? 'হ্যাঁ, আমি প্রস্তুত (Available)' : 'Yes, Available') : (lang === 'bn' ? 'না, বিশ্রামে আছি' : 'Not Available')}</span>
                </button>
              </div>
            </div>

            {/* Security Notice: Standard User vs Admin access */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                {lang === 'bn'
                  ? 'নিরাপত্তা নিশ্চিত: এই ফর্ম দিয়ে সাধারণ ইউজার ও রক্তদাতা আইডি তৈরি হবে। অ্যাডমিন এক্সেস সংরক্ষিত।'
                  : 'Notice: This generates standard user credentials. Administrative tools are protected by PIN.'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full min-h-[46px] rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'bn' ? 'স্মার্ট আইডি কার্ড ও একাউন্ট তৈরি করুন' : 'Generate Smart Donor ID Card'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
