
import React, { useState, useEffect } from 'react';
import { getCandidates, COHORTS } from '../services/mockDatabase';
import { createScoreCard, getScoreCards } from '../services/firebase';
import { generatePerformanceReport } from '../services/reportService';
import { Role, ScoreCard, User } from '../types';
import { Plus, CheckCircle2, ChevronDown, ChevronUp, Calculator, Calendar, User as UserIcon, Download, Loader2 } from 'lucide-react';

interface PerformanceProps {
    role?: Role;
    user?: User | null;
}

const Performance: React.FC<PerformanceProps> = ({ role = Role.EMPLOYEE, user }) => {
  const isManager = role === Role.TECH_CHAMPION || role === Role.MANAGER || role === Role.ADMIN;
  const [activeTab, setActiveTab] = useState<'history' | 'submit'>('history');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Data State
  const [scoreCards, setScoreCards] = useState<ScoreCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [week, setWeek] = useState<number>(getCurrentWeek());
  
  // Metrics State
  const [attendance, setAttendance] = useState(100);
  const [communication, setCommunication] = useState(70);
  const [accountability, setAccountability] = useState(70);
  const [creativity, setCreativity] = useState(70);
  const [objectDelivery, setObjectDelivery] = useState(70);
  const [techSkills, setTechSkills] = useState(70);
  
  const [comments, setComments] = useState('');

  const candidates = getCandidates();

  useEffect(() => {
    fetchScoreCards();
  }, [role, user]);

  const fetchScoreCards = async () => {
      setIsLoading(true);
      const allCards = await getScoreCards();
      
      if (role === Role.EMPLOYEE && user) {
          // Filter for current user only
          setScoreCards(allCards.filter(c => c.candidateId === user.id));
      } else {
          // Managers see all
          setScoreCards(allCards);
      }
      setIsLoading(false);
  };

  function getCurrentWeek() {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    const millisecs = Math.floor((d.getTime() - onejan.getTime()) / 86400000);
    return Math.ceil((millisecs + onejan.getDay() + 1) / 7);
  }

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
        newExpanded.delete(id);
    } else {
        newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const calculateAverage = (scores: number[]) => {
      const total = scores.reduce((a, b) => a + b, 0);
      return Math.round(total / scores.length);
  };

  const currentAverage = calculateAverage([attendance, communication, accountability, creativity, objectDelivery, techSkills]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedCandidate) {
          alert("Please select a candidate");
          return;
      }
      
      const candidateObj = candidates.find(c => c.id === selectedCandidate);
      if (!candidateObj) {
          alert("Candidate details not found");
          return;
      }

      setIsSubmitting(true);

      const newCard: Omit<ScoreCard, 'id'> = {
          candidateId: selectedCandidate,
          candidateName: candidateObj.name,
          reviewerName: user?.name || 'Reviewer',
          date: new Date().toISOString().split('T')[0],
          week,
          attendance,
          communication,
          accountability,
          creativityOwnership: creativity,
          objectDelivery,
          techSkills,
          comments
      };

      const result = await createScoreCard(newCard);
      
      setIsSubmitting(false);

      if (result.success) {
          alert("Scorecard submitted successfully!");
          // Reset form
          setComments('');
          setAttendance(100);
          setCommunication(70);
          setAccountability(70);
          setCreativity(70);
          setObjectDelivery(70);
          setTechSkills(70);
          setWeek(getCurrentWeek());
          setActiveTab('history');
          fetchScoreCards();
      } else {
          alert("Error creating scorecard: " + result.error);
      }
  };

  const handleExport = () => {
    // For demo purposes, we grab the first unique candidate in the list or the current user
    const targetName = role === Role.EMPLOYEE ? user?.name : scoreCards[0]?.candidateName;
    
    if (!targetName) {
        alert("No scorecard data available to export.");
        return;
    }
    
    // Filter cards for this user
    const userCards = scoreCards.filter(c => c.candidateName === targetName);
    
    if (userCards.length > 0) {
        // Attempt to find cohort name from candidates list
        const cObj = candidates.find(c => c.name === targetName);
        const cohortId = cObj?.cohortId;
        const cohortName = COHORTS.find(c => c.id === cohortId)?.name || "CAPACITI Cohort";

        generatePerformanceReport(targetName, cohortName, userCards);
    } else {
        alert("No records found to generate report.");
    }
  };

  const MetricSlider = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
        <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={value} 
                    onChange={(e) => {
                        const val = Math.max(0, Math.min(100, Number(e.target.value)));
                        onChange(val);
                    }}
                    className="w-12 text-right text-sm font-bold outline-none text-blue-600 bg-white"
                />
                <span className="text-xs text-slate-400 font-medium">%</span>
            </div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wide">
            <span>Poor (0)</span>
            <span>Average (50)</span>
            <span>Excellent (100)</span>
        </div>
    </div>
  );

  const StatBadge = ({ label, value }: { label: string, value: number }) => (
      <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg border border-slate-100 min-w-[80px]">
          <span className="text-[10px] text-slate-500 uppercase font-bold">{label}</span>
          <span className={`text-lg font-bold ${value >= 80 ? 'text-green-600' : value >= 60 ? 'text-blue-600' : 'text-orange-500'}`}>
              {value}%
          </span>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Performance Management</h2>
          <p className="text-slate-500">
             {isManager ? 'Evaluate candidate progress using the weekly scorecard.' : 'View your weekly score cards and feedback.'}
          </p>
        </div>
        
        <div className="flex gap-2">
            {!isManager && (
                <button 
                  onClick={handleExport}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm flex items-center gap-2"
                >
                   <Download size={16} /> Export Report (PDF)
                </button>
            )}

            {isManager && (
                <>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        View History
                    </button>
                    <button 
                        onClick={() => setActiveTab('submit')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'submit' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                    >
                        <Plus size={16} /> New Scorecard
                    </button>
                </>
            )}
        </div>
      </div>

      {activeTab === 'submit' && isManager ? (
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
                  <div>
                      <h3 className="text-xl font-bold text-slate-800">New Performance Assessment</h3>
                      <p className="text-slate-500 text-sm mt-1">Rate the candidate across all key performance indicators.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                      <Calculator size={20} className="text-blue-600" />
                      <div className="text-right">
                          <p className="text-xs text-slate-500 font-bold uppercase">Average Score</p>
                          <p className={`text-2xl font-bold ${currentAverage >= 80 ? 'text-green-600' : currentAverage >= 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                              {currentAverage}%
                          </p>
                      </div>
                  </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                              <UserIcon size={16} /> Select Candidate
                          </label>
                          <select 
                            value={selectedCandidate}
                            onChange={(e) => setSelectedCandidate(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            required
                          >
                              <option value="">Choose a candidate...</option>
                              {/* Group Candidates by Cohort for easier selection */}
                              {COHORTS.map(cohort => {
                                  const cohortCandidates = candidates.filter(c => c.cohortId === cohort.id);
                                  if (cohortCandidates.length === 0) return null;
                                  return (
                                      <optgroup key={cohort.id} label={`${cohort.name} (${cohortCandidates.length})`}>
                                          {cohortCandidates.map(c => (
                                              <option key={c.id} value={c.id}>{c.name}</option>
                                          ))}
                                      </optgroup>
                                  );
                              })}
                              {/* Candidates without Cohorts */}
                              <optgroup label="Unassigned">
                                {candidates.filter(c => !c.cohortId).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </optgroup>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                              <Calendar size={16} /> Week Number
                          </label>
                          <input 
                              type="number"
                              min="1"
                              max="52"
                              value={week}
                              onChange={(e) => setWeek(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                              required
                          />
                      </div>
                  </div>
                  
                  <div>
                      <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                          <CheckCircle2 size={18} className="text-blue-600"/>
                          Performance Metrics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <MetricSlider label="Attendance" value={attendance} onChange={setAttendance} />
                          <MetricSlider label="Tech Skills" value={techSkills} onChange={setTechSkills} />
                          <MetricSlider label="Object Delivery" value={objectDelivery} onChange={setObjectDelivery} />
                          <MetricSlider label="Communication" value={communication} onChange={setCommunication} />
                          <MetricSlider label="Accountability" value={accountability} onChange={setAccountability} />
                          <MetricSlider label="Creativity & Ownership" value={creativity} onChange={setCreativity} />
                      </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <label className="block text-sm font-bold text-slate-800 mb-2">Reviewer Comments</label>
                      <p className="text-xs text-slate-500 mb-3">Provide detailed context for the scores above.</p>
                      <textarea 
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-4 text-sm h-32 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm"
                        placeholder="e.g. John showed great initiative this week but struggled with the advanced React concepts..."
                        required
                      ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setActiveTab('history')} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancel</button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70"
                      >
                         {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : null}
                         <span>{isSubmitting ? 'Submitting...' : 'Submit Assessment'}</span>
                      </button>
                  </div>
              </form>
          </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {isLoading ? (
                <div className="p-12 flex justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 w-10"></th>
                                    <th className="px-6 py-4 whitespace-nowrap">Week</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Candidate</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Reviewer</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-center">Average Score</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {scoreCards.map(card => {
                                    const avg = calculateAverage([
                                        card.attendance, 
                                        card.communication, 
                                        card.accountability, 
                                        card.creativityOwnership, 
                                        card.objectDelivery, 
                                        card.techSkills
                                    ]);
                                    const isExpanded = expandedRows.has(card.id);

                                    return (
                                        <React.Fragment key={card.id}>
                                            <tr 
                                                className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                                                onClick={() => toggleRow(card.id)}
                                            >
                                                <td className="px-6 py-4 text-slate-400">
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-700">Week {card.week}</td>
                                                <td className="px-6 py-4 text-slate-500">{card.date}</td>
                                                <td className="px-6 py-4 font-medium text-slate-800">{card.candidateName}</td>
                                                <td className="px-6 py-4 text-slate-500">{card.reviewerName}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs border ${
                                                        avg >= 80 ? 'bg-green-100 text-green-700 border-green-200' : 
                                                        avg >= 60 ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                                        'bg-orange-100 text-orange-700 border-orange-200'
                                                    }`}>
                                                        {avg}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                                        {isExpanded ? 'Hide Details' : 'View Details'}
                                                    </span>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-slate-50">
                                                    <td colSpan={7} className="px-6 pb-6 pt-0 border-b border-slate-200">
                                                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-inner animate-in slide-in-from-top-2 fade-in duration-200">
                                                            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                                                                <StatBadge label="Attendance" value={card.attendance} />
                                                                <StatBadge label="Tech Skills" value={card.techSkills} />
                                                                <StatBadge label="Delivery" value={card.objectDelivery} />
                                                                <StatBadge label="Comm." value={card.communication} />
                                                                <StatBadge label="Account." value={card.accountability} />
                                                                <StatBadge label="Creativity" value={card.creativityOwnership} />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Reviewer Comments</h5>
                                                                <p className="text-slate-700 text-sm leading-relaxed italic bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                                    "{card.comments}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {scoreCards.length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                            No scorecards found.
                        </div>
                    )}
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default Performance;