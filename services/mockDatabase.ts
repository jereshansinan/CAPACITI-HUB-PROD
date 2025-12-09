
import { Role, User, Announcement, DocumentItem, Course, ScoreCard, LeaveRequest, FeedbackEntry, ITSupportTicket, Cohort, CandidateMetric, ProfileUpdateRequest } from '../types';

// --- COHORTS ---
export const COHORTS: Cohort[] = [
  { id: 'c1', name: 'FNB Tech Academy', program: 'Systems Development', sponsor: 'FNB', startDate: '2023-02-01', size: 32 },
  { id: 'c2', name: 'Data Science Gen 4', program: 'Data Science', startDate: '2023-03-15', size: 28 },
  { id: 'c3', name: 'Standard Bank Cloud', program: 'Cloud Computing', sponsor: 'Standard Bank', startDate: '2023-06-01', size: 30 },
  { id: 'c4', name: 'IT Support Cohort 12', program: 'Technical Support', startDate: '2023-05-10', size: 35 },
];

// --- USERS ---
export const USERS: User[] = [
  { 
    id: '1', name: 'John Doe', email: 'john.doe@capaciti.org', phone: '+27 82 123 4567', role: Role.EMPLOYEE, 
    department: 'Systems Development', status: 'Active', avatar: '', lastActive: '2 mins ago', cohortId: 'c1',
    location: 'Cape Town Campus', bio: 'Passionate about technology and skills development. Currently engaged in the Full Stack Development program.'
  },
  { 
    id: '2', name: 'Sarah Smith', email: 'sarah.s@capaciti.org', phone: '+27 83 987 6543', role: Role.TECH_CHAMPION, 
    department: 'Training', status: 'Active', avatar: '', lastActive: '1 hour ago',
    location: 'Johannesburg Campus', bio: 'Senior Tech Champion facilitating the path for future developers.'
  },
  { id: '3', name: 'Mike Johnson', email: 'mike.j@capaciti.org', phone: '+27 84 555 1234', role: Role.MANAGER, department: 'Operations', status: 'Active', avatar: '', lastActive: 'Yesterday', location: 'Cape Town Campus' },
  { id: '4', name: 'Emily Davis', email: 'emily.d@capaciti.org', phone: '+27 72 111 2222', role: Role.ADMIN, department: 'HR', status: 'Active', avatar: '', lastActive: 'Just now', location: 'Remote' },
  { id: '5', name: 'David Wilson', email: 'david.w@capaciti.org', phone: '+27 71 333 4444', role: Role.EMPLOYEE, department: 'Data Science', status: 'Inactive', avatar: '', lastActive: '2 weeks ago', cohortId: 'c2' },
  { id: '6', name: 'Jessica Brown', email: 'j.brown@capaciti.org', role: Role.EMPLOYEE, department: 'Cloud Computing', status: 'Active', avatar: '', lastActive: '3 hours ago', cohortId: 'c3' },
  { id: '7', name: 'Robert Taylor', email: 'rob.t@capaciti.org', role: Role.TECH_CHAMPION, department: 'Training', status: 'Active', avatar: '', lastActive: '5 mins ago' },
  { id: '8', name: 'Thabo Mbeki', email: 'thabo.m@capaciti.org', role: Role.EMPLOYEE, department: 'Systems Development', status: 'Active', avatar: '', lastActive: '1 day ago', cohortId: 'c1' },
  { id: '9', name: 'Lisa Kudrow', email: 'lisa.k@capaciti.org', role: Role.EMPLOYEE, department: 'IT Support', status: 'Active', avatar: '', lastActive: '4 hours ago', cohortId: 'c4' },
  
  // --- NEW TEAM MEMBERS ---
  { id: '10', name: 'Jereshan Sinan', email: 'jereshan.s@capaciti.org', phone: '+27 71 000 0001', role: Role.EMPLOYEE, department: 'Systems Development', status: 'Active', avatar: '', lastActive: '10 mins ago', cohortId: 'c1' },
  { id: '11', name: 'Thato Msina', email: 'thato.m@capaciti.org', phone: '+27 71 000 0002', role: Role.EMPLOYEE, department: 'Data Science', status: 'Active', avatar: '', lastActive: '25 mins ago', cohortId: 'c2' },
  { id: '12', name: 'Buhlaluse Ngcobo', email: 'buhlaluse.n@capaciti.org', phone: '+27 71 000 0003', role: Role.EMPLOYEE, department: 'Cloud Computing', status: 'Active', avatar: '', lastActive: '1 hour ago', cohortId: 'c3' },
  { id: '13', name: 'Kamogelo Mothupi', email: 'kamogelo.m@capaciti.org', phone: '+27 71 000 0004', role: Role.EMPLOYEE, department: 'Systems Development', status: 'Active', avatar: '', lastActive: '5 mins ago', cohortId: 'c1' },
  { id: '14', name: 'Nkosimphile Mnisi', email: 'nkosimphile.m@capaciti.org', phone: '+27 71 000 0005', role: Role.EMPLOYEE, department: 'IT Support', status: 'Active', avatar: '', lastActive: 'Just now', cohortId: 'c4' },

  // --- REQUESTED USERS ---
  { id: '15', name: 'Dikgobe Molepo', email: 'dikgobe.m@capaciti.org', phone: '+27 83 000 1111', role: Role.TECH_CHAMPION, department: 'Training', status: 'Active', avatar: '', lastActive: '1 min ago', location: 'Cape Town Campus' },
  { id: '16', name: 'Kefiloe Mphye', email: 'kefiloe.m@capaciti.org', phone: '+27 83 000 2222', role: Role.MANAGER, department: 'Operations', status: 'Active', avatar: '', lastActive: '30 mins ago', location: 'Johannesburg Campus' },
  { id: '17', name: 'Kalebe Nyonyana', email: 'kalebe.n@capaciti.org', phone: '+27 83 000 3333', role: Role.ADMIN, department: 'Administration', status: 'Active', avatar: '', lastActive: '5 mins ago', location: 'Remote' },
];

