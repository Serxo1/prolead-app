import { Loader } from '@googlemaps/js-api-loader';
import { GooglePlaceResult } from '@/types/lead';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export class GoogleMapsService {
  private static loader: Loader | null = null;
  private static map: google.maps.Map | null = null;
  private static placesService: google.maps.places.PlacesService | null = null;
  private static autocompleteService: google.maps.places.AutocompleteService | null = null;

  static async initialize(): Promise<void> {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is required');
    }

    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    });

    await this.loader.load();
  }

  static createMap(element: HTMLElement, center: { lat: number; lng: number }): google.maps.Map {
    if (!this.loader) {
      throw new Error('Google Maps not initialized. Call initialize() first.');
    }

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

    return this.map;
  }

  static getMap(): google.maps.Map | null {
    return this.map;
  }

  static async searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000,
    type?: string
  ): Promise<GooglePlaceResult[]> {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    if (!this.placesService) {
      this.placesService = new google.maps.places.PlacesService(this.map);
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: type as any,
      };

      this.placesService!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: GooglePlaceResult[] = results.map(place => ({
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
            opening_hours: place.opening_hours ? {
              open_now: place.opening_hours.open_now!,
            } : undefined,
          }));
          resolve(places);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  static async getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    if (!this.placesService) {
      this.placesService = new google.maps.places.PlacesService(this.map);
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
          'business_status',
          'opening_hours',
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
            opening_hours: place.opening_hours ? {
              open_now: place.opening_hours.open_now!,
            } : undefined,
          };
          resolve(placeResult);
        } else {
          resolve(null);
        }
      });
    });
  }

  static async autocomplete(input: string, location?: { lat: number; lng: number }): Promise<google.maps.places.AutocompletePrediction[]> {
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
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    return new google.maps.Marker({
      position: new google.maps.LatLng(position.lat, position.lng),
      map: this.map,
      title,
      icon,
    });
  }

  static clearMarkers(markers: google.maps.Marker[]): void {
    markers.forEach(marker => marker.setMap(null));
  }

  static setCenter(location: { lat: number; lng: number }): void {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    this.map.setCenter(new google.maps.LatLng(location.lat, location.lng));
  }

  static setZoom(zoom: number): void {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    this.map.setZoom(zoom);
  }
} 