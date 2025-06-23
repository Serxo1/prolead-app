'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadFilter, GooglePlaceResult } from '@/types/lead';
import { LeadService } from '@/services/leadService';
import { PlacesApiService } from '@/services/placesApiService';

import { CacheService } from '@/services/cacheService';
import { loadSampleData } from '@/utils/loadSampleData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Map from './Map';
import LeadFilters from './LeadFilters';
import LeadDetails from './LeadDetails';
import CacheStats from './CacheStats';

import { ThemeToggle } from './ThemeToggle';
import { Upload, Download, Database, MapPin, Plus, Star, List, X, CheckCircle, Phone, Globe, AlertCircle, Mail } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoogleMapsService } from '@/services/googleMapsService';

export default function LeadCapture() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<LeadFilter>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }); // São Paulo

  const [searchStats, setSearchStats] = useState<{
    total: number;
    withPhone: number;
    withWebsite: number;
    withEmail: number;
    withAnyContact: number;
    filterEfficiency: number;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const applyFilters = useCallback(() => {
    const filtered = LeadService.filterLeads(leads, filters);
    setFilteredLeads(filtered);
  }, [leads, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadLeads = () => {
    const allLeads = LeadService.getAllLeads();
    setLeads(allLeads);
  };

  const handleSearch = async (businessType: string) => {
    if (!businessType.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    console.log('🔍 Iniciando busca de leads para tipo:', businessType);
    console.log('📍 Centro da busca:', mapCenter);
    console.log('📏 Raio:', filters.searchRadius || 5000);

    try {
      // Se for 'all', buscar estabelecimentos em geral
      const searchQuery = businessType === 'all' ? 'estabelecimento comercial' : businessType;
      
      // Buscar lugares próximos usando Places API com filtragem de contato
      // Determinar se deve filtrar por contato baseado nos filtros ativos
      const shouldRequireContact = filters.hasPhone === true || filters.hasEmail === true || 
                                   filters.hasWebsite === true || filters.hasContactPerson === true;
      
      console.log('🎯 Buscando lugares', shouldRequireContact ? 'com informações de contato...' : 'próximos...');
      
      const results = await PlacesApiService.searchNearbyPlaces(
        mapCenter, 
        filters.searchRadius || 5000,
        searchQuery,
        shouldRequireContact,
        20    // maxResults = 20
      );
      
      console.log('📊 Resultados encontrados:', results.length);
      
      // Obter estatísticas de filtragem para mostrar ao usuário
      if (results.length > 0) {
        const stats = PlacesApiService.getFilterStats(results);
        console.log('📈 Estatísticas de filtragem:', stats);
        setSearchStats(stats);
        
        // Mostrar estatísticas no console para debug
        console.log(`✅ Eficiência da filtragem: ${stats.filterEfficiency}%`);
        console.log(`📞 Com telefone: ${stats.withPhone}`);
        console.log(`🌐 Com website: ${stats.withWebsite}`);
        console.log(`📧 Com email: ${stats.withEmail}`);
      } else {
        setSearchStats(null);
      }
      
      // Remover duplicatas baseado no place_id
      const uniqueResults = results.filter((place, index, self) => 
        index === self.findIndex(p => p.place_id === place.place_id)
      );
      
      setSearchResults(uniqueResults);
      
      // Mostrar feedback ao usuário
      if (results.length === 0) {
        if (shouldRequireContact) {
          alert('Nenhum lugar encontrado com informações de contato na região especificada. Tente expandir o raio de busca, escolher outro tipo de negócio, ou ajustar os filtros de contato.');
        } else {
          alert('Nenhum lugar encontrado na região especificada. Tente expandir o raio de busca ou escolher outro tipo de negócio.');
        }
      } else {
        // Mostrar estatísticas em uma notificação discreta
        const stats = PlacesApiService.getFilterStats(results);
        if (shouldRequireContact) {
          console.log(`🎯 Encontrados ${results.length} lugares com contato (${stats.filterEfficiency}% dos resultados tinham informações válidas)`);
        } else {
          console.log(`📊 Encontrados ${results.length} lugares (${stats.withAnyContact} com informações de contato)`);
        }
      }
    } catch (error) {
      console.error('❌ Erro na busca de leads:', error);
      setSearchResults([]);
      alert('Erro na busca. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressSearch = async (address: string) => {
    console.log('📍 Buscando endereço:', address);
    
    try {
      // Alternativa 1: Usar Places API Text Search (se Geocoding não estiver disponível)
      console.log('🔄 Tentando busca via Places API...');
      
      // Usar a Google Maps Service para buscar o endereço
      if (!GoogleMapsService.isMapReady()) {
        alert('Google Maps não está inicializado. Aguarde um momento e tente novamente.');
        return;
      }

      // Usar Places Autocomplete para encontrar o endereço
      const predictions = await GoogleMapsService.autocomplete(address);
      
      if (predictions.length > 0) {
        const firstPrediction = predictions[0];
        console.log('✅ Predição encontrada:', firstPrediction.description);
        
        // Usar Place Details para obter as coordenadas
        const placeDetails = await GoogleMapsService.getPlaceDetails(firstPrediction.place_id);
        
        if (placeDetails && placeDetails.geometry) {
          const newCenter = {
            lat: placeDetails.geometry.location.lat,
            lng: placeDetails.geometry.location.lng
          };
          
          console.log('✅ Coordenadas encontradas:', newCenter);
          
          setMapCenter(newCenter);
          handleCenterChange(newCenter);
          
          // Mostrar confirmação
          alert(`Região definida para: ${placeDetails.formatted_address}`);
          return;
        }
      }
      
      // Fallback: Tentar Geocoding API (pode falhar se não estiver ativada)
      console.log('🔄 Tentando busca via Geocoding API...');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Erro na requisição de geocoding');
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const newCenter = { lat: location.lat, lng: location.lng };
        
        console.log('✅ Endereço encontrado via Geocoding:', newCenter);
        console.log('📍 Endereço formatado:', data.results[0].formatted_address);
        
        setMapCenter(newCenter);
        handleCenterChange(newCenter);
        
        // Mostrar confirmação
        alert(`Região definida para: ${data.results[0].formatted_address}`);
      } else if (data.status === 'REQUEST_DENIED') {
        console.warn('⚠️ Geocoding API não autorizada:', data.error_message);
        alert('Para buscar endereços, você precisa ativar a Geocoding API no Google Cloud Console.\n\nPor enquanto, você pode usar coordenadas aproximadas ou endereços conhecidos.');
      } else {
        console.warn('⚠️ Endereço não encontrado:', data.status);
        alert('Endereço não encontrado. Tente um endereço mais específico.');
      }
    } catch (error) {
      console.error('❌ Erro na busca de endereço:', error);
      
      // Oferecer coordenadas padrão de São Paulo como fallback
      const defaultCenter = { lat: -23.5505, lng: -46.6333 };
      setMapCenter(defaultCenter);
      handleCenterChange(defaultCenter);
      
      alert(`Erro ao buscar endereço. Usando localização padrão: São Paulo, SP.\n\nPara buscar endereços específicos, ative a Geocoding API no Google Cloud Console.`);
    }
  };

  const handleFiltersChange = (newFilters: LeadFilter) => {
    setFilters(newFilters);
    // Removido: limpeza automática dos resultados
  };

  const handleAddLead = async (place: GooglePlaceResult) => {
    // Verificar se o lead já existe
    const existingLead = leads.find(lead => lead.placeId === place.place_id);
    if (existingLead) {
      alert('Este lead já existe na sua lista!');
      return;
    }

    // Determinar o melhor telefone disponível
    const bestPhone = place.formatted_phone_number || place.international_phone_number;
    
    // Extrair informações de contato das reviews (se disponível)
    let contactPerson = '';
    if (place.reviews && place.reviews.length > 0) {
      // Tentar extrair nome do proprietário/gerente das reviews
      const ownerReview = place.reviews.find(review => 
        review.author_name && (
          review.text?.toLowerCase().includes('proprietário') ||
          review.text?.toLowerCase().includes('gerente') ||
          review.text?.toLowerCase().includes('dono')
        )
      );
      if (ownerReview) {
        contactPerson = ownerReview.author_name;
      }
    }

    // Criar descrição mais detalhada
    let description = 'Encontrado via Google Places API';
    if (place.editorial_summary?.overview) {
      description += ` - ${place.editorial_summary.overview}`;
    }
    if (place.business_status) {
      description += ` (Status: ${place.business_status})`;
    }

    // Determinar tipo de negócio mais específico
    const businessType = place.types.find(type => 
      !['establishment', 'point_of_interest', 'store'].includes(type)
    ) || place.types[0] || 'other';

    console.log('📋 Criando lead com informações detalhadas:', {
      name: place.name,
      hasPhone: !!bestPhone,
      hasWebsite: !!place.website,
      hasInternationalPhone: !!place.international_phone_number,
      businessType,
      contactPerson: contactPerson || 'Não identificado',
      reviewsCount: place.user_ratings_total,
      rating: place.rating
    });

    const newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      name: place.name,
      address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      businessType,
      rating: place.rating,
      reviews: place.user_ratings_total,
      website: place.website,
      phone: bestPhone,
      placeId: place.place_id,
      status: 'new',
      description,
      contactPerson: contactPerson || undefined,
      // Adicionar tags baseadas nas informações disponíveis
      tags: [
        ...(place.website ? ['tem-website'] : []),
        ...(bestPhone ? ['tem-telefone'] : []),
        ...(place.rating && place.rating >= 4.0 ? ['bem-avaliado'] : []),
        ...(place.user_ratings_total && place.user_ratings_total > 50 ? ['muitas-reviews'] : []),
        ...(place.business_status === 'OPERATIONAL' ? ['ativo'] : []),
        ...(place.price_level ? [`nivel-preco-${place.price_level}`] : []),
      ].filter(Boolean),
    };

    const createdLead = LeadService.createLead(newLead);
    setLeads(prev => [...prev, createdLead]);
    
    // Remover o place adicionado dos resultados de busca em vez de limpar tudo
    setSearchResults(prev => prev.filter(p => p.place_id !== place.place_id));
    
    // Mostrar confirmação mais detalhada
    const contactInfo = [];
    if (bestPhone) contactInfo.push('telefone');
    if (place.website) contactInfo.push('website');
    
    const confirmationMessage = `Lead "${place.name}" adicionado com sucesso!${
      contactInfo.length > 0 ? `\n\nInformações de contato encontradas: ${contactInfo.join(', ')}` : '\n\nNenhuma informação de contato encontrada.'
    }`;
    
    alert(confirmationMessage);
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

  const showCacheStats = () => {
    const cacheStats = CacheService.getStats();
    const placesStats = PlacesApiService.getCacheStats();
    
    const estimatedSize = typeof cacheStats.estimatedSize === 'number' ? cacheStats.estimatedSize : 0;
    
    const message = `📊 Estatísticas do Cache:
    
🗄️ Cache Geral:
• Total de itens: ${cacheStats.totalItems}
• Tamanho estimado: ${Math.round(estimatedSize / 1024)}KB

📍 Cache de Lugares:
• Chaves de lugares: ${placesStats.placesKeys}
• Detalhes em cache: ${placesStats.detailsCache}
• Buscas em cache: ${placesStats.nearbyCache}

💡 O cache economiza chamadas à API e acelera as buscas repetidas.`;
    
    alert(message);
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
            <Button onClick={showCacheStats} variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Estatísticas do Cache
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

        {/* Action Buttons */}
        <div className="mb-6">
          <Button 
            onClick={() => {
              const loaded = loadSampleData();
              if (loaded) {
                loadLeads();
                alert('Dados de exemplo carregados com sucesso!');
              } else {
                alert('Dados de exemplo já foram carregados anteriormente.');
              }
            }}
            variant="outline"
            className="w-full"
          >
            <Database className="h-4 w-4 mr-2" />
            Carregar Dados de Exemplo
          </Button>
        </div>

        {/* Filters */}
        <LeadFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onAddressSearch={handleAddressSearch}
          onRadiusChange={handleRadiusChange}
          onCenterChange={handleCenterChange}
          isSearching={isSearching}
        />

        {/* Search Stats */}
        {searchStats && (
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Estatísticas da Busca</h3>
                    <Badge variant="outline" className="text-xs">
                      {searchStats.filterEfficiency}% úteis
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-green-600" />
                      <span>{searchStats.withPhone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-blue-600" />
                      <span>{searchStats.withWebsite}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-purple-600" />
                      <span>{searchStats.withEmail}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {searchStats.withAnyContact} de {searchStats.total} com contato
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                searchRadius={filters.searchRadius}
                showSearchArea={!!filters.searchRadius}
              />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Loading State */}
            {isSearching && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <div className="text-center">
                      <h3 className="font-medium text-sm">Buscando leads próximos...</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Analisando lugares com informações de contato
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {!isSearching && searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Resultados da Busca ({searchResults.length})</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchResults([])}
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((place, index) => {
                    const hasPhone = !!(place.formatted_phone_number || place.international_phone_number);
                    const hasWebsite = !!place.website;
                    const contactCount = [hasPhone, hasWebsite].filter(Boolean).length;
                    
                    return (
                      <div key={`${place.place_id}-${index}`} className="border rounded-lg p-3 hover:bg-accent transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{place.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{place.formatted_address}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddLead(place)}
                            className="ml-2 shrink-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Contact Information Status */}
                        <div className="mb-2">
                          {contactCount > 0 ? (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                                <CheckCircle className="h-3 w-3" />
                                <span>{contactCount} contato{contactCount > 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex gap-1">
                                {hasPhone && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <Phone className="h-3 w-3" />
                                    <span className="text-xs">Tel</span>
                                  </div>
                                )}
                                {hasWebsite && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Globe className="h-3 w-3" />
                                    <span className="text-xs">Web</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs">
                              <AlertCircle className="h-3 w-3" />
                              <span>Contato limitado</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Additional Info */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {place.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span>{place.rating}</span>
                              {place.user_ratings_total && (
                                <span className="text-gray-400">({place.user_ratings_total})</span>
                              )}
                            </div>
                          )}
                          {place.business_status && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                place.business_status === 'OPERATIONAL' 
                                  ? 'border-green-200 text-green-700' 
                                  : 'border-red-200 text-red-700'
                              }`}
                            >
                              {place.business_status === 'OPERATIONAL' ? 'Ativo' : place.business_status}
                            </Badge>
                          )}
                          {place.types[0] && (
                            <Badge variant="outline" className="text-xs">
                              {place.types[0].replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Quick Contact Preview */}
                        {(hasPhone || hasWebsite) && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-600 space-y-1">
                              {hasPhone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-green-600" />
                                  <span className="font-mono text-xs">
                                    {place.formatted_phone_number || place.international_phone_number}
                                  </span>
                                </div>
                              )}
                              {hasWebsite && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-3 w-3 text-blue-600" />
                                  <span className="text-xs truncate max-w-[200px]">
                                    {place.website}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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