// --- CENTRALIZED RISK METRICS ---
export const CANDIDATE_METRICS: CandidateMetric[] = [
  { id: '1', name: 'John Doe', cohortName: 'FNB Tech Academy', sponsor: 'FNB', technicalScore: 88, softSkillScore: 92, attendance: 98, projectsCompleted: 5 },
  { id: '5', name: 'David Wilson', cohortName: 'Data Science Gen 4', sponsor: undefined, technicalScore: 45, softSkillScore: 60, attendance: 85, projectsCompleted: 2 },
  { id: '6', name: 'Jessica Brown', cohortName: 'Standard Bank Cloud', sponsor: 'Standard Bank', technicalScore: 78, softSkillScore: 50, attendance: 95, projectsCompleted: 4 },
  { id: '8', name: 'Thabo Mbeki', cohortName: 'FNB Tech Academy', sponsor: 'FNB', technicalScore: 95, softSkillScore: 88, attendance: 60, projectsCompleted: 3 },
  { id: '9', name: 'Lisa Kudrow', cohortName: 'IT Support Cohort 12', sponsor: undefined, technicalScore: 65, softSkillScore: 70, attendance: 100, projectsCompleted: 3 },
  
  // --- NEW TEAM METRICS ---
  { id: '10', name: 'Jereshan Sinan', cohortName: 'FNB Tech Academy', sponsor: 'FNB', technicalScore: 92, softSkillScore: 85, attendance: 100, projectsCompleted: 4 },
  { id: '11', name: 'Thato Msina', cohortName: 'Data Science Gen 4', sponsor: undefined, technicalScore: 75, softSkillScore: 80, attendance: 90, projectsCompleted: 3 },
  { id: '12', name: 'Buhlaluse Ngcobo', cohortName: 'Standard Bank Cloud', sponsor: 'Standard Bank', technicalScore: 88, softSkillScore: 90, attendance: 96, projectsCompleted: 5 },
  { id: '13', name: 'Kamogelo Mothupi', cohortName: 'FNB Tech Academy', sponsor: 'FNB', technicalScore: 85, softSkillScore: 88, attendance: 94, projectsCompleted: 4 },
  { id: '14', name: 'Nkosimphile Mnisi', cohortName: 'IT Support Cohort 12', sponsor: undefined, technicalScore: 82, softSkillScore: 75, attendance: 92, projectsCompleted: 3 },
];

