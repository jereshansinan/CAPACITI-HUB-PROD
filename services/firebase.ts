import { initializeApp, getApp, getApps, deleteApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, orderBy, where } from "firebase/firestore";
import { USERS, ANNOUNCEMENTS, SCORE_CARDS, MOCK_FEEDBACK, CANDIDATE_METRICS, PENDING_APPROVALS } from "./mockDatabase";
import { User, Role, Announcement, ProfileUpdateRequest, ScoreCard, LeaveRequest, ITSupportTicket, FeedbackEntry, CertificateData } from "../types";

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- AUTHENTICATION FUNCTIONS ---

export const loginUser = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const uid = userCredential.user.uid;

    // Fetch user details from Firestore
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return { success: true, user: userData };
    } else {
      return { success: false, error: "User profile not found in database." };
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// --- USER MANAGEMENT ---

export const registerNewUser = async (newUser: Partial<User>, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Use a secondary app to create user so we don't log out the current admin
  let secondaryApp: any;
  try {
      const appName = "secondaryApp";
      const existingApps = getApps();
      const foundApp = existingApps.find(app => app.name === appName);
      
      if (foundApp) {
          secondaryApp = foundApp;
      } else {
          secondaryApp = initializeApp(firebaseConfig, appName);
      }

      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email!, password);
      const uid = userCredential.user.uid;

      const userData: User = {
        id: uid,
        name: newUser.name!,
        email: newUser.email!,
        role: newUser.role || Role.EMPLOYEE,
        status: 'Active',
        avatar: newUser.avatar || '',
        cohortId: newUser.cohortId,
        phone: newUser.phone || '',
        department: newUser.department || 'General',
        location: newUser.location || 'Cape Town Campus',
        lastActive: new Date().toISOString()
      };

      // Save to Firestore using the main app's db instance
      await setDoc(doc(db, "users", uid), userData);
      
      // Initialize candidate metrics if applicable
      if (userData.role === Role.EMPLOYEE) {
        // Create a default metric entry
        await setDoc(doc(db, "candidate_metrics", uid), {
             id: uid,
             name: userData.name,
             cohortName: newUser.cohortId ? "Assigned" : "Unassigned", 
             technicalScore: 0,
             softSkillScore: 0,
             attendance: 0,
             projectsCompleted: 0
        });
      }

      return { success: true, user: userData };

  } catch (error: any) {
    console.error("Registration Error:", error);
    return { success: false, error: error.message };
  }
};

export const deleteUserDocument = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete from Users collection
    await deleteDoc(doc(db, "users", userId));
    // Try to delete metrics if they exist (ignore error if not)
    await deleteDoc(doc(db, "candidate_metrics", userId)).catch(() => {});
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// --- PROFILE UPDATES ---

