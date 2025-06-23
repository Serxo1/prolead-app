import { Loader } from '@googlemaps/js-api-loader';
import { GooglePlaceResult } from '@/types/lead';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export class GoogleMapsService {
  private static loader: Loader | null = null;
  private static map: google.maps.Map | null = null;
  private static placesService: google.maps.places.PlacesService | null = null;
  private static autocompleteService: google.maps.places.AutocompleteService | null = null;
  private static isInitialized = false;
  private static initializationPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    // Se já está inicializado, retorna
    if (this.isInitialized) {
      return;
    }

    // Se há uma inicialização em andamento, espera ela terminar
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Inicia a inicialização
    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private static async doInitialize(): Promise<void> {
    try {
      if (!GOOGLE_MAPS_API_KEY) {
        console.warn('Google Maps API key não encontrada');
        return;
      }

      this.loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places'],
      });

      await this.loader.load();
      this.isInitialized = true;
      console.log('Google Maps inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Google Maps:', error);
      // Não lança o erro para não quebrar a aplicação
    }
  }

  static createMap(element: HTMLElement, center: { lat: number; lng: number }): google.maps.Map {
    if (!this.isInitialized) {
      throw new Error('Google Maps não foi inicializado corretamente.');
    }

    try {
      this.map = new google.maps.Map(element, {
        center,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      console.log('Mapa criado com sucesso');
      return this.map;
    } catch (error) {
      console.error('Erro ao criar mapa:', error);
      throw error;
    }
  }

  static getMap(): google.maps.Map | null {
    return this.map;
  }

  static isMapReady(): boolean {
    return this.isInitialized && this.map !== null;
  }

  static async searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000,
    type?: string,
    pageToken?: string
  ): Promise<{ places: GooglePlaceResult[]; nextPageToken?: string }> {
    if (!this.isMapReady()) {
      throw new Error('Mapa não está pronto para uso');
    }

    if (!this.placesService) {
      this.placesService = new google.maps.places.PlacesService(this.map!);
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: type as string,
        ...(pageToken && { pageToken }),
      };

      this.placesService!.nearbySearch(request, async (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          console.log(`🔍 Encontrados ${results.length} lugares na busca inicial`);
          
          // Filtrar lugares válidos
          const validPlaces = results.filter(place => place.place_id && place.name && place.geometry?.location);
          
          // Buscar detalhes completos para cada lugar (limitando a 10 para evitar muitas requisições)
          const placesWithDetails: GooglePlaceResult[] = [];
          const maxPlaces = Math.min(validPlaces.length, 20); // Aumentei para 20
          
          console.log(`📋 Buscando detalhes para ${maxPlaces} lugares...`);
          
          for (let i = 0; i < maxPlaces; i++) {
            const place = validPlaces[i];
            try {
              // Buscar detalhes completos do lugar
              const detailedPlace = await this.getPlaceDetails(place.place_id!);
              if (detailedPlace) {
                placesWithDetails.push(detailedPlace);
              } else {
                // Fallback para dados básicos se não conseguir detalhes
                placesWithDetails.push({
                  place_id: place.place_id!,
                  name: place.name!,
                  formatted_address: place.formatted_address || 'Endereço não disponível',
                  geometry: {
                    location: {
                      lat: place.geometry!.location!.lat(),
                      lng: place.geometry!.location!.lng(),
                    },
                  },
                  types: place.types || [],
                  rating: place.rating,
                  user_ratings_total: place.user_ratings_total,
                  photos: place.photos?.map(photo => ({
                    photo_reference: photo.getUrl(),
                    height: photo.height,
                    width: photo.width,
                  })),
                  website: place.website,
                  formatted_phone_number: place.formatted_phone_number,
                  business_status: place.business_status,
                });
              }
            } catch (error) {
              console.error(`Erro ao buscar detalhes para ${place.name}:`, error);
              // Continuar com os dados básicos
              placesWithDetails.push({
                place_id: place.place_id!,
                name: place.name!,
                formatted_address: place.formatted_address || 'Endereço não disponível',
                geometry: {
                  location: {
                    lat: place.geometry!.location!.lat(),
                    lng: place.geometry!.location!.lng(),
                  },
                },
                types: place.types || [],
                rating: place.rating,
                user_ratings_total: place.user_ratings_total,
                photos: place.photos?.map(photo => ({
                  photo_reference: photo.getUrl(),
                  height: photo.height,
                  width: photo.width,
                })),
                website: place.website,
                formatted_phone_number: place.formatted_phone_number,
                business_status: place.business_status,
              });
            }
          }
          
          console.log(`✅ Detalhes completos obtidos para ${placesWithDetails.length} lugares`);
          
          // Retornar com informações de paginação
          resolve({
            places: placesWithDetails,
            nextPageToken: pagination?.hasNextPage ? 'has_next_page' : undefined
          });
        } else {
          console.error('Erro na busca do Google Places:', status);
          reject(new Error(`Erro no Google Places API: ${status}`));
        }
      });
    });
  }

  static async getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
    if (!this.isMapReady()) {
      throw new Error('Mapa não está pronto para uso');
    }

    if (!this.placesService) {
      this.placesService = new google.maps.places.PlacesService(this.map!);
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'types',
          'rating',
          'user_ratings_total',
          'photos',
          'website',
          'formatted_phone_number',
          'international_phone_number',
          'business_status',
          'opening_hours',
          'price_level',
          'vicinity',
          'url',
          'utc_offset_minutes',
          'adr_address',
          'formatted_address',
          'icon',
          'icon_background_color',
          'icon_mask_base_uri',
          'plus_code',
          'reviews',
          'secondary_opening_hours',
          'editorial_summary',
          'curbside_pickup',
          'delivery',
          'dine_in',
          'reservable',
          'serves_beer',
          'serves_breakfast',
          'serves_brunch',
          'serves_dinner',
          'serves_lunch',
          'serves_vegetarian_food',
          'serves_wine',
          'takeout',
          'wheelchair_accessible_entrance'
        ],
      };

      this.placesService!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const placeResult: GooglePlaceResult = {
            place_id: place.place_id!,
            name: place.name!,
            formatted_address: place.formatted_address!,
            geometry: {
              location: {
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng(),
              },
            },
            types: place.types || [],
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            photos: place.photos?.map(photo => ({
              photo_reference: photo.getUrl(),
              height: photo.height,
              width: photo.width,
            })),
            website: place.website,
            formatted_phone_number: place.formatted_phone_number,
            business_status: place.business_status,
            // Campos adicionais que podem conter informações de contato
            international_phone_number: (place as any).international_phone_number,
            opening_hours: place.opening_hours,
            price_level: place.price_level,
            vicinity: (place as any).vicinity,
            url: (place as any).url,
            reviews: place.reviews,
            editorial_summary: (place as any).editorial_summary,
          };
          
          console.log(`📋 Detalhes obtidos para ${place.name}:`, {
            hasWebsite: !!place.website,
            hasPhone: !!place.formatted_phone_number,
            hasInternationalPhone: !!(place as any).international_phone_number,
            hasReviews: !!(place.reviews && place.reviews.length > 0),
            businessStatus: place.business_status
          });
          
          resolve(placeResult);
        } else {
          console.error('Erro ao obter detalhes do lugar:', status);
          resolve(null);
        }
      });
    });
  }

  static async autocomplete(input: string, location?: { lat: number; lng: number }): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.isInitialized) {
      throw new Error('Google Maps não foi inicializado');
    }

    if (!this.autocompleteService) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.AutocompletionRequest = {
        input,
        ...(location && {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 50000,
        }),
      };

      this.autocompleteService!.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          console.error('Erro no autocomplete:', status);
          resolve([]);
        }
      });
    });
  }

  static addMarker(
    position: { lat: number; lng: number },
    title?: string,
    icon?: string
  ): google.maps.Marker {
    if (!this.isMapReady()) {
      throw new Error('Mapa não está pronto para uso');
    }

    return new google.maps.Marker({
      position,
      map: this.map!,
      title,
      icon,
    });
  }

  static clearMarkers(markers: google.maps.Marker[]): void {
    markers.forEach(marker => marker.setMap(null));
  }

  static setCenter(location: { lat: number; lng: number }): void {
    if (!this.isMapReady()) {
      throw new Error('Mapa não está pronto para uso');
    }

    this.map!.setCenter(location);
  }

  static setZoom(zoom: number): void {
    if (!this.isMapReady()) {
      throw new Error('Mapa não está pronto para uso');
    }

    this.map!.setZoom(zoom);
  }
} 