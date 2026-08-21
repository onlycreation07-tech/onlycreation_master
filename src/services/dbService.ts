import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Studio, AdCreative, BrandProfile, BillboardEnquiry, Booking, DispatchBooking } from '../types';

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
  async getAppConfig(): Promise<{ subscriptionPrice: number }> {
    const docSnap = await getDoc(doc(db, 'config', 'main'));
    if (docSnap.exists()) {
      return docSnap.data() as { subscriptionPrice: number };
    }
    return { subscriptionPrice: 499 }; // Default
  },

  async updateAppConfig(config: { subscriptionPrice: number }): Promise<void> {
    await setDoc(doc(db, 'config', 'main'), config, { merge: true });
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
