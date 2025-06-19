'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadFilter, GooglePlaceResult } from '@/types/lead';
import { LeadService } from '@/services/leadService';
import { PlacesApiService } from '@/services/placesApiService';
import { LeadEnrichmentService, EnrichmentResult } from '@/services/leadEnrichmentService';
import { CacheService } from '@/services/cacheService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Map from './Map';
import LeadFilters from './LeadFilters';
import LeadDetails from './LeadDetails';
import CacheStats from './CacheStats';
import { LeadEnrichment } from './LeadEnrichment';
import { ThemeToggle } from './ThemeToggle';
import { Upload, Download, Database, Zap, MapPin, Plus, Star, List } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function LeadCapture() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<LeadFilter>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }); // São Paulo

  useEffect(() => {
    loadLeads();
  }, []);

  const applyFilters = useCallback(() => {
    const filtered = LeadService.filterLeads(filters);
    setFilteredLeads(filtered);
  }, [filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadLeads = () => {
    const allLeads = LeadService.getAllLeads();
    setLeads(allLeads);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Buscar lugares próximos usando Places API
      const results = await PlacesApiService.searchNearbyPlaces(mapCenter, 5000);
      
      // Filtrar resultados baseado na query
      const filteredResults = results.filter(place => 
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.formatted_address.toLowerCase().includes(query.toLowerCase()) ||
        place.types.some(type => type.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching places:', error);
      setSearchResults([]);
    }
  };

  const handleAddLead = async (place: GooglePlaceResult) => {
    // Verificar se o lead já existe
    const existingLead = leads.find(lead => lead.placeId === place.place_id);
    if (existingLead) {
      alert('Este lead já existe na sua lista!');
      return;
    }

    const newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      name: place.name,
      address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      businessType: place.types[0] || 'other',
      rating: place.rating,
      reviews: place.user_ratings_total,
      website: place.website,
      phone: place.formatted_phone_number,
      placeId: place.place_id,
      status: 'new',
      description: `Encontrado via Google Places API`,
    };

    const createdLead = LeadService.createLead(newLead);
    setLeads(prev => [...prev, createdLead]);
    setSearchResults([]);
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(prev => prev.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
    if (selectedLead?.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
  };

  const handleLeadDelete = (id: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== id));
    if (selectedLead?.id === id) {
      setSelectedLead(null);
    }
  };

  const handleRadiusChange = (radius: number) => {
    setFilters(prev => ({
      ...prev,
      searchRadius: radius,
      searchCenter: mapCenter,
    }));
  };

  const handleCenterChange = (center: { lat: number; lng: number }) => {
    setMapCenter(center);
    if (filters.searchRadius) {
      setFilters(prev => ({
        ...prev,
        searchCenter: center,
      }));
    }
  };

  const handleEnrichmentComplete = async (results: EnrichmentResult[]) => {
    // Aplicar dados enriquecidos aos leads
    for (const result of results) {
      if (result.success && result.data) {
        const lead = leads.find(l => l.id === result.leadId);
        if (lead) {
          const updates: Partial<Lead> = {};
          
          // Atualizar emails se não existirem
          if (result.data.emails.length > 0 && !lead.email) {
            updates.email = result.data.emails[0];
          }
          
          // Atualizar telefones se não existirem
          if (result.data.phones.length > 0 && !lead.phone) {
            updates.phone = result.data.phones[0];
          }
          
          // Atualizar pessoa de contato se não existir
          if (result.data.contactPerson && !lead.contactPerson) {
            updates.contactPerson = result.data.contactPerson;
          }
          
          // Aplicar atualizações se houver
          if (Object.keys(updates).length > 0) {
            const updatedLead = LeadService.updateLead(lead.id, updates);
            if (updatedLead) {
              setLeads(prev => prev.map(l => l.id === lead.id ? updatedLead : l));
            }
          }
        }
      }
    }
  };

  const startEnrichment = async () => {
    // Selecionar leads para enriquecimento (com website e sem email/telefone)
    const leadsToEnrich = leads.filter(lead => 
      lead.website && (!lead.email || !lead.phone)
    );
    
    if (leadsToEnrich.length === 0) {
      alert('Nenhum lead encontrado para enriquecimento. Leads precisam ter website e estar sem email ou telefone.');
      return;
    }
    
    try {
      const results = await LeadEnrichmentService.enrichMultipleLeads(leadsToEnrich);
      handleEnrichmentComplete(results);
    } catch (error) {
      console.error('Erro no enriquecimento:', error);
    }
  };

  const exportLeads = () => {
    const data = LeadService.exportLeads();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importLeads = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (LeadService.importLeads(content)) {
        loadLeads();
        alert('Leads importados com sucesso!');
      } else {
        alert('Erro ao importar leads. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const clearCache = () => {
    CacheService.clear();
    PlacesApiService.clearCache();
    alert('Cache limpo com sucesso!');
  };

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      contacted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
      qualified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
      converted: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    };
    return colors[status];
  };

  const getLeadScore = (lead: Lead) => {
    let score = 0;
    
    // Pontos por informações básicas
    if (lead.name) score += 10;
    if (lead.address) score += 10;
    if (lead.phone) score += 15;
    if (lead.email) score += 15;
    if (lead.website) score += 10;
    if (lead.contactPerson) score += 10;
    
    // Pontos por rating
    if (lead.rating) {
      score += Math.floor(lead.rating * 2);
    }
    
    // Pontos por reviews
    if (lead.reviews) {
      score += Math.min(lead.reviews / 10, 10);
    }
    
    // Pontos por status
    const statusPoints = {
      new: 0,
      contacted: 5,
      qualified: 10,
      converted: 20,
      lost: -5
    };
    score += statusPoints[lead.status];
    
    return Math.round(score);
  };

  const sortedLeads = [...filteredLeads].sort((a, b) => getLeadScore(b) - getLeadScore(a));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ProLead Capture</h1>
            <p className="text-muted-foreground">Sistema de captação e gerenciamento de leads</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <input
              type="file"
              accept=".json"
              onChange={importLeads}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </span>
              </Button>
            </label>
            <Button onClick={exportLeads} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={clearCache} variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Leads</p>
                  <p className="text-2xl font-bold">{leads.length}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">Total</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Novos</p>
                  <p className="text-2xl font-bold">{leads.filter(l => l.status === 'new').length}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">Novo</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Qualificados</p>
                  <p className="text-2xl font-bold">{leads.filter(l => l.status === 'qualified').length}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">Qualificado</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Convertidos</p>
                  <p className="text-2xl font-bold">{leads.filter(l => l.status === 'converted').length}</p>
                </div>
                <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">Convertido</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cache Stats */}
        <CacheStats />

        {/* Lead Enrichment */}
        <LeadEnrichment 
          leads={leads} 
          onEnrichmentComplete={handleEnrichmentComplete}
        />

        {/* Enrichment Button */}
        <div className="mb-6">
          <Button 
            onClick={startEnrichment} 
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            Enriquecer Leads Automaticamente
          </Button>
        </div>

        {/* Filters */}
        <LeadFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          onRadiusChange={handleRadiusChange}
          onCenterChange={handleCenterChange}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mapa de Leads ({filteredLeads.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <Map
                  leads={filteredLeads}
                  onLeadSelect={setSelectedLead}
                  center={mapCenter}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resultados da Busca ({searchResults.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((place) => (
                    <div key={place.place_id} className="border rounded-lg p-3 hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{place.name}</h4>
                        <Button
                          size="sm"
                          onClick={() => handleAddLead(place)}
                          className="ml-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{place.formatted_address}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {place.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{place.rating}</span>
                          </div>
                        )}
                        {place.types[0] && (
                          <Badge variant="outline" className="text-xs">
                            {place.types[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Leads List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Leads ({sortedLeads.length})</CardTitle>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <List className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Lista de Leads</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-2 mt-4">
                        {sortedLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{lead.name}</h4>
                              <div className="flex items-center gap-1">
                                <Badge className={getStatusColor(lead.status)}>
                                  {lead.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {getLeadScore(lead)}pts
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{lead.address}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {lead.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{lead.rating}</span>
                                </div>
                              )}
                              {lead.businessType && (
                                <Badge variant="outline" className="text-xs">
                                  {lead.businessType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {sortedLeads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{lead.name}</h4>
                      <div className="flex items-center gap-1">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getLeadScore(lead)}pts
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{lead.address}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {lead.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{lead.rating}</span>
                        </div>
                      )}
                      {lead.businessType && (
                        <Badge variant="outline" className="text-xs">
                          {lead.businessType}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {sortedLeads.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{sortedLeads.length - 5} mais leads
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lead Details Modal */}
        {selectedLead && (
          <LeadDetails
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onLeadUpdate={handleLeadUpdate}
            onLeadDelete={handleLeadDelete}
          />
        )}
      </div>
    </div>
  );
} 