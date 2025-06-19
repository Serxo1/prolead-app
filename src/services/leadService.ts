import { Lead, LeadFilter } from '@/types/lead';

const LEADS_STORAGE_KEY = 'prolead_leads';

export class LeadService {
  private static getLeadsFromStorage(): Lead[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(LEADS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading leads from localStorage:', error);
      return [];
    }
  }

  private static saveLeadsToStorage(leads: Lead[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    } catch (error) {
      console.error('Error saving leads to localStorage:', error);
    }
  }

  static getAllLeads(): Lead[] {
    return this.getLeadsFromStorage();
  }

  static getLeadById(id: string): Lead | null {
    const leads = this.getLeadsFromStorage();
    return leads.find(lead => lead.id === id) || null;
  }

  static createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
    const leads = this.getLeadsFromStorage();
    const newLead: Lead = {
      ...leadData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    leads.push(newLead);
    this.saveLeadsToStorage(leads);
    return newLead;
  }

  static updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>): Lead | null {
    const leads = this.getLeadsFromStorage();
    const index = leads.findIndex(lead => lead.id === id);
    
    if (index === -1) return null;
    
    leads[index] = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveLeadsToStorage(leads);
    return leads[index];
  }

  static deleteLead(id: string): boolean {
    const leads = this.getLeadsFromStorage();
    const filteredLeads = leads.filter(lead => lead.id !== id);
    
    if (filteredLeads.length === leads.length) return false;
    
    this.saveLeadsToStorage(filteredLeads);
    return true;
  }

  static filterLeads(filters: LeadFilter): Lead[] {
    const leads = this.getLeadsFromStorage();
    
    return leads.filter(lead => {
      // Filter by business type
      if (filters.businessType && lead.businessType !== filters.businessType) {
        return false;
      }
      
      // Filter by industry
      if (filters.industry && lead.industry !== filters.industry) {
        return false;
      }
      
      // Filter by status
      if (filters.status && lead.status !== filters.status) {
        return false;
      }
      
      // Filter by rating
      if (filters.rating && (lead.rating || 0) < filters.rating) {
        return false;
      }
      
      // Filter by location radius (using searchCenter and searchRadius)
      if (filters.searchCenter && filters.searchRadius) {
        const distance = this.calculateDistance(
          filters.searchCenter.lat,
          filters.searchCenter.lng,
          lead.latitude,
          lead.longitude
        );
        if (distance > filters.searchRadius / 1000) { // Convert meters to kilometers
          return false;
        }
      }
      
      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        if (!lead.tags || !filters.tags.some(tag => lead.tags!.includes(tag))) {
          return false;
        }
      }
      
      // Filter by contact information
      if (filters.hasPhone && !lead.phone) {
        return false;
      }
      
      if (filters.hasEmail && !lead.email) {
        return false;
      }
      
      if (filters.hasWebsite && !lead.website) {
        return false;
      }
      
      if (filters.hasContactPerson && !lead.contactPerson) {
        return false;
      }
      
      return true;
    });
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  static exportLeads(): string {
    const leads = this.getLeadsFromStorage();
    return JSON.stringify(leads, null, 2);
  }

  static importLeads(jsonData: string): boolean {
    try {
      const leads = JSON.parse(jsonData);
      if (Array.isArray(leads)) {
        this.saveLeadsToStorage(leads);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing leads:', error);
      return false;
    }
  }
} 