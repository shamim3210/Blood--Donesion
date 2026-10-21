import React, { useState, useRef, useEffect } from 'react';
import { Conversation, ChatMessage, Language, Donor } from '../../types';
import { INITIAL_CONVERSATIONS } from '../../data/mockEnterpriseData';
import { getTranslation } from '../../utils/translations';
import { 
  Send, 
  Mic, 
  Phone, 
  MoreVertical, 
  ArrowLeft, 
  CheckCheck, 
  Search, 
  Play, 
  Pause, 
  Hospital, 
  Paperclip,
  Smile,
  ShieldCheck,
  AlertCircle,
  Share2,
  Heart
} from 'lucide-react';

interface DonorChatViewProps {
  lang: Language;
  initialDonor?: Donor | null;
  onClearInitialDonor?: () => void;
}

export const DonorChatView: React.FC<DonorChatViewProps> = ({ 
  lang,
  initialDonor,
  onClearInitialDonor,
}) => {
  const t = getTranslation(lang);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('bloodsearch_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CONVERSATIONS;
      }
    }
    return INITIAL_CONVERSATIONS;
  });

  const [activeConvId, setActiveConvId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [inputText, setInputText] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);
  
  // Mobile navigation state (on mobile screen, show list or chat)
  const [showMobileChatRoom, setShowMobileChatRoom] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist conversations
  useEffect(() => {
    localStorage.setItem('bloodsearch_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // If opened with a specific donor from search/map
  useEffect(() => {
    if (initialDonor) {
      const existing = conversations.find(
        (c) => c.participantName.toLowerCase() === initialDonor.name.toLowerCase()
      );

      if (existing) {
        setActiveConvId(existing.id);
        setShowMobileChatRoom(true);
      } else {
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          participantName: initialDonor.name,
          participantRole: 'রক্তদাতা (Voluntary Donor)',
          participantAvatar: initialDonor.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          bloodGroup: initialDonor.bloodGroup,
          hospital: initialDonor.hospitalAffiliation || `${initialDonor.upazila}, ${initialDonor.district}`,
          lastMessage: 'জরুরি রক্তের প্রয়োজনে যোগাযোগ শুরু হয়েছে...',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          online: true,
          messages: [
            {
              id: `m-init-${Date.now()}`,
              senderId: 'other',
              text: lang === 'bn' 
                ? `আসসালামু আলাইকুম, আমি ${initialDonor.name} (${initialDonor.bloodGroup} রক্তদাতা)। রোগীর অবস্থা এবং কোন হাসপাতালে রক্ত লাগবে বিস্তারিত জানান।`
                : `Hello, I am ${initialDonor.name} (${initialDonor.bloodGroup} Donor). Please share the patient details and hospital name.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered',
            }
          ],
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(newConv.id);
        setShowMobileChatRoom(true);
      }
    }
  }, [initialDonor]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Send unrestricted custom message ("ja iccha sob likhte parbe")
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: userText,
            lastMessageTime: lang === 'bn' ? 'এইমাত্র' : 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText('');

    // Realistic human peer response simulation after 1.2s
    setTimeout(() => {
      let donorReply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('কখন') || lower.includes('সময়') || lower.includes('when') || lower.includes('time')) {
        donorReply = lang === 'bn'
          ? 'আমি ইনশাআল্লাহ ২০ থেকে ২৫ মিনিটের মধ্যে পৌঁছাতে পারব। আপনি রিসেপশনের কাছে আছেন তো?'
          : 'I can reach there in about 20-25 minutes inshaAllah. Are you near the reception?';
      } else if (lower.includes('কোথায়') || lower.includes('হাসপাতাল') || lower.includes('location') || lower.includes('hospital')) {
        donorReply = lang === 'bn'
          ? 'ঠিক আছে, আমি লোকেশন পেয়েছি। আমি রওনা হচ্ছি, পৌঁছে আপনাকে ফোন দেব।'
          : 'Got the hospital location! I am heading out now and will call you on arrival.';
      } else if (lower.includes('কত ব্যাগ') || lower.includes('ব্যাগ') || lower.includes('bag') || lower.includes('unit')) {
        donorReply = lang === 'bn'
          ? 'আমি ১ ব্যাগ দিতে পারব। লাগলে আমার আরও একজন বন্ধু রক্তদাতার সাথে যোগাযোগ করিয়ে দিতে পারি।'
          : 'I can donate 1 bag. If you need more, I can connect you with another fellow donor.';
      } else {
        donorReply = lang === 'bn'
          ? 'জি ভাইয়া, আমি সম্পূর্ণ প্রস্তুত। রোগীর কোনো ক্রস-ম্যাচিং স্লিপ থাকলে তৈরি রাখুন, আমি দ্রুত আসছি।'
          : 'Yes, I am ready to donate. Please keep the cross-matching slip ready, on my way!';
      }

      const replyMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        senderId: 'other',
        text: donorReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              lastMessage: donorReply,
              lastMessageTime: lang === 'bn' ? 'এইমাত্র' : 'Just now',
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  // Quick emergency prompt chips
  const handleSendQuickInfo = (quickText: string) => {
    setInputText(quickText);
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.participantName.toLowerCase().includes(q) ||
      c.hospital.toLowerCase().includes(q) ||
      c.bloodGroup.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-sm border border-slate-300 dark:border-slate-700 h-[640px] flex flex-col md:flex-row transition-all text-left">
      {/* ===================================================================== */}
      {/* LEFT COLUMN: CONVERSATION LIST (Hidden on mobile if room active) */}
      {/* ===================================================================== */}
      <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50 dark:bg-[#0f172a] ${
        showMobileChatRoom ? 'hidden md:flex' : 'flex h-full'
      }`}>
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                💬
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {lang === 'bn' ? 'রক্তদাতা ও রোগীর চ্যাট' : 'Donor & Recipient Chat'}
                </h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                  {lang === 'bn' ? 'সরাসরি ব্যক্তি-থেকে-ব্যক্তি যোগাযোগ' : 'Direct Peer-to-Peer Messaging (No AI)'}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-mono">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'রক্তদাতার নাম বা গ্রুপ দিয়ে খুঁজুন...' : 'Search donor chats...'}
              className="w-full h-8 pl-8 pr-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setShowMobileChatRoom(true);
                  setConversations((prev) =>
                    prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                  );
                }}
                className={`w-full p-3 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-rose-50/80 dark:bg-rose-950/40'
                    : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.participantAvatar}
                    alt={conv.participantName}
                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800"
                  />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {conv.participantName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {conv.lastMessageTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white">
                      {conv.bloodGroup}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {conv.hospital}
                    </span>
                  </div>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* RIGHT COLUMN: ACTIVE CHAT ROOM (Visible on desktop or when active) */}
      {/* ===================================================================== */}
      <div className={`flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-[#0b0f19] ${
        !showMobileChatRoom ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Chat Header Bar */}
        <div className="p-3 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#1e293b]">
          <div className="flex items-center gap-2.5">
            {/* Mobile Back to List button */}
            <button
              onClick={() => setShowMobileChatRoom(false)}
              className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="relative">
              <img
                src={activeConv.participantAvatar}
                alt={activeConv.participantName}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-rose-500/30"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {activeConv.participantName}
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-black text-[10px]">
                  {activeConv.bloodGroup}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
                {activeConv.participantRole || 'স্বেচ্ছাসেবী রক্তদাতা'} · {activeConv.hospital}
              </p>
            </div>
          </div>

          {/* Action buttons on right */}
          <div className="flex items-center gap-1.5">
            <a
              href="tel:+880174333969"
              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
              title="সরাসরি কল দিন"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3">
          <div className="text-center my-1">
            <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
              {lang === 'bn' ? 'সরাসরি ডোনার-রোগী চ্যাট · নিরাপদ ও এনক্রিপ্টেড' : 'Direct Peer-to-Peer Blood Emergency Chat'}
            </span>
          </div>

          {activeConv.messages.map((msg) => {
            const isMe = msg.senderId === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {msg.isVoice ? (
                  /* Audio Voice Note Bubble */
                  <div
                    className={`p-3 rounded-2xl flex items-center gap-2.5 max-w-[85%] sm:max-w-xs shadow-md ${
                      isMe
                        ? 'bg-rose-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setIsPlayingVoice(isPlayingVoice === msg.id ? null : msg.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow shrink-0 ${
                        isMe ? 'bg-white text-rose-600' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isPlayingVoice === msg.id ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-[120px]">
                      <div className="flex items-center gap-0.5 h-5">
                        {[6, 12, 18, 10, 22, 14, 20, 24, 16, 12, 18, 14, 8, 16, 20, 10, 6].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${
                              isPlayingVoice === msg.id
                                ? isMe ? 'bg-white animate-pulse' : 'bg-rose-600 animate-pulse'
                                : isMe ? 'bg-white/60' : 'bg-slate-400'
                            }`}
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
                        <span>{msg.voiceDuration || '0:42'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard text message bubble */
                  <div
                    className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-rose-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-mono px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-rose-500" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Emergency Prompt Chips */}
        <div className="px-3 pt-1.5 pb-1 bg-white/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
          <span className="text-slate-400 shrink-0 font-bold">দ্রুত বার্তা:</span>
          {[
            'জরুরি ঢাকা মেডিকেল ২ ব্যাগ রক্ত প্রয়োজন',
            'আপনি এখন কোন এলাকায় আছেন?',
            'আমরা ওটির সামনে অপেক্ষা করছি',
            'রক্তদানের পর গাড়ি ভাড়া দেওয়া হবে',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuickInfo(prompt)}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar (Allows typing literally anything - "ja iccha sob likhte parbe") */}
        <form
          onSubmit={handleSendMessage}
          className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={lang === 'bn' ? 'এখানে আপনার বার্তা লিখুন (যেকোনো তথ্য লিখুন)...' : 'Type your message to the donor...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 h-10 px-3.5 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-[#0f172a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-rose-500 placeholder:text-slate-400"
          />

          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer shrink-0"
            title="বার্তা পাঠান"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