export const ANNOUNCEMENTS: Announcement[] = [
    { id: '1', title: 'Campus Wi-Fi Upgrade', content: 'We are upgrading the Wi-Fi infrastructure this weekend. Expect intermittent connectivity on Saturday.', date: '2023-10-25', type: 'General' },
    { id: '2', title: 'Quarterly Town Hall', content: 'Join us for the Q4 Town Hall meeting this Friday at 10 AM in the main auditorium.', date: '2023-10-28', type: 'Event' },
    { id: '3', title: 'Submit Timesheets', content: 'Urgent reminder to submit all outstanding timesheets by end of day today.', date: '2023-10-26', type: 'Urgent' },
];

export const DOCUMENTS: DocumentItem[] = [
  { id: '1', title: 'Employee Handbook 2023', category: 'Policy', size: '2.4 MB', uploadDate: '2023-01-15', fileType: 'PDF' },
  { id: '2', title: 'Leave Request Template', category: 'Template', size: '450 KB', uploadDate: '2023-02-10', fileType: 'DOCX' },
  { id: '3', title: 'Remote Work Policy', category: 'Policy', size: '1.2 MB', uploadDate: '2023-03-05', fileType: 'PDF' },
  { id: '4', title: 'IT Setup Guide', category: 'Guide', size: '3.5 MB', uploadDate: '2023-01-20', fileType: 'PDF' },
  { id: '5', title: 'Q3 Performance Report', category: 'Report', size: '1.8 MB', uploadDate: '2023-10-01', fileType: 'XLSX' },
  // Additional Documents
  { id: '6', title: 'Code of Conduct', category: 'Policy', size: '1.1 MB', uploadDate: '2023-01-10', fileType: 'PDF' },
  { id: '7', title: 'Travel Expense Form', category: 'Template', size: '320 KB', uploadDate: '2023-04-12', fileType: 'XLSX' },
  { id: '8', title: 'Health & Safety Guidelines', category: 'Guide', size: '4.0 MB', uploadDate: '2023-05-20', fileType: 'PDF' },
  { id: '9', title: 'Mentorship Program Outline', category: 'Guide', size: '1.5 MB', uploadDate: '2023-06-15', fileType: 'PDF' },
  { id: '10', title: 'Annual Financial Summary', category: 'Report', size: '2.2 MB', uploadDate: '2023-10-15', fileType: 'PDF' },
];

// --- 12 AI COURSES (CURRICULUM DEFINITION) ---
// These are the definitions of the courses. Status and Progress will now be derived from the Database certificates.
export const COURSES: Course[] = [
  { 
    id: '1', title: 'AI For Everyone', provider: 'DeepLearning.AI', progress: 0, status: 'Not Started', duration: '10h', thumbnailColor: 'bg-blue-600', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    id: '2', title: 'Introduction to Artificial Intelligence (AI)', provider: 'IBM', progress: 0, status: 'Not Started', duration: '12h', thumbnailColor: 'bg-indigo-600', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '3', title: 'Introduction to Generative AI', provider: 'Google', progress: 0, status: 'Not Started', duration: '8h', thumbnailColor: 'bg-red-500', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '4', title: 'AI Essentials', provider: 'Intel', progress: 0, status: 'Not Started', duration: '6h', thumbnailColor: 'bg-blue-400', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '5', title: 'Python for Data Science, AI & Development', provider: 'IBM', progress: 0, status: 'Not Started', duration: '20h', thumbnailColor: 'bg-indigo-700', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '6', title: 'Building AI Powered Chatbots Without Programming', provider: 'IBM', progress: 0, status: 'Not Started', duration: '11h', thumbnailColor: 'bg-indigo-500', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '7', title: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', progress: 0, status: 'Not Started', duration: '16h', thumbnailColor: 'bg-blue-700', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '8', title: 'Generative AI for Everyone', provider: 'DeepLearning.AI', progress: 0, status: 'Not Started', duration: '8h', thumbnailColor: 'bg-blue-500', targetCohorts: 'All',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1680608979589-e9349ed066d5?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dauto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '9', title: 'Introduction to Responsible AI', provider: 'Google', progress: 0, status: 'Not Started', duration: '5h', thumbnailColor: 'bg-red-600', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '10', title: 'Trustworthy AI: Managing Bias, Ethics, and Accountability', provider: 'Johns Hopkins', progress: 0, status: 'Not Started', duration: '9h', thumbnailColor: 'bg-teal-600', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '11', title: 'Artificial Intelligence on Microsoft Azure', provider: 'Microsoft', progress: 0, status: 'Not Started', duration: '15h', thumbnailColor: 'bg-sky-600', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1700508671690-3dfdea59c999?q=80&w=348&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '12', title: 'AI Foundations: Prompt Engineering with ChatGPT', provider: 'Arizona State', progress: 0, status: 'Not Started', duration: '7h', thumbnailColor: 'bg-orange-700', targetCohorts: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1679083216051-aa510a1a2c0e?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=800'
  },
];

