# Filtros Disponíveis - ProLead App

## 📍 Filtros de Localização

### Raio de Busca
- **Funcionalidade**: Define um raio circular no mapa para filtrar leads por proximidade
- **Opções**: 1km, 2.5km, 5km, 10km, 25km, 50km
- **Visualização**: Círculo azul no mapa com borda e preenchimento transparente
- **Comportamento**: 
  - Clica no mapa para definir o centro
  - Seleciona o raio nos filtros
  - Mostra apenas leads dentro do círculo
  - O mapa se ajusta automaticamente para mostrar o círculo

## 🏢 Filtros de Negócio

### Tipo de Negócio
- **Opções**: restaurant, store, office, hospital, school, hotel, gym, salon, pharmacy, bank, other
- **Funcionalidade**: Filtra leads por categoria de negócio

### Indústria
- **Opções**: technology, healthcare, finance, education, retail, manufacturing, real_estate, food_beverage, automotive, entertainment, other
- **Funcionalidade**: Filtra leads por setor industrial

## 📊 Filtros de Avaliação

### Rating Mínimo
- **Opções**: 1+, 2+, 3+, 4+ estrelas
- **Funcionalidade**: Mostra apenas leads com rating igual ou superior ao selecionado

## 📈 Filtros de Status

### Status do Lead
- **Opções**: 
  - **Novo**: Leads recém-adicionados
  - **Contactado**: Leads que foram contatados
  - **Qualificado**: Leads qualificados para prospecção
  - **Convertido**: Leads que viraram clientes
  - **Perdido**: Leads que não avançaram

## 📞 Filtros de Contato

### Meios de Contato Disponíveis
- **Possui Telefone**: Mostra apenas leads com número de telefone
- **Possui Email**: Mostra apenas leads com endereço de email
- **Possui Website**: Mostra apenas leads com site
- **Possui Contato**: Mostra apenas leads com pessoa de contato definida

## 🔍 Busca por Texto

### Busca Geral
- **Funcionalidade**: Busca por nome, endereço, tipo de negócio ou indústria
- **Comportamento**: Busca case-insensitive em tempo real

## 🏷️ Filtros Avançados

### Tags
- **Funcionalidade**: Filtra leads por tags personalizadas
- **Uso**: Útil para categorização personalizada

## 🎯 Como Usar os Filtros

### 1. Filtro de Raio
```
1. Clique no mapa para definir o centro
2. Expanda os filtros
3. Selecione o raio desejado (ex: 5km)
4. O círculo aparecerá no mapa
5. Apenas leads dentro do círculo serão mostrados
```

### 2. Filtros de Contato
```
1. Expanda os filtros
2. Marque as caixas dos meios de contato desejados
3. Exemplo: Marcar "Possui telefone" e "Possui email"
4. Apenas leads com ambos os contatos serão mostrados
```

### 3. Combinação de Filtros
```
- Todos os filtros funcionam em conjunto
- Exemplo: Leads com telefone + rating 4+ + raio 5km
- Use "Limpar todos" para resetar todos os filtros
```

## 📱 Interface dos Filtros

### Badges Ativos
- Mostram filtros ativos no topo
- Clique no X para remover filtro individual
- Ícones específicos para cada tipo de filtro

### Layout Responsivo
- **Desktop**: Filtros em grid de 4 colunas
- **Tablet**: Filtros em grid de 2 colunas  
- **Mobile**: Filtros empilhados

### Estados Visuais
- **Botões de raio**: Azul quando ativo, outline quando inativo
- **Checkboxes**: Marcados quando filtro ativo
- **Badges**: Cores diferentes para cada categoria

## 🔧 Funcionalidades Técnicas

### Cache de Filtros
- Filtros são mantidos durante a sessão
- Cache automático de resultados de busca
- Performance otimizada para grandes volumes

### Filtros Persistidos
- Filtros são salvos no estado do componente
- Mantidos durante navegação na aplicação
- Resetados apenas manualmente

### Validação
- Filtros são validados antes da aplicação
- Tratamento de erros para filtros inválidos
- Feedback visual para filtros ativos

## 📈 Benefícios dos Filtros

### Para Vendas
- **Segmentação precisa**: Encontre leads específicos
- **Qualificação**: Foque em leads com contatos
- **Proximidade**: Trabalhe por região

### Para Marketing
- **Segmentação geográfica**: Campanhas locais
- **Segmentação por setor**: Campanhas específicas
- **Qualificação**: Leads com dados completos

### Para Gestão
- **Visão geral**: Status dos leads
- **Priorização**: Rating e contatos
- **Organização**: Tags e categorias

## 🚀 Próximas Funcionalidades

### Filtros Planejados
- **Filtro por data**: Leads criados em período específico
- **Filtro por valor**: Leads por valor estimado
- **Filtro por fonte**: Como o lead foi encontrado
- **Filtro por atividade**: Último contato realizado

### Melhorias Visuais
- **Gráficos**: Distribuição dos filtros
- **Heatmap**: Densidade de leads por região
- **Timeline**: Evolução dos leads no tempo 