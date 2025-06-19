import { GoogleMapsService } from './googleMapsService';
import { CacheService } from './cacheService';
import { GooglePlaceResult } from '@/types/lead';

export class PlacesApiService {
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes for places data
  private static readonly AUTOCOMPLETE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for autocomplete

  static async searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000,
    type?: string
  ): Promise<GooglePlaceResult[]> {
    const cacheKey = CacheService.generateKey('nearby_places', {
      lat: location.lat,
      lng: location.lng,
      radius,
      type: type || 'all'
    });

    // Check cache first
    const cached = CacheService.get<GooglePlaceResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API call
    const places = await GoogleMapsService.searchNearbyPlaces(location, radius, type);
    
    // Cache the result
    CacheService.set(cacheKey, places, this.CACHE_TTL);
    
    return places;
  }

  static async getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
    const cacheKey = CacheService.generateKey('place_details', { placeId });

    // Check cache first
    const cached = CacheService.get<GooglePlaceResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API call
    const place = await GoogleMapsService.getPlaceDetails(placeId);
    
    // Cache the result (even if null, to avoid repeated API calls for non-existent places)
    CacheService.set(cacheKey, place, this.CACHE_TTL);
    
    return place;
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

    // Make API call
    const predictions = await GoogleMapsService.autocomplete(input, location);
    
    // Cache the result
    CacheService.set(cacheKey, predictions, this.AUTOCOMPLETE_CACHE_TTL);
    
    return predictions;
  }

  // Method to clear all places-related cache
  static clearCache(): void {
    const keysToDelete: string[] = [];
    
    // This is a simple approach - in a real app you might want to use a more sophisticated
    // cache key management system
    for (const key of CacheService['cache'].keys()) {
      if (key.startsWith('nearby_places:') || 
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
      key.startsWith('nearby_places:') || 
      key.startsWith('place_details:') || 
      key.startsWith('autocomplete:')
    );
    
    return {
      ...stats,
      placesKeys: placesKeys.length,
    };
  }
} 