import { LeadService } from '@/services/leadService';
import rawSampleLeads from '@/data/sampleLeads.json';

const sampleLeads: Record<string, unknown>[] = rawSampleLeads as Record<string, unknown>[];

export const loadSampleData = () => {
  // Verifica se já existem leads no localStorage
  const existingLeads = LeadService.getAllLeads();
  
  if (existingLeads.length === 0) {
    // Carrega os dados de exemplo apenas se não houver leads existentes
    sampleLeads.forEach((lead) => {
      LeadService.createLead({
        name: lead.name as string,
        email: lead.email as string || undefined,
        phone: lead.phone as string || undefined,
        website: lead.website as string || undefined,
        address: lead.address as string,
        latitude: lead.latitude as number,
        longitude: lead.longitude as number,
        businessType: lead.businessType as string || undefined,
        industry: lead.industry as string || undefined,
        description: lead.description as string || undefined,
        rating: lead.rating as number || undefined,
        reviews: lead.reviews as number || undefined,
        photos: lead.photos as string[] || undefined,
        placeId: lead.placeId as string || undefined,
        notes: lead.notes as string || undefined,
        status: lead.status as 'new' | 'contacted' | 'qualified' | 'converted' | 'lost',
        tags: lead.tags as string[] || undefined,
        contactPerson: lead.contactPerson as string || undefined,
        companySize: lead.companySize as string || undefined,
        revenue: lead.revenue as string || undefined,
        lastContact: lead.lastContact as string || undefined,
      });
    });
    
    console.log('Dados de exemplo carregados com sucesso!');
    return true;
  }
  
  return false;
}; 