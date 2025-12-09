
import React, { useState, useMemo } from 'react';
import { analyzeCandidateRisk } from '../services/geminiService';
import { CANDIDATE_METRICS, COHORTS } from '../services/mockDatabase';
import { CandidateMetric } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BrainCircuit, RefreshCw, AlertTriangle, TrendingUp, UserCheck, Users, Filter } from 'lucide-react';

const RiskAnalytics: React.FC = () => {
  const [data, setData] = useState<CandidateMetric[]>(CANDIDATE_METRICS);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCohort, setSelectedCohort] = useState('All');

  const cohorts = ['All', ...COHORTS.map(c => c.name)];

  const runAnalysis = async () => {
    setAnalyzing(true);
    // Analyze all data (in a real app, maybe just the filtered subset to save tokens)
    const enrichedData = await analyzeCandidateRisk(data);
    setData(enrichedData);
    setLastUpdated(new Date());
    setAnalyzing(false);
  };

  const filteredData = useMemo(() => {
    if (selectedCohort === 'All') return data;
    return data.filter(d => d.cohortName === selectedCohort);
  }, [data, selectedCohort]);

  const getRiskColor = (level?: string) => {
    switch(level) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const riskDistribution = [
    { name: 'High Risk', value: filteredData.filter(c => c.riskLevel === 'High').length, color: '#ef4444' },
    { name: 'Medium Risk', value: filteredData.filter(c => c.riskLevel === 'Medium').length, color: '#f59e0b' },
    { name: 'Low Risk', value: filteredData.filter(c => c.riskLevel === 'Low').length, color: '#10b981' },
  ].filter(d => d.value > 0);

  // Custom Tick to wrap text
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const parts = payload.value.split(' ');
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#64748b" fontSize={11}>
                {parts.map((part: string, index: number) => (
                    <tspan x="0" dy={index === 0 ? 0 : 12} key={index}>
                        {part}
                    </tspan>
                ))}
            </text>
        </g>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            Progress & Risk Analyzer
          </h2>
          <p className="text-slate-500">AI-driven predictive analytics for candidate retention.</p>
        </div>
        
        <div className="flex gap-3">
            <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    value={selectedCohort}
                    onChange={(e) => setSelectedCohort(e.target.value)}
                    className="pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium text-slate-700 min-w-[200px]"
                >
                    {cohorts.map(c => <option key={c} value={c}>{c === 'All' ? 'All Cohorts' : c}</option>)}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-all disabled:opacity-70"
            >
            {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            <span>{analyzing ? 'Processing Data...' : 'Run AI Analysis'}</span>
            </button>
        </div>
      </div>

      {!lastUpdated && !analyzing && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="text-blue-600 mt-1" size={20} />
            <div>
                <p className="font-medium text-blue-900">Analysis Required</p>
                <p className="text-sm text-blue-700">The current data reflects raw metrics. Click "Run AI Analysis" to let Gemini calculate risk scores and identify at-risk candidates.</p>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-6">Technical vs Risk Correlation</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{bottom: 20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    interval={0} 
                    tick={<CustomXAxisTick />}
                />
                <YAxis />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="technicalScore" name="Tech Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="riskScore" name="AI Risk Score" radius={[4, 4, 0, 0]}>
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.riskLevel)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-2">Risk Distribution</h3>
          {lastUpdated ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 text-xs">
                    {riskDistribution.map(d => (
                        <div key={d.name} className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                            <span>{d.name}</span>
                        </div>
                    ))}
                </div>
              </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
                <p>Run analysis to view</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Candidate Insights</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Candidate</th>
                <th className="px-6 py-3">Cohort</th>
                <th className="px-6 py-3">Attendance</th>
                <th className="px-6 py-3">Tech Score</th>
                <th className="px-6 py-3">Risk Level</th>
                <th className="px-6 py-3 w-1/3">AI Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <UserCheck size={16} />
                    </div>
                    {candidate.name}
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{candidate.cohortName || 'Unassigned'}</span>
                        {candidate.sponsor && <span className="text-xs text-indigo-600 font-medium">{candidate.sponsor} Sponsored</span>}
                     </div>
                  </td>
                  <td className="px-6 py-4">{candidate.attendance}%</td>
                  <td className="px-6 py-4">{candidate.technicalScore}/100</td>
                  <td className="px-6 py-4">
                    {candidate.riskLevel ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        candidate.riskLevel === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                        candidate.riskLevel === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {candidate.riskLevel} Risk
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 italic">
                    {candidate.aiAnalysis || "Pending analysis..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
            <div className="p-8 text-center text-slate-500">
                No candidates found for this cohort.
            </div>
        )}
      </div>
    </div>
  );
};

export default RiskAnalytics;
