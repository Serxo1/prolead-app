# 🎯 Demonstração do ProLead Capture

## 🚀 Início Rápido

1. **Configure a API do Google Maps**
   ```bash
   npm run setup
   # Edite o arquivo .env.local com sua API key
   ```

2. **Execute a aplicação**
   ```bash
   npm run dev
   ```

3. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

## 🎬 Demonstração das Funcionalidades

### 1. Visualização Inicial
- **Mapa**: Centralizado em São Paulo com 5 leads de exemplo
- **Estatísticas**: Cards mostrando total de leads por status
- **Lista Lateral**: Primeiros 5 leads com informações básicas

### 2. Captação de Leads
1. **Busca por Localização**
   - Digite "restaurantes" na barra de busca
   - Clique em "Buscar"
   - Veja os resultados na sidebar

2. **Adicionar Lead**
   - Clique no botão "+" em qualquer resultado
   - O lead será adicionado automaticamente
   - Aparecerá no mapa e na lista

3. **Busca por Clique no Mapa**
   - Clique em qualquer ponto do mapa
   - A busca será centralizada naquela área
   - Use a barra de busca para encontrar estabelecimentos

### 3. Gestão de Leads
1. **Visualizar Detalhes**
   - Clique em qualquer lead no mapa ou lista
   - Modal com informações completas
   - Abas: Informações, Contato, Anotações

2. **Editar Lead**
   - Clique em "Editar" no modal de detalhes
   - Modifique qualquer campo
   - Clique em "Salvar"

3. **Atualizar Status**
   - Mude o status do lead (Novo → Contactado → Qualificado → Convertido)
   - Cada status tem uma cor diferente no mapa

### 4. Filtros e Busca
1. **Busca Básica**
   - Digite na barra de busca
   - Filtra por nome, endereço, tipo de negócio

2. **Filtros Avançados**
   - Clique em "Expandir" nos filtros
   - Filtre por:
     - Tipo de negócio (restaurante, loja, etc.)
     - Indústria (tecnologia, saúde, etc.)
     - Status (novo, contactado, etc.)
     - Rating mínimo

3. **Limpar Filtros**
   - Clique em "Limpar todos"
   - Remove todos os filtros ativos

### 5. Import/Export
1. **Exportar Dados**
   - Clique em "Exportar"
   - Baixa arquivo JSON com todos os leads

2. **Importar Dados**
   - Clique em "Importar"
   - Selecione arquivo JSON
   - Dados são carregados automaticamente

## 🎨 Interface e UX

### Cores dos Status
- **Azul**: Novos leads
- **Âmbar**: Leads contactados
- **Verde**: Leads qualificados
- **Violeta**: Leads convertidos
- **Vermelho**: Leads perdidos

### Responsividade
- **Desktop**: Layout completo com mapa e sidebar
- **Mobile**: Layout adaptativo com navegação otimizada

### Interatividade
- **Hover**: Efeitos visuais nos elementos
- **Loading**: Indicadores de carregamento
- **Feedback**: Mensagens de sucesso/erro

## 📊 Dados de Exemplo

A aplicação vem com 5 leads de exemplo:

1. **Restaurante Italiano Bella Vista** - Contactado
2. **Tech Solutions Ltda** - Qualificado
3. **Academia FitLife** - Novo
4. **Loja de Roupas Fashion Store** - Convertido
5. **Consultório Dr. Silva** - Perdido

## 🔧 Funcionalidades Técnicas

### Armazenamento
- **localStorage**: Todos os dados salvos localmente
- **Persistência**: Dados mantidos entre sessões
- **Backup**: Export/Import para backup

### APIs Integradas
- **Google Maps**: Visualização de mapas
- **Google Places**: Busca de estabelecimentos
- **Geocoding**: Conversão de endereços

### Performance
- **Lazy Loading**: Componentes carregados sob demanda
- **Debounce**: Busca otimizada
- **Cache**: Dados em memória para acesso rápido

## 🎯 Casos de Uso

### Para Vendedores
- Captar leads em uma área específica
- Gerenciar pipeline de vendas
- Acompanhar status dos prospects

### Para Marketing
- Identificar potenciais clientes
- Analisar concorrência
- Planejar campanhas geográficas

### Para Gestores
- Visualizar distribuição de leads
- Acompanhar performance da equipe
- Gerar relatórios de conversão

## 🚀 Próximos Passos

1. **Configure sua API key** do Google Maps
2. **Teste as funcionalidades** com os dados de exemplo
3. **Personalize** conforme suas necessidades
4. **Adicione mais leads** usando a busca
5. **Exporte seus dados** quando necessário

---

**ProLead Capture** - Transformando a captação de leads em uma experiência visual e eficiente! 🎯 