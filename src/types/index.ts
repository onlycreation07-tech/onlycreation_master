export type View = 'home' | 'create' | 'studios' | 'projects' | 'profile' | 'admin' | 'billboards' | 'dispatch';

export interface DispatchBooking {
  id?: string;
  userId: string;
  creatorTier: 'instagrammer' | 'dslr_pro' | 'agency_crew' | 'rental_express';
  creatorName?: string;
  creatorPhoto?: string;
  creatorHandle?: string;
  creatorEquipment?: string;
  vehicleInfo?: string;
  pickupLocation?: string;
  shootLocation: string;
  durationHours?: number;
  totalPrice: number;
  status: 'matching' | 'en_route' | 'arrived' | 'shooting' | 'completed';
  deliveredReelUrl?: string;
  rating?: number;
  briefPrompt?: string;
  createdAt?: string;
}


export interface BillboardEnquiry {
  id: string;
  userId: string;
  userEmail: string;
  prompt: string;
  billboardType: 'led' | 'banner' | 'scrolling' | 'any';
  budget: string;
  status: 'pending' | 'reviewed' | 'contacted';
  suggestedLocations?: string[];
  suggestedQuantity?: number;
  createdAt: string;
}

export interface BrandProfile {
  name: string;
  industry: string;
  targetAudience: string;
  tone: string;
  primaryColor: string;
  fontVibe: 'modern' | 'serif' | 'brutalist' | 'minimal';
  likedStudioIds?: string[];
}

export interface AdCreative {
  id: string;
  prompt: string;
  copy: string;
  imageUrls: string[];
  videoScript: string;
  productionBrief?: string; // High-end technical brief for studios
  brandId?: string;
  status: 'draft' | 'approved' | 'produced';
  createdAt: string;
}

export interface Studio {
  id: string;
  name: string;
  description: string;
  location: string;
  pricePerHour: number;
  imageUrl: string;
  category: 'photography' | 'video' | 'music' | 'podcast' | 'mixed' | 'billboard';
  equipment: string[];
  rating: number;
  amenities: string[];
  genres?: string[];
  previousWorks?: Array<{
    url: string;
    type: 'image' | 'video';
    title?: string;
  }>;
  availability?: string;
  isPremium?: boolean;
  socialLinks?: {
    instagram?: string;
    website?: string;
  };
}

export interface Booking {
  id: string;
  studioId: string;
  studioName: string;
  date: string;
  hours: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed';
  creativeId?: string; // Reference to the ad that inspired this booking
  userId?: string;
  brandName?: string;
}
