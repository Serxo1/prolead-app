'use client';

import { useState } from 'react';
import { LeadFilter } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Search, Filter, MapPin, Phone, Mail, Globe, User } from 'lucide-react';

interface LeadFiltersProps {
  filters: LeadFilter;
  onFiltersChange: (filters: LeadFilter) => void;
  onSearch: (query: string) => void;
  onAddressSearch: (address: string) => void;
  onRadiusChange?: (radius: number) => void;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  isSearching?: boolean;
}

const BUSINESS_TYPES = [
  'restaurant',
  'store',
  'office',
  'hospital',
  'school',
  'hotel',
  'gym',
  'salon',
  'pharmacy',
  'bank',
  'other'
];

const INDUSTRIES = [
  'technology',
  'healthcare',
  'finance',
  'education',
  'retail',
  'manufacturing',
  'real_estate',
  'food_beverage',
  'automotive',
  'entertainment',
  'other'
];

const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Qualificado' },
  { value: 'converted', label: 'Convertido' },
  { value: 'lost', label: 'Perdido' },
];

const RATING_OPTIONS = [
  { value: '4', label: '4+ estrelas' },
  { value: '3', label: '3+ estrelas' },
  { value: '2', label: '2+ estrelas' },
  { value: '1', label: '1+ estrela' },
];

const RADIUS_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 2500, label: '2.5 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' },
];