export const createProfileUpdateRequest = async (request: Omit<ProfileUpdateRequest, 'id'>): Promise<{ success: boolean; error?: string }> => {
  try {
    await addDoc(collection(db, "profile_updates"), {
        ...request,
        submittedDate: new Date().toISOString().split('T')[0]
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getPendingProfileUpdates = async (): Promise<ProfileUpdateRequest[]> => {
  try {
    const q = query(collection(db, "profile_updates"), where("status", "==", "Pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileUpdateRequest));
  } catch (error) {
    console.error("Error fetching profile updates:", error);
    return [];
  }
};

export const getUserPendingUpdates = async (userId: string): Promise<boolean> => {
  try {
    const q = query(collection(db, "profile_updates"), where("userId", "==", userId), where("status", "==", "Pending"));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    return false;
  }
};

export const processProfileUpdate = async (requestId: string, action: 'Approved' | 'Rejected', userId?: string, updates?: Partial<User>): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateRef = doc(db, "profile_updates", requestId);
    await updateDoc(updateRef, { status: action });

    if (action === 'Approved' && userId && updates) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, updates);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// --- FORMS (LEAVE & IT) ---

export const createLeaveRequest = async (request: Omit<LeaveRequest, 'id'>): Promise<{ success: boolean; error?: string }> => {
  try {
    await addDoc(collection(db, "leave_requests"), request);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const createITTicket = async (ticket: Omit<ITSupportTicket, 'id'>): Promise<{ success: boolean; error?: string }> => {
  try {
    await addDoc(collection(db, "it_tickets"), ticket);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getPendingRequests = async (): Promise<(LeaveRequest | ITSupportTicket)[]> => {
  try {
    const leaveQ = query(collection(db, "leave_requests"), where("status", "==", "Pending"));
    const itQ = query(collection(db, "it_tickets"), where("status", "==", "Open"));

    const [leaveSnaps, itSnaps] = await Promise.all([getDocs(leaveQ), getDocs(itQ)]);

    const leaves = leaveSnaps.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));
    const tickets = itSnaps.docs.map(d => ({ id: d.id, ...d.data() } as ITSupportTicket));

    return [...leaves, ...tickets];
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
};

export const getUserRequests = async (userId: string): Promise<(LeaveRequest | ITSupportTicket)[]> => {
    try {
        const leaveQ = query(collection(db, "leave_requests"), where("userId", "==", userId));
        const itQ = query(collection(db, "it_tickets"), where("userId", "==", userId));

        const [leaveSnaps, itSnaps] = await Promise.all([getDocs(leaveQ), getDocs(itQ)]);

        const leaves = leaveSnaps.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));
        const tickets = itSnaps.docs.map(d => ({ id: d.id, ...d.data() } as ITSupportTicket));

        return [...leaves, ...tickets].sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    } catch (error) {
        console.error("Error fetching user history:", error);
        return [];
    }
};

export const updateRequestStatus = async (id: string, isLeave: boolean, status: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const collectionName = isLeave ? "leave_requests" : "it_tickets";
    await updateDoc(doc(db, collectionName, id), { status });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// --- ANNOUNCEMENTS ---

export const createAnnouncement = async (announcement: Omit<Announcement, 'id'>): Promise<{ success: boolean; error?: string }> => {
  try {
    await addDoc(collection(db, "announcements"), announcement);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};

export const deleteAnnouncement = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
        await deleteDoc(doc(db, "announcements", id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// --- SCORECARDS ---

export const createScoreCard = async (scoreCard: Omit<ScoreCard, 'id'>): Promise<{ success: boolean; error?: string }> => {
  try {
    await addDoc(collection(db, "scorecards"), scoreCard);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getScoreCards = async (): Promise<ScoreCard[]> => {
  try {
    const snapshot = await getDocs(collection(db, "scorecards"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScoreCard))
           .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching scorecards:", error);
    return [];
  }
};

// --- CERTIFICATES ---

export const saveVerifiedCertificate = async (userId: string, certData: CertificateData): Promise<{ success: boolean; error?: string }> => {
  try {
    await addDoc(collection(db, "verified_certificates"), {
        userId,
        ...certData,
        verifiedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserCertificates = async (userId: string): Promise<CertificateData[]> => {
  try {
      const q = query(collection(db, "verified_certificates"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as CertificateData);
  } catch (error) {
      console.error("Error fetching certs:", error);
      return [];
  }
};

// --- DASHBOARD STATS ---

export interface DashboardStats {
  stat1: string;
  stat2: string;
  stat3: string;
  stat4: string;
}

export const getDashboardStats = async (role: Role, userId?: string, cohortId?: string): Promise<DashboardStats> => {
  try {
      if (role === Role.EMPLOYEE && userId) {
          // Employee Stats
          const leaveSnapshot = await getDocs(query(collection(db, "leave_requests"), where("userId", "==", userId), where("status", "==", "Pending")));
          const itSnapshot = await getDocs(query(collection(db, "it_tickets"), where("userId", "==", userId), where("status", "==", "Open")));
          const certSnapshot = await getDocs(query(collection(db, "verified_certificates"), where("userId", "==", userId), where("verificationStatus", "==", "VERIFIED")));
          
          const scoreCardsSnapshot = await getDocs(query(collection(db, "scorecards"), where("candidateId", "==", userId)));
          const scoreCards = scoreCardsSnapshot.docs.map(d => d.data() as ScoreCard);
          
          let avgPerformance = 0;
          if (scoreCards.length > 0) {
              avgPerformance = Math.round(scoreCards.reduce((acc, curr) => acc + curr.techSkills, 0) / scoreCards.length);
          }

          return {
              stat1: "1.25 Days", // Accrued Leave
              stat2: `${leaveSnapshot.size + itSnapshot.size} Pending`,
              stat3: `${certSnapshot.size} Verified`,
              stat4: `${avgPerformance}% Avg`
          };
      } else {
          // Manager / Admin Stats
          // Fetch ALL users to count candidates (Ignore cohort filtering for total count view)
          const usersSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", Role.EMPLOYEE)));
          const candidatesCount = usersSnapshot.size;

          // Fetch Scorecards for attendance calc
          const cardsSnapshot = await getDocs(collection(db, "scorecards"));
          const cards = cardsSnapshot.docs.map(d => d.data() as ScoreCard);
          
          const avgAtt = cards.length > 0 
            ? Math.round(cards.reduce((acc, c) => acc + c.attendance, 0) / cards.length)
            : 0;
          
          // Calculate At Risk
          const lowScores = cards.filter(c => c.techSkills < 60 || c.attendance < 80).length;

          return {
              stat1: `${candidatesCount} Total`,
              stat2: `${lowScores} Flags`, // Attention Needed
              stat3: `${avgAtt}% Avg`,
              stat4: `${cards.length} Reviews`
          };
      }
  } catch (error) {
      console.error("Error getting stats:", error);
      return { stat1: '-', stat2: '-', stat3: '-', stat4: '-' };
  }
};

// --- FEEDBACK ---

export const createFeedback = async (feedback: Omit<FeedbackEntry, 'id'>): Promise<{ success: boolean; error?: string }> => {
  try {
    await addDoc(collection(db, "feedback"), feedback);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getFeedback = async (userId?: string): Promise<FeedbackEntry[]> => {
  try {
      let q;
      if (userId) {
          q = query(collection(db, "feedback"), where("userId", "==", userId));
      } else {
          q = query(collection(db, "feedback"));
      }
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedbackEntry));
      return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
      console.error("Error getting feedback:", error);
      return [];
  }
};


// --- SEEDING (Dev Tool) ---

export const seedDatabase = async () => {
    try {
        console.log("Starting Seed...");
        
        const appName = "seederApp";
        let secondaryApp: any;
        const existingApps = getApps();
        const found = existingApps.find(a => a.name === appName);
        if (found) secondaryApp = found;
        else secondaryApp = initializeApp(firebaseConfig, appName);

        const secondaryAuth = getAuth(secondaryApp);

        // 1. Seed Users
        for (const user of USERS) {
            try {
                const cred = await createUserWithEmailAndPassword(secondaryAuth, user.email!, 'password123');
                await setDoc(doc(db, "users", cred.user.uid), { ...user, id: cred.user.uid });
                console.log(`Created user: ${user.email}`);
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    try {
                        const cred = await signInWithEmailAndPassword(secondaryAuth, user.email!, 'password123');
                        await setDoc(doc(db, "users", cred.user.uid), { ...user, id: cred.user.uid });
                        console.log(`Updated existing user: ${user.email}`);
                    } catch (innerErr) {
                        console.error(`Failed to update existing user ${user.email}:`, innerErr);
                    }
                } else {
                    console.error(`Failed to create user ${user.email}:`, error);
                }
            }
        }

        // 2. Seed Announcements
        const annQuery = query(collection(db, "announcements"));
        const annSnap = await getDocs(annQuery);
        if (annSnap.empty) {
            for (const ann of ANNOUNCEMENTS) {
                await addDoc(collection(db, "announcements"), ann);
            }
        }

        // 3. Seed Scorecards
        const scoreQuery = query(collection(db, "scorecards"));
        const scoreSnap = await getDocs(scoreQuery);
        if (scoreSnap.empty) {
            for (const card of SCORE_CARDS) {
                await addDoc(collection(db, "scorecards"), card);
            }
        }
        
        // 4. Seed Requests
        const reqQuery = query(collection(db, "leave_requests"));
        const reqSnap = await getDocs(reqQuery);
        if (reqSnap.empty) {
             for (const req of PENDING_APPROVALS) {
                 if ('type' in req) {
                     await addDoc(collection(db, "leave_requests"), req);
                 } else {
                     await addDoc(collection(db, "it_tickets"), req);
                 }
             }
        }

        // 5. Seed Feedback
        const fbQuery = query(collection(db, "feedback"));
        const fbSnap = await getDocs(fbQuery);
        if (fbSnap.empty) {
             for (const fb of MOCK_FEEDBACK) {
                 await addDoc(collection(db, "feedback"), fb);
             }
        }
        
        // 6. Seed Metrics
        for (const metric of CANDIDATE_METRICS) {
            await setDoc(doc(db, "candidate_metrics", metric.id), metric);
        }

        return "Database Seeded Successfully. Please refresh.";
    } catch (e: any) {
        console.error("Seeding Error:", e);
        return "Seeding Failed: " + e.message;
    }
};
