
import React, { useState } from 'react';
import { verifyCertificate } from '../services/geminiService';
import { saveVerifiedCertificate, auth } from '../services/firebase';
import { CertificateData } from '../types';
import { Upload, FileCheck, CheckCircle, Loader2, X, AlertTriangle, Search, ScanLine, Save } from 'lucide-react';

interface StoredCert extends CertificateData {
  id: string;
  fileName: string;
  uploadDate: string;
}

const CertVerifier: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CertificateData | null>(null);
  const [inputKey, setInputKey] = useState(0); 
  
  // Local Session History (Ephemeral)
  const [history, setHistory] = useState<StoredCert[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setAnalysisResult(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
        const base64 = await fileToBase64(file);
        // Determine mime type (default to png if unknown, though browser usually catches it)
        const mimeType = file.type || 'image/png';
        
        const result = await verifyCertificate(base64, mimeType);
        
        setAnalysisResult(result);
        
        // Add to local history 
        const newRecord: StoredCert = {
            id: Date.now().toString(),
            fileName: file.name,
            uploadDate: new Date().toLocaleDateString(),
            ...result
        };
        setHistory([newRecord, ...history]);

        // --- DATABASE INTEGRATION ---
        // If Verified, save to Firebase to update Learning progress
        if (result.verificationStatus === 'VERIFIED') {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const saveRes = await saveVerifiedCertificate(currentUser.uid, result);
                if (!saveRes.success) {
                    console.error("Failed to save cert to DB", saveRes.error);
                }
            }
        }

    } catch (error) {
        console.error("Analysis failed", error);
        alert("Could not analyze document. Please try a different file.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
      setAnalysisResult(null);
      setFile(null);
      setInputKey(prev => prev + 1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
            <ScanLine size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">AI Certificate Verification</h2>
            <p className="text-slate-500">Upload a certificate to verify its authenticity. Valid certificates will automatically update your Learning Progress.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Left Col: Upload Interface */}
           <div className="space-y-6">
               {!analysisResult ? (
                   <>
                       <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-all relative min-h-[250px] flex flex-col items-center justify-center group ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-300 hover:bg-slate-50'}`}>
                          <input
                            key={inputKey}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex flex-col items-center space-y-3 pointer-events-none">
                            <Upload size={40} className={`transition-colors ${file ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                            <span className={`text-base font-semibold ${file ? 'text-indigo-700' : 'text-slate-600'}`}>
                              {file ? file.name : "Drop certificate image here"}
                            </span>
                            <span className="text-xs text-slate-400">Supports JPG, PNG, WEBP</span>
                          </div>
                       </div>
                       
                       {file && (
                           <button
                              onClick={handleAnalyze}
                              disabled={isAnalyzing}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                           >
                              {isAnalyzing ? (
                                <>
                                  <Loader2 size={20} className="animate-spin" />
                                  <span>Analyzing Document...</span>
                                </>
                              ) : (
                                <>
                                  <Search size={20} />
                                  <span>Verify Authenticity</span>
                                </>
                              )}
                           </button>
                       )}
                   </>
               ) : (
                   <div className={`rounded-xl border-2 p-6 animate-in zoom-in-95 duration-300 ${analysisResult.verificationStatus === 'VERIFIED' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                       <div className="flex items-center gap-4 mb-6">
                           <div className={`p-4 rounded-full ${analysisResult.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                               {analysisResult.verificationStatus === 'VERIFIED' ? <CheckCircle size={32} /> : <X size={32} />}
                           </div>
                           <div>
                               <h3 className={`text-xl font-bold ${analysisResult.verificationStatus === 'VERIFIED' ? 'text-green-800' : 'text-red-800'}`}>
                                   {analysisResult.verificationStatus === 'VERIFIED' ? 'Certificate Verified' : 'Verification Rejected'}
                               </h3>
                               <p className={`text-sm ${analysisResult.verificationStatus === 'VERIFIED' ? 'text-green-700' : 'text-red-700'}`}>
                                   {analysisResult.reason}
                               </p>
                           </div>
                       </div>

                       {analysisResult.verificationStatus === 'VERIFIED' && (
                           <div className="bg-white/60 rounded-lg p-4 space-y-2 text-sm border border-green-100/50 relative">
                               <div className="absolute top-2 right-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold flex items-center gap-1">
                                   <Save size={10} /> Saved to Database
                               </div>
                               <div className="flex justify-between border-b border-green-100 pb-2">
                                   <span className="text-slate-500">Candidate Name</span>
                                   <span className="font-semibold text-slate-800">{analysisResult.candidateName || 'Not Detected'}</span>
                               </div>
                               <div className="flex justify-between border-b border-green-100 pb-2">
                                   <span className="text-slate-500">Issuer</span>
                                   <span className="font-semibold text-slate-800">{analysisResult.issuer || 'Not Detected'}</span>
                               </div>
                               <div className="flex justify-between border-b border-green-100 pb-2">
                                   <span className="text-slate-500">Course / Award</span>
                                   <span className="font-semibold text-slate-800">{analysisResult.courseName || 'Not Detected'}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span className="text-slate-500">Confidence Score</span>
                                   <span className="font-bold text-green-600">{analysisResult.confidenceScore}%</span>
                               </div>
                           </div>
                       )}

                       <button 
                         onClick={handleReset}
                         className={`mt-6 w-full py-2.5 rounded-lg font-medium transition-colors ${
                             analysisResult.verificationStatus === 'VERIFIED' 
                             ? 'bg-green-600 text-white hover:bg-green-700' 
                             : 'bg-red-600 text-white hover:bg-red-700'
                         }`}
                       >
                         Analyze Another Document
                       </button>
                   </div>
               )}
           </div>

           {/* Right Col: Session History */}
           <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col h-full">
               <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                   <FileCheck size={18} className="text-slate-400" />
                   Session History
               </h3>
               
               <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                   {history.length === 0 ? (
                       <div className="text-center text-slate-400 py-10">
                           <p className="text-sm">No analysis performed in this session.</p>
                       </div>
                   ) : (
                       history.map((cert) => (
                           <div key={cert.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                               <div className="flex justify-between items-start mb-2">
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                                       cert.verificationStatus === 'VERIFIED' 
                                         ? 'bg-green-50 text-green-600 border-green-100' 
                                         : 'bg-red-50 text-red-600 border-red-100'
                                   }`}>
                                       {cert.verificationStatus}
                                   </span>
                                   <span className="text-xs text-slate-400">{cert.uploadDate}</span>
                               </div>
                               <p className="text-sm font-medium text-slate-800 truncate mb-1" title={cert.fileName}>
                                   {cert.fileName}
                               </p>
                               {cert.verificationStatus === 'VERIFIED' ? (
                                   <p className="text-xs text-slate-500">
                                       Issued by <span className="text-indigo-600">{cert.issuer || 'Unknown'}</span>
                                   </p>
                               ) : (
                                   <p className="text-xs text-red-500 italic">
                                       {cert.reason}
                                   </p>
                               )}
                           </div>
                       ))
                   )}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CertVerifier;
