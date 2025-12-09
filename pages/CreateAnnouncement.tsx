
import React, { useState, useEffect } from 'react';
import { Announcement } from '../types';
import { COHORTS } from '../services/mockDatabase';
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from '../services/firebase';
import { searchUnsplashImages } from '../services/unsplashService';
import { Megaphone, AlertCircle, Calendar, Info, Send, CheckCircle, Users, Image as ImageIcon, Search, Loader2, Trash2 } from 'lucide-react';

const DEFAULT_ANNOUNCEMENT_IMAGE = "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000";

const CreateAnnouncement: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'General' | 'Urgent' | 'Event'>('General');
  
  // Audience Targeting
  const [audience, setAudience] = useState<'All' | 'Cohort'>('All');
  const [targetCohortId, setTargetCohortId] = useState<string>('');
  
  // Unsplash State
  const [imageQuery, setImageQuery] = useState('');
  const [imageResults, setImageResults] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isImageSectionOpen, setIsImageSectionOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Real Data History
  const [history, setHistory] = useState<Announcement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    const data = await getAnnouncements();
    setHistory(data);
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleImageSearch = async () => {
      if (!imageQuery.trim()) return;
      setIsSearchingImage(true);
      const results = await searchUnsplashImages(imageQuery);
      setImageResults(results);
      setIsSearchingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (audience === 'Cohort' && !targetCohortId) {
        alert("Please select a cohort");
        return;
    }

    setIsSubmitting(true);

    const cohortName = targetCohortId ? COHORTS.find(c => c.id === targetCohortId)?.name : undefined;

    const newAnnouncement: Omit<Announcement, 'id'> = {
        title,
        content,
        type,
        date: new Date().toISOString().split('T')[0],
        targetCohortId: audience === 'All' ? 'All' : targetCohortId,
        targetCohortName: cohortName,
        imageUrl: selectedImage
    };

    const result = await createAnnouncement(newAnnouncement);

    setIsSubmitting(false);

    if (result.success) {
        // Reset Form
        setTitle('');
        setContent('');
        setType('General');
        setAudience('All');
        setTargetCohortId('');
        setSelectedImage('');
        setImageQuery('');
        setImageResults([]);
        setIsImageSectionOpen(false);
        setSuccess(true);
        
        // Refresh History
        fetchHistory();
        
        setTimeout(() => setSuccess(false), 3000);
    } else {
        alert("Failed to publish: " + result.error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      // Stop propagation to prevent any parent click events
      e.stopPropagation();
      e.preventDefault();
      
      if (window.confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) {
          const result = await deleteAnnouncement(id);
          if (result.success) {
              setHistory(prev => prev.filter(item => item.id !== id));
          } else {
              alert("Error deleting: " + result.error);
          }
      }
  };

  const getTypeStyles = (t: string) => {
    switch (t) {
      case 'Urgent': return 'bg-red-100 text-red-600 border-red-200';
      case 'Event': return 'bg-green-100 text-green-600 border-green-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'Urgent': return <AlertCircle size={18} />;
      case 'Event': return <Calendar size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="text-blue-600" />
            Broadcast Center
          </h2>
          <p className="text-slate-500">Create and manage company-wide or cohort-specific announcements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            {success ? (
              <div className="flex flex-col items-center justify-center py-10 animate-in fade-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Published Successfully!</h3>
                <p className="text-slate-500 mt-2">Your announcement is now live.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-blue-600 font-medium hover:underline"
                >
                  Create another announcement
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Announcement Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['General', 'Urgent', 'Event'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t as any)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                          type === t
                            ? getTypeStyles(t) + ' ring-2 ring-offset-1 ring-current'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {getTypeIcon(t)}
                        <span className="font-medium text-sm">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
                   <div className="grid grid-cols-2 gap-4">
                       <button
                           type="button"
                           onClick={() => setAudience('All')}
                           className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                               audience === 'All' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                           }`}
                       >
                           <Megaphone size={16} />
                           <span className="font-medium">All Company</span>
                       </button>
                       <button
                           type="button"
                           onClick={() => setAudience('Cohort')}
                           className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                               audience === 'Cohort' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                           }`}
                       >
                           <Users size={16} />
                           <span className="font-medium">Specific Cohort</span>
                       </button>
                   </div>
                </div>

                {audience === 'Cohort' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Cohort</label>
                        <select
                            value={targetCohortId}
                            onChange={(e) => setTargetCohortId(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                            required={audience === 'Cohort'}
                        >
                            <option value="" disabled>Choose a cohort...</option>
                            {COHORTS.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Office Maintenance Schedule"
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                    required
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image (Powered by Unsplash)</label>
                   
                   {!isImageSectionOpen && !selectedImage && (
                       <button 
                         type="button" 
                         onClick={() => setIsImageSectionOpen(true)}
                         className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 text-sm"
                       >
                           <ImageIcon size={16} /> Search for photos
                       </button>
                   )}

                   {selectedImage && (
                       <div className="relative rounded-xl overflow-hidden mb-4 border border-slate-200">
                           <img src={selectedImage} alt="Selected cover" className="w-full h-48 object-cover" />
                           <button 
                             type="button"
                             onClick={() => { setSelectedImage(''); setIsImageSectionOpen(true); }}
                             className="absolute top-2 right-2 bg-white/90 p-2 rounded-lg text-slate-700 hover:text-red-600 text-xs font-bold shadow-sm"
                           >
                               Change Image
                           </button>
                       </div>
                   )}

                   {isImageSectionOpen && (
                       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                           <div className="flex gap-2">
                               <div className="relative flex-1">
                                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                   <input 
                                       type="text" 
                                       value={imageQuery}
                                       onChange={(e) => setImageQuery(e.target.value)}
                                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleImageSearch())}
                                       placeholder="Search keywords (e.g. 'Team', 'Office', 'Code')"
                                       className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   />
                               </div>
                               <button 
                                 type="button"
                                 onClick={handleImageSearch}
                                 className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900"
                               >
                                   {isSearchingImage ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setIsImageSectionOpen(false)}
                                 className="px-3 py-2 text-slate-500 hover:bg-slate-200 rounded-lg"
                               >
                                   Cancel
                               </button>
                           </div>

                           {imageResults.length > 0 && (
                               <div className="grid grid-cols-4 gap-2">
                                   {imageResults.map(img => (
                                       <div 
                                         key={img.id} 
                                         onClick={() => { setSelectedImage(img.urls.regular); setIsImageSectionOpen(false); }}
                                         className="aspect-video cursor-pointer rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-500 relative group"
                                       >
                                           <img src={img.urls.small} alt={img.alt_description} className="w-full h-full object-cover" />
                                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                           <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white p-1 opacity-0 group-hover:opacity-100 truncate">
                                               by {img.user.name}
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                           {imageResults.length === 0 && !isSearchingImage && imageQuery && (
                               <div className="text-center text-slate-400 text-xs py-2">No results found.</div>
                           )}
                       </div>
                   )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end">
                   <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg disabled:opacity-70"
                   >
                     <Send size={18} />
                     <span>{isSubmitting ? 'Publishing...' : 'Publish Announcement'}</span>
                   </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full max-h-[600px] overflow-y-auto">
             <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">
               <h3 className="font-semibold text-slate-800">Recent History</h3>
               <button onClick={fetchHistory} className="text-xs text-blue-600 hover:underline">Refresh</button>
             </div>
             
             {isLoadingHistory ? (
                <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                </div>
             ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 group relative">
                        {/* Delete Button */}
                        <button 
                            type="button"
                            onClick={(e) => handleDelete(e, item.id)}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
                            title="Delete Announcement"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-slate-200">
                            <img 
                                src={item.imageUrl || DEFAULT_ANNOUNCEMENT_IMAGE} 
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = DEFAULT_ANNOUNCEMENT_IMAGE;
                                }}
                                alt="cover" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getTypeStyles(item.type)}`}>
                            {item.type}
                          </span>
                          <span className="text-xs text-slate-400">{item.date}</span>
                        </div>
                        <h4 className="font-medium text-slate-800 text-sm mt-2 pr-6">{item.title}</h4>
                        {item.targetCohortId && item.targetCohortId !== 'All' && (
                            <div className="text-[10px] bg-slate-200 text-slate-600 inline-block px-1.5 py-0.5 rounded mt-1">
                                To: {item.targetCohortName || 'Cohort'}
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.content}</p>
                    </div>
                  ))}
                  {history.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">No announcements published yet.</p>
                  )}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncement;
