# 🔧 Solução para Erro do Mapa

## Problema: "Elemento do mapa não encontrado"

Este erro ocorre quando o componente Map não consegue encontrar o elemento DOM para renderizar o mapa.

## ✅ Solução Implementada

### 1. Sistema de Retry Automático
- O mapa agora aguarda até 1 segundo para o elemento estar disponível
- Tenta até 10 vezes com intervalos de 100ms
- Exibe informações de debug durante o processo

### 2. Configuração da API Key

O arquivo `.env.local` foi criado automaticamente. Agora você precisa:

1. **Obter uma API Key do Google Maps**:
   - Acesse: https://console.cloud.google.com/
   - Crie um projeto ou selecione um existente
   - Ative a "Maps JavaScript API"
   - Crie credenciais (API Key)

2. **Configurar a API Key**:
   - Abra o arquivo `.env.local` na raiz do projeto
   - Substitua `your_google_maps_api_key_here` pela sua chave real
   - Salve o arquivo

3. **Reiniciar o servidor**:
   ```bash
   npm run dev
   ```

## 📋 Exemplo de Configuração

Seu arquivo `.env.local` deve ficar assim:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_exemplo_de_chave_real_aqui
```

## 🔍 Verificação

1. **Verifique se a API Key está sendo carregada**:
   - Abra o console do navegador (F12)
   - Procure por mensagens de debug do mapa
   - Deve aparecer: "API key encontrada, aguardando elemento do mapa..."

2. **Verifique se não há erros de CORS**:
   - No console, procure por erros relacionados ao Google Maps
   - Se houver erros de CORS, verifique as restrições da API key

## 🛠️ Comandos Úteis

```bash
# Configurar Google Maps (cria .env.local)
npm run setup-maps

# Verificar se o arquivo foi criado
cat .env.local

# Reiniciar servidor
npm run dev
```

## 🔒 Configuração de Segurança (Opcional)

Para maior segurança, configure restrições na sua API key:

1. No Google Cloud Console, vá para "APIs & Services" > "Credentials"
2. Clique na sua API key
3. Configure restrições:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Maps JavaScript API

### Restrições para desenvolvimento:
```
http://localhost:3000/*
http://localhost:3001/*
```

## 📱 Funcionalidades do Mapa

Após a configuração, você terá acesso a:
- ✅ Exibição de leads como marcadores coloridos
- ✅ Círculo de raio de busca
- ✅ Clique no mapa para definir centro
- ✅ Informações detalhadas dos leads
- ✅ Integração com filtros

## 🐛 Debug

O componente Map agora inclui informações detalhadas de debug:
- Status de carregamento da API key
- Tentativas de inicialização do elemento
- Progresso da inicialização do Google Maps
- Mensagens de erro específicas

## 📞 Suporte

Se o problema persistir:
1. Verifique se a API key está correta
2. Confirme que a Maps JavaScript API está ativada
3. Verifique as restrições da API key
4. Consulte o console do navegador para mensagens de erro 