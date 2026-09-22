import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, setDoc, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Studio, 
  AdCreative, 
  BrandProfile, 
  BillboardEnquiry, 
  Booking, 
  DispatchBooking, 
  Project, 
  ProjectMessage, 
  ActivityLog, 
  AppConfig 
} from '../types';

export const dbService = {
  // Dispatches (Uber for Video Shoots)
  async createDispatch(dispatchData: Omit<DispatchBooking, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'dispatches'), {
      ...dispatchData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async getDispatches(userId?: string): Promise<DispatchBooking[]> {
    let q;
    if (userId) {
      q = query(collection(db, 'dispatches'), where('userId', '==', userId));
    } else {
      q = query(collection(db, 'dispatches'), orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as DispatchBooking));
  },

  async updateDispatch(id: string, updates: Partial<DispatchBooking>): Promise<void> {
    await updateDoc(doc(db, 'dispatches', id), updates);
  },

  // Bookings
  async createBooking(bookingData: Omit<Booking, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async getBookings(): Promise<Booking[]> {
    const q = query(collection(db, 'bookings'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as Booking));
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<void> {
    await updateDoc(doc(db, 'bookings', id), updates);
  },

  async deleteBooking(id: string): Promise<void> {
    await deleteDoc(doc(db, 'bookings', id));
  },
  // Enquiries
  async submitBillboardEnquiry(enquiry: Omit<BillboardEnquiry, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'enquiries'), {
      ...enquiry,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },
  // Studios
  async getStudios(): Promise<Studio[]> {
    const q = query(collection(db, 'studios'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as Studio));
  },


  async addStudio(studio: Omit<Studio, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'studios'), studio);
    return docRef.id;
  },

  async updateStudio(id: string, studio: Partial<Studio>): Promise<void> {
    await updateDoc(doc(db, 'studios', id), studio);
  },

  async deleteStudio(id: string): Promise<void> {
    await deleteDoc(doc(db, 'studios', id));
  },

  // App Config
  async getAppConfig(): Promise<AppConfig> {
    try {
      const docSnap = await getDoc(doc(db, 'config', 'main'));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          subscriptionPrice: data.subscriptionPrice ?? 499,
          commissionRate: data.commissionRate ?? 10,
          panIndiaMode: data.panIndiaMode ?? true,
          featureFlags: data.featureFlags ?? {}
        };
      }
    } catch (e) {
      console.warn("Using fallback app config:", e);
    }
    return { subscriptionPrice: 499, commissionRate: 10, panIndiaMode: true, featureFlags: {} };
  },

  async updateAppConfig(config: Partial<AppConfig>): Promise<void> {
    await setDoc(doc(db, 'config', 'main'), config, { merge: true });
  },

  // Projects Lifecycle (Ideation -> Pre-Production -> Production -> Review -> Delivered)
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: now,
      updatedAt: now,
    });
    // Log initial activity
    await this.logActivity({
      action: 'PROJECT_CREATED',
      entityType: 'project',
      entityId: docRef.id,
      performedBy: projectData.userId,
      details: `Project "${projectData.title}" initialized in stage ${projectData.stage}`
    });
    return docRef.id;
  },

  async getProjects(userId?: string): Promise<Project[]> {
    let q;
    if (userId) {
      q = query(collection(db, 'projects'), where('userId', '==', userId));
    } else {
      q = query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as Project));
  },

  async getProjectById(projectId: string): Promise<Project | null> {
    const docSnap = await getDoc(doc(db, 'projects', projectId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as object) } as Project;
    }
    return null;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    await updateDoc(doc(db, 'projects', projectId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteProject(projectId: string): Promise<void> {
    await deleteDoc(doc(db, 'projects', projectId));
  },

  // Anonymous Internal Messages (Projects & Creators)
  async sendProjectMessage(messageData: Omit<ProjectMessage, 'id' | 'timestamp'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...messageData,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  },

  async getProjectMessages(projectId: string): Promise<ProjectMessage[]> {
    const q = query(
      collection(db, 'messages'),
      where('projectId', '==', projectId),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as ProjectMessage));
  },

  // Activity Audit Logs
  async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        ...log,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Could not write activity log:", err);
    }
  },

  async getActivityLogs(limitCount = 50): Promise<ActivityLog[]> {
    try {
      const q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as ActivityLog));
    } catch (e) {
      console.warn("Failed to fetch activity logs:", e);
      return [];
    }
  },

  // Brand
  async saveBrand(userId: string, brand: Omit<BrandProfile, 'userId'>): Promise<void> {
    await setDoc(doc(db, 'brands', userId), { ...brand, userId }, { merge: true });
  },

  async getBrand(userId: string): Promise<BrandProfile | null> {
    const docSnap = await getDoc(doc(db, 'brands', userId));
    return docSnap.exists() ? docSnap.data() as BrandProfile : null;
  },

  // Billboard Enquiries (Admin)
  async getBillboardEnquiries(): Promise<BillboardEnquiry[]> {
    const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as BillboardEnquiry));
  },

  async updateEnquiryStatus(id: string, status: BillboardEnquiry['status']): Promise<void> {
    await updateDoc(doc(db, 'enquiries', id), { status });
  }
};
