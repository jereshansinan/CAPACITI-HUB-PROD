
import React, { useState, useEffect } from 'react';
import { Role, FeedbackEntry, User } from '../types';
import { analyzeStudentFeedback } from '../services/geminiService';
import { createFeedback, getFeedback } from '../services/firebase';
import { MessageSquareQuote, Send, Sparkles, AlertTriangle, CheckCircle, BarChart3, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StudentFeedbackProps {
  role: Role;
  user?: User | null;
}

const StudentFeedback: React.FC<StudentFeedbackProps> = ({ role, user }) => {
  const isEmployee = role === Role.EMPLOYEE;
  
  // --- EMPLOYEE STATE ---
  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState<'Course' | 'Test' | 'Project' | 'General'>('Course');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [myHistory, setMyHistory] = useState<FeedbackEntry[]>([]);

  // --- STAFF STATE ---
  const [staffFeedbackList, setStaffFeedbackList] = useState<FeedbackEntry[]>([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        if (isEmployee && user) {
            const data = await getFeedback(user.id);
            setMyHistory(data);
        } else if (!isEmployee) {
            const data = await getFeedback();
            setStaffFeedbackList(data);
        }
        setIsLoading(false);
    };
    fetchData();
  }, [role, user, isEmployee]);

  // --- HANDLERS ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!user) {
        alert("You must be logged in to submit feedback.");
        return;
    }

    setIsSubmitting(true);

    try {
      // 1. Analyze with Gemini
      const analysis = await analyzeStudentFeedback(inputText, category);

      // 2. Create Entry Object
      const newEntry: Omit<FeedbackEntry, 'id'> = {
        userId: user.id,
        userName: user.name,
        date: new Date().toISOString().split('T')[0], // Use ISO date for consistency
        category,
        content: inputText,
        sentiment: analysis.sentiment || 'Neutral',
        topics: analysis.topics || [],
        aiSummary: analysis.aiSummary || 'No summary available.',
        urgency: analysis.urgency || 'Low'
      };

      // 3. Save to Firebase
      const result = await createFeedback(newEntry);

      if (result.success) {
          // 4. Update Local State (optimistic update or re-fetch)
          const completeEntry = { ...newEntry, id: Date.now().toString() } as FeedbackEntry;
          setMyHistory([completeEntry, ...myHistory]);
          
          setInputText('');
          setSubmissionSuccess(true);
          setTimeout(() => setSubmissionSuccess(false), 3000);
      } else {
          alert("Failed to submit feedback: " + result.error);
      }

    } catch (error) {
      console.error("Submission error", error);
      alert("An error occurred while analyzing your feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ANALYTICS CALCULATIONS ---
  const sentimentCounts = [
    { name: 'Positive', value: staffFeedbackList.filter(f => f.sentiment === 'Positive').length, color: '#10b981' },
    { name: 'Neutral', value: staffFeedbackList.filter(f => f.sentiment === 'Neutral').length, color: '#94a3b8' },
    { name: 'Negative', value: staffFeedbackList.filter(f => f.sentiment === 'Negative').length, color: '#ef4444' }
  ];

  const urgencyHighCount = staffFeedbackList.filter(f => f.urgency === 'High').length;
  
  const filteredList = filter === 'All' 
    ? staffFeedbackList 
    : staffFeedbackList.filter(f => f.category === filter);


  // --- RENDER ---

  if (isEmployee) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquareQuote className="text-blue-600" />
            My Voice
          </h2>
          <p className="text-slate-500">Share your thoughts on courses, projects, and tests. Your feedback helps us improve.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           {submissionSuccess ? (
             <div className="text-center py-8 animate-in fade-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Feedback Received!</h3>
                <p className="text-slate-500 mt-2">Thank you for sharing. Your input has been analyzed and sent to the team.</p>
                <button onClick={() => setSubmissionSuccess(false)} className="mt-6 text-blue-600 hover:underline">Submit more feedback</button>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">What is this regarding?</label>
                   <div className="flex gap-2">
                      {['Course', 'Test', 'Project', 'General'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat as any)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            category === cat 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Your Feedback</label>
                   <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Tell us about your experience, what went well, or what could be improved..."
                      className="w-full h-40 p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-900"
                   ></textarea>
                </div>

                <div className="flex justify-between items-center pt-2">
                   <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Sparkles size={14} className="text-purple-500" />
                      <span>AI will analyze your feedback for urgency & sentiment.</span>
                   </div>
                   <button
                      type="submit"
                      disabled={isSubmitting || !inputText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                   >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      <span>Submit Feedback</span>
                   </button>
                </div>
             </form>
           )}
        </div>

        {myHistory.length > 0 && (
          <div className="space-y-4">
             <h3 className="font-semibold text-slate-800">Recent Submissions</h3>
             {isLoading ? (
                 <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-400" /></div>
             ) : (
                myHistory.map((entry) => (
                    <div key={entry.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm opacity-75">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase">{entry.category}</span>
                            <span className="text-xs text-slate-400">{entry.date}</span>
                        </div>
                        <p className="text-slate-700 text-sm mb-3">"{entry.content}"</p>
                    </div>
                ))
             )}
          </div>
        )}
      </div>
    );
  }

  // --- STAFF DASHBOARD VIEW ---

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            Student Voice Analytics
          </h2>
          <p className="text-slate-500">AI-powered insights from student feedback.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
           {['All', 'Course', 'Test', 'Project', 'General'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === f ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
           ))}
        </div>
      </div>
      
      {isLoading ? (
          <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sentiment Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-slate-400" /> Sentiment Overview
                    </h3>
                    <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sentimentCounts} layout="vertical" margin={{ left: 0, right: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                {sentimentCounts.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </div>

                {/* Urgency Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center">
                    <div className={`p-4 rounded-full mb-3 ${urgencyHighCount > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                    <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">{urgencyHighCount}</h3>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">High Urgency Items</p>
                    <p className="text-xs text-slate-400 mt-2">Requires immediate attention</p>
                </div>

                {/* Topics Cloud */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">Trending Topics</h3>
                    <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(staffFeedbackList.flatMap(f => f.topics))).slice(0, 10).map((topic, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium hover:bg-slate-200 cursor-default">
                            #{topic}
                        </span>
                    ))}
                    </div>
                </div>
            </div>

            {/* Detailed Feed */}
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Feedback Feed</h3>
                <div className="grid grid-cols-1 gap-4">
                    {filteredList.map((entry) => (
                    <div key={entry.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            entry.urgency === 'High' ? 'bg-red-500' : entry.urgency === 'Medium' ? 'bg-orange-400' : 'bg-green-400'
                        }`}></div>
                        
                        <div className="flex justify-between items-start mb-3 pl-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                {entry.userName.charAt(0)}
                                </div>
                                <div>
                                <p className="text-sm font-bold text-slate-800">{entry.userName}</p>
                                <p className="text-xs text-slate-500">{entry.date} • {entry.category}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                entry.sentiment === 'Positive' ? 'text-green-600 bg-green-50' :
                                entry.sentiment === 'Negative' ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50'
                            }`}>
                                {entry.sentiment}
                            </span>
                        </div>

                        <p className="text-slate-800 text-sm mb-4 pl-2 leading-relaxed">"{entry.content}"</p>

                        <div className="bg-slate-50 p-3 rounded-lg ml-2 flex gap-3 items-start border border-slate-100">
                            <Sparkles size={16} className="text-purple-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-purple-700 mb-1">AI Analysis</p>
                                <p className="text-xs text-slate-600">{entry.aiSummary}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                {entry.topics.map(t => (
                                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                                        {t}
                                    </span>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    ))}
                    {filteredList.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            No feedback entries found.
                        </div>
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default StudentFeedback;
