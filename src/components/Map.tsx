'use client';

import { useEffect, useRef, useState } from 'react';
import { Lead } from '@/types/lead';
import { GoogleMapsService } from '@/services/googleMapsService';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  Phone, 
  Globe, 
  Building, 
  X
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface MapProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  center?: { lat: number; lng: number };
  searchRadius?: number;
  showSearchArea?: boolean;
}

declare global {
  interface Window {
    openLeadDetails?: (leadId: string) => void;
  }
}

export default function Map({ leads, onLeadSelect, center, searchRadius, showSearchArea }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isQuickDialogOpen, setIsQuickDialogOpen] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const searchCircleRef = useRef<google.maps.Circle | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Função para atualizar o círculo de busca
  const updateSearchCircle = () => {
    if (!mapInstance.current || !showSearchArea || !searchRadius) {
      // Remover círculo se não deve ser mostrado
      if (searchCircleRef.current) {
        searchCircleRef.current.setMap(null);
        searchCircleRef.current = null;
      }
      return;
    }

    // Remover círculo anterior se existir
    if (searchCircleRef.current) {
      searchCircleRef.current.setMap(null);
    }

    // Criar novo círculo
    searchCircleRef.current = new google.maps.Circle({
      strokeColor: isDark ? '#3B82F6' : '#2563EB',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: isDark ? '#3B82F6' : '#2563EB',
      fillOpacity: 0.1,
      map: mapInstance.current,
      center: center || { lat: -23.5505, lng: -46.6333 },
      radius: searchRadius,
    });

    console.log('🔵 Círculo de busca atualizado:', { center, radius: searchRadius });
  };

  // Atualizar círculo quando props mudarem
  useEffect(() => {
    if (mapInstance.current) {
      updateSearchCircle();
    }
  }, [center, searchRadius, showSearchArea, isDark]);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;
    let map: google.maps.Map;
    let markers: google.maps.Marker[] = [];
    const loadMap = async () => {
      try {
        // Inicializar o GoogleMapsService primeiro
        await GoogleMapsService.initialize();
        
        // Verificar se a inicialização foi bem-sucedida
        if (!GoogleMapsService['isInitialized']) {
          throw new Error('Falha na inicialização do Google Maps');
        }
        
        // Estilos do mapa baseados no tema
        const mapStyles = isDark ? [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }],
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#2f3948' }],
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }],
          },
        ] : [];

        // Criar o mapa usando o GoogleMapsService
        map = GoogleMapsService.createMap(mapRef.current!, center || { lat: -23.5505, lng: -46.6333 });
        
        // Aplicar estilos se necessário
        if (mapStyles.length > 0) {
          map.setOptions({ styles: mapStyles });
        }
        
        mapInstance.current = map;
        
        // Criar círculo de busca se necessário
        updateSearchCircle();
        
        // Adiciona marcadores com popup bonito
        markers = leads.map((lead) => {
          const marker = new google.maps.Marker({
            position: { lat: lead.latitude, lng: lead.longitude },
            map,
            title: lead.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Sombra -->
                  <ellipse cx="20" cy="37" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
                  <!-- Pin principal -->
                  <path d="M20 2C13.37 2 8 7.37 8 14c0 8.75 12 22 12 22s12-13.25 12-22c0-6.63-5.37-12-12-12z" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
                  <!-- Círculo interno -->
                  <circle cx="20" cy="14" r="5" fill="white"/>
                  <!-- Ícone de lead -->
                  <circle cx="20" cy="14" r="2" fill="#EF4444"/>
                  <!-- Brilho -->
                  <ellipse cx="17" cy="11" rx="2" ry="3" fill="rgba(255,255,255,0.3)"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 36),
            },
          });

          marker.addListener('click', () => {
            // Fechar todos os outros popups
            markers.forEach(m => {
              if (m !== marker) {
                // Linha removida: m.infoWindow?.close();
              }
            });
            
            // Abrir dialog transparente diretamente
            setSelectedLead(lead);
            setIsQuickDialogOpen(true);
          });

          return marker;
        });

        markersRef.current = markers;

        // Configurar função global para abrir detalhes completos
        window.openLeadDetails = (leadId: string) => {
          const lead = leads.find(l => l.id === leadId);
          if (lead) {
            setSelectedLead(lead);
            setIsQuickDialogOpen(true);
          }
        };

      } catch (err) {
        console.error('Erro ao carregar mapa:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    };

    loadMap();

    return () => {
      // Cleanup
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      delete window.openLeadDetails;
    };
  }, [isClient, leads, center, isDark, onLeadSelect]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">Erro ao carregar mapa</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Dialog transparente (detalhes rápidos) */}
      <Dialog open={isQuickDialogOpen} onOpenChange={setIsQuickDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-sm border-border/50">
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{selectedLead.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedLead.address}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsQuickDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {selectedLead.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{selectedLead.rating} ({selectedLead.reviews} avaliações)</span>
                  </div>
                )}
                
                {selectedLead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{selectedLead.phone}</span>
                  </div>
                )}
                
                {selectedLead.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <a 
                      href={selectedLead.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
                
                {selectedLead.businessType && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">{selectedLead.businessType}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedLead.status}</Badge>
                {selectedLead.industry && (
                  <Badge variant="secondary">{selectedLead.industry}</Badge>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => {
                    setIsQuickDialogOpen(false);
                    onLeadSelect(selectedLead);
                  }}
                  className="flex-1"
                >
                  Ver detalhes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsQuickDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 