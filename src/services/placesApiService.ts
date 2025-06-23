import { GoogleMapsService } from './googleMapsService';
import { CacheService } from './cacheService';
import { GooglePlaceResult } from '@/types/lead';

export class PlacesApiService {
  private static readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes for places data (aumentado)
  private static readonly DETAILS_CACHE_TTL = 60 * 60 * 1000; // 1 hour for place details
  private static readonly AUTOCOMPLETE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for autocomplete

  static async searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000,
    type?: string,
    requireContact: boolean = true,
    maxResults: number = 20
  ): Promise<GooglePlaceResult[]> {
    const cacheKey = CacheService.generateKey('nearby_places_filtered', {
      lat: location.lat,
      lng: location.lng,
      radius,
      type: type || 'all',
      requireContact,
      maxResults
    });

    // Check cache first
    console.log(`🔍 Verificando cache para: ${cacheKey}`);
    const cached = CacheService.get<GooglePlaceResult[]>(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit: ${cached.length} lugares filtrados`);
      return cached;
    }
    console.log(`📦 Cache miss - fazendo nova busca`);  

    try {
      // Verificar se o Google Maps está disponível
      if (!GoogleMapsService.isMapReady()) {
        console.warn('Google Maps não inicializado, retornando dados mock');
        return this.getMockPlaces(location, type);
      }

      console.log(`🔍 Iniciando busca expandida para filtrar por contato...`);
      
      // Buscar mais resultados da API para ter mais opções para filtrar
      const allPlaces = await this.searchAllNearbyPlaces(location, radius, type, 100);
      
      console.log(`📊 Total de lugares encontrados: ${allPlaces.length}`);

      if (requireContact) {
        // Filtrar apenas lugares com informações de contato
        const placesWithContact = this.filterPlacesWithContact(allPlaces);
        console.log(`✅ Lugares com contato: ${placesWithContact.length}`);
        
        // Limitar aos melhores resultados
        const limitedResults = placesWithContact.slice(0, maxResults);
        
        // Cache the filtered result
        console.log(`💾 Salvando no cache: ${limitedResults.length} lugares filtrados`);
        CacheService.set(cacheKey, limitedResults, this.CACHE_TTL);
        
        return limitedResults;
      } else {
        // Retornar todos, limitados pelo maxResults
        const limitedResults = allPlaces.slice(0, maxResults);
        console.log(`💾 Salvando no cache: ${limitedResults.length} lugares (sem filtro)`);
        CacheService.set(cacheKey, limitedResults, this.CACHE_TTL);
        return limitedResults;
      }
    } catch (error) {
      console.error('Erro na busca do Google Places:', error);
      // Retornar dados mock em caso de erro
      return this.getMockPlaces(location, type);
    }
  }

  private static async searchAllNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number,
    type?: string,
    maxTotal: number = 100
  ): Promise<GooglePlaceResult[]> {
    const allPlaces: GooglePlaceResult[] = [];
    let nextPageToken: string | undefined;
    let searchCount = 0;
    const maxSearches = 3; // Máximo 3 buscas (60 resultados por busca)

    do {
      searchCount++;
      console.log(`🔄 Busca ${searchCount}/${maxSearches}...`);
      
      const results = await GoogleMapsService.searchNearbyPlaces(
        location, 
        radius, 
        type,
        nextPageToken
      );
      
      if (results.places && results.places.length > 0) {
        // Os lugares já vêm com detalhes do GoogleMapsService
        allPlaces.push(...results.places);
        
        console.log(`📋 Adicionados ${results.places.length} lugares (total: ${allPlaces.length})`);
        
        nextPageToken = results.nextPageToken;
        
        // Parar se atingiu o máximo ou não há mais páginas
        if (allPlaces.length >= maxTotal || !nextPageToken) {
          break;
        }
        
        // Aguardar um pouco antes da próxima busca (requisito da API)
        if (nextPageToken) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        break;
      }
    } while (searchCount < maxSearches && nextPageToken);

    return allPlaces.slice(0, maxTotal);
  }

  private static async enrichPlacesWithDetails(
    places: any[]
  ): Promise<GooglePlaceResult[]> {
    const enrichedPlaces: GooglePlaceResult[] = [];
    
    // Processar em lotes para não sobrecarregar a API
    const batchSize = 10;
    for (let i = 0; i < places.length; i += batchSize) {
      const batch = places.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (place) => {
        try {
          // Verificar cache de detalhes primeiro
          const detailsCacheKey = CacheService.generateKey('place_details', { placeId: place.place_id });
          const cachedDetails = CacheService.get<GooglePlaceResult>(detailsCacheKey);
          
          if (cachedDetails) {
            return cachedDetails;
          }
          
          // Buscar detalhes completos
          const details = await GoogleMapsService.getPlaceDetails(place.place_id);
          
          if (details) {
            // Cache os detalhes
            CacheService.set(detailsCacheKey, details, this.DETAILS_CACHE_TTL);
            return details;
          }
          
          // Fallback para dados básicos
          return this.createBasicPlaceResult(place);
        } catch (error) {
          console.error(`Erro ao buscar detalhes para ${place.name}:`, error);
          return this.createBasicPlaceResult(place);
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      enrichedPlaces.push(...batchResults.filter(Boolean));
      
      // Pequena pausa entre lotes
      if (i + batchSize < places.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return enrichedPlaces;
  }

  private static createBasicPlaceResult(place: any): GooglePlaceResult {
    return {
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address || 'Endereço não disponível',
      geometry: {
        location: {
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
        },
      },
      types: place.types || [],
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      photos: place.photos?.map((photo: any) => ({
        photo_reference: photo.getUrl(),
        height: photo.height,
        width: photo.width,
      })),
      website: place.website,
      formatted_phone_number: place.formatted_phone_number,
      business_status: place.business_status,
    };
  }

  private static filterPlacesWithContact(places: GooglePlaceResult[]): GooglePlaceResult[] {
    return places.filter(place => {
      const hasPhone = this.hasValidContact(place.formatted_phone_number) || 
                     this.hasValidContact(place.international_phone_number);
      const hasWebsite = this.hasValidContact(place.website);
      const hasEmail = this.extractEmailFromReviews(place);
      
      // Log para debug
      if (hasPhone || hasWebsite || hasEmail) {
        console.log(`✅ ${place.name}:`, {
          phone: hasPhone ? '✓' : '✗',
          website: hasWebsite ? '✓' : '✗',
          email: hasEmail ? '✓' : '✗'
        });
      }
      
      return hasPhone || hasWebsite || hasEmail;
    });
  }

  private static hasValidContact(value?: string): boolean {
    if (!value || typeof value !== 'string') return false;
    
    const cleanValue = value.trim().toLowerCase();
    
    // Lista de valores inválidos
    const invalidValues = [
      '',
      'desconhecido',
      'não informado',
      'não disponível',
      'n/a',
      'na',
      'null',
      'undefined',
      'sem informação',
      'não possui',
      'indisponível'
    ];
    
    return !invalidValues.includes(cleanValue) && cleanValue.length > 3;
  }

  private static extractEmailFromReviews(place: GooglePlaceResult): boolean {
    if (!place.reviews || place.reviews.length === 0) return false;
    
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    
    for (const review of place.reviews) {
      if (review.text && emailRegex.test(review.text)) {
        return true;
      }
    }
    
    return false;
  }

  static async getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
    const cacheKey = CacheService.generateKey('place_details', { placeId });

    // Check cache first
    const cached = CacheService.get<GooglePlaceResult>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Verificar se o Google Maps está disponível
      if (!GoogleMapsService.isMapReady()) {
        console.warn('Google Maps não inicializado');
        return null;
      }

      // Make API call
      const place = await GoogleMapsService.getPlaceDetails(placeId);
      
      // Cache the result (even if null, to avoid repeated API calls for non-existent places)
      CacheService.set(cacheKey, place, this.DETAILS_CACHE_TTL);
      
      return place;
    } catch (error) {
      console.error('Erro ao obter detalhes do lugar:', error);
      return null;
    }
  }

  private static getMockPlaces(location: { lat: number; lng: number }, type?: string): GooglePlaceResult[] {
    // Dados mock com informações de contato variadas para testar
    const mockPlaces: GooglePlaceResult[] = [
      {
        place_id: 'mock_1',
        name: 'Restaurante com Contato Completo',
        formatted_address: 'Rua Exemplo, 123 - São Paulo, SP',
        geometry: {
          location: {
            lat: location.lat + 0.001,
            lng: location.lng + 0.001,
          },
        },
        types: ['restaurant', 'food'],
        rating: 4.2,
        user_ratings_total: 89,
        website: 'https://www.restaurante.com.br',
        formatted_phone_number: '(11) 1234-5678',
        business_status: 'OPERATIONAL',
      },
      {
        place_id: 'mock_2',
        name: 'Loja Apenas com Telefone',
        formatted_address: 'Av. Exemplo, 456 - São Paulo, SP',
        geometry: {
          location: {
            lat: location.lat - 0.001,
            lng: location.lng - 0.001,
          },
        },
        types: ['store', 'convenience_store'],
        rating: 3.8,
        user_ratings_total: 45,
        formatted_phone_number: '(11) 9876-5432',
        business_status: 'OPERATIONAL',
      },
      {
        place_id: 'mock_3',
        name: 'Café Apenas com Website',
        formatted_address: 'Rua Central, 789 - São Paulo, SP',
        geometry: {
          location: {
            lat: location.lat + 0.002,
            lng: location.lng - 0.002,
          },
        },
        types: ['cafe', 'food'],
        rating: 4.5,
        user_ratings_total: 67,
        website: 'https://www.cafe.com.br',
        business_status: 'OPERATIONAL',
      },
    ];

    // Filtrar por tipo se especificado
    if (type && type !== 'all') {
      return mockPlaces.filter(place => place.types.includes(type));
    }

    return mockPlaces;
  }

  static async autocomplete(
    input: string, 
    location?: { lat: number; lng: number }
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    const cacheKey = CacheService.generateKey('autocomplete', {
      input,
      lat: location?.lat,
      lng: location?.lng
    });

    // Check cache first
    const cached = CacheService.get<google.maps.places.AutocompletePrediction[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Verificar se o Google Maps está disponível
      if (!GoogleMapsService.isMapReady()) {
        console.warn('Google Maps não inicializado para autocomplete');
        return [];
      }

      // Make API call
      const predictions = await GoogleMapsService.autocomplete(input, location);
      
      // Cache the result
      CacheService.set(cacheKey, predictions, this.AUTOCOMPLETE_CACHE_TTL);
      
      return predictions;
    } catch (error) {
      console.error('Erro no autocomplete:', error);
      return [];
    }
  }

  // Method to clear all places-related cache
  static clearCache(): void {
    const keysToDelete: string[] = [];
    
    // This is a simple approach - in a real app you might want to use a more sophisticated
    // cache key management system
    for (const key of CacheService['cache'].keys()) {
      if (key.startsWith('nearby_places') || 
          key.startsWith('place_details:') || 
          key.startsWith('autocomplete:')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => CacheService.delete(key));
  }

  // Method to get cache statistics for places API
  static getCacheStats() {
    const stats = CacheService.getStats();
    const placesKeys = Array.from(CacheService['cache'].keys()).filter(key =>
      key.startsWith('nearby_places') || 
      key.startsWith('place_details:') || 
      key.startsWith('autocomplete:')
    );
    
    return {
      ...stats,
      placesKeys: placesKeys.length,
      detailsCache: placesKeys.filter(k => k.startsWith('place_details:')).length,
      nearbyCache: placesKeys.filter(k => k.startsWith('nearby_places')).length,
    };
  }

  // Método para obter estatísticas de filtragem
  static getFilterStats(places: GooglePlaceResult[]) {
    const total = places.length;
    const withPhone = places.filter(p => this.hasValidContact(p.formatted_phone_number) || this.hasValidContact(p.international_phone_number)).length;
    const withWebsite = places.filter(p => this.hasValidContact(p.website)).length;
    const withEmail = places.filter(p => this.extractEmailFromReviews(p)).length;
    const withAnyContact = places.filter(p => {
      const hasPhone = this.hasValidContact(p.formatted_phone_number) || this.hasValidContact(p.international_phone_number);
      const hasWebsite = this.hasValidContact(p.website);
      const hasEmail = this.extractEmailFromReviews(p);
      return hasPhone || hasWebsite || hasEmail;
    }).length;

    return {
      total,
      withPhone,
      withWebsite,
      withEmail,
      withAnyContact,
      filterEfficiency: total > 0 ? Math.round((withAnyContact / total) * 100) : 0
    };
  }
} 