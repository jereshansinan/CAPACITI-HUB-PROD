
import React, { useEffect, useState } from 'react';
import { COURSES } from '../services/mockDatabase';
import { getUserCertificates } from '../services/firebase';
import { PlayCircle, CheckCircle, Award, Clock, BookOpen, Loader2 } from 'lucide-react';
import { User, CertificateData, Course } from '../types';

interface LearningProps {
  user?: User | null;
}

const Learning: React.FC<LearningProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the Curriculum (Static from mock, but could be DB)
  // 2. Fetch User's Verified Certificates from DB
  // 3. Match Certs to Courses to determine status
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        
        // Default list based on cohort filter (existing logic)
        let visibleCourses = COURSES.filter(course => {
            if (course.targetCohorts === 'All') return true;
            if (user?.cohortId && Array.isArray(course.targetCohorts)) {
            return course.targetCohorts.includes(user.cohortId);
            }
            return false;
        });

        if (user) {
            // Fetch verified certs
            const certs = await getUserCertificates(user.id);
            
            // Map progress
            visibleCourses = visibleCourses.map(course => {
                // Fuzzy match logic: Check if course title is in cert name or vice versa
                // Normalized to lowercase, trim spaces
                const normalizedCourseTitle = course.title.toLowerCase().trim();
                
                const hasCert = certs.some(cert => {
                    const normalizedCertName = (cert.courseName || '').toLowerCase().trim();
                    return normalizedCertName.includes(normalizedCourseTitle) || normalizedCourseTitle.includes(normalizedCertName);
                });

                if (hasCert) {
                    return { ...course, status: 'Completed', progress: 100 };
                }
                return course;
            });
        }

        setCourses(visibleCourses);
        setLoading(false);
    };

    fetchData();
  }, [user]);


  const completedCount = courses.filter(c => c.status === 'Completed').length;
  const inProgressCount = courses.filter(c => c.status === 'In Progress').length;
  const totalCourses = courses.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Learning & Training</h2>
           <p className="text-slate-500">
             {user?.cohortId ? "AI Bootcamp Curriculum (Required)" : "Access your courses, track progress, and view achievements."}
           </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-600 font-medium">Completed: {completedCount}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-slate-600 font-medium">In Progress: {inProgressCount}</span>
            </div>
            <div className="font-bold text-slate-800 pl-4 border-l border-slate-200">
                Total: {totalCourses}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Achievements Section */}
        <div className="md:col-span-3 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden">
           {/* Decorative bg elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           
           <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                 <Award size={40} className="text-yellow-400" />
              </div>
              <div>
                 <h3 className="text-xl font-bold">AI Bootcamp Progress</h3>
                 <p className="text-slate-300 text-sm">
                    {completedCount === totalCourses 
                        ? "Congratulations! You have completed the bootcamp." 
                        : `You have completed ${Math.round((completedCount/totalCourses)*100)}% of the required curriculum.`}
                 </p>
              </div>
           </div>
           <div className="flex gap-4 relative z-10">
              <div className="text-center">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-1 mx-auto transition-all ${
                     completedCount > 0 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-slate-800/50 border-slate-700 opacity-50'
                 }`}>
                    <span className="text-xs font-bold">L1</span>
                 </div>
                 <span className="text-xs text-slate-300">AI Basics</span>
              </div>
              <div className="text-center">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-1 mx-auto transition-all ${
                     completedCount > 5 ? 'bg-green-500/20 border-green-500' : 'bg-slate-800/50 border-slate-700 opacity-50'
                 }`}>
                    <span className="text-xs font-bold">L2</span>
                 </div>
                 <span className="text-xs text-slate-300">Intermediate</span>
              </div>
               <div className="text-center">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-1 mx-auto transition-all ${
                     completedCount === totalCourses ? 'bg-purple-500/20 border-purple-500' : 'bg-slate-800/50 border-slate-700 opacity-50'
                 }`}>
                    <span className="text-xs font-bold">L3</span>
                 </div>
                 <span className="text-xs text-slate-300">Expert</span>
              </div>
           </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Mandatory Courses</h3>
            <div className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle size={12} className="text-green-600"/>
                Uploading verified certificates automatically updates your progress
            </div>
        </div>

        {loading ? (
             <div className="flex justify-center py-12">
                 <Loader2 className="animate-spin text-blue-600" size={32} />
             </div>
        ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                <div className={`h-36 relative overflow-hidden bg-slate-200`}>
                    <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-white/20">
                        {course.provider}
                    </span>
                    {course.status === 'Completed' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-[1px]">
                            <div className="bg-white/90 rounded-full p-2 shadow-lg">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <h4 className="font-bold text-slate-800 mb-2 leading-tight text-sm min-h-[40px]">{course.title}</h4>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 mt-1">
                        <div className="flex items-center gap-1">
                            <Clock size={14} /> {course.duration}
                        </div>
                        <div className={`flex items-center gap-1 font-medium ${
                            course.status === 'Completed' ? 'text-green-600' : 
                            course.status === 'In Progress' ? 'text-blue-600' : 'text-slate-400'
                        }`}>
                            {course.status === 'Completed' ? <CheckCircle size={14} /> : <PlayCircle size={14} />}
                            {course.status}
                        </div>
                    </div>
                    
                    <div className="mt-auto space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-500">Completion</span>
                            <span className="text-slate-800">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    course.progress === 100 ? 'bg-green-500' : 
                                    course.progress > 0 ? 'bg-blue-600' : 'bg-slate-300'
                                }`} 
                                style={{ width: `${course.progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                    <button 
                        disabled={course.status === 'Completed'}
                        className={`w-full text-center text-xs font-bold py-2 rounded-lg transition-colors ${
                        course.status === 'Not Started' 
                            ? 'bg-slate-800 text-white hover:bg-slate-900' 
                            : course.status === 'Completed'
                            ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                            : 'bg-white text-slate-700 border border-slate-200 hover:text-blue-600 hover:border-blue-200'
                    }`}>
                        {course.status === 'Completed' ? 'Verified & Completed' : 'Start Course'}
                    </button>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                <p className="text-slate-500">No courses assigned to your current cohort.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
