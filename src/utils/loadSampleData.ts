import { LeadService } from '@/services/leadService';
import sampleLeads from '@/data/sampleLeads.json';

export const loadSampleData = () => {
  // Verifica se já existem leads no localStorage
  const existingLeads = LeadService.getAllLeads();
  
  if (existingLeads.length === 0) {
    // Carrega os dados de exemplo apenas se não houver leads existentes
    sampleLeads.forEach((lead) => {
      LeadService.createLead({
        name: lead.name,
        email: lead.email || undefined,
        phone: lead.phone || undefined,
        website: lead.website || undefined,
        address: lead.address,
        latitude: lead.latitude,
        longitude: lead.longitude,
        businessType: lead.businessType || undefined,
        industry: lead.industry || undefined,
        description: lead.description || undefined,
        rating: lead.rating || undefined,
        reviews: lead.reviews || undefined,
        photos: lead.photos || undefined,
        placeId: lead.placeId || undefined,
        notes: lead.notes || undefined,
        status: lead.status as 'new' | 'contacted' | 'qualified' | 'converted' | 'lost',
        tags: lead.tags || undefined,
        contactPerson: lead.contactPerson || undefined,
        companySize: lead.companySize || undefined,
        revenue: lead.revenue || undefined,
        lastContact: lead.lastContact || undefined,
      });
    });
    
    console.log('Dados de exemplo carregados com sucesso!');
    return true;
  }
  
  return false;
}; 