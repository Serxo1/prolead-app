# Configuração do Google Maps - ProLead App

## 🗺️ Problema: Mapa não carrega

Se o mapa está aparecendo em branco, provavelmente é porque a **API key do Google Maps não está configurada**.

## 🔑 Como obter a API Key do Google Maps

### 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Faça login com sua conta Google

### 2. Crie um novo projeto (ou use um existente)
- Clique no seletor de projeto no topo
- Clique em "Novo Projeto"
- Dê um nome ao projeto (ex: "prolead-app")
- Clique em "Criar"

### 3. Ative as APIs necessárias
- No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
- Procure e ative as seguintes APIs:
  - **Maps JavaScript API**
  - **Places API**
  - **Geocoding API**

### 4. Crie as credenciais
- Vá em "APIs e Serviços" > "Credenciais"
- Clique em "Criar Credenciais" > "Chave de API"
- Copie a chave gerada

### 5. Configure as restrições (recomendado)
- Clique na chave criada
- Em "Restrições de aplicativo", selecione "Sites da Web"
- Adicione: `http://localhost:3000/*` (desenvolvimento)
- Adicione seu domínio de produção quando necessário
- Clique em "Salvar"

## ⚙️ Configurando no Projeto

### 1. Crie o arquivo de ambiente
Na raiz do projeto, crie um arquivo chamado `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

### 2. Substitua a chave
Substitua `sua_chave_aqui` pela chave que você copiou do Google Cloud Console.

### 3. Reinicie o servidor
```bash
npm run dev
```

## 🔍 Verificando se está funcionando

### 1. Abra o console do navegador (F12)
- Vá em "Console"
- Procure por mensagens de erro relacionadas ao Google Maps

### 2. Verifique a página do mapa
- O mapa deve carregar com São Paulo como centro
- Você deve ver o mapa do Google Maps funcionando

### 3. Teste as funcionalidades
- Clique no mapa para definir um centro
- Use os filtros de raio
- Adicione leads para ver marcadores

## 🚨 Problemas Comuns

### Erro: "Google Maps API key is required"
**Solução**: Verifique se o arquivo `.env.local` existe e tem a chave correta.

### Erro: "This API project is not authorized"
**Solução**: Verifique se as APIs estão ativadas no Google Cloud Console.

### Erro: "RefererNotAllowedMapError"
**Solução**: Adicione `http://localhost:3000/*` nas restrições da chave.

### Mapa carrega mas não mostra nada
**Solução**: Verifique se o elemento do mapa tem altura definida (CSS).

## 💰 Custos

### Google Maps API
- **Maps JavaScript API**: Gratuito até 28.500 carregamentos/mês
- **Places API**: Gratuito até 1.000 requisições/dia
- **Geocoding API**: Gratuito até 2.500 requisições/dia

### Para desenvolvimento
- O uso local é praticamente gratuito
- Monitore o uso no Google Cloud Console

## 🔒 Segurança

### Nunca commite a API key
- O arquivo `.env.local` já está no `.gitignore`
- Nunca adicione a chave diretamente no código

### Use restrições
- Sempre configure restrições de domínio
- Use chaves diferentes para desenvolvimento e produção

## 📱 Produção

### Para deploy
1. Configure a chave no seu provedor de hospedagem
2. Adicione seu domínio nas restrições
3. Monitore o uso de API

### Variáveis de ambiente
- Vercel: Configure em "Settings" > "Environment Variables"
- Netlify: Configure em "Site settings" > "Environment variables"
- Outros: Consulte a documentação do seu provedor

## 🆘 Suporte

### Se ainda não funcionar
1. Verifique o console do navegador para erros
2. Confirme se a chave está correta
3. Verifique se as APIs estão ativadas
4. Teste em modo incógnito
5. Limpe o cache do navegador

### Links úteis
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Preços Google Maps](https://cloud.google.com/maps-platform/pricing)

## Solução de Problemas

### Erro: "Elemento do mapa não encontrado"

Este erro pode ocorrer por alguns motivos:

1. **API Key não configurada**:
   - Verifique se o arquivo `.env.local` existe
   - Confirme que a variável `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está definida
   - Reinicie o servidor após adicionar a API key

2. **API Key inválida**:
   - Verifique se a API key está correta
   - Confirme que a Maps JavaScript API está ativada no Google Cloud Console
   - Verifique se há restrições de domínio na API key

3. **Problemas de carregamento do DOM**:
   - O erro foi corrigido com um sistema de retry automático
   - O mapa agora aguarda até 1 segundo para o elemento estar disponível

### Verificar se a API Key está funcionando

1. Abra o console do navegador (F12)
2. Procure por mensagens de erro relacionadas ao Google Maps
3. Verifique se a API key está sendo carregada corretamente

### Restrições de API Key (Recomendado)

Para maior segurança, configure restrições na sua API key:

1. No Google Cloud Console, vá para "APIs & Services" > "Credentials"
2. Clique na sua API key
3. Configure restrições:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Maps JavaScript API

### Exemplo de restrições para desenvolvimento:
```
http://localhost:3000/*
http://localhost:3001/*
```

### Exemplo de restrições para produção:
```
https://seudominio.com/*
```

## Funcionalidades do Mapa

- ✅ Exibição de leads como marcadores
- ✅ Cores diferentes por status do lead
- ✅ Círculo de raio de busca
- ✅ Clique no mapa para definir centro
- ✅ Informações detalhadas dos leads
- ✅ Integração com filtros

## Estrutura do Código

- `src/components/Map.tsx` - Componente principal do mapa
- `src/services/googleMapsService.ts` - Serviço de inicialização e gerenciamento
- `src/types/lead.ts` - Tipos relacionados aos leads

## Debug

O componente Map inclui informações de debug que aparecem durante o carregamento. Se houver problemas, essas mensagens ajudarão a identificar onde está o erro. 