
import React, { useState } from 'react';
import { Role, User } from '../types';
import { loginUser } from '../services/firebase';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, Key, Copy, Check } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // isStaff = true means Overlay is on the Right, Staff Form (Left) is visible
  // isStaff = false means Overlay is on the Left, Candidate Form (Right) is visible
  const [isStaff, setIsStaff] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState('');

  const DEMO_LOGINS = [
      { role: 'Admin', email: 'kalebe.n@capaciti.org', desc: 'Full system access' },
      { role: 'Manager', email: 'kefiloe.m@capaciti.org', desc: 'Approvals & Team View' },
      { role: 'Tech Champion', email: 'dikgobe.m@capaciti.org', desc: 'Cohorts & Scorecards' },
      { role: 'Candidate', email: 'jereshan.s@capaciti.org', desc: 'Student Portal' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Firebase Login Logic
    const result = await loginUser(email, password);

    if (result.success && result.user) {
        const userRole = result.user.role;

        // --- ENFORCE PORTAL ACCESS CONTROL ---
        if (isStaff) {
            // Staff Portal: Candidates NOT allowed
            if (userRole === Role.EMPLOYEE) {
                setErrorMsg("Access Denied: Please sign in via the Candidate Portal.");
                setIsLoading(false);
                return;
            }
        } else {
            // Candidate Portal: Only Candidates allowed
            if (userRole !== Role.EMPLOYEE) {
                setErrorMsg("Access Denied: Staff members must use the Staff Portal.");
                setIsLoading(false);
                return;
            }
        }

        // Login Successful - Pass full user object
        onLogin(result.user);
    } else {
        // Login Failed - Map raw errors to friendly messages
        let displayError = result.error || "Authentication failed";
        
        if (displayError.includes("auth/invalid-credential") || 
            displayError.includes("auth/user-not-found") || 
            displayError.includes("auth/wrong-password")) {
            displayError = "Invalid email or password. Please check your credentials.";
        } else if (displayError.includes("auth/too-many-requests")) {
            displayError = "Too many failed attempts. Please try again later.";
        } else if (displayError.includes("auth/network-request-failed")) {
            displayError = "Network error. Please check your internet connection.";
        }

        setErrorMsg(displayError);
    }

    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedEmail(text);
      setEmail(text); // Auto-fill input
      setTimeout(() => setCopiedEmail(''), 2000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://capaciti.org.za/wp-content/uploads/2025/10/Capaciti-OG-Image.png')" }}
    >
      
      {/* Lightened Overlay: Very transparent to show background */}
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]"></div>

      {/* Main Container: High transparency */}
      <div className="relative w-full max-w-5xl h-[650px] bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        
        {/* --- LEFT PANEL: STAFF FORM --- */}
        <div 
          className={`absolute top-0 left-0 h-full w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white/40 backdrop-blur-md transition-all duration-700 ease-in-out z-10 
          ${isStaff ? 'md:translate-x-0 opacity-100 z-20' : 'md:-translate-x-full opacity-0 z-10'}`}
        >
          <div className="max-w-sm mx-auto w-full">
             <div className="flex items-center gap-2 mb-6 text-indigo-800">
                <ShieldCheck size={28} />
                <span className="font-bold tracking-wide text-sm uppercase">Staff Portal</span>
             </div>
             <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
             <p className="text-slate-700 mb-6 font-medium">Please login to access the management dashboard.</p>

             {errorMsg && (
                 <div className="mb-4 bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 animate-in fade-in">
                     <AlertCircle size={16} className="shrink-0" />
                     <span>{errorMsg}</span>
                 </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="staff@capaciti.org.za"
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 placeholder:text-slate-500 text-sm backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 placeholder:text-slate-500 text-sm backdrop-blur-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600/90 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center space-x-2 mt-2 backdrop-blur-sm"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <span>Access Dashboard</span>}
                </button>
             </form>

             <div className="mt-6 text-center md:hidden">
                <button onClick={() => setIsStaff(false)} className="text-sm text-indigo-700 font-bold hover:underline">
                  Go to Candidate Login
                </button>
             </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: CANDIDATE FORM --- */}
        <div 
          className={`absolute top-0 right-0 h-full w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white/40 backdrop-blur-md transition-all duration-700 ease-in-out z-10
          ${!isStaff ? 'md:translate-x-0 opacity-100 z-20' : 'md:translate-x-full opacity-0 z-10'}`}
        >
          <div className="max-w-sm mx-auto w-full">
             <div className="flex items-center gap-2 mb-6 text-blue-800">
                <Loader2 size={28} className="animate-spin-slow" /> 
                <span className="font-bold tracking-wide text-sm uppercase">Talent Hub</span>
             </div>
             <h2 className="text-3xl font-bold text-slate-900 mb-2">Hello, Candidate</h2>
             <p className="text-slate-700 mb-6 font-medium">Enter your credentials to view your progress.</p>

             {errorMsg && (
                 <div className="mb-4 bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 animate-in fade-in">
                     <AlertCircle size={16} className="shrink-0" />
                     <span>{errorMsg}</span>
                 </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="candidate@capaciti.org.za"
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 placeholder:text-slate-500 text-sm backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 placeholder:text-slate-500 text-sm backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <span className="text-slate-700 font-medium">Remember me</span>
                    </label>
                    <a href="#" className="text-blue-700 hover:text-blue-800 font-bold hover:underline">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600/90 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center space-x-2 mt-2 backdrop-blur-sm"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <span>Sign In</span>}
                </button>
             </form>

             <div className="mt-6 text-center md:hidden">
                <button onClick={() => setIsStaff(true)} className="text-sm text-blue-700 font-bold hover:underline">
                  Go to Staff Login
                </button>
             </div>
          </div>
        </div>

        {/* --- OVERLAY PANEL (The Slider) --- */}
        <div 
            className={`hidden md:block absolute top-0 left-0 h-full w-1/2 transition-transform duration-700 ease-in-out z-50 overflow-hidden
            ${isStaff ? 'translate-x-full' : 'translate-x-0'}`}
        >
            <div className="h-full w-full bg-slate-900/20 backdrop-blur-xl border-x border-white/10 text-white p-12 flex flex-col justify-between relative">
                 {/* Gradient Overlay for depth, reduced opacity significantly */}
                 <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-700 ${isStaff ? 'from-indigo-900/40 to-purple-900/40' : 'from-blue-900/40 to-cyan-900/40'}`} />

                 {/* Content Layer */}
                 <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white shadow-sm">CAPACITI</h1>
                        <p className="text-sm text-blue-100 font-medium opacity-90">Intelligent Talent Hub</p>
                    </div>

                    <div className="space-y-4 my-auto">
                        <p className="text-4xl font-light text-blue-50 leading-tight drop-shadow-md">Your Path.</p>
                        <p className="text-4xl font-light text-blue-50 leading-tight drop-shadow-md">Our Purpose.</p>
                        <p className="text-4xl font-light text-white leading-tight drop-shadow-lg font-medium">Empowered Together.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="mb-4">
                            <h3 className="font-bold text-lg mb-1 text-white">{isStaff ? "Candidate Access?" : "Staff Access?"}</h3>
                            <p className="text-sm text-blue-50 opacity-100 leading-relaxed font-medium">
                                {isStaff 
                                    ? "If you are a candidate looking to view your progress, badges, and schedule, please switch to the Candidate portal."
                                    : "Managers, Tech Champions, and Administrators should use the Staff portal for dashboard access."
                                }
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsStaff(!isStaff)}
                            className="w-full py-3 rounded-xl border border-white/30 hover:bg-white/20 transition-colors font-bold flex items-center justify-center gap-2 group text-white"
                        >
                            {isStaff ? (
                                <>
                                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                    <span>Candidate Login</span>
                                </>
                            ) : (
                                <>
                                    <span>Staff Login</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* --- DEMO CREDENTIALS TOOL --- */}
      <div className="fixed bottom-4 right-4 z-50">
          {showCredentials && (
              <div className="absolute bottom-14 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 w-80 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
                  <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
                      <span className="font-bold text-sm">Demo Credentials</span>
                      <button onClick={() => setShowCredentials(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="p-1 max-h-80 overflow-y-auto">
                      <div className="p-3 border-b border-slate-100 text-xs text-slate-500 bg-slate-50 text-center">
                         Default Password: <strong>password123</strong>
                      </div>
                      {DEMO_LOGINS.map((login) => (
                          <div key={login.role} className="p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-800 text-sm">{login.role}</span>
                                  <span className="text-[10px] text-slate-400">{login.desc}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 flex-1 truncate" title={login.email}>
                                      {login.email}
                                  </code>
                                  <button 
                                    onClick={() => copyToClipboard(login.email)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Copy Email"
                                  >
                                      {copiedEmail === login.email ? <Check size={14} className="text-green-600"/> : <Copy size={14} />}
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
          
          <button 
            onClick={() => setShowCredentials(!showCredentials)}
            className="bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-full shadow-lg border border-slate-200 transition-all hover:scale-105"
            title="Show Demo Logins"
          >
             <Key size={20} />
          </button>
      </div>

    </div>
  );
};

export default Login;