export const SCORE_CARDS: ScoreCard[] = [
  { id: '1', candidateId: '1', candidateName: 'John Doe', reviewerName: 'Sarah Smith', date: '2023-10-20', week: 42, attendance: 100, communication: 80, accountability: 75, creativityOwnership: 60, objectDelivery: 85, techSkills: 90, comments: "Solid week. Delivered the API endpoints ahead of schedule." },
  { id: '2', candidateId: '1', candidateName: 'John Doe', reviewerName: 'Sarah Smith', date: '2023-10-13', week: 41, attendance: 80, communication: 70, accountability: 70, creativityOwnership: 50, objectDelivery: 60, techSkills: 85, comments: "Absent on Monday. Needs to communicate delays better." },
];

export const PENDING_APPROVALS: (LeaveRequest | ITSupportTicket)[] = [
    { id: 'req1', userId: '5', userName: 'David Wilson', type: 'Annual Leave', dates: '2023-11-20 to 2023-11-25', reason: 'Family vacation', status: 'Pending', submittedDate: '2023-10-25' } as LeaveRequest,
    { id: 'req2', userId: '6', userName: 'Jessica Brown', category: 'Software Installation', priority: 'Medium', description: 'Requesting VS Code extensions for Python dev.', status: 'Open', submittedDate: '2023-10-26' } as ITSupportTicket
];

// -- REMOVING LOCAL HELPERS TO FORCE USE OF FIREBASE FOR PROFILES --
export const PENDING_PROFILE_UPDATES: ProfileUpdateRequest[] = [];
export const requestProfileUpdate = (req: ProfileUpdateRequest) => { console.log("Legacy mock function called"); };
export const approveProfileUpdate = (id: string) => { return true; };
export const rejectProfileUpdate = (id: string) => { return true; };

// -- EXISTING FORM HELPERS (Deprecated but kept for type compatibility if needed) --
export const addLeaveRequest = (req: LeaveRequest) => {
    PENDING_APPROVALS.push(req);
    console.log("Mock DB: Leave request added", req);
};

export const addITTicket = (ticket: ITSupportTicket) => {
    PENDING_APPROVALS.push(ticket);
    console.log("Mock DB: IT ticket added", ticket);
};

export const addAnnouncement = (item: Announcement) => {
    ANNOUNCEMENTS.unshift(item);
    console.log("Mock DB: Announcement added", item);
};

export const getCandidates = () => {
    return USERS.filter(u => u.role === Role.EMPLOYEE);
};

export const MOCK_FEEDBACK: FeedbackEntry[] = [
  { id: '1', userId: '99', userName: 'Anonymous', date: '10/24/2023', category: 'Course', content: 'The Python module is moving too fast. Many of us are struggling to keep up with the daily assignments.', sentiment: 'Negative', topics: ['Pacing', 'Assignments'], aiSummary: 'Students feeling overwhelmed by Python pace.', urgency: 'Medium' },
  { id: '2', userId: '98', userName: 'Anonymous', date: '10/23/2023', category: 'Project', content: 'I really enjoyed the group hackathon. It helped me understand git merge conflicts better.', sentiment: 'Positive', topics: ['Hackathon', 'Git'], aiSummary: 'Positive feedback on group project.', urgency: 'Low' },
];
