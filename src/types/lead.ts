export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address: string;
  latitude: number;
  longitude: number;
  businessType?: string;
  industry?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  photos?: string[];
  placeId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  tags?: string[];
  contactPerson?: string;
  companySize?: string;
  revenue?: string;
  lastContact?: string;
}

export interface LeadFilter {
  businessType?: string;
  industry?: string;
  status?: Lead['status'];
  rating?: number;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  tags?: string[];
  hasPhone?: boolean;
  hasEmail?: boolean;
  hasWebsite?: boolean;
  hasContactPerson?: boolean;
  searchRadius?: number;
  searchCenter?: {
    lat: number;
    lng: number;
  };
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  website?: string;
  formatted_phone_number?: string;
  business_status?: string;
  opening_hours?: {
    open_now: boolean;
  };
} 