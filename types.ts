
export enum Role {
  EMPLOYEE = 'Candidate/Employee',
  TECH_CHAMPION = 'Tech Champion',
  MANAGER = 'Manager',
  ADMIN = 'Admin/HR'
}

export interface Cohort {
  id: string;
  name: string;
  program: string;
  sponsor?: string;
  startDate: string;
  size: number;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  email?: string;
  phone?: string;
  department?: string;
  status?: 'Active' | 'Inactive';
  lastActive?: string;
  cohortId?: string; // Link to Cohort
  // Profile specific fields
  location?: string;
  bio?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface CertificateData {
  candidateName: string | null;
  courseName: string | null;
  issueDate: string | null;
  issuer: string | null;
  verificationStatus: 'VERIFIED' | 'REJECTED' | 'PENDING';
  confidenceScore: number;
  reason?: string; // New field for AI reasoning
}

export interface CandidateMetric {
  id: string;
  name: string;
  cohortName?: string; // New field
  sponsor?: string;    // New field
  technicalScore: number; // 0-100
  softSkillScore: number; // 0-100
  attendance: number; // 0-100
  projectsCompleted: number;
  riskScore?: number; // Calculated by AI
  riskLevel?: 'Low' | 'Medium' | 'High'; // Calculated by AI
  aiAnalysis?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: string;
  dates: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
}

export interface ITSupportTicket {
  id: string;
  userId: string;
  userName: string;
  category: string;
  priority: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  submittedDate: string;
}

// New Blueprint Entities

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'General' | 'Urgent' | 'Event';
  targetCohortId?: string | 'All'; // New field for targeting
  targetCohortName?: string;
  imageUrl?: string; // New field for Unsplash integration
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Policy' | 'Template' | 'Guide' | 'Report';
  size: string;
  uploadDate: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX';
}

export interface Course {
  id: string;
  title: string;
  provider: string; // Changed from enum to string to support IBM, Google, etc.
  progress: number; // 0-100
  status: 'Not Started' | 'In Progress' | 'Completed';
  duration: string;
  thumbnailColor: string;
  targetCohorts: string[] | 'All'; // New field to filter by cohort
  imageUrl?: string; // New field for specific course images
}

export interface ScoreCard {
  id: string;
  candidateId: string;
  candidateName: string;
  reviewerName: string;
  date: string;
  week: number;
  
  // Metrics
  attendance: number;
  communication: number;
  accountability: number;
  creativityOwnership: number;
  objectDelivery: number;
  techSkills: number;
  
  comments: string;
}

export interface FeedbackEntry {
  id: string;
  userId: string;
  userName: string;
  date: string;
  category: 'Course' | 'Test' | 'Project' | 'General';
  content: string;
  // AI Analyzed Fields
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  topics: string[];
  aiSummary: string;
  urgency: 'Low' | 'Medium' | 'High';
}

export interface ProfileUpdateRequest {
  id: string;
  userId: string;
  userName: string;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  updates: Partial<User>; // The proposed changes
}
