import { useCachedApi } from '@/hooks/useCachedApi';
import { PlacesApiService } from '@/services/placesApiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, MapPin } from 'lucide-react';

interface ExampleCachedComponentProps {
  location: { lat: number; lng: number };
}

export default function ExampleCachedComponent({ location }: ExampleCachedComponentProps) {
  const {
    data: places,
    loading,
    error,
    refetch,
    clearCache,
  } = useCachedApi(
    () => PlacesApiService.searchNearbyPlaces(location, 5000),
    {
      cacheKey: `example_places_${location.lat}_${location.lng}`,
      ttl: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        console.log(`Loaded ${data.length} places from cache or API`);
      },
      onError: (err) => {
        console.error('Failed to load places:', err);
      },
    }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Nearby Places (Cached)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCache}
            >
              Clear Cache
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading places...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">Error loading places</p>
            <p className="text-sm text-gray-600">{error.message}</p>
          </div>
        )}
        
        {places && !loading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">
                {places.length} places found
              </Badge>
              <span className="text-xs text-gray-500">
                (Data may be from cache)
              </span>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {places.slice(0, 10).map((place) => (
                <div
                  key={place.place_id}
                  className="p-2 border rounded text-sm"
                >
                  <div className="font-medium">{place.name}</div>
                  <div className="text-gray-600 text-xs">
                    {place.formatted_address}
                  </div>
                  {place.rating && (
                    <div className="text-xs text-gray-500">
                      ⭐ {place.rating} ({place.user_ratings_total} reviews)
                    </div>
                  )}
                </div>
              ))}
              
              {places.length > 10 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  ... and {places.length - 10} more places
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 