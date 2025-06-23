'use client';

import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { LeadService } from '@/services/leadService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Star, 
  Phone, 
  Globe, 
  Building, 
  Mail, 
  Calendar, 
  Tag, 
  Edit, 
  Save, 
  X, 
  Trash2,
  User,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

interface LeadDetailsProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdate: (lead: Lead) => void;
  onLeadDelete: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'contacted', label: 'Contactado', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'qualified', label: 'Qualificado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'converted', label: 'Convertido', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  { value: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-800 border-red-200' },
];

const COMPANY_SIZES = [
  '1-10 funcionários',
  '11-50 funcionários',
  '51-200 funcionários',
  '201-1000 funcionários',
  '1000+ funcionários'
];

const REVENUE_RANGES = [
  'Menos de R$ 100k',
  'R$ 100k - R$ 500k',
  'R$ 500k - R$ 1M',
  'R$ 1M - R$ 5M',
  'R$ 5M - R$ 10M',
  'Mais de R$ 10M'
];

export default function LeadDetails({ lead, onClose, onLeadUpdate, onLeadDelete }: LeadDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setEditedLead(lead);
    }
  }, [lead]);

  if (!lead || !editedLead) {
    return null;
  }

  const handleSave = () => {
    if (editedLead) {
      const updatedLead = LeadService.updateLead(lead.id, editedLead);
      if (updatedLead) {
        onLeadUpdate(updatedLead);
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    setEditedLead(lead);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (LeadService.deleteLead(lead.id)) {
      onLeadDelete(lead.id);
      onClose();
    }
    setIsDeleteDialogOpen(false);
  };

  const handleFieldChange = (field: keyof Lead, value: unknown) => {
    setEditedLead(prev => prev ? { ...prev, [field]: value } : null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const isContactInfoAvailable = (value?: string) => {
    return value && value.trim() !== '' && !value.toLowerCase().includes('desconhecido') && !value.toLowerCase().includes('não informado');
  };

  const getContactStatus = () => {
    const hasEmail = isContactInfoAvailable(lead.email);
    const hasPhone = isContactInfoAvailable(lead.phone);
    const hasWebsite = isContactInfoAvailable(lead.website);
    const hasContactPerson = isContactInfoAvailable(lead.contactPerson);
    
    const availableCount = [hasEmail, hasPhone, hasWebsite, hasContactPerson].filter(Boolean).length;
    return { hasEmail, hasPhone, hasWebsite, hasContactPerson, availableCount };
  };

  const contactStatus = getContactStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{lead.name}</h2>
                <Badge className={`${STATUS_OPTIONS.find(s => s.value === lead.status)?.color} border`}>
                  {STATUS_OPTIONS.find(s => s.value === lead.status)?.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{lead.address}</span>
                </div>
                {lead.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{lead.rating}</span>
                    {lead.reviews && <span className="text-gray-500">({lead.reviews} avaliações)</span>}
                  </div>
                )}
              </div>

              {/* Contact Status Indicator */}
              <div className="flex items-center gap-2">
                {contactStatus.availableCount > 0 ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>{contactStatus.availableCount} forma{contactStatus.availableCount > 1 ? 's' : ''} de contato disponível{contactStatus.availableCount > 1 ? 'is' : ''}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Informações de contato limitadas</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              )}
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar exclusão</DialogTitle>
                  </DialogHeader>
                  <p>Tem certeza que deseja excluir o lead &quot;{lead.name}&quot;?</p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Excluir
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="notes">Anotações</TabsTrigger>
            </TabsList>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary Contact Information */}
                <Card className="border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Contato Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Pessoa de Contato</label>
                      {isEditing ? (
                        <Input
                          value={editedLead.contactPerson || ''}
                          onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                          placeholder="Nome da pessoa de contato"
                          className="w-full"
                        />
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className={isContactInfoAvailable(lead.contactPerson) ? 'text-gray-900' : 'text-gray-500 italic'}>
                              {isContactInfoAvailable(lead.contactPerson) ? lead.contactPerson : 'Não informado'}
                            </span>
                          </div>
                          {isContactInfoAvailable(lead.contactPerson) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(lead.contactPerson!, 'contactPerson')}
                              className="h-8 w-8 p-0"
                            >
                              {copiedField === 'contactPerson' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedLead.email || ''}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          placeholder="email@empresa.com"
                          className="w-full"
                        />
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Mail className={`h-4 w-4 ${isContactInfoAvailable(lead.email) ? 'text-blue-600' : 'text-gray-500'}`} />
                            {isContactInfoAvailable(lead.email) ? (
                              <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline font-medium">
                                {lead.email}
                              </a>
                            ) : (
                              <span className="text-gray-500 italic">Email não disponível</span>
                            )}
                          </div>
                          {isContactInfoAvailable(lead.email) && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(lead.email!, 'email')}
                                className="h-8 w-8 p-0"
                              >
                                {copiedField === 'email' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a href={`mailto:${lead.email}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Telefone</label>
                      {isEditing ? (
                        <Input
                          value={editedLead.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full"
                        />
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Phone className={`h-4 w-4 ${isContactInfoAvailable(lead.phone) ? 'text-green-600' : 'text-gray-500'}`} />
                            {isContactInfoAvailable(lead.phone) ? (
                              <a href={`tel:${lead.phone}`} className="text-green-600 hover:underline font-medium">
                                {lead.phone}
                              </a>
                            ) : (
                              <span className="text-gray-500 italic">Telefone não disponível</span>
                            )}
                          </div>
                          {isContactInfoAvailable(lead.phone) && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(lead.phone!, 'phone')}
                                className="h-8 w-8 p-0"
                              >
                                {copiedField === 'phone' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a href={`tel:${lead.phone}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Digital Presence */}
                <Card className="border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-purple-600" />
                      Presença Digital
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Website</label>
                      {isEditing ? (
                        <Input
                          value={editedLead.website || ''}
                          onChange={(e) => handleFieldChange('website', e.target.value)}
                          placeholder="https://www.empresa.com"
                          className="w-full"
                        />
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Globe className={`h-4 w-4 flex-shrink-0 ${isContactInfoAvailable(lead.website) ? 'text-purple-600' : 'text-gray-500'}`} />
                            {isContactInfoAvailable(lead.website) ? (
                              <a 
                                href={lead.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline font-medium truncate"
                              >
                                {lead.website}
                              </a>
                            ) : (
                              <span className="text-gray-500 italic">Website não disponível</span>
                            )}
                          </div>
                          {isContactInfoAvailable(lead.website) && (
                            <div className="flex gap-1 flex-shrink-0 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(lead.website!, 'website')}
                                className="h-8 w-8 p-0"
                              >
                                {copiedField === 'website' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a href={lead.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Contact Summary */}
                    <div className="pt-4 border-t">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Resumo de Contato</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`flex items-center gap-2 p-2 rounded ${contactStatus.hasEmail ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">Email</span>
                          {contactStatus.hasEmail ? (
                            <CheckCircle className="h-4 w-4 ml-auto" />
                          ) : (
                            <X className="h-4 w-4 ml-auto" />
                          )}
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${contactStatus.hasPhone ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">Telefone</span>
                          {contactStatus.hasPhone ? (
                            <CheckCircle className="h-4 w-4 ml-auto" />
                          ) : (
                            <X className="h-4 w-4 ml-auto" />
                          )}
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${contactStatus.hasWebsite ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                          <Globe className="h-4 w-4" />
                          <span className="text-sm">Website</span>
                          {contactStatus.hasWebsite ? (
                            <CheckCircle className="h-4 w-4 ml-auto" />
                          ) : (
                            <X className="h-4 w-4 ml-auto" />
                          )}
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${contactStatus.hasContactPerson ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                          <User className="h-4 w-4" />
                          <span className="text-sm">Contato</span>
                          {contactStatus.hasContactPerson ? (
                            <CheckCircle className="h-4 w-4 ml-auto" />
                          ) : (
                            <X className="h-4 w-4 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      Informações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Nome da Empresa</label>
                      {isEditing ? (
                        <Input
                          value={editedLead.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{lead.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Endereço</label>
                      {isEditing ? (
                        <Input
                          value={editedLead.address}
                          onChange={(e) => handleFieldChange('address', e.target.value)}
                        />
                      ) : (
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{lead.address}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de Negócio</label>
                      {isEditing ? (
                        <Input
                          value={editedLead.businessType || ''}
                          onChange={(e) => handleFieldChange('businessType', e.target.value)}
                          placeholder="Ex: Restaurante, Loja, Escritório"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building className="h-4 w-4" />
                          <span>{lead.businessType || 'Não informado'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Indústria</label>
                      {isEditing ? (
                        <Input
                          value={editedLead.industry || ''}
                          onChange={(e) => handleFieldChange('industry', e.target.value)}
                          placeholder="Ex: Tecnologia, Saúde, Varejo"
                        />
                      ) : (
                        <span className="text-gray-700">{lead.industry || 'Não informado'}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                      {isEditing ? (
                        <Select
                          value={editedLead.status}
                          onValueChange={(value) => handleFieldChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={`${STATUS_OPTIONS.find(s => s.value === lead.status)?.color} border`}>
                          {STATUS_OPTIONS.find(s => s.value === lead.status)?.label}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Business Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Informações do Negócio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Tamanho da Empresa</label>
                      {isEditing ? (
                        <Select
                          value={editedLead.companySize || ''}
                          onValueChange={(value) => handleFieldChange('companySize', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPANY_SIZES.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="h-4 w-4" />
                          <span>{lead.companySize || 'Não informado'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Receita Anual</label>
                      {isEditing ? (
                        <Select
                          value={editedLead.revenue || ''}
                          onValueChange={(value) => handleFieldChange('revenue', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a receita" />
                          </SelectTrigger>
                          <SelectContent>
                            {REVENUE_RANGES.map((revenue) => (
                              <SelectItem key={revenue} value={revenue}>
                                {revenue}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="h-4 w-4" />
                          <span>{lead.revenue || 'Não informado'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Data de Criação</label>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(lead.createdAt)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Última Atualização</label>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(lead.updatedAt)}</span>
                      </div>
                    </div>

                    {lead.lastContact && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Último Contato</label>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(lead.lastContact)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5 text-orange-600" />
                    Anotações e Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Anotações</label>
                    {isEditing ? (
                      <Textarea
                        value={editedLead.notes || ''}
                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                        placeholder="Adicione suas anotações sobre este lead..."
                        rows={6}
                        className="w-full"
                      />
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg min-h-[120px]">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {lead.notes || 'Nenhuma anotação adicionada'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
                    {isEditing ? (
                      <Input
                        value={editedLead.tags?.join(', ') || ''}
                        onChange={(e) => handleFieldChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                        placeholder="tag1, tag2, tag3"
                        className="w-full"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {lead.tags && lead.tags.length > 0 ? (
                          lead.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 italic">Nenhuma tag adicionada</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 