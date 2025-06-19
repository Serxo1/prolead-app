import { useState, useEffect } from 'react';
import { CacheService } from '@/services/cacheService';
import { PlacesApiService } from '@/services/placesApiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, Database } from 'lucide-react';

export default function CacheStats() {
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    expired: 0,
    placesKeys: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const updateStats = () => {
    const generalStats = CacheService.getStats();
    const placesStats = PlacesApiService.getCacheStats();
    
    setStats({
      total: typeof generalStats.total === 'number' ? generalStats.total : 0,
      valid: typeof generalStats.valid === 'number' ? generalStats.valid : 0,
      expired: typeof generalStats.expired === 'number' ? generalStats.expired : 0,
      placesKeys: typeof placesStats.placesKeys === 'number' ? placesStats.placesKeys : 0,
    });
  };

  useEffect(() => {
    updateStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const clearAllCache = () => {
    CacheService.clear();
    updateStats();
  };

  const clearPlacesCache = () => {
    PlacesApiService.clearCache();
    updateStats();
  };

  const getCacheEfficiency = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.valid / stats.total) * 100);
  };

  const getMemoryUsage = () => {
    // Estimate memory usage (rough calculation)
    const estimatedBytesPerItem = 1024; // 1KB per cached item
    const totalBytes = stats.total * estimatedBytesPerItem;
    const totalKB = Math.round(totalBytes / 1024);
    
    if (totalKB < 1024) {
      return `${totalKB} KB`;
    } else {
      return `${(totalKB / 1024).toFixed(1)} MB`;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Cache Statistics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={updateStats}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {stats.valid} valid
            </Badge>
            <Badge variant="outline" className="text-xs">
              {stats.expired} expired
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getCacheEfficiency()}% efficiency
            </Badge>
          </div>
          
          <div className="text-xs text-gray-500">
            ~{getMemoryUsage()}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total cached items</div>
                <div className="font-medium">{stats.total}</div>
              </div>
              <div>
                <div className="text-gray-600">Places API cache</div>
                <div className="font-medium">{stats.placesKeys}</div>
              </div>
              <div>
                <div className="text-gray-600">Cache efficiency</div>
                <div className="font-medium">{getCacheEfficiency()}%</div>
              </div>
              <div>
                <div className="text-gray-600">Estimated memory</div>
                <div className="font-medium">{getMemoryUsage()}</div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearPlacesCache}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear Places Cache
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllCache}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All Cache
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 