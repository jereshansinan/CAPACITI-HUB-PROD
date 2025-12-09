
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Role, ChatMessage, User, Announcement } from '../types';
import { getAnnouncements, getDashboardStats, DashboardStats } from '../services/firebase';
import { getPolicyResponse } from '../services/geminiService';
import { Users, FileText, CheckCircle, Clock, ExternalLink, Calendar, HelpCircle, Bell, MessageSquare, X, Send, Bot, Loader2, Megaphone } from 'lucide-react';

const DEFAULT_ANNOUNCEMENT_IMAGE = "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000";

const StatCard: React.FC<{ title: string; value: string; icon: any; color: string; loading?: boolean }> = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 transition-transform hover:scale-[1.02]">
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      {loading ? (
          <div className="h-8 w-24 bg-slate-100 animate-pulse rounded mt-1"></div>
      ) : (
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      )}
    </div>
  </div>
);

interface DashboardProps {
    role: Role;
    user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ role, user }) => {
  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your CAPACITI AI Assistant. How can I help you with policies or information today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Stats State
  const [stats, setStats] = useState<DashboardStats>({ stat1: '-', stat2: '-', stat3: '-', stat4: '-' });
  const [loadingStats, setLoadingStats] = useState(true);

  const userCohortId = user?.cohortId;

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch News
      setLoadingNews(true);
      const newsData = await getAnnouncements();
      setAnnouncements(newsData);
      setLoadingNews(false);

      // 2. Fetch Stats
      if (user) {
        setLoadingStats(true);
        const statsData = await getDashboardStats(role, user.id, userCohortId);
        setStats(statsData);
        setLoadingStats(false);
      }
    };
    fetchData();
  }, [role, user, userCohortId]);

  // Filter Announcements
  const visibleAnnouncements = useMemo(() => {
    if (loadingNews) return [];
    
    if (role !== Role.EMPLOYEE) {
      // Admins/Managers see all announcements
      return announcements;
    }
    // Employees see Global announcements OR those targeted to their cohort
    return announcements.filter(a => !a.targetCohortId || a.targetCohortId === 'All' || a.targetCohortId === userCohortId);
  }, [role, userCohortId, announcements, loadingNews]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Format history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await getPolicyResponse(history, userText);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm sorry, I couldn't process that.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsThinking(false);
    }
  };

  const displayName = user?.name || role.split('/')[0];

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, {displayName}</h1>
          <p className="text-slate-500">Here is what's happening in the hub today.</p>
        </div>
        <div className="text-sm text-slate-400">
           {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {role === Role.EMPLOYEE && (
          <>
            <StatCard title="Leave Accrued" value={stats.stat1} icon={Clock} color="bg-blue-600" loading={loadingStats} />
            <StatCard title="Requests" value={stats.stat2} icon={FileText} color="bg-orange-500" loading={loadingStats} />
            <StatCard title="Certificates" value={stats.stat3} icon={CheckCircle} color="bg-green-500" loading={loadingStats} />
            <StatCard title="Performance" value={stats.stat4} icon={CheckCircle} color="bg-purple-500" loading={loadingStats} />
          </>
        )}
        {(role === Role.TECH_CHAMPION || role === Role.MANAGER || role === Role.ADMIN) && (
          <>
            <StatCard title="Candidates" value={stats.stat1} icon={Users} color="bg-indigo-600" loading={loadingStats} />
            <StatCard title="Attention Needed" value={stats.stat2} icon={Clock} color="bg-red-500" loading={loadingStats} />
            <StatCard title="Attendance" value={stats.stat3} icon={CheckCircle} color="bg-green-500" loading={loadingStats} />
            <StatCard title="Reviews" value={stats.stat4} icon={FileText} color="bg-blue-500" loading={loadingStats} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Bell size={18} className="text-blue-600" />
                        Company Announcements
                    </h3>
                </div>
                <div className="space-y-6">
                    {loadingNews ? (
                        <div className="flex justify-center py-8">
                            <Loader2 size={30} className="animate-spin text-blue-600" />
                        </div>
                    ) : visibleAnnouncements.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Megaphone className="mx-auto mb-2 opacity-50" size={32} />
                            <p>No new announcements for you.</p>
                        </div>
                    ) : (
                        visibleAnnouncements.map((announcement) => (
                            <div key={announcement.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                <div className="h-40 w-full overflow-hidden relative bg-slate-200">
                                    <img 
                                        src={announcement.imageUrl || DEFAULT_ANNOUNCEMENT_IMAGE} 
                                        alt={announcement.title}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = DEFAULT_ANNOUNCEMENT_IMAGE;
                                        }}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-3 left-4 text-white flex gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
                                            announcement.type === 'Urgent' ? 'bg-red-600' : 
                                            announcement.type === 'Event' ? 'bg-green-600' : 'bg-blue-600'
                                        }`}>
                                            {announcement.type}
                                        </span>
                                        {announcement.targetCohortName && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 shadow-sm">
                                                {announcement.targetCohortName}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm border border-white/20">
                                            {announcement.date}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                    <h4 className="font-bold text-lg text-slate-900 mb-1">{announcement.title}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{announcement.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="font-semibold text-slate-800 mb-4">Quick Links</h3>
                 <div className="space-y-2">
                     <a 
                       href="https://outlook.office.com/calendar/view/month" 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors"
                     >
                         <Calendar size={18} />
                         <span className="text-sm font-medium">Outlook Calendar</span>
                         <ExternalLink size={14} className="ml-auto opacity-50" />
                     </a>
                     <a 
                       href="https://teams.microsoft.com/" 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors"
                     >
                         <Users size={18} />
                         <span className="text-sm font-medium">Microsoft Teams</span>
                         <ExternalLink size={14} className="ml-auto opacity-50" />
                     </a>
                     <a 
                       href="https://www.sadag.org/" 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors"
                     >
                         <HelpCircle size={18} />
                         <span className="text-sm font-medium">Wellness Portal</span>
                         <ExternalLink size={14} className="ml-auto opacity-50" />
                     </a>
                 </div>
             </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isChatOpen && (
          <div className="w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-white/20 rounded-full">
                      <Bot size={18} />
                   </div>
                   <div>
                      <h3 className="font-bold text-sm">AI Assistant</h3>
                      <p className="text-xs text-blue-100 opacity-90">Powered by Gemini</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                   <X size={18} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                {messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                         msg.role === 'user' 
                           ? 'bg-blue-600 text-white rounded-br-none' 
                           : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-none'
                      }`}>
                         {msg.text}
                      </div>
                   </div>
                ))}
                {isThinking && (
                   <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl rounded-bl-none shadow-sm flex items-center gap-2">
                         <Loader2 size={14} className="animate-spin text-blue-600" />
                         <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                      </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
             </div>

             <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                   <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about policies..."
                      className="flex-1 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
                   />
                   <button 
                      type="submit" 
                      disabled={!inputValue.trim() || isThinking}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <Send size={18} />
                   </button>
                </form>
             </div>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
             isChatOpen 
               ? 'bg-slate-800 text-white rotate-90' 
               : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
          }`}
        >
           {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