export default function LeadFilters({ 
  filters, 
  onFiltersChange, 
  onSearch,
  onAddressSearch,
  onRadiusChange,
  onCenterChange,
  isSearching = false
}: LeadFiltersProps) {
  const [addressQuery, setAddressQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof LeadFilter, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleAddressSearchClick = () => {
    console.log('📍 Buscando endereço:', addressQuery);
    if (addressQuery.trim()) {
      onAddressSearch(addressQuery.trim());
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
    setAddressQuery('');
    onSearch('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || addressQuery;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Expandir'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Address Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Digite um endereço para definir a região de busca..."
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSearchClick()}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleAddressSearchClick}
            disabled={!addressQuery.trim()}
            variant="outline"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Localizar
          </Button>
        </div>

        {/* Quick Search Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
            Tipo de negócio:
          </span>
          {BUSINESS_TYPES.slice(0, 6).map((type) => (
            <Button
              key={type}
              variant={filters.businessType === type ? "default" : "outline"}
              size="sm"
              onClick={() => {
                handleFilterChange('businessType', filters.businessType === type ? undefined : type);
                // Removido: busca automática
              }}
              className="text-xs"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Menos opções' : 'Mais opções'}
          </Button>
        </div>

        {/* Search Button */}
        <div className="flex justify-center mb-4">
          <Button 
            onClick={() => {
              // Buscar com o tipo selecionado ou 'all' para todos os tipos
              const searchType = filters.businessType || 'all';
              onSearch(searchType);
            }}
            size="lg"
            className="px-8"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Buscar Leads Próximos
                {filters.searchRadius && (
                  <span className="ml-2 text-xs opacity-75">
                    (raio: {RADIUS_OPTIONS.find(r => r.value === filters.searchRadius)?.label})
                  </span>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {addressQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Região: {addressQuery}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setAddressQuery('')}
                />
              </Badge>
            )}
            {filters.searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                Busca: {filters.searchQuery}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('searchQuery', undefined)}
                />
              </Badge>
            )}
            {filters.businessType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tipo: {filters.businessType}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('businessType', undefined)}
                />
              </Badge>
            )}
            {filters.industry && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Indústria: {filters.industry}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('industry', undefined)}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('status', undefined)}
                />
              </Badge>
            )}
            {filters.rating && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rating: {RATING_OPTIONS.find(r => r.value === filters.rating?.toString())?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('rating', undefined)}
                />
              </Badge>
            )}
            {filters.searchRadius && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Raio: {RADIUS_OPTIONS.find(r => r.value === filters.searchRadius)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('searchRadius', undefined)}
                />
              </Badge>
            )}
            {filters.hasPhone === true && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Com telefone
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('hasPhone', undefined)}
                />
              </Badge>
            )}
            {filters.hasPhone === false && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Sem telefone
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('hasPhone', undefined)}
                />
              </Badge>
            )}
            {filters.hasEmail === true && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Com email
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('hasEmail', undefined)}
                />
              </Badge>
            )}
            {filters.hasEmail === false && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Sem email
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('hasEmail', undefined)}
                />
              </Badge>
            )}
            {filters.hasWebsite === true && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Com website
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('hasWebsite', undefined)}
                />
              </Badge>
            )}
            {filters.hasWebsite === false && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Sem website
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('hasWebsite', undefined)}
                />
              </Badge>
            )}
            {filters.hasContactPerson === true && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Com contato
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('hasContactPerson', undefined)}
                />
              </Badge>
            )}
            {filters.hasContactPerson === false && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Sem contato
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('hasContactPerson', undefined)}
                />
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar todos
            </Button>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Business Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Negócio</label>
                <Select
                  value={filters.businessType || 'all'}
                  onValueChange={(value) => handleFilterChange('businessType', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Industry Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Indústria</label>
                <Select
                  value={filters.industry || 'all'}
                  onValueChange={(value) => handleFilterChange('industry', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a indústria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as indústrias</SelectItem>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry.replace('_', ' ').charAt(0).toUpperCase() + industry.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Rating Mínimo</label>
                <Select
                  value={filters.rating?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('rating', value === 'all' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer rating</SelectItem>
                    {RATING_OPTIONS.map((rating) => (
                      <SelectItem key={rating.value} value={rating.value}>
                        {rating.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Radius Filter */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Raio de Busca
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {RADIUS_OPTIONS.map((radius) => (
                  <Button
                    key={radius.value}
                    variant={filters.searchRadius === radius.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      handleFilterChange('searchRadius', radius.value);
                      onRadiusChange?.(radius.value);
                    }}
                    className="text-xs"
                  >
                    {radius.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Contact Filters */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">Meios de Contato</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Possui Contatos */}
                <div>
                  <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">POSSUI</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasPhone"
                        checked={filters.hasPhone === true}
                        onCheckedChange={(checked: boolean) => handleFilterChange('hasPhone', checked ? true : undefined)}
                      />
                      <label htmlFor="hasPhone" className="text-sm flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telefone
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasEmail"
                        checked={filters.hasEmail === true}
                        onCheckedChange={(checked: boolean) => handleFilterChange('hasEmail', checked ? true : undefined)}
                      />
                      <label htmlFor="hasEmail" className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasWebsite"
                        checked={filters.hasWebsite === true}
                        onCheckedChange={(checked: boolean) => handleFilterChange('hasWebsite', checked ? true : undefined)}
                      />
                      <label htmlFor="hasWebsite" className="text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasContactPerson"
                        checked={filters.hasContactPerson === true}
                        onCheckedChange={(checked: boolean) => handleFilterChange('hasContactPerson', checked ? true : undefined)}
                      />
                      <label htmlFor="hasContactPerson" className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Pessoa de contato
                      </label>
                    </div>
                  </div>
                </div>

                {/* Não Possui Contatos */}
                <div>
                  <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">NÃO POSSUI</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noPhone"
                        checked={filters.hasPhone === false}
                        onCheckedChange={(checked: boolean) => handleFilterChange('hasPhone', checked ? false : undefined)}
                      />
                      <label htmlFor="noPhone" className="text-sm flex items-center gap-2">
                        <Phone className="h-4 w-4 opacity-50" />
                        Telefone
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noEmail"
                        checked={filters.hasEmail === false}
                        onCheckedChange={(checked: boolean) => handleFilterChange('hasEmail', checked ? false : undefined)}
                      />
                      <label htmlFor="noEmail" className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4 opacity-50" />
                        Email
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noWebsite"
                        checked={filters.hasWebsite === false}
                        onCheckedChange={(checked: boolean) => handleFilterChange('hasWebsite', checked ? false : undefined)}
                      />
                      <label htmlFor="noWebsite" className="text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4 opacity-50" />
                        Website
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noContactPerson"
                        checked={filters.hasContactPerson === false}
                        onCheckedChange={(checked: boolean) => handleFilterChange('hasContactPerson', checked ? false : undefined)}
                      />
                      <label htmlFor="noContactPerson" className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4 opacity-50" />
                        Pessoa de contato
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 