'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';
import { LeadEnrichmentService, EnrichmentResult } from '@/services/leadEnrichmentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LeadEnrichmentProps {
  leads: Lead[];
  onEnrichmentComplete: (results: EnrichmentResult[]) => void;
}

export function LeadEnrichment({ leads, onEnrichmentComplete }: LeadEnrichmentProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [results, setResults] = useState<EnrichmentResult[]>([]);

  const handleEnrichment = async () => {
    setIsEnriching(true);
    setResults([]);

    try {
      const enrichmentResults = await LeadEnrichmentService.enrichMultipleLeads(leads);
      setResults(enrichmentResults);
      onEnrichmentComplete(enrichmentResults);
    } catch (error) {
      console.error('Erro no enriquecimento:', error);
    } finally {
      setIsEnriching(false);
    }
  };

  const getSuccessCount = () => results.filter(r => r.success).length;
  const getFailureCount = () => results.filter(r => !r.success).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Enriquecimento de Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Enriquecer dados de {leads.length} leads
            </p>
            {results.length > 0 && (
              <div className="flex gap-2 mt-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {getSuccessCount()} sucessos
                </Badge>
                {getFailureCount() > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {getFailureCount()} falhas
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={handleEnrichment}
            disabled={isEnriching || leads.length === 0}
            className="flex items-center gap-2"
          >
            {isEnriching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enriquecendo...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Enriquecer Leads
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Resultados:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {results.map((result) => {
                const lead = leads.find(l => l.id === result.leadId);
                return (
                  <div
                    key={result.leadId}
                    className="flex items-center justify-between p-2 text-sm border rounded"
                  >
                    <span className="truncate">{lead?.name || 'Lead desconhecido'}</span>
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 