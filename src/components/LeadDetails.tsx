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
  Users
} from 'lucide-react';

interface LeadDetailsProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdate: (lead: Lead) => void;
  onLeadDelete: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contactado', color: 'bg-amber-100 text-amber-800' },
  { value: 'qualified', label: 'Qualificado', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'converted', label: 'Convertido', color: 'bg-violet-100 text-violet-800' },
  { value: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-800' },
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

  const handleFieldChange = (field: keyof Lead, value: any) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{lead.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={STATUS_OPTIONS.find(s => s.value === lead.status)?.color}>
                  {STATUS_OPTIONS.find(s => s.value === lead.status)?.label}
                </Badge>
                {lead.rating && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{lead.rating}</span>
                    {lead.reviews && <span>({lead.reviews})</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} size="sm">
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
                  <p>Tem certeza que deseja excluir o lead "{lead.name}"?</p>
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
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="notes">Anotações</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome da Empresa</label>
                      {isEditing ? (
                        <Input
                          value={editedLead.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-700">{lead.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium">Endereço</label>
                      {isEditing ? (
                        <Input
                          value={editedLead.address}
                          onChange={(e) => handleFieldChange('address', e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-4 w-4" />
                          <span>{lead.address}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tipo de Negócio</label>
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
                      <label className="text-sm font-medium">Indústria</label>
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
                      <label className="text-sm font-medium">Status</label>
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
                        <Badge className={STATUS_OPTIONS.find(s => s.value === lead.status)?.color}>
                          {STATUS_OPTIONS.find(s => s.value === lead.status)?.label}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Business Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações do Negócio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tamanho da Empresa</label>
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
                      <label className="text-sm font-medium">Receita Anual</label>
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
                      <label className="text-sm font-medium">Data de Criação</label>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(lead.createdAt)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Última Atualização</label>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(lead.updatedAt)}</span>
                      </div>
                    </div>

                    {lead.lastContact && (
                      <div>
                        <label className="text-sm font-medium">Último Contato</label>
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

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Pessoa de Contato</label>
                    {isEditing ? (
                      <Input
                        value={editedLead.contactPerson || ''}
                        onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                        placeholder="Nome da pessoa de contato"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-4 w-4" />
                        <span>{lead.contactPerson || 'Não informado'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedLead.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        placeholder="email@empresa.com"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4" />
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                            {lead.email}
                          </a>
                        ) : (
                          <span>Não informado</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Telefone</label>
                    {isEditing ? (
                      <Input
                        value={editedLead.phone || ''}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4" />
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                            {lead.phone}
                          </a>
                        ) : (
                          <span>Não informado</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Website</label>
                    {isEditing ? (
                      <Input
                        value={editedLead.website || ''}
                        onChange={(e) => handleFieldChange('website', e.target.value)}
                        placeholder="https://www.empresa.com"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="h-4 w-4" />
                        {lead.website ? (
                          <a 
                            href={lead.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {lead.website}
                          </a>
                        ) : (
                          <span>Não informado</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Anotações e Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Anotações</label>
                    {isEditing ? (
                      <Textarea
                        value={editedLead.notes || ''}
                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                        placeholder="Adicione suas anotações sobre este lead..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {lead.notes || 'Nenhuma anotação adicionada'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    {isEditing ? (
                      <Input
                        value={editedLead.tags?.join(', ') || ''}
                        onChange={(e) => handleFieldChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                        placeholder="tag1, tag2, tag3"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {lead.tags && lead.tags.length > 0 ? (
                          lead.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500">Nenhuma tag adicionada</span>
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