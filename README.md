# ProLead Capture

Sistema de captação e gerenciamento de leads com integração Google Maps e Places API.

## 🚀 Funcionalidades

- **Mapa Interativo**: Visualização de leads em mapa com Google Maps
- **Captação de Leads**: Busca e adição de empresas via Google Places API
- **Filtros Avançados**: Filtros por tipo de negócio, indústria, status, rating e localização
- **Gestão de Leads**: Visualização detalhada, edição e exclusão de leads
- **Armazenamento Local**: Todos os dados salvos no localStorage para acesso rápido
- **Import/Export**: Funcionalidade para importar e exportar dados em JSON
- **Interface Moderna**: UI construída com shadcn/ui e Tailwind CSS

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Google Maps API** - Mapas e busca de lugares
- **Google Places API** - Informações de estabelecimentos
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Chave da API do Google Maps

## 🔧 Configuração

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd prolead-app
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure a API Key do Google Maps**
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_api_aqui
   ```

   Para obter uma chave da API:
   1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
   2. Crie um novo projeto ou selecione um existente
   3. Ative as APIs:
      - Maps JavaScript API
      - Places API
   4. Crie credenciais (API Key)
   5. Configure as restrições de domínio se necessário

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

## 🎯 Como Usar

### Captação de Leads

1. **Busca por Localização**: Use a barra de busca para encontrar empresas próximas
2. **Adicionar Lead**: Clique no botão "+" nos resultados da busca para adicionar à sua lista
3. **Clique no Mapa**: Clique em qualquer ponto do mapa para centralizar a busca naquela área

### Gestão de Leads

1. **Visualizar Leads**: Clique em qualquer lead na lista lateral ou no mapa
2. **Editar Informações**: Use o botão "Editar" para modificar dados do lead
3. **Atualizar Status**: Mude o status do lead (Novo, Contactado, Qualificado, Convertido, Perdido)
4. **Adicionar Anotações**: Use a aba "Anotações" para adicionar observações importantes

### Filtros e Busca

1. **Filtros Básicos**: Use a barra de busca para filtrar por nome, endereço ou tipo de negócio
2. **Filtros Avançados**: Clique em "Expandir" para acessar filtros por:
   - Tipo de negócio
   - Indústria
   - Status
   - Rating mínimo
3. **Limpar Filtros**: Use "Limpar todos" para remover todos os filtros ativos

### Import/Export

1. **Exportar Dados**: Clique em "Exportar" para baixar todos os leads em formato JSON
2. **Importar Dados**: Clique em "Importar" para carregar leads de um arquivo JSON

## 📊 Estrutura de Dados

Cada lead contém as seguintes informações:

```typescript
interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address: string;
  latitude: number;
  longitude: number;
  businessType?: string;
  industry?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  photos?: string[];
  placeId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  tags?: string[];
  contactPerson?: string;
  companySize?: string;
  revenue?: string;
  lastContact?: string;
}
```

## 🎨 Status dos Leads

- **Novo**: Lead recém-adicionado
- **Contactado**: Lead que já foi contatado
- **Qualificado**: Lead que demonstrou interesse
- **Convertido**: Lead que se tornou cliente
- **Perdido**: Lead que não demonstrou interesse

## 🔮 Próximas Funcionalidades

- [ ] Autenticação de usuários
- [ ] Sincronização com banco de dados
- [ ] Web scraping automático de sites das empresas
- [ ] Relatórios e analytics
- [ ] Integração com CRM
- [ ] Notificações e lembretes
- [ ] API REST para integração externa

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

---

Desenvolvido com ❤️ para facilitar a captação e gestão de leads.
