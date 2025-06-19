import { Lead } from '@/types/lead';

export interface EnrichmentResult {
  leadId: string;
  success: boolean;
  data?: {
    emails: string[];
    phones: string[];
    contactPerson?: string;
    socialMedia?: {
      linkedin?: string;
      facebook?: string;
      instagram?: string;
    };
  };
  error?: string;
}

export class LeadEnrichmentService {
  static async enrichLead(lead: Lead): Promise<EnrichmentResult> {
    try {
      // Simulação de enriquecimento de dados
      // Em um cenário real, aqui você faria chamadas para APIs de enriquecimento
      
      const result: EnrichmentResult = {
        leadId: lead.id,
        success: true,
        data: {
          emails: [],
          phones: [],
          contactPerson: undefined,
          socialMedia: {}
        }
      };

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simular dados encontrados baseado no nome do lead
      if (lead.name.toLowerCase().includes('restaurante') || lead.name.toLowerCase().includes('cafe')) {
        result.data!.emails = [`contato@${lead.name.toLowerCase().replace(/\s+/g, '')}.com.br`];
        result.data!.phones = ['(11) 99999-9999'];
        result.data!.contactPerson = 'Gerente';
      } else if (lead.name.toLowerCase().includes('loja') || lead.name.toLowerCase().includes('shop')) {
        result.data!.emails = [`vendas@${lead.name.toLowerCase().replace(/\s+/g, '')}.com.br`];
        result.data!.phones = ['(11) 88888-8888'];
        result.data!.contactPerson = 'Vendedor';
      }

      return result;
    } catch (error) {
      return {
        leadId: lead.id,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  static async enrichMultipleLeads(leads: Lead[]): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];
    
    for (const lead of leads) {
      const result = await this.enrichLead(lead);
      results.push(result);
    }
    
    return results;
  }
} 