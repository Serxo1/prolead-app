'use client';

import { useEffect, useRef, useState } from 'react';
import { Lead } from '@/types/lead';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
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
}

export default function Map({ leads, onLeadSelect, center }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isQuickDialogOpen, setIsQuickDialogOpen] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;
    let map: google.maps.Map;
    let markers: google.maps.Marker[] = [];
    const loadMap = async () => {
      try {
        // @ts-ignore
        const { Loader } = await import('@googlemaps/js-api-loader');
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) throw new Error('API KEY não encontrada');
        const loader = new Loader({
          apiKey,
          version: 'weekly',
        });
        await loader.load();
        
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

        map = new window.google.maps.Map(mapRef.current!, {
          center: center || { lat: -23.5505, lng: -46.6333 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: mapStyles,
        });
        mapInstance.current = map;
        
        // Adiciona marcadores com popup bonito
        markers = leads.map((lead) => {
          const marker = new window.google.maps.Marker({
            position: { lat: lead.latitude, lng: lead.longitude },
            map,
            title: lead.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="${isDark ? '#1f2937' : '#ffffff'}"/>
                  <path d="M16 4C10.48 4 6 8.48 6 14c0 7 10 17 10 17s10-10 10-17c0-5.52-4.48-10-10-10z" fill="#3B82F6"/>
                  <circle cx="16" cy="14" r="3" fill="white"/>
                  <circle cx="16" cy="16" r="16" stroke="${isDark ? '#374151' : '#e5e7eb'}" stroke-width="2" fill="none"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32),
            },
          });

          // Criar conteúdo do popup bonito
          const popupContent = `
            <div style="
              padding: 16px; 
              min-width: 280px; 
              font-family: system-ui, -apple-system, sans-serif;
              background: ${isDark ? '#1f2937' : '#ffffff'};
              color: ${isDark ? '#f9fafb' : '#1f2937'};
              border-radius: 12px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              border: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
            ">
              <div style="
                font-weight: 600; 
                font-size: 16px; 
                margin-bottom: 8px; 
                color: ${isDark ? '#f9fafb' : '#1f2937'};
              ">${lead.name}</div>
              
              <div style="
                font-size: 14px; 
                color: ${isDark ? '#9ca3af' : '#6b7280'}; 
                margin-bottom: 12px;
                line-height: 1.4;
              ">${lead.address}</div>
              
              ${lead.rating ? `
                <div style="
                  display: flex; 
                  align-items: center; 
                  gap: 4px; 
                  margin-bottom: 12px;
                  color: ${isDark ? '#fbbf24' : '#f59e0b'};
                ">
                  <span style="font-size: 14px;">★</span>
                  <span style="font-size: 14px;">${lead.rating} (${lead.reviews} avaliações)</span>
                </div>
              ` : ''}
              
              <button 
                onclick="window.openLeadDetails('${lead.id}')" 
                style="
                  background: #3B82F6; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 6px; 
                  font-size: 14px; 
                  font-weight: 500; 
                  cursor: pointer; 
                  width: 100%;
                  transition: background-color 0.2s;
                "
                onmouseover="this.style.background='#2563EB'"
                onmouseout="this.style.background='#3B82F6'"
              >
                Ver detalhes
              </button>
            </div>
          `;

          const infoWindow = new window.google.maps.InfoWindow({
            content: popupContent,
          });

          marker.addListener('click', () => {
            // Fechar todos os outros popups
            markers.forEach(m => {
              if (m !== marker) {
                // @ts-ignore
                m.infoWindow?.close();
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
        // @ts-ignore
        window.openLeadDetails = (leadId: string) => {
          const lead = leads.find(l => l.id === leadId);
          if (lead) {
            onLeadSelect(lead);
          }
        };

      } catch (err) {
        console.error('Erro ao carregar mapa:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    };

    loadMap();

    return () => {
      // Limpar marcadores
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      // @ts-ignore
